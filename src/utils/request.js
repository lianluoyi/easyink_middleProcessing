/*
 * @Description: 请求封装
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
const BASE_URL = '/api';
const HTTP_CODE_SUCCESS = 200;
const httpRequest = (options) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      dataType: options.dataType || 'json',
      method: options.method || 'GET', // 请求类型，默认为GET
      data: options.data || {}, // 请求参数，默认空对象
      success: (res) => {
        if (res.data.code !== HTTP_CODE_SUCCESS && !res.data.data) {
          uni.showToast({
            title: res.data.data || res.data.msg,
            icon: 'none'
          });
          reject();
        } else {
          resolve(res.data);
        }
      },
      fail: (err) => {
        reject(err);
        uni.showToast({
          title: err,
          icon: 'none'
        });
      }
    });
  });
};
export default httpRequest;
