<template>
    <div class="page-apps custom-scroll">
      <div class="title">
        云之AI助手应用中心
      </div>
      <div class="inner" :style="{height: listBoxHeight + 'px'}">
        <ItemList :items="list" v-if="list.length > 0" :gap="20" :width="250">
          <template #default="scope">
            <div class="app-item" 
                 :style="{width: scope.width+'px'}" 
                 @click="goToChat(scope.item.id)">
              <el-image :src="scope.item.icon" fit="cover" :style="{height: scope.width+'px'}"/>
              <div class="title">
                <span class="name">{{ scope.item.name }}</span>
              </div>
              <div class="hello-msg" ref="elements">{{ scope.item.intro }}</div>
            </div>
          </template>
        </ItemList>
      </div>
  
      <login-dialog :show="showLoginDialog" @hide="getRoles"/>
    </div>
  </template>
  
  <script setup>
  import {onMounted, ref} from "vue"
  import {ElMessage} from "element-plus";
  import {httpGet, httpPost} from "@/utils/http";
  import ItemList from "@/components/ItemList.vue";
  import {Delete, Plus} from "@element-plus/icons-vue";
  import LoginDialog from "@/components/LoginDialog.vue";
  import {checkSession} from "@/action/session";
  import {arrayContains, removeArrayItem, substr} from "@/utils/libs";
  import {useRouter} from 'vue-router';
  
  const listBoxHeight = window.innerHeight - 97
  const list = ref([])
  const showLoginDialog = ref(false)
  const roles = ref([])
  const elements = ref(null)
  const router = useRouter()
  onMounted(() => {
    httpGet("/api/role/list?all=true").then((res) => {
      const items = res.data
      // 处理 hello message
      for (let i = 0; i < items.length; i++) {
        items[i].intro = substr(items[i].helloMsg, 80)
        items[i].key = items[i].marker
      }
      list.value = items
    }).catch(e => {
      ElMessage.error("获取应用失败：" + e.message)
    })
  
    getRoles()
  })
  
  const getRoles = () => {
    showLoginDialog.value = false
    checkSession().then(user => {
      roles.value = JSON.parse(user.chatRolesJson)
    }).catch(() => {
    })
  }

  const goToChat = (roleId) => {
    router.push({ path: '/agent/chat', query: { roleId } })
  }

  </script>
  
  <style lang="stylus">
  @import "@/assets/css/chat-app.styl"
  @import "@/assets/css/custom-scroll.styl"
  </style>
