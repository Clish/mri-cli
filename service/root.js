const _fs = require('fs');
const _ = require('lodash');
const _path = require('path');
const _chalk = require('chalk');
const _shell = require('shelljs');

const $log = require('../lib/common/log');

class Root {
    /**
     * @deprecated
     */
    judgeRoot(
        path = process.cwd(),
        judges = {
            node_modules: 1,
            '.git': 1,
        },
    ) {
        let status = false;
        let files = _fs.readdirSync(path);

        if (files && files.length > 0) {
            let matchTime = 0;
            _.each(files, (name) => {
                if (judges[name]) {
                    matchTime++;
                }

                if (matchTime === _.size(judges)) {
                    status = true;
                    return false;
                }
            });
        }
        return status;
    }

    getRoot(path) {
        path = path || process.cwd();
        if (!this.judgeRoot(path)) {
            let path2 = _path.join(path, '..');
            if (path2 === path) {
                // console.debug( new Error('--'))
                console.log(_chalk.red('- 当前路径错误'));
                return void 0;
            } else {
                return this.getRoot(path2);
            }
        } else {
            return path;
        }
    }

    getThemes(path, theme) {
        let themePath = _path.join(this.getRoot(path), './src/project');

        if (!_fs.existsSync(themePath)) {
            return void 0;
        }

        let files = _fs.readdirSync(themePath);
        let themes = [];

        _.forEach(files, (filename) => {
            let filePath = _path.join(themePath, filename);
            let fsStats = _fs.statSync(filePath);

            if (fsStats.isDirectory()) {
                !theme && console.log(`   - ${filename}`);
                themes.push(filename);
            }
        });

        return theme ? _.find(themes, (v) => v === theme) : themes;
    }

    printProjects(theme) {
        let themePath = _path.join(this.getRoot(), './src/project');
        let files = _fs.readdirSync(themePath);

        if (files) {
            console.log(_chalk.yellow(`\n   MRI PROJECTS`));
        }

        _.forEach(files, (filename) => {
            let filePath = _path.join(themePath, filename);
            let fsStats = _fs.statSync(filePath);

            if (fsStats.isDirectory()) {
                if (theme === filename) {
                    console.log(_chalk.green(`   - ${filename}`));
                } else {
                    console.log(`   - ${filename}`);
                }
            }
        });
    }

    inRoot(command) {
        let path = this.getRoot();
        path &&
            _shell.exec(`
            cd ${path}
            ${command}
        `);
    }

    /**
     * @deprecated
     */
    run(fn) {
        let isRoot = this.judgeRoot();
        if (isRoot) {
            fn && fn();
        } else {
            let path = this.getRoot();
            $log.error(['- 当前路径错误，请切换到项目根目录进行操作', path ? _chalk.white(`\n  cd ${path}\n`) : '']);
        }
    }
}

let $root = new Root();

module.exports = $root;
