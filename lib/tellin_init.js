'use strict';
var fs = require('fs');
var path = require('path');
var core = require('./tellin_core.js');

var InitFolder = function() {
	// body...
	this.Pool=[];
};
InitFolder.prototype={
	getInitSourcePath:function(){
		var _path = path.relative(process.cwd(),__dirname);
		return core.mergePath(_path,'../init')+'/';
	},
	copyFile:function(from,to,callback){
		var readStream = fs.createReadStream(from),
			writeStream = fs.createWriteStream(to);
		readStream.on('end',callback);
		readStream.pipe(writeStream);
	},
	copy:function(){
		var pool = this.Pool,
			progressBar = new core.ProgressBar(pool.length),
			callback = function(){
				progressBar.Current++;
				if(progressBar.Current ===  progressBar.All){
					progressBar.done();
					console.log('Finish creating the default files');
				}else{
					progressBar.stepCurrent();					
				}
			};
		progressBar.start();
		for(var i in pool){
			this.copyFile(pool[i].from,pool[i].to,callback);
		}
	},
	travel:function(from,to){	
		var me = this,
			pool= me.Pool,
			list = fs.readdirSync(from),
			info;
		
		if(!fs.existsSync(to)){
			fs.mkdirSync(to);
		}

		list.forEach(function(fileName){
			info = fs.statSync(from+fileName);
			if(info.isDirectory()){
				me.travel(from+fileName+'/',to+fileName+'/');
			}else{
				pool.push({
					from:from+fileName,
					to:to+fileName
				});
			}
		});
	},
	clear:function(path){
		core.deleteFolder(path);
	},
	init:function(){
		var from = this.getInitSourcePath(),
			to = './';		
		this.clear(to);	
		this.travel(from,to);
		this.copy();
	}
};

//new InitFolder().init();

exports = module.exports = new InitFolder();
