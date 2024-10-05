import {createRouter, createWebHistory} from "vue-router";

const routes = [
    {
        name: 'home',
        path: '/',
        redirect: '/agents',
        meta: {title: '首页'},
        component: () => import('@/views/Home.vue'),
        children: [
            {
                name: 'chat',
                path: '/chat',
                meta: {title: '创作中心'},
                component: () => import('@/views/ChatPlus.vue'),
            },
            {
                name: 'agent',
                path: '/agent/chat',
                meta: {title: '智能体'},
                component: () => import('@/views/ChatAgent.vue'),
            },
            // {
            //     name: 'image-mj',
            //     path: '/mj',
            //     meta: {title: 'MidJourney 绘画中心'},
            //     component: () => import('@/views/ImageMj.vue'),
            // },
            {
                name: 'image-sd',
                path: '/sd',
                meta: {title: 'stable diffusion 绘画中心'},
                component: () => import('@/views/ImageSd.vue'),
            },
            // {
            //     name: 'member',
            //     path: '/member',
            //     meta: {title: '会员充值中心'},
            //     component: () => import('@/views/Member.vue'),
            // },
            {
                name: 'chat-role',
                path: '/apps',
                meta: {title: '应用中心'},
                component: () => import('@/views/ChatApps.vue'),
            },
            {
                name: 'chat-agents',
                path: '/agents',
                meta: {title: '应用中心'},
                component: () => import('@/views/ChatAgents.vue'),
            },
            // {
            //     name: 'images',
            //     path: '/images-wall',
            //     meta: {title: '作品展示'},
            //     component: () => import('@/views/ImagesWall.vue'),
            // },
            // {
            //     name: 'user-invitation',
            //     path: '/invite',
            //     meta: {title: '推广计划'},
            //     component: () => import('@/views/Invitation.vue'),
            // },
            // {
            //     name: 'knowledge',
            //     path: '/knowledge',
            //     meta: {title: '我的知识库'},
            //     component: () => import('@/views/Knowledge.vue'),
            // },
        ]
    },
    {
        name: 'chat-export',
        path: '/chat/export',
        meta: {title: '导出会话记录'},
        component: () => import('@/views/ChatExport.vue'),
    },
    {
        name: 'login',
        path: '/login',
        meta: {title: '用户登录'},
        component: () => import('@/views/Login.vue'),
    },
    {
        path: '/chatrobot',
        name: 'chatrobot',
        component: () => import('@/views/chatrobot/chat.vue'),
    },
    // {
    //     name: 'register',
    //     path: '/register',

    //     meta: {title: '用户注册'},
    //     component: () => import('@/views/Register.vue'),
    // },
    // {
    //     path: '/admin/login',
    //     name: 'admin-login',
    //     meta: {title: 'ChatPuls 控制台登录'},
    //     component: () => import('@/views/admin/Login.vue'),
    // },
    // {
    //     name: 'admin',
    //     path: '/admin',
    //     redirect: '/admin/dashboard',
    //     component: () => import("@/views/admin/Home.vue"),
    //     meta: {title: 'ChatPuls 管理后台'},
    //     children: [
    //         {
    //             path: '/admin/dashboard',
    //             name: 'admin-dashboard',
    //             meta: {title: '仪表盘'},
    //             component: () => import('@/views/admin/Dashboard.vue'),
    //         },
    //         {
    //             path: '/admin/system',
    //             name: 'admin-system',
    //             meta: {title: '系统设置'},
    //             component: () => import('@/views/admin/SysConfig.vue'),
    //         },
    //         {
    //             path: '/admin/user',
    //             name: 'admin-user',
    //             meta: {title: '用户管理'},
    //             component: () => import('@/views/admin/Users.vue'),
    //         },
    //         {
    //             path: '/admin/role',
    //             name: 'admin-role',
    //             meta: {title: '角色管理'},
    //             component: () => import('@/views/admin/Roles.vue'),
    //         },
    //         {
    //             path: '/admin/apikey',
    //             name: 'admin-apikey',
    //             meta: {title: 'API-KEY 管理'},
    //             component: () => import('@/views/admin/ApiKey.vue'),
    //         },
    //         {
    //             path: '/admin/chat/model',
    //             name: 'admin-chat-model',
    //             meta: {title: '语言模型'},
    //             component: () => import('@/views/admin/ChatModel.vue'),
    //         },
    //         {
    //             path: '/admin/product',
    //             name: 'admin-product',
    //             meta: {title: '充值产品'},
    //             component: () => import('@/views/admin/Product.vue'),
    //         },
    //         {
    //             path: '/admin/order',
    //             name: 'admin-order',
    //             meta: {title: '充值订单'},
    //             component: () => import('@/views/admin/Order.vue'),
    //         },
    //         {
    //             path: '/admin/reward',
    //             name: 'admin-reward',
    //             meta: {title: '众筹管理'},
    //             component: () => import('@/views/admin/Reward.vue'),
    //         },
    //         {
    //             path: '/admin/loginLog',
    //             name: 'admin-loginLog',
    //             meta: {title: '登录日志'},
    //             component: () => import('@/views/admin/LoginLog.vue'),
    //         },
    //         {
    //             path: '/admin/functions',
    //             name: 'admin-functions',
    //             meta: {title: '函数管理'},
    //             component: () => import('@/views/admin/Functions.vue'),
    //         },
    //     ]
    // },

    {
        path: '/mobile/chat/session',
        name: 'mobile-chat-session',
        component: () => import('@/views/mobile/ChatSession.vue'),
    },
    {
        name: 'mobile',
        path: '/mobile',
        meta: {title: '云之AI助手'},
        component: () => import('@/views/mobile/Home.vue'),
        redirect: '/mobile/chat/list',
        children: [
            {
                path: '/mobile/chat/list',
                name: 'mobile-chat-list',
                component: () => import('@/views/mobile/ChatList.vue'),
            },
            {
                path: '/mobile/imageSd',
                name: 'mobile-imageSd',
                component: () => import('@/views/mobile/ImageSd.vue'),
            },
            {
                path: '/mobile/apps',
                name: 'mobile-apps',
                component: () => import('@/views/mobile/Apps.vue'),
            },
            {
                path: '/mobile/profile',
                name: 'mobile-profile',
                component: () => import('@/views/mobile/Profile.vue'),
            },
            // {
            //     path: '/mobile/invitation',
            //     name: 'mobile-invitation',
            //     component: () => import('@/views/mobile/Invitation.vue'),
            // },
        ]
    },
    {
        name: 'test',
        path: '/test',
        meta: {title: '测试页面'},
        component: () => import('@/views/Test.vue'),
    },
    {
        name: 'NotFound',
        path: '/:all(.*)',
        meta: {title: '页面没有找到'},
        component: () => import('@/views/404.vue'),
    },
]

// console.log(MY_VARIABLE)
const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes: routes,
})

let prevRoute = null
// dynamic change the title when router change
router.beforeEach((to, from, next) => {
    console.log('router change', to,'-->', from)
    if (to.meta.title) {
        document.title = `${to.meta.title} | ${process.env.VUE_APP_TITLE}`
    }
    prevRoute = from
    next()
})

export {router, prevRoute};