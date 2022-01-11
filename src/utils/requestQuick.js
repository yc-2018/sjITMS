import { Toast } from 'antd-mobile';
import axios from 'axios';
import { push } from 'react-router-redux';
import qs from 'qs';
 
// 请求路径
const BaseUrl = 'http://172.29.10.176:8001'; // 主机及端口
 
//axios默认配置请求的api基础地址
axios.defaults.baseURL = BaseUrl;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'; // post 内容类型
// axios.defaults.headers.get['Content-Type'] = 'application/json;charset=utf-8'; // get 内容类型
// axios.defaults.headers.post['Content-Type'] = 'multipart/form-data'; // post 内容类型 formData 类型
axios.defaults.timeout = 30000; // 超时设置,超时进入错误回调，进行相关操作
axios.defaults.withCredentials = false; // 是否支持跨域cookie
 
const codeMessage = {
  200: '服务器成功返回请求的数据',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据,的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器',
  502: '网关错误',
  503: '服务不可用，服务器暂时过载或维护',
  504: '网关超时',
};
 
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const errortext = codeMessage[response.status] || response.statusText;
  // 提示框
  Toast.info(`请求错误 ${response.status}: ${response.url}`,1)
  const error = new Error(errortext);
  error.name = response.status;
  error.response = response;
  throw error;
}
 
 
/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  const defaultOptions = {
    credentials: 'include',
  };
  const newOptions = { ...defaultOptions, ...options };
  if (
    newOptions.method === 'POST' ||
    newOptions.method === 'PUT' ||
    newOptions.method === 'DELETE'
  ) {
    if (!(newOptions.body instanceof FormData)) {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        ...newOptions.headers,
      };
      newOptions.data = qs.stringify(newOptions.body);
      newOptions.body = JSON.stringify(newOptions.body);
    } else {
      // newOptions.body is FormData
      newOptions.headers = {
        Accept: 'application/json',
        ...newOptions.headers,
      };
    }
  }
 
  return axios(url, newOptions)
    .then(checkStatus)
    .then((response) => {
      // 成功的回调
      if (newOptions.method === 'DELETE' || response.status === 204) {
        return response.text();
      }
      return response.data;
    })
    .catch((e) => {
      // 失败的回调
      if(!navigator.onLine){
        message.error('当前网络不可用')
        controller.abort();
        return {
          'error':'no network'
        };
      }
      if(e =='timeout'){
        message.error('请求超时')
        controller.abort();
        return {
          'error':'timeout'
        };
      }else{
        const status = e.name;
        if (status === 401) {
          window.g_app._store.dispatch({
            type: 'login/logout',
          });
          message.error("登录信息失效，请重新登录！");
          return e.response.json();
        }
        const res = e.response.json();
        res.then(result => {
            if (!localStorage.getItem("showMessage") || localStorage.getItem("showMessage") === '1') {
              message.error(result.message);
            }
        });
        return res;
      }
    });
}