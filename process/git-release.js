const _program = require('commander');
const _shell = require('shelljs');
const _ = require('lodash');
const _chalk = require('chalk');

const $root = require('../service/root');

module.exports = (type = 'release', helper) => {
    let [theme, version] = _.trim(_program.args[0] || '').split('::');
    let { force } = _program;

    /**
     * 输入主题主题为空
     */
    if (!theme) {
        console.error(_chalk.red(`\n   请输入所要创建的${type}的theme::version\n`));
        console.log(`   mri git ${type} theme::version`);
        helper && helper();
        process.exit(0);
        return void 0;
    }

    /**
     * 输入主题不存在
     * 提醒使用强力模式
     */
    if (!force && !$root.getThemes(null, theme)) {
        console.error(`\n 输入的主题 -> ${theme}  不存在`);
        console.log(' 若确定仍需创建，请输入下列命令强力创建');
        console.warn(`\n mri git ${type} ${theme}::0.0.1 --force\n`);

        process.exit(0);
        return void 0;
    }

    /**
     * 没有启动项目, 提示当前theme已创建branch记录供参考
     */

    if (!version) {
        console.error(_chalk.red`\n  版本信息不存在\n`);
        _shell.exec(`
            echo 下面列出本地和remote关于theme已创建的${type}信息
            echo 可根据下列信息，创建版本
            git branch -a | grep "release/${theme}"
            if [ $? -ne 0 ]; then
                echo ''
                echo '- 未查询到相关版本信息'
                echo ''
            fi 
        `);

        process.exit(0);
        return void 0;
    }

    /**
     * hotfix 的版本号格式为 ${release-version}-rc.{hotfix-version}
     */
    if(type === 'hotfix') {
        if(!/-rc\.+\d{1,}$/.test(version)){
            console.error(_chalk.red(`\n    没有hotfix的版本号`));
            console.error(_chalk.white(`\n    如 mri git hotfix ${theme}::${version}-rc.1\n`));

            _shell.exec(`
                _branch=hotfix/${theme}/v${version}
                echo "\* 下列为该 $_branch 的${type}信息"
                echo ""
                git branch -a | grep $_branch || echo '- 未查询到相关版本信息'
                echo ""
            `);

            process.exit(0);
            return void 0;
        }
    }


    /**
     * 查看当前分支是否有文件没有提交
     */
    let status = _shell.exec(`git status | grep 'nothing to commit' 1>/dev/null 2>&1`);
    if (status.code) {
        console.error(_chalk.red`\n 当前分支有文件尚未提交stash或commit\n`);
        console.log(_chalk.white`- run::git status\n`);
        _shell.exec('git status');
        process.exit(0);
        return void 0;
    }

    /**
     * 判断该版本是否存在
     */
    let branch = `${type}/${theme}/v${version}`;

    if(branch) {
        let status = _shell.exec(`git tag -l '${theme}.*' | grep -q '[._]v${version}'`);
        if (!status.code) {
            console.error(_chalk.red(`\n- 该版本TAGS已存在\n`));
            _shell.exec(`
                echo - git tag
                echo ""
                git tag -l '${theme}[._]v${version}'
                echo "-----"
                git tag -l '${theme}[._]v*'
                echo ""
            `);
            process.exit(0);
            return void 0;
        }

        status = _shell.exec(`git branch | grep -q '${branch}'`);

        if (!status.code) {
            console.error(_chalk.red(`\n- 需要创建[${branch}]已存在\n`));
            _shell.exec(`
                echo - git branch
                echo ""
                git branch -a --list '*${branch}'
                echo "-----"
                git branch -a --list '*${type}/${theme}*'
                echo ""
            `);
            process.exit(0);
            return void 0;
        }
    }



    /**
     * 创建release
     */
    _shell.exec(`
        _branch=${type}/${theme}/v${version}
        _master=master
        
        echo ""
        echo "**************************************"
        echo "* 正在创建 $_branch"     
        echo "* 并推送至远程 remote"     
        echo "**************************************"
        echo ""
        echo 注意:: ${type} 是由 Master 分支创建  
        
        git checkout $_master
        git pull origin $_master
        git branch $_branch
        if [ $? -eq 0 ]; then
            git checkout $_branch
            git push origin $_branch
            git branch --set-upstream-to=origin/$_branch $_branch
        else
            echo ------------------
            echo "该分支(版本)已创建"
            echo ------------------
        fi
    `);

    process.exit(0);
};
