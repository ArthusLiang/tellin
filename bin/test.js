'use strict';

var getArgs = function(arg,cmd) {
	var i = arg.indexOf(cmd);
	if(i!==-1 &&  i<arg.length){
		return arg.splice(i+1);
	}
	return false;
}

var args = getArgs(process.argv,'tellin');

if(args && args.length && args.length>0 && args[0]==='init'){
	require('../lib/tellin_init').init();
	//require('../lib/tellin_init').init();
}else{
	require('../lib/tellin').generate();
}
