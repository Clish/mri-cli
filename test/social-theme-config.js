/**
 * theme social config
 * @author mizi.lin 2018-04-23
 * @update mizi.lin 2018-04-25
 */

import Theme from '../theme';
import SocialLayout from './layout/social-layout';
import SocialNoneLayout from './layout/social-none-layout';
import {
    SocialIndex,
    SocialTutorial,

    SocialSearch,
    SocialSearchResult,
    SocialAnalyzerManager,
    SocialTriggerManager,
    SocialAccountManager,
    SocialAccountCompare,
    SocialHelp,
    SocialTriggerPosts,
    SocialUser,

    EchartDemo
} from '../../components';

import SocialAnalyzerCompare from '../../components/social-analyzer-compare/social-analyzer-compare';
import SocialAnalyzerDetail from '../../components/social-analyzer-detail/social-analyzer-detail';
import SocialAccountDetail from '../../components/social-account-detail/social-account-detail';
import SocialAccountContrast from '../../components/social-account-contrast/social-account-contrast';
import SocialEmotion from '../../components/social-emotion/social-emotion';
import WechatLogin from '../../components/_wechat-login/wechat-login';
import Social404 from '../../components/social-404/social-404';


class SocialConfig extends Theme {
    /**
     * theme name
     * 主题名称
     * @type {string}
     */
    name = 'social';

    /**
     * 网站名称
     * @type {string}
     */
    website = 'Social X';
    layout = SocialLayout;

    routes = {
        demo: {
            component: EchartDemo,
            path: ['/demo/'],
            token: true
        },

        'index': {
            component: SocialIndex,
            path: ['/index', '/'],
            token: false,
            layout: SocialNoneLayout
        },

        'tutorial': {
            component: SocialTutorial,
            path: ['/tutorial', '/tutorial/'],
            token: false,
            layout: SocialNoneLayout
        },

        'wechat': {
            component: WechatLogin,
            path: ['/wechat', '/wechat/'],
            layout: SocialNoneLayout,
            token: false
        },

        'error': {
            component: Social404,
            path: ['/404'],
            layout: SocialNoneLayout,
            token: false
        },

        'search': {
            component: SocialSearch,
            path: ['/search', '/search/', '/search/index'],
            token: true
        },

        'search-result': {
            component: SocialSearchResult,
            path: ['/search/result'],
            token: true
        },

        'analyzer-manager': {
            component: SocialAnalyzerManager,
            path: ['/analyzer/manager'],
            token: true
        },
        'analyzer-compare': {
            component: SocialAnalyzerCompare,
            path: ['/analyzer/compare'],
            token: true
        },
        'analyzer-detail': {
            component: SocialAnalyzerDetail,
            path: ['/analyzer/detail'],
            token: true
        },

        'trigger-manager': {
            component: SocialTriggerManager,
            path: ['/trigger/manager'],
            token: true
        },
        'trigger-posts': {
            component: SocialTriggerPosts,
            path: ['/trigger/posts'],
            token: true
        },

        'account-manager': {
            component: SocialAccountManager,
            path: ['/account/manager'],
            token: true
        },

        'account-compare': {
            component: SocialAccountCompare,
            path: ['/account/compare'],
            token: true
        },
        'account-detail': {
            component: SocialAccountDetail,
            path: ['/account/detail'],
            token: true
        },
        'account-contrast': {
            component: SocialAccountContrast,
            path: ['/account/contrast'],
            token: true
        },
        'emotion': {
            component: SocialEmotion,
            path: ['/emotion'],
            token: true
        },

        'help': {
            component: SocialHelp,
            path: ['/help', '/help/', '/help/help'],
            token: true
        },

        'user': {
            component: SocialUser,
            path: ['/user', '/user/', '/user/user'],
            token: true
        },



    };

    // preload = [
    // //     [name1, promise1, cb1?], [name2, promise2, cb2?], [name3, promise3, cb3?]... 
    //     [
    //         'test', 
    //         new Promise((resolve, reject) => {
    //             setTimeout(resolve, 2000, [1,2,3,4,5]);
    //         }), 
    //         rst => rst.map(item => item * item)
    //     ]
    // ];
}

export default new SocialConfig();
