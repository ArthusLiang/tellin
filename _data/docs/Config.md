Title: Config
Desc: This 
SortIndex: 5
---

# Config

The config files should be **tellin.json** under the root of the project folder. The following is its default value.

```
{
	"_Rule":[{
		"Name":"Docs",
		"View":"docs.ejs",
		"Data":"./docs",
		"Controller":"detail"
	},{
		"Name":"Docs_List",
		"View":"list.ejs",
		"Data":"./docs",
		"Controller":"list"
	}],
	"Nav":{
		"Docs":"../docs/"
	},
	"_page_item_num":10,
	"_page_btn_num":10,	
	"_page_for_index":true,
	"Source_css":"./css/",
	"Source_js":"./js/",
	"Source_img":"./img/",
	"Source_img_atricle":"./img_data/",
	"filename":"./_view/controls",
	"_Path_ViewFolder":"./_view/",
	"_Path_DataFolder":"./_data/",
	"_Path_OutputFolder":"./"
}
```

The property whose name is start with '_' is used for some rendering rule. The other properties will be merged into rendering data.

### _Rule

You can define the way to generate HTML page in **_Rule**. 

| Property        | Description                                                      | 
| ----------------|:-----------------------------------------------------------------| 
| Name            | -                                                                |
| View            | Ejs template                                                     |
| Data            | Where you put your markdown files. Tellin will loop the folder   |
| Controller      | The controller module.                                           |

View's value should be a file path under './_view'.（change the root path in _Path_ViewFolder）

Data's value should be a folder path under './_data'.（change the root path in _Path_DataFolder）

Controller's value should be a file name under './_controller' or a key words('list','detail').（change the root path in _Path_ViewFolder）

### Source_css
The folder you put the css files.

### Source_js
The folder you put the js files.

### Source_img
The folder you put the images for website.

### Source_img_atricle
The folder you put the images for markdown files.