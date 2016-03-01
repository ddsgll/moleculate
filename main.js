#!/usr/bin/env node
'use strict';

var cl = (m) => console.log(m);



//» GLOBALS 
//----------------------------------------

// Modules
const
	fs       = require('fs'),
	path     = require('path'),
	colors   = require('colors'),
	mkdirp   = require('mkdirp'),
	readline = require('readline'),
	jsonfile = require('jsonfile');


const rl = readline.createInterface({
	input : process.stdin,
	output: process.stdout
});


// Constants
const MAINFILE = path.join(process.cwd() + '/moleculate.json');
const commands = ["new", "n", "--help", "-h", "path", "p", "run", "r"];


// Variables
var blockPath = 'blocks/';


//----------------------------------------





//» CLASSES 
//----------------------------------------

// Markup generator class
class Generator {



	// Generating jade code
	//----------------------------------------
	static jade(block) {

		let
			mStart = `
			//- Block
			mixin ${block.name}(m)
			
				//- Mutation
				- var p = m === undefined ? '' : '--' + m;
			`,

			mEnd = `
				//- Body
				div(class='${block.name}#{p}')
			`,

			mElements = '';

		let thereAreAtoms = block.atoms.length > 0 && block.atoms[0] !== "";


		// Define atoms
		if (thereAreAtoms) {

			block.atoms.forEach( atel => {

				let elemString = '';


				// Define default atom
				if (isNewAtom(atel))
				{
					elemString = `
					//- Element '${atel}'
					mixin ${atel}(em)
						- var ep = em === undefined ? '' : '--' + em;
					
						div(class='${block.name}#{p}__${atel}#{ep}')

					`;
				}


				// Define custom atom
				else
				{
					let ad = getAtomByName(atel);
					let props = '';


					// Fill attributes
					ad.attr.forEach( (attr) => {

						let sp = attr.split(':');

						props += sp.length === 2 ? `${sp[0]}="${sp[1]}" ` : `${sp[0]} `;
					});


					elemString = `
					//- Element '${ad.name}'

					mixin ${atel}(em)
						//- Mutation
						- var ep = em === undefined ? '' : '--' + em;
					
						${ad.tag}(class='${block.name}#{p}__${ad.name}#{ep} ${props}')
					`;
				}

				mElements += elemString;
			});
		}


		return mStart + mElements + mEnd;
	}
	//----------------------------------------




	// Generating stylus code
	//----------------------------------------
	static stylus(block) {

		let
			mStart = '',
			mBlock = `.${block.name}\n\t\n`,
			
			blockModsElems = '',
			blockMods      = '',
			elemString     = '';

		let
			thereAreAtoms     = block.atoms.length     > 0 && block.atoms[0]     !== '',
			thereAreMutations = block.mutations.length > 0 && block.mutations[0] !== '';



		// Define atoms
		if (thereAreAtoms) {
			
			block.atoms.forEach( atel => {

				blockModsElems += `\t\t.${block.name}__${atel}\n\t\t\t\n\n`;


				// Define default element
				if (isNewAtom(atel))
					elemString = `.${block.name}__${atel}\n\n`;
				

				// Define custom element
				else {
					let ad = getAtomByName(atel);

					let
						mutString    = '',
						atomWithMuts = ad.muts.length > 0 && ad.muts[0] !== '';

					if (atomWithMuts) {					
						ad.muts.forEach( mut => {

							mutString += `\t&--${mut}\n\n`;

						});
					}

					elemString = `.${block.name}__${atel}\n\n` + mutString;
				}

				mStart += elemString;
			});
		}



		// Define mutations
		if (thereAreMutations) {
			block.mutations.forEach( mut => {
				blockMods += `\n\t&--${mut}\n\n` + blockModsElems;
			});
		}


		return mStart + mBlock + blockMods;
	}
	//----------------------------------------

}






// Molecule class
class Molecule {

	// Constructor
	constructor(name, muts, atoms) {
		this.name      = name;
		this.mutations = muts  ? muts  : [];
		this.atoms     = atoms ? atoms : [];
	}



	// Creating new molecule via prompt
	static create() {
		let name, muts, atoms;

		cl(`Creating new molecule. "Ctrl+c" to exit`.gray);

		rl.question(`Name » \n`.green, molName => {
			name = molName;

			rl.question(`Mutates (space separated)» \n`.green, molMutate => {
				muts = molMutate.split(' ');

				rl.question(`Atoms » \n`.green + `predefined:`.white + `${getAtomsList(MAINFILE)}\n`.gray, molAtoms => {
					atoms = molAtoms.split(' ');

					var molecule = new Molecule(name, muts, atoms);

					Molecule.save(molecule);
				});
			});
		});

	}



