const _fs = require('fs-extra');
const _path = require('path');
const _chalk = require('chalk');
const _ = require('lodash');
const _shell = require('shelljs');
const _program = require('commander');
const _join = _path.join;

const $util = require('./util');

class Upgrade {
    installSaves(saves) {
        let pkgs = this.getPkgs(saves, 'saves');
        if (pkgs.length) {
            pkgs = pkgs.join(' ');
            console.log(`安装包 --save ${pkgs}`);

            if (_program['debug']) {
                console.warn(_chalk.yellow`DEBUG 模式，暂不安装包`);
                return false;
            }

            if (_shell.which('yarn')) {
                _shell.exec(`
                    yarn add ${pkgs} 2> /dev/null
                `);
            } else {
                _shell.exec(`
                    npm i ${pkgs} --save 2> /dev/null
                `);
            }
        }
    }

    installDevs(devs) {
        let pkgs = this.getPkgs(devs, 'devs');
        if (pkgs.length) {
            pkgs = pkgs.join(' ');
            console.log(`安装包 --dev ${pkgs}`);

            if (_program['debug']) {
                console.warn(_chalk.yellow`DEBUG 模式，暂不安装包`);
                return false;
            }

            if (_shell.which('yarn')) {
                _shell.exec(`
                    yarn add ${pkgs} --dev 2> /dev/null
                `);
            } else {
                _shell.exec(`
                    npm i ${pkgs} --dev 2> /dev/null
                `);
            }
        }
    }

    installGlobals(globals) {
        let pkgs = this.getPkgs(globals, 'globals');
        if (pkgs.length) {
            pkgs = pkgs.join(' ');
            console.log(`安装包 -g ${pkgs}`);

            if (_program['debug']) {
                console.warn(_chalk.yellow`DEBUG 模式，暂不安装包`);
                return false;
            }

            if (_shell.which('yarn')) {
                _shell.exec(`
                    yarn global add ${pkgs} 2> /dev/null
                `);
            } else {
                _shell.exec(`
                    npm i ${pkgs} -g 2> /dev/null
                    if [ $? -ne 0 ]; then
                        echo 使用sudo安装全局包，需要输入密码
                        sudo npm i ${pkgs} -g
                    fi
                `);
            }
        }
    }

    getPkgs(pkgs, type) {
        let projectNodeModule = (name) => _join(process.cwd(), 'node_modules', name, 'package.json');
        let globalNodeModule = () => _join(__dirname, '../package.json');

        let pathMap = {
            saves: projectNodeModule,
            devs: projectNodeModule,
            globals: globalNodeModule,
        };

        let result = [];

        _.each(pkgs, (version, name) => {
            version = _.trim(version);
            let path = pathMap[type](name);
            let pkgname = `${name}@${version}`;

            if (_fs.existsSync(path)) {
                let pkg = $util.loadJSON(path);
                let ver = _.trim(pkg.version);

                // 只要本地版本与mri提供版本不一样
                // 本地包就必须重装
                if (version !== ver) {
                    result.push(pkgname);
                }
            } else {
                if (type === 'globals') {
                    console.log(
                        _chalk.red(
                            [
                                '需要使用下面命令手动安装全局包',
                                `yarn global add ${pathname} (推荐)`,
                                `或 npm i ${pathname} -g`
                            ].join(
                                '\n  ',
                            ),
                        ),
                    );
                    process.exit(0);
                } else {
                    result.push(pkgname);
                }
            }
        });

        return result;
    }

    install(path) {
        let config = $util.loadjs(path);
        let { saves, devs, globals } = config;
        this.installDevs(devs);
        this.installSaves(saves);
        this.installGlobals(globals);
    }
}

module.exports = new Upgrade();
