module.exports = {
    // 约定根目录必须条件
    ROOT_JUDGE: {
        // node_modules: 1,
        // '.git': 1,
        '.mrirc.js': 1,
    },

    PATH_ADMIN: 'mriadmin.js',
    PATH_RC: '.mrirc.js',

    PATH_PROJECTS: './src/project',

    PATH_PAGES: './src/pages',

    PATH_DOCUMENT_EJS: './src/pages/document.ejs',

    PATH_UNIT: {
        component: './src/components',
        widget: './src/widgets',
        block: './src/blocks',
        hook: './src/hooks',
    },

    PATH_CONST: './src/common/const',
    PATH_SERVICES: './src/common/services',

    PRIMARY_COLOR: '#1890ff',

    PORT: 6001,
};
