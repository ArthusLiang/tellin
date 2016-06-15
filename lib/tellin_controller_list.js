'use strict';

var fs = require("fs");
var core = require('./tellin_core.js');
var ejs = require('ejs');

var DefaultConfig = {
	_page_item_num:10,
	_page_btn_num:10,
	_page_for_index:false
};

var ListInFolder = function(config,rule,data,view,path){
	this.Path = path;
	this.Config = config;
	this.Rule = rule;
	this.Data = data;
	this.View = view;
	this.build();
};
ListInFolder.prototype={
	render:function(callback){
		var me=this,
			 _todo = this.Total,
			_path = this.Path,
			_pageData = this.PageData,
			_point,
			_callback = function(callback){
				_todo--;
				if(_todo===0){
					callback && callback();
				}
			};
		for(var i in _pageData){
			_point = _pageData[i];
			fs.writeFile(core.mergeAndFormatPath(_path,_point.NameHTML),ejs.render(me.View,_point),{
				encoding:'utf8',
				mode:0o666,
				flag:'w'
			},function(err){
				if (err) throw err;
				_callback();
			});
		}
	},
	build:function(){
		var me=this,
			config = this.Config,
			data = this.Data._index,
			total = Math.ceil(data.length / config._page_item_num),
			pageData={},			
			num = config._page_item_num,
			start,
			_index,
			_public = core.extend({
				RuleName:me.Rule.Name,
				Title:me.Rule.Name,
				FolderName:data[0].RenderData.FolderName
			},core.adjustSourcePath(config,me.Data._deep));

			//core.adjustSourcePath(config,data._deep);

		this.Total = total;
		for(var i=0;i<total;i++){
			start =i*num;
			_index = i+1;
			pageData[_index]=core.extend({
				List:data.slice(start,start+num),
				NameHTML:me.getPageName(_index)
			},_public,false);
			core.extend(pageData[_index],this.getPagination(_index));
		}
		this.PageData = pageData;
	},
	getPageName:function(index){
		if(index===1 && this.Config._page_for_index){
			return 'index.html';
		}else{
			return [this.Rule.Name,'_',index,'.html'].join('');
		}
	},
	buildLink:function(name,href,className){
		var _class= className ?  ' class="'+className+'"':'';
		return ['<a href="',href,'"',_class,'>',name,'</a>'].join('');
	},
	getPagination:function(index){
		var me=this,
			total= this.Total,
			config = this.Config,
			num = config._page_btn_num,
			start,
			end,
			hasFirst = index>1,
			hasPre = hasFirst,
			hasNext =index<total,
			hasLast = hasNext;

		var half = num/2>>0,
			half2 = total-half-1;

		if(index-half<1){
			start = 1;
			end = Math.min(start+num-1,total);
		}else if(index+half2>total){
			end = total;
			start = Math.max(end-num+1,1);
		}else{
			start = index-half;
			end = index+half2;
		}

		var pageGroup = [];
		for(var i = start,l= end+1;i<l;i++){
			pageGroup.push(this.buildLink(i,this.getPageName(i),(i===index?'current':undefined)));
		}
		return {
			PageGroup:pageGroup.join(''),
			PageFirst:hasFirst? me.buildLink('|<<',me.getPageName(1)) :'',
			PagePre:hasPre? me.buildLink('<',me.getPageName(index-1)) :'',
			PageNext:hasNext? me.buildLink('>',me.getPageName(index+1)) :'',
			PageLast:hasLast? me.buildLink('>>|',me.getPageName(total)) :'',			
		}
	}
};

var Controller_list = function(config,rule,data,view){
	this.Config = core.extend(config,DefaultConfig,false);
	this.Rule = rule;
	this.Data = data;
	this.View = view;
	this.Pool = [];
	this.init();
};

Controller_list.prototype={
	init:function(){
		var folderPath = core.mergeAndFormatPath(this.Config._Path_OutputFolder,this.Rule.Data);
		this.travel(this.Data,folderPath);
	},
	travel:function(node,path){
		var p;
		this.Total++;
		this.Pool.push(new ListInFolder(this.Config,this.Rule,node,this.View,path));
		for(var i in node){
			p= node[i]
			if(core.isArray(p._index)){
				this.travel(p,core.mergeAndFormatPath(path,i));
			}
		}
	},
	render:function(callback){
		var me=this,
			_pool= this.Pool,
			_todo =_pool.length,
			_callback=function(){
				_todo--;
				if(_todo===0){
					console.log(core.DefaultConfig,'finish rendering list ', me.Rule.Name);
					callback && callback;
				}
			};
		for(var i=0,l=_todo;i<l;i++){
			_pool[i].render(_callback);
		}
	}
};




exports = module.exports = Controller_list;
