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

## 1. Make your own template

Tellin uses Ejs as the template engine. You can visit [here](http://www.embeddedjs.com/) for more information.

## 2. Write your article

Put your own article under the folder '_data'

## 3. Configuration

Create a configuration file under the your project folder. Tellin will generate html files according to it.

## 4. Generate the website

```
$ cd yourFolderName
$ tellin
```