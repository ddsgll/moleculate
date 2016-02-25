#!/usr/bin/env node
'use strict';

var cl = (m) => console.log(m);



//» GLOBALS 
//----------------------------------------

// Modules
var
	fs     = require('fs'),
	path   = require('path'),
	jsonb  = require('json-beautify'),
	colors = require('colors'),
	mkdirp = require('mkdirp');

// Constants
const _MAINFILE = process.cwd() + '/moleculate.json';
const _MDIR  = process.cwd() + '/molecules/';
const _ADIR  = process.cwd() + '/atoms/';

// Variables
var projectBlocks = [];

//----------------------------------------





//» CLASSES 
//----------------------------------------
class Atom {

	constructor(name, quark, muts, spins) {

		this.name      = name;
		this.quark     = quark ? quark : '';
		this.mutations = muts  ? muts  : [];
		this.spins     = spins ? spins : [];

	}

	whoIs() {
		cl(`Name: ${this.name}, quark: ${this.quark}, mutations: ${this.mutations}, spins: ${this.spins}`);
	}

	init(mode) {
		let fileName = `${_ADIR}${this.name}.json`;
		let fileContent = jsonb(this, null, 4, 100);

		cl(mode);

		fs.access(fileName, fs.F_OK, (notExist) => {

			if (notExist && mode === 'new') {

				fs.writeFile(fileName, fileContent, (err) => {
					if (err) throw err;

					console.log(`Atom ${this.name} created:`.green);
					console.log(fileContent.gray);
				});

			}
			else {
				if (mode === 'rewrite') {				
					fs.writeFile(fileName, fileContent, 'utf8', (err) => {
						if (err) throw err;

						console.log(`Atom ${this.name} created:`.green);
						console.log(fileContent.gray);
					});
				}

				else {
					cl(`File already exists. Use -r to rewrite file`);
				}	
			}

		});

	}

}



class Molecule {

	constructor(name, muts, atoms) {

		this.name      = name;
		this.mutations = muts  ? muts  : [];
		this.atoms     = atoms ? atoms : [];

	}

	whoIs() {
		cl(`Name: ${this.name}, mutations: ${this.mutations}, atoms: ${this.atoms}`);
	}

	init(mode) {
		let fileName = `${_MDIR}${this.name}.json`;
		let fileContent = jsonb(this, null, 4, 100);

		cl(mode);

		fs.access(fileName, fs.F_OK, (notExist) => {

			if (notExist && mode === 'new') {

				fs.writeFile(fileName, fileContent, (err) => {
					if (err) throw err;

					console.log(`Atom ${this.name} created:`.green);
					console.log(fileContent.gray);
				});

			}
			else if (mode === 'rewrite') {					
				fs.writeFile(fileName, fileContent, 'utf8', (err) => {
					if (err) throw err;

					console.log(`Atom ${this.name} created:`.green);
					console.log(fileContent.gray);
				});
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

	let
		molecules = [].slice.call( fs.readdirSync(_MDIR) ),
		atoms     = [].slice.call( fs.readdirSync(_ADIR) );


	if (!molecules.length || !atoms.length) {
		cl(`\nError: directories `.red + `\n'${_MDIR}'\n`.green.underline + ` and `.red + `\n'${_ADIR}'\n`.green.underline + ` are empty`.red);
		cl(colors.gray.italic(`\tCreate some files first\n\tUse ${colors.green('moleculate --help')} command for help`));
		exit();
	}
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
		cl(`Error: wrong json file – title must be string`.red);
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

	molecules.forEach( (el,i) => {

		if (el.charAt(0) != '.')
		{
			let 
				path     = _MDIR + el,
				data     = getJson(path),
				curBlock = new Block(data, dir);

			arr.push(curBlock);
		}

	});

	return arr;
}




function strToArray(string) {

	let arr = string.split(',');

	arr.forEach( (item, i, arr) => {

		var l = item.split(':').length - 1;

		if (!l) {
			return;
		} else {
			arr[i] = item.split(':');
		}

	});

	return arr;
}
//----------------------------------------





//» MAIN THREAD 
//----------------------------------------


cl(`script started in ${process.cwd()}`.gray);

cli.parse({
		molecule: ['m' , 'Creating molecule' , 'string'],
		atom    : ['a' , 'Creating atom\n' , 'string'],
		mutate  : [ 0  , 'Mutations list of atom or molecule' , 'string'],
		quark   : ['q' , 'Set quark to atom' , 'string'],
		spins   : ['s' , 'Set spins of quark' , 'string'],
		path    : ['p' , 'Set directory to save blocks relative to project folder' , 'string'],
		with    : ['w' , 'List of atoms in molecule', 'string'],
		rewrite : ['r' , 'Rewrite existing element', 'bool']
});




cli.main(function(args, opt) {

	let
		A     = opt.atom,
		M     = opt.molecule,
		
		rew   = opt.rewrite,
		mode  = '',

		quark = opt.quark,
		path  = opt.path ? opt.path : /blocks/;

	let
		mutate = opt.mutate != null ? strToArray(opt.mutate) : '',
		spins  = opt.spins  != null ? strToArray(opt.spins)  : '',
		witha  = opt.with   != null ? strToArray(opt.with)   : '';


	mode = rew !== null ? 'rewrite' : 'new';



	if ( A !== null && M !== null) {
		cl(`Error: you can't create atom and molecule in one command`.red);
		cl(`We're working on it\n`.gray);
		exit();
	}

	if (A === null && M === null) {
		moleculate(process.cwd() + path);
		exit();
	}

	if (A) {
		var atom = new Atom(A, quark, mutate, spins);
			atom.init(mode);
	}

	if (M) {
		var molecule = new Molecule(M, mutate, witha);
			molecule.init(mode);
	}

});
//----------------------------------------
