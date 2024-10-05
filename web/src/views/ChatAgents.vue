<template>
    <div>
      <div class="page-apps custom-scroll">
        <div class="inner" :style="{height: listBoxHeight + 'px'}">
          <ItemList :items="list" v-if="list.length > 0" :gap="15" :width="300">
            <template #default="scope">
              <div class="item"  @click="goToChat(scope.item.id)" style="width: 100%;">
                <div class="image">
                  <el-image :src="scope.item.icon" fit="cover"/>
                </div>
  
                <div class="inner">
                  <div class="info">
                    <div class="info-title">{{ scope.item.name }}</div>
                    <div class="info-text">{{ scope.item.helloMsg }}</div>
                  </div>
                </div>
  
  
              </div>
              <!--            <div class="app-item">-->
              <!--              <el-image :src="scope.item.icon" fit="cover"/>-->
              <!--              <div class="title">-->
              <!--                <span class="name">{{ scope.item.name }}</span>-->
              <!--                <div class="opt">-->
              <!--                  <div v-if="hasRole(scope.item.key)">-->
              <!--                    <el-button size="small" type="success" @click="useRole(scope.item)">使用</el-button>-->
              <!--                    <el-button size="small" type="danger" @click="updateRole(scope.item,'remove')">移除</el-button>-->
              <!--                  </div>-->
              <!--                  <el-button v-else size="small"-->
              <!--                             style="&#45;&#45;el-color-primary:#009999"-->
              <!--                             @click="updateRole(scope.item, 'add')">-->
              <!--                    <el-icon>-->
              <!--                      <Plus/>-->
              <!--                    </el-icon>-->
              <!--                    <span>添加应用</span>-->
              <!--                  </el-button>-->
              <!--                </div>-->
              <!--              </div>-->
              <!--              <div class="hello-msg" ref="elements">{{ scope.item.intro }}</div>-->
              <!--            </div>-->
            </template>
          </ItemList>
        </div>
      </div>
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
    httpGet("/api/role/list").then((res) => {
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

  const hasRole = (roleKey) => {
    return arrayContains(roles.value, roleKey, (v1, v2) => v1 === v2)
  }

  const goToChat = (roleId) => {
    router.push({ path: '/agent/chat', query: { roleId } })
  }

  </script>
  
  <style lang="stylus">
  @import "@/assets/css/chat-app.styl"
  @import "@/assets/css/custom-scroll.styl"
  </style>
