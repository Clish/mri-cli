const _fs = require('fs');
const _join = require('path').join;
const _chalk = require('chalk');
const _ = require('lodash');
const _fse = require('fs-extra');
const _shell = require('shelljs');
const _path = require('path');
const _program = require('commander');

const MC = require('../../common/constant');
const $util = require('../../common/util');
const $git = require('../../common/git');
const $log = require('../../common/log');
const $template = require('../../common/template');

class Project {
    getCopyProjectBranch(project) {
        return `copy-project/${project}`;
    }

    /**
     * 校验项目是否存在
     */
    existProject(project) {
        let path = MC.PATH_PROJECTS + '/' + project;

        if ($util.existPath(path)) {
            return true;
        }

        if (this.customProjects(project)) {
            return true;
        }

        return false;
    }

    /**
     * 检测项目临时分支是否存在
     */
    existProjectBranch(project) {
        let branch = this.getCopyProjectBranch(project);
        return $git.hasBranch(branch, 'remote');
    }

    /**
     * 获取自定义项目名
     */
    customProjects(project) {
        /**
         * 从branch中获取
         * 符合branch命名规范的分支
         * {model}/{project}/v{version}
         */
        let branchProjects = _.map($git.allBranches(), (branch) => {
            let [model, project, version] = branch.split('/');
            return project;
        });

        branchProjects = _.uniq(branchProjects);

        if (project) {
            if (_.find(branchProjects, (p) => p === project)) {
                return true;
            }
        }

        /**
         * 从tag中获取
         * 符合tag命名规范
         * {project}_v{version}
         */

        let tagProjects = _.map($git.allTags(), (branch) => {
            let [project, version] = branch.split('_');
            return project;
        });

        tagProjects = _.uniq(tagProjects);

        if (project) {
            return !!_.find(tagProjects, (p) => p === project);
        }

        let projects = branchProjects.concat(tagProjects);

        return _.uniq(projects);
    }

    /**
     * 创建项目的相关文件
     */
    createProjectFiles(project) {
        let branch = this.getCopyProjectBranch(project);
        let params = {
            project,
            name: project,
            upperName: $util.pascalNaming(project),
            camelName: $util.camelNaming(project),
            upperAll: project.toUpperCase(),
            primaryColor: MC.PRIMARY_COLOR,
            port: MC.PORT,
            common: '../../common/',
            services: 'services/',
            const: 'const/',
        };

        let templatePath = _path.join(__dirname, './template');
        let files = $util.getFiles(templatePath);

        let sources = _.map(files, (file) => {
            return file.filedir;
        });

        let targets = _.map(files, (file) => {
            let path = $util.stringFormat(file.filedir.replace(templatePath, ''), params);
            path = _path.join(process.cwd(), `${MC.PATH_PROJECTS}/${project}`, path);
            path = path.replace(/\.ejs$/gi, '');
            return path;
        });

        $template.product(sources, params, targets, (target) => {
            let path = _path.relative(process.cwd(), target);
            $log.debug(`--=> ${path}`);
        });

        _shell.exec(`
            git add .
            git commit -am '项目${project}创建关联文件'
            git push -u origin ${branch}
        `);

        $log.noticeWrap([
            `- 项目 ::-> ${project} 创建成功`,
            `- 同时已经将分支${project}提交至远程`,
            `- 请将分支 ${project} 提交PR(Merge Request)到master`,
            `- 来开启你的新项目之旅吧`,
        ]);
    }

    /**
     * 创建项目文件夹
     */
    createProject(project) {
        let branch = this.getCopyProjectBranch(project);

        /**
         * 创建基于项目的分支
         * 以及相关文件夹
         */
        _shell.exec(`
            git checkout -b ${branch}
            
            if [ $? -ne 0 ]; then
                echo '创建'
                exit 0
            fi 

            # 创建projects文件夹，若没有存在的话
            mkdir ${MC.PATH_PROJECTS} 2>/dev/null

            # 创建项目所在的文件夹
            mkdir ${MC.PATH_PROJECTS}/${project}
        `);
    }

    /**
     * 展示已创建的projects列表
     */
    showProjects(project) {
        let projects = $util.getProjects();

        projects = _.map(projects, (name, inx) => {
            if (project === name) {
                return _chalk.yellow(`- ${inx + 1} ::::::::::::: ${name} :::::::::::::`);
            } else {
                return `- ${_chalk.green(inx + 1)} ${name}`;
            }
        });

        $log.warn(`已创建项目(project)\n`);
        $log.log(projects);
    }

    /**
     * 删除项目
     */
    removeProject(project) {
        let path = MC.PATH_PROJECTS + '/' + project;
        let branch = this.getCopyProjectBranch(project);
        path = _path.join(process.cwd(), path);

        // 创建分支
        let child = _shell.exec(`
            git branch ${branch} 1>/dev/null 2>&1
            
            if [ $? -ne 0 ]; then
                git branch -D ${branch} 1>/dev/null 2>&1
                git push origin :${branch} 1>/dev/null 2>&1
                git branch ${branch}
            fi
            
            git checkout ${branch}
            rm -rf ${path}
            git add .
            git commit -am 'remove project ${project}'
            git push origin ${branch}
        `);

        if (child.code) {
            process.exit(0);
        }
    }

    removeProjectBranch(project) {
        let branch = this.getCopyProjectBranch(project);
        _shell.exec(`
            git branch -D ${branch}
            git push origin :${branch}
        `);
    }

    // 基于命令，删除项目流程
    remove(project) {
        let branch = this.getCopyProjectBranch(project);

        // 校验项目是否存在
        if (this.existProject(project)) {
            this.removeProject(project);
            $log.noticeWrap([
                `- 项目 ::-> ${project} 本地local删除成功`,
                `- 同时已经将分支${branch}提交至远程`,
                `- 请将分支 ${branch} 提交PR(Merge Request)到master，删除远程项目`,
            ]);
        } else if (this.existProjectBranch(project)) {
            this.removeProjectBranch(project);
            $log.notice(`:::-=> 删除项目${project}成功`);
        } else {
            $log.errorWrap([`- 该项目不存在，请确认`]);
            this.showProjects();
        }

        process.exit(0);
    }

    // 基于命令，创建项目流程
    create(project) {
        // 校验项目是否存在

        if (this.existProject(project)) {
            $log.errorWrap([`- 项目 ${project} 已存在`]);
            this.showProjects(project);
            process.exit(0);
        }

        if (this.existProjectBranch(project)) {
            let branch = this.getCopyProjectBranch(project);
            $log.errorWrap([`- 项目 ${project} 专属的分支 ::-> ${branch} 已存在`, `- 请确认情况，或删除分支，再创建项目`]);
            this.showProjects(project);
            process.exit(0);
        }

        // 创建项目文件夹
        this.createProject(project);

        /**
         * 创建基于项目的routes, config, umi.js 文件等
         */
        this.createProjectFiles(project);
    }
}

let $project = new Project();

module.exports = $project;
