const _path = require('path');
const _join = _path.join;
const _ = require('lodash');
const _program = require('commander');
const $index = require('../service/index');
const $util = require('../service/util');
const $root = require('../service/root');

module.exports = () => {

    let { consts, services, components, widgets, layouts, svgs } = _program;

    const rootPath = $root.getRoot();

    const constsPath = _join(rootPath, '/src/common/const');
    const servicesPath = _join(rootPath, '/src/common/services');
    const widgetsPath = _join(rootPath, '/src/widgets');
    const componentsPath = _join(rootPath, '/src/components');
    const layoutsPath = _join(rootPath, '/src/common/layouts');
    const svgsPath = _join(rootPath, '/src/assets/svg');
    const svgsIndexPath = _join(rootPath, '/src/common/svg/index.ts');

    // 默认全部生成
    if (!(consts && services && components && widgets && layouts && svgs)) {
        consts = services = components = widgets = layouts = svgs = true;
    }

    if (consts) {
        $index.createIndex(constsPath, (relativeFile, pascalName) => {
            return `export {default as ${pascalName}} from './${relativeFile}';`;
        });
    }

    if (services) {
        $index.createIndex(servicesPath, (relativeFile, pascalName) => {
            return `export {default as ${pascalName}} from './${relativeFile}';\nexport {I${pascalName}} from './${relativeFile}';`;
        });
    }

    if (svgs) {
        $index.createSVGIndex($util.getFiles(svgsPath), svgsIndexPath, (relativeFile, pascalName) => {
            return `// @ts-ignore\nexport {default as ${pascalName}} from '${relativeFile}';`;
        });
    }
};
