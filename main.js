#!/usr/bin/env node
'use strict';

var cl = (m) => console.log(m);



//» GLOBALS 
//----------------------------------------

// Modules
var
	_      = require('underscore'),
	fs     = require('fs'),
	path   = require('path'),
	jsonb  = require('json-beautify'),
	colors = require('colors');

// Constants
var ATOMS    = process.cwd() + '/atoms.json';
var MAINDIR  = process.cwd() + '/molecules/';
//----------------------------------------





//» CLASSES 
//----------------------------------------
class Molecule {

	constructor(name, muts, atoms) {

		this.name      = name;
		this.mutations = muts  ? muts  : [];
		this.atoms     = atoms ? atoms : [];

	}

	whoIs() {
		cl(`Name: ${this.name}, mutations: ${this.mutations}, atoms: ${this.atoms}`);
	}

	init(rewrite) {
		let fileName = `${MAINDIR}${this.name}.json`;
		let fileContent = jsonb(this, null, 4, 100);

		fs.access(fileName, fs.F_OK, (notExist) => {

			if (notExist) {

				fs.writeFile(fileName, fileContent, (err) => {
					if (err) throw err;

					console.log(`molecule ${this.name} created:`.green);
					console.log(fileContent.gray);
				});

			}

			else {
				if (rewrite) {
					fs.writeFile(fileName, fileContent, (err) => {
						if (err) throw err;

						console.log(`molecule ${this.name} created:`.green);
						console.log(fileContent.gray);
					});	
				}

				else {
					console.log("FILE: Already exsit".blue);
					return;
				}
			}

		});

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
function moleculate(dir) {

}



/*
Get JSON data from file: return - json

	» file — path to file | string
	» sync — sync reading | bool
*/
function getJson(file) {
	let json = jsonb( fs.readFileSync(file, 'utf-8'), null, 4,  100 );

	return json;
}
//----------------------------------------





//» MAIN THREAD 
//----------------------------------------
var args = process.argv;

args.shift(); // current fix
args.shift(); // Delete first command

var
	custom    = false,
	rewrite   = false,
	molecules = [].slice.call( fs.readdirSync(MAINDIR) ),
	atoms 	  = {};

args.forEach( (el, i, arr) => {

	if (el === "-c" || el === "--custom") {
		custom = true;
		arr.splice(i, 1);
	}

});

args.forEach( (el, i, arr) => {

	if (el === "-r" || el === "--rewrite") {
		rewrite = true;
		arr.splice(i, 1);
	}

});

fs.access(ATOMS, fs.F_OK, (notExist) => {

	if (notExist)
		cl(`Create some atoms1`.blue);

	else
		atoms = getJson(ATOMS);

});

var molecule = args[0];
var action   = args[1];

args.shift();
args.shift();

if (action === "mutate") {
	var molecules = [].slice.call( fs.readdirSync(MAINDIR) );

	if (molecules.indexof(molecule) !== -1) {

	}
}

if (action === "with") {
	var mol = new Molecule(molecule, [], args);

	mol.init();
}
//----------------------------------------