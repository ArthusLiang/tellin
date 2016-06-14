'use strict';

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
	start:function(str){
		if(str){
			console.log(str);
		}
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

var RegSpace = /\s+/g,
	RegEmpty = /^\s*$/,
	RegRelativeFolder = /^\.\//,
	RegSlashStart = /^\//,
	RegSlashEnd = /\/$/;

var core = new function(){
	this.isNotEmpty = function(str){
		return str!=null && !RegEmpty.test(str);
	};

	this.formatUrl = function(string){
		return string.toLowerCase().replace(RegSpace,'-');
	};

	this.classify = function(source,typeName) {
		// body...
		var _new = {};
		for(var i in source){
			var _key = source[i][typeName] || 'Others';
			if(_new[_key]=== undefined){
				_new[_key] = {};
			}
			_new[_key][i] = source[i];

		}
		return _new;
	};

	//merfe source to targer
    this.extend = function(target,source){
        var args=[].slice.call(arguments),
            i=1,
            key,
            ride= typeof args[args.length-1] == 'boolean' ? args.pop() : true;
        if(args.length==1){
            target = !this.window ? this: {};
            i=0;
        }
        while((source=args[i++])){
            for(key in source){
                if(ride || !(key in target)){
                    target[key] =source[key];
                }
            }
        }
        return target;
    };

    this.isArray=function (obj) {
        return toString.call(obj) === '[object Array]';
    };

    this.formatPath = function(path){
    	return path.replace(RegRelativeFolder,'').replace(RegSlashStart,'').replace(RegSlashEnd,'');
    };

    this.mergePath = function(pathStart,pathEnd){
    	var arr1 = this.formatPath(pathStart).split('/'),
    		arr2 = this.formatPath(pathEnd).split('/'),
    		l1 = arr1.length,
    		l2 = arr2.length,
    		i,
    		level =0,
    		arr=[];

    	//get pathEnd ../
    	for(i=0;i<l2;i++){
    		if(arr2[i]=='..'){
    			level++;
    		}else{
    			arr.push(arr2[i]);
    		}
    	}

    	if(level===0){
    		return arr1.concat(arr2).join('/');
    	}else if(level <= l1){
    		for(i=l1-level-1;i>=0;i--){
    			arr.unshift(arr1[i]);
    		}
    		return arr.join('/');
    	}else{
    		for(i=0;i<level-l1;i++){
    			arr.unshift('../');
    		}
    		return arr.join('/');
    	}
    };

    this.adjustPath = function(path,deep){
    	if(deep===0) return path;
    	path = this.formatPath(path);
    	var arr = path.split('/'),
    		i;
    	if(deep>0){
    		for(i=0;i<deep;i++){
    			arr.unshift('..');
    		}
    	}else if(-deep < arr.length-1){
    		for(i=0;i>deep;i--){
    			arr.shift();
    		}
    	}else{
    		return path;
    	}
    	return arr.join('/');
    };

    this.isUnderFolder = function(path,name){
    	return new RegExp('(^|\\/)'+name+'\\/',i).test(path);
    };

    this.mergeAndFormatPath = function(pathStart,pathEnd){
    	return this.formatPath(this.mergePath(pathStart,pathEnd));
    };

    this.DEBUG_Line='------------- >>> ';

    this.ProgressBar = ProgressBar;
};

exports = module.exports = core;












