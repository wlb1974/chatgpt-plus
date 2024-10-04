import {httpGet} from "@/utils/http";

export function checkSession() {
    return new Promise((resolve, reject) => {
        httpGet('/api/user/session').then(res => {

            if(res.code === 0) {
                resolve(res.data)
            }
            else {
                reject(res.data)
            }
        }).catch(err => {
            reject(err)
        })
    })
}

export function checkAdminSession() {
    return new Promise((resolve, reject) => {
        httpGet('/api/admin/session').then(res => {
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}