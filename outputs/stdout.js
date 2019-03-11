const child_process = require('child_process')

const tell = (filename, output) => {
	const cmd = `cat ${filename}`
	// console.log('$', cmd)
	const result = child_process.execSync(cmd).toString()
	console.log(result)
}

exports.tell = tell
