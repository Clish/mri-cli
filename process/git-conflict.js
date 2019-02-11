const _program = require('commander');
const _shell = require('shelljs');
const _ = require('lodash');
const _chalk = require('chalk');

const $root = require('../service/root');
const $log = require('../lib/common/log');



module.exports = (helper) => {
    let branch = _program.args[0];
    let { force } = _program;

    if (!branch) {
        $log.error([
            '- 请指定需要解决冲突的主分支',
            '',
            _chalk.white('mri git conflict test'),
            _chalk.white('mri git conflict master'),
            '',
        ]);
        process.exit(0);
    }

    let currentBranch = _shell.exec(`git branch | grep "*" | cut -c 3-`, { silent: true });
    currentBranch = currentBranch.replace('\n', '');

    if (currentBranch === 'master' || currentBranch === 'test') {
        $log.error([`- 当前分支在主分支 => ${currentBranch}`, '- 不能操作主分支', '- 请切换至需要merge或解决冲突的分支']);
        process.exit(0);
    }

    let copy = `copy-${branch}/${currentBranch}`;

    $log.debug([
        '************************************************************************',
        '* 解决冲突conflict的基本步骤如下：',
        `* - 基于${branch}分支的最新代码创建临时副本 checkout -b ${copy}`,
        `* - 在临时副本${copy}中 merge 分支 ${currentBranch}`,
        `* - 在临时副本${copy}中, 产生的冲突，请手动解决`,
        `* - 解决冲突的临时副本${copy}，提交到远程origin`,
        `* - 在远程代码库 merge request ${copy} 到 ${branch}`,
        `* - 成功merge代码后，请删除临时副本分支`,
        _chalk.green`* - 千万别将 copy test 分支 merge 到 master`,
        '************************************************************************',
    ]);

    // force 模式先检查copy分支是否存在

    if (force) {
        _shell.exec(`
            git branch | grep '${copy}' | xargs git branch -D
            git branch -r | grep '${copy}' | cut -c 10- | xargs git push origin --delete
        `, { silent: true });
    }

    _shell.exec(`
        
        git pull origin ${currentBranch} 
        
        git checkout ${branch} 
        
        git pull origin ${branch}
       
        git checkout -b ${copy}
        
        if [ $? -ne 0 ]; then
            echo '-------'
            echo '该临时分支已存在, 请删除继续操作'
            echo '或使用'
            echo 'mri git conflict ${branch} --force'
            echo '强制创建临时分支'
            echo '-------'
            git checkout ${currentBranch}
            exit 0
        fi
        
        git push origin ${copy}:${copy}
        
        if [ $? -ne 0 ]; then
            echo '-------'
            echo '该临时分支已存在, 请删除继续操作'
            echo '或使用'
            echo 'mri git conflict ${branch} --force'
            echo '强制创建临时分支'
            echo '-------'
            git checkout ${currentBranch}
            exit 0
        fi
            
        git merge ${currentBranch}
        
        if [ $? -ne 0 ]; then
            echo ''
            echo '-------------------------------------------------------'
            echo '请手动解决冲突文件'
            echo '解决文件后将分支推送至远程' 
            echo 'git push origin ${copy}:${copy}'
            echo '在远程代码库提 merge request ${copy} 到 ${branch}',
            echo '-------------------------------------------------------'
            echo ''
        fi
    `);
};
