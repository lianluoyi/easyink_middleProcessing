<!--
 * @Author: chenchengjie
 * @LastEditors: chenchengjie
-->
<template>
  <view class="datetime-picker">
    <u-cell class="cell-box" :border="false" isLink @click="showPicker = true">
      <view slot="title">
        <text v-if="!value" class="cell-text-placeholder">{{ placeholder }}</text>
        <text v-else class="cell-text">{{ formatDate(new Date(value)) }}</text>
      </view>
    </u-cell>
    <u-datetime-picker
      :show="showPicker"
      v-model="date"
      mode="date"
      :formatter="formatter"
      cancelText="清空"
      :min-date="minDate"
      :max-date="maxDate"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    ></u-datetime-picker>
  </view>
</template>

<script>
  export default {
    props: {
      value: {
        type: Number,
        default: null
      },
      placeholder: {
        type: String,
        default: '请选择日期'
      },
      // 默认最小日期为十年前
      minDate: {
        type: Number,
        default: Date.now() - 10 * 365 * 24 * 60 * 60 * 1000
      },
      // 默认最大日期为十年后
      maxDate: {
        type: Number,
        default: Date.now() + 10 * 365 * 24 * 60 * 60 * 1000
      }
    },
    data() {
      return {
        showPicker: false,
        date: this.value || new Date().getTime()
      };
    },
    watch: {
      value: {
        handler(newVal) {
          this.date = newVal || new Date().getTime();
        },
        immediate: true
      }
    },
    methods: {
      formatter(type, value) {
        const typeMap = {
          year: '年',
          month: '月',
          day: '日'
        };
        return `${value}${typeMap[type]}`;
      },
      formatDate(date) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      },
      handleConfirm(e) {
        this.showPicker = false;
        this.date = e.value;
        this.$emit('input', e.value);
      },
      handleCancel() {
        this.showPicker = false;
        this.date = new Date().getTime();
        this.$emit('input', null);
      }
    }
  };
</script>
<style lang="scss" scoped>
  .datetime-picker {
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
