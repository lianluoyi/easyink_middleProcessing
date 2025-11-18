<!--
 * @Author: chenchengjie
 * @LastEditors: chenchengjie
-->
<template>
  <view>
    <view v-if="showExpried" class="expried-info">
      <u-image src="../../assets/image/expriePage.png" width="150px" height="150px" />
      <view class="title">该活码不存在或已被删除</view>
    </view>
    <view v-else class="dedicated-code">
      <p class="info">客户扫码添加客服后，以下信息将自动录入客户资料。 </p>
      <u-collapse :value="['baseInfo']" class="dedicated-code-collapse">
        <!-- 基本信息 -->
        <u-collapse-item ref="baseInfoCollapse" title="基本信息" name="baseInfo">
          <u-form ref="baseForm" :model="baseInfoForm" :rules="rules" labelPosition="top" labelWidth="auto" :labelStyle="{ 'font-size': '14px' }">
            <u-form-item label="客户备注" prop="remarkName">
              <view>
                <u-switch v-model="baseInfoForm.remarkOpen" size="20" class="remark-switch" @change="() => initCollapse('base')"></u-switch>
                <div v-if="baseInfoForm.remarkOpen">
                  <u-radio-group v-model="baseInfoForm.remarkType" placement="row" class="remark-radio-group">
                    <u-radio label="在昵称前" :name="REMARK_TYPE.before"></u-radio>
                    <u-radio label="在昵称后" :name="REMARK_TYPE.after"></u-radio>
                  </u-radio-group>
                  <view class="remark-input-box">
                    <span v-if="baseInfoForm.remarkType === REMARK_TYPE.before" class="remark-input-text prefix">客户昵称-</span>
                    <view class="clearable-wrapper">
                      <u-textarea
                        v-model="baseInfoForm.remarkName"
                        placeholder="请输入备注"
                        maxlength="20"
                        count
                        confirm-type="done"
                        :class="{ prefix: baseInfoForm.remarkType === REMARK_TYPE.before, suffix: baseInfoForm.remarkType === REMARK_TYPE.after }"
                        class="remark-input"
                      ></u-textarea>
                      <u-icon
                        v-if="baseInfoForm.remarkName"
                        name="close-circle-fill"
                        size="16"
                        color="#c0c4cc"
                        class="clear-icon"
                        @click="baseInfoForm.remarkName = ''"
                      ></u-icon>
                    </view>
                    <span v-if="baseInfoForm.remarkType === REMARK_TYPE.after" class="remark-input-text suffix">-客户昵称</span>
                  </view>
                </div>
              </view>
            </u-form-item>
            <u-form-item v-if="tagStatus" label="客户标签" prop="tagIds" :required="tagRequired" class="cell-form">
              <u-cell class="cell-box tag-cell" :border="false" isLink url="/pages/dedicatedCode/customerTags" @click="handleTagClick">
                <view slot="title">
                  <text v-if="baseInfoForm.tagIds.length === 0" class="cell-text-placeholder">请设置客户标签</text>
                  <view class="tag-box" v-else>
                    <u-tag v-for="id in baseInfoForm.tagIds" :key="id" :text="formatTagName(id)" size="mini" type="warning" class="tag-item"> </u-tag>
                  </view>
                </view>
              </u-cell>
            </u-form-item>
          </u-form>
        </u-collapse-item>
        <!-- 更多信息 -->
        <u-collapse-item ref="moreInfoCollapse" title="更多信息" name="moreInfo" class="more-info-collapse">
          <u-form ref="moreForm" :model="moreInfoForm" :rules="rules" labelPosition="top" labelWidth="auto" :labelStyle="{ 'font-size': '14px' }">
            <view v-for="item in extendPropertyList.filter((item) => item.status)" :key="item.id">
              <!-- 日期 -->
              <u-form-item
                v-if="item.name === '出生日期' || item.type === PROPERTY_TYPE.date"
                :label="item.name"
                :prop="item.id"
                :required="item.liveCodeRequired"
                class="cell-form"
              >
                <datetime-picker v-model="moreInfoForm[item.id]" v-bind="item.attrs" :placeholder="'请选择' + item.name" />
              </u-form-item>
              <!-- 单行文本 -->
              <u-form-item
                v-else-if="
                  (item.type === PROPERTY_TYPE.default && ['邮箱', '电话', '地址'].includes(item.name)) || item.type === PROPERTY_TYPE.singleLineText
                "
                :label="item.name"
                :prop="item.id"
                :required="item.liveCodeRequired"
                class="cell-form"
              >
                <view class="clearable-wrapper" style="width: 100%">
                  <u-input
                    v-model="moreInfoForm[item.id]"
                    v-bind="item.attrs"
                    :placeholder="'请输入' + item.name"
                    :maxlength="item.name === '地址' ? 64 : 32"
                    class="form-input"
                  />
                  <u-icon
                    v-if="moreInfoForm[item.id]"
                    name="close-circle-fill"
                    size="16"
                    color="#c0c4cc"
                    class="clear-icon input"
                    @click="moreInfoForm[item.id] = ''"
                  ></u-icon>
                </view>
              </u-form-item>
              <!-- 多行文本 -->
              <u-form-item
                v-else-if="item.name === '描述' || item.type === PROPERTY_TYPE.multiLineText"
                :label="item.name"
                :prop="item.id"
                :required="item.liveCodeRequired"
                class="cell-form"
              >
                <view class="clearable-wrapper">
                  <u-textarea
                    v-model="moreInfoForm[item.id]"
                    clearable
                    placeholder="请输入描述"
                    :maxlength="item.name === '描述' ? '150' : '200'"
                    count
                    autoHeight
                    confirm-type="done"
                    class="form-textarea"
                  ></u-textarea>
                  <u-icon
                    v-if="moreInfoForm[item.id]"
                    name="close-circle-fill"
                    size="16"
                    color="#c0c4cc"
                    class="clear-icon textarea"
                    @click="moreInfoForm[item.id] = ''"
                  ></u-icon>
                </view>
              </u-form-item>
              <!-- 单选框 -->
              <u-form-item
                v-else-if="item.type === PROPERTY_TYPE.singleSelect"
                :label="item.name"
                :prop="item.id"
                :required="item.liveCodeRequired"
                class="cell-form"
              >
                <u-radio-group v-model="moreInfoForm[item.id]" placement="row" class="remark-radio-group">
                  <u-radio v-for="option in item.optionList" :key="option.id" :label="option.multipleValue" :name="option.id"></u-radio>
                </u-radio-group>
              </u-form-item>
              <!-- 多选框 -->
              <u-form-item
                v-else-if="item.type === PROPERTY_TYPE.multiSelect"
                :label="item.name"
                :prop="item.id"
                :required="item.liveCodeRequired"
                class="cell-form"
              >
                <u-checkbox-group v-model="moreInfoForm[item.id]" placement="row" class="checkbox-group">
                  <u-checkbox v-for="option in item.optionList" :key="option.id" :label="option.multipleValue" :name="option.id"></u-checkbox>
                </u-checkbox-group>
              </u-form-item>
              <!-- 下拉框 -->
              <u-form-item
                v-else-if="item.type === PROPERTY_TYPE.dropDown"
                :label="item.name"
                :prop="item.id"
                :required="item.liveCodeRequired"
                class="cell-form"
              >
                <selectPicker
                  v-model="moreInfoForm[item.id]"
                  :columns="[
                    item.optionList.map((item) => {
                      return { label: item.multipleValue, id: item.id };
                    })
                  ]"
                  :placeholder="'请选择' + item.name"
                />
              </u-form-item>
              <!-- 图片、文件 -->
              <u-form-item
                v-else-if="[PROPERTY_TYPE.image, PROPERTY_TYPE.file].includes(item.type)"
                :label="item.name"
                :prop="item.id"
                :required="item.liveCodeRequired"
                class="cell-form"
              >
                <upload
                  v-model="moreInfoForm[item.id]"
                  :type="item.type === PROPERTY_TYPE.image ? 'image' : 'file'"
                  @delete="handleDelete($event, item.id)"
                />
              </u-form-item>
              <template v-else-if="item.type === PROPERTY_TYPE.address">
                <u-form-item :label="item.name" :prop="item.id" :required="item.liveCodeRequired" class="cell-form">
                  <div class="address-box">
                    <addressCell
                      :ref="`address-picker-${item.id}`"
                      v-model="moreInfoForm[item.id]"
                      :districtList="districtList"
                      :allow-manual="item.extra && item.extra.allowManual"
                      :api-key="apiKey"
                      placeholder="省、市、区/县、街道/镇"
                    />
                    <u-cell
                      class="cell-box"
                      :border="false"
                      :isLink="item.extra && item.extra.allowManual"
                      :url="
                        item.extra && item.extra.allowManual
                          ? `/pages/dedicatedCode/detailAddressSearch?corpId=${$route.query.corpId}&location=${getLocation(item.id)}`
                          : ''
                      "
                      @click="() => handleTagClick(item.id)"
                    >
                      <view slot="title">
                        <p v-if="moreInfoForm[item.id] && moreInfoForm[item.id].detailAddress" class="address-text intwoline">{{
                          moreInfoForm[item.id].detailAddress
                        }}</p>
                        <p v-else class="cell-text-placeholder">详细地址</p>
                      </view>
                    </u-cell>
                  </div>
                </u-form-item>
              </template>
            </view>
          </u-form>
        </u-collapse-item>
      </u-collapse>
      <u-toast ref="uToast"></u-toast>
      <u-button type="primary" class="submit-btn" @click="handleSubmit">生成活码</u-button>
      <u-loading-page :loading="loading" bg-color="#00000060" loadingText="" loadingMode="spinner"></u-loading-page>
    </view>
  </view>
