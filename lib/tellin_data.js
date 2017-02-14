'use strict';

var fs = require('fs');
var yaml = require('js-yaml');
var core = require('./tellin_core.js');

//var marked = require('marked');
var RegIsMd  = /\.md$/i,
	RegFirstBlood=/(?:^|[\n\r\v])([^\#\s\t\|]+[^\n\r\v]+)(?:[\n\r\v]|$)/,
	RegPathStart=/^[\.\/]*/,
	RegPathEnd=/[\/]*$/;

var DataItem = function(path,name,info,folderName){
	this.IsDataItem = true;
	this.Info = info;
	this.Path = path;
	this.FolderName = folderName;
	this.Name = name.replace(RegIsMd,'');
	this.NameHTML = core.formatUrl(this.Name)+'.html';
};
DataItem.prototype={
	_getDesc:function(content){
		var match = content.match(RegFirstBlood);
		if(match && match.length>1){
			return match[1];
		}else{
			return '';
		}
	},
	_getDate:function(){
		var date = this.Info.birthtime,
			year = date.getFullYear(),
			month = date.getMonth()+1,
			day = date.getDate();
		return [year,month,day].join('-');
	},
	_getYamlInfo:function(data){
		var _arr = data.split('---'),
			_yaml={},
			content;

		//get yaml header
		if(_arr.length>1){
			_yaml = yaml.safeLoad(_arr[0], 'utf8');
			if(Object.prototype.toString.call(_yaml) === '[object Object]'){
				_arr.shift();
			}
		}
		//get MdData and render HTML
		content = _arr.join('---').replace(/^[\n\r]*/,'');//md data

		//this.Content
		this.RenderData = core.extend(_yaml,{
			Content:content,
			Desc:this._getDesc(content)
		},false);
	},
	_ready:function(){
		core.extend(this.RenderData,{
			NameHTML:this.NameHTML,
			Title:this.Name,
			FolderName:this.FolderName,
			//RootName:this._getRootName(),
			Date:this._getDate()
		},false);
		this.Date = new Date(this.RenderData.Date);
		this.SortIndex = this.RenderData.SortIndex;
	},
	load:function(callback){
		var me = this;		
		fs.readFile(this.Path,'utf8',function(err,data){
			if(err) throw err;
			me._getYamlInfo(data);
			me._ready();
			callback && callback();			
		});
	}
};

var DataBase = function(config,callback){
	this.Config = config;
	this.Data = {
		_index:[],
		_total:0,
		_deep:0
	};
	this.TotalMdNum = 0;
	this._initCallBack = callback;
	this.init();
};
DataBase.prototype={
	init:function(){
		this._travel(this.Config._Path_DataFolder,this.Data,'');
		this._ToLoadMdNum = this.TotalMdNum;
		this._LoadProgressBar = new core.ProgressBar(this.TotalMdNum);
		this._LoadProgressBar.start('start loading '+ this.TotalMdNum + ' markdown files');
		this._load(this.Data);
	},
	_countAndMarkIndex:function(node){
		var _p;
		node._total = node._index.length;
		for(var i in node){
			_p = node[i];
			if(core.isArray(_p._index)){
				node._total += this._countAndMarkIndex(_p);
			}else if(_p.IsDataItem){
				_p._IndexInArray =  node._index.indexOf(_p);
			}
		}
		return node._total;
	},
	_travel:function(folder,parent,folderName){
		var me = this,
			list = fs.readdirSync(folder),
			_fileName,
			_path;
		for(var i in list){
			_fileName = list[i];
			_path = folder+_fileName;
			var info = fs.statSync(_path);
			if(info.isDirectory()){
				parent[_fileName] =  {
					_index:[],
					_total:0,
					_deep:parent._deep+1
				};
				me._travel(_path+'/',parent[_fileName],_fileName);
			}else if(RegIsMd.test(_path)){
				var _item = new DataItem(_path,_fileName,info,folderName);
				parent[_fileName] = _item;
				parent._index.push(_item);
				me.TotalMdNum++;
			}
		}
	},
	_loaded:function(){
		var me = this;
		me._ToLoadMdNum--;
		me._LoadProgressBar.step(me.TotalMdNum-me._ToloadMdNum);
		if(me._ToLoadMdNum===0){
			me._LoadProgressBar.done();
			me._sortList(me.Data);
			me._countAndMarkIndex(me.Data);
			me._initCallBack && me._initCallBack();		
			//console.log(me.Data); // callback here
		}
	},
	_load:function(root){
		var me = this;
		for(var i in root){
			if(root[i] instanceof DataItem){
				root[i].load(function(){
					me._loaded();
				});
			//to add protection
			}else if(i!='_index'){
				me._load(root[i]);
			}
		}
	},
	_sort:function(a,b){
		if(a.SortIndex === b.SortIndex){
			return a.Date < b.Date;
		}else{
			if(a.SortIndex == null && b.SortIndex != null){
				return true;
			}else if(a.SortIndex != null && b.SortIndex == null){
				return false;
			}
			return a.SortIndex > b.SortIndex;
		}
	},
	_sortList:function(node){
		var _p;
		for(var i in node){
			_p = node[i];
			if(core.isArray(_p._index)){
				this._sortList(_p);
			}			
		}
		node._index.sort(this._sort);
	},
	select:function(path){
		var path = path.replace(RegPathStart,'').replace(RegPathEnd,'').split('/'),
			point= this.Data;
		while(path.length>0){
			point =  point[path.shift()];
			if(point==null){
				break;
			}
		}
		return point;
	}
};


exports = module.exports = DataBase;





























