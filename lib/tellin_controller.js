'use strict';

var fs = require('fs');
var path = require('path');
var RegIsJs = /\.js$/i;

var Controller = function(config) {
	this.Config = config;
	this._Data={
		detail:require("./tellin_controller_detail.js"),
		list:require("./tellin_controller_list.js"),
		index:require("./tellin_controller_index.js")
	};
	// body...
	this.init(config._Path_ControllerFolder);
};
Controller.prototype={
	init:function(folder){
		var me = this,
			list = fs.readdirSync(folder),
			_name,
			_path,
			_info;
		for(var i in list){
			_name = list[i];
			_path = folder+_name;
			_info = fs.statSync(_path);
			if(!_info.isDirectory() && RegIsJs.test(_name)){
				//console.log(path.relative(__dirname,_path));
				me._Data[_name.replace(RegIsJs,'')]= require(path.relative(__dirname,_path));
			}
		}
	},
	select:function(name){
		name = name.replace(RegIsJs,'');
		return this._Data[name];
	}
};

exports = module.exports = Controller;