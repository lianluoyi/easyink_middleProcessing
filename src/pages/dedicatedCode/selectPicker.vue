<!--
 * @Author: chenchengjie
 * @LastEditors: chenchengjie
-->
<template>
  <view class="picker-box">
    <u-cell class="cell-box" :border="false" isLink @click="showPicker = true">
      <view slot="title">
        <text v-if="!value" class="cell-text-placeholder">{{ placeholder }}</text>
        <text v-else class="cell-text">{{ label }}</text>
      </view>
    </u-cell>
    <u-picker :show="showPicker" :columns="columns" cancelText="清空" keyName="label" @confirm="handleConfirm" @cancel="handleCancel"></u-picker>
  </view>
</template>
<script>
  export default {
    props: {
      value: {
        type: String,
        default: ''
      },
      columns: {
        type: Array,
        default: []
      },
      placeholder: {
        type: String,
        default: '请选择'
      }
    },
    data() {
      return {
        showPicker: false
      };
    },
    computed: {
      // 获取选中值的label
      label() {
        if(!this.columns.length) return '';
        const target = this.columns[0].find((item) => {
          return item.id == this.value;
        });
        return target?.label;
      }
    },
    methods: {
      handleConfirm(e) {
        this.showPicker = false;
        this.$emit('input', e.value[0].id);
      },
      handleCancel() {
        this.showPicker = false;
        this.$emit('input', null);
      }
    }
  };
</script>
<style lang="scss" scoped>
  .picker-box {
    width: 100%;
    .cell-box {
      width: 100%;
      .cell-text {
        font-size: 14px;
        color: #101010;
        &-placeholder {
          font-size: 12px;
          color: #c0c4cc;
        }
      }
    }
    .u-cell.cell-box {
      ::v-deep .u-cell__body {
        padding: 12px 0px;
      }
    }
  }
</style>
