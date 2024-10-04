<template>
    <!-- demo 用户端 -->
    <div class="client-side-wrap">
        <div class="header-v2"></div>
        <div class="client-side-wrap__main main-v2">
            <div class="client-side-wrap__main-right">
                <div class="chat-wrap">
                    <div class="chat-wrap__main">
                        <div class="chat-wrap__main-header">
                            <div class="chat-header">
                                <CommonHeader/>
                            </div>
                        </div>
                        <div class="chat-wrap__main-chat-content" :style="{ 'margin-bottom': `${chatMainMrgBottom}px` }">
                            <ClientChat @send="onSendQuestion" />
                        </div>
                        <div class="chat-wrap__main-footer">
                            <QuestionInput @send="onSendQuestion" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import '@/utils/chatrobot/ClientData';
import CommonHeader from '@/components/chatrobot/common-header';
import ClientChat from '@/components/chatrobot/client-chat';
import QuestionInput from '@/components/chatrobot/question-input';
import { MESSAGE_TYPE } from '@/constants/chatrobot';
import '@/utils/chatrobot/chatbotmain'
import { getCurrentInstance , ref} from 'vue';
import {ElMessage, ElMessageBox} from "element-plus";
import moment from 'moment';
import '@/utils/chatrobot/chatrobot'
import { globalRobotData } from '@/utils/chatrobot/chatbotinit';
import { eventHubData } from '@/utils/chatrobot/EventHub';
import {checkSession} from "@/action/session";
import { httpGet, httpPost } from '@/utils/http';
import { useRoute } from 'vue-router';
import {router } from '@/router'
import { Socket } from '@/utils/chatrobot/Socket';
import { setUserToken } from '@/store/session';
const loginUser = ref(null)

const retryCount = ref(0) ;

export default {
    name: '微心助手',
    components: {
        CommonHeader,
        ClientChat,
        QuestionInput
    },
    data () {
        return {
            chatMainMrgBottom: 140
        };
    },
    mounted () {
      const app = getCurrentInstance();
      checkSession().then(user => {
        loginUser.value = user ;
        localStorage.setItem('lke_robot_userid', user.id);
        this.connectLkeRobot() ;
        // initChatbot(user)
      }).catch(() => {
        // 允许游客使用， 创建新的会话
        this.guestLogin();
        // router.push('/login')
        // useRouter().push('/login')
      })

      this.$eventHub = eventHubData.eventHub;
        
        // 监听用户端ws事件
        this.listenClientEvent();
        // let mixin = import('@/utils/chatrobot/chatrobot');
        // app.mixin(mixin);

        try {
          let iconpath = 'https://cdn3.codesign.qq.com/icons/XzKaDZdEa7j2GPL/latest/iconfont.js';
          let script = document.createElement('script');
          script.setAttribute('src', iconpath);
          document.head.appendChild(script);
        } catch (e) {
          console.log('load remote icon error');
        }
    },
    created () {

    },
    methods: {
      connectLkeRobot() {
        let userid = localStorage.getItem('lke_robot_userid') ;
        if(userid == null) {
          this.guestLogin() ;
          return ;
        }
        httpGet('/api/lke/getWsToken?bizid=' + userid).then(res => {
          let wsToken = res.data ;
          Socket.reconnectWsSocket(wsToken);
          // Socket.
        }).catch(e => {
            ElMessageBox.alert("操作失败：" + e.message);
        }) ;
      },
      // 访客连接
      guestLogin() {
        let userid = localStorage.getItem('lke_robot_userid') ;
        if(userid == null) {
          userid = moment().format('YYYYMMDDHHmmss') + Math.floor(Math.random() * 1000);
          localStorage.setItem('lke_robot_userid', userid);
        }
        httpPost('/api/user/guestLogin',  {username: userid}).then((res) => {
          setUserToken(res.data);
          // 获取LKE WsToken， 启动连接
          this.connectLkeRobot();
        }).catch((e) => {
          console.log(e)
          // 失败后， 提示用户失败， 用户点击继续后重新登录
          ElMessageBox.confirm('系统繁忙，请稍候再试', '失败', {
            confirmButtonText: '重试',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.guestLogin()
          }).catch(() => {
            
          })
        })
      },
        // 监听用户端ws事件
        listenClientEvent () {
            // 监听配置信息，获取机器人和问答库可用状态
            this.$eventHub.$on('client_configChange', (res) => {
                this.isAvailable = res.is_available; // 机器人与问答库是否可用，不可用则页面展示”维护中“状态
            });
            // 监听历史记录拉取成功事件
            this.$eventHub.$on('client_msgContentChange', (res) => {
                const { chatsContent, type } = res;
                if (type === MESSAGE_TYPE.ANSWER && chatsContent.length > 0) {
                    // 主动推送记录数目录数 > 0，则隐藏欢迎页，进入绘会话页，并展示拉取的历史记录
                    this.isWeclome = false;
                }
                if (type === MESSAGE_TYPE.HISTORY && chatsContent.length > 0) {
                    // 历史记录数 > 0，则隐藏欢迎页，进入绘会话页，并展示拉取的历史记录
                    this.isWeclome = false;
                }
            });
                        // 监听历史记录拉取成功事件
            this.$eventHub.$on('error', (res) => {
                console.log('chat socket error,  try reconnect!!');
                retryCount.value ++ 
                if(retryCount.value < 3) {
                  this.connectLkeRobot();
                } else {
                  ElMessageBox.alert('连接失败，请刷新页面重试');
                  retryCount = 0 ;
                }
            });

            this.$eventHub.$on('connect', (res) => {
              globalRobotData.clientData.sendHistoryRequest();

            });
        },
        // 发送问题上行消息
        onSendQuestion (question) {
            console.log('onSendQuestion');
            globalRobotData.clientData.triggerSendMsg(question);
        }
    }
};
</script>

