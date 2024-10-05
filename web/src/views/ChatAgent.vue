<template>
    <div class="common-layout">
      <el-container>
        <el-aside>
          <div class="chat-list">
            <el-button @click="newChat" color="#21aa93">
              <el-icon style="margin-right: 5px">
                <Plus/>
              </el-icon>
              新建对话
            </el-button>
  
            <div class="search-box">
              <el-input v-model="chatName" placeholder="搜索会话" @keyup="searchChat($event)" style=""
                        class="search-input">
                <template #prefix>
                  <el-icon class="el-input__icon">
                    <Search/>
                  </el-icon>
                </template>
              </el-input>
            </div>
  
            <div class="content" :style="{height: leftBoxHeight+'px'}">
              <el-row v-for="chat in chatList" :key="chat.chat_id">
                <div :class="chat.chat_id === activeChat.chat_id?'chat-list-item active':'chat-list-item'"
                     @click="changeChat(chat)">
                  <el-image :src="chat.icon" class="avatar"/>
                  <span class="chat-title-input" v-if="chat.edit">
                    <el-input v-model="tmpChatTitle" size="small" @keydown="titleKeydown($event, chat)"
                              :id="'chat-'+chat.chat_id"
                              @blur="editConfirm(chat)"
                              @click="stopPropagation($event)"
                              placeholder="请输入标题"/>
                  </span>
                  <span v-else class="chat-title">{{ chat.title }}</span>
  
                  <span class="chat-opt">
                    <el-dropdown trigger="click">
                      <span class="el-dropdown-link" @click="stopPropagation($event)">
                        <el-icon><More/></el-icon>
                      </span>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item :icon="Edit" @click="editChatTitle(chat)">重命名</el-dropdown-item>
                          <el-dropdown-item :icon="Delete"
                                            style="--el-text-color-regular: var(--el-color-danger);
                                            --el-dropdown-menuItem-hover-fill:#F8E1DE;
                                            --el-dropdown-menuItem-hover-color: var(--el-color-danger)"
                                            @click="removeChat(chat)">删除</el-dropdown-item>
                          <el-dropdown-item :icon="Share" @click="shareChat(chat)">分享</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </span>
                </div>
              </el-row>
            </div>
          </div>
  
          <div class="tool-box">
            <el-button type="danger" size="small" @click="clearAllChats">
              <i class="iconfont icon-clear"></i> 清空聊天记录
            </el-button>
          </div>
        </el-aside>
        <el-main v-loading="loading" element-loading-background="rgba(122, 122, 122, 0.3)">
          <div class="chat-container">
            <div class="chat-config">
              <el-select v-model="roleId" filterable placeholder="角色" @change="_newChat"
                         class="role-select"
                         style="width:150px" disabled>
                <el-option
                    v-for="item in roles"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                >
                  <div class="role-option">
                    <el-image :src="item.icon"></el-image>
                    <span>{{ item.name }}</span>
                  </div>
                </el-option>
              </el-select>
  
             
            </div>
  
            <div>
              <div id="container" :style="{height: mainWinHeight+'px'}">
                <div class="chat-box" id="chat-box" :style="{height: chatBoxHeight+'px'}">
                  <div v-if="showHello">
                    <welcome @send="autofillPrompt"/>
                  </div>
                  <div v-for="item in chatData" :key="item.id" v-else>
                    <chat-prompt
                        v-if="item.type==='prompt'"
                        :icon="item.icon"
                        :created-at="dateFormat(item['created_at'])"
                        :tokens="item['tokens']"
                        :model="getModelValue(modelID)"
                        :content="item.content"/>
                    <chat-reply v-else-if="item.type==='reply'" :data="item" @regen="reGenerate" :read-only="false"/>
                  </div>
                </div><!-- end chat box -->
  
                <div class="input-box">
                  <div class="input-box-inner">
                    <span class="tool-item" @click="ElMessage.info('暂时不支持语音输入')">
                      <el-tooltip class="box-item" effect="dark" content="语音输入">
                        <i class="iconfont icon-mic-bold"></i>
                      </el-tooltip>
                    </span>
  
  
                    <div class="input-body">
                      <div ref="textHeightRef" class="hide-div">{{prompt}}</div>
                      <div class="input-border">
                        <textarea
                              ref="inputRef"
                              class="prompt-input"
                              :rows="row"
                              v-model="prompt"
                              @keydown="onInput"
                              @input="onInput"
                              placeholder="按 Enter 键发送消息，使用 Ctrl + Enter 换行"
                              autofocus>
                        </textarea>
                        <span class="send-btn">
                          <el-button type="info" v-if="showStopGenerate" @click="stopGenerate" plain>
                            <el-icon>
                              <VideoPause/>
                            </el-icon>
                          </el-button>
                          <el-button @click="sendMessage" color="#19c37d" style="color:#ffffff" v-else>
                            <el-icon><Promotion/></el-icon>
                          </el-button>
                        </span>
                      </div>
  
                    </div>
                  </div><!-- end input box -->
                </div>
              </div><!-- end container -->
            </div><!-- end loading -->
          </div>
        </el-main>
      </el-container>
  
      <el-dialog
          v-model="showNotice"
          :show-close="true"
          class="notice-dialog"
          title="网站公告"
      >
        <div class="notice">
          <div v-html="notice"></div>
  
          <p style="text-align: right">
            <el-button @click="notShow" type="success" plain>我知道了，不再显示</el-button>
          </p>
        </div>
      </el-dialog>
    </div>
  
  
  </template>
  <script setup>
  import {nextTick, onMounted, ref} from 'vue'
  import ChatPrompt from "@/components/ChatPrompt.vue";
  import ChatReply from "@/components/ChatReply.vue";
  import {
    ArrowDown,
    Check,
    Close,
    Delete,
    Edit,
    Plus,
    Promotion,
    RefreshRight,
    Search,
    Tools,
    VideoPause
  } from '@element-plus/icons-vue'
  import 'highlight.js/styles/a11y-dark.css'
  import {dateFormat, isMobile, processContent,
    processPrompt,randString, removeArrayItem, UUID} from "@/utils/libs";
  import {ElMessage, ElMessageBox} from "element-plus";
  import hl from "highlight.js";
  import {getSessionId, getUserToken, removeUserToken} from "@/store/session";
  import {httpGet, httpPost} from "@/utils/http";
  import {useRouter} from "vue-router";
  import Clipboard from "clipboard";
  import ConfigDialog from "@/components/ConfigDialog.vue";
  import {checkSession} from "@/action/session";
  import Welcome from "@/components/Welcome.vue";
  import ChatMidJourney from "@/components/ChatMidJourney.vue";
  import TurndownService from 'turndown';
  
  
  const title = ref('云之AI');
  const models = ref([])
  const modelID = ref(0)
  const chatData = ref([]);
  const allChats = ref([]); // 会话列表
  const chatList = ref(allChats.value);
  const activeChat = ref({});
  const mainWinHeight = ref(0); // 主窗口高度
  const chatBoxHeight = ref(0); // 聊天内容框高度
  const leftBoxHeight = ref(0);
  const loading = ref(true);
  const loginUser = ref(null);
  const roles = ref([]);
  const roleId = ref(0)
  const newChatItem = ref(null);
  const router = useRouter();
  const showConfigDialog = ref(false);
  const isLogin = ref(false)
  const showHello = ref(true)
  const textInput = ref(null)
  const showFeedbackDialog = ref(false)
  const showDemoNotice = ref(false)
  const showNoticeKey = ref("SHOW_DEMO_NOTICE_")
  
  const query = ref(router.currentRoute.value.query);
  if (isMobile()) {
    router.replace("/mobile")
  }
  
  onMounted(() => {  
     // 检查 query 中的 roleId
    console.log("query=" + JSON.stringify(query));
    var role = query.value.roleId ? query.value.roleId : null; // 安全获取 roleId
    console.log("roleId=" + role);
    if (role === null) {
        router.replace("/agents");
        return;
    }

    resizeElement();
    checkSession().then((user) => {
      loginUser.value = user
      isLogin.value = true
      // 获取会话列表
      httpGet("/api/chat/list?user_id=" + loginUser.value.id + "&role_id=" + role).then((res) => {
        if (res.data) {
          chatList.value = res.data;
          allChats.value = res.data;
        }
 
          // 加载角色列表
          httpGet(`/api/role/list?user_id=${user.id}`).then((res) => {
            roles.value = res.data;
            roleId.value = parseInt(role);
            console.log("roleId=" + roleId.value);  

            const chatId = null;
            if(chatList != null && chatList.size > 0) {
              chatId = chatList[0].chatId ;
            }
            const chat = getChatById(chatId)
            if (chat === null) {
              // 创建新的对话
              newChat();
            } else {
              // 加载对话
              loadChat(chat)
            }
          }).catch((e) => {
            ElMessage.error('获取聊天角色失败: ' + e.messages)
          })
      }).catch(() => {
        // TODO: 增加重试按钮
        ElMessage.error("加载会话列表失败！")
      })
  
    //   httpGet("/api/admin/config/get?key=system").then(res => {
    //     title.value = res.data.title
    //     const show = localStorage.getItem(showNoticeKey.value + loginUser.value.username)
    //     if (!show) {
    //       showDemoNotice.value = res.data['show_demo_notice']
    //     }
    //   }).catch(e => {
    //     ElMessage.error("获取系统配置失败：" + e.message)
    //   })
    }).catch(() => {
      router.push('/login')
    });
  
    const clipboard = new Clipboard('.copy-reply, .copy-code-btn');
    clipboard.on('success', () => {
      ElMessage.success('复制成功！');
    })
  
    clipboard.on('error', () => {
      ElMessage.error('复制失败！');
    })
  
    window.onresize = () => resizeElement();
  });
  
  const getRoleById = function (rid) {
    for (let i = 0; i < roles.value.length; i++) {
      if (roles.value[i]['id'] === rid) {
        return roles.value[i];
      }
    }
    return null;
  }
  
  const resizeElement = function () {
    chatBoxHeight.value = window.innerHeight - 51 - 82 - 38;
    mainWinHeight.value = window.innerHeight - 51;
    leftBoxHeight.value = window.innerHeight - 43 - 47 - 45;
  };
  
  // 新建会话
  const newChat = function () {
    checkSession().then((user) => {
      console.info("chatItem=" + JSON.stringify(newChatItem) + "  roles[0]=" + JSON.stringify(roles.value[0])) ;
    // 已有新开的会话
    if (newChatItem.value !== null && newChatItem.value['roleId'] === roles.value[0]['id']) {
      return;
    }
  
    console.log("roleId=" + JSON.stringify(roleId.value));
    console.log("roles=" + JSON.stringify(roles.value));

    // 获取当前聊天角色图标
    let icon = '';
    roles.value.forEach(item => {
      if (item['id'] === roleId.value) {
        icon = item['icon']
      }
    })
    console.log("icon=" + icon);
    newChatItem.value = {
      chatId: "",
      icon: icon,
      roleId: roleId.value,
      modelId: modelID.value,
      title: '新建会话',
      edit: false,
      removing: false,
    };
    activeChat.value = {} //取消激活的会话高亮
    showStopGenerate.value = false;
    showReGenerate.value = false;
    connect(null, roleId.value)
  
    }) ;
  
  }
  
  // 切换会话
  const changeChat = (chat) => {
    localStorage.setItem("chat_id", chat.chatId)
    loadChat(chat)
  }
  
  const loadChat = function (chat) {
    if (activeChat.value['chatId'] === chat.chatId) {
      return;
    }
    activeChat.value = chat
    newChatItem.value = null;
    roleId.value = chat.roleId;
    modelID.value = chat.modelId;
    showStopGenerate.value = false;
    showReGenerate.value = false;
    connect(chat.chatId, chat.roleId)
  }
  
  // 编辑会话标题
  const curOpt = ref('')
  const tmpChatTitle = ref('');
  const editChatTitle = function (event, chat) {
    event.stopPropagation();
    chat.edit = true;
    curOpt.value = 'edit';
    tmpChatTitle.value = chat.title;
  };
  
  
  const titleKeydown = (e, chat) => {
    if (e.keyCode === 13) {
      e.stopPropagation();
      confirm(e, chat)
    }
  }
  // 确认修改
  const confirm = function (event, chat) {
    event.stopPropagation();
    if (curOpt.value === 'edit') {
      if (tmpChatTitle.value === '') {
        return ElMessage.error("请输入会话标题！");
      }
      if (!chat.chatId) {
        return ElMessage.error("对话 ID 为空，请刷新页面再试！");
      }
      httpPost('/api/chat/update', {chatId: chat.chatId, title: tmpChatTitle.value}).then(() => {
        chat.title = tmpChatTitle.value;
        chat.edit = false;
      }).catch(e => {
        ElMessage.error("操作失败：" + e.message);
      })
    } else if (curOpt.value === 'remove') {
      httpGet('/api/chat/remove?chat_id=' + chat.chatId).then(() => {
        chatList.value = removeArrayItem(chatList.value, chat, function (e1, e2) {
          return e1.id === e2.id
        })
        // 重置会话
        newChat();
      }).catch(e => {
        ElMessage.error("操作失败：" + e.message);
      })
  
    }
  
  }
  // 取消修改
  const cancel = function (event, chat) {
    event.stopPropagation();
    chat.edit = false;
    chat.removing = false;
  }
  
  // 删除会话
  const removeChat = function (event, chat) {
    event.stopPropagation();
    chat.removing = true;
    curOpt.value = 'remove';
  }
  
  const mathjaxPlugin = require('markdown-it-mathjax3')
