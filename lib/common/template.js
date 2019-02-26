const _fs = require('fs');
const _join = require('path').join;
const _chalk = require('chalk');
const _ = require('lodash');
const _fse = require('fs-extra');
const _shell = require('shelljs');
const _path = require('path');
const _program = require('commander');
const _ejs = require('ejs');

const $util = require('./util');
const $log = require('./log');

class Template {
    // 读取内容
    read(path) {
        return _fs.readFileSync(path, 'utf-8');
    }

    // 匹配模板, 渲染内容
    render(template, params) {
        return _ejs.render(template, params);
    }

    // 输出
    out(content, path, func) {
        _fse.outputFileSync(path, content);
        func && func(path);
    }

    // 判断路径是否存在
    exist(path) {
        return _fs.existsSync(path);
    }

    // 执行
    product(templatePath, params, targetPath, func = _.noop, interrupt = false) {
        params = params || {};
        targetPath = targetPath || templatePath;
        templatePath = $util.upArray(templatePath);
        targetPath = $util.upArray(targetPath);

        if (templatePath.length !== targetPath.length) {
            $log.errorWrap([`- 输入文件与输出文件不一致`]);
            process.exit(0);
        }

        _.each(templatePath, (path, inx) => {
            let content = this.read(path);
            let target = targetPath[inx];
            target = target.replace(/\.ejs$/, '');

            if (this.exist(target) && interrupt) {
                $log.errorWrap([`- 文件已存在 ${target}`]);
                process.exit(0);
            }

            content = this.render(content, params);
            this.out(content, target, func);
        });
    }
}

let $template = new Template();

module.exports = $template;
