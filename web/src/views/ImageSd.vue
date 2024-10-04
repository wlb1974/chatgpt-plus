<template>
  <div class="page-sd">
    <div class="inner custom-scroll">
      <div class="sd-box">
        <h2>Stable Diffusion 创作中心</h2>

        <div class="sd-params" :style="{ height: mjBoxHeight + 'px' }">
          <el-form :model="params" label-width="80px" label-position="left">
            <div class="param-line" style="padding-top: 10px">
              <el-form-item label="采样方法">
                <template #default>
                  <div class="form-item-inner">
                    <el-select v-model="params.sampler" size="small">
                      <el-option v-for="item in samplers" :label="item" :value="item" :key="item"/>
                    </el-select>
                    <el-tooltip
                        effect="light"
                        content="出图效果比较好的一般是 Euler 和 DPM 系列算法"
                        raw-content
                        placement="right"
                    >
                      <el-icon>
                        <InfoFilled/>
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>
              </el-form-item>
            </div>

            <div class="param-line">
              <el-form-item label="图片尺寸">
                <template #default>
                  <div class="form-item-inner">
                    <el-select v-model="params.imageSize" size="small">
                      <el-option v-for="item in imageSizeArg" :label="item" :value="item" :key="item"/>
                    </el-select>
                    <el-tooltip
                        effect="light"
                        content="出图的图片尺寸"
                        raw-content
                        placement="right"
                    >
                    <el-icon>
                        <InfoFilled/>
                      </el-icon>
                    </el-tooltip>
