/*
 * @Description: 专属活码接口
 * @Author: chenchengjie
 * @LastEditors: chenchengjie
 */
import httpRequest from '../utils/request';

/**
 * @description 查询原活码信息
 */
export function getOriginEmpleInfo({ employCodeId, corpId }) {
  return httpRequest({
    url: `/h5/getOriginEmpleInfo/${employCodeId}/${corpId}`,
    method: 'get'
  });
}
/**
 * @description 获取所有标签
 */
export function getTagList({ corpId, originEmpleId }) {
  return httpRequest({
    url: `/h5/customer/tag/list/${corpId}/${originEmpleId}`,
    method: 'get'
  });
}
/**
 * @description 获取所有扩展属性
 */
export function getExtendProperty({ corpId }) {
  return httpRequest({
    url: `/h5/extendProperty/list/${corpId}`,
    method: 'get'
  });
}
/**
 * @description 生成专属活码
 */
export function genCustomerEmployQrCode(data) {
  return httpRequest({
    url: `/wecom/code/genCustomerEmployQrCode`,
    method: 'post',
    data
  });
}
/**
 * @description 获取专属活码配置的过期时间
 */
export function getExpireTime() {
  return httpRequest({
    url: `/wecom/code/customerEmployQrCodeExpireTime`,
    method: 'get'
  });
}

/**
 * 获取专属活码标签必填校验配置
 */
export function getTagGroupValid({ corpId, empleCodeId }) {
  return httpRequest({
    url: `/h5/tagGroupValid/${empleCodeId}/${corpId}`,
    method: 'get'
  });
}