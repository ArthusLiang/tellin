'use strict';

var fs = require("fs");
var core = require('./tellin_core.js');
var ejs = require('ejs');
var highlight = require('highlight.js');
var marked = require('marked');

marked.setOptions({
  //renderer: new marked_renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
  /*
  highlight: function (code) {
  	//console.log(code,highlight.highlightAuto(code).value);
    return highlight.highlightAuto(code).value;
  }
  */
});

var RegDemoHTML=/(\<\!\-\-demo(\d)+\-\-\>)([^\1]*)\1/g,
	RegDemoHTMLTagLine = /[\t ]*<\!\-\-demo(\d)+\-\-\>[\t ]*[\n\r]?/g,

	RegDemoCSS=/(\/\*demo(\d)+\*\/)([^\1]*)\1/g,
	RegDemoCSSTagLine = /[\t ]*\/\*demo(\d)+\*\/[\t ]*[\n\r]?/g,

	RegDemoJS=/(\/\/demo(\d)+\s+)([^\1]*)\1/g,
	RegDemoJSTagLine = /[\t ]*\/\/demo(\d)+[\t ]*[\n\r]?/g,

	RegDemoCon=/\<p\>demo(\d)+\<\/p\>/,
	RegLineBreakStart=/^\n/,
	RegLineBreakEnd =/\n$/;

//RegCode = /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/;

var DemoFactory = function(str){
	this.Demo={};
};
DemoFactory.prototype={
	_createItem:function(str,reg,name){
		var _result = reg.exec(str);
		if(_result.length>3){
			var _source = _result[0],
				_toRemoveTag = _result[1],
				_id = _result[2],
				_content = _result[3];
			if(this.Demo[_id]== null){
				this.Demo[_id] = {};
			}
			this.Demo[_id][name] = str.replace(RegLineBreakStart,'').replace(RegLineBreakEnd,'');
		}
	},
	_searchDemo:function(str,reg,name){
		var _matches = str.match(reg);
		if(_matches){
			for(var i=0,l=_matches.length;i<l;i++){
				this._createItem(_matches[i],reg,name);
			}			
		}
	},
	scan:function(str){
		this._searchDemo(str,RegDemoHTML,'html');
		this._searchDemo(str,RegDemoCSS,'css');
		this._searchDemo(str,RegDemoJS,'js');
		return str.replace(RegDemoHTMLTagLine,'').replace(RegDemoCSSTagLine,'').replace(RegDemoJSTagLine,'');
	},
	getCSSTag:function() {
		var _arr=['<style type="text/css">'];
		for(var i in this.Demo){			
			_arr.push(this.Demo[i]['css']);
			_arr.push('\n');
		}
		_arr.push('</style>');
		return _arr.join('');
	},
	getJSTag:function() {
		var _arr=['<script type="text/javascript">'];
		_arr.push('\n$(function(){');
		for(var i in this.Demo){
			_arr.push('\n')
			_arr.push(this.Demo[i]['js']);
		}
		_arr.push('\n});\n');
		_arr.push('</script>');
		return _arr.join('');
	},
	renderHTML:function(str) {
		var me = this,
			_id,
			_item;
		return str.replace(RegDemoCon,function(word) {
			_id= RegDemoCon.exec(word)[1];
			_item = me.Demo[_id];
			if(_item!=null){
				return ['<div class=\'demo_con\'>',_item['html'],'</div>'].join('');
			}else{
				return word;
			}
		});
	}
};

var Pagenation = function(data){
	this.init(data);
};
Pagenation.prototype={
	_linkTemplate:'<a$class$$href$>$text$</a>',
	_getHtmlLink:function(index,text,classname){
		var _item = this.Data.List[index];
		if(_item){
			var _class= classname ? ' class="'+classname+'"' :'',
				_href = ' href="'+ _item.Url + '"',
				_text = text || _item.Title;
			return this._linkTemplate.replace('$class$',_class).replace('$href$',_href).replace('$text$',_text);
		}else{
			return '';
		}
	},
	init:function(data){
		var i=0,l=data.length,
			list = [],
			_point;
		for(;i<l;i++){
			_point = data[i].RenderData;
			list.push({
				Title:_point.Title,
				Desc:_point.Desc,
				Url:_point.Url,
				Index:i,
				Date:_point.Date
			});
		}
		this.Data={
			List:list
		};
	},
	getPrevAndNext:function(index){
		var me = this;
		return {
			List_Prev:me._getHtmlLink(index-1,'← Prev','prev'),
			List_Next:me._getHtmlLink(index+1,'Next →','next')
		}
	}
};