</template>

<script>
  import { getOriginEmpleInfo, getTagList, getExtendProperty, genCustomerEmployQrCode, getTagGroupValid } from '../../api/customerCode';
  import { getDistrictList, getMapKeyConfig } from '../../api/map';
  import datetimePicker from './datetimePicker.vue';
  import upload from './upload.vue';
  import selectPicker from './selectPicker.vue';
  import addressCell from './addressCell.vue';
  // 备注类型
  const REMARK_TYPE = {
    none: 0, // 不设置备注
    before: 1, //在昵称前
    after: 2 //在昵称后
  };
  // 扩展属性类型
  const PROPERTY_TYPE = {
    default: 1, // 系统默认字段
    singleLineText: 2, // 单行文本
    multiLineText: 3, // 多行文本
    singleSelect: 4, // 单选框
    multiSelect: 5, // 多选框
    dropDown: 6, // 下拉框
    date: 7, // 日期
    image: 8, // 图片
    file: 9, // 文件
    address: 10 // 地址
  };
  /** 专属活码标签必填校验类型 */
  const TAG_GROUP_VALID_TYPE = {
    ALL: 0, // 全部标签组
    ANY: 1 // 任一标签组
  };
  export default {
    components: {
      datetimePicker,
      upload,
      selectPicker,
      addressCell
    },
    data() {
      return {
        tagList: [], // 所有标签列表
        tagRequired: false, // 标签是否必填
        tagStatus: false, // 标签是否启用
        extendPropertyList: [], // 所有扩展属性列表
        baseInfoForm: {
          remarkOpen: false,
          remarkType: REMARK_TYPE.before,
          remarkName: '',
          tagIds: []
        },
        moreInfoForm: {
          /** uView现存bug，若form的model接收的是空对象，
           * 无法正确触发表单校验，所以在此设置一个无用属性
           */
          mark: ''
        },
        rules: {
          remarkName: {
            validator: (rule, value, callback) => {
              if (this.baseInfoForm.remarkOpen && !value) {
                return callback('请输入备注');
              }
              return callback();
            }
          },
          tagIds: {
            validator: (rule, value, callback) => {
              if (this.tagRequired && this.baseInfoForm.tagIds.length === 0) {
                return callback('请设置标签');
              }
              return callback();
            }
          }
        },
        loading: false,
        REMARK_TYPE,
        PROPERTY_TYPE,
        showExpried: false, // 是否显示活码已过期的缺省图
        extendPropertyMap: {}, // 扩展属性id和name的映射
        resizeObserver: null, // 监听元素高度变化
        districtList: [], // 省市区列表
        apiKey: '' // 地图接口key
      };
    },
    async onLoad() {
      try {
        await this.getOriginEmpleInfo();
        await this.getExtendPropertyList();
        await this.getAllTags();
        await this.getTagRequiredAll();
        this.initCollapse('base'); // collapse内部元素变化，需要执行init方法重新计算高度
      } catch (error) {
        console.error('获取活码原始信息失败:');
        this.showExpried = true;
      }
    },
    mounted() {
      // 创建 ResizeObserver 实例
      this.resizeObserver = new ResizeObserver(() => {
        if (!this.$refs.moreInfoCollapse) return;
        const originExpanded = this.$refs.moreInfoCollapse.expanded;
        this.initCollapse('more');
        this.$refs.moreInfoCollapse.expanded = originExpanded;
      });
      // 监听需要观察的元素
      const moreForm = this.$refs.moreForm?.$el;
      if (moreForm) this.resizeObserver.observe(moreForm);
    },
    beforeDestroy() {
      // 清理 observer
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
    },
    onShow() {
      // 页面显示时恢复表单数据
      try {
        const cacheData = localStorage.getItem('dedicatedCodeFormData');
        if (cacheData) {
          const formData = JSON.parse(cacheData);
          this.baseInfoForm = { ...this.baseInfoForm, ...formData.baseInfoForm };
          this.moreInfoForm = { ...this.moreInfoForm, ...formData.moreInfoForm };
          this.$nextTick(() => {
            this.$refs.moreInfoCollapse.expanded = formData.collapseExpand;
          });
        }
        // 在页面数据恢复后清除缓存，保证数据只有一次存储
        localStorage.removeItem('dedicatedCodeFormData');
      } catch (error) {
        console.error('恢复表单数据失败:', error);
      } finally {
        this.initCollapse('base');
      }
    },
    computed: {
      allWeTags() {
        return this.tagList.flatMap((tag) => tag.weTags);
      }
    },
    methods: {
      // 获取标签必填校验配置
      async getTagRequiredAll() {
        const res = await getTagGroupValid({ corpId: this.$route.query.corpId, empleCodeId: this.$route.query.employCodeId })
        const tagGroupValid = res?.data;
        // 是否需要校验全部标签组
        const tagRequiredAll = tagGroupValid === TAG_GROUP_VALID_TYPE.ALL && this.tagRequired;
        localStorage.setItem('tagRequiredAll', tagRequiredAll);
      },
      getLocation(id) {
        if (!this.moreInfoForm[id] || !this.moreInfoForm[id].location) {
          return '';
        }
        const { lat, lng } = this.moreInfoForm[id].location;
        return `${lat},${lng}`;
      },
      // 获取所有tag
      async getAllTags() {
        const res = await getTagList({ corpId: this.$route.query.corpId, originEmpleId: this.$route.query.employCodeId });
        this.tagList = res?.rows || [];
        // 储存所有tag
        localStorage.setItem('tagList', JSON.stringify(this.tagList));
      },
      // 获取活码原始信息
      async getOriginEmpleInfo() {
        const { data } = await getOriginEmpleInfo({ employCodeId: this.$route.query.employCodeId, corpId: this.$route.query.corpId });
        if (data.remarkType === REMARK_TYPE.none) {
          this.baseInfoForm.remarkOpen = false;
        } else {
          this.baseInfoForm.remarkOpen = true;
          this.baseInfoForm.remarkName = data.remarkName;
          this.baseInfoForm.remarkType = data.remarkType;
        }
        this.baseInfoForm.tagIds = data.weEmpleCodeTags.map((item) => item.tagId);
        localStorage.setItem('originTagList', JSON.stringify(this.baseInfoForm.tagIds)); // 存储活码原始标签
      },
      // 获取扩展属性列表
      async getExtendPropertyList() {
        const res = await getExtendProperty({ corpId: this.$route.query.corpId });
        res?.data.forEach((item) => {
          const rule = {};
          switch (item.name) {
            case '客户标签':
              this.tagRequired = item.liveCodeRequired;
              this.tagStatus = item.status;
              break;
            case '出生日期':
              item.attrs = {
                minDate: Date.now() - 100 * 365 * 24 * 60 * 60 * 1000,
                maxDate: Date.now()
              };
              break;
            case '电话':
              item.attrs = {
                maxlength: 32
              };
              rule.validator = (rule, value, callback) => {
                if (item.liveCodeRequired && !value) {
                  return callback('请设置电话')
                }
                const phoneList = value.split(',');
                const phoneReg = /^[0-9+-]{5,32}$/;
                let valid = true;
                phoneList.forEach((phone) => {
                  if (phone && !phoneReg.test(phone)) {
                    valid = false;
                    return;
                  }
                });
                return !valid ? callback('请输入正确格式的电话') : callback()
              };
              break;
            case '邮箱':
              item.attrs = {
                maxlength: 32
              };
              rule.validator = (rule, value, callback) => {
                if (item.liveCodeRequired) {
                  return !value ? callback('请设置邮箱') : callback();
                } 
                return !value ? callback() : uni.$u.test.email(value) ? callback() : callback('请输入正确格式的邮箱');
              };
              break;
            case '地址':
              item.attrs = {
                maxlength: 64
              };
              rule.validator = (rule, value, callback) => {
                const addressValues = Object.values(value || {});
                if (item.liveCodeRequired && (!value || addressValues.every((item) => !item))) {
                  return callback('请设置地址');
                }
                return callback()
              };
              break;
            default:
              rule.required = true;
              rule.message = '请设置' + item.name;
              break;
          }
          if (item.type === PROPERTY_TYPE.address && item.extra) {
            try {
              item.extra = JSON.parse(item.extra);
            } catch (error) {
              console.error('解析地址扩展属性失败:', error);
            }
            rule.validator = (rule, value, callback) => {
              const addressValues = Object.values(value || {});
              if (item.liveCodeRequired && (!value || addressValues.every((item) => !item))) {
                return callback('请设置地址');
              }
              return callback()
            };
          }
          if (item.liveCodeRequired) {
            this.$set(this.rules, item.id, rule);
          } else if (rule.validator) {
            // 未设置必填也需要进行格式校验，例如电话、邮箱
            this.$set(this.rules, item.id, {
              validator: rule.validator
            });
          }
          this.extendPropertyMap[item.id] = item.name;
        });
        this.extendPropertyList = res?.data || [];
        // 如果存在地址类型，则获取地图接口key以及省市区列表
        if (this.extendPropertyList.find((item) => item.type === PROPERTY_TYPE.address)) {
          getMapKeyConfig({ corpId: this.$route.query.corpId }).then((res) => {
            this.apiKey = res.data?.iframeApiKey || '';
          });
          getDistrictList({ corpId: this.$route.query.corpId }).then((res) => {
            this.districtList = res.data.result;
          });
        }
      },
      formatTagName(tagId) {
        return this.allWeTags.find((item) => item.tagId === tagId)?.name;
      },
      handleDelete(event, id) {
        this.moreInfoForm[id].splice(event.index, 1);
      },
      handleTagClick(formId) {
        const property = this.extendPropertyList.find((item) => item.id === formId);
        if (property && !property?.extra?.allowManual) {
          this.$refs.uToast.show({
            type: 'default',
            message: '当前字段不允许手动修改'
          });
          return;
        }
        if (formId) {
          // 储存当前编辑的地址项表单id
          localStorage.setItem('currentFormId', formId);
        }
        // 页面跳转时保存表单数据到本地存储
        const formData = {
          baseInfoForm: this.baseInfoForm,
          moreInfoForm: this.moreInfoForm,
          collapseExpand: this.$refs.moreInfoCollapse?.expanded || false
        };
        localStorage.setItem('dedicatedCodeFormData', JSON.stringify(formData));
      },
      initCollapse(type = 'base') {
        this.$refs[`${type}InfoCollapse`]?.init();
      },
      // 时间戳转YYYY-MM-DD日期格式
      timestampToDate(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，所以要加 1，并将结果补零
        const day = String(date.getDate()).padStart(2, '0'); // 日期补零
        return `${year}-${month}-${day}`;
      },
      async handleSubmit() {
        const validPromise = [this.$refs.baseForm.validate(), this.$refs.moreForm.validate()];
        Promise.all(validPromise)
          .then(async (valid) => {
            if (!valid) return;
            this.loading = true;
            let multiData = [];
            const extendPropertyList = Object.keys(this.moreInfoForm)
              .map((key) => {
                const type = this.extendPropertyList.find((item) => item.id === key)?.type;
                const value = this.moreInfoForm[key];
                const name = this.extendPropertyMap[key];
                if (!value) {
                  return null;
                }
                // 接口传参要求：多选框和文件、图片，需要将值（array）拆分成每个单独的对象发送（multiData）
                if ([PROPERTY_TYPE.multiSelect, PROPERTY_TYPE.file, PROPERTY_TYPE.image].includes(type)) {
                  if (value.length === 0) {
                    return null;
                  }
                  value.forEach((item) => {
                    // 文件格式需要转为字符串的json
                    const tempValue =
                      type === PROPERTY_TYPE.file ? `{"name":"${item.fileName}","url":"${item.url}","content":""}` : item?.url || item;
                    multiData.push({
                      id: key,
                      type,
                      name,
                      value: tempValue
                    });
                  });
                  return null;
                }
                if (type === PROPERTY_TYPE.date || name === '出生日期') {
                  return {
                    id: key,
                    type,
                    name,
                    value: this.timestampToDate(value)
                  };
                }
                if (type === PROPERTY_TYPE.address) {
                  if (value.town === '暂不选择') {
                    value.town = '';
                  }
                  return {
                    id: key,
                    type,
                    name,
                    value: JSON.stringify(value)
                  };
                }
                return {
                  id: key,
                  type,
                  name,
                  value
                };
              })
              .filter(Boolean);
            const basePayload = {
              ...this.baseInfoForm,
              // 若没有开启标签字段，生成活码时不传标签
              tagIds: this.tagStatus ? this.baseInfoForm.tagIds : []
            }
            const payload = {
              ...basePayload,
              employCodeId: this.$route.query.employCodeId,
              extendPropertyList: [...extendPropertyList, ...multiData].filter((item) => item.id !== 'mark') // 过滤掉无用的临时数据
            };
            try {
              const res = await genCustomerEmployQrCode(payload);
              uni.$u.route({
                url: '/pages/dedicatedCode/customerCode',
                params: {
                  url: res.data
                }
              });
            } catch (error) {
              this.$refs.uToast.show({
                type: 'error',
                title: '警告',
                message: `生成活码失败: ${error}`
              });
            } finally {
              this.loading = false;
            }
          })
          .catch(() => {
            this.initCollapse('more');
            this.$refs.moreInfoCollapse.expanded = true;
          })
          .finally(() => {
            this.initCollapse('base');
          });
      }
    }
  };
