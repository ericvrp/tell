#!/usr/bin/env node

const settings = require('./settings')
const outputs  = require('./outputs')


const usage = () => {
	console.log(`tell filename
   
   Default outputs
	${settings.defaults}`)

	// <options>
	//   Possible options
	//      -o <outputs>
	//
	//   Possible outputs
	//	${Object.keys(settings.outputs)}	
}


const tell = (filename, selectedOutputs) => {
	selectedOutputs.map(outputName => {
		const output = settings.outputs[outputName]
		outputs[output.type].tell(filename, output)
	})
}


if (process.argv.length <= 2) {
	usage()
} else {
	tell(process.argv[2], settings.defaultOutputs)
}

