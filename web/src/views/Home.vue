<template>
  <div class="home">
    <div class="header" v-if="showTitle">
      <div class="banner">
        <div class="logo">
          <el-image :src="logo" @click="router.push('/')"/>
        </div>
        <div class="title">
          <span>{{ title }}</span>
        </div>
      </div>

      <div class="navbar">
        <el-dropdown :hide-on-click="true" class="user-info" trigger="click" v-if="loginUser.id">
                        <span class="el-dropdown-link">
                          <el-image :src="loginUser.avatar"/>
                        </span>
          <template #dropdown>
            <el-dropdown-menu class="user-info-menu">
              <el-dropdown-item @click="showConfigDialog = true">
                <el-icon>
                  <UserFilled/>
                </el-icon>
                <span class="username">{{ loginUser.nickname }}</span>
              </el-dropdown-item>

              <el-divider style="margin: 2px 0"/>
              <el-dropdown-item @click="logout">
                <i class="iconfont icon-logout"></i>
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <div v-else>
          <el-button size="small" color="#21aa93" round @click="relogin">重新登录</el-button>
        </div>
      </div>
    </div>
    <div class="main">
      <div class="navigator">
        <ul class="nav-items">
          <li v-for="item in mainNavs" :key="item.url">
            <el-tooltip
                effect="light"
                :content="item.name"
                placement="right">
              <a @click="changeNav(item)" :class="item.url === curPath ? 'active' : ''">
                <el-image :src="item.icon_path" :width="20" v-if="item.icon_path"/>
                <i :class="'iconfont icon-' + item.icon" v-else></i>
              </a>
            </el-tooltip>
            <span :class="item.url === curPath ? 'title active' : 'title'">{{ item.name }}</span>
          </li>

          <el-popover
              v-if="moreNavs.length > 0"
              placement="right-end"
              trigger="hover"
          >
            <template #reference>
              <li>
                <a class="active">
                  <el-image src="/images/menu/more.png" style="width: 30px;height: 30px"/>
                </a>
              </li>
            </template>
            <template #default>
              <ul class="more-menus">
                <li v-for="item in moreNavs" :key="item.url" :class="item.url === curPath ? 'active' : ''">
                  <a @click="changeNav(item)">
                    <el-image :src="item.icon" style="width: 20px;height: 20px"/>
                    <span :class="item.url === curPath ? 'title active' : 'title'">{{ item.name }}</span>
                  </a>
                </li>
              </ul>
            </template>
          </el-popover>
        </ul>
      </div>

      <div class="content custom-scroll" :style="{height: mainWinHeight+'px'}">
        <router-view :key="routerViewKey" v-slot="{ Component }">
          <transition name="move" mode="out-in">
            <component :is="Component"></component>
          </transition>
        </router-view>
      </div>
    </div>

    <login-dialog :show="show" @hide="store.setShowLoginDialog(false)" @success="loginCallback"/>
    <config-dialog v-if="loginUser.id" :show="showConfigDialog" @hide="showConfigDialog = false"/>
  </div>
</template>

<script setup>

import {useRouter} from "vue-router";
import {onMounted, ref, watch} from "vue";
import {httpGet} from "@/utils/http";
import {ElMessage} from "element-plus";
import {UserFilled} from "@element-plus/icons-vue";
import {checkSession} from "@/action/session";
import {removeUserToken} from "@/store/session";
import LoginDialog from "@/components/LoginDialog.vue";
import {useSharedStore} from "@/store/sharedata";
import ConfigDialog from "@/components/ConfigDialog.vue";
import {showMessageError} from "@/utils/dialog";

const router = useRouter();
const logo = ref('/images/logo.png');
const mainNavs = ref([])
const moreNavs = ref([])
const curPath = ref(router.currentRoute.value.path)
const title = ref("")

const loginUser = ref({})
const version = ref(process.env.VUE_APP_VERSION)
const routerViewKey = ref(0)
const showConfigDialog = ref(false)
const licenseConfig = ref({})
const showTitle = ref(true); // 默认值为true

