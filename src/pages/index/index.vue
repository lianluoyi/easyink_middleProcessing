<template>
  <view class="content"></view>
</template>

<script>
const BASE_URL = "/api";
export default {
  data() {
    return {
      code: "",
      openId: "",
      //   短链
      shortCode: "",
    };
  },
  onLoad() {
    // 从官方携带code跳转回来
    this.code = this.getUrlCode("code");
    if (!this.code) {
      this.getAppid();
      return;
    }
    this.shortCode = this.getUrlCode("state");
    this.getOpenid();
  },
  methods: {
    /**
     * 获取公众号的appId
     */
    getAppid() {
      uni.request({
        url: BASE_URL + "/wechatopen/appId",
        dataType: "json",
        data: {
          shortCode: this.getShortCode(window.location.href),
        },
        success: (res) => {
          const { corpId, appId } = res.data.data;
          // 这里获取corpId
          window.sessionStorage.setItem("corpId", corpId);
          this.getCode(appId);
        },
        fail: (err) => {
          console.log("request fail", err);
        },
      });
    },
    /*
     * 第一次进入页面截取短链在url中当作state跳转
     */
    getShortCode(url) {
      let shortUrl;
      // 判断是否有? 没有 ?则为 -1
      if (url.indexOf("?") !== -1) {
        // 有出现 ?
        shortUrl = url.split("?")[0].split("/")[
          url.split("?")[0].split("/").length - 1
        ];
      } else {
        shortUrl = url.split("#")[0].split("/")[
          url.split("#")[0].split("/").length - 1
        ];
      }
      return shortUrl;
    },
    // 当前域名
    getHomeUrl(url) {
      return url.split("/")[0] + "//" + url.split("/")[2];
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
    getCode(appid) {
      const redirect_uri = encodeURIComponent(
        this.getHomeUrl(window.location.href)
      );
      window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_userinfo&state=${this.getShortCode(
        window.location.href
      )}#wechat_redirect`;
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
          corpId: window.sessionStorage.getItem("corpId"),
        },
        success: (res) => {
          this.openId = res.data.data;
          this.getUrl();
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
      uni.request({
        url: BASE_URL + "/url/radar",
        dataType: "json",
        data: {
          openId: this.openId,
          shortCode: this.shortCode,
        },
        success: (res) => {
          if (res.data.data.slice(0, 4) !== "http") {
            window.location.replace(`http://${res.data.data}`);
          } else {
            window.location.replace(`${res.data.data}`);
          }
        },
        fail: (err) => {
          // TODO 失败也应该跳转
          console.log("request fail", err);
        },
      });
    },
  },
};
</script>

<style lang=" scss"></style>