<!-- 
                    <el-row :gutter="20">
                      <el-col :span="12">
                        <el-input v-model.number="params.width" size="small" placeholder="图片宽度"/>
                      </el-col>
                      <el-col :span="12">
                        <el-input v-model.number="params.height" size="small" placeholder="图片高度"/>
                      </el-col>
                    </el-row> -->
                  </div>
                </template>
              </el-form-item>
            </div>

            <div class="param-line">
              <el-form-item label="迭代步数">
                <template #default>
                  <div class="form-item-inner">
                    <el-input v-model.number="params.steps" size="small"/>
                    <el-tooltip
                        effect="light"
                        content="值越大则代表细节越多，同时也意味着出图速度越慢"
                        raw-content
                        placement="right"
                    >
                      <el-icon>
                        <InfoFilled/>
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>
              </el-form-item>
            </div>

            <div class="param-line">
              <el-form-item label="引导系数">
                <template #default>
                  <div class="form-item-inner">
                    <el-input v-model.number="params.cfg_scale" size="small"/>
                    <el-tooltip
                        effect="light"
                        content="提示词引导系数，图像在多大程度上服从提示词<br/> 较低值会产生更有创意的结果"
                        raw-content
                        placement="right"
                    >
                      <el-icon>
                        <InfoFilled/>
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>
              </el-form-item>
            </div>

            <div class="param-line">
              <el-form-item label="随机因子">
                <template #default>
                  <div class="form-item-inner">
                    <el-input v-model.number="params.seed" size="small"/>
                    <el-tooltip
                        effect="light"
                        content="随机数种子，相同的种子会得到相同的结果<br/> 设置为 -1 则每次随机生成种子"
                        raw-content
                        placement="right"
                    >
                      <el-icon>
                        <InfoFilled/>
                      </el-icon>
                    </el-tooltip>

                    <el-tooltip
                        effect="light"
                        content="使用随机数"
                        raw-content
                        placement="right"
                    >
                      <el-icon @click="params.seed = -1">
                        <Orange/>
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>
              </el-form-item>
            </div>

            <div class="param-line">
              <el-form-item label="面部修复">
                <template #default>
                  <div class="form-item-inner">
                    <el-switch v-model="params.face_fix" style="--el-switch-on-color: #47fff1;"/>
                    <el-tooltip
                        effect="light"
                        content="仅对绘制人物图像有效果。"
                        raw-content
                        placement="right"
                    >
                      <el-icon style="margin-top: 6px">
                        <InfoFilled/>
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>
              </el-form-item>
            </div>

            <div class="param-line">
              <el-form-item label="高清修复">
                <template #default>
                  <div class="form-item-inner">
                    <el-switch v-model="params.hd_fix" style="--el-switch-on-color: #47fff1;"/>
                    <el-tooltip
                        effect="light"
                        content="先以较小的分辨率生成图像，接着方法图像<br />然后在不更改构图的情况下再修改细节"
                        raw-content
                        placement="right"
                    >
                      <el-icon style="margin-top: 6px">
                        <InfoFilled/>
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>
              </el-form-item>
            </div>

            <div v-show="params.hd_fix">
              <div class="param-line">
                <el-form-item label="重绘幅度">
                  <template #default>
                    <div class="form-item-inner">
                      <el-slider v-model.number="params.hd_redraw_rate" :max="1" :step="0.1"
                                 style="width: 180px;--el-slider-main-bg-color:#47fff1"/>
                      <el-tooltip
                          effect="light"
                          content="决定算法对图像内容的影响程度<br />较大的值将得到越有创意的图像"
                          raw-content
                          placement="right"
                      >
                        <el-icon style="margin-top: 6px">
                          <InfoFilled/>
                        </el-icon>
                      </el-tooltip>
                    </div>
                  </template>
                </el-form-item>
              </div>

              <div class="param-line">
                <el-form-item label="放大算法">
                  <template #default>
                    <div class="form-item-inner">
                      <el-select v-model="params.hd_scale_alg" size="small">
                        <el-option v-for="item in scaleAlg" :label="item" :value="item" :key="item"/>
                      </el-select>
                      <el-tooltip
                          effect="light"
                          content="高清修复放大算法，主流算法有Latent和ESRGAN_4x"
                          raw-content
                          placement="right"
                      >
                        <el-icon>
                          <InfoFilled/>
                        </el-icon>
                      </el-tooltip>
                    </div>
                  </template>
                </el-form-item>
              </div>

              <div class="param-line">
                <el-form-item label="放大倍数">
                  <template #default>
                    <div class="form-item-inner">
                      <el-input v-model.number="params.hd_scale" size="small"/>
                      <el-tooltip
                          effect="light"
                          content="随机数种子，相同的种子会得到相同的结果<br/> 设置为 -1 则每次随机生成种子"
                          raw-content
                          placement="right"
                      >
                        <el-icon>
                          <InfoFilled/>
                        </el-icon>
                      </el-tooltip>
                    </div>
                  </template>
                </el-form-item>
              </div>

              <div class="param-line">
                <el-form-item label="迭代步数">
                  <template #default>
                    <div class="form-item-inner">
                      <el-input v-model.number="params.hd_steps" size="small"/>
                      <el-tooltip
                          effect="light"
                          content="重绘迭代步数，如果设置为0，则设置跟原图相同的迭代步数"
                          raw-content
                          placement="right"
                      >
                        <el-icon>
                          <InfoFilled/>
                        </el-icon>
                      </el-tooltip>
                    </div>
                  </template>
                </el-form-item>
              </div>
            </div>
            <div class="param-line" style="padding-top: 10px">
              <el-form-item label="出图风格">
                <template #default>
                  <div class="form-item-inner">
                    <el-select v-model="params.style" size="small">
                      <el-option v-for="item in imageStyleArg" :label="item.value" :value="item.key" :key="item.key"/>
                    </el-select>
                    <el-tooltip
                        effect="light"
                        content="可以选择出图的风格"
                        raw-content
                        placement="right"
                    >
                      <el-icon>
                        <InfoFilled/>
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>
              </el-form-item>
            </div>

            <div class="param-line" v-loading="loading" element-loading-background="rgba(122, 122, 122, 0.8)">
              <el-input
                  v-model="params.prompt"
                  :autosize="{ minRows: 4, maxRows: 6 }"
                  type="textarea"
                  ref="promptRef"
                  placeholder="正向提示词，例如：A chinese girl walking in the middle of a cobblestone street"
              />
            </div>

            <div style="padding: 10px">
              <el-button type="primary" @click="translatePrompt" size="small">
                <el-icon style="margin-right: 6px;font-size: 18px;">
                  <Refresh/>
                </el-icon>
                翻译
              </el-button>

              <el-tooltip
                  class="box-item"
                  effect="dark"
                  raw-content
                  content="使用 AI 翻译并重写提示词，<br/>增加更多细节，风格等描述"
                  placement="top-end"
              >
                <el-button type="success" @click="rewritePrompt" size="small">
                  <el-icon style="margin-right: 6px;font-size: 18px;">
                    <Refresh/>
                  </el-icon>
                  翻译并重写
                </el-button>
              </el-tooltip>
            </div>

            <div class="param-line pt">
              <span>反向提示词：</span>
              <el-tooltip
                  effect="light"
                  content="不希望出现的元素，下面给了默认的起手式"
                  placement="right"
              >
                <el-icon>
                  <InfoFilled/>
                </el-icon>
              </el-tooltip>
            </div>
            <div class="param-line">
              <el-input
                  v-model="params.negative_prompt"
                  :autosize="{ minRows: 4, maxRows: 6 }"
                  type="textarea"
                  placeholder="反向提示词"
              />
            </div>

            <div class="param-line" style="padding: 10px">
              <el-tag type="success">绘图可用额度：{{ imgCalls }}</el-tag>
            </div>
          </el-form>
        </div>
        <div class="submit-btn">
          <el-button color="#47fff1" :dark="false" round @click="generate">立即生成</el-button>
        </div>
      </div>
      <div class="task-list-box">
        <div class="task-list-inner" :style="{ height: listBoxHeight + 'px' }">
          <h2>任务列表</h2>
          <div class="running-job-list">
            <ItemList :items="runningJobs" v-if="runningJobs.length > 0" :width="240">
              <template #default="scope">
                <div class="job-item">
                  <div v-if="scope.item.progress > 0" class="job-item-inner">
                    <el-image :src="scope.item['img_url']"
                              fit="cover"
                              loading="lazy">
                      <template #placeholder>
                        <div class="image-slot">
                          正在加载图片
                        </div>
                      </template>

                      <template #error>
                        <div class="image-slot">
                          <el-icon v-if="scope.item['img_url'] !== ''">
                            <Picture/>
                          </el-icon>
                        </div>
                      </template>
                    </el-image>

                    <div class="progress">
                      <el-progress type="circle" :percentage="scope.item.progress" :width="100" color="#47fff1"/>
                    </div>
                  </div>
                  <el-image fit="cover" v-else>
                    <template #error>
                      <div class="image-slot">
                        <i class="iconfont icon-quick-start"></i>
                        <span>任务正在排队中</span>
                        <span>{{ getTruncatedPrompt(scope.item['prompt']) }}</span>
                      </div>
                    </template>
                  </el-image>
                </div>
              </template>
            </ItemList>
            <el-empty :image-size="100" v-else/>
          </div>
          <h2>创作记录</h2>
          <div class="finish-job-list">
            <ItemList :items="finishedJobs" v-if="finishedJobs.length > 0" :width="240" :gap="16">
              <template #default="scope">
                <div class="job-item animate">
                  <el-image 
                      :src="scope.item['img_url']+'?imageView2/1/w/240/h/240/q/75'"
                      fit="cover"
                      loading="lazy" 
                      @click="showTask(scope.item)">
                    <template #placeholder>
                      <div class="image-slot">
                        正在加载图片
                      </div>
                    </template>

                    <template #error>
                      <div class="image-slot">
                        <el-icon>
                          <Picture/>
                        </el-icon>
                      </div>
                    </template>
                  </el-image>

                  <div class="opt" >
                    <div class="opt-line">
                      <ul>
                        <li><span>{{ getTruncatedPrompt(scope.item.prompt) }}</span> <el-icon class="copy-prompt"
                                         :data-clipboard-text="scope.item.prompt">
                                  <DocumentCopy />
                                </el-icon></li>
                      </ul>
                    </div>
                  </div>


                  <div class="remove">
                    <el-button type="danger" :icon="Delete" @click="removeImage($event,scope.item)" circle/>
                  </div>
                </div>
              </template>
            </ItemList>
            <el-empty :image-size="100" v-else/>
          </div> <!-- end finish job list-->
        </div>

      </div><!-- end task list box -->
    </div>

    <!-- 任务详情弹框 -->
    <el-dialog v-model="showTaskDialog" title="绘画任务详情" :fullscreen="true">
      <el-row :gutter="20">
        <el-col :span="16">
          <div class="img-container" :style="{maxHeight: fullImgHeight+'px'}">
            <el-image :src="item['img_url']" fit="contain"/>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="task-info">
            <div class="info-line">
              <el-divider>
                正向提示词
              </el-divider>
              <div class="prompt">
                <span>{{ item.prompt }}</span>
                <el-icon class="copy-prompt" :data-clipboard-text="item.prompt">
                  <DocumentCopy/>
                </el-icon>
              </div>

            </div>

            <div class="info-line">
              <el-divider>
                反向提示词
              </el-divider>
              <div class="prompt">
                <span>{{ item.params["negative_prompt"] }}</span>
                <el-icon class="copy-prompt" :data-clipboard-text="item.params.negative_prompt">
                  <DocumentCopy/>
                </el-icon>
              </div>
            </div>

            <div class="info-line">
              <div class="wrapper">
                <label>出图风格：</label>
                <div class="item-value">{{ getImageStyleValue(item.params.style) }}</div>
              </div>
            </div>

            <div class="info-line">
              <div class="wrapper">
                <label>采样方法：</label>
                <div class="item-value">{{ item.params.sampler }}</div>
              </div>
            </div>

            <div class="info-line">
              <div class="wrapper">
                <label>图片尺寸：</label>
                <div class="item-value">{{ item.params.width }} x {{ item.params.height }}</div>
              </div>
            </div>

            <div class="info-line">
              <div class="wrapper">
                <label>迭代步数：</label>
                <div class="item-value">{{ item.params.steps }}</div>
              </div>
            </div>

            <div class="info-line">
              <div class="wrapper">
                <label>引导系数：</label>
                <div class="item-value">{{ item.params.cfg_scale }}</div>
              </div>
            </div>

            <div class="info-line">
              <div class="wrapper">
                <label>随机因子：</label>
                <div class="item-value">{{ item.params.seed }}</div>
              </div>
            </div>

            <div v-if="item.params.hd_fix">
              <el-divider>
                高清修复
              </el-divider>
              <div class="info-line">
                <div class="wrapper">
                  <label>重绘幅度：</label>
                  <div class="item-value">{{ item.params.hd_redraw_rate }}</div>
                </div>
              </div>

              <div class="info-line">
                <div class="wrapper">
                  <label>放大算法：</label>
                  <div class="item-value">{{ item.params.hd_scale_alg }}</div>
                </div>
              </div>

              <div class="info-line">
                <div class="wrapper">
                  <label>放大倍数：</label>
                  <div class="item-value">{{ item.params.hd_scale }}</div>
                </div>
              </div>

              <div class="info-line">
                <div class="wrapper">
                  <label>迭代步数：</label>
                  <div class="item-value">{{ item.params.hd_steps }}</div>
                </div>
              </div>
            </div>

            <div class="copy-params">
              <el-button type="primary" round @click="copyParams(item)">画一张同款的</el-button>
            </div>

          </div>
        </el-col>
      </el-row>

    </el-dialog>
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue"
import {Delete, DocumentCopy, InfoFilled, Orange, Picture, Refresh} from "@element-plus/icons-vue";
import {httpGet, httpPost} from "@/utils/http";
import {ElMessage, ElMessageBox, ElNotification} from "element-plus";
import ItemList from "@/components/ItemList.vue";
import Clipboard from "clipboard";
import {checkSession} from "@/action/session";
import {useRouter} from "vue-router";
import {getSessionId} from "@/store/session";

