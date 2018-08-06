
const fs     = require('fs-extra');
const {join} = require('path');
const chalk  = require('chalk');
const _      = require('lodash');
const shell  = require('shelljs');
const $util  = require('../service/util');

const funcs   = ['feature', 'release', 'hotfix'];
const actions = ['start', 'finish'];

const isInside = (source, target) => !!~source.indexOf(target);

const git = function(program) {
    let { args } = program;
    let func = args[0], action = args[1], branchName = args[2];

    if(!isInside(funcs, args[0]) || !isInside(actions, args[1])) {
        console.log(chalk.red('Please use the correct way: '));
        console.log(chalk.cyan('    mri git [feature|release|hotfix] [start|finish] branchName'));
    }

    shell.exec(`git flow ${func} ${action} ${branchName}`);

    let gencName = `${func}/${branchName}`;

    // 推送远程
    if(action === 'start') {
        shell.exec(`git push origin ${gencName}`);
    }

    if(action === 'finish') {
        shell.exec(`git -r -d origin/${gencName} & git push origin :${gencName}`);
    }
};

module.exports = git;