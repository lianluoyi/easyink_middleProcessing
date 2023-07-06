<template>
  <view>
    <view v-if="showDenyAccessImage" class="result-page">
      <u-image src="../../assets/image/denyAccess.png" width="150px" height="150px" />
      <text class="result-page-text"> 该内容无法访问</text>
    </view>
    <view v-if="showSnapShot" class="snap">
      <view class="snap-info">
        <view class="f14">申请获得</view>
        <view class="f20">以下权限</view>
        <view class="f14 flex">
          <image class="ze-passed" src="../../assets/ze-passed.svg" />
          获取你的昵称、头像
        </view>
      </view>
      <view class="snap-tips">
        <image class="bell clock" src="../../assets/bell.svg" />
        <view class="title">
          <view>点击下方 “<text style="color: #f2a662">使用完整服务</text>”</view>
          <view class="title-upgrade">
            <text> 继续浏览 </text>
            <image class="upgrade" src="../../assets/upgrade.svg" />
          </view>
        </view>
      </view>
      <view class="arrow-right"></view>
    </view>
  </view>
</template>

<script>
  import { HTTP_CODE_SNAPSHOT } from '../../utils/constant';
  import { getUrlType, getShortLinkAppId, getRadarClick, getOpenId, getLongLinkAppId } from '../../api';
  // 短链类型type
  const SHORT_LINK_TYPE = {
    // 雷达
    radar: 1,
    // 表单
    form: 2,
    // 员工活码
    userCode: 3,
    // 群活码
    groupCode: 4
  };
  export default {
    data() {
      return {
        code: '',
        openId: '',
        //   短链
        shortCode: '',
        // 是否显示禁止访问
        showDenyAccessImage: false,
        type: undefined,
        redirectUrl: undefined,
        // 是否显示快照页
        showSnapShot: false
      };
    },
    async onLoad() {
      // 当为短链时，且从企微跳转回来的没有formType时。
      if (this.isShortLink() && this.getUrlCode('state')?.indexOf('formType') === -1) {
        // 获取短链
        const shortLink = this.getShortLink(window.location.href) || this.getUrlCode('state');
        const { data } = await getUrlType(shortLink);
        this.type = data.type;
        this.redirectUrl = data.redirectUrl;
        if (data?.type === SHORT_LINK_TYPE['radar'] || data?.type === SHORT_LINK_TYPE['form']) {
          this.init(true);
        } else {
          window.location.replace(this.redirectUrl);
        }
      } else {
        // 表单长链
        this.init(false);
      }
    },
    methods: {
      /**
       * @description 初始化获取appid和openid
       * @param isShortLink 是否是短链
       */
      init(isShortLink) {
        this.code = this.getUrlCode('code');
        if (!this.code) {
          this.getLinkAppId();
          return;
        }
        if (isShortLink) {
          this.shortCode = this.getUrlCode('state');
        }
        this.getOpenid();
      },
      /**
       * @description 是否是短链
       */
      isShortLink() {
        const url = new URL(window.location);
        if (this.getUrlCode('state')) {
          return !url.searchParams.has('formId') && this.getUrlCode('state')?.indexOf('formType') === -1;
        } else {
          return !url.searchParams.has('formId');
        }
      },
      /**
       * @description 获取短链公众号配置
       */
      async getLinkAppId() {
        const res = await this.getAppId();
        const { corpId, appId, componentAppId } = res;
        window.sessionStorage.setItem('appId', appId);
        window.sessionStorage.setItem('corpId', corpId);
        this.getCode(appId, componentAppId);
      },
      /**
       * @description 获取AppId corpId
       */
      getAppId() {
        const url = new URL(window.location);
        const formPayload = {
          formId: url.searchParams.get('formId') || this.getUrlCode('state')?.replace('formType', '')
        };
        const shortCodePayload = {
          shortCode: this.getShortLink(window.location.href) || this.getUrlCode('state')
        };
        return new Promise((resolve, reject) => {
          (this.isShortLink() ? getShortLinkAppId(shortCodePayload) : getLongLinkAppId(formPayload))
            .then((res) => {
              resolve(res.data);
            })
            .catch(() => {
              this.showDenyAccessImage = true;
              reject();
            });
        });
      },
      /*
       * 第一次进入页面截取短链在url中当作state跳转
       */
      getShortLink(url) {
        const newUrl = new URL(window.location);
        if (this.isShortLink()) {
          const SPLIT_RULE = url.split(url.indexOf('?') !== -1 ? '?' : '#')[0].split('/');
          return SPLIT_RULE[SPLIT_RULE.length - 1] || newUrl.searchParams.get('state');
        } else {
          window.sessionStorage.setItem('formId', newUrl.searchParams.get('formId'));
          window.sessionStorage.setItem('userId', newUrl.searchParams.get('userId'));
          window.sessionStorage.setItem('channelType', newUrl.searchParams.get('channelType'));
          const formId = newUrl.searchParams.get('formId');
          return `formType${formId}`;
        }
      },
      /*
       * 截取路由上的值 code 和 短链state
       */
      getUrlCode(name) {
        return (
          decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [, ''])[1].replace(/\+/g, '%20')) || null
        );
      },
      /*
       * 获取code
       */
      getCode(appid, componentAppId) {
        const state = this.getShortLink(window.location.href);
        const redirect_uri = encodeURIComponent(new URL(window.location).origin)+new URL(window.location).pathname;
        const skipUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_userinfo&state=${state}${
          componentAppId ? '&component_appid=' + componentAppId : ''
        }#wechat_redirect`;
        window.location.href = skipUrl;
      },
      /*
       * 获取openId
       */
      async getOpenid() {
        let appId = window.sessionStorage.getItem('appId');
        let corpId = window.sessionStorage.getItem('corpId');
        if (!appId || !corpId) {
          const data = await this.getAppId();
          appId = data.appId;
          corpId = data.corpId;
        }
        getOpenId({
          code: this.code,
          appId,
          corpId
        })
          .then((res) => {
            this.openId = res.data;
            if (this.type === SHORT_LINK_TYPE['radar'] && this.getUrlCode('state')?.indexOf('formType') === -1) {
              this.setRadarClickRecord();
            } else {
              const newUrl = new URL(this.redirectUrl || window.location);
              uni.$u.route({
                url: 'pages/form/index',
                params: {
                  formId: window.sessionStorage.getItem('formId') || newUrl.searchParams.get('formId'),
                  userId: window.sessionStorage.getItem('userId') || newUrl.searchParams.get('userId'),
                  channelType: window.sessionStorage.getItem('channelType') || newUrl.searchParams.get('channelType'),
                  openId: this.openId
                }
              });
            }
          })
          .catch((err) => {
            if (err === HTTP_CODE_SNAPSHOT) {
              this.showSnapShot = true;
            }
          });
      },
      /**
       * @description 记录雷达点击记录
       */
      setRadarClickRecord() {
        getRadarClick({
          openId: this.openId,
          shortCode: this.shortCode
        }).then(() => {
          window.location.replace(this.redirectUrl.slice(0, 4) !== 'http' ? `http://${this.redirectUrl}` : this.redirectUrl);
        });
      }
    }
  };
