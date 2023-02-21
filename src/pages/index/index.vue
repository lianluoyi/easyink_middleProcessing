<template>
  <view class="result-page">
    <view v-if="showDenyAccessImage">
      <u-image
        src="../../assets/image/denyAccess.png"
        width="150px"
        height="150px"
      />
      <text class="result-page-text"> 该内容无法访问 </text>
    </view>
  </view>
</template>

<script>
import { getQueryParam } from "../../utils/common";
import { BASE_URL } from "../../utils/constant";
export default {
  data() {
    return {
      code: "",
      openId: "",
      //   短链
      shortCode: "",
      // 是否是短链
      isShortCode: false,
      // 是否显示禁止访问
      showDenyAccessImage: false,
    };
  },
  onLoad() {
    const url = new URL(window.location);
    this.isShortCode = !url.searchParams.has("formId");
    // 从官方携带code跳转回来
    this.code = this.getUrlCode("code");
    if (!this.code) {
      this.getAppid();
      return;
    }
    if (this.isShortCode) {
      this.shortCode = this.getUrlCode("state");
    }
    this.getOpenid();
  },
  methods: {
    /**
     * 获取公众号的appId
     */
    getAppid() {
      const url = new URL(window.location);
      const formPayload = {
        useFormIdFlag: true,
        formId: getQueryParam(url.href, "formId"),
      };
      const shortCodePayload = {
        shortCode: this.getShortCode(window.location.href),
      };
      uni.request({
        url: BASE_URL + "/wechatopen/appId",
        dataType: "json",
        data: this.isShortCode ? shortCodePayload : formPayload,
        success: (res) => {
          if (!res.data.data && res.data.code !== 200) {
            this.showDenyAccessImage = true;
            return;
          }
          const { corpId, appId, componentAppId } = res.data.data;
          window.sessionStorage.setItem("appId", appId);
          // 这里获取corpId
          window.sessionStorage.setItem("corpId", corpId);
          this.getCode(appId, componentAppId);
        },
        fail: (err) => {
          console.log("request fail", err);
          this.showDenyAccessImage = true;
        },
      });
    },
    /*
     * 第一次进入页面截取短链在url中当作state跳转
     */
    getShortCode(url) {
      if (this.isShortCode) {
        let shortUrl;
        // 判断是否有? 没有 ?则为 -1 有?的情况是因为在公众号重定向的时候会带上?code 没有是因为访问链接的时候会代码#/
        const SPLIT_RULE = url
          .split(url.indexOf("?") !== -1 ? "?" : "#")[0]
          .split("/");
        shortUrl = SPLIT_RULE[SPLIT_RULE.length - 1];
        return shortUrl;
      } else {
        const url = new URL(window.location);
        window.sessionStorage.setItem("formId", url.searchParams.get("formId"));
        window.sessionStorage.setItem("userId", url.searchParams.get("userId"));
        window.sessionStorage.setItem(
          "channelType",
          url.searchParams.get("channelType")
        );
        // 返回一个formType作为判断是否是表单
        return "formType";
      }
    },
    /*
     * 截取路由上的值 code 和 短链state
     */
    getUrlCode(name) {
      return (
        decodeURIComponent(
          (new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(
            location.href
          ) || [, ""])[1].replace(/\+/g, "%20")
        ) || null
      );
    },
    /*
     * 获取code
     */
    getCode(appid, componentAppId) {
      const redirect_uri = encodeURIComponent(new URL(window.location).origin);
      let skipUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_userinfo&state=${this.getShortCode(
        window.location.href
      )}${
        componentAppId ? "&component_appid=" + componentAppId : ""
      }#wechat_redirect`;
      window.location.href = skipUrl;
    },
    /*
     * 获取openId
     */
    getOpenid() {
      uni.request({
        url: BASE_URL + "/wechatopen/openId",
        dataType: "json",
        data: {
          code: this.code,
          appId: window.sessionStorage.getItem("appId"),
          corpId: window.sessionStorage.getItem("corpId"),
        },
        success: (res) => {
          this.openId = res.data.data;
          if (this.getUrlCode("state") !== "formType") {
            this.getUrl();
            return;
          } else {
            uni.$u.route({
              url: "pages/form/index",
              params: {
                formId: window.sessionStorage.getItem("formId"),
                userId: window.sessionStorage.getItem("userId"),
                channelType: window.sessionStorage.getItem("channelType"),
                openId: this.openId,
              },
            });
          }
        },
        fail: (err) => {
          // TODO 失败也应该跳转
          console.log("request fail", err);
        },
      });
    },
    /**
     * 获取长链接
     */
    getUrl() {
      if (!this.openId) {
        return;
      }
      uni.request({
        url: BASE_URL + "/url/radar",
        dataType: "json",
        data: {
          openId: this.openId,
          shortCode: this.shortCode,
        },
        success: (res) => {
          const url = new URL(res.data.data);
          if (!url.searchParams.has("formId")) {
            window.location.replace(
              res.data.data.slice(0, 4) !== "http"
                ? `http://${res.data.data}`
                : res.data.data
            );
          } else {
            uni.$u.route({
              url: "pages/form/index",
              params: {
                formId: getQueryParam(url.href, "formId"),
                userId: getQueryParam(url.href, "userId"),
                channelType: getQueryParam(url.href, "channelType"),
                openId: this.openId,
              },
            });
          }
        },
        fail: (err) => {
          console.log("request fail", err);
        },
      });
    },
  },
};
</script>

<style scoped lang="scss">
.result-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20%;
  .result-page-text {
    margin-top: 10px;
    color: #acabab;
    font-size: 14px;
  }
}
</style>
