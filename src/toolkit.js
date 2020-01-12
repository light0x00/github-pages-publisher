const getopts = require("getopts");
const shell = require("shelljs")
const Path = require("path")
const CWD = process.cwd()

function getOpts() {
	const options = getopts(process.argv.slice(2), {
		alias: {
			help: "h",
			//源分支
			branch: "b",
			//资源路径
			assetsPath: "a",
			//工作树路径
			worktreePath: "w",
			//部署目标分支
			pagesBranch: "p",
			yes: false,
			cleanHistory: false
		},
		default: {
			worktreePath: Path.resolve(CWD, ".gh-pages"),
			pagesBranch: "gh-pages",
			yes: false
		}
	});
	
	return options;
}

const Colors = {
	red(str) {
		return "\033[31m" + str + "\033[0m"
	},
	cyan(str) {
		return "\033[36m" + str + "\033[0m"
	}
}

function exec(cmd) {
	console.log(Colors.cyan("$ ") + cmd);
	let { code, stdout, stderr } = shell.exec(cmd)
	assert(code == 0, Colors.red(stderr))
	return stdout;
}

function assert(condition, msg) {
	if (!condition) {
		console.error(Colors.red(msg))
		process.exit(1);
	}
}

module.exports={assert,exec,Colors,getOpts}