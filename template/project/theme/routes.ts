/**
 * 路由配置信息
 *
 * 配置路由相关信息
 *
 * @author ...
 */

import {IndexPage} from 'src/components/index-page';
import {P404} from 'src/components/p-404';
import {NoneLayout} from 'src/common/layouts/none-layout';

/**
 * 该模块作为 mri-cli 读取路由配置，生成pages文件夹，
 * 所以大家只在对象里面进行编辑，其他地方不可动~~ 避免 mri-cli 不识别该文件
 * @todo auth, 作为权限访问标志
 * @todo model 该component是否使用dav reducer (自动绑定 model)
 */
const <%=upperName%>Routes = {


    /**
     * [module]: {
     *      //-> 该模块载入的component
     *      component: React.Component,
     *
     *      //-> 该模块匹配的路由配置，可多个
     *      path: string[],
     *
     *      //-> layout 该模块匹配的布局框架，若为空，则使用 theme.config 配置的主路由框架
     *      layout?: React.Component,
     *
     *      //-> subLayout 二级路由，若为空，则使用 theme.config 配置的次级路由框架
     *      subLayout?: React.Component,
     *
     *      //-> menu 默认菜单名称
     *      menu?: sting,
     *
     *      //-> params 默认参数 '?a=1&b=2'
     *      params?: string
     *
     *      //-> src 该模块来源, 配置可继承样式以及相关信息
     *      src?: <theme::module> string?::string
     *
     *      //-> title 页面title
     *      title?: string
     *
     *      //-> redirect 页面跳转 <Redirect to='${redirect}' />
     *      redirect?: string
     * }
     */

    index: {
        component: IndexPage,
        path: ['/', '/index'],
        layout: NoneLayout,
        token: false,
    },

    404: {
        component: P404,
        path: ['/404'],
        token: false,
        layout: NoneLayout,
    }
};

export default <%= upperName %>Routes;