const listBoxHeight = ref(window.innerHeight - 40)
const mjBoxHeight = ref(window.innerHeight - 150)
const fullImgHeight = ref(window.innerHeight - 60)
const showTaskDialog = ref(false)
const item = ref({})
const loading = ref(false)

window.onresize = () => {
  listBoxHeight.value = window.innerHeight - 40
  mjBoxHeight.value = window.innerHeight - 150
}
const samplers = ["Euler a", "Euler", "DPM++ 2S a Karras", "DPM++ 2M Karras", "DPM++ SDE Karras", "DPM++ 2M SDE Karras"]
const scaleAlg = ["Latent", "ESRGAN_4x", "R-ESRGAN 4x+", "SwinIR_4x", "LDSR"]
const imageSizeArg = ["768x768", "768x1024", "1024x768", "576x1024", "1024x576", "1024x1024"]

const imageStyleArg = [{key:'Base',value:'基础风格'},
{key:'3D Model',value:'3D模型'},
{key:'Analog Film',value:'模拟胶片'},
{key:'Anime',value:'动漫'},
{key:'Cinematic',value:'电影'},
{key:'Comic Book',value:'漫画'},
{key:'Craft Clay',value:'工艺黏土'},
{key:'Digital Art',value:'数字艺术'},
{key:'Enhance',value:'增强'},
{key:'Fantasy Art',value:'幻想艺术'},
{key:'lsometric',value:'等距风格'},
{key:'Line Art',value:'线条艺术'},
{key:'Lowpoly',value:'低多边形'},
{key:'Neonpunk',value:'霓虹朋克'},
{key:'Origami',value:'折纸'},
{key:'Photographic',value:'摄影'},
{key:'Pixel Art',value:'像素艺术'},
{key:'Texture',value:'纹理'}]

