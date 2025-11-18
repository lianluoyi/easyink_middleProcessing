<!--
 * @Author: chenchengjie
 * @LastEditors: chenchengjie
 * @Description: 详细地址搜索页面
-->
<template>
  <view class="container">
    <view class="textarea-wrapper">
      <u-textarea
        v-model="inputValue"
        confirmType="done"
        placeholder="请输入详细地址"
        maxlength="48"
        height="62"
        class="address-textarea"
        @input="handleSearch"
      ></u-textarea>
      <view class="button-group">
        <u-button size="mini" @click="clearInput" class="clear-btn">{{inputValue ? '清空' : '取消'}}</u-button>
        <u-button size="mini" type="primary" @click="confirmAddress" class="confirm-btn">确认</u-button>
      </view>
    </view>
    <u-toast ref="uToast"></u-toast>
    <!-- 搜索结果列表 -->
    <scroll-view 
      class="search-list" 
      scroll-y
      @scrolltolower="loadMore"
      :style="{height: 'calc(100vh - 132px)'}"
    >
      <view class="search-item" v-for="(item, index) in searchResults" :key="index" @click="selectAddress(item)">
        <u-icon name="map" color="#1990ff" style="margin-right: 5px"></u-icon>
        <div>
          <text class="address-name">{{ item.title }}</text>
          <text class="address-detail">{{ item.address }}</text>
        </div>
      </view>
      <view class="load-more" v-if="isLoading">
        <u-loading-icon></u-loading-icon>
      </view>
      <view class="load-more" v-if="loadAll">
        <text class="load-all-text">已经到底了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
  import { getAddressByKeyword, getRegeocode } from '@/api/map';
  import { SPECIAL_REGION } from '@/utils/constant';
  const STATUS_SUCCESS = 0; // 搜索响应正常code
  export default {
    data() {
      return {
        inputValue: '',
        searchResults: [],
        searchTimer: null,
        formData: {},
        currentFormId: '',
        count: 0, // 搜索结果总数，用于判断是否还有下一页
        currentPage: 1, // 当前页码
        pageSize: 20, // 每页数量
        isLoading: false, // 是否正在加载
        loadAll: false, // 是否已加载全部
        currentKeyword: '' // 当前搜索关键词
      };
    },
    onLoad() {
      try {
        const formDataCache = JSON.parse(localStorage.getItem('dedicatedCodeFormData'));
        const currentFormId = localStorage.getItem('currentFormId');
        if (formDataCache) {
          this.formData = formDataCache;
        }
        if (currentFormId) {
          this.currentFormId = currentFormId;
        }
      } catch (error) {
        console.log(['error', error]);
      }
      this.inputValue = this.formData.moreInfoForm?.[this.currentFormId]?.detailAddress || '';
    },
    methods: {
      // 处理搜索
      handleSearch() {
        // 防抖处理
        if (this.searchTimer) {
          clearTimeout(this.searchTimer);
        }

        this.searchTimer = setTimeout(() => {
          if (this.inputValue.trim()) {
            this.currentPage = 1;
            this.searchResults = [];
            this.loadAll = false;
            this.currentKeyword = this.inputValue;
            this.searchAddress(this.inputValue);
          } else {
            this.searchResults = [];
            this.loadAll = false;
          }
        }, 500);
      },

      // 搜索地址
      async searchAddress(keyword) {
        // 没有选择省市区，只输入详细地址时，不进行远程搜索
      if (!this.$route.query.location) {
        return;
      }
        if (this.isLoading) return;
        this.isLoading = true;
        try {
          const res = await getAddressByKeyword({ 
            keyword, 
            corpId: this.$route.query.corpId, 
            location: this.$route.query.location, 
            pageIndex: this.currentPage, 
            pageSize: this.pageSize 
          });
          if (res.data.status === STATUS_SUCCESS) {
            if (this.currentPage === 1) {
              this.searchResults = res.data.data;
            } else {
              this.searchResults = [...this.searchResults, ...res.data.data];
            }
            this.count = res.data.count;
            
            // 判断是否已加载全部
            if (this.searchResults.length >= this.count) {
              this.loadAll = true;
            }
          }
        } catch (error) {
          console.error('搜索地址失败:', error);
          this.$refs.uToast.show({
            type: 'default',
            message: '搜索失败'
          });
        } finally {
          this.isLoading = false;
        }
      },

      // 加载更多
      loadMore() {
        if (this.isLoading || this.loadAll) return;
        
        if (this.searchResults.length < this.count) {
          this.currentPage++;
          this.searchAddress(this.currentKeyword);
        } else {
          this.loadAll = true;
        }
      },

      // 选择地址
      async selectAddress(item) {
        // 地址api调用失败，支持手动填入
        if(!item.location) {
          this.formData.moreInfoForm[this.currentFormId] = {
            ...this.formData.moreInfoForm[this.currentFormId],
            detailAddress: item.title,
          };
        } else if(SPECIAL_REGION.includes(item.province)){
          // 港澳台不获取第四级区划
          this.formData.moreInfoForm[this.currentFormId] = {
            ...this.formData.moreInfoForm[this.currentFormId],
            province: item.province,
            city: item.city,
            area: item.district,
            detailAddress: item.title,
          };
        } else {
          // 获取选择地址的第四级区划
          const res = await getRegeocode({
            location: `${item.location.lat},${item.location.lng}`,
            corpId: this.$route.query.corpId
          })
          const { address_reference } = res.data.result;
          // 直接返回上一页并传递地址信息
          this.formData.moreInfoForm[this.currentFormId] = {
            ...this.formData.moreInfoForm[this.currentFormId],
            province: item.province,
            city: item.city,
            area: item.district,
            town: address_reference.town.title,
            detailAddress: item.title,
            location: item.location
          };
        }
        localStorage.setItem('dedicatedCodeFormData', JSON.stringify(this.formData));
        uni.navigateBack();
      },

      // 清空输入/取消返回
      clearInput() {
        if (this.inputValue) {
          this.inputValue = '';
          this.searchResults = [];
        } else {
          uni.navigateBack();
        }
      },

      // 确认地址
      confirmAddress() {
        this.selectAddress(this.searchResults?.[0] || { title: this.inputValue });
      }
    }
  };
</script>

<style scoped>
  .container {
    padding: 10px;
    background: #fff;
    .textarea-wrapper {
      position: relative;
      .address-textarea {
        margin-top: 10px;
        border-radius: 7px;
      }
      .button-group {
        position: absolute;
        right: 5px;
        bottom: 5px;
        display: flex;
        gap: 5px;
        .clear-btn,
        .confirm-btn {
          padding: 0 10px;
          height: 22px;
          line-height: 22px;
          font-size: 12px;
        }
        .clear-btn {
          border-color: #dcdfe6;
          color: #c0c4cc;
        }
      }
    }
    .search-list {
      margin-top: 20px;
    }
    .empty-list {
      margin-top: 20px;
      color: #999;
      text-align: center;
    }
    .search-item {
      padding: 10px;
      border-top: 1px solid #dcdfe6;
      &:last-child {
        border-bottom: 1px solid #dcdfe6;
      }
      display: flex;
      align-items: center;
    }

    .address-name {
      font-size: 14px;
      color: #333;
      display: block;
    }

    .address-detail {
      font-size: 12px;
      color: #c0c4cc;
      display: block;
    }
    
    .load-more {
      text-align: center;
      padding: 15px 0;
    }
    
    .load-all-text {
      color: #999;
      font-size: 12px;
    }
  }
</style>
