const _util = require('./util');
const _fs = require('fs');
const _fse = require('fs-extra');
const _ = require('lodash');
const _chalk = require('chalk');
const _path = require('path');
const _ejs = require('ejs');
const _upperCamelCase = require('simple-uppercamelcase');
const _program = require('commander');
const _relative = require('relative');
const { log, error, debug } = console;
const { green, red, yellow, grey } = _chalk;

const $root = require('../service/root');
let root = $root.getRoot();

class $template {
    /**
     * 写入文件
     * @param params
     * @param templatePath
     * @param targetPath
     */
    create(params = {}, templatePath, targetPath) {
        templatePath = _path.join(__dirname, templatePath);
        targetPath = _path.join(root, targetPath);
        let template = _fs.readFileSync(templatePath, 'utf-8');
        let compile = _ejs.render(template, params);
        _fse.outputFileSync(targetPath, compile);
    }
}

module.exports = new $template();
