const _program = require('commander');
const _shell = require('shelljs');
const _chalk = require('chalk');
const _path = require('path');
const _fs = require('fs');
const _fse = require('fs-extra');
const _ = require('lodash');

const $root = require('../service/root');
const $util = require('../service/util');
const $log = require('../service/log');
const $template = require('../service/template');

module.exports = (branch, force, where) => {
    let infoPath = _path.join(process.cwd(), './.theme');
    let exist = _fs.existsSync(infoPath);
    let info = {};

    try {
        if (exist) {
            info = JSON.parse(_fs.readFileSync(infoPath, 'utf-8') || '{}');
        }
    } catch (e) {}

    let { branches = [] } = info;

    if (branches && branches.length && !where) {
        $log.debug('\n最近打开过的Branch: \n');
        _.each(branches, (branch, inx) => console.log(inx, branch));
        $log.log('');
    }

    if (branch) {
        // 区别输入为 branches index 或 branch name
        if (/^[0-9]{1,}$/.test(branch)) {
            branch = branches[branch];
            if (!branch) {
                $log.error('输入的branches index不存在');
                process.exit(0);
                return void 0;
            }
        }

        // 验证 branch 是否存在
        let validLocalBranch = _shell.exec(
            `
            git branch --list '${branch}'
        `,
            { silent: true },
        );

        let validRemoteBranch = _shell.exec(
            `
            git branch -r --list 'origin/${branch}'
        `,
            { silent: true },
        );

        if (validLocalBranch.replace(/\s/g, '')) {
            _shell.exec(`
                git checkout ${branch}
            `);
        } else if (validRemoteBranch.replace(/\s/g, '')) {
            _shell.exec(`
                git checkout -b ${branch}
            `);
        } else {
            $log.error(`\nbranch: ${branch} - 不存在，请确认输入\n`);
            process.exit(0);
            return void 0;
        }

        branches.unshift(branch);
        branches = _.uniq(branches);
        branches.slice(0, 20);
        info.branches = branches;
        _fse.outputFileSync(infoPath, JSON.stringify(info));
    }
};