<style lang="less">
.client-side-wrap {
  display: flex;
  height: 100vh;
  overflow-x: hidden;
  background: linear-gradient(180deg, #EAEEF6 0%, #FFFFFF 100%), #FFFFFF;
  .main-v2 {
    background: url('../../assets/img/bg-c2.png');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    .header-v2 {
      position: absolute;
      left: 0;
      .logo-img-v2 {
        padding: 50px;
        height: 24px;
        margin-bottom: 30px;
      }
      @media screen and (max-width: 1000px)  {
        .logo-img-v2 {
          display: none;
        }
      }
    }
  }
  &__main {
    position: relative;
    display: flex;
    padding: 0 0px;
    width: 100%;

    &-left {
      padding-top: 100px;

      .logo-img {
        height: 24px;
        margin-bottom: 30px;
      }
    }

    &-right {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  }
}

.chat-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 1080px;
  display: flex;
  justify-content: center;
  align-items: center;

  &__main {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 700px;
    overflow: hidden;
    background: var(--color-bg-0);
    border-radius: 12px;
    // margin-right: 35%;
    // box-shadow: -4px -4px 8px rgba(255, 255, 255, 0.9), -24px -24px 48px rgba(255, 255, 255, 0.9), 24px 24px 48px rgba(18, 54, 153, 0.1);
    box-shadow: 0px 24px 48px rgba(18, 54, 153, 0.1);

    &-chat-content {
      height: ~"calc(100% - 80px)" ;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: end;
      -ms-flex-pack: end;
          justify-content: flex-end;
  -webkit-box-align: end;
      -ms-flex-align: end;
          align-items: flex-end;
    }

    &-content {
      height: ~"calc(100% - 80px)";
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: end;
      -ms-flex-pack: end;
          justify-content: flex-end;
  -webkit-box-align: end;
      -ms-flex-align: end;
          align-items: flex-end;
    }
    &-footer {
      position: relative;
      z-index: 3;
    }
  }
}
</style>