// [{key:'cartoon', value:'卡通画风格'},
//                       {key:'pencil', value:'铅笔风格'},
//                       {key:'color_pencil', value:'彩色铅笔画风格'},
//                       {key:'warm', value:'彩色糖块油画风格'},
//                       {key:'wave', value:'神奈川冲浪里油画风格'},
//                       {key:'lavender', value:'薰衣草油画风格'},
//                       {key:'mononoke', value:'奇异油画风格'},
//                       {key:'scream', value:'呐喊油画风格'},
//                       {key:'gothic', value:'哥特油画风格'}]


const params = ref({
  imageSize : '1024x1024',
  width: 1024,
  height: 1024,
  sampler: samplers[0],
  seed: -1,
  steps: 30,
  cfg_scale: 7,
  face_fix: false,
  hd_fix: false,
  hd_redraw_rate: 0.5,
  hd_scale: 2,
  hd_scale_alg: scaleAlg[0],
  hd_steps: 15,
  prompt: "",
  negative_prompt: "nsfw, paintings,low quality,easynegative,ng_deepnegative ,lowres,bad anatomy,bad hands,bad feet",
  style:"Base",
})

const runningJobs = ref([])
const finishedJobs = ref([])
const router = useRouter()
// 检查是否有画同款的参数
const _params = router.currentRoute.value.params["copyParams"]
if (_params) {
  params.value = JSON.parse(_params)
}
const imgCalls = ref(0)

