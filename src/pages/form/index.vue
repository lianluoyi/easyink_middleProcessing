<!--
 * @Description: 表单
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <view class="form" v-if="!showResultPage">
    <scroll-view class="container" scroll-y :style="{ height: windowHeight + 'px' }">
      <view class="form-basic">
        <!-- 头图 -->
        <u-image mode="cover" v-if="formSet.headImageOpenFlag" :src="formSet.headImageUrl" :width="windowWidth" :height="windowWidth / 2.5" />
        <!-- 表单名称 -->
        <view class="form-name">{{ formSet.formName }}</view>
        <!-- 表单说明 -->
        <view class="form-description" v-if="formSet.descriptionFlag">
          {{ formSet.description }}
        </view>
      </view>

      <view class="form-detail">
        <u-form :model="formSet" :borderBottom="false">
          <view
            v-for="item in prewievForm"
            :key="item.id"
            :id="getElementId(item)"
            class="form-detail-item"
            :style="!isImageOrCarousel(item.type) ? 'padding: 0px 10px' : ''"
          >
            <view v-if="isShowComponent(item)">
              <!-- 标题 -->
              <view class="form-label" v-show="showTitle(item.type)">
                <text v-if="item.type === ONE_LINE_TEXT_COMPONENT || item.type === MANY_LINE_TEXT_COMPONENT">
                  <text :class="item.required ? 'required' : ''">
                    {{ formSet.showSortFlag ? `${getSortIndex(item)}. ${item.title}` : item.title }}
                  </text>
                  <text v-if="item.valueLimitType === TEXT_LENGTH_TYPE && item.max" class="label-limit">
                    {{ `(${(item.answer && item.answer.length) || 0}/${item.max})` }}
                  </text>
                </text>
                <text v-else :class="item.required ? 'required' : ''">
                  {{ formSet.showSortFlag ? `${getSortIndex(item)}. ${item.title}` : item.title }}
                </text>
              </view>
              <u-form-item :borderBottom="false">
                <!-- 单选 -->
                <u-radio-group v-if="item.type === RADIO_COMPONENT" v-model="item.answer" placement="column" style="width: 100%">
                  <!-- 使用JSON.stringify是为了获取到当前选择答案的id和label，
                在提交的时候少一层遍历获取id和label 
                详情需要label 判断显示条件需要id  -->
                  <u-radio
                    :customStyle="{ marginBottom: '8px' }"
                    v-for="radio in item.options"
                    :key="radio.id"
                    :name="JSON.stringify(radio)"
                    :label="radio.label"
                  />
                </u-radio-group>
                <!-- 多选 -->
                <u-checkbox-group
                  v-if="item.type === CHECKBOX_COMPONENT"
                  v-model="item.answer"
                  placement="column"
                  style="width: 100%"
                  @change="(e) => checkBoxAndDropDownBoxChange(e, item)"
                >
                  <u-checkbox
                    :customStyle="{ marginBottom: '8px' }"
                    v-for="checkBox in item.options"
                    :key="checkBox.id"
                    :label="checkBox.label"
                    :name="JSON.stringify(checkBox)"
                    :disabled="checkBox.disabled"
                  />
                </u-checkbox-group>
                <!-- 下拉框  -->
                <view class="form-detail-item-date" v-if="item.type === SELECT_COMPONENT">
                  <u-form-item
                    @click="
                      clickDropDownBox(item);
                      hideKeyboard();
                    "
                  >
                    <u-input v-model="item.answer" disabled disabledColor="#ffffff" placeholder="请选择" />
                    <u-icon slot="right" style="margin-right: 10px" name="arrow-right" />
                  </u-form-item>
                </view>
                <!-- 单行文本 -->
                <u-input
                  style="width: 100%; border: 1px solid #d9d9d9"
                  v-if="item.type === ONE_LINE_TEXT_COMPONENT"
                  v-model="item.answer"
                  :maxlength="item.max || -1"
                  :placeholder="item.info"
                />
                <!-- 多行文本 -->
                <view v-if="item.type === MANY_LINE_TEXT_COMPONENT" class="form-detail-item-textarea">
                  <u-textarea confirmType="done" :maxlength="item.max || -1" v-model="item.answer" :placeholder="item.info" />
                </view>
                <!-- 日期时间 -->
                <view class="form-detail-item-date" v-if="item.type === DATE_TIME_COMPONENT">
                  <u-form-item
                    @click="
                      clickDateTime(item);
                      hideKeyboard();
                    "
                  >
                    <u-input v-model="item.answer" disabled disabledColor="#ffffff" :placeholder="item.info" />
                    <u-icon slot="right" style="margin-right: 10px" name="arrow-right" />
                  </u-form-item>
                </view>
                <!-- 评分 -->
                <view v-if="item.type === SCORE_COMPONENT" class="form-detail-item-rate">
                  <u-rate v-model="item.answer" :touchable="false" :minCount="0" />
                  <text class="auxiliaryText">
                    {{ getAuxiliaryText(item.auxiliaryTextOptions, item.answer) }}
                  </text>
                </view>
                <!-- NPS -->
                <view class="form-detail-item-nps" v-if="item.type === NPS_COMPONENT" :key="item.id">
                  <view class="nps-score">
                    <!-- 没有0 所有到11 再减去1 -->
                    <text
                      v-for="npsItem in NPS_LENGTH"
                      :key="npsItem"
                      @click="chooseNpsScore(item, npsItem)"
                      :style="item.answer === npsItem ? 'background-color:#1989FA;color:white;' : ''"
                    >
                      {{ npsItem }}
                    </text>
                  </view>
                  <view class="nps-text">
                    <text>{{ item.leftAuxiliaryText }}</text>
                    <span>{{ item.righAuxiliarytText }}</span>
                  </view>
                </view>
                <!-- 文字 -->
                <view v-if="item.type === TEXT_COMPONENT" :style="`color: ${item.textColor};line-height: 20px;`">
                  {{ item.content }}
                </view>
                <!-- 图片 -->
                <view style="width: 100%" v-if="item.type === IMAGE_COMPONENT">
                  <u-image :src="item.imageUrl" :width="windowWidth" :height="windowWidth / 2.5" mode="cover" />
                </view>
                <!-- 轮播图 -->
                <view style="width: 100%" v-if="item.type === CAROUSEL_COMPONENT">
                  <u-swiper :height="windowWidth / 2.5" radius="0" :list="getSwiperList(item)" />
                </view>
              </u-form-item>
              <view class="required-info">
                {{ item.message }}
              </view>
            </view>
          </view>
        </u-form>
      </view>
      <view class="submit" v-if="showButton">
        <u-button
          type="primary"
          :color="formSet.submitColor"
          :disabled="formSet.submitButtonDisabled"
          :text="formSet.submitText"
          customStyle="margin-top: 30px;border:none"
          @click="submit"
        />
      </view>
    </scroll-view>
    <!-- 日期选择组件 -->
    <u-datetime-picker
      :show="showChooseDate"
      v-model="chooseDateValue"
      :mode="dateTimeBoxType === YEAR_MONTH_TYPE ? 'date' : 'datetime '"
      closeOnClickOverlay
      :minDate="DATE_TIME_OLD"
      @confirm="chooseDateConfirm"
      @cancel="showChooseDate = false"
      @close="showChooseDate = false"
      ref="dateTimePicker"
    />
    <!-- 下拉框选择组件 -->
    <u-popup :show="showDropDownBox" :closeOnClickOverlay="false" :round="10" mode="bottom">
      <view class="drop-down">
        <!-- 标题 -->
        <view class="drop-down-title">
          <text class="action cancel">
            <text @click="showDropDownBox = false">取消</text>
          </text>
          <text class="title">{{ dropDownBoxOptions.title }}</text>
          <text class="action confim">
            <text @click="confimSelectDropDownBox">确定</text>
          </text>
        </view>

        <!-- 选项 -->
        <view class="drop-down-options">
          <u-checkbox-group
            v-model="dropDownBoxOptions.dropDownBoxSelectSwap"
            placement="column"
            iconPlacement="right"
            @change="checkBoxAndDropDownBoxChange"
          >
            <u-checkbox
              :customStyle="{
                marginBottom: '10px',
                borderTop: '1px solid #eee',
                padding: '10px 10px 0 10px'
              }"
              v-for="item in dropDownBoxOptions.options"
              :key="item.id"
              :label="item.label"
              :name="JSON.stringify(item)"
              :disabled="item.disabled"
            />
          </u-checkbox-group>
        </view>
      </view>
    </u-popup>
    <u-toast ref="uToast" />
  </view>
  <view v-else class="result-page">
    <u-image :src="resultPageOptions.iconUrl" v-if="!resultPageOptions.errorResult" width="150px" height="150px" />
    <view v-else>
      <u-image src="../../assets/image/limitPage.png" v-if="resultPageOptions.showLimitPage" width="150px" height="150px" />
      <u-image src="../../assets/image/expriePage.png" v-else width="150px" height="150px" />
    </view>
    <text :class="resultPageOptions.errorResult ? 'error-page' : 'result-page-text'">
      {{ resultPageOptions.text }}
    </text>
  </view>
