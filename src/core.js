const shell = require("shelljs")
const fs = require("fs")
const Path = require("path")
const { assert, exec, getOpts, Colors } = require("./toolkit");
const CWD = process.cwd()

function main({ help, branch, assetsPath, worktreePath, pagesBranch, yes, cleanHistory }) {

	if (help) {
		process.stdout.write(
			`usage:
-a,--assetsPath	The path of the assets to be deployed to gh-pages branch.
-b,--branch	The branch where the "assetsPath" is located.(default is current branch)
-w,--worktreePath The Path to store the gh-pages worktree.(default is ".gh-pages" relative to "pwd")
-p,--pagesBranch The branch to deploy gh-pages.(default is "gh-pages")
`)
		process.exit(0);
	}
	assert(assetsPath != undefined, "The option `-a,--assetsPath` is required!")
	if (Path.isAbsolute(assetsPath))
		assetsPath = Path.resolve(CWD, assetsPath);
	assert(fs.existsSync(assetsPath), `The assetsRoot "${assetsPath}" does not exists!`);
	if (branch == undefined) {
		branch = Git.branch.current();
	}
	if (worktreePath == undefined) {
		worktreePath = Path.resolve(CWD, ".gh-pages");
	} else if (!Path.isAbsolute(worktreePath))
		worktreePath = Path.resolve(CWD, worktreePath);

	if (pagesBranch == undefined)
		pagesBranch = "gh-pages"

	let msg = `
1. Recreate gh-pages(${pagesBranch}) branch for deployment.(The old branch will be deleted)
2. Recreate worktree at "${worktreePath}"(The old worktree will be removed)
3. Publish the assets located "${assetsPath}" to gh-pages(${pagesBranch}) branch.` +
		(cleanHistory ? "\n\033[31m" + `4. Clean the commit history of gh-pages branch(${pagesBranch}),It's irrevocable!` + "\033[0m" : "")
	if (yes) {
		Workflow.exec({ worktree: worktreePath, pagesBranch, masterBranch: branch, assetsPath })
	} else {
		var inquirer = require('inquirer');
		inquirer
			.prompt([
				{
					type: 'input',
					name: 'continue',
					message: msg + "\ncontinue?(y/n)"
				}
			])
			.then(answers => {
				if (answers.continue != "y") {
					process.exit(0);
				}
				Workflow.exec({ worktree: worktreePath, pagesBranch, masterBranch: branch, assetsPath })
			}).catch(
				e => {
					console.log("An unexpected exception occurs,exit(1).", e)
					process.exit(1);
				}
			)
	}
}

const Workflow = {
	ensureCommitted() {
		assert(!Git.status.hasUnCommit(), "has uncommitted changes!")
	},
	cleanOld(worktree, branch) {
		if (Git.worktree.exists(worktree)) {
			Git.worktree.delete({ path: worktree, force: true });
		}
		if (Git.branch.exists(branch)) {
			Git.branch.delete({ branch })
		}
	},
	createNew(worktree, branch) {
		Git.checkout({ branch, orphan: true })
		Git.reset({ hard: true })
		Git.commit({ msg: "initial commit", allowEmpty: true })
	},
	exec({ worktree, pagesBranch, masterBranch, assetsPath }) {
		// 当前分支不允许有未提交文件
		this.ensureCommitted()

		//如果存在旧的 就删除
		this.cleanOld(worktree, pagesBranch)

		//创建一个没有提交历史的分支
		this.createNew(worktree, pagesBranch);

		//部署
		Git.checkout({ branch: masterBranch })
		Git.worktree.add({ path: worktree, branch: pagesBranch })
		assetsPath = Path.resolve(assetsPath, "*")
		shell.cp("-r", assetsPath, worktree)
		shell.cd(worktree)
		Git.add({ path: "." })
		Git.commit({ msg: "deploy" })
		let remotes = Git.remote.list();
		assert(remotes.length > 0, Colors.red("Remote repo was not found,plz run `git remote add ..` first."))
		Git.push({ remote: remotes[0], branch: pagesBranch, setUpstream: true, force: true })
	}
}

const Git = {
	worktree: {
		list() {
			let stdout = exec(`git worktree list`)
			let lst = []
			for (let line of stdout.split(/\n(?!$)/)) {
				let [name, hash, branch] = line.split(/\s+/)
				lst.push({ name, hash, branch });
			}
			return lst;
		},
		exists(p) {

			if (!Path.isAbsolute(p)) {
				p = Path.resolve(process.cwd(), p)
			}
			for (let { name } of this.list()) {
				if (name == p) {
					return true;
				}
			}
			return false;
		},
		add({ path, branch }) {
			assert(path != undefined, branch != undefined)
			let opts = `${path} ${branch}`
			exec(`git worktree add ` + opts)
		},
		delete({ path, force }) {
			let opts = "";
			if (force) {
				opts += " --force"
			}
			exec(`git worktree remove ` + path + opts)
		}
	},
	checkout({ branch, orphan }) {
		let opts = ""
		if (orphan) {
			assert(branch != undefined)
			opts += "--orphan=" + branch;
		}
		else
			opts = branch;

		exec(`git checkout ` + opts)
	},
	stashSpace: {
		stash({ keepIndex, includeUntrack }) {
			let opts = ""
			if (keepIndex)
				opts += " --keep-index"
			if (includeUntrack)
				opts += " --include-untracked"
			exec(`git stash` + opts)
		},
		pop() {
			exec(`git stash pop`)
		},
	},

	status: {
		hasUnCommit() {
			return this.changes()["M"] != undefined;
		},
		changes() {
			let r = {}
			exec("git status -s").split(/\n(?!$)/).forEach(l => {
				let [type, file] = l.replace(/^\s+/, "").split(/\s+/)
				if (r[type] == undefined)
					r[type] = []
				r[type].push(file)
			})
			return r;
		}
	}
	, indexSpace: {
		reset({ hard = false }) {
			let opts = ""
			if (hard)
				opts += "--hard"
			exec(`git reset ${opts}`)
		}
	}
	,
	branch: {
		current() {
			let stdout = exec("git rev-parse --abbrev-ref HEAD")
			return stdout;
		},
		delete({ branch }) {
			exec(`git branch -D "${branch}"`);
		},
		list() {
			let stdout = exec(`git branch -a`)
			let lst = stdout.split(/[\n]+/).filter(i => i != "").map(i => i.replace(/[\s\*]+/, ""))
			return lst;
		},
		exists(name) {
			return this.list().indexOf(name) >= 0;
		}
	},
	reset({ hard }) {
		let opts = ""
		if (hard) {
			opts += " --hard";
		}
		exec("git reset" + opts)
	},
	add({ path }) {
		let opts = ""
		if (path) {
			opts += " " + path
		}
		exec("git add " + opts)
	}
	,
	commit({ msg, allowEmpty }) {
		let opts = ""
		if (allowEmpty) {
			opts += " --allow-empty"
		}
		exec(`git commit -m '${msg}'` + opts)
	},
	push({ remote, branch, setUpstream, force }) {
		let opts = ""
		if (setUpstream) {
			opts += " -u"
		}
		if (force) {
			opts += " -f"
		}
		if (remote) {
			opts += " " + remote
		}
		if (branch) {
			opts += " " + branch
		}
		exec("git push " + opts)
	},
	remote: {
		list() {
			let arr = [];
			exec("git remote -v").split(/\n(?!$)/).forEach(
				(i) => {
					arr.push(i.split(/\s+/)[0])
				}
			)
			return arr;
		}
	}
}

module.exports = { getOpts, Git, main };