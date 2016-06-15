'use strict';

var fs = require('fs');
var core = require('./tellin_core.js');

var Controller = require('./tellin_controller.js');
var DataBase = require('./tellin_data.js');
var View = require('./tellin_view.js');

//var marked = require('marked');


//Generator
var Generator = function(config){
	this.Config = config;
	this.ControllerInstance=[];

	this.init();
};
Generator.prototype={
	init:function(){
		var me = this;
		this.Controllers = new Controller(this.Config);		
		this.Views = new View(this.Config);
		this.DataBase = new DataBase(this.Config,function(){
			me._initRule();
		});
	},
	_createRule:function(rule){
		var data = this.DataBase.select(rule.Data),
			view = this.Views.select(rule.View),
			controller = this.Controllers.select(rule.Controller);
		if(data !== null  && view !== null && controller!==null){
			this.ControllerInstance.push(new controller(this.Config,rule,data,view));
		}else{
			console.log(core.DEBUG_Line,'Warning: Generator Rule Error');
			console.log(rule);
		}
	},
	_initRule:function(){
		var me = this;
		me._clearFolder();
		me._render();
	},
	_deleteFile:function(path){
		var state =  fs.statSync(path);
		if(state.isDirectory()){
			this._deleteFolder(path);
		}else{
			fs.unlinkSync(path);
		}	
	},
	_deleteFolder:function(path){
		if(fs.existsSync(path)){
			var me=this,
				dirList = fs.readdirSync(path);
		    dirList.forEach(function(fileName)
		    {
		        me._deleteFile(core.mergeAndFormatPath(path,fileName));
		    });
		    fs.rmdirSync(path);
		}
	},
	_clearFolder:function(){
		var me=this,
			data = this.DataBase.Data,
			point,
			path;
		for(var i in data){
			point = data[i];
			if(core.isArray(point._index)){
				path = core.mergeAndFormatPath(this.Config._Path_OutputFolder,i);
				me._deleteFolder(path);
			}else if(point.IsDataItem){
				path = core.mergeAndFormatPath(this.Config._Path_OutputFolder,point.NameHTML);
				if(fs.existsSync(path)){
					fs.unlinkSync(path);					
				}
			}
		}
	},
	_render:function(){
		var rules= this.Config._Rule,
			rule;
		for(var i in rules){
			rule = rules[i];
			this._createRule(rule);
		}
		for(var i in this.ControllerInstance){
			this.ControllerInstance[i].render();
		}
	}
};

var tellin = new function() {
	var now = new Date();
	var loadConfig = function() {
		try{
			var _str = fs.readFileSync('tellin.json','utf8'),
				_val = JSON.parse(_str);
			//console.log(DEBUG_Line+'loaded tellin.json');
			return core.extend({
				_Path_ViewFolder:'./_view/',
				_Path_DataFolder:'./_data/',
				_Path_ControllerFolder:'./_controller/',
				_Path_OutputFolder:'./',
				DemoCss:'',
				DemoJs:'',
				ThisYear:now.getFullYear()
			},_val);
		}catch(e){
			console.log(core.DEBUG_Line+'loading config error!')
			console.log(e);
			return false;
		}
	};

    this.generate = function(){
    	// load config
    	var _config = loadConfig();
    	if(_config){
    		var _gen = new Generator(_config);
    	}
    };	
}

//tellin.generate();//to remark

exports = module.exports = tellin;