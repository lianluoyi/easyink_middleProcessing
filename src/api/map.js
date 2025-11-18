/*
 * @Description: 地图接口
 * @Author: chenchengjie
 * @LastEditors: chenchengjie
 */
import httpRequest from '../utils/request';

/**
 * @description 获取省市区列表
 */
export function getDistrictList(data) {
  return httpRequest({
    url: '/wecom/map/req/district/list',
    method: 'get',
    data
  });
}
/**
 * @description 获取下级行政区划
 */
export function getSubDistrictList(data) {
  return httpRequest({
    url: '/wecom/map/req/district/children',
    method: 'get',
    data
  });
}
/**
 * @description 坐标转地址
 */
export function getGeocoder(data) {
  return httpRequest({
    url: '/wecom/map/req/geocoder',
    method: 'get',
    data
  });
}
/**
 * @description 逆地址解析（坐标转地址）
 */
export function getRegeocode(data) {
  return httpRequest({
    url: '/wecom/map/req/regeocode',
    method: 'get',
    data
  });
}
/**
 * @description 关键词输入提示
 */
export function getAddressByKeyword(data) {
  return httpRequest({
    url: '/wecom/map/req/suggestion',
    method: 'get',
    data
  });
}
/**
 * @description 获取企业api配置
 */
export function getMapKeyConfig(data) {
  return httpRequest({
    url: '/wecom/map/req/getConfig',
    method: 'get',
    data
  });
}
