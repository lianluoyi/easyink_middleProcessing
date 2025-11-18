<!--
 * @Author: chenchengjie
 * @LastEditors: chenchengjie
 * @Description: 地图选取位置组件
-->
<template>
  <u-popup :show="show" mode="bottom">
    <view class="popup-container" :style="{ height: isWxWork ? '96dvh' : '100dvh' }">
      <!-- 顶部按钮 -->
      <view class="picker-header">
        <text class="cancel-btn" @click="closePopup">取消</text>
        <text class="header-title">请选择所在地区</text>
        <text class="confirm-btn" @click="confirmSelect">确认</text>
      </view>
      <iframe
        id="mapPage"
        width="100%"
        height="100%"
        frameborder="0"
        allow="geolocation"
        :src="`https://apis.map.qq.com/tools/locpicker?search=1&type=1&key=${apiKey}&referer=myapp${
          selectedLocation ? '&coord=' + centerCoord : ''
        }`"
      ></iframe>
      <u-loading-page v-if="loading" mode="circle" color="#1990ff" :show-text="false"></u-loading-page>
      <u-toast ref="uToast"></u-toast>
    </view>
  </u-popup>
</template>
<script>
  import { getRegeocode } from '@/api/map';
  import { SPECIAL_REGION } from '@/utils/constant';
  export default {
    name: 'MapPicker',
    props: {
      show: {
        type: Boolean,
        default: false
      },
      value: {
        type: Object,
        default: () => ({})
      },
      apiKey: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        selectedLocation: null,
        loading: false,
        centerCoord: null
      };
    },
    created() {
      this.getLocation();
    },
    computed: {
      isWxWork() {
        const isWxWork = /wxwork/i.test(navigator.userAgent); // 企微内置浏览器标识
        return isWxWork;
      }
    },
    mounted() {
      window.addEventListener(
        'message',
        (event) => {
          // 接收位置信息，用户选择确认位置点后选点组件会触发该事件，回传用户的位置信息
          var loc = event.data;
          if (loc && loc.module == 'locationPicker') {
            //防止其他应用也会向该页面post信息，需判断module是否为'locationPicker'
            this.selectedLocation = loc;
          }
        },
        false
      );
    },
    methods: {
      getLocation() {
        this.loading = true;
        const geolocation = new qq.maps.Geolocation(this.apiKey, 'myapp');
        geolocation.getLocation(
          (position) => {
            // 将获取到的位置设置为选中位置
            this.selectedLocation = {
              module: 'locationPicker',
              latlng: {
                lat: position.lat,
                lng: position.lng
              }
            };
            this.centerCoord = `${position.lat},${position.lng}`;
          },
          () => {
            this.loading = false;
          },
          {
            timeout: 8000
          }
        );
      },
      closePopup() {
        this.$emit('close');
      },
      confirmSelect() {
        if(!this.selectedLocation.poiname){
          this.$refs.uToast.show({
            type: 'default',
            message: '请选择地址'
          });
          return;
        }
        const { lat, lng } = this.selectedLocation.latlng;
        getRegeocode({
          location: `${lat},${lng}`,
          corpId: this.$route.query.corpId
        }).then((res) => {
          const { address_component, address_reference, ad_info } = res.data.result;
          // 港澳台不需要设置街道/镇
          const street = SPECIAL_REGION.includes(address_component.province) ? null : {
              id: address_reference.town.id,
              fullname: address_reference.town.title,
              location: { lat, lng }
          }
          const payload = {
            street,
            province: {
              fullname: address_component.province
            },
            city: {
              fullname: address_component.city
            },
            district: {
              id: ad_info.adcode,
              fullname: address_component.district,
              location: { lat, lng }
            },
            detailAddress: this.selectedLocation.poiname
          };
          this.$emit('confirm', payload);
          this.$emit('close');
        });
      }
    }
  };
</script>
<style lang="scss" scoped>
  .popup-container {
    background-color: #fff;
    border-radius: 10px 10px 0 0;
    height: 100dvh;
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
      }

      .confirm-btn {
        color: #1990ff;
        padding: 5px 10px;
      }
    }
  }
</style>
