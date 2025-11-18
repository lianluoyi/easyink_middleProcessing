<!--
 * @Author: chenchengjie
 * @LastEditors: chenchengjie
-->
<template>
  <view>
    <view class="search-wrapper">
      <u-search
        v-model="keyword"
        placeholder="请输入标签组/标签名"
        :showAction="false"
        height="25px"
        :clearabled="false"
        searchIconSize="18px"
        class="search-input"
      ></u-search>
      <view v-if="keyword" class="clear-icon" @click="handleClear">
        <u-icon name="close" size="14" color="#999"></u-icon>
      </view>
    </view>
    <view class="tags-container">
      <view v-for="item in filteredList" :key="item.groupId" class="tag-group">
        <text class="tag-group-name" :class="{ required: requiredAll }">{{ item.groupName }}</text>
        <text class="valid-msg" v-if="emptyIdList.includes(item.groupId)">请选择标签</text>
        <view class="tag-item-list">
          <view class="tag-item" v-for="tag in item.weTags" :key="tag.tagId">
            <u-button :text="tag.name" :class="{ selected: isSelected(tag.tagId) }" @click="handleSelectTag(tag.tagId)"></u-button>
          </view>
        </view>
      </view>
    </view>
    <view class="btn-container">
      <u-button class="reset-btn" @click="handleReset">重置</u-button>
      <u-button type="primary" class="save-btn" @click="handleSave">保存</u-button>
    </view>
    <u-toast ref="uToast"></u-toast>
  </view>
</template>
<script>
  export default {
    data() {
      return {
        tagList: [], // 所有标签列表
        keyword: '',
        selectedList: [], // 已选标签
        originList: [], // 活码默认设置的标签
        formData: {},
        emptyIdList: [], // 未选择标签的标签组id列表
        requiredAll: false // 是否需要校验全部标签组
      };
    },
    onLoad() {
      try {
        const formDataCache = JSON.parse(localStorage.getItem('dedicatedCodeFormData'));
        const tagListCache = JSON.parse(localStorage.getItem('tagList'));
        const originTagList = JSON.parse(localStorage.getItem('originTagList'));
        const tagRequiredAll = localStorage.getItem('tagRequiredAll');
        if (formDataCache) {
          this.formData = formDataCache;
        }
        if (tagListCache) {
          this.tagList = tagListCache;
        }
        if (originTagList) {
          this.originList = originTagList;
        }
        if (tagRequiredAll) {
          this.requiredAll = tagRequiredAll === 'true';
        }
      } catch (error) {
        console.log(['error', error]);
      }
      this.selectedList = this.formData?.baseInfoForm.tagIds || [];
    },
    computed: {
      filteredList() {
        if (!this.keyword) {
          return this.tagList;
        }
        const result = this.tagList.map((item) => {
          if (item.groupName.includes(this.keyword)) {
            return item;
          }
          return {
            ...item,
            weTags: item.weTags.filter((tag) => tag.name.includes(this.keyword))
          };
        });
        return result.filter((item) => item.weTags.length > 0);
      }
    },
    methods: {
      isSelected(tagId) {
        return this.selectedList.includes(tagId);
      },
      handleSelectTag(tagId) {
        const index = this.selectedList.findIndex((item) => item === tagId);
        if (index === -1) {
          this.selectedList.push(tagId);
        } else {
          this.selectedList.splice(index, 1);
        }
      },
      handleSave() {
        if (this.requiredAll) {
          // 获取未选择标签的标签组id列表
          this.emptyIdList = this.filteredList.filter((item) => !item.weTags.some((tag) => this.selectedList.includes(tag.tagId))).map((item) => item.groupId);
          if (this.emptyIdList.length > 0) {
          this.$refs.uToast.show({
              type: 'default',
              message: '存在必填项未选择'
            });
            return;
          }
        }
        this.formData.baseInfoForm.tagIds = this.selectedList;
        localStorage.setItem('dedicatedCodeFormData', JSON.stringify(this.formData));
        uni.navigateBack();
      },
      handleReset() {
        this.selectedList = [...this.originList];
      },
      handleClear() {
        this.keyword = '';
      }
    }
  };
</script>
<style lang="scss" scoped>
  .search-wrapper {
    position: relative;
    padding: 20px 10px;
    .search-input {
      width: 100%;
      padding: 0 !important;
      ::v-deep .u-search__content__input {
        font-size: 12px;
      }
    }
    .clear-icon {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      padding: 5px;
      display: flex;
      align-items: center;
      z-index: 1;
    }
  }
  .tags-container {
    max-height: calc(100dvh - 135px);
    overflow-y: auto;
    margin: 0 10px 10px 10px;
    .tag-group:not(:first-child) {
      margin-top: 10px;
    }
    .tag-group-name {
      font-size: 14px;
      color: #101010;
      &.required {
        &::before {
          content: '* ';
          color: red;
        }
      }
    }
    .valid-msg {
      font-size: 12px;
      color: red;
      margin-left: 10px;
    }
    .tag-item-list {
      display: flex;
      flex-wrap: wrap;
      .tag-item {
        margin: 5px 5px 0 0;
        .u-button--normal {
          padding: 0 8px;
          height: 26px;
          border-radius: 5px;
          border: none;
          &.selected {
            background-color: #ff9900;
            color: #ffffff;
          }
          &:not(.selected) {
            background-color: #bfbfbf;
            color: rgba(0, 0, 0, 0.65);
          }
        }
        ::v-deep .u-button__text {
          font-size: 12px !important;
        }
      }
    }
  }
  .btn-container {
    display: flex;
    width: calc(100% - 20px);
    margin: 10px;
    position: fixed;
    bottom: 0;
    .u-button {
      height: 35px;
      &.reset-btn {
        border-top-right-radius: 0px;
        border-bottom-right-radius: 0px;
      }
      &.save-btn {
        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;
      }
    }
  }
</style>
