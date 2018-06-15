import OneLorealKnowledge from '../../components/one-loreal-knowledge/one-loreal-knowledge';
import OneLorealNoneLayout from './layout/one-loreal-none-layout';
import OneLorealDashboard from '../../components/one-loreal-home/one-loreal-home';
// import OneLorealIndex from '../../components/one-loreal-index/one-loreal-index';

let OneLorealRoutes = {
    'index': {
        component: OneLorealIndex,
        path: [
            '/index',
            '/',
        ],
        token: false,
        layout: OneLorealNoneLayout
    },

    'home': {
        component: OneLorealDashboard,
        path: [
            '/home',
            '/home/',
        ],
        layout: OneLorealNoneLayout,
        token: true,
    },

    'knowledge': {
        component: OneLorealKnowledge,
        path: [
            '/knowledge',
            '/knowledge/',
        ],
        token: true,
    }
};

export default OneLorealRoutes;