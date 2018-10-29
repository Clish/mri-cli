/**
 * umi 以及 mri-cli 的相关配置
 *
 * umi -> https://umijs.org/config/#%E5%9F%BA%E6%9C%AC%E9%85%8D%E7%BD%AE
 */

const path = require('path');
const resolve = path.resolve;
const themeName = process.env.THEME;

module.exports = {

    /**
     * 接口服务代理
     */
    proxy: {
        '/services': {
            target: 'http://58.215.174.164:16800/',
            changeOrigin: true,
            pathRewrite: {'^/services': ''}
        }
    },

    /**
     * 主题颜色配置
     */
    theme: {
        'primary-color': '<%=primaryColor%>',
        // 'mri-header-color': '#242630',
        // 'mri-sub-color': '#F7E6BA',
        //
        // 'font-size-base': '12px',
        // 'mri-footer-color': '#404040',
        // 'mri-side-color': '#404040',
        // 'mri-main-color': '#fff',
        // 'mri-main-width': '85%',
        // 'mri-border-color': '#eee',
        //
        // 'success-color': '#61D9D5',
        // 'error-color': '#FD7B72',
        // 'warning-color': '#FEC491',
        // 'info-color': '#8FD7FD'
    },

    /**
     * mri-cli 配置
     */
    mri: {
        // 当前主题
        theme: '<%=name%>',

        // 项目运行设备
        MRI_DEVICE: 'pc',

        // dev 环境， web-server 启动端口
        PORT: '<%=port%>'
    }
};