var RegRelativeStart=/^.\//,
	RegRelativeEnd = /\/$/,
	RegImgTag =/\<img([^>]+)\>/ig,
	RegFixImgTagEnd = /\/>$/,
	RegFixImgTagEndReplcae = />$/;

var Controller = function(urlName,config){
	this.Config = config;
	this.Path = config.Path_OutputFolder+urlName+'/';
	this._ImgPathGap = this._getFolderNumInPath(config.Path_DataFolder)-this._getFolderNumInPath(config.Path_OutputFolder);
};
Controller.prototype={
	_getFolderNumInPath:function(path){
		path = path.replace(RegRelativeStart,'').replace(RegRelativeEnd,'');
		var arr = path.split('/'),
			count = 0;
		for(var i=0,l= arr.length;i<l;i++){
			if(arr[i]!=''){
				count++;
			}
		}
		return count;
	},
	_sort:function(a,b){
		if(a.SortIndex === b.SortIndex){
			return a.Date > b.Date;
		}else{
			return a.SortIndex > b.SortIndex;
		}
	},
	_remap:function(str){
		var me = this;
		//../../img_data/rotate.png  ->  ../img_data/rotate.png
		return str.replace(RegImgTag,function(word){
			var i= me._ImgPathGap;
			while(i>0){
				i--;
				word = word.replace('../img_data','img_data');
			}
			if(!RegFixImgTagEnd.test(word)){
				word = word.replace(RegFixImgTagEndReplcae,'\/\>');
			}
			return word;
		});
	},
	_convertContent:function(renderData){
		var str=renderData.Content,
			_demo  = new DemoFactory(str);
		str = _demo.scan(str);
		str = marked(str);
		str = this._remap(str);
		str = _demo.renderHTML(str);
		renderData.Content = str;
		renderData.DemoCss = _demo.getCSSTag();
		renderData.DemoJs = _demo.getJSTag();
	},
	_build:function(data){
		data.sort(this._sort);
		//pagenation
		var _point,
			_pointRenderData,
			i,l;
		for(i=0,l=data.length;i<l;i++){
			_point = data[i];		
			_pointRenderData = _point.RenderData;
			this._convertContent(_pointRenderData);
			_pointRenderData.Path_Local = this.Path+_point.NameHTML;
			_pointRenderData.Url = _point.NameHTML;
		}	
		//create list
		var pagenation = new Pagenation(data);

		for(i=0;i<l;i++){
			_pointRenderData = data[i].RenderData;
			core.extend(_pointRenderData,this.Config,false);
			core.extend(_pointRenderData,pagenation.Data);
			core.extend(_pointRenderData,pagenation.getPrevAndNext(i));
		}	

	},
	_createPagenation:function(data){
		for(i=0,l=data.length;i<l;i++){

		}
	},	
	_createOutPutFolder:function(path){
		if(fs.existsSync(path)){
			var dirList = fs.readdirSync(path);
		    dirList.forEach(function(fileName)
		    {
		        fs.unlinkSync(path + fileName);
		    });
		}else{
			fs.mkdirSync(path);
		}
	},
	_createHtmlFile:function(view,data,progress){
		var me=this,
			_output = me.Path,
			_pointRenderData,
			_text;
		for(var i in data){
			_pointRenderData = data[i].RenderData;			
			_text = ejs.render(view,_pointRenderData);
			fs.writeFile(_pointRenderData.Path_Local,_text,{
				encoding:'utf8',
				mode:0o666,
				flag:'w'
			},function(err){
				if (err) throw err;
				progress();
			});
			
		}
	},
	render:function(view,data,progress){
		this._build(data);
		this._createOutPutFolder(this.Path);
		this._createHtmlFile(view,data,progress);
	}
};

exports = module.exports = Controller;
