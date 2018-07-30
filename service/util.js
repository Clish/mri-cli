const _fse = require('fs-extra');
const _ = require('lodash');
const _path = require('path');
const _fs = require('fs');
const _moment = require('moment');
const _chalk = require('chalk');

const {log, error, debug} = console;
const {green, red, yellow, grey} = _chalk;

const babel = require('babel-core');


// const fs = require('fs');
// const babelConfig = JSON.parse(fs.readFileSync('/Users/Mizi/git/mri-cli/.babelrc'));
// require('babel-register')(babelConfig);

module.exports = {
    ifnvl(src, target) {
        return _.isNil(src) ? target : src;
    },

    run(condition, truefn, falsefn) {
        truefn = truefn || (() => void 0);
        falsefn = falsefn || (() => void 0);
        if(typeof condition === 'function') {
            condition = condition();
        }
        return condition ? truefn(condition) : falsefn();
    },

    loadjs(path) {
        try {
            let {code, map, ast} = babel.transformFileSync(path, {
                plugins: [
                    'add-module-exports',
                ],
                presets: [
                    'es2015'
                ]
            });

            return eval(code);

        } catch(e) {
            log(red`
                请安装相应包 babel-preset-es2015, add-module-exports
                npm i babel-preset-es2015@latest --save-dev
                npm i babel-plugin-add-module-exports@latest --save-dev
            `);
        }
        return void 0;
    },

    loadJSON(path) {
        return require(path);
    },

    getVersion(version) {
        return version.replace(/^.*?([0-9.\-b]*)$/g, '$1');
    },

    /**
     * 批量创建文件
     * @param arr
     * @param path
     * @return {*}
     */
    createDir(arr, path) {
        _.forEach(arr, (dir) => {
            path = _path.join(path, './' + dir);
            if(!_fs.existsSync(path)) {
                _fse.mkdirsSync(path);
            }
        });
        return path;
    },

    createComments(options) {
        let obj = {
            time: _moment()
                .format('YYYY/MM/DD HH:mm:ss')
        };
        let commentFile = _fs.readFileSync(_path.join(__dirname, '../template/comments'), {encoding: 'utf8'});
        let gitConfig = _fs.readFileSync(_path.join(process.cwd(), '.git/config'), {encoding: 'utf8'});

        _.forEach(['name', 'email'], (str) => {
            let regex = new RegExp(`${str}\\s*=\\s*(\\S.*)`);

            let matcher = gitConfig.match(regex);

            if(_.isNil(matcher) && str === 'name') {

                log(red('git中未设置个人信息'));

                log('根据下面命令配置信息');

                log(green('git config user.name uname'));

                log(green('git config user.email uemail'));

                return void 0;
            } else {
                matcher = matcher || [];
            }

            obj[str] = matcher[1] || '';
        });

        return _.template(commentFile)({...options, ...obj});
    }
};
