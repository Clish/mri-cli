const fs = require('fs');
const {join} = require('path');
const chalk = require('chalk');
const _ = require('lodash');
const fse = require('fs-extra');

const FILE_PATH = '../template/project';
const WRITE_PATH = './src/theme';

const DEF_OPTIONS = {
    xOrigin: 'env.masterrt.mri',
    primaryColor: '#1890ff',
    port: '6001'
};


function getOptions(args) {
    let arr = _.map(args, item => _.split(item, ':'));
    return _.reduce(arr, (obj, item) => {
        obj[item[0]] = item[1];
        return obj;
    }, {});
}

/**
 * @param dirPath template file path
 * @param onFile  on file's fire
 */
function fileDisplay(dirPath, onFile) {
    let dir = fs.readdirSync(dirPath);
    _.forEach(dir, filename => {
        let filePath = join(dirPath, filename);
        let fsStats = fs.statSync(filePath);

        fsStats.isFile() && onFile && onFile(dirPath, filename);
        fsStats.isDirectory() && fileDisplay(filePath, onFile);
    });
}

// todo 创建文件的时候，路径判断
function addCommonFile(theme, tmpParams) {

    let templateUri = join(__dirname, '../template');
    let srcUri = join(process.cwd(), './src');
    let commonPath = [
        '/common/const/{theme.}const.ts',
        '/common/services/{theme.}services.ts'
    ];

    _.forEach(commonPath, (path) => {
        let templatePath = join(templateUri, path.replace(/{theme\.}|{theme\/}/g, ''));
        let srcPath = join(srcUri, path.replace(/{theme\.}/g, `${theme}.`).replace(/{theme\/}/g, `${theme}/`));

        // 判断文件是否存在
        if(!fs.existsSync(srcPath)) {
            let content = fs.readFileSync(templatePath, {encoding: 'utf8'});
            fse.outputFileSync(srcPath, _.template(content)(tmpParams));
            console.log(chalk.green(`---=> ${srcPath}`));
        }
    });
}

function newProject({args = []}) {
    const name = args.shift();
    const upperName = _.flow([_.camelCase, _.upperFirst]);

    if(!name) {
        console.log(chalk.red('Please input new project name.'));
        return void 0;
    }

    let basicPath = join(__dirname, FILE_PATH);
    let tmpParams = _.assign(DEF_OPTIONS, {
        filePrefix: `${name}-`,
        upperName: upperName(name),
        name,
        upperAll: name.toUpperCase()
    }, getOptions(args));

    fileDisplay(basicPath, (filePath, name) => {
        let outPath = [WRITE_PATH, tmpParams.name, _.replace(filePath, basicPath, ''), tmpParams.filePrefix + name];
        outPath = join(process.cwd(), _.join(outPath, '/'));
        let content = fs.readFileSync(join(filePath, name), {encoding: 'utf8'});
        fse.outputFileSync(outPath, _.template(content)(tmpParams));
        console.log(chalk.green(`---=> ${outPath}`));
    });

    addCommonFile(name, tmpParams);

    console.log(chalk.green(`Successfully create the theme [${name}]...`));
}

module.exports = newProject;