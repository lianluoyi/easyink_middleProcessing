<!--
 * @Author: chenchengjie
 * @LastEditors: chenchengjie
-->
<template>
  <view class="customer-code">
    <u-image :showLoading="true" :src="src" width="170px" height="170px" class="qr-code"></u-image>
    <view class="title">已生成专属活码</view>
    <view class="subtitle">该活码有效期{{ expireTime }}小时</view>
    <u-button type="primary" class="submit-btn" @click="handleBack">返回重新配置 </u-button>
  </view>
</template>
<script>
  import { getExpireTime } from '@/api/customerCode';
  const DEFAULT_EXPIRE_TIME = 24;
  export default {
    data() {
      return {
        src: '',
        expireTime: DEFAULT_EXPIRE_TIME
      };
    },
    onLoad() {
      this.src = this.$route.query.url;
      getExpireTime().then((res) => {
        this.expireTime = res?.data || DEFAULT_EXPIRE_TIME;
      });
    },
    methods: {
      handleBack() {
        try {
          const customerCodeParams = JSON.parse(localStorage.getItem('customerCodeParams'));
          uni.$u.route({
            url: '/pages/dedicatedCode/index',
            params: customerCodeParams
          });
        } catch (error) {
          console.log(['error', error]);
        }
      }
    }
  };
</script>
<style lang="scss" scoped>
  .customer-code {
    height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .qr-code {
      display: block;
      margin: 0 auto;
      margin-bottom: 20px;
    }
    .title {
      font-size: 14px;
      margin-bottom: 20px;
    }
    .subtitle {
      font-size: 14px;
      color: #f2a622;
    }
    .submit-btn {
      width: calc(100vw - 20px);
      height: 35px;
      margin: 10px;
      position: absolute;
      bottom: 0;
    }
  }
</style>
