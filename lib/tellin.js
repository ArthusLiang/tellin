'use strict';

var fs = require('fs');
var yaml = require('js-yaml');
var core = require('./tellin_core.js');
var Controller = require('./tellin_controller.js');

//var marked = require('marked');
var DEBUG_Line='------------- >>> ';
var RegIsMd  = /\.md$/i;

var DataReader = function(path,name){
	this.Path = path+name;
	this.Name = name.replace(RegIsMd,'');
	this.NameHTML = core.formatUrl(this.Name)+'.html';
};
DataReader.prototype={
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
		this.RenderData = core.extend(_yaml,{Content:content});
	},
	_ready:function(){
		this._LoadCount--;
		if(this._LoadCount===0){
			core.extend(this.RenderData,{
				NameHTML:this.NameHTML,
				Title:this.Name,
				Date:this._getDate()
			},false);
			this.Date = new Date(this.RenderData.Date);
			this.SortIndex = this.RenderData.SortIndex;
			this._loadCallback && this._loadCallback();
		}
	},
	_loadData:function(){
		var me = this;
		fs.readFile(this.Path,'utf8',function(err,data){
			if(err) throw err;
			me._getYamlInfo(data);
			me._ready();

		});
	},
	_loadInfo:function(){
		var me = this;
		fs.stat(this.Path,function(err,data){
			if(err) throw err;
			me.Info = data;
			me._ready();
		});		
	},
	load:function(callback){
		var me = this;
		this._LoadCount = 2;
		this._loadCallback = callback;
		this._loadInfo();
		this._loadData();
	}
};


var Rule = function(name,config){
	this.Name = name;
	this.UrlName = core.formatUrl(name);
	this.Config = core.extend({
		RuleName:name
	},config);
	this.Data=[];
};
Rule.prototype={
	render:function(progress){
		var _data = this.Data,
			_controller = this.Controller,
			_view = this.View;
		_controller.render(_view,_data,progress);

	},
	load:function(callback){
		this._LoadCount = 2;
		this._loadCallback = callback;
		this._loadController();
		this._loadData();
		this._loadView();
	},
	_ready:function(){
		this._LoadCount--;
		if(this._LoadCount===0){
			this._loadCallback && this._loadCallback();
		}
	},
	_loadData:function(){
		var me = this,
			_configPath = this.Config.Rule[this.Name].Data,
			path = this.Config.Path_DataFolder + ( core.isNotEmpty(_configPath) ? _configPath : this.UrlName+'/');

		fs.readdir(path,function(err,data){
			if(err) throw err;
			//filter
			for(var idx in data){
				if(RegIsMd.test(data[idx])){
					me.Data.push(new DataReader(path,data[idx]));
				}
			}
			//load			
			var _todo = me.Data.length;
			for(var i in me.Data){
				me.Data[i].load(function(){
					_todo--;
					if(_todo===0){
						console.log(DEBUG_Line,'Finish loading');
						me._ready();
					}
				});
			}
			
		});
	},
	_loadView:function(){
		var me=this,
			_configPath = this.Config.Rule[this.Name].View,
			path = this.Config.Path_ViewFolder + ( core.isNotEmpty(_configPath) ? _configPath : this.UrlName+'.ejs');

		fs.readFile(path,'utf8',function(err,data){
			if (err) throw err;
			me.View = data;
			me._ready();
		});
	},
	_loadController:function(){
		var path = this.Config.Rule[this.Name].Controller;
		if(path && path!==''){
			try{
				this.Controller = require(path);
				return;
			}catch(e){
				console.log(DEBUG_Line+'Rule:'+this.Name+' loaded controler failed and will use the default one!');
				console.log(e);
			}
		}
		this.Controller = new Controller(this.UrlName,this.Config);
	}
};

var ProgressBar = function(all){
	this.All = all;
	this.Current = 0;
	this.Out = process.stdout;
	this.Char0='□';
	this.Char1='■';
	this.Len = 50;
};
ProgressBar.prototype={
	_getAscii:function(current){
		var arr=[],
			all = this.All,
			len = this.Len,
			char0 = this.Char0,			
			char1 = this.Char1,
			percentage = current/all,
			last = len * percentage >>0,
			percentageStr = percentage*100>>0,
			i = 0;
		for(;i<last;i++){
			arr.push(char1);
		}
		for(;i<len;i++){
			arr.push(char0);
		}
		arr.push(' ');
		arr.push(percentageStr);
		arr.push('% completed');
		return arr.join('');
	},
	start:function(){
		this.step(0);
	},
	step:function(current){
		this.Current =current;
		this.Out.clearLine();
    	this.Out.cursorTo(0);
    	this.Out.write(this._getAscii(current));
	},
	done:function(){
		this.step(this.All);
		console.log();
	}
};

//Generator
var Generator = function(config){
	this.Config = config;
	this.Rules={};
	this.init();
};
Generator.prototype={
	init:function(){
		var me = this,
			_todo=0,
			_callback = function(){
				_todo--;
				if(_todo===0){
					me.render();				
				}
			};
		for(var name in this.Config.Rule){
			var _rule = new Rule(name,this.Config);
			this.Rules[name] = _rule;
			_todo++;
		}
		for(var name in this.Rules){
			this.Rules[name].load(_callback);
		}
	},
	render:function(){
		var rules = this.Rules,
			total = 0,
			totalStatic;
		for(var i in rules){
			total+= rules[i].Data.length;
		}
		totalStatic = total;
		var progressBar = new ProgressBar(totalStatic),
			progress = function(){
				total--;
				progressBar.step(totalStatic-total);
				if(total===0){
					progressBar.done();
					console.log(DEBUG_Line,'Finish rendering '+totalStatic+' files!');
					//test
				}
			};;
		console.log(DEBUG_Line,'Start rendering '+totalStatic+' files!');
		progressBar.start();
		for(var i in rules){
			rules[i].render(progress);
		}
	}
};

var tellin = new function() {
	var now = new Date();
	var load = function() {
		try{
			var _str = fs.readFileSync('tellin.json','utf8'),
				_val = JSON.parse(_str);
			//console.log(DEBUG_Line+'loaded tellin.json');
			return core.extend({
				Path_ViewFolder:'./_view/',
				Path_DataFolder:'./_data/',
				Path_OutputFolder:'./',
				ThisYear:now.getFullYear()
			},_val);
		}catch(e){
			console.log(DEBUG_Line+'loading config error!')
			console.log(e);
			return false;
		}
	};

    this.generate = function(){
    	// load config
    	var _config = load();
    	if(_config){
    		var _gen = new Generator(_config);
    	}
    };	
}

exports = module.exports = tellin;