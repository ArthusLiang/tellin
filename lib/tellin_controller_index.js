'use strict';

var fs = require("fs");
var core = require('./tellin_core.js');
var ejs = require('ejs');
var highlight = require('highlight.js');
var marked = require('marked');

var _regEmpty= /\r\n\s\t/g;

var Controller_index = function(config,rule,data,view){
	this.Config = config;
	this.Rule = rule;
	this.Data = data;
	this.View = view;
	this.init();
};

Controller_index.prototype={
	init:function(){

	},
	_createFolder:function(path){
		//console.log(path);
		var folders = path.split('/'),
			_path;
		
		for(var i=0,l=folders.length;i<l;i++){
			_path=folders.slice(0,i+1).join('/');
			if(!fs.existsSync(_path) && _path.replace(_regEmpty,'')!==''){
				fs.mkdirSync(_path);
			}			
		}

	},
	render:function(callback){
		var me=this,
			data= this.Data,
			config = this.Config,
			folderPath = core.mergeAndFormatPath(config._Path_OutputFolder,this.Rule.Data),
			_renderData={
				Title:me.Rule.Name,
				RuleName:me.Rule.Name
			};

		//get deep from this.Rule.Data
		var output = core.mergeAndFormatPath(folderPath,'index.html');
		var deep  = output.split('/').length-1;
		var bread= core.getBreadCrumbs(output,deep);
		//console.log(output);
 
		config = core.adjustSourcePath(config,deep);

		core.extend(_renderData,{
			BreadCrumbs:bread
		},false);
		core.extend(_renderData,config,false);
		core.extend(_renderData,data,false);

		this._createFolder(folderPath);


		fs.writeFile(output,ejs.render(me.View,_renderData),{
			encoding:'utf8',
			mode:0o666,
			flag:'w'
		},function(err){
			if (err) throw err;
			console.log(core.DEBUG_Line,me.Rule.Name,':finish rendering index pages');
		});

	}
};

exports = module.exports = Controller_index;
