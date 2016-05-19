'use strict';

var RegSpace = /\s+/g,
	RegEmpty = /^\s*$/;

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
};

exports = module.exports = core;