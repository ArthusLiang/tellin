'use strict';

var fs = require("fs");
var core = require('./tellin_core.js');
var ejs = require('ejs');
var highlight = require('highlight.js');
var marked = require('marked');

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
	render:function(callback){
		var me=this,
			data= this.Data,
			config = this.Config,
			folderPath = core.mergeAndFormatPath(config._Path_OutputFolder,this.Rule.Data),
			_renderData={
				Title:me.Rule.Name,
				RuleName:me.Rule.Name
			};
		if(data){
			core.adjustSourcePath(config,data._deep || 0);			
		}
		core.extend(_renderData,config);
		core.extend(_renderData,data);

		fs.writeFile(core.mergeAndFormatPath(folderPath,'index.html'),ejs.render(me.View,_renderData),{
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