const getImageStyleValue = (style) => {
  if(style == null) {
    return '基础风格'
  }
  const styleObj = imageStyleArg.find(item => item.key === style);

  return styleObj ? styleObj.value : '基础风格'
}

const rewritePrompt = () => {
  loading.value = true
  httpPost("/api/prompt/rewrite", {"prompt": params.value.prompt}).then(res => {
    params.value.prompt = res.data
    loading.value = false
  }).catch(e => {
    loading.value = false
    ElMessage.error("翻译失败：" + e.message)
  })
}

const getTruncatedPrompt = (prompt) => {
      return prompt.length > 100 ? prompt.slice(0, 80) + '...' : prompt;
    }

const translatePrompt = () => {
  loading.value = true
  httpPost("/api/prompt/translate", {"prompt": params.value.prompt}).then(res => {
    params.value.prompt = res.data
    loading.value = false
  }).catch(e => {
    loading.value = false
    ElMessage.error("翻译失败：" + e.message)
  })
}

onMounted(() => {
  checkSession().then(user => {
    imgCalls.value = user['imgCalls']

    fetchRunningJobs(user.id)
    fetchFinishJobs(user.id)

  }).catch(() => {
    router.push('/login')
  });


  const clipboard = new Clipboard('.copy-prompt');
  clipboard.on('success', () => {
    ElMessage.success("复制成功！");
  })

  clipboard.on('error', () => {
    ElMessage.error('复制失败！');
  })
})


