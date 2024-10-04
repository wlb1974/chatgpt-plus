// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
/* eslint-disable-next-line */
/* eslint-disable */
// import Vue from 'vue';
import moment from 'moment';
// import App from './App';
// import router from './router';
import { TEST_TOKEN } from '@/constants/chatrobot';
import { getCurrentInstance } from 'vue';

// const vhtml = window.vhtml;
// Vue.use(vhtml);
// vhtml.install(Vue);

// try {
//     let iconpath = 'https://cdn3.codesign.qq.com/icons/XzKaDZdEa7j2GPL/latest/iconfont.js';
//     vhtml.Icon.setDefaultRemoteSrc && vhtml.Icon.setDefaultRemoteSrc(iconpath);
// } catch (e) {
//     console.log('load remote icon error');
// }

// const app = getCurrentInstance();
// app.config.productionTip = false;
// app.prototype.moment = moment;

// router.beforeEach((to, from, next) => {
//     document.title = to.meta.title || '企点智能客服';
//     if (to.name && window.$initType !== to.name) {
//         window.location.reload();
//     }
//     next();
// });

let webIMType; // 后端ws识别的端类型
let webIMSource; // 前端区分UI交互的端类型

webIMType = [5];
window.$initTypeKey = 5;
webIMSource = 'client';

// app.prototype.webIMSource = webIMSource;

Object.defineProperty(window, 'userType', {
    writable: false,
    enumerable: false,
    configurable: false,
    value: 2
});

window.$initType = 'ChatDemo';

let tokenGet = webIMType.map(type => {
    return new Promise((resolve, reject) => {
        let result = {
            type: type,
            token: TEST_TOKEN
        };
        resolve(result);
    });
});

Promise.all(tokenGet).then(res => {
    Object.defineProperty(window, 'webimToken', {
        writable: false,
        enumerable: false,
        configurable: false,
        value: res
    });
    // (async () => {
    //     const app = getCurrentInstance();
    //     let mixin = await import('./chatrobot');
    //     app.mixin(mixin);
    // })();
}).catch(e => {
});
