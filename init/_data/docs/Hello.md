Title: Get Start
Desc: Ash is a small and feature-rich javascript library. It helps to improve the interaction of animation in HTML5 website or apps. 
SortIndex: 1
IndexPage: true
---
Ash is a small and feature-rich javascript library. It helps to improve the interaction of animation in HTML5 website or apps. With Ash, you can control different animation in one time-axis easily. The most exciting thing is that you can write your own plug-in for Ash, this will enable you to implement much more fantastical effect.

# Write you first animation

I will teach you how to use Ash to make amazing thing. Make sure you have loaded Ash.js before you try to write any demo. Here is a very easy demo to move an element;

### html

```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Hello React!</title>   
    <link rel="stylesheet" type="text/css" href="test.css" media="screen"> 
    <script src="ash.js"></script>
    <script src="test.js"></script>
  </head>
  <body>
  <!--demo1-->
  	 <div class='demo_holder'>
    	<div id="demo_block" class='demo_block'></div>
  	 </div>
    <a id='demo_btn' class='demo_btn'>Play</a>
  <!--demo1-->
  </body>
</html>
```

### test.css

```
/*demo1*/ 
.demo_block{position:absolute; top:50px; left:0px; width:60px; height:60px; background-color:#64B5F6;border-radius:50%;}
.demo_holder{width: 100%; height: 200px; position: relative;}
/*demo1*/
.demo_btn{display: inline-block; padding: 10px 20px; text-align: center; color: white; border-radius: 4px; background-color: #03A9F4; cursor: pointer;}
.demo_btn:hover{ background-color: #0288D1; }
```

### test.js

```
window.onload = function(){
	//demo1
	var isMoving = false; 
		 block = document.getElementById('demo_block');
	document.getElementById('demo_btn').onclick= function(){
		if(!isMoving){
			isMoving = true;
			Ash.play([{
			    dom: block,
			    css:[{left:'0px'},{left:'400px'}],
			    time:100
			}],function(){
				isMoving = false;
			});		
		}
	};
	//demo1
};
```

### demo

Please click the 'Play' button to check the effect of the code.

demo1

# Learn the basical usage

## Ash.play

According to the source code below, you should know the first method of Ash, ```Ash.play``` !  The function 'play' accepts 4 parameters.  The following the code to define the function 'play'.

```
var play=function(scripts,renderGap,endFunc,stopFunc){
```
### Parameters

| parameter       | optional      | description                                       |
| ----------------|:-------------:| --------------------------------------------------|
| scripts         | No            | An array to ojbect to descript the animation      |
| renderGap       | Yes           | How many frame for each rendering                 |
| endFunc         | Yes           | Callback function when the animation ends         |
| stopFunc        | Yes           | Callback function when the animation is stopped   |

### scripts

The scripts is the most important argument. Let's its element script in our site. The following table shows the attributes for the script.

| attribute       | optional      | description                                                                   |
| ----------------|:-------------:| ------------------------------------------------------------------------------|
| dom             | Yes           | The animation element(s)                                                      |
| css             | Yes           | An array contains dom's state in the begining and the ending of the animation |
| attr            | Yes           | Similar with css, but it descript of dom's attribute                          |
| time            | Yes           | How long will the animation last.(The unit is frame)                          |
| delay           | Yes           | delay time                                                                    |
| tween           | Yes           | The name of easing formula.  Such as 'linear','easeIn' and so on              |

## Ash.stop

You can stop the animtion with this function. 

```
//start animation
var id = Ash.play([{
    dom:document.getElementById('div'),
    css:[{width:'100px'},{width:'200px'}],
    time:200
}]);
//stop the animation after 1 secord.
setTimeout(function(){
    Ash.stop(id);
},1000);
```