// 从URL参数中读取showTitle
const urlShowTitle = router.currentRoute.value.query.showTitle;
if (urlShowTitle !== undefined) {
  showTitle.value = urlShowTitle === 'true'; // 将字符串转换为布尔值
} else {
  const localStorageShowTitle = sessionStorage.getItem('showTitle');
  showTitle.value = localStorageShowTitle !== null ? localStorageShowTitle === 'true' : true; // 从localStorage读取
}
sessionStorage.setItem('showTitle', showTitle.value);

// 减去顶部导航栏和底部导航栏的高度
const mainWinHeight = window.innerHeight - (showTitle.value?50:0) - 1 

const store = useSharedStore();
const show = ref(false)
watch(() => store.showLoginDialog, (newValue) => {
  show.value = newValue
});

mainNavs.value = [
{url: "/agents", icon_path: "/images/menu/app.png", name: "应用中心", title: "应用中心"},
{url: "/agent/chat", icon_path : "/images/menu/chat.png", name: "对话聊天", title: "对话聊天"},
  // {path: "/chat", icon_path: "/images/chat.png", title: "对话聊天"},
  // {path: "/mj", icon_path: "/images/mj.png", title: "MJ 绘画"},
  // {path: "/sd", icon_path: "/images/sd.png", title: "SD 绘画"},
  // {path: "/apps", icon: "menu", title: "应用中心"},
  // {path: "/images-wall", icon: "image-list", title: "作品展示"},
  // {path: "/knowledge", icon: "book", title: "知识库"},
  // {path: "/member", icon: "vip-user", title: "会员计划"},
  // {path: "/invite", icon: "share", title: "推广计划"},
] ;

if (curPath.value === "/external") {
  curPath.value = router.currentRoute.value.query.url
}
const changeNav = (item) => {
  curPath.value = item.url
  if (item.url.indexOf("http") !== -1) { // 外部链接
    title.value = item.title ;
    router.push({name: 'ExternalLink', query: {url: item.url}})
  } else {
    title.value = item.title ;
    router.replace(item.url)
  }
}

onMounted(() => {
  httpGet("/api/admin/config/get?key=system").then(res => {
    logo.value = res.data.logo
    title.value = res.data.title
  }).catch(e => {
    ElMessage.error("获取系统配置失败：" + e.message)
  })
  // 获取菜单
  // httpGet("/api/menu/list").then(res => {
  //   mainNavs.value = res.data
  //   // 根据窗口的高度计算应该显示多少菜单
  //   const rows = Math.floor((window.innerHeight - 100) / 90)
  //   if (res.data.length > rows) {
  //     mainNavs.value = res.data.slice(0, rows)
  //     moreNavs.value = res.data.slice(rows)
  //   }
  // }).catch(e => {
  //   ElMessage.error("获取系统菜单失败：" + e.message)
  // })

  // httpGet("/api/config/license").then(res => {
  //   licenseConfig.value = res.data
  // }).catch(e => {
  //   showMessageError("获取 License 配置：" + e.message)
  // })

  init()
})

const init = () => {
  checkSession().then(user => {
    loginUser.value = user
  }).catch(() => {
  })
}

const logout = function () {
  httpGet('/api/user/logout').then(() => {
    removeUserToken()
    store.setShowLoginDialog(true)
    loginUser.value = {}
    // 刷新组件
    routerViewKey.value += 1
  }).catch(() => {
    ElMessage.error('注销失败！');
  })
}

const relogin = function() {
  const reloginUrl = process.env.VUE_APP_RELOGIN_URL ;


  if (!reloginUrl) {
    console.error('RELOGIN_URL is undefined. Please check your environment variables.');
  } else {
    console.log('RELOGIN_URL:', reloginUrl);
    window.location.href = reloginUrl;
  }
  
}

const loginCallback = () => {
  init()
  // 刷新组件
  routerViewKey.value += 1
}
</script>

<style lang="stylus" scoped>
@import "@/assets/css/custom-scroll.styl"
@import "@/assets/css/home.styl"
</style>