</script>

<style scoped lang="scss">
  .result-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 20%;
    .result-page-text {
      color: #acabab;
      font-size: 14px;
      display: flex;
      justify-content: center;
    }
  }
  .flex {
    display: flex;
    align-items: center;
  }
  .ze-passed {
    width: 16px;
    height: 16px;
    margin-right: 10px;
  }
  .snap {
    box-sizing: border-box;
    height: 100%;
    .bell {
      width: 20px;
      height: 20px;
      margin: 3px 9px;
    }
    .snap-info {
      box-sizing: border-box;
      padding-top: 30px;
      margin-left: 30px;
      .f14 {
        font-size: 14px;
      }
      .f20 {
        font-size: 20px;
      }
      view {
        margin-bottom: 20px;
      }
    }
    .snap-tips {
      padding-top: 5px;
      font-size: 14px;
      position: absolute;
      bottom: 10px;
      right: 10px;
      height: 52px;
      line-height: 23px;
      background-color: #1890ff;
      border-radius: 5px;
      color: #fff;
      display: flex;
      .title {
        margin-right: 5px;
      }
      .title-upgrade {
        display: flex;
        align-items: center;
        .upgrade {
          width: 16px;
          height: 16px;
          margin-left: 5px;
          transform: rotate(180deg);
        }
      }
    }
    .arrow-right {
      position: absolute;
      transform: rotate(45deg);
      width: 10px;
      height: 10px;
      bottom: 5px;
      right: 50px;
      border-bottom: 1px solid #1890ff;
      border-left: 1px solid #1890ff;
      background-color: #1890ff;
    }
    @keyframes swingLeftAndRight {
      8% {
        transform: rotate3d(0, 0, 1, 20deg);
      }
      16% {
        transform: rotate3d(0, 0, 1, -15deg);
      }
      24% {
        transform: rotate3d(0, 0, 1, 10deg);
      }
      32% {
        transform: rotate3d(0, 0, 1, -5deg);
      }
      40% {
        transform: rotate3d(0, 0, 1, 0deg);
      }
    }
    .clock {
      animation: swingLeftAndRight 2s linear infinite;
    }
  }
</style>
