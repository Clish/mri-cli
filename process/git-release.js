const _program = require('commander');
const _shell = require('shelljs');
const _ = require('lodash');
const _chalk = require('chalk');

const $root = require('../service/root');
const $log = require('../lib/common/log');

module.exports = (type = 'release', helper) => {
    let [theme, version] = _.trim(_program.args[0] || '').split('::');
    let { force } = _program;

    /**
     * 查看当前分支是否有文件没有提交
     */
    let status = _shell.exec(`git status | grep 'nothing to commit' 1>/dev/null 2>&1`);
    if (status.code) {
        $log.error(`\noOo 当前分支有文件尚未提交stash或commit\n`);
        _shell.exec('git status');
        process.exit(0);
        return void 0;
    }

    /**
     * 输入主题主题为空
     */
    if (!theme) {
        $log.error(`\n- 请输入所要创建的${type}的theme::version`);
        $log.log(`\n    mri git ${type} theme::version`);
        helper && helper();
        process.exit(0);
        return void 0;
    }

    /**
     * 输入主题不存在
     * 提醒使用强力模式
     */
    if (!force && !$root.getThemes(null, theme)) {
        $log.error(`\noOo 输入的主题 -> ${theme}  不存在`);
        $log.log('\n 若确定仍需创建，请输入下列命令强力创建');
        $log.log(`\n mri git ${type} ${theme}::0.0.1 --force\n`);

        process.exit(0);
        return void 0;
    }

    /**
     * 没有启动项目, 提示当前theme已创建branch记录供参考
     */
    if (!version) {
        $log.error(`\noOo 版本信息不存在\n`);
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
     * 版本检测
     */
    let newVersion = version.split('.');
    let [x, y, z, w] = newVersion;

    if (!z || w) {
        $log.error(
            `\noOo 当前输入的${type}版本为 ${version}`,
            `不符合x.y.z的命名规则`,
            `具体规则，查看 https://github.com/amily4555/MasterRT/issues/97 `,
        );
        process.exit(0);
        return void 0;
    }

    if (type === 'hotfix') {
        if (!+z) {
            $log.error(
                `\noOo 当前输入的hotfix版本为 ${version}`,
                `不符合x.y.z的hotfix命名规则, hotfix version z 不可为 0, 应该从1起自增长`,
                `具体规则，查看 https://github.com/amily4555/MasterRT/issues/97 `,
                _chalk.white(`---------`),
                _chalk.white(`也许下列是你想要的`),
                _chalk.white(`- mri git hotfix ${theme}::${[x, y, 1].join('.')}`),
            );
            process.exit(0);
            return void 0;
        }
    } else {
        if (+z) {
            $log.error(
                `\noOo 当前输入的release版本为 ${version}`,
                `不符合x.y.z的release命名规则, release version z 为 0, y 自增长`,
                `具体规则，查看 https://github.com/amily4555/MasterRT/issues/97 `,
                _chalk.white(`---------`),
                _chalk.white(`也许下列是你想要的`),
                _chalk.white(`- mri git release ${theme}::${[x, y || 1, 0].join('.')}`),
                _chalk.white(`- mri git release ${theme}::${[x, +y + 1, 0].join('.')}`),
            );
            process.exit(0);
            return void 0;
        }
    }


    /**
     * theme::version 都存在
     * - 判断 git tag -l '{theme}*{version}' 是否存在
     */
    _shell.exec('git fetch 1>/dev/null 2>&1');
    if (!_shell.exec(`git tag -l '${theme}*${version}' | grep -q '${theme}.*${version}'`).code) {
        $log.error(`\noOo tag ${theme}_v${version} 已创建`);

        if (type === 'hotfix') {
            newVersion[1] = parseFloat(newVersion[1]) + 1;
            newVersion[2] = 0;
        } else if (type === 'release') {
            newVersion[2] = parseFloat(newVersion[2]) + 1;
        }
        $log.log(`\n- 请提高当前版本号，如 mri git ${type} ${theme}::${newVersion.join('.')}\n`);
        process.exit(0);
        return void 0;
    }

    /**
     * 判断该版本是否存在
     */
    let branch = `${type}/${theme}/v${version}`;
    if (branch) {
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
