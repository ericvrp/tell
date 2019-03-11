const child_process = require('child_process')

// const settings = require('./settings')


const tell = (filename, output) => {
	// console.log(output)
	const cmd = `ipfs add -Q ${filename} | ipfs name publish --key ${output.name} -Q`
	// console.log('$', cmd)
	const ipnsCid = 'https://ipfs.io/ipns/' + child_process.execSync(cmd).toString()
	// console.log(ipnsCid)
}

exports.tell = tell