	// Saving molecule 
	static save(mol) {

		let data = jsonfile.readFileSync(MAINFILE);

		if (isNewMolecule(mol.name)) {
			data.molecules.push(mol);

			jsonfile.writeFileSync(MAINFILE, data, {spaces: 4});

			buildBlocks();

			rl.close();
		}

		else
			cl(`Molecule already exists: `.red + `${mol.name}`.yellow);
	}


	static generateJade(el) {


	}


	static generateStyl(el) {

		let atomsList = getAtomsList(MAINFILE);

		let
			mStart         = ``,
			blockModsElems = ``;

		if (el.atoms.length) {
			el.atoms.forEach( atel => {
				let elemString = '';

				blockModsElems += `\t\t.${el.name}__${atel}\n\t\t\t\n\n`;

				if (atomsList.indexOf(atel) === -1)
					elemString = `.${el.name}__${atel}\n\n`;
				

				else {
					let ad = getAtomByName(atel);


					let mutString = '';

					if (ad.muts.length) {					
						ad.muts.forEach( (mut) => {

							mutString += `\t&--${mut}\n\n`;

						});
					}


					elemString = `.${el.name}__${atel}\n\n` + mutString;
				}

				mStart += elemString;
			});
		}



		let blockMods = '';

		if (el.mutations.length) {
			el.mutations.forEach( mut => {
				blockMods += `\t&--${mut}\n\n` + blockModsElems;
			});
		}


		let mBlock = `.${el.name}\n\t\n`;


		let result = mStart + mBlock + blockMods;

		return result;
	}
}








// Atom class
class Atom {

	// Constructor
	constructor(name, muts, tag, attr) {
		this.name = name;
		this.muts = muts;
		this.tag  = tag;
		this.attr = attr;
	}



	// Creating new atom via prompt
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



	// Saving new atom into moleculate.json
	static save(atom) {

		let data = jsonfile.readFileSync(MAINFILE);

		if (isNewAtom(atom.name)) {
			data.atoms.push(atom);

			jsonfile.writeFileSync(MAINFILE, data, {spaces: 4});

			cl(`Created new atom: `.green  + `${atom.name}`.gray);
		}

		else
			cl(`Atom already exists: `.red + `${atom.name}`.gray);

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

	let
		data  = jsonfile.readFileSync(file),
		array = [];

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

	let
		data  = jsonfile.readFileSync(file),
		array = [];

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



/*
Return atom object from moleculate.json by atom name

	» name — atom name | string
*/
function getAtomByName(name) {
	var result;

	if (isNewAtom(name))
		cl(`Error: atom ${name} doesn't exists`.red);

	else {
		let 
			data  = jsonfile.readFileSync(MAINFILE),
			atoms = data.atoms;

		atoms.forEach(el => {
			el.name === name ? result = el : '';
		});
	}

	return result;
}

//----------------------------------------












//» MAIN THREAD 
//----------------------------------------
var args = process.argv;

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



if (mode === "run" || mode === "r") {
	buildBlocks();
}
//----------------------------------------




//» BUILD BEM BLOCKS
//----------------------------------------
function buildBlocks() {
	let data = jsonfile.readFileSync(MAINFILE);

	let
		dir       = path.join(process.cwd(), data.dir),
		atoms     = data.atoms,
		molecules = data.molecules;


	if (molecules.length === 0) {
		cl('Error: no molecules initialised'.red);
		cl('Use --help to list commands'.gray);
		rl.close();
	}


	molecules.forEach( el => {

		let
		blockDir = path.join(dir, el.name),
	
		jadeData = Generator.jade(el),
		jadeFile = path.join(blockDir, el.name + '.jade'),
	
		stylData = Generator.stylus(el),
		stylFile = path.join(blockDir, el.name + '.styl'),
	
		jsData   = `// ${el.name} scripts goes here\n`,
		jsFile   = path.join(blockDir, el.name + '.js');


		mkdirp(blockDir, err => {
	    	fs.writeFile(jadeFile, jadeData);
	    	fs.writeFile(stylFile, stylData);
	    	fs.writeFile(jsFile  , jsData  );
		});


		cl(`Blocks created`.green);
		rl.close();

	});
}
//----------------------------------------