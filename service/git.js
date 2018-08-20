const fs       = require('fs-extra');
const { join } = require('path');
const chalk    = require('chalk');
const _        = require('lodash');
const shell    = require('shelljs');
const $util    = require('../service/util');
const moment   = require('moment');

const funcs     = ['release', 'hotfix', 'feature', 'update'];
const actions   = ['start', 'finish', 'merge'];
const brNames   = { master: 'master', release: 'rel/' };
const gitAction = {
    new   : 'git checkout -b',
    push  : 'git push origin',
    del   : 'git branch -D',
    co    : 'git checkout',
    merge : 'git merge',
};

const isInside = (source, target) => !!~source.indexOf(target);
const echo     = (msg, color) => console.log(!color ? msg : chalk[color](msg));
const isExist  = branchName => {
    echo('查看分支列表: ');
    let brStr = _.trimEnd(shell.exec(`git branch | grep "${branchName}"`).toString(), ' \n');
    let brExist = _.trim(brStr) === branchName;
    !brExist && echo('请输入已存在的分支名称.', 'red');
    return brExist;
};
const cmds      = {
    release: {
        start  : (program, branchName) => {
            let relName = `${brNames.release}${branchName}/${moment().format('YYYY-MM-DD')}`;
            shell.exec(`${gitAction.new} ${relName} && ${gitAction.push} ${relName}`);
            echo(`创建release分支: '${relName}'.`, 'green');
        },
        finish : (program, branchName) => {
            shell.exec(`${gitAction.co} master && ${gitAction.del} ${branchName} && ${gitAction.push} :${branchName}`);
            echo(`删除release分支: '${branchName}'.`, 'green');
        }
    },
    hotfix: {
        start  : (program, branchName) => {
            shell.exec(`${gitAction.new} hotfix/${branchName}`);
            echo(`创建hotfix分支: 'hotfix/${branchName}'`, 'green');
        },
        finish : (program, branchName) => {
            shell.exec(`${gitAction.co} master && ${gitAction.merge} ${branchName} ${program.DELETE ? `&& ${gitAction.del} ${branchName} && ${gitAction.push} :${branchName}` : '' }`);
            echo(`合并hotfix分支到master.`, 'green');
        }
    },
    featrue: {
        start  : (program, branchName) => {
            shell.exec(`${gitAction.new} feature/${branchName}`);
            echo(`创建feature分支: 'featrue/${branchName}'`, 'green');
        },
        finish : (program, branchName) => {
            shell.exec(`${gitAction.merge} ${branchName} ${program.DELETE ? `&& ${gitAction.del} ${branchName} && ${gitAction.push} :${branchName}` : '' }`);
            echo(`合并feature分支: '${branchName}'.`, 'green');
        }
    },
    update: {
        merge  : (program, branchName) => {
            shell.exec(`${gitAction.merge} ${branchName}`);
            echo(`已同步分支: '${branchName}', 注意处理可能存在的冲突.`, 'green');
        }
    }
};

const checkBranch = (func, action) => {
    echo('当前分支: ');
    let branch = _.trimEnd(shell.exec(`git branch | grep "*" | cut -c 3-`).toString(), '\n');
    let errorMsg = '';
    if((func === 'release' && action === 'new') || (func === 'hotfix' && action === 'start')) {
        errorMsg = branch === brNames.master ? '' : '请切换到master分支进行操作. ';
    } else if(func === 'feature') {
        errorMsg = _.startsWith(branch, brNames.release) ? '' : '请切换到相应的release分支进行操作. ';
    }
    !!errorMsg && echo(errorMsg, 'red');
    return !!errorMsg;
};

const git = function(program) {
    let { args } = program;
    let func = args[0], action = args[1], branchName = args[2];
    // 格式输入检测
    if (!isInside(funcs, func) || !isInside(actions, action) || !branchName) {
        echo('请正确输入命令: ', 'red');
        echo('    mri git [feature|release|hotfix] [start|finish|merge] 分支名称', 'cyan');
        return void 0;
    }
    // 分支检测
    if (checkBranch(func, action)) return void 0;
    echo('Begin to run git command.');

    let cmd = cmds[func][action];

    if (action === 'finish') {
        isExist(branchName) && cmd(program, branchName);
    } else {
        cmd(program, branchName);
    }
};

/**
    mri git
        release
            start   从master切分支出来并推送远程, 根据项目名+日期生成分支名称
                    mri git release new releaseName
            finish  删除当前release分支
                    mri git release del releaseName
        feature:
            start   从当前release中切分支,不推送远程
                    mri git feature start featureName
            finish  将分支合并回release分支, 删除该分支添加 -d 参数
                    mri git feature finish (-d) featureName
        hotfix:
            start   从master切取分支, 不推送远程
                    mri git hotfix start hotfixName
            finish  将分支合并回master分支, 删除该分支添加 -d 参数
                    mri git hotfix finish (-d) hotfixName

        update
            megre   合并其他分支到当前分支
                    mri git update merge branchName
**/

module.exports = git;
