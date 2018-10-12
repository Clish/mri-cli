/**
 * 根据路由信息,
 * 构建umi的pages
 */

const _util = require('./util');
const _fs = require('fs');
const _fse = require('fs-extra');
const _ = require('lodash');
const _chalk = require('chalk');
const _path = require('path');
const {log, error, debug} = console;
const {green, red, yellow, grey} = _chalk;

const PAGES_PATH = './src/pages';
const DEF_INDEX = 'index';

let writeFile = (path, name, route) => {
    let {title} = route;
    title = title ? `title: ${title}` : '';
    // todo 改成 ejs
    _fse.outputFileSync(path, `
/**
 * ${title}
 */
import $theme from 'src/theme';
const module = $theme.getModule('${name}');
const component = module.component;
export default component;
    `);

    log(`${green('::: pages 文件生成 => ')} ${path}`);
};

/**
 * 根据路径读取 routes 配置信息
 * @param theme
 * @param env
 * @return {{}}
 */
const analysisRoutes = (theme, env) => {

    // 根据 theme, 获取 ${theme}-routes.ts 的文件路径
    let path = `./src/theme/${theme}/${theme}-routes.ts`;

    if(_fs.existsSync(path)) {

        log(`---=> 解析路由配置文件`);

        let info = String(_fs.readFileSync(path, 'utf-8'));
        let routes;


        // 移除代码中的备注
        info = info.replace(/("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)/g, function(word) { // 去除注释后的文本
            return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? '' : word;
        });

        info = info.replace(/\n/g, '');
        info = info.replace(/component?:(.*?)([,}])/g, 'component: "$1"$2');
        info = info.replace(/layout?:(.*?)([,}])/g, 'layout: "$1"$2');
        info = info.replace(/^.*?let.*?=(.*)?[;]export default.*$/g, '$1');
        info = info.replace(/^.*?const.*?=(.*)?[;]export default.*$/g, '$1');

        log(`---=> 检测路由配置信息`);

        try {
            routes = eval(`(${info})`);
            return routes;
        } catch(e) {
            error(`${red('@@@=>')} 不能正确读取路由信息 \n`, e, info);
            return void 0;
        }

    } else {
        error(`${red('@@@=>')} 路由文件不存在`);
        return void 0;
    }
};

/**
 * 根据 routes 配置信息，写入 pages
 */
const writePages = (routes) => {
    if(_.isEmpty(routes)) {
        return false;
    }

    log(`---=> 正在写入路由文件`);

    // 生成 pages 文件夹
    _fse.mkdirsSync(PAGES_PATH);

    // 创建 / 写入文件

    _.forEach(routes, (route, name) => {
        let {path = []} = route;
        path = _.uniq(path.map(item => _.trim(_.replace(item, '/' + DEF_INDEX, ''), '/')));
        _.forEach(path, str => {
            if(!str) {
                str = DEF_INDEX;
            }
            let filePath = _util.createDir(str.split('/'), PAGES_PATH);

            writeFile(_path.join(filePath, `${DEF_INDEX}.ts`), name, route);
        });
    });

    log(`---=> 路由文件写入完成`);

    return true;
};

module.exports = function pages(theme) {

    /**
     * 删除 pages 文件夹
     * 根据 theme, 获取 ${theme}-routes.ts 的文件路径
     * 根据路径读取 routes 配置信息
     * 根据 routes 配置信息，写入 pages
     */

    // 删除 pages 文件夹
    // 先删除pages文件夹，避免因为上次的文件，影响当前操作
    _fse.removeSync(PAGES_PATH);

    // 根据路径读取 routes 配置信息
    let routes = analysisRoutes(theme);

    // 根据 routes 配置信息，写入 pages
    return writePages(routes);
};


