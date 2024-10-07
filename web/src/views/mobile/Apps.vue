<template>
    <div class="index container">
      <h2 class="title">{{title}}</h2>
      <van-notice-bar  left-icon="info-o" :scrollable="true">{{slogan}}</van-notice-bar>

      <div class="content">
        
        <div class="app-list">
          <van-list
              v-model:loading="loading"
              :finished="true"
              finished-text=""
              @load="fetchApps"
          >
            <van-cell v-for="item in apps" :key="item.id">
              <div @click="useRole(item.id)">
                <div class="item">
                  <div class="image">
                    <van-image :src="item.icon" />
                  </div>
                  <div class="info">
                    <div class="info-title">{{item.name}}</div>
                    <div class="info-text">{{item.helloMsg}}</div>
                  </div>
                </div>  
              </div>
            </van-cell>
          </van-list>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import {onMounted, ref} from "vue";
  import {useRouter} from "vue-router";
  import {checkSession} from "@/action/session";
  import {httpGet, httpPost} from "@/utils/http";
  import {arrayContains, removeArrayItem, showLoginDialog, substr} from "@/utils/libs";
  import {showNotify} from "vant";
  import {ElMessage} from "element-plus";
  
  const title = ref(process.env.VUE_APP_TITLE)
  const router = useRouter()
  const isLogin = ref(false)
  const apps = ref([])
  const loading = ref(false)
  const roles = ref([])
  const slogan = ref('你有多大想象力，AI就有多大创造力！')
  
  onMounted(() => {
  
    checkSession().then((user) => {
      isLogin.value = true
      roles.value = user.chat_roles
      httpGet("/api/admin/config/get?key=system").then(res => {
        title.value = res.data.title
        if (res.data.slogan) {
            slogan.value = res.data.slogan
        }
        }).catch(e => {
        ElMessage.error("获取系统配置失败：" + e.message)
      })
      fetchApps()
    }).catch(() => {
    })
  })
  
  const fetchApps = () => {
    httpGet("/api/role/list?all=true").then((res) => {
      const items = res.data

      // 处理 hello message
      for (let i = 0; i < items.length; i++) {
        items[i].intro = substr(items[i].helloMsg, 80)
      }
      apps.value = items
    }).catch(e => {
      showNotify({type:"danger", message:"获取应用失败：" + e.message})
    })
  }
  
  const updateRole = (row, opt) => {
    if (!isLogin.value) {
      return showLoginDialog(router)
    }
  
    const title = ref("")
    if (opt === "add") {
      title.value = "添加应用"
      const exists = arrayContains(roles.value, row.key)
      if (exists) {
        return
      }
      roles.value.push(row.key)
    } else {
      title.value = "移除应用"
      const exists = arrayContains(roles.value, row.key)
      if (!exists) {
        return
      }
      roles.value = removeArrayItem(roles.value, row.key)
    }
    httpPost("/api/role/update", {keys: roles.value}).then(() => {
      ElMessage.success({message: title.value + "成功！", duration: 1000})
    }).catch(e => {
      ElMessage.error(title.value + "失败：" + e.message)
    })
  }
  
  const hasRole = (roleKey) => {
    return arrayContains(roles.value, roleKey, (v1, v2) => v1 === v2)
  }
  
  const useRole = (roleId) => {
    if (!isLogin.value) {
      return showLoginDialog(router)
    }
    router.push(`/mobile/chat/session?role_id=${roleId}`)
  }
  </script>
  
  <style scoped lang="stylus">
  .index {
    color var(--van-text-color)
    .title {
      display flex
      justify-content center
  
    }
    --van-notice-bar-font-size: 16px
  
    .content {
      padding 15px 0 60px 0
      .van-grid-item {
        .iconfont {
          font-size 20px
        }
        .text {
          display flex
          width 100%
          padding 10px
          justify-content center
          font-size 14px
        }
      }
  
      .app-list {
        padding-top 10px
  
        .item {
          display flex
          .image {
            width 80px
            height 80px
            min-width 80px
            border-radius 5px
            overflow hidden
          }
  
          .info {
            text-align left
            padding 0 10px
            .info-title {
              color var(--van-text-color)
              font-size 1.25rem
              line-height 1.75rem
              letter-spacing: .025em;
              font-weight: 600;
              word-break: break-all;
              overflow: hidden;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 1;
            }
  
            .info-text {
              padding 5px 0
              overflow: hidden;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
              word-break: break-all;
              font-size: .875rem;
            }
          }
        }
  
        .btn {
          padding 5px 0
          .van-button {
            margin-right 10px
  
            .van-icon {
              margin-right 5px
            }
          }
        }
      }
    }
  }
  </style>
  