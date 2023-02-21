/*
 * @Description: 公共函数
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
export const getQueryParam = (url, key) => {
    url = url || window.location.href;
    var match = url.match(new RegExp('[?&]' + key + '=([^&]*)'));
    return match && match[1] && decodeURIComponent(match[1]) || '';
}