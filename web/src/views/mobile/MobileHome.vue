<template>
  <van-config-provider :theme="theme">
    <div class="mobile-home" :class="{ 'dark-theme': isDarkTheme }">
      <router-view/>
    </div>
  </van-config-provider>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { getMobileTheme, setMobileTheme } from "@/store/system";
import { useRouter } from "vue-router";
import { isMobile } from "@/utils/libs";
import bus from '@/store/eventbus'

const router = useRouter()
if (!isMobile()) {
  router.replace('/')
}

const active = ref('home')
const theme = ref(getMobileTheme())
const isDarkTheme = computed(() => theme.value === 'dark')

watch(theme, (newTheme) => {
  console.log('主题已更改为:', newTheme)
  document.body.classList.toggle('van-theme-dark', newTheme === 'dark')
})

bus.on('changeTheme', (value) => {
  console.log('收到changeTheme事件:', value)
  theme.value = value
  setMobileTheme(theme.value)
})

onMounted(() => {
  // 初始化主题为黑色
  theme.value = 'dark'
  sessionStorage.setItem('no_bottom_navigator_bar','1');
})

// 添加一个函数来手动切换主题（用于测试）
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  setMobileTheme(theme.value)
  console.log('手动切换主题为:', theme.value)
}

// 将toggleTheme暴露给模板
defineExpose({ toggleTheme })

</script>

<style lang="stylus">
@import '@/assets/iconfont/iconfont.css';
.mobile-home {
  .container {
    .van-nav-bar {
      position fixed
      width 100%
    }

    padding 0 10px
  }

  &.dark-theme {
    background-color: #1c1c1e;
    color: #ffffff;
  }
}

// 黑色主题
.van-theme-dark body {
  background #1c1c1e
}

.van-nav-bar {
  position fixed
  width 100%
}
</style>