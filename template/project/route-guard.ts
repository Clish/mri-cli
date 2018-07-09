/**
 * RouteGuard
 * 路由守卫
 *
 * @return {boolean} 返回 true 守卫放行， 返回false 守卫阻止
 *
 * @author ...
 */

import router from 'umi/router';
import * as mu from 'mzmu';
import $theme from 'src/theme';

export default function RouteGuard(module: any, props?: any): boolean {
    const <%=upperName%>Const: any = $theme.getProviders('<%=upperName%>Const');

    /**
     * 模块不存在
     * 即路由地址错误
     */
    if (!module) {
        router.replace('/404');
        return false;
    }

    let token = mu.storage(<%=upperName%>Const.STORAGE_X_TOKEN);

    if (module.token) {
        if (!token) {
            console.warn('用户登录信息失效');
            router.replace(<%=upperName%>Const.INDEX_PAGE);
            return false;
        }
    }

    return true;
}
