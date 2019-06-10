const _fse = require('fs-extra');
const _ = require('lodash');
const _path = require('path');
const _fs = require('fs');
const _moment = require('moment');
const _chalk = require('chalk');
const _spawn = require('cross-spawn');
const _which = require('which');
const _shell = require('shelljs');
const _babel = require('@babel/core');
const _program = require('commander');
const _prettier = require('prettier');
const _compareVersion = require('compare-versions');

const { log, error, debug } = console;
const { green, red, yellow, grey } = _chalk;

const MC = require('./constant');

module.exports = {
    bash(bin, args) {
        if (_fs.existsSync(bin)) {
            const sp = _spawn(bin, args, { stdio: 'inherit' });
            sp.on('close', (code) => {
                process.exit(code);
            });
        } else {
            log(`- ${bin} 文件不存在`);
        }
    },

    /**
     * 版本比较
     * type: max, min
     */
    compareVersions(source, target, type) {
        let rst = _compareVersion(source, target);
        let values = rst === 1 ? [source, target] : [target, source];
        return _.isNil(type) ? rst : type === 'max' ? values[0] : values[1];
    },

    /**
     * 检查路径是否存在
     * @param path
     * @return {boolean}
     */
    existPath(path, local) {
        let fullpath = _path.join(local ? '' : process.cwd(), path);
        return _fs.existsSync(fullpath);
    },

    /**
     * 判断当前地址是否为项目的根目录
     * @param path
     * @return {boolean}
     */
    judgeRoot(path = process.cwd()) {
        let status = false;
        let files = _fs.readdirSync(path);

        if (files && files.length > 0) {
            let matchTime = 0;
            _.each(files, (name) => {
                if (MC.ROOT_JUDGE[name]) {
                    matchTime++;
                }

                if (matchTime === _.size(MC.ROOT_JUDGE)) {
                    status = true;
                    return false;
                }
            });
        }
        return status;
    },

    /**
     * 获得当前项目所在的根目录
     * @param path
     * @return {string}
     */
    getRoot(path = process.cwd()) {
        if (!this.judgeRoot(path)) {
            let path2 = _path.join(path, '..');
            if (path2 === path) {
                console.log(_chalk.red('当前路径错误'));
                return void 0;
            } else {
                return this.getRoot(path2);
            }
        } else {
            return path;
        }
    },

    npmCmd(args, fn) {
        let npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
        console.log(green(`npm ${args.join(' ')}`));
        this.runCmd(_which.sync(npm), args, fn);
    },

    runCmd(cmd, args, fn) {
        let runner = _spawn(cmd, args, { stdio: 'inherit' });
        runner.on('close', (code) => {
            fn && fn(code);
        });
    },

    /**
     * 数组模式
     * @param value
     * @return {*[]}
     */
    upArray(value) {
        let rst = _.isArray(value) ? value : [value];
        return _.compact(rst);
    },

    /**
     * type = async, sync
     */
    mri() {
        const mri = _program['mri'];
        return typeof mri === 'string' ? mri : mri ? '/home/master/node_modules/node/bin/mri' : 'mri';

        // console.debug(command, type, _shell.which('mri || '));
        // _which('mricccc', (error) => {
        //     console.debug('ooOoooOOooOoooo');
        //     if (error) {
        //         if(type === 'async') {
        //             _spawn('/home/master/node_modules/node/bin/mri', command, { stdio: "inherit" });
        //         } else {
        //             _shell.exec(`/home/master/node_modules/node/bin/mri ${command}`);
        //         }
        //     } else {
        //         if(type === 'async') {
        //             _spawn('mri', command, { stdio: "inherit" });
        //         } else {
        //             _shell.exec(`
        //                 echo mri ${command}
        //                 mri ${command}
        //             `);
        //         }
        //     }
        // });
    },

    pascalNaming(str) {
        return _.flow([_.camelCase, _.upperFirst])(str);
    },

    camelNaming(str) {
        return _.flow([_.camelCase])(str);
    },

    loadjs(path) {
        if (!_fs.existsSync(path)) {
            return void 0;
        }

        // 支持es6语法
        try {
            let { code, map, ast } = _babel.transformFileSync(path, {
                babelrc: false,
                presets: [[require('@babel/preset-env')], [require('@babel/preset-react')]],
            });
            return eval(code);
        } catch (e) {
            console.log('\n\n------------\n\n');
            console.log(`${path} load fail`);
            console.log(e);
        }

        return void 0;
    },

    getFiles(filePath) {
        let files_ = [];
        let files = _fs.readdirSync(filePath);
        files.forEach((filename) => {
            let filedir = _path.join(filePath, filename);
            let stats = _fs.statSync(filedir);
            if (stats.isFile()) {
                // 读取文件内容
                // var content = fs.readFileSync(filedir, 'utf-8');
                files_.push({
                    filedir,
                    filePath,
                    filename,
                });
            }
            if (stats.isDirectory()) {
                let files__ = this.getFiles(filedir);
                files_ = files_.concat(files__);
            }
        });

        return files_;
    },

    /***
     * ---------------------
     * Git Branch Method
     * ---------------------
     */

    /**
     * 获取当前分支名称
     */
    getBranch() {
        let stdio = _shell.exec(`git branch | grep '*' | cut -c 3-`, { silent: true });
        return stdio.stdout.replace('\n', '');
    },

    isDevBranch() {
        let branch = this.getBranch();
        return branch !== 'master' && branch !== 'test';
    },

    // loadts(path) {
    //
    //     try {
    //
    //         let {code, map, ast} = babel.transformFileSync(path, {
    //
    //             babelrc: false,
    //
    //             plugins: [
    //                 require.resolve('@babel/plugin-transform-typescript'),
    //                 require.resolve('@babel/plugin-syntax-typescript'),
    //                 '@babel/plugin-syntax-dynamic-import',
    //                 '@babel/plugin-proposal-object-rest-spread',
    //                 '@babel/plugin-proposal-optional-catch-binding',
    //                 '@babel/plugin-proposal-async-generator-functions',
    //                 ['@babel/plugin-proposal-decorators', { legacy: true }],
    //                 ['@babel/plugin-proposal-class-properties', { loose: true }],
    //                 '@babel/plugin-proposal-export-namespace',
    //                 '@babel/plugin-proposal-export-default',
    //                 '@babel/plugin-proposal-export-namespace-from',
    //                 '@babel/plugin-proposal-export-default-from',
    //                 '@babel/plugin-proposal-nullish-coalescing-operator',
    //                 '@babel/plugin-proposal-optional-chaining',
    //                 '@babel/plugin-proposal-do-expressions',
    //                 '@babel/plugin-proposal-function-bind',
    //                 '@babel/plugin-transform-modules-commonjs',
    //                 'add-module-exports',
    //                 [
    //                     "module-resolver",
    //                     {
    //                         "extensions": [
    //                             ".js",
    //                             ".jsx",
    //                             ".ts",
    //                             ".tsx"
    //                         ],
    //                         "root": [
    //                            './src',
    //                         ]
    //                     }
    //                 ],
    //             ],
    //             presets: [
    //                 require.resolve('@babel/preset-typescript'),
    //                 [require.resolve('@babel/preset-env'), {
    //                     exclude: [
    //                         'transform-typeof-symbol',
    //                         'transform-unicode-regex',
    //                         'transform-sticky-regex',
    //                         'transform-object-super',
    //                         'transform-new-target',
    //                         'transform-modules-umd',
    //                         'transform-modules-systemjs',
    //                         'transform-modules-amd',
    //                         'transform-literals',
    //                         'transform-duplicate-keys',
    //                     ],
    //                     "modules": "commonjs",
    //                     "useBuiltIns": "usage",
    //                     "targets": {
    //                         "node": "current"
    //                     }
    //                 }],
    //
    //                 require.resolve('@babel/preset-react'),
    //             ]
    //         });
    //
    //         return eval(code);
    //
    //     } catch(e) {
    //
    //         console.log('\n\n------------\n\n');
    //         console.log(`${path} load fail`);
    //
    //         console.log(e);
    //
    //         // log(red`
    //         //     请安装相应包 babel-preset-typescript, babel-preset-es2015, add-module-exports
    //         //     npm i babel-preset-typescript@latest --save-dev
    //         //     npm i babel-preset-es2015@latest --save-dev
    //         //     npm i babel-plugin-add-module-exports@latest --save-dev
    //         // `);
    //     }
    //     return void 0;
    // },

    loadJSON(path, isCatch) {
        try {
            return require(path);
        } catch (e) {
            if (!isCatch) {
                return {};
            }

            throw new Error(e);
        }
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
            if (!_fs.existsSync(path)) {
                _fse.mkdirsSync(path);
            }
        });
        return path;
    },

    createComments(options) {
        let obj = {
            time: _moment().format('YYYY/MM/DD HH:mm:ss'),
        };
        let commentFile = _fs.readFileSync(_path.join(__dirname, '../template/comments'), { encoding: 'utf8' });
        let gitConfig = _fs.readFileSync(_path.join(process.cwd(), '.git/config'), {
            encoding: 'utf8',
        });

        _.forEach(['name', 'email'], (str) => {
            let regex = new RegExp(`${str}\\s*=\\s*(\\S.*)`);

            let matcher = gitConfig.match(regex);

            if (_.isNil(matcher) && str === 'name') {
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

        return _.template(commentFile)({ ...options, ...obj });
    },

    /**
     * 删除文本内容中的备注
     * @param info
     * @return {*}
     */
    removeComments(info) {
        let reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)/g;
        return info.replace(reg, function(word) {
            // 去除注释后的文本
            return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? '' : word;
        });
    },

    /**
     * 获得所有的themes
     * @return {Array}
     */
    getThemes() {
        let themePath = _path.join(process.cwd(), './src/project');
        let files = _fs.readdirSync(themePath);
        let themes = [];

        _.forEach(files, (filename) => {
            let filePath = _path.join(themePath, filename);
            let fsStats = _fs.statSync(filePath);
            if (fsStats.isDirectory()) {
                themes.push(filename);
            }
        });

        return themes;
    },

    /**
     * 获得 .project 文件信息
     */
    getThemeInfo(fn) {
        let infoPath = _path.join(process.cwd(), './.project');

        if (_fs.existsSync(infoPath)) {
            try {
                return JSON.parse(_fs.readFileSync(infoPath, 'utf-8') || '{}');
            } catch (e) {
                fn && fn(e);
                return {};
            }
        } else {
            fn && fn();
            return {};
        }
    },

    setThemeInfo(info) {
        let infoPath = _path.join(process.cwd(), './.project');
        let content = JSON.stringify(info);
        content = _prettier.format(content, { semi: false, parser: 'json' });
        _fse.outputFileSync(infoPath, content);
    },

    /**
     * 获得shell.exec结果简约方式
     * @param command
     * @return {*}
     */
    execSimple(command) {
        let result = _shell.exec(command, { silent: true });
        return result.replace(/^(\s|\n){0,}/g, '').replace(/(\s|\n){0,}$/g, '');
    },

    execSilent(command) {
        return _shell.exec(command, { silent: true });
    },

    isNothingCommit() {
        let stdout = _shell.exec(`git status | grep 'nothing to commit'`);
        return !stdout.code;
    },

    /**
     * 获得所有项目
     */
    getProjects() {
        let projectPath = _path.join(process.cwd(), MC.PATH_PROJECTS);
        let files = _fs.readdirSync(projectPath);
        let projects = [];

        _.forEach(files, (filename) => {
            let filePath = _path.join(projectPath, filename);
            let fsStats = _fs.statSync(filePath);
            if (fsStats.isDirectory()) {
                projects.push(filename);
            }
        });

        if (projects.length) {
            projects = _.sortBy(projects);
        }

        return projects;
    },

    stringFormat(str, format) {
        return str.replace(/\{(.*?)\}/g, function(m, i) {
            let value = _.get(format, i);
            return _.isNil(value) ? m : value;
        });
    },
};
