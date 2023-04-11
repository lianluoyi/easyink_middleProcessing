/*
 * @Description: api接口
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
import httpRequest from '../utils/request';

/**
 * @description 获取openid
 */
export function getOpenId(params) {
  return httpRequest({
    url: '/wechatopen/openId',
    data: params
  });
}

/**
 * @description 获取表单详情
 */
export function getFormDetailApi(params) {
  return httpRequest({
    url: '/wecom/form/getContent',
    data: params
  });
}

/**
 * @description 提交表单
 */
export function submitFormApi(data) {
  return httpRequest({
    url: '/wecom/form/commit',
    method: 'POST',
    data
  });
}

/**
 * @description 通过短链获取长链及长链类型
 */
export function getUrlType(params) {
  return httpRequest({
    url: '/url/' + params,
    method: 'GET'
  });
}

/**
 * @description 获取短链公众号配置
 */
export function getShortLinkAppId(params) {
  return httpRequest({
    url: '/wechatopen/getAppIdByShortCode',
    method: 'GET',
    data: params
  });
}

/**
 * @description 获取长链公众号配置
 */
export function getLongLinkAppId(params) {
  return httpRequest({
    url: '/wechatopen/getAppIdByFormId',
    method: 'GET',
    data: params
  });
}

/**
 * @description 调用接口记录雷达点击记录
 */
export function getRadarClick(params) {
  return httpRequest({
    url: '/wecom/radar/clickRadar',
    method: 'GET',
    data: params
  });
}
