Title: Get Start
Desc: Tellin is a node.js based library which help you to generate static website.
SortIndex: 1
IndexPage: true
---
Tellin is a node.js based library which help you to generate static website. Before I decided to write tellin.js, I tried to find some similar tools. I think they are prefect for writers, but it's hard for me to customize Css, Html and the other thins. I think tellin.js is created more for people who want to decorate their own static web site.

# Intallation

```
$ npm -g install tellin
```

# Usage

## 1.Init your the project
You can use the following command to init the folder. Otherwise you can also create files by self.

```
$ cd yourFolder
$ tellin init
```

## 2.Write your atricle
Pur your .MD files in the folder ```./_data/doc```

Each markdown file can contain a yaml header. Tellin.js will use its data when rendering.

## 3.Generate WebSite
After you perpare the data, you can excute the following command to generate your website. You can upload the folder to your server and check your web page.

```
$ tellin
```

# MVC

Tellin.js is based on MVC model. You can not only write the .MD files but also customize every part of MVC. Please view other documents for the detail.