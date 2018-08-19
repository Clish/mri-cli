const fs       = require('fs-extra');
const { join } = require('path');
const chalk    = require('chalk');
const _        = require('lodash');
const shell    = require('shelljs');
const $util    = require('../service/util');

const funcs   = ['feature', 'release', 'hotfix'];
const actions = ['start', 'finish', 'new', 'del'];

const isInside = (source, target) => !!~source.indexOf(target);

const checkBranch = func => {
    console.log('Current branch: ');
    let branch = _.trimEnd(shell.exec(`git branch | cut -c 3-`).toString(), '\n');
    let errorMsg = '';
    if (func === 'release' || func === 'hotfix') {
        errorMsg = branch === 'master' ? '' : 'Please checkout to master branch then try again. ';
    } else {
        errorMsg = _.startsWith(branch, 'rel-') ? '' : 'Please checkout to release branch then try again. ';
    }
    !!errorMsg && console.log(chalk.red(errorMsg));
    return !!errorMsg;
};

const releaseExec = (action, branchName) => {
    console.log(action, branchName);
};
const hotfixExec  = (action, branchName) => {
    console.log(action, branchName);
};
const featureExec = (action, branchName) => {
    console.log(action, branchName);
};

const git = function(program) {
    let { args } = program;
    let func = args[0], action = args[1], branchName = args[2];
    // 格式输入检测
    if (!isInside(funcs, func) || !isInside(actions, action)) {
        console.log(chalk.red('Please use the correct way: '));
        console.log(chalk.cyan('    mri git [feature|release|hotfix] [start|finish|new|del] branchName'));
        return void 0;
    }
    // 分支检测
    if (checkBranch(func)) return void 0;

    switch (func) {
        case 'release':
            releaseExec(action, branchName);
            break;
        case 'hotfix':
            hotfixExec(action, branchName);
            break;
        case 'feature':
            featureExec(action, branchName);
            break;
    }
};

/**
    mri git
        release
            new     从master切分支出来并推送远程, 根据项目名+日期生成版本号
                    mri git release new releaseName
            del     删除当前release分支
                    mri git release del releaseName
        branch:
            start   从当前release中切分支,不推送远程
            finish  将分支合并回release分支并删除该分支
        hotfix:
            start   从master切分支出来, 不推送远程
            finish  将分支合并回master并删除该分支
**/

// const git = function(program) {
//     let { args } = program;
//     let func = args[0], action = args[1], branchName = args[2];

//     if(!isInside(funcs, args[0]) || !isInside(actions, args[1])) {
//         console.log(chalk.red('Please use the correct way: '));
//         console.log(chalk.cyan('    mri git [feature|release|hotfix] [start|finish] branchName'));
//     }

//     shell.exec(`git flow ${func} ${action} ${branchName}`);

//     let gencName = `${func}/${branchName}`;

//     // 推送远程
//     if(action === 'start') {
//         shell.exec(`git push origin ${gencName}`);
//     }

//     if(action === 'finish') {
//         shell.exec(`git -r -d origin/${gencName} & git push origin :${gencName}`);
//     }
// };

module.exports = git;
