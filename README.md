[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![a](https://img.shields.io/npm/v/github-pages-publisher)](https://www.npmjs.com/package/github-pages-publisher)

## What?

It offers a simple and transparent way to publish your web-resources to Github Pages. 

## User Story

- It's very inefficient to run many git commands per release,wishing the process to be simple.
- Every release makes the git repository huger and huger, wishing to publish an unhistorical branch for github-pages.

## How?

```
npm i -D github-pages-publisher
```

In the simplest scenario, we want to publish our web resources to the `gh-pages` branch. We can specify the path to the web resource using `-a` or `--assetsPath`. eg:

```
npx gp -a 'packages/web/dist'
```

You will see a worktree directory called `.gh-pages` created.Now the release is complete and you can try visiting your page.


Sometimes you want to customize some behavior, such as specifying the path to the working tree,or the name of the gh-pages branch. You can specify this through the following Settings:


```
-a,--assetsPath The path of the assets to be deployed to gh-pages branch.
-b,--branch	The branch where the "assetsPath" is located.(default is current branch)
-w,--worktreePath The Path to store the gh-pages worktree.(default is ".gh-pages" relative to "pwd")
-p,--pagesBranch The branch to deploy gh-pages.(default is "gh-pages")
-m,--commitMessage The commit message when it generated a committing for publishing.
-y,--yes Don't ask at each release.
```
