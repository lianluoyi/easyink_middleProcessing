<!--
 * @Author: chenchengjie
 * @LastEditors: chenchengjie
 * @Description: 位置单元格组件
-->
<template>
  <view class="picker-box">
    <u-cell class="cell-box" :border="false" :isLink="allowManual" @click="handleCellClick">
      <view slot="title">
        <p v-if="!displayText" class="cell-text-placeholder">{{ placeholder }}</p>
        <p v-else class="cell-text intwoline">{{ displayText }}</p>
      </view>
    </u-cell>
    <view class="address-box" @click="handleMapClick">
      <u-icon name="map" color="#1890FF"></u-icon>
      <text>位置</text>
    </view>
    <u-toast ref="uToast"></u-toast>
    <addressPicker :show="showPicker" :value="value" :districtList="districtList" @cancel="() => (showPicker = false)" @confirm="handleConfirm" />
    <mapPicker v-if="showMap" :show="showMap" :api-key="apiKey" @close="() => (showMap = false)" @cancel="() => (showMap = false)" @confirm="handleConfirm" />
    <u-loading-page :loading="loading" bg-color="#00000060" loadingText="" loadingMode="spinner" style="z-index: 9999"></u-loading-page>
  </view>
</template>
<script>
  import addressPicker from './components/addressPicker.vue';
  import mapPicker from './components/mapPicker.vue';
  import { getRegeocode, getGeocoder } from '@/api/map';
  
  const KEY_WRONG_CODE = 3101 // 地图apikey错误
  export default {
    components: {
      addressPicker,
      mapPicker
    },
    props: {
      value: {
        type: Object,
        default: () => ({})
      },
      placeholder: {
        type: String,
        default: '请选择'
      },
      districtList: {
        type: Array,
        default: () => []
      },
      allowManual: {
        type: Boolean,
        default: false
      },
      apiKey: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        showPicker: false,
        showMap: false,
        loading: false
      };
    },
    computed: {
      displayText() {
        if (!this.value) return '';
        if (typeof this.value === 'string') return this.value;
        let text = '';
        // 对省市区街道去重，避免直辖市重复显示
        const data = [...new Set([this.value.province, this.value.city, this.value.area, this.value.town])];
        data
          .filter(item => item !== '暂不选择')
          .filter(Boolean)
          .forEach(item => {
            text += `${item}-`;
          });
        return text.slice(0, -1);
      }
    },
    methods: {
      async handleMapClick() {
        if(!this.apiKey) {
          this.$refs.uToast.show({
            type: 'default',
            message: '请联系运维人员配置地图api'
          });
          return;
        }
        // 调用getGeocoder接口检查地图apikey是否正确
        const res = await getGeocoder({
          corpId: this.$route.query.corpId,
          address: '福建省厦门市',
        });
        if(res.code === KEY_WRONG_CODE ) return;
        if(!res.data) {
          this.$refs.uToast.show({
            type: 'default',
            message: '请联系运维人员配置地图api'
          });
          return;
        }
        // 不允许手动，点击则自动填入地址(获取当前坐标,逆地址解析出地址)
        if (!this.allowManual) {
          this.loading = true;
          const geolocation = new qq.maps.Geolocation(this.apiKey, 'myapp');
          geolocation.getLocation(
            (position) => {
              getRegeocode({
                location: `${position.lat},${position.lng}`,
                corpId: this.$route.query.corpId
              }).then((res) => {
                const { address_component, address_reference, formatted_addresses } = res.data.result;
                const payload = {
                  street: {
                    id: address_reference.town.id,
                    fullname: address_reference.town.title,
                    location: { lat: position.lat, lng: position.lng }
                  },
                  province: {
                    fullname: address_component.province
                  },
                  city: {
                    fullname: address_component.city
                  },
                  district: {
                    fullname: address_component.district
                  },
                  detailAddress: formatted_addresses.recommend
                };
                this.handleConfirm(payload);
                this.loading = false;
              });
            },
            () => {
              this.loading = false;
            },
            {
              timeout: 8000
            }
          );
          return;
        }
        this.showMap = true;
      },
      handleCellClick() {
        if(!this.allowManual) {
          this.$refs.uToast.show({
            type: 'default',
            message: '当前字段不允许手动修改'
          });
          return
        }
        this.showPicker = true
      },
      /**
       * 确认选择地址
       * @param {Object} e 地址信息
       * @param {boolean} isChanged 是否变更省市区，若变更则清空详细地址
       */
      handleConfirm(e, isChanged = false) {
        this.showPicker = false;
        if(!e){
          this.$emit('input', null);
          return;
        }
        // adCode和location从第四级区划开始取，若没有值（选择‘其他区’）则逐级往上取值
        const payload = {
          ...this.value,
          adCode: e.street?.id || e.district?.id || e.city?.id || e.province?.id,
          province: e.province.fullname,
          city: e.city.fullname,
          area: e.district.fullname,
          town: e.street?.fullname || '',
          location: e.street?.location || e.district?.location || e.city?.location || e.provice?.location,
          detailAddress: isChanged? '' : e?.detailAddress || this.value?.detailAddress
        };
        this.$emit('input', payload);
      }
    }
  };
</script>
<style lang="scss" scoped>
  .picker-box {
    display: flex;
    align-items: center;
    width: 100%;
    .cell-box {
      width: calc(100% - 58px);
      .cell-text {
        font-size: 12px;
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
  .address-box {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1890ff;
    border-left: 1px solid #bbbbbb;
    font-size: 12px;
    height: 24px;
    padding-left: 5px;
    margin-left: 5px;
    cursor: pointer;
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
