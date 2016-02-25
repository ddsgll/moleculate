#!/usr/bin/env node
'use strict';

var cl = (m) => console.log(m);



//» GLOBALS 
//----------------------------------------

// Modules
const
	_        = require('underscore'),
	fs       = require('fs'),
	path     = require('path'),
	jsonb    = require('json-beautify'),
	clear    = require('clear'),
	colors   = require('colors'),
	readline = require('readline'),
	jsonfile = require('jsonfile');


const rl = readline.createInterface({
	input : process.stdin,
	output: process.stdout
});

const MAINFILE = path.join(process.cwd() + '/moleculate.json');

var blockPath = '/blocks/';
//----------------------------------------





//» CLASSES 
//----------------------------------------
class Molecule {

	constructor(name, muts, atoms) {
		this.name      = name;
		this.mutations = muts  ? muts  : [];
		this.atoms     = atoms ? atoms : [];
	}
}


class Atom {

	constructor(name, muts, tag, attr) {
		this.name = name;
		this.muts = muts;
		this.tag  = tag;
		this.attr = attr;
	}

	static create() {
		let name, muts, tag, attr

		cl(`Creating new atom. "Ctrl+c" to exit`.gray);

		rl.question(`Name » `.green, atomName => {
			name = atomName;

			rl.question(`Mutates » `.green, atomMutate => {
				muts = atomMutate.split(' ');

				rl.question(`Tag » `.green, atomTag => {
					tag = atomTag;

					rl.question(`Attributes » `.green, atomAttr => {
						attr = atomAttr.split(' ');

						var atom = new Atom(name, muts, tag, attr);
						Atom.save(atom);
						rl.close();
					});
				});
			});
		});
	}

	static save(atom) {
		addAtom(atom);
	}
}

//----------------------------------------



//» FUNCTIONS 
//----------------------------------------
/*
Set path option into moleculate.json

	» path — path for blocks | string
*/
function setOptionPath(path) {

	let data = jsonfile.readFileSync(MAINFILE);

		data.dir = path;

	jsonfile.writeFileSync(MAINFILE, data, {spaces: 4});

	cl(`Path updated`.green);
	rl.close();

}


/*
Adding new atom in moleculate.json

	» path — path for blocks | string
*/
function addAtom(atom) {

	let data = jsonfile.readFileSync(MAINFILE);

	data.atoms.forEach( (a, i, array) => {

		if (a.name === atom.name) {
			cl('Atom already exists: '.red + `${atom.name}`.yellow);
			process.abort();
		}

	});

	data.atoms.push(atom);

	jsonfile.writeFileSync(MAINFILE, data, {spaces: 4});

}
//----------------------------------------





//» MAIN THREAD 
//----------------------------------------
var args = process.argv;

process.title = 'Moleculate';

const commands = ["set", "s", "new", "n", "--help", "-h", "--path", "-p"];

args.shift(); // current fix
args.shift(); // Delete first command

var mode = args[0];
var type = args[1];

if (commands.indexOf(mode) === -1) {
	cl('No such command.\nUse "--help" to show possible commands'.blue);
	rl.close();
}

if (mode === "--help" || mode === "-h") {
	cl(`Moleculate: --help\n`.green)
	cl(`\tmoleculate new atom     — create new atom`)
	cl(`\tmoleculate new molecule — create new molecule`)
}

if (mode === "new" || mode === "n") {

	switch(type) {

		case undefined:
			cl(`Enter type of element: 'atom' of 'molecule'`.blue);
			break;

		case "a":
		case "atom":
			Atom.create();
			break;

		case "m":
		case "molecule":
			cl(`New molecule init command`.yellow);
			break;

		default:
			cl(`Wrong command. Use "--help" for information`.blue);

	}

}

if (mode === "--path" || mode === "-p") {

	switch(type) {

		case undefined:
			rl.question(`Blocks directory path » `, newPath => {
				setOptionPath( path.normalize(newPath) );
				rl.close();
			});
			break;

		default:
			setOptionPath( path.normalize(type) );
	}

}
//----------------------------------------