const md = require('markdown-it')({
  breaks: true,
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    const codeIndex = parseInt(Date.now()) + Math.floor(Math.random() * 10000000)
    // 显示复制代码按钮
    const copyBtn = `<span class="copy-code-btn" data-clipboard-action="copy" data-clipboard-target="#copy-target-${codeIndex}">复制</span>
<textarea style="position: absolute;top: -9999px;left: -9999px;z-index: -9999;" id="copy-target-${codeIndex}">${str.replace(/<\/textarea>/g, '&lt;/textarea>')}</textarea>`
    if (lang && hl.getLanguage(lang)) {
      const langHtml = `<span class="lang-name">${lang}</span>`
      // 处理代码高亮
      const preCode = hl.highlight(lang, str, true).value
      console.log("preCode=" + preCode)
      // 将代码包裹在 pre 中
      return `<pre class="code-container"><code class="language-${lang} hljs">${preCode}</code>${copyBtn} ${langHtml}</pre>`
    }

    // 处理代码高亮
    const preCode = md.utils.escapeHtml(str)
    // 将代码包裹在 pre 中
    return `<pre class="code-container"><code class="language-${lang} hljs">${preCode}</code>${copyBtn}</pre>`
  }
});
md.use(mathjaxPlugin)
  
  // 创建 socket 连接
  const prompt = ref('');
  const showStopGenerate = ref(false); // 停止生成
  const showReGenerate = ref(false); // 重新生成
  const previousText = ref(''); // 上一次提问
  const lineBuffer = ref(''); // 输出缓冲行
  const socket = ref(null);
  const activelyClose = ref(false); // 主动关闭
  const canSend = ref(true);
  const connect = function (chat_id, role_id) {
    console.info("connect(" + chat_id + "," + role_id + ")")
    let isNewChat = false;
    if (!chat_id) {
      isNewChat = true;
      chat_id = UUID();
    }
    // 先关闭已有连接
    if (socket.value !== null) {
      activelyClose.value = true;
      socket.value.close();
    }
  
    const _role = getRoleById(role_id);
    if (!_role) {
      ElMessage.error("角色不存在！");
      router.replace("/agents");
      return;
    }
    // 初始化 WebSocket 对象
    const _sessionId = getSessionId();
    let host = process.env.VUE_APP_WS_HOST
    if (host === '') {
      if (location.protocol === 'https:') {
        host = 'wss://' + location.host;
      } else {
        host = 'ws://' + location.host;
      }
    }
    const _socket = new WebSocket(host + `infra/ws/chat?session_id=${_sessionId}&role_id=${role_id}&chat_id=${chat_id}&model_id=${modelID.value}&token=${getUserToken()}`);
    _socket.addEventListener('open', () => {
      chatData.value = []; // 初始化聊天数据
      previousText.value = '';
      enableInput()
      activelyClose.value = false;
  
      if (isNewChat) { // 加载打招呼信息
        loading.value = false;
        chatData.value.push({
          chat_id: chat_id,
          role_id: role_id,
          type: "reply",
          id: randString(32),
          icon: _role['icon'],
          content: _role['helloMsg'],
          orgContent: _role['helloMsg'],
        })
        ElMessage.success({message: "对话连接成功！", duration: 1000})
      } else { // 加载聊天记录
        loadChatHistory(chat_id);
      }
  
    });
  
    _socket.addEventListener('message', event => {
      if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.readAsText(event.data, "UTF-8");
        reader.onload = () => {
          const data = JSON.parse(String(reader.result));
          if (data.type === 'start') {
            chatData.value.push({
              type: "reply",
              id: randString(32),
              icon: _role['icon'],
              content: "",
              created_at: new Date().getTime(),
            });
          } else if (data.type === "mj") {
            disableInput(true)
            const content = data.content;
            content.html = md.render(content.content)
            let key = content.key
            // fixed bug: 执行 Upscale 和 Variation 操作的时候覆盖之前的绘画
            if (content.status === "Finished") {
              key = randString(32)
              enableInput()
            }
            // console.log(content)
            // check if the message is in chatData
            let flag = false
            for (let i = 0; i < chatData.value.length; i++) {
              if (chatData.value[i].id === content.key) {
                flag = true
                chatData.value[i].content = content
                chatData.value[i].id = key
                break
              }
            }
            if (flag === false) {
              chatData.value.push({
                type: "mj",
                id: key,
                icon: "/images/avatar/mid_journey.png",
                content: content
              });
            }
  
          } else if (data.type === 'end') { // 消息接收完毕
            // 追加当前会话到会话列表
            if (isNewChat && newChatItem.value !== null) {
              newChatItem.value['title'] = previousText.value;
              newChatItem.value['chatId'] = chat_id;
              chatList.value.unshift(newChatItem.value);
              activeChat.value = newChatItem.value;
              newChatItem.value = null; // 只追加一次
            }
  
            enableInput()
            lineBuffer.value = ''; // 清空缓冲
  
            // 获取 token
            const reply = chatData.value[chatData.value.length - 1]
            httpPost("/api/chat/tokens", {text: "", model: getModelValue(modelID.value), chatId: chat_id}).then(res => {
              reply['createdAt'] = new Date().getTime();
              reply['tokens'] = res.data;
              // 将聊天框的滚动条滑动到最底部
              nextTick(() => {
                document.getElementById('chat-box').scrollTo(0, document.getElementById('chat-box').scrollHeight)
              })
            })
  
          } else {
            lineBuffer.value += data.content;
            const reply = chatData.value[chatData.value.length - 1]
            reply['orgContent'] = lineBuffer.value;
            reply['content'] = md.render(processContent(lineBuffer.value));
            console.log("reply=" + JSON.stringify(reply));
          }
          // 将聊天框的滚动条滑动到最底部
          nextTick(() => {
            document.getElementById('chat-box').scrollTo(0, document.getElementById('chat-box').scrollHeight)
            localStorage.setItem("chat_id", chat_id)
          })
        };
      }
  
    });
  
    _socket.addEventListener('close', () => {
      if (activelyClose.value) { // 忽略主动关闭
        return;
      }
      // 停止发送消息
      disableInput(true)
      socket.value = null;
      loading.value = true;
      checkSession().then(() => {
        connect(chat_id, role_id)
      }).catch(() => {
        loading.value = true
        setTimeout(() => connect(chat_id, role_id), 3000)
      });
    });
  
    socket.value = _socket;
  }
  
  const disableInput = (force) => {
    canSend.value = false;
    showReGenerate.value = false;
    showStopGenerate.value = !force;
  }
  
  const enableInput = () => {
    canSend.value = true;
    showReGenerate.value = previousText.value !== "";
    showStopGenerate.value = false;
  }
  
  // 登录输入框输入事件处理
  const inputKeyDown = function (e) {
    if (e.keyCode === 13) {
      if (e.ctrlKey) { // Ctrl + Enter 换行
        prompt.value += "\n";
        return;
      }
      e.preventDefault();
      sendMessage();
    }
  }
  
  // 自动填充 prompt
  const autofillPrompt = (text) => {
    prompt.value = text
    textInput.value.focus()
    // sendMessage()
  }
  // 发送消息
  const sendMessage = function () {
    if (canSend.value === false) {
      ElMessage.warning("AI 正在作答中，请稍后...");
      return
    }
  
    if (prompt.value.trim().length === 0 || canSend.value === false) {
      return false;
    }
    // 追加消息
    chatData.value.push({
      type: "prompt",
      id: randString(32),
      icon: loginUser.value.avatar,
      content: md.render(prompt.value),
      created_at: new Date().getTime(),
    });
  
    nextTick(() => {
      document.getElementById('chat-box').scrollTo(0, document.getElementById('chat-box').scrollHeight)
    })
  
    showHello.value = false
    disableInput(false)
    socket.value.send(prompt.value);
    previousText.value = prompt.value;
    prompt.value = '';
    return true;
  }
  
  const showConfig = function () {
    showConfigDialog.value = true;
  }
  
  const clearAllChats = function () {
    ElMessageBox.confirm(
        '确认要清空所有的会话历史记录吗?<br/>此操作不可以撤销！',
        '操作提示：',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true,
          showClose: true,
          closeOnClickModal: false,
          center: true,
        }
    ).then(() => {
      httpGet("/api/chat/clear").then(() => {
        ElMessage.success("操作成功！");
        chatData.value = [];
        chatList.value = [];
        newChat();
      }).catch(e => {
        ElMessage.error("操作失败：" + e.message)
      })
    }).catch(() => {
    })
  }
  
  const logout = function () {
    activelyClose.value = true;
    httpGet('/api/user/logout').then(() => {
      removeUserToken();
      router.push('/login');
    }).catch(() => {
      ElMessage.error('注销失败！');
    })
  }
  
  const loadChatHistory = function (chatId) {
    httpGet('/api/chat/history?chat_id=' + chatId).then(res => {
      const data = res.data
      if (!data) {
        loading.value = false
        return
      }
      showHello.value = false
      for (let i = 0; i < data.length; i++) {
        if (data[i].type === "mj") {
          data[i].content = JSON.parse(data[i].content)
          data[i].content.html = md.render(data[i].content?.content)
          chatData.value.push(data[i]);
          continue;
        }
  
        data[i].orgContent = data[i].content;
        data[i].content = md.render(processContent(data[i].content));
        chatData.value.push(data[i]);
      }
  
      nextTick(() => {
        document.getElementById('chat-box').scrollTo(0, document.getElementById('chat-box').scrollHeight)
      })
      loading.value = false
    }).catch(e => {
      // TODO: 显示重新加载按钮
      ElMessage.error('加载聊天记录失败：' + e.message);
    })
  }
  
  const stopGenerate = function () {
    showStopGenerate.value = false;
    httpGet("/api/chat/stop?session_id=" + getSessionId()).then(() => {
      enableInput()
    })
  }
  
  // 重新生成
  const reGenerate = function () {
    disableInput(false)
    const text = '重新生成上述问题的答案：' + previousText.value;
    // 追加消息
    chatData.value.push({
      type: "prompt",
      id: randString(32),
      icon: loginUser.value.avatar,
      content: md.render(text)
    });
    socket.value.send(text);
  }
  
  const chatName = ref('')
  // 搜索会话
  const searchChat = function () {
    if (chatName.value === '') {
      chatList.value = allChats.value
      return
    }
    const items = [];
    for (let i = 0; i < allChats.value.length; i++) {
      if (allChats.value[i].title.toLowerCase().indexOf(chatName.value.toLowerCase()) !== -1) {
        items.push(allChats.value[i]);
      }
    }
    chatList.value = items;
  }
  
  // 导出会话
  const exportChat = () => {
    if (!activeChat.value['chatId']) {
      return ElMessage.error("请先选中一个会话")
    }
  
    const url = location.protocol + '//' + location.host + '/chat/export?chat_id=' + activeChat.value['chatId']
    // console.log(url)
    window.open(url, '_blank');
  }
  // function divContentToMarkdown(divContent) {
  //   // Replace <b> tags with ** for bold text in Markdown
  //   divContent = divContent.replace(/<b>(.*?)<\/b>/g, '**$1**');
  
  //   // Replace <i> tags with * for italic text in Markdown
  //   divContent = divContent.replace(/<i>(.*?)<\/i>/g, '*$1*');
  
  //   // Replace <a> tags with []() for links in Markdown
  //   divContent = divContent.replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)');
  
  //   // Add more replacements as needed...
  
  //   return divContent;
  // }
  
  
  
  
  function divContentToMarkdown(divContent, baseUrl) {
    const turndownService = new TurndownService();
  
    // Create a new DOM parser
    const parser = new DOMParser();
  
    // Parse the div content
    const doc = parser.parseFromString(divContent, 'text/html');
  
    // Get all img elements
    const imgElements = doc.getElementsByTagName('img');
  
    // Loop over the img elements and update the src attribute
    for (let i = 0; i < imgElements.length; i++) {
      const img = imgElements[i];
  
      // Get the current src attribute
      const src = img.getAttribute('src');
  
      // If the src is a relative URL, convert it to an absolute URL
      if (src && !src.startsWith('http')) {
        img.setAttribute('src', baseUrl + src);
      }
    }
  
    // Convert the updated HTML back to a string
    const updatedDivContent = doc.body.innerHTML;
  
    // Convert the HTML to Markdown
    return turndownService.turndown(updatedDivContent);
  }
  
  // const exportChat = () => {
  //     if (!activeChat.value['chatId']) {
  //       return ElMessage.error("请先选中一个会话")
  //     }
  //     // exportDivToPdf('container', 'chat-' + activeChat.value['chatId'] + '.pdf')
  //     exportChatMarkdown('chat-' + activeChat.value['chatId'] + '.md') ;
  // }
  
  function exportDivToPdf(divId, filename) {
    // Get the div element
    const content = document.getElementById(divId);
  
    const saveStyle = content.style ;
  
    content.style.width = '210mm';
    content.style.height = 'auto';
  
    // Create a new jsPDF instance
    const pdf = new jsPDF({
          format: 'a4'
        });
        
    // Add the div to the PDF
    pdf.html(content, {
          callback: function (pdf) {
            // Save the PDF file
            pdf.save(filename)
            content.style = saveStyle ;
          }
        });
  
    // Save the PDF
    // pdf.save(filename);
  }
  
  const exportChatMarkdown = (filename) => {
      // Get the div content
      const divContent = document.getElementById('chat-box').innerHTML;
  
      // Convert the div content to Markdown format
      // This depends on how your div content is structured
      const markdownContent = divContentToMarkdown(divContent,location.protocol + '//' + location.host);
  
      // Create a new Blob object with the Markdown content
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
  
      // Create a URL for the Blob object
      const url = URL.createObjectURL(blob);
  
      // Create a new 'a' element
      const a = document.createElement('a');
  
      // Set the href and download attributes of the 'a' element
      a.href = url;
      a.download = filename ;
  
      // Append the 'a' element to the body
      document.body.appendChild(a);
  
      // Simulate a click on the 'a' element
      a.click();
  
      // Remove the 'a' element from the body
      document.body.removeChild(a);
    }
  
  const getChatById = (chatId) => {
    for (let index in chatList.value) {
      if (chatList.value[index].chatId === chatId) {
        return chatList.value[index]
      }
    }
    return null
  }
  
  const getModelValue = (model_id) => {
    for (let i = 0; i < models.value.length; i++) {
      if (models.value[i].id === model_id) {
        return models.value[i].value
      }
    }
    return ""
  }
  
  
  const notShow = () => {
    localStorage.setItem(showNoticeKey.value + loginUser.value.username, true)
    showDemoNotice.value = false
  }
  </script>
  
  <style scoped lang="stylus">
  @import "@/assets/css/chat-plus.styl"
  </style>