const fetchRunningJobs = (userId) => {
    // 页面路由发生变化后， 不再加载任务
    // if(location.href.indexOf("/sd") === -1) {
    //   return
    // }

    // 获取运行中的任务
    httpGet(`/api/sd/jobs?status=0&user_id=${userId}`).then(res => {

      const jobs = res.data
      const _jobs = []
      for (let i = 0; jobs != null && i < jobs.length; i++) {
        if (jobs[i].progress === -1) {
          ElNotification({
            title: '任务执行失败',
            message: "任务ID：" + jobs[i]['task_id'],
            type: 'error',
          })
          imgCalls.value += 1
          continue
        }
        _jobs.push(jobs[i])
      }
      if(_jobs.length > 0) {
        setTimeout(() => fetchRunningJobs(userId), 1000)
        return
      }
      // 运行的任务发生变化， 重新获取已完成的任务
      if(_jobs.length != runningJobs.value.length) {
        fetchFinishJobs(userId)
      }
      runningJobs.value = _jobs
      // setTimeout(() => fetchRunningJobs(userId), 5000)
    }).catch(e => {
      ElMessage.error("获取任务失败：" + e.message)
      setTimeout(() => fetchRunningJobs(userId), 5000)
    })
  }

  // 获取已完成的任务
  const fetchFinishJobs = (userId) => {
        // 页面路由发生变化后， 不再加载任务
    httpGet(`/api/sd/jobs?status=1&user_id=${userId}`).then(res => {
      if (res.code != 0 || finishedJobs.value.length === 0 || res.data == null || res.data.length != finishedJobs.value.length) {
        finishedJobs.value = res.data
        setTimeout(() => fetchFinishJobs(userId), 1000)
        return
      }

      // check if the img url is changed
      const list = res.data
      let changed = false
      for (let i = 0; i < list.length; i++) {
        if (list[i]["img_url"] !== finishedJobs.value[i]["img_url"]) {
          changed = true
          break
        }
      }
      if (changed) {
        finishedJobs.value = list
      }

      // if(changed || runningJobs.value.length > 0) {
      //   setTimeout(() => fetchFinishJobs(userId), 1000)
      //   return 
      // }

      // setTimeout(() => fetchFinishJobs(userId), 5000)
    }).catch(e => {
      ElMessage.error("获取任务失败：" + e.message)
      setTimeout(() => fetchFinishJobs(userId), 5000)
    })
  }


// 创建绘图任务
const promptRef = ref(null)
const generate = () => {
  if (params.value.prompt === '') {
    promptRef.value.focus()
    return ElMessage.error("请输入绘画提示词！")
  }
  if (params.value.seed === '') {
    params.value.seed = -1
  }
  // 1024x1024 分解成 width 和 height
  const [width,height] = params.value.imageSize.split('x')
  params.width = width 
  params.height = height 

  params.value.session_id = getSessionId()
  httpPost("/api/sd/image", params.value).then(() => {
    ElMessage.success("绘画任务推送成功，请耐心等待任务执行...")
    imgCalls.value -= 1
    runningJobs.value.push({
      prompt: params.value.prompt,
      img_url: '',
      progress: 0,
    })
    fetchRunningJobs(0) ;
  }).catch(e => {
    ElMessage.error("任务推送失败：" + e.message)
  })
}

const showTask = (row) => {
  item.value = row
  showTaskDialog.value = true
}

const copyParams = (row) => {
  params.value = {...row.params}
  params.value.imageSize = row.params.width + 'x' + row.params.height
  if(params.value.style == null) {
    params.value.style = 'Base'
  }
  showTaskDialog.value = false
}

const removeImage = (event, item) => {
  event.stopPropagation()
  ElMessageBox.confirm(
      '此操作将会删除任务和图片，继续操作码?',
      '删除提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    httpPost("/api/sd/remove", {id: item.id, img_url: item.img_url}).then(() => {
      ElMessage.success("任务删除成功")
    }).catch(e => {
      ElMessage.error("任务删除失败：" + e.message)
    })
  }).catch(() => {
  })
}

</script>

<style lang="stylus">
@import "@/assets/css/image-sd.styl"
@import "@/assets/css/custom-scroll.styl"
</style>
