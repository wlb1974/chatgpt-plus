import axios from 'axios'
import {getAdminToken, getSessionId, getUserToken} from "@/store/session";

axios.defaults.timeout = 30000
axios.defaults.baseURL = process.env.VUE_APP_API_HOST
axios.defaults.withCredentials = true;
axios.defaults.headers.post['Content-Type'] = 'application/json'

// HTTP拦截器
axios.interceptors.request.use(
    config => {
        // set token
        config.headers['Chat-Token'] = getSessionId();
        config.headers['Authorization'] = getUserToken();
        config.headers['Admin-Authorization'] = getAdminToken();
        return config
    }, error => {
        return Promise.reject(error)
    })
axios.interceptors.response.use(
    response => {
        let data = response.data;
        if (data.code === 0) {
            return response
        } 
        else  if(data.code == 401 && !window.location.href.indexOf("/login") == -1){  // 未登录并且非登录页，跳转到登录页
            window.location.href = "/login";
        }
        else {
            return Promise.reject(response.data)
        }
    }, error => {
        return Promise.reject(error)
    })


// send a http get request
export function httpGet(url, params = {}) {
    return new Promise((resolve, reject) => {
        axios.get(url, {
            params: params
        }).then(response => {
            resolve(response.data)
        }).catch(err => {
            reject(err)
        })
    })
}


// send a http post request
export function httpPost(url, data = {}, options = {}) {
    return new Promise((resolve, reject) => {
        axios.post(url, data, options).then(response => {
            resolve(response.data)
        }).catch(err => {
            reject(err)
        })
    })
}
