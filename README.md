[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![a](https://img.shields.io/npm/v/github-pages-publisher)](https://www.npmjs.com/package/github-pages-publisher)

## What?

A simple and transparent way to publish your web-resources to Github Pages. 

## User Story

- It's very inefficient to run many git commands per release,wish the process to be simple.
- Every release makes the git repository huge, wish to publish an unhistorical gh-pages branch.

## How to use?

```
npm i -D github-pages-publisher
```

In the simplest scenario, we want to publish our web resources to the `gh-pages` branch,  just need specifying the path to the web resource using `-a` or `--assetsPath`. eg:

```
npx gp -a 'packages/web/dist'
```

you will see a worktree directory called `.gh-pages` created,Now that the release is complete and you can try visiting your page.


Sometimes you want to customize some behavior, such as specifying the path to the working tree,or the name of the gh-pages branch. You can specify this through the following Settings:


```
-a,--assetsPath	The path of the assets to be deployed to gh-pages branch.
-b,--branch	The branch where the "assetsPath" is located.(default is current branch)
-w,--worktreePath The Path to store the gh-pages worktree.(default is ".gh-pages" relative to "pwd")
-p,--pagesBranch The branch to deploy gh-pages.(default is "gh-pages")
-m,--commitMessage The commit message when publish.
-y,--yes Don't ask at each release.
```