</script>
<style lang="scss" scoped>
  .expried-info {
    height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .title {
      font-size: 14px;
      color: #acabab;
    }
  }
  .dedicated-code {
    background: #ffffff;
    .info {
      font-size: 14px;
      padding: 8px 10px 6px 10px;
      background: #f4f4f4;
    }
    &-collapse {
      height: calc(100dvh - 55px - 35px);
      overflow-y: auto;
      ::v-deep .u-collapse-item > .u-cell > .u-cell__body {
        background: #f4f4f4;
      }
    }
    ::v-deep .u-collapse > .u-line {
      display: none;
    }
    ::v-deep .more-info-collapse {
      & > .u-collapse-item__content[style*='height: 0px'] {
        border-bottom: 1px solid #d6d7d980;
      }
      & > .u-line {
        display: none;
      }
    }
    ::v-deep .u-collapse .u-collapse-item .u-collapse-item__content > uni-view {
      padding: 10px 10px 0px 10px;
      .remark-switch {
        margin-top: 10px;
        height: 18px !important;
        .u-switch__node {
          height: 16px !important;
          width: 16px !important;
          transform: translateX(-24px) !important;
          box-shadow: 0px 0px 1px 1px rgba(0, 0, 0, 0.25) !important;
          &--on {
            transform: translateX(0px) !important;
          }
        }
      }
      .remark-radio-group {
        margin-top: 10px;
        flex-wrap: wrap;
        > .u-radio {
          margin: 0 16px 5px 0;
          > .u-radio__text {
            font-size: 12px !important;
          }
        }
      }
      .checkbox-group {
        margin-top: 10px;
        flex-wrap: wrap;
        flex: 1;
        .u-checkbox {
          margin: 0 16px 5px 0;
        }
        uni-text {
          font-size: 12px !important;
        }
      }
      .clearable-wrapper {
        position: relative;
        display: inline-block;
        .clear-icon {
          position: absolute;
          right: 42px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1;
          cursor: pointer;
          &.textarea {
            right: 4px;
            top: 40%;
          }
          &.input {
            right: 4px;
            top: 50%;
          }
        }
      }
      .remark-input {
        width: calc(100vw - 122px);
        padding: 7px 9px;
        max-height: 16px;
        &.prefix {
          border-radius: 0 4px 4px 0;
        }
        &.suffix {
          border-radius: 4px 0 0 4px;
        }
        .u-textarea__field {
          height: 16px !important;
          font-size: 12px !important;
          .uni-textarea-textarea {
            width: calc(100vw - 180px);
            white-space: nowrap;
          }
        }
        .u-textarea__count {
          bottom: 5px !important;
        }
        &-box {
          display: flex;
          align-items: center;
          margin-top: 10px;
        }
        &-text {
          font-size: 14px;
          background: #f5f7fa;
          padding: 6px 8px;
          &.prefix {
            border-radius: 4px 0 0 4px;
            border: 0.5px solid #d7d7d7;
            border-right: none;
          }
          &.suffix {
            border-radius: 0 4px 4px 0;
            border: 0.5px solid #d7d7d7;
            border-left: none;
          }
        }
      }
    }
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
      .address-text {
        font-size: 12px;
      }
      .tag-box {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        .tag-item {
          width: max-content;
          ::v-deep .u-tag--mini {
            height: 24px;
            padding: 0 7px;
            border-radius: 5px;
          }
        }
      }
    }
    .cell-form {
      ::v-deep .u-form-item__body {
        padding-bottom: 0px !important;
        &__left__content__required {
          font-size: 12px;
          position: unset;
          margin-right: 4px;
          margin-bottom: 2px;
        }
        &__right__message {
          margin: 5px 0px;
        }
      }
      .address-box {
        display: flex;
        flex: 1;
        flex-direction: column;
      }
    }
    .u-cell.cell-box {
      ::v-deep .u-cell__body {
        padding: 5px 0px 12px 0px;
      }
    }
    .form-input {
      padding: 2px 9px !important;
      ::v-deep .u-input__content__field-wrapper__field {
        font-size: 12px !important;
      }
    }
    .form-textarea {
      width: calc(100vw - 40px);
      padding: 8px 9px 20px 9px;
      ::v-deep .u-textarea__field {
        font-size: 12px;
      }
    }
    .submit-btn {
      width: calc(100vw - 20px);
      height: 35px;
      margin: 10px;
    }
  }
  .intwoline {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    -ms-text-overflow: ellipsis;
    text-overflow: ellipsis;
  }
</style>
