<!--
 * @Author: chenchengjie
 * @LastEditors: chenchengjie
 * @Description: 省、市、区/县、街道/镇选择器组件
-->
<template>
  <u-popup :show="show" mode="bottom">
    <view class="address-picker">
      <!-- 顶部按钮 -->
      <view class="picker-header">
        <text class="cancel-btn" @click="$emit('cancel')">取消</text>
        <text class="header-title">请选择所在地区</text>
        <text class="confirm-btn" @click="confirmSelect">确认</text>
      </view>

      <!-- 自定义步骤条 -->
      <view class="steps-container">
        <view class="steps">
          <view class="step-item" :class="{ active: selectedProvince }">
            <view class="step-dot"></view>
            <view class="step-line" :class="{ active: selectedCity }"></view>
            <view class="step-content">
              <u-cell
                :title="selectedProvince ? selectedProvince.fullname : '请选择省份'"
                isLink
                :border="false"
                :title-style="currentStep === STEPS.PROVINCE ? cellTitleStyle : { fontSize: '14px' }"
                @click="switchStep(STEPS.PROVINCE)"
              ></u-cell>
            </view>
          </view>

          <view class="step-item" v-if="selectedProvince && ![...MUNICIPAL, ...HONGKONG_MACAO].includes(selectedProvince.fullname)" :class="{ active: selectedCity }">
            <view class="step-dot"></view>
            <view class="step-line" :class="{ active: selectedDistrict }"></view>
            <view class="step-content">
              <u-cell
                :title="selectedCity ? selectedCity.fullname : '请选择城市'"
                isLink
                :border="false"
                :title-style="currentStep === STEPS.CITY ? cellTitleStyle : { fontSize: '14px' }"
                @click="switchStep(STEPS.CITY)"
              ></u-cell>
            </view>
          </view>

          <view class="step-item" v-if="selectedCity" :class="{ active: selectedDistrict }">
            <view class="step-dot"></view>
            <view class="step-line" :class="{ active: selectedStreet }"></view>
            <view class="step-content">
              <u-cell
                :title="selectedDistrict ? selectedDistrict.fullname : '请选择区/县'"
                isLink
                :border="false"
                :title-style="currentStep === STEPS.DISTRICT ? cellTitleStyle : { fontSize: '14px' }"
                @click="switchStep(STEPS.DISTRICT)"
              ></u-cell>
            </view>
          </view>

          <view class="step-item" v-if="selectedDistrict && selectedDistrict.id && !SPECIAL_REGION.includes(selectedProvince.fullname)" :class="{ active: selectedStreet }">
            <view class="step-dot"></view>
            <view class="step-content">
              <u-cell
                :title="selectedStreet ? selectedStreet.fullname : '请选择街道/镇'"
                isLink
                :border="false"
                :title-style="currentStep === STEPS.STREET ? cellTitleStyle : { fontSize: '14px' }"
                @click="switchStep(STEPS.STREET)"
              ></u-cell>
            </view>
          </view>
        </view>
        <!-- 清空所选 -->
        <p v-if="selectedProvince" class="clear-btn" @click="clearSelected">清空所选</p>
      </view>
      <text class="list-title">选择{{ LIST_TITLE[currentStep] }}</text>
      <!-- 地区列表 -->
      <scroll-view scroll-y class="area-list">
        <!-- 省份列表 -->
        <template v-if="currentStep === STEPS.PROVINCE">
          <view v-for="(group, index) in sortedProvinces" :key="index">
            <view class="area-item" v-for="(province, idx) in group" :key="idx" @click="selectProvince(province)">
              <text class="letter-index">
                <span v-if="idx === 0">{{ getFirstLetter(province.pinyin) }}</span>
              </text>
              <span class="area-name" :class="{ active: selectedProvince && selectedProvince.id === province.id }"
                >{{ province.fullname
                }}<u-icon name="checkbox-mark" v-if="selectedProvince && selectedProvince.id === province.id" color="#1990ff"></u-icon
              ></span>
            </view>
          </view>
        </template>

        <!-- 城市列表 -->
        <template v-if="currentStep === STEPS.CITY && selectedProvince">
          <view v-for="(group, index) in sortedCities" :key="index">
            <view class="area-item" v-for="(city, idx) in group" :key="idx" @click="selectCity(city)">
              <text class="letter-index">
                <span v-if="idx === 0">{{ getFirstLetter(city.pinyin) }}</span>
              </text>
              <span class="area-name" :class="{ active: selectedCity && selectedCity.id === city.id }"
                >{{ city.fullname }}<u-icon name="checkbox-mark" v-if="selectedCity && selectedCity.id === city.id" color="#1990ff"></u-icon
              ></span>
            </view>
          </view>
        </template>
        <!-- 区县列表 -->
        <template v-if="currentStep === STEPS.DISTRICT && selectedCity">
          <view v-for="(group, index) in sortedDistricts" :key="index">
            <view class="area-item" v-for="(district, idx) in group" :key="idx" @click="selectDistrict(district)">
              <text class="letter-index">
                <span v-if="idx === 0">{{ getFirstLetter(district.pinyin || district.fullname) }}</span>
              </text>
              <span class="area-name" :class="{ active: selectedDistrict && selectedDistrict.id === district.id }"
                >{{ district.fullname
                }}<u-icon name="checkbox-mark" v-if="selectedDistrict && selectedDistrict.id === district.id" color="#1990ff"></u-icon
              ></span>
            </view>
          </view>
        </template>

        <!-- 街道/镇列表 -->
        <template v-if="currentStep === STEPS.STREET && selectedDistrict">
          <u-loading-icon :show="loading"></u-loading-icon>
          <view v-show="!loading" v-for="(group, index) in sortedStreets" :key="index">
            <view class="area-item" v-for="(street, idx) in group" :key="idx" @click="selectStreet(street)">
              <text class="letter-index">
                <span v-if="idx === 0">{{ getFirstLetter(street.pinyin || street.fullname) }}</span>
              </text>
              <span class="area-name" :class="{ active: selectedStreet && selectedStreet.id === street.id }"
                >{{ street.fullname }}<u-icon name="checkbox-mark" v-if="selectedStreet && selectedStreet.id === street.id" color="#1990ff"></u-icon
              ></span>
            </view>
          </view>
        </template>
      </scroll-view>
    </view>
  </u-popup>
