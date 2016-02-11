#!/usr/bin/env node
'use strict';

var cl = (m) => console.log(m);
cl('MoLeCuLaTe! (in ' + __dirname + ')');



//» GLOBALS 
//----------------------------------------

// Modules
var
	_      = require('underscore'),
	fs     = require('fs'),
	path   = require('path'),
	mkdirp = require('mkdirp');

// Constants
const _MAINFILE = __dirname + '/moleculate.json';
const _MAINDIR  = __dirname + '/molecules/';

// Variables
var projectBlocks = [];

//----------------------------------------





//» CLASSES 
//----------------------------------------
class Block {

	constructor(data, bDir) {

		this.full     = data;
		this.title    = data.title;
		this.blockDir = bDir

		data.inherits != undefined ? this.inh = data.inherits : this.inh = [];
	}


	_fillBlock() {

	}


	sayhi() {
		cl('Hello! I am ' + this.title);
	}


	init() {
		
	}
}

//----------------------------------------



//» FUNCTIONS 
//----------------------------------------

/*
Reading molecules from folder
and generating folders structure

	» dir  — name of blocks directory | string
	» opts — options                  | obj
*/
function moleculate(dir, opts) {
	let molecules = [].slice.call( fs.readdirSync(_MAINDIR) );

		molecules.forEach(function(el, i, arr) {

			if (el.charAt(0) != '.') {
				projectBlocks.push(el.slice(0,-5));

				let path = dir + el.slice(0,-5);

				mkdirp(path);
			}

		});


	let blocks = getBlocks(molecules, dir);

		blocks.forEach(function(el, i, arr) {
			el.init();
		});
}


/*
Get JSON data from file: return - json

	» file — path to file | string
	» sync — sync reading | bool
*/
function getJson(file) {
	let json = JSON.parse( fs.readFileSync(file, 'utf-8') );

	return json;
}


/*
Check JSON object validity: return - bool

	» json — object to check | obj
*/
function checkValid(json) {
	let title = json.title;

	if (title === '' || typeof(title) != 'string') {
		сonsole.log('Error: wrong json file – title must be string');
		return false;
	}

	return true;
}


/*
Create array of Block instances from files: return - array

	» molecules — list of molecule files    | array
	» dir       — directory for Block class | string
*/
function getBlocks(molecules, dir) {

	let arr = [];

	_.each(molecules, (el,i) => {

		if (el.charAt(0) != '.')
		{
			let 
				path     = _MAINDIR + el,
				data     = getJson(path),
				curBlock = new Block(data, dir);

			arr.push(curBlock);
		}

	});

	return arr;
}
//----------------------------------------





//» MAIN THREAD 
//----------------------------------------
var options = {
	htmlTemplate: 'jade',
	cssTemplate: 'stylus'
}

moleculate(__dirname + '/blocks/', options);
//----------------------------------------