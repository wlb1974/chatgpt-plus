import { getCurrentInstance } from 'vue';

export class EventHub {
    constructor (vm) {
        this.vm = vm;
        this.curVm = null;
        this.events = {};
        this.eventMapUid = {};
    }
    $init(vm) {
        this.vm = vm;
    }

    $register (vm) {
        this.curVm = vm;
    }
    setEventMapUid (uid, type) {
        if (!this.eventMapUid[uid]) {
            this.eventMapUid[uid] = [];
        }
        this.eventMapUid[uid].push(type);
    }
    $on (type, fn) {
        if (!this.events[type]) {
            this.events[type] = [];
        }
        this.events[type].push(fn);
        if(this.vm !== null) {
            // if (this.curVm instanceof this.vm) {
            //     this.setEventMapUid(this.curVm._uid, type);
            // }
        }

    }
    $emit (type, ...args) {
        if (this.events[type]) {
            this.events[type].forEach(fn => fn(...args));
        }
    }
    $off (type, fn) {
        if (fn && this.events[type]) {
            const index = this.events[type].findIndex(f => f === fn);
            if (index !== -1) {
                this.events[type].splice(index, 1);
            }
            return;
        }
        delete this.events[type];
    }
    $offAll (uid) {
        const curAllTypes = this.eventMapUid[uid] || [];
        curAllTypes.forEach(type => this.$off(type));
        delete this.eventMapUid[uid];
    }
}


export const eventHubData = {
    eventHub : new EventHub(null)
}