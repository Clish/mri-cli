const _fs = require('fs');
const _join = require('path').join;
const _chalk = require('chalk');
const _ = require('lodash');
const _fse = require('fs-extra');
const _shell = require('shelljs');
const _path = require('path');
const _program = require('commander');
const _moment = require('moment');

const MC = require('../../common/constant');
const $util = require('../../common/util');
const $log = require('../../common/log');
const $template = require('../../common/template');

class Generate {
    generate(unit, name) {

        let map = {
            'c': 'component',
            'w': 'widget',
            'b': 'block'
        }

        unit = map[unit] || unit;

        if(unit === 'widget') {
            name = name + 'Widget';
        }

        if(unit === 'block') {
            name = name + 'Block';
        }

        let kebab = _.kebabCase(name);

        let params = {
            date: _moment().format('YYYY-MM-DD'),
            kebab,
            className: _.upperFirst(_.camelCase(name)),
            unitUpperFirst: _.upperFirst(unit),
            unit,
            name
        };

        let templatePath = _path.join(__dirname, `./template/${unit}s`);
        let files = $util.getFiles(templatePath);

        let sources = _.map(files, (file) => {
            return file.filedir;
        });

        let targets = _.map(files, (file) => {
            let path = $util.stringFormat(file.filedir.replace(templatePath, ''), params);
            path = _path.join(process.cwd(), `${MC.PATH_UNIT[unit]}`, path);
            path = path.replace(/\.ejs$/gi, '');
            return path;
        });

        $template.product(sources, params, targets, (target) => {
            let path = _path.relative(process.cwd(), target);
            $log.debug(`--=> ${path}`);
        });
    }
}

let $generate = new Generate();

module.exports = $generate;
