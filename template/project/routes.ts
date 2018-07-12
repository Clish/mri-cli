/**
 * 路由配置信息
 *
 * 配置路由相关信息
 *
 * @author ...
 */

import {IndexPage} from 'src/components/index-page';
import {NoneLayout} from 'src/common/layouts/none-layout';


/**
 * 该模块作为 mri-cli 读取路由配置，生成pages文件夹，
 * 所以大家只在对象里面进行编辑，其他地方不可动~~ 避免 mri-cli 不识别该文件
 */
const <%=upperName%>Routes = {

    // [index]: module 名称，用于pages 引用 或 相关配置
    index: {

        // component!: 引用的component
        component: IndexPage,
        // path!: route 可访问地址， 用于生成pages文件
        path: [
            '/index',
            '/'
        ],
        // layout: 是否使用默认布局
        layout: NoneLayout,

        // token?: 该route是否需要身份验证, 默认 false
        token: false,

        //@todo auth, 作为权限访问标志
        //@todo model 该component是否使用dav reducer (自动绑定 model)
    },

    default: {
        component: IndexPage,
        path: [
            '/default',
        ],
        token: false,
    },

    // ... 添加模块，重复上面配置
};

export default <%=upperName%>Routes;
