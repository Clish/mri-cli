const _program = require('commander');
const _shell = require('shelljs');
const _ = require('lodash');
const _chalk = require('chalk');

const $git = require('../service/git');
const $root = require('../service/root');

module.exports = () => {
    let [theme, forceVersion = ''] = _.trim(_program.args[0] || '').split('::');
    let { force, start, ver } = _program;

    /**
     * 校正参数
     *
     * 如果使用快捷命令，
     * 则默认启动项目，并设定版本
     */
    if (forceVersion) {
        start = true;
        ver = forceVersion;
    }

    /**
     * 输入主题主题为空
     */
    if (!theme) {
        console.error('\n 请输入所要开release的theme名称');
        helper();
        return void 0;
    }

    /**
     * 输入主题不存在
     * 提醒使用强力模式
     */
    if (!force && !$root.getThemes(null, theme)) {
        console.error(`\n 输入的主题 -> ${theme}  不存在`);
        console.log(' 若确定仍需创建，请输入下列命令强力创建');
        console.warn('\n mri git release ${name} --force\n');

        return void 0;
    }

    /**
     * 没有启动项目, 提示当前theme已创建branch记录供参考
     */

    if (!start) {
        _shell.exec(`
        echo 下面列出本地和remote关于theme已创建的release信息
        echo 可根据下列信息，创建版本
        git branch -a | grep "release/${theme}"
        if [ $? -ne 0 ]; then
            echo ''
            echo '- 未查询到相关版本信息'
            echo ''
        fi 
    `);

        return void 0;
    }

    /**
     * 查看当前分支是否有文件没有提交
     */

    let status = _shell.exec(`git status | grep 'nothing to commit'`);
    if (!status.stdout) {
        console.error(_chalk.red`\n 当前分支有文件尚未提交stash或commit\n`);
        _shell.exec('git status');
        return void 0;
    }

    /**
     * 创建release
     */

    if (start) {
        if (!ver) {
            console.error(_chalk.red`\n 请输入当前release的版本号\n`);
            return void 0;
        }

        _shell.exec(`
        _branch=release/${theme}/v${ver}
        _master=master
        
        echo ""
        echo "**************************************"
        echo "* 正在创建 $_branch"     
        echo "* 并推送至远程 remote"     
        echo "**************************************"
        echo ""
        echo 注意:: release 是由 Master 分支创建  
        
        git checkout $_master
        git pull origin $_master
        git branch $_branch
        if [ $? -eq 0 ]; then
            git checkout $_branch
            git push origin $_branch
            git branch --set-upstream-to=origin/$_branch $_branch
        else
            echo ------------
            echo 该分支已创建
            echo ------------
            git checkout $_branch
        fi
    `);

        return void 0;
    }
};
