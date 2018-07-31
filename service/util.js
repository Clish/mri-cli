const _fse = require('fs-extra');
const _ = require('lodash');
const _path = require('path');
const _fs = require('fs');
const _moment = require('moment');
const _chalk = require('chalk');

const {log, error, debug} = console;
const {green, red, yellow, grey} = _chalk;

const babel = require('@babel/core');

const _ts = require('typescript');

const _eval = require('eval');

const babelParser = require("@babel/parser");

require("@babel/polyfill");

// require("@babel/register")({
//     extensions: [".ts", ".tsx", ".jsx", ".js"],
// });


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

        console.debug('oooooOooo', path);

        // console.dir(_ts);

        try {

            // console.debug(  );


            let {code, map, ast} = babel.transformFileSync(path, {

                babelrc: false,

                plugins: [
                    require.resolve('@babel/plugin-transform-typescript'),
                    require.resolve('@babel/plugin-syntax-typescript'),
                    '@babel/plugin-syntax-dynamic-import',
                    '@babel/plugin-proposal-object-rest-spread',
                    '@babel/plugin-proposal-optional-catch-binding',
                    '@babel/plugin-proposal-async-generator-functions',
                    ['@babel/plugin-proposal-decorators', { legacy: true }],
                    ['@babel/plugin-proposal-class-properties', { loose: true }],
                    '@babel/plugin-proposal-export-namespace',
                    '@babel/plugin-proposal-export-default',
                    '@babel/plugin-proposal-export-namespace-from',
                    '@babel/plugin-proposal-export-default-from',
                    '@babel/plugin-proposal-nullish-coalescing-operator',
                    '@babel/plugin-proposal-optional-chaining',
                    '@babel/plugin-proposal-do-expressions',
                    '@babel/plugin-proposal-function-bind',
                    '@babel/plugin-transform-modules-commonjs',
                    'add-module-exports',
                    [
                        "module-resolver",
                        {
                            "extensions": [
                                ".js",
                                ".jsx",
                                ".ts",
                                ".tsx"
                            ],
                            "root": [
                               './src',
                            ]
                        }
                    ],
                ],
                presets: [
                    require.resolve('@babel/preset-typescript'),
                    [require.resolve('@babel/preset-env'), {
                        exclude: [
                            'transform-typeof-symbol',
                            'transform-unicode-regex',
                            'transform-sticky-regex',
                            'transform-object-super',
                            'transform-new-target',
                            'transform-modules-umd',
                            'transform-modules-systemjs',
                            'transform-modules-amd',
                            'transform-literals',
                            'transform-duplicate-keys',
                        ],
                        "modules": "commonjs",
                        "useBuiltIns": "usage",
                        "targets": {
                            "node": "current"
                        }
                    }],

                    require.resolve('@babel/preset-react'),
                ]
            });

            console.debug(eval(code));

           //  let codeB = _fs.readFileSync(path, 'utf8');
           //
           //  codeB = codeB.replace('src/theme/const-env.mri', '/Users/Mizi/git/mri/src/theme/const-env.mri.ts');
           //
           // let compilerOptions = {
           //      noEmitOnError: true,
           //      noImplicitAny: true,
           //      target: _ts.ScriptTarget.ES5,
           //      module: _ts.ModuleKind.CommonJS,
           //      sourceMap: true,
           //      allowSyntheticDefaultImports: true,
           //      isolatedModules: true,
           //      allowJs: true
           //  };


            // let cc = _ts.transpile(codeB, {
            //     compilerOptions: {
            //         noEmitOnError: true,
            //         noImplicitAny: true,
            //         target: _ts.ScriptTarget.ES5,
            //         module: _ts.ModuleKind.CommonJS,
            //         sourceMap: true,
            //         allowSyntheticDefaultImports: true,
            //         isolatedModules: true,
            //         allowJs: true
            //
            //     }
            // });
            //
            // let dd = _ts.transform(codeB, {
            //     compilerOptions: {
            //         noEmitOnError: true,
            //         noImplicitAny: true,
            //         target: _ts.ScriptTarget.ES5,
            //         module: _ts.ModuleKind.CommonJS,
            //         sourceMap: true,
            //         allowSyntheticDefaultImports: true,
            //         isolatedModules: true,
            //         allowJs: true
            //
            //     }
            // });
            //
            // console.log(dd);
            //
            // codeB = cc;

            // console.log(codeB);

            // console.log('\n\n\n\n\n\n\n\n', cc);

            // console.debug('----', eval(codeB));





            // let {TypescriptParser} = require('typescript-parser');
            //
            // // console.debug(TypescriptParser);
            //
            //
            // const parser = new TypescriptParser();
            //
            // // either:
            // const parsed = parser.parseFile(path);
            //
            // console.debug('-------', parsed);
            //
            // parsed.then((a, b) => {
            //     console.log(a, b);
            // })



            // let aa = babelParser.parse(code, {
            //     plugins: [
            //         "typescript",
            //     ]
            // });
            //
            // console.log('ooOooOoo', aa);

            // code = code.replace('src/theme/const-env.mri', '/Users/Mizi/git/mri/src/theme/const-env.mri.ts');

            // console.log( (code), '\n\n\n\n', _path.join(process.cwd(), './src'));

            // console.log( eval(code) );

            return eval(code);

        } catch(e) {

            console.log('\n\n------------\n\n');

            console.log(e);

            log(red`
                请安装相应包 babel-preset-typescript, babel-preset-es2015, add-module-exports
                npm i babel-preset-typescript@latest --save-dev
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
