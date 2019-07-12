const _program = require('commander');
const _path = require('path');
const _join = _path.join;
const _ = require('lodash');

const _which = require('which');
const _shell = require('shelljs');
const _spawn = require('cross-spawn');
const _chalk = require('chalk');
const _fs = require('fs');
const _fse = require('fs-extra');

const MC = require('../../common/constant');
const $template = require('../../../lib/common/template');
const $log = require('../../../lib/common/log');
const $util = require('../../../lib/common/util');
const $mritemp = require('../../../lib/common/mritemp');
const $load = require('../../../lib/common/load');

/**
 * 系统调优
 */
class Tuning {
    getMtime(path) {
        let stat = _fs.statSync(path);
        let mtime = stat.mtimeMs;

        if (stat.isFile()) {
            return mtime;
        }

        let files = _fs.readdirSync(path);

        if (files.length === 0) {
            return mtime;
        }

        let mtimes = _.map(files, (file) => _fs.statSync(_join(path, file)).mtimeMs);
        mtimes.push(mtime);
        return _.max(mtimes);
    }

    compareMtime(path, key) {
        let prev = $mritemp.read(key) || 0;
        let current = this.getMtime(path);
        return current > prev ? current : false;
    }

    /**
     * 生成index.ts文件
     * @param path
     * @param targetPath
     * @param func
     */
    createIndex(path, targetPath, func = _.noop) {
        path = _join(__dirname, path);
        let template = $template.read(path);
        let files = _fs.readdirSync(targetPath);
        if (files.length) {
            files = _.filter(files, (name) => {
                const filePath = _join(targetPath, name);
                const stat = _fs.statSync(filePath);
                return stat.isFile() && name !== 'index.ts';
            });

            let templates = _.map(files, (file) => {
                let relativeName = file.replace(/(.*?)(\.[^.]*)$/gi, '$1');

                let pascalName = $util.pascalNaming(relativeName);
                return $template.render(template, {
                    relativeName,
                    pascalName,
                });
            });
            $template.out(templates.join('\n'), _join(targetPath, './index.ts'), func);
        }
    }

    /**
     * common/const/index.ts
     */
    createConstIndex() {
        let tempKey = 'index.const.mtime';
        let mtime = this.compareMtime(MC.PATH_CONST, tempKey);
        if (mtime) {
            this.createIndex('./template/common/const/index.ts.ejs', MC.PATH_CONST, (path) => {
                $log.notice([`::--=> Tuning to ${path}`]);

                // todo 暂时关闭生成interface 文件

                // this.createConstInterface(path);
                // 文件产生变化，读取最新的文件变化时间记录
                // $mritemp.write(this.getMtime(MC.PATH_CONST), tempKey);
            });
        }
    }

    /**
     * common/services/index.ts
     */
    createServiceIndex() {
        let tempKey = 'index.services.mtime';
        let mtime = this.compareMtime(MC.PATH_SERVICES, tempKey);
        if (mtime) {
            this.createIndex('./template/common/services/index.ts.ejs', MC.PATH_SERVICES, (path) => {
                $log.notice([`::--=> Tuning to ${path}`]);
                // 文件产生变化，读取最新的文件变化时间记录
                $mritemp.write(this.getMtime(MC.PATH_SERVICES), tempKey);
            });
        }
    }

