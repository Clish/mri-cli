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
    generate(unit, name, config = {}) {
        let map = {
            c: 'component',
            w: 'widget',
            b: 'block',
            h: 'hook',
        };

        unit = map[unit] || unit;

        if (unit === 'widget') {
            name = name + 'Widget';
        }

        if (unit === 'block') {
            name = name + 'Block';
        }

        if (unit === 'hook') {
            name = name + 'Hook';
        }

        let kebab = _.kebabCase(name);

        let params = {
            date: _moment().format('YYYY-MM-DD'),
            kebab,
            className: _.upperFirst(_.camelCase(name)),
            unitUpperFirst: _.upperFirst(unit),
            unit,
            name,
            config,
        };

        let templatePath = _path.join(__dirname, `./template/${unit}s`);
        let files = $util.getFiles(templatePath);

        let sources = _.map(files, (file) => {
            return file.filedir;
        });

        /**
         * 判断是否将生成的组件，写入目标组件路径
         */
        let { component, widget, block, hook, path } = config;

        let types = {
            components: component,
            widgets: widget,
            blocks: block,
            hooks: hook,
        };

        let type;

        _.each(types, (value, key) => {
            if (_.isBoolean(value)) {
                $log.debug([`--${key} 不能为空`]);
                process.exit(0);
                return false;
            }

            if (value) {
                if (type) {
                    $log.debug([`--${key} --${type} 不能同时存在`]);
                    process.exit(0);
                    return false;
                } else {
                    type = key;
                }
            }
        });

        /**
         * type 与 path 不能同时存在
         */
        if (type && path) {
            $log.debug([`--${type} --path 不能同时存在`]);
            process.exit(0);
        }

        /**
         * 判断关联的类型的组件是否存在
         */
        let pri = path || _path.join(process.cwd(), `${MC.PATH_UNIT[unit]}`);


        if (type) {
            let name = types[type];
            let kebab = _.kebabCase(name);
            let path = _path.join(process.cwd(), 'src', type, kebab);

            if ($util.existPath(path, true)) {
                pri = path;
            } else {
                $log.debug([`--${type} ${name} 不存在`]);
                process.exit(0);
            }
        }

        let targets = _.map(files, (file) => {
            let path = $util.stringFormat(file.filedir.replace(templatePath, ''), params);
            path = _path.join(pri, path);
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
