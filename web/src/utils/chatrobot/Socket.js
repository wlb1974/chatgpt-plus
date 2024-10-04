import { getCurrentInstance } from 'vue';
import io from 'socket.io-client';
import { TEST_TOKEN } from '@/constants/chatrobot';
import { eventHubData } from './EventHub';
import { ElMessage } from 'element-plus';

const origin = process.env.WS_BASE_URL ? process.env.WS_BASE_URL : "wss://wss.lke.cloud.tencent.com";
let path = '/v1/qbot/chat/conn/';
let initSocket = 1;

// let tokenArr = window.webimToken || [];
// let mainToken = tokenArr.filter(item => {
//     return item.type !== 4;
// })[0].token;

let mainToken = '' ;

let socket = io(origin, {
    path: path,
    transports: ['websocket', 'polling'],
    withCredentials: true,
    auth: async (cb) => {
        /* eslint-disable */
        try {
            if (initSocket === 1) {
                console.log(mainToken)
                // token = TEST_TOKEN ;
                const token = mainToken || '';
                console.log('token', token)
                if (token) {
                    cb({ token: token });
                    initSocket++;
                } else {
                    // cb({ token: '' });
                }
            } else {
                cb({ token: mainToken });
                initSocket++;
            }
        } catch (e) {
            cb({ token: '' });
            ElMessage.error('获取token失败');
        }
    }
}); // 建立连接

let systemEventEmit = (eventName, data) => {
    try {
        console.log('emit', eventName, data)
        eventHubData.eventHub.$emit(eventName, data);
    }
    catch(e) {
        console.log(e)
    }

};

// 监听
socket.on('connect', () => {
  console.log('connect');
    // 监听连接是否成功
    systemEventEmit('connect');
});
socket.on('connect_error', () => {
    systemEventEmit('connectError');
    socket.connect();
});
socket.on('error', () => {
    systemEventEmit('error');
});
socket.on('disconnect', (reason) => {
    // 监听连接异常中断
    systemEventEmit('disconnect', reason);
});
socket.io.on('error', (error) => {
    systemEventEmit('SocketError', error);
});
socket.io.on('reconnect', (attemptNumber) => {
    systemEventEmit('reconnect', `Reconnected to server after ${attemptNumber} attempts`);
});
socket.io.on('reconnect_attempt', (attemptNumber) => {
    systemEventEmit('reconnectAttempt', `Attempt number ${attemptNumber} to reconnect to server`);
});
socket.io.on('reconnect_error', (error) => {
    systemEventEmit('reconnectError', error);
});
socket.io.on('reconnect_failed', () => {
    systemEventEmit('reconnectFailed');
});

export let Socket = {
    emit (eventName, params) {
        let data = {
            payload: params
        };
        socket.emit(eventName, data);
    },
    on (eventName, cb) {
        let dataCB = (data) => {
            cb(data ? data.payload : data);
        };
        socket.on(eventName, dataCB);
    },
    reconnectWsSocket(wsToken) {
        mainToken = wsToken ;
        socket.disconnect();
        socket.connect() ;
    }
};

// const app = getCurrentInstance();
// app.prototype.$socket = Socket;