</template>

<script>
  /** 1949年时间戳 */
  const DATE_TIME_OLD = -662716800000;
  const NPS_LENGTH = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const YEAR_MONTH_DATE_TIME = 'yyyy-mm-dd hh-MM';
  const YEAR_MONTH_DATE = 'yyyy-mm-dd';
  /** 数值 */
  const NUMS_TYPE = 1;
  /** 字数 */
  const TEXT_LENGTH_TYPE = 2;
  /** 网址 */
  const WEBSITE_TYPE = 3;
  /** 邮箱类型*/
  const EMAIL_TYPE = 4;
  // 选择的日期格式
  /** 年月日 */
  const YEAR_MONTH_TYPE = 1;
  /** 年月日时分 */
  const HOURS_MINUTE_TYPE = 2;
  /**  网址校验*/
  const WEB_REG = /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/;
  /** 邮箱校验 */
  const EMAIL =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  /** 数字校验 */
  const NUMS = /^\d+$/;
  // 提交结果
  /** 跳转结果页面  */
  const JUMP_RESULT_PAGE = 2;
  /** 跳转链接 */
  const JUMP_LINK = 3;
  import {
    RADIO_COMPONENT,
    CHECKBOX_COMPONENT,
    SELECT_COMPONENT,
    ONE_LINE_TEXT_COMPONENT,
    MANY_LINE_TEXT_COMPONENT,
    DATE_TIME_COMPONENT,
    SCORE_COMPONENT,
    NPS_COMPONENT,
    TEXT_COMPONENT,
    IMAGE_COMPONENT,
    CAROUSEL_COMPONENT
  } from '../../utils/constant';
  import { indexOf, find, findIndex } from 'lodash';
  import { getFormDetailApi, submitFormApi } from '../../config/api';
  export default {
    data() {
      return {
        requestQuery: {},
        prewievForm: [],
        formSet: {},
        labelStyle: {
          fontWeight: 'bold',
          marginBottom: '5px'
        },
        chooseDateValue: '',
        showChooseDate: false,
        // 设置一个保存已经点击的下拉框值，避免下拉框回显的时候无法显示
        dropDownBoxSelectSwap: [],
        showButton: false,
        RADIO_COMPONENT,
        CHECKBOX_COMPONENT,
        SELECT_COMPONENT,
        ONE_LINE_TEXT_COMPONENT,
        MANY_LINE_TEXT_COMPONENT,
        DATE_TIME_COMPONENT,
        SCORE_COMPONENT,
        NPS_COMPONENT,
        TEXT_COMPONENT,
        IMAGE_COMPONENT,
        CAROUSEL_COMPONENT,
        NPS_LENGTH,
        YEAR_MONTH_TYPE,
        HOURS_MINUTE_TYPE,
        TEXT_LENGTH_TYPE,
        DATE_TIME_OLD,
        // 是否显示下拉框弹窗
        showDropDownBox: false,
        // 下拉框弹窗配置项
        dropDownBoxOptions: {},
        // 日期控件展示的类型
        dateTimeBoxType: HOURS_MINUTE_TYPE,
        // 当前选择的日期控件/下拉框 所属的控件 防止多个控件出现相同答案的情况
        componentChooseItem: {},
        windowHeight: '',
        // 当前屏幕宽度
        windowWidth: '',
        // 表单提交的参数
        submitParams: {},
        showResultPage: false,
        resultPageOptions: {
          iconUrl: '',
          text: ''
        }
      };
    },
    onLoad(params) {
      this.windowHeight = wx.getSystemInfoSync().windowHeight;
      this.windowWidth = wx.getSystemInfoSync().windowWidth;
      this.requestQuery = params;
      this.getFormDetail();
    },
    methods: {
      /**
       * @description 是否显示标题
       * @param type 当前类型
       */
      showTitle(type) {
        return ![TEXT_COMPONENT, IMAGE_COMPONENT, CAROUSEL_COMPONENT].includes(type);
      },

      /**
       * @description 获取元素id
       */
      getElementId(item) {
        return item.iconName + item.id.replace(new RegExp('-', 'g'), '');
      },

      /**
       * @description 获取元素到顶部的位置
       */
      async getElementScollTop(id) {
        /**
         * 分三步
         * 1.获取最外层类名为container距离顶部的位置，会出现负值是因为屏幕滑动超过了顶部
         * 2.获取当前元素 id是用当前元素名+元素id来判断
         * 3.获取表单基础的元素高度，避免滚动的时候距离顶部没有位置 同时-10是表单距离表单基础元素的外边距
         */
        const externalTop = await this.getSelectEleTop('.container');
        const eleTop = await this.getSelectEleTop('#' + id);
        const basicTop = await this.getSelectEleTop('.form-basic');
        setTimeout(() => {
          uni.pageScrollTo({
            scrollTop: eleTop.top - externalTop.top - basicTop.height - 10,
            duration: 0
          });
        }, 0);
      },
      /**
       * @description 异步获取元素到顶部的距离
       * @param element 当前元素
       */
      getSelectEleTop(element) {
        return new Promise((resolve) => {
          uni
            .createSelectorQuery()
            .in(this)
            .select(element)
            .boundingClientRect((res) => {
              resolve(res);
            })
            .exec();
        });
      },

      /**
       * @description 获取轮播图Url
       * item 图片对象
       */
      getSwiperList(imgItem) {
        return imgItem.imageUrlList.map((item) => item.url);
      },

      /**
       * @description 获取表单详情
       */
      getFormDetail() {
        getFormDetailApi(this.requestQuery).then((res) => {
          const { closeSubmitFlag, limitSubmitFlag } = res.data;
          if (closeSubmitFlag || limitSubmitFlag) {
            this.showResultPage = true;
            this.dealResultPage(limitSubmitFlag);
            return;
          }
          this.prewievForm = JSON.parse(res.data.weFormModel.formFieldListJson);
          this.submitParams = res.data;
          this.showButton = true;
          this.formSet = { ...res.data.weFormModel };
        });
      },

      /**
       * @description 处理表单异常页面
       * @param showLimitPage 展示 限制提交次数
       * 提交次数优先级>截止时间(过期表单)
       */
      dealResultPage(showLimitPage) {
        if (showLimitPage) {
          this.resultPageOptions = {
            text: '你已填写该表单',
            // errorResult 是否显示表单异常页的图片
            errorResult: true,
            showLimitPage: true
          };
          return;
        }
        this.resultPageOptions = {
          text: '该表单已截止提交',
          errorResult: true
        };
      },

      /**
       * @description 获取序号
       */
      getSortIndex(componentItem) {
        // 过滤掉当前不需要显示序号的控件以及隐藏的控件  TEXT_COMPONENT,IMAGE_COMPONENT, CAROUSEL_COMPONENT,
        const newArr = this.prewievForm.filter(
          (item) => ![TEXT_COMPONENT, IMAGE_COMPONENT, CAROUSEL_COMPONENT].includes(item.type) && this.isShowComponent(item)
        );
        // +1是因为从0开始的
        return indexOf(newArr, componentItem) + 1;
      },

      hideKeyboard() {
        uni.hideKeyboard();
      },

      /**
       * @description 确认选择日期
       */
      chooseDateConfirm(e) {
        this.showChooseDate = false;
        this.componentChooseItem.answer = uni.$u.timeFormat(
          e.value,
          this.dateTimeBoxType === YEAR_MONTH_TYPE ? YEAR_MONTH_DATE : YEAR_MONTH_DATE_TIME
        );
      },

      /**
       * @description 获取评分组件辅助文字
       * @param 评分组件辅助文字数组
       * @param answer 当前选择的星星数量
       */
      getAuxiliaryText(auxiliaryTextOptions, answer) {
        const textObj = find(auxiliaryTextOptions || [], { scoreType: answer });
        return textObj?.text;
      },

      /**
       * @description 选择NPS分数
       * @param 当前的控件
       * @param 当前选择的分数
       */
      chooseNpsScore(item, scoreItem) {
        this.$set(this.prewievForm, findIndex(this.prewievForm, item), {
          ...item,
          answer: scoreItem
        });
      },

      /**
       * @description 是否是图片或者轮播图
       * @param 当前的控件类型
       */
      isImageOrCarousel(type) {
        return [IMAGE_COMPONENT, CAROUSEL_COMPONENT].includes(type);
      },

      submit() {
        const { recordId, actionInfoParam, submitActionType } = this.submitParams;
        const { customerServiceRate, formResult } = this.getTopicInfo();
        const checkRuleResultList = this.checkRule(JSON.parse(formResult));
        this.prewievForm = this.prewievForm.map((item) => {
          const checkRuleResultItem = find(checkRuleResultList, {
            id: item.id
          });
          return {
            ...item,
            message: checkRuleResultItem?.message
          };
        });
        if (!checkRuleResultList.length) {
          const params = {
            recordId,
            formResult,
            npsValueList: customerServiceRate.npsValueList,
            scoreValueList: customerServiceRate.scoreValueList
          };
          submitFormApi(params).then(() => {
            switch (submitActionType) {
              case JUMP_RESULT_PAGE: {
                const { document, iconUrl } = actionInfoParam;
                this.showResultPage = true;
                this.resultPageOptions = {
                  text: document,
                  iconUrl
                };
                break;
              }
              case JUMP_LINK: {
                const { url } = actionInfoParam;
                if (url.slice(0, 4) !== 'http') {
                  window.location.replace(`http://${url}`);
                } else {
                  window.location.replace(`${url}`);
                }
                break;
              }
              default:
                this.formSet.submitText = '已提交';
                this.formSet.submitButtonDisabled = true;
                break;
            }
          });
        } else {
          this.getElementScollTop(this.getElementId(checkRuleResultList[0]));
          return this.$refs.uToast.show({
            type: 'error',
            icon: false,
            message: '请填写必填项'
          });
        }
      },

      /**
       * @description 校验当前题目设置的条件
       * @param arr 当前题目详情
       * @return 校验失败的题目数组
       */
      // TODO 使用 async-valid库进行校验
      checkRule(arr) {
        const balidationFailedArr = [];
        arr.forEach((item) => {
          if (item.showFlag) {
            switch (item.type) {
              case ONE_LINE_TEXT_COMPONENT:
              case MANY_LINE_TEXT_COMPONENT: {
                const { max, min, required, hasFillIn, answer, iconName } = item;
                switch (item.valueLimitType) {
                  case NUMS_TYPE: {
                    // 数字，没有设置上下限：请填写数字
                    // 数字，有设置下限：提示“请填写大于N的数字”
                    // 数字，有设置上限：提示“请填写小于N的数字”
                    // 数字，设置上下限：提示“请填写大于N1，小于N2的数字”
                    if ((required && !hasFillIn && !max && !min) || (hasFillIn && !NUMS.test(answer || ''))) {
                      balidationFailedArr.push({
                        message: '请填写数字',
                        id: item.id,
                        iconName
                      });
                    }
                    if ((required && !hasFillIn && max && min) || (hasFillIn && max && min && (answer > +max || answer < +min))) {
                      balidationFailedArr.push({
                        message: `请填写大于${min}，小于${max}的数字`,
                        id: item.id,
                        iconName
                      });
                    }
                    if ((required && !hasFillIn && max && !min) || (hasFillIn && max && !min && answer > +max)) {
                      balidationFailedArr.push({
                        message: `请填写小于${max}的数字`,
                        id: item.id,
                        iconName
                      });
                    }
                    if ((required && !hasFillIn && min && !max) || (hasFillIn && min && !max && answer < +min)) {
                      balidationFailedArr.push({
                        message: `请填写大于${min}的数字`,
                        id: item.id,
                        iconName
                      });
                    }
                    break;
                  }
                  case TEXT_LENGTH_TYPE: {
                    // 字数，有设置下限：提示“请填写至少N个字”
                    // 字数，有设置上限：超出部分不显示
                    if (required && !hasFillIn) {
                      balidationFailedArr.push({
                        message: `请填写该项`,
                        id: item.id,
                        iconName
                      });
                    }
                    if (hasFillIn && min && ((item.answer && item.answer.length) || 0) < min) {
                      balidationFailedArr.push({
                        message: `请填写至少${min}个字`,
                        id: item.id,
                        iconName
                      });
                    }
                    break;
                  }
                  // 网址，若不符合网址格式：提示“请填写正确的网址”
                  // 邮箱，若不符合邮箱格式：提示“请填写正确的电子邮箱”
                  case WEBSITE_TYPE:
                  case EMAIL_TYPE: {
                    const checkRegRule = item.valueLimitType === WEBSITE_TYPE ? WEB_REG : EMAIL;
                    if ((required && !hasFillIn) || (hasFillIn && !checkRegRule.test(answer || ''))) {
                      balidationFailedArr.push({
                        message: `请填写${item.valueLimitType === WEBSITE_TYPE ? '正确的网址' : '正确的电子邮箱'}`,
                        id: item.id,
                        iconName
                      });
                    }
                    break;
                  }
                  default:
                    if (item.required && !item.hasFillIn) {
                      balidationFailedArr.push({
                        message: '请填写该项',
                        id: item.id,
                        iconName
                      });
                    }
                    break;
                }
                break;
              }
              case CHECKBOX_COMPONENT: {
                const { minSelectNums, selectNums, required, hasFillIn, iconName } = item;
                if (required && !hasFillIn) {
                  balidationFailedArr.push({
                    message: '请填写该项',
                    id: item.id,
                    iconName
                  });
                }
                if (hasFillIn && selectNums < minSelectNums) {
                  balidationFailedArr.push({
                    message: `最少选择${minSelectNums}项`,
                    id: item.id,
                    iconName
                  });
                }
                break;
              }
              default: {
                // 设置必填但是没填
                if (item.required && !item.hasFillIn) {
                  balidationFailedArr.push({
                    message: '请填写该项',
                    id: item.id,
                    iconName: item.iconName
                  });
                }
              }
            }
          }
        });
        return balidationFailedArr;
      },

      /**
       * @description 获取当前题目详情
       * @return {customerServiceRate} 客服好评率
       * @return {formResult} 根据不同类型的控件的数据转换成后续校验和提交表单的数据
       */
      getTopicInfo() {
        const customerServiceRate = {
          npsValueList: [],
          scoreValueList: []
        };
        const newArr = this.prewievForm
          .filter((item) => ![TEXT_COMPONENT, IMAGE_COMPONENT, CAROUSEL_COMPONENT].includes(item.type))
          .map((con) => {
            const baseInfo = {
              id: con.id,
              type: con.type,
              question: con.title,
              answer: con.showFlag ? con.answer : undefined,
              required: con.required,
              // 是否已经填写该问题
              hasFillIn: Boolean(Array.isArray(con.answer) ? con.answer.length : con.answer),
              showFlag: con.showFlag,
              iconName: con.iconName
            };
            switch (con.type) {
              case RADIO_COMPONENT: {
                return {
                  ...baseInfo,
                  answer: con.showFlag && con.answer ? JSON.parse(con.answer).label : undefined
                };
              }
              case CHECKBOX_COMPONENT: {
                const answer = con.answer || [];
                return {
                  ...baseInfo,
                  answer:
                    con.showFlag && answer.length
                      ? answer
                          .map((item) => {
                            return JSON.parse(item).label;
                          })
                          .join('、')
                      : undefined,
                  hasFillIn: answer.length !== 0,
                  maxSelectNums: con.maxSelectNums,
                  minSelectNums: con.minSelectNums,
                  selectNums: answer.length
                };
              }
              case SELECT_COMPONENT: {
                return {
                  ...baseInfo,
                  answer:
                    con.showFlag && (con.dropDownBoxSelectSwap || []).length
                      ? con.dropDownBoxSelectSwap
                          .map((item) => {
                            return JSON.parse(item).label;
                          })
                          .join('、')
                      : undefined,
                  hasFillIn: (con.dropDownBoxSelectSwap || []).length !== 0
                };
              }
              case ONE_LINE_TEXT_COMPONENT:
              case MANY_LINE_TEXT_COMPONENT: {
                return {
                  ...baseInfo,
                  valueLimitType: con.valueLimitType,
                  min: con.min,
                  max: con.max
                };
              }
              case SCORE_COMPONENT: {
                if (con.customerServiceRate) {
                  customerServiceRate.scoreValueList.push(con.answer);
                }
                return {
                  ...baseInfo,
                  text: this.getAuxiliaryText(con.auxiliaryTextOptions, con.answer)
                };
              }
              case NPS_COMPONENT: {
                if (con.customerServiceRate) {
                  customerServiceRate.npsValueList.push(con.answer);
                }
                return {
                  ...baseInfo,
                  // 单独处理NPS 因为NPS有个数值是0 转换成布尔值的时候会是false
                  hasFillIn: Boolean(con.answer !== undefined)
                };
              }
              default: {
                return baseInfo;
              }
            }
          });
        return { customerServiceRate, formResult: JSON.stringify(newArr) };
      },

      /**
       * @description 根据当前组件设置的显示条件判断是否显示
       * @param item 当前控件
       * @return 是否需要显示当前控件
       */
      isShowComponent(item) {
        /** 实现方法
       1. 从当前控件拿到设置的显示规则 ruleList
       2. 遍历ruleList 根据ruleList中的questionId找到 设置的对应控件问题
       3. 在遍历ruleList中ruleItem设置的answer列表 将每一个answerItem与 ruleQuestion(当前具体的问题)的答案对比
       4. 将对比的答案返回给 ruleItemAnswer 结束遍历的时候判断ruleItemAnswer中是否全部满足单个规则的所有条件(meetCondition都为true) 是的话canShow为true
       5. 判断 ruleItem 中 canShow 是否有为 true的 有则代表满足单个条件 显示该组件
       */
        const { ruleList = [] } = item;
        item.showFlag = true;
        if (!ruleList.length) return true;
        //
        ruleList.forEach((ruleItem) => {
          // 根据questionId找到具体的问题
          const ruleQuestion = find(this.prewievForm, {
            id: ruleItem.questionId
          });
          if (ruleQuestion) {
            const ruleItemAnswer = ruleItem.answer.map((ruleAnswerId) => {
              switch (ruleQuestion.type) {
                case RADIO_COMPONENT: {
                  return {
                    ruleAnswerId,
                    meetCondition: JSON.parse(ruleQuestion.answer || '{}').id === ruleAnswerId
                  };
                }
                case CHECKBOX_COMPONENT: {
                  // 将选择的答案装进数组中
                  const newRuleQuestionAnswer = (ruleQuestion.answer || []).map((ruleQuestionAnswerItem) => {
                    return JSON.parse(ruleQuestionAnswerItem).id;
                  });
                  return {
                    ruleAnswerId,
                    meetCondition: newRuleQuestionAnswer.includes(ruleAnswerId)
                  };
                }
                case SELECT_COMPONENT: {
                  const newRuleQuestionAnswer = (ruleQuestion.dropDownBoxSelectSwap || []).map((ruleQuestionAnswerItem) => {
                    return JSON.parse(ruleQuestionAnswerItem).id;
                  });
                  return {
                    ruleAnswerId,
                    meetCondition: newRuleQuestionAnswer.includes(ruleAnswerId)
                  };
                }
                case NPS_COMPONENT: {
                  return {
                    ruleAnswerId,
                    meetCondition: ruleQuestion.answer === ruleAnswerId
                  };
                }
              }
            });
            ruleItem.canShow = !ruleItemAnswer.filter((arg) => !arg.meetCondition).length;
          }
        });
        const showFlag = findIndex(ruleList, (o) => o.canShow) !== -1;
        item.showFlag = showFlag;
        return showFlag;
      },

      /**
       * @description 点击下拉框控件
       * @param 当前下拉框控件
       */
      clickDropDownBox(item) {
        this.showDropDownBox = true;
        this.componentChooseItem = item;
        this.dropDownBoxOptions = {
          ...item
        };
      },

      /**
       * @description 点击时间控件
       * @param 当前时间控件
       */
      clickDateTime(item) {
        this.dateTimeBoxType = item.dataType;
        this.componentChooseItem = item;
        // 设置日期选择器打开时候的值
        this.chooseDateValue = item.answer ? Number(new Date(item.answer)) : Number(new Date());
        this.$refs['dateTimePicker'].innerValue = this.chooseDateValue;
        this.showChooseDate = true;
      },

      /**
       * @description 下拉框/多选框修改的回调
       * @param argItem 回调值，当前已经选择的项
       * @param chooseItem 多选框时 当前选择的控件 下拉框时为 undefined
       */
      checkBoxAndDropDownBoxChange(argItem, chooseItem) {
        // 根据设置的最多选择选项设置选项是否禁用
        const { maxSelectNums, options } = chooseItem ? chooseItem : this.dropDownBoxOptions;
        if (!chooseItem) {
          this.componentChooseItem.dropDownBoxSelectAnswer = argItem;
        }
        // 当前选择的数量大于设置的maxSelectNums值时，在options过滤掉当前选择的选项，其他禁用
        const selectArr = argItem.map((selectItem) => {
          return JSON.parse(selectItem).id;
        });
        options.forEach((item) => {
          item.disabled = typeof maxSelectNums === 'number' && argItem.length >= maxSelectNums && selectArr.indexOf(item.id) === -1;
        });
      },

      /**
       * @description 确定当前下拉框控件选择的选项
       */
      confimSelectDropDownBox() {
        const { minSelectNums } = this.dropDownBoxOptions;
        // 当前选择的选项少于设置的选项时
        if ((this.componentChooseItem.dropDownBoxSelectAnswer || []).length < minSelectNums) {
          return this.$refs.uToast.show({
            type: 'error',
            icon: false,
            message: `至少选择${minSelectNums}个选项`
          });
        }
        this.showDropDownBox = false;
        this.componentChooseItem.dropDownBoxSelectSwap = this.componentChooseItem.dropDownBoxSelectAnswer;
        this.componentChooseItem.answer = (this.componentChooseItem.dropDownBoxSelectAnswer || [])
          .map((item) => {
            return JSON.parse(item).label;
          })
          .join('、');
      }
    }
  };
</script>

<style lang="scss" scoped>
  .form {
    .container {
      height: auto !important;
    }
    .form-name {
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #101010;
      font-weight: bold;
    }

    .form-description {
      color: #606266;
      font-size: 14px;
      padding: 0 10px;
      line-height: 20px;
    }

    .drop-down {
      max-height: 30%;
      min-height: 218px;

      .drop-down-title {
        display: flex;
        justify-content: space-around;
        min-height: 48px;

        .title {
          max-width: 70%;
          display: flex;
          align-items: center;
        }

        .action {
          display: flex;
          align-items: center;
          color: #409eff;
          font-size: 14px;
          width: 130px;
          text {
            padding: 0 10px;
          }
        }

        .cancel {
          justify-content: flex-start;
        }

        .confim {
          justify-content: flex-end;
        }
      }

      .drop-down-options {
        height: 170px;
        overflow-y: auto;
      }
    }

    .form-detail {
      margin-top: 10px;
      ::v-deep .u-form-item__body {
        padding-bottom: 0;
      }
      .form-detail-item-date {
        width: 100%;
        ::v-deep .u-form-item__body {
          padding: 0;
        }
        border-radius: 5px;
      }
      .form-label {
        color: #101010;
        font-size: 14px;
        font-weight: bold;
        margin-top: 10px;
        .label-limit {
          color: #999;
          font-size: 14px;
          font-weight: 100;
          margin-left: 10px;
        }
      }
      .required {
        @extend .form-label;
      }
      .required::after {
        content: ' *';
        color: red;
      }
      .required-info {
        color: red;
        font-size: 12px;
      }
      .form-detail-item-rate {
        display: flex;
        align-items: center;
        height: 25px;

        .auxiliaryText {
          margin-left: 10px;
          color: #ee0a24;
        }
      }

      .form-detail-item-nps {
        padding-right: 10px;
        width: 100%;

        .nps-score {
          display: flex;
          justify-content: space-around;

          text {
            display: inline-block;
            width: 25px;
            height: 25px;
            line-height: 25px;
            color: #626266;
            background-color: #f5f6f7;
            text-align: center;
          }
        }

        .choose-nps-score {
          @extend .nps-score;

          text {
            background-color: red;
          }

          background-color: red;
        }

        .nps-text {
          margin-top: 10px;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          font-family: Arial-regular;
        }
      }

      .form-detail-item-textarea {
        width: 100%;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
      }
    }

    .submit {
      padding: 20px;
    }
  }
  .result-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 20%;
    .result-page-text {
      margin-top: 10px;
    }
    .error-page {
      color: #acabab;
      font-size: 14px;
    }
  }
</style>
