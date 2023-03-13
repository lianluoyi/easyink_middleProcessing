/*
 * @Description: api接口
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
import httpRequest from '../utils/request';

/**
 * @description 获取公众号appid
 */
export function getAppIdAndCorpId(params) {
  return httpRequest({
    url: '/wechatopen/appId',
    data: params
  });
}

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
 * @description 获取长链接
 */
export function getTruthUrl(params) {
  return httpRequest({
    url: '/url/radar',
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