    /**
     * 生成 const 的 interface 文件
     */
    createConstInterface(indexPath) {
        /**
         * - 使用tsc编译const文件夹
         * - 修改生成后的 d.ts 文件 转为 interface
         */
        let path = _join(process.cwd(), MC.PATH_CONST);
        let tscTempPath = _join(path, './ts-mri');
        let interfacePath = _join(path, './interface-mri');

        _shell.exec(`
            _tsc='./node_modules/.bin/tsc'
            
            # 删除上一次配置
            rm -rf ${tscTempPath} ${interfacePath}
            
            # tsc 执行文件
            $_tsc --baseUrl . --declaration --keyofStringsOnly --removeComments --outDir ${tscTempPath} ${indexPath}
            
            # 生成 const interface 文件夹
            mkdir ${interfacePath}
            
            # 将 d.ts mv inteface file
            for i in $(find ${tscTempPath} -iname *[.-]const.d.ts)
            do
                mv $i ${interfacePath}
            done
            
            rm -rf ${tscTempPath}
        `);

        // 修改declare const name 为 interface IAbcConst
        _fs.readdir(interfacePath, (error, files) => {
            if (error) {
                return void 0;
            }

            if (files.length) {
                _.each(files, (file) => {
                    let path = _join(interfacePath, file);
                    let content = $template.read(path);
                    content = content.replace(/^declare\s(const|let)\s*(.*?):/gm, 'interface I$2');
                    content = content.replace(/^export.*?;$/gm, '');
                    content = content.replace(/};\s*$/gi, '}');
                    $template.out(content, path);
                });
            }
        });
    }

    /**
     * 解析路由文件信息
     */

    analysisRoutes(info) {
        info = $util.removeComments(info);

        info = info.replace(/^\s{0,}import.*$/gm, '');
        info = info.replace(/^\s{0,}(const|let)(.*)require.*$/gm, '');
        info = info.replace(/^\s{0,}(const|let)(.*)import.*$/gm, '');
        info = info.replace(/^\s{0,}require.*$/gm, '');
        info = info.replace(/^\s*?(let|const)(.*?)Routes(.*?)=\s*?{/gm, '{');
        info = info.replace(/(layout?):(.*?)([,]$|$)/gm, '$1: "$2"$3');
        info = info.replace(/(subLayout?):(.*?)([,]$|$)/gm, '$1: "$2"$3');
        info = info.replace(/(component?):(.*?)([,]$|$)/gm, '$1: "$2"$3');
        info = info.replace(/}\s{0,};/gm, '}');
        info = info.replace(/^\s{0,}export default.*$/gm, '');

        $log.log(`:::-=> 检测路由配置信息`);

        try {
            return eval(`(${info})`);
        } catch (e) {
            $log.errorWrap([`- 不能正确读取路由信息`]);
            console.debug(e, info);
            process.exit(0);
            return void 0;
        }
    }

    /**
     * 生成基于umi规则的约定式路由文件
     * task 启动的任务名
     * project 启动的项目名
     */
    umiProjectPages(task, project) {
        let routePath = `${MC.PATH_PROJECTS}/${project}/${project}-routes.ts`;
        let pagesPath = MC.PATH_PAGES;
        // 生成 pages 文件夹
        _fse.removeSync(pagesPath);
        _fse.mkdirsSync(pagesPath);

        if ($util.existPath(routePath)) {
            let routes = this.analysisRoutes($template.read(routePath));

            let {
                config: { LAYOUT: layoutType },
            } = $load.env(task, project);

            // 生成 pages
            if (_.isEmpty(routes)) {
                return false;
            }

            $log.log(`:::-=> 正在写入路由文件`);

            // 创建 / 写入文件
            _.forEach(routes, (route, name) => {
                let { path = [] } = route;
                path = _.uniq(path.map((item) => _.trim(_.replace(item, '/index', ''), '/')));
                _.forEach(path, (str) => {
                    str = str || 'index';
                    let filePath = $util.createDir(str.split('/'), pagesPath);
                    let targetPath = _path.join(filePath, `index.tsx`);
                    let templatePath = _join(__dirname, `./template/pages/index.tsx.ejs`);
                    let params = {
                        title: '',
                        redirect: '',
                        name,
                        layoutType,
                        ...route,
                    };

                    $template.product(templatePath, params, targetPath, () => {
                        $log.log(`---::: pages 文件生成 => ${_chalk.white(targetPath)}`);
                    });
                });
            });

            /**
             * 按不同的Layout数据传递方式，生成 Layout index 文件
             * @type {string}
             */
            let templatePath = _join(__dirname, `./template/layouts/index.ts.ejs`);
            let targetPath = _join(process.cwd(), './src/layouts/index.ts');
            let params = { layoutType };
            $template.product(templatePath, params, targetPath, () => {
                $log.log(`---::: layout 文件生成 => ${_chalk.white(targetPath)}`);
            });
        }
    }

    rmcache() {
        $log.title(`忽略ignore文件`);

        let files = [
            './src/common/const/interface-mri',
            './src/common/const/index.ts',
            './src/common/services/index.ts',
            './src/common/svg/index.ts',
            './src/project/index.ts',
            './src/project/config.mri.ts',
            './src/project/const-env.mri.ts',
            './src/project/route-guard.mri.ts',
            './src/project/reference.mri.ts',
            './src/project/dva.mri.ts',
            './src/project/preload.mri.ts',
            './src/project/preset.mri.ts',
            './.theme',
            './.mrirc.js',
            './.mritemp',
        ];

        let temp = $mritemp.read();

        _.each(files, (file) => {
            $util.execSilent(`
                rm -rf ${file} 1>/dev/null 2>&1
                git rm -r --cache ${file}  1>/dev/null 2>&1
            `);

            console.log(_chalk.green(`::-=> ignore ${file}`));
        });

        $mritemp.write(temp);
    }

    /**
     * 生成基于umi规则配置的document.ejs模板文件
     */
    umiProjectDocument(task, project) {
        // document.ejs
        let documentPath = _join(__dirname, `./template/pages/document.ejs.ejs`);
        let targetPath = MC.PATH_DOCUMENT_EJS;

        $template.product(documentPath, {}, targetPath, () => {
            $log.log(`---::: pages 文件生成 => ${_chalk.white(targetPath)}`);
        });
    }

    umi(task, project) {
        this.umiProjectPages(task, project);
        this.umiProjectDocument(task, project);
    }

    mri(task, project) {
        let paths = [
            './template/mri/config.mri.ts.ejs',
            './template/mri/route-guard.mri.ts.ejs',
            './template/mri/const-env.mri.ts.ejs',
            './template/mri/dva.mri.ts.ejs',
            './template/mri/preload.mri.ts.ejs',
            './template/mri/preset.mri.ts.ejs',
        ];

        $log.log(`:::-=> 正在写入mri引用文件`);

        _.each(paths, (path) => {
            let templatePath = _join(__dirname, path);
            let targetPath = MC.PATH_PROJECTS + '/' + path.replace(/(.*?)\/([^/]*)?.ejs$/gi, '$2');
            let params = {
                project,
                task,
            };

            $template.product(templatePath, params, targetPath, () => {
                $log.log(`---::: mri 文件生成 => ${_chalk.white(targetPath)}`);
            });
        });
    }

    /**
     * 生成package.json文件
     */
    pkg() {
        let pkgPath = _join(process.cwd(), './package.json');
        let pkg = $util.loadJSON(pkgPath) || {};
        let source = $util.loadJSON(_join(__dirname, './template/package.json')) || {};

        pkg = _.extend({}, source, pkg);

        // 添加忽略package.json
        // todo 保留2-3个版本
        let ignorePath = _join(process.cwd(), './.gitignore');
        let text = $template.read(ignorePath);

        if (!/package.json/g.test(text)) {
            text = text + '\npackage.json';
            $template.out(text, ignorePath);
        }

        $util.execSilent(`
            rm -rf package.json
            git rm --cache package.json 1>/dev/null 2>&1
        `);

        // 获取上一次 last .mrirc.js 的版本
        let mrirc = $load.mrirc();
        if (mrirc.version) {
            pkg.version = $util.compareVersions(pkg.version, mrirc.version, 'max');
        }

        pkg.resolutions = mrirc.resolutions || {};

        let content = $template.format(JSON.stringify(pkg));
        $template.out(content, pkgPath);
    }
}

const $tuning = new Tuning();

module.exports = $tuning;
