/**
 * RouteGuard
 * 路由守卫
 * @return {boolean} 返回 true 守卫放行， 返回false 守卫阻止
 */

import $theme from 'src/theme';

export default function RouteGuard(module: any, props?: any): boolean {
    const <%=upperName%>Const: any = $theme.getProviders('<%=upperName%>Const');

    /**
     * 返回 false, 页面不渲染
     * 在此，可以针对当前theme, 对路由进行守卫
     */
    // return false;

    return true;
}

