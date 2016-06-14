'use strict';

var fs = require('fs');

var View = function(config) {
	this.Config = config;
	this._Data={};
	// body...
	this.init(config._Path_ViewFolder);
};
View.prototype={
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
			if(!_info.isDirectory()){
				me._Data[_name]=fs.readFileSync(_path,'utf8');
			}
		}
	},
	select:function(name){
		return this._Data[name];
	}
};

exports = module.exports = View;