</template>

<script>
  import { getSubDistrictList } from '@/api/map';
  import { pinyin } from 'pinyin-pro';
  import { SPECIAL_REGION, MUNICIPAL } from '@/utils/constant';
  // 步骤枚举
  const STEPS = {
    PROVINCE: 0,
    CITY: 1,
    DISTRICT: 2,
    STREET: 3
  };
  // 列表标题
  const LIST_TITLE = {
    [STEPS.PROVINCE]: '省份',
    [STEPS.CITY]: '城市',
    [STEPS.DISTRICT]: '区/县',
    [STEPS.STREET]: '街道/镇'
  };
  const HONGKONG_MACAO = ['香港特别行政区', '澳门特别行政区'];
  export default {
    name: 'AddressPicker',
    props: {
      show: {
        type: Boolean,
        default: false
      },
      value: {
        type: Object,
        default: () => ({})
      },
      districtList: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        currentStep: STEPS.PROVINCE,
        cities: [],
        districts: [],
        streets: [],
        selectedProvince: null,
        selectedCity: null,
        selectedDistrict: null,
        selectedStreet: null,
        cellTitleStyle: {
          color: '#1890ff',
          fontSize: '14px'
        },
        loading: false,
        STEPS,
        LIST_TITLE,
        MUNICIPAL,
        SPECIAL_REGION, // 港澳台
        HONGKONG_MACAO // 港澳
      };
    },
    computed: {
      // 按拼音首字母分组
      sortedProvinces() {
        return this.sortByPinyin(this.districtList);
      },
      sortedCities() {
        return this.sortByPinyin(this.cities);
      },
      sortedDistricts() {
        return this.sortByPinyin(this.districts);
      },
      sortedStreets() {
        return this.sortByPinyin(this.streets);
      }
    },
    watch: {
      show(val) {
        if (val && this.value && this.value.adCode) {
          this.initSelectedAddress();
        }
      }
    },
    methods: {
      confirmSelect() {
        if(!this.selectedProvince){
          this.$emit('confirm');
          this.$emit('cancel');
          return;
        }
        const isOtherDistrict = !this.selectedDistrict.id; // 选择‘其他区’
        if (
          this.selectedProvince &&
          this.selectedCity &&
          this.selectedDistrict &&
          (SPECIAL_REGION.includes(this.selectedProvince.fullname) || isOtherDistrict || this.selectedStreet)
        ) {
          const isChanged =
            this.value.province !== this.selectedProvince.fullname ||
            this.value.city !== this.selectedCity.fullname ||
            this.value.area !== this.selectedDistrict.fullname ||
            this.value.town !== this.selectedStreet.fullname;
          this.$emit('confirm', {
            province: this.selectedProvince,
            city: this.selectedCity,
            district: this.selectedDistrict,
            street: this.selectedStreet
          }, isChanged);
          this.$emit('cancel');
        } else {
          uni.showToast({
            title: '请选择完整的地址',
            icon: 'none'
          });
        }
      },
      clearSelected() {
        this.selectedProvince = null;
        this.selectedCity = null;
        this.selectedDistrict = null;
        this.selectedStreet = null;
        this.currentStep = STEPS.PROVINCE;
      },
      /** 选择省份 */
      selectProvince(province) {
        this.selectedProvince = province;
        // 若选择直辖市/港澳，跳过选择城市，直接选择区/县
        const array = [...MUNICIPAL, ...HONGKONG_MACAO]
        if (array.includes(province.fullname)) {
          this.currentStep = STEPS.DISTRICT;
          this.districts = [...province.districts, { fullname: '其他区' }] || [];
          this.selectedCity = province;
          this.selectedDistrict = null;
          this.selectedStreet = null;
          return;
        }
        this.currentStep = STEPS.CITY;
        this.cities = province.districts || [];
        this.districts = [];
        this.selectedCity = null;
        this.selectedDistrict = null;
      },
      /** 选择城市 */
      selectCity(city) {
        this.selectedCity = city;
        this.currentStep = STEPS.DISTRICT;
        this.districts = [...city.districts, { fullname: '其他区' }] || [];
        this.selectedDistrict = null;
      },
      /** 选择区/县 */
      selectDistrict(district) {
        this.selectedDistrict = district;
        // 没有区id，即选择其他区
        if (!district?.id) {
          return;
        }
        if(SPECIAL_REGION.includes(this.selectedProvince.fullname)){
          this.selectedStreet = null;
          return;
        }
        this.currentStep = STEPS.STREET;
        this.loading = true;
        // 根据选择的区县id获取街道/镇
        getSubDistrictList({ id: district.id, corpId: this.$route.query.corpId }).then((res) => {
          this.streets = [...res.data.result[0], { fullname: '暂不选择' }];
        }).finally(() => {
          this.loading = false;
        });
        this.selectedStreet = null;
      },
      /** 选择街道/镇 */
      selectStreet(street) {
        this.selectedStreet = street;
      },
      switchStep(step) {
        if (step === this.currentStep) return;

        if (step > this.currentStep) {
          if (step === STEPS.CITY && !this.selectedProvince) return;
          if (step === STEPS.DISTRICT && !this.selectedCity) return;
          if (step === STEPS.STREET && !this.selectedDistrict) return;
        }

        this.currentStep = step;
      },
      sortByPinyin(items) {
        if (!items || !items.length) return [];

        // 按拼音首字母分组
        const groups = {};
        items.forEach((item) => {
          const firstLetter = this.getFirstLetter(item.pinyin || item.fullname);
          if (!groups[firstLetter]) {
            groups[firstLetter] = [];
          }
          groups[firstLetter].push(item);
        });

        // 将分组转换为数组并排序
        return Object.keys(groups)
          .sort()
          .map((letter) => groups[letter]);
      },
      getFirstLetter(text) {
        if (!text) return '';
        // 如果已经有pinyin字段，直接使用
        if (typeof text === 'object') {
          return text[0][0].toUpperCase();
        }
        // 如果没有pinyin字段，使用pinyin-pro转换
        return pinyin(text, { pattern: 'first', toneType: 'none' })[0].toUpperCase();
      },
      async initSelectedAddress() {
        let step = STEPS.PROVINCE;
        // 查找选中的省份
        const province = this.districtList.find((p) => p.fullname === this.value.province);
        if (province) {
          this.selectedProvince = province;
          this.cities = province.districts || [];

          // 查找选中的城市，若为直辖市，则等同于省
          const city = [...MUNICIPAL, ...HONGKONG_MACAO].includes(province.fullname) ? province : this.cities.find((c) => c.fullname === this.value.city);
          if (city) {
            this.selectedCity = city;
            this.districts = [...city.districts, { fullname: '其他区' }] || [];
            step = STEPS.DISTRICT;
            // 查找选中的区县
            const district = this.districts.find((d) => d.fullname === this.value.area);
            if (district) {
              this.selectedDistrict = district;
              // 选择其他区或港澳台，则不需要获取第四级
              if (!district.id || SPECIAL_REGION.includes(this.selectedProvince.fullname)) {
                this.currentStep = step;
                return;
              }
              step = STEPS.STREET;
              // 根据选择的区县id获取街道/镇
              getSubDistrictList({ id: district.id, corpId: this.$route.query.corpId }).then((res) => {
                this.streets = [...res.data.result[0], { fullname: '暂不选择' }];
                // 查找选中的街道
                const street = this.streets.find((s) => s.fullname === this.value.town);
                if (street) {
                  this.selectedStreet = street;
                  step = STEPS.STREET;
                }
              });
            }
          }
        }
        this.currentStep = step;
      }
    }
  };
</script>

<style lang="scss" scoped>
  .address-picker {
    background-color: #fff;
    border-radius: 10px 10px 0 0;
    height: 560px;
    display: flex;
    flex-direction: column;
    .picker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 15px;
      font-size: 16px;
      background: #f7f7f9;
      flex-shrink: 0;
      .cancel-btn {
        color: #8f8f91;
        padding: 5px 10px;
        cursor: pointer;
      }

      .confirm-btn {
        color: #1990ff;
        padding: 5px 10px;
        cursor: pointer;
      }
    }

    .steps-container {
      padding: 10px 15px;
      border-bottom: 1px solid #eee;
      flex-shrink: 0;
      .steps {
        display: flex;
        flex-direction: column;

        .step-item {
          position: relative;
          display: flex;
          align-items: center;
          padding: 0 0 15px 0;
          &:last-child {
            padding-bottom: 0;
            .step-line {
              display: none;
            }
          }

          &.active {
            .step-dot {
              background-color: #1990ff;
              border-color: #1990ff;
            }
            .step-line {
              background-color: #969799;
              &.active {
                background-color: #1990ff;
              }
            }
          }

          .step-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            border: 2px solid #969799;
            background-color: #969799;
            margin-right: 10px;
            z-index: 1;
          }

          .step-line {
            position: absolute;
            left: 5px;
            top: 26px;
            width: 1px;
            height: calc(100% - 22px);
            background-color: #d9d9d9;
          }

          .step-content {
            font-size: 12px;
            color: #333;
            width: 100%;
            cursor: pointer;
            .u-cell {
              width: 100%;
              ::v-deep .u-cell__body {
                padding: 0;
                .u-cell__title-text {
                  line-height: 32px;
                }
              }
            }
          }
        }
      }
      .clear-btn {
        font-size: 14px;
        margin-top: 2px;
        color: #1990ff;
        text-align: right;
        cursor: pointer;
      }
    }
    .list-title {
      font-size: 14px;
      font-weight: 600;
      padding: 10px 10px 0 10px;
      display: block;
    }
    .area-list {
      height: calc(100% - 115px);
      padding: 10px;
      box-sizing: border-box;
      overflow: hidden;
      .area-item {
        display: flex;
        align-items: center;
        padding: 8px 0;
        font-size: 14px;
        cursor: pointer;
        .letter-index {
          width: 20px;
          margin-right: 10px;
          font-size: 14px;
        }
        .area-name {
          width: 100%;
          display: flex;
          justify-content: space-between;
          &.active {
            color: #1990ff;
          }
        }
      }
    }
  }
</style>
