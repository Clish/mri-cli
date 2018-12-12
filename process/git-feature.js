const _program = require('commander');
const _shell = require('shelljs');
const _ = require('lodash');
const _chalk = require('chalk');

const $root = require('../service/root');
const $log = require('../service/log');

module.exports = (helper) => {
    let [name, version] = _.trim(_program.args[0] || '').split('::');
    let { start, remote, force } = _program;

    name = name || 'beta';

    if (version) {
        start = true;
    }

    /**
     * 程序开始
     */

    let branchGrep = `git branch | grep "*" | grep "release" | cut -c 3-`;

    /**
     * 查看当前的branch,
     * feature 只能在release下创建
     */

    let branch = _shell.exec(branchGrep, { silent: true}).stdout;
    branch = branch.replace(/\n/g, '');

    if (!branch) {
        console.error(_chalk.red(`\n feature只能在release分支下创建，当前分支不是release分支\n`));
        process.exit(0);
        return void 0;
    }

    /**
     * 查看该branch的feature的创建情况
     */
    if (!start) {
        _shell.exec(`
        _branch=${branch.replace(/^release/, 'feature')}
        
        echo ""
        echo "请使用 mri git feature [name::version] 创建release"
        echo "name 可忽略"
        echo ""
        
        echo "下列为该 ${branch} 的feature信息"
        git branch -a | grep $_branch || echo '- 未查询到相关版本信息'
    `);

        return void 0;
    }

    /**
     * 创建分支信息
     */
    if (start) {
        let featureBranch = `${branch.replace('release', 'feature')}-${name}.${version}`;

        _shell.exec(`
         _feature=${featureBranch}
         git pull origin ${branch}
         git branch ${featureBranch}
         if [ $? -eq 0 ]; then
            git checkout $_feature
            ${remote ? 'git push origin $_feature' : ''}
            ${remote ? 'git branch --set-upstream-to=origin/$_feature $_feature' : ''}
            git checkout $_feature
        else
            echo ------------
            echo 该分支已创建
            echo ------------
            git checkout $_feature
        fi
    `);

        return void 0;
    }

};
