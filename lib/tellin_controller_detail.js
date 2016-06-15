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

var RegImgTag =/\<img([^>]+)\>/ig,
	RegFixImgTagEnd = /\/>$/,
	RegFixImgTagEndReplcae = />$/,
	RegSource =/^Source_/,
	RegConfigFilter=/^_/;

var ControllerDetail = function(config,rule,data,view) {
	this.Config = config;
	this.Rule = rule;
	this.Data = data;
	this.View = view;
};
ControllerDetail.prototype={
	_buildLink:function(data,text,classname){
		if(data){
			var _item = data.RenderData,
				_class= classname ? ' class="'+classname+'"' :'';
			return ['<a ',_class,' href="',_item.NameHTML,'">',text,'</a>'].join('');
		}else{
			return '';
		}
	},
	_createFolder:function(path){
		//console.log(path);
		if(!fs.existsSync(path)){
			fs.mkdirSync(path);
		}
	},
	_reMapImg:function(str){
		return str.replace(RegImgTag,function(word){
			word = word.replace('../img_data','img_data');//hard code
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
		str = this._reMapImg(str);
		str = _demo.renderHTML(str);
		renderData.Content = str;
		renderData.DemoCss = _demo.getCSSTag();
		renderData.DemoJs = _demo.getJSTag();
		renderData.RuleName = this.Rule.Name.toLowerCase();
	},
	_renderFile:function(rootPath,node,data,config){
		//build data
		var me=this,
			_pointRenderData = data.RenderData;

		this._convertContent(_pointRenderData);
		core.extend(_pointRenderData,config,false);

		var _data = core.extend({
			List:node._index,
			List_Prev:me._buildLink(node._index[data._IndexInArray-1],'← Prev','prev'),
			List_Next:me._buildLink(node._index[data._IndexInArray+1],'Next →','next')
		},_pointRenderData);

		var _text = ejs.render(this.View,_data);
		fs.writeFile(core.mergeAndFormatPath(rootPath,data.NameHTML),_text,{
			encoding:'utf8',
			mode:0o666,
			flag:'w'
		},function(err){
			if (err) throw err;
			me._callback();
		});
	},
	_renderNode:function(rootPath,node){
		var i,p,
			_config = core.adjustSourcePath(this.Config,node._deep);
		this._createFolder(rootPath);
		for(i in node){
			p = node[i];
			if(p.IsDataItem){
				this._renderFile(rootPath,node,p,_config);
			}else if(core.isArray(p._index)){
				this._renderNode(core.mergeAndFormatPath(rootPath,i),p);
			}
		}
	},
	render:function(callback){
		var me=this,
			data= this.Data,
			todo = data._total,
			folderPath = core.mergeAndFormatPath(this.Config._Path_OutputFolder,this.Rule.Data);

		this._renderNode(folderPath,data);
		this._callback = function(){
			todo--;
			if(todo===0){
				callback && callback();
				console.log(core.DEBUG_Line,me.Rule.Name,':finish rendering detail pages');
			}
		};
	}
};

exports = module.exports = ControllerDetail;
