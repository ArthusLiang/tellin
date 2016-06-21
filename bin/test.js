'use strict';
var reg = /\/test$/;
var getArgs = function(arg,cmd) {
	var i,l = arg.length,
		arr=false;
	for(var i=0;i<l;i++){
		if(cmd.test(arg[i])){
			arr = arg.splice(i+1);
			break;
		}
	}
	return arr;
}

var args = getArgs(process.argv,reg);

if(args && args.length && args.length>0 && args[0]==='init'){
	require('../lib/tellin_init').init();
}else{
	require('../lib/tellin').generate();
}
