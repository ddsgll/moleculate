#!/usr/bin/env node
'use strict';

var cl = (m) => console.log(m);



//» GLOBALS 
//----------------------------------------

// Modules
const
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
// Molecule class
class Molecule {

	constructor(name, muts, atoms) {
		this.name      = name;
		this.mutations = muts  ? muts  : [];
		this.atoms     = atoms ? atoms : [];
	}

	static create() {
		let name, muts, atoms;

		cl(`Creating new molecule. "Ctrl+c" to exit`.gray);

		rl.question(`Name » `.green, molName => {
			name = molName;

			rl.question(`Mutates » `.green, molMutate => {
				muts = molMutate.split(' ');

				rl.question(`Atoms » \n`.green + `Atoms: ${getAtomsList(MAINFILE)}\n`.gray, molAtoms => {
					atoms = molAtoms.split(' ');
					let notExisted = [];

					for (let atom of atoms) {

						if (isNewAtom(atom)) {
							notExisted.push(atom);
						}
					}

					var molecule = new Molecule(name, muts, atoms);
					
					if (notExisted.length) {					
						cl(`Some atoms were not found: `.red + `${notExisted}`.yellow)
						cl(`Don't forget to create them`.red);
					}

					Molecule.save(molecule);

				});
			});
		});

	}

	static save(mol) {
		let
			data        = jsonfile.readFileSync(MAINFILE),
			molecules   = getMoleculesList(MAINFILE),
			molNotExist = isNewMolecule(mol.name);

		if (molNotExist) {
			data.molecules.push(mol);

			jsonfile.writeFileSync(MAINFILE, data, {spaces: 4});

			Molecule.initBlock(mol.name);
		}

		else
			cl(`Molecule already exists: `.red + `${mol.name}`.yellow);
	}

	static initBlock(name) {


		cl(`Created new molecule: `.green  + `${name}`.yellow);
		rl.close();
	}
}








// Atom class
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

		let
			data      = jsonfile.readFileSync(MAINFILE),
			atoms     = getAtomsList(MAINFILE),
			atomExist = isNewAtom(atom.name);

		if (atomExist) {
			data.atoms.push(atom);

			jsonfile.writeFileSync(MAINFILE, data, {spaces: 4});

			cl(`Created new atom: `.green  + `${atom.name}`.yellow);
		}

		else
			cl(`Atom already exists: `.red + `${atom.name}`.yellow);

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
Return array of current atoms names

	» file — path for blocks | string
*/
function getAtomsList(file) {

	let data = jsonfile.readFileSync(file);
	let array = [];

	data.atoms.forEach( el => {
		array.push(el.name);
	});

	return array;

}



/*
Return array of current molecules names

	» file — path for blocks | string
*/
function getMoleculesList(file) {

	let data = jsonfile.readFileSync(file);
	let array = [];

	data.molecules.forEach( el => {
		array.push(el.name);
	});

	return array;

}



/*
Check if atom exists - bool

	» name — atom name | string
*/
function isNewAtom(name) {
	var atoms = getAtomsList(MAINFILE);

	return atoms.indexOf(name) === -1 ? true : false;
}



/*
Check if molecule exists - bool

	» name — molecule name | string
*/
function isNewMolecule(name) {
	var mols = getMoleculesList(MAINFILE);

	return mols.indexOf(name) === -1 ? true : false;
}
//----------------------------------------





//» MAIN THREAD 
//----------------------------------------
var args = process.argv;

process.title = 'Moleculate';

const commands = ["new", "n", "--help", "-h", "path", "p"];

args.shift(); // current fix
args.shift(); // Delete first command

var mode = args[0]; 
var type = args[1];



// Check if command is valid
if (commands.indexOf(mode) === -1) {
	cl('No such command.\nUse "--help" to show possible commands'.blue);
	rl.close();
}



// Call help
if (mode === "--help" || mode === "-h") {
	cl(`\nMoleculate: --help`.magenta)
	cl(`\tmoleculate new atom        — create new atom`)
	cl(`\tmoleculate new molecule    — create new molecule`)
	cl(`\tmoleculate path <pathname> — set blocks directory relative to project`)

	cl(`\nShorthands:`.magenta)
	cl(`\t n a     — new atom`)
	cl(`\t n m     — new molecule`)
	cl(`\t p <...> — new molecule\n`)
	rl.close();
}



// Init new element
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
			Molecule.create();
			break;

		default:
			cl(`Wrong command. Use "--help" for information`.blue);
			rl.close();

	}

}



// Set path parameter
if (mode === "path" || mode === "p") {

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