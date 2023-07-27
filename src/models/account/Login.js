import { routerRedux } from 'dva/router';
import { getPageQuery } from '@/utils/utils';
import { cacheLogin, clearLogin, loginKey } from '@/utils/LoginContext';
import { setCookie } from '@/utils/Cookies';
import { stringify } from 'qs';
import {
  accountLogin,
  phoneLogin,
  forgetPassword,
  modifyPassword,
  modifyNewPassword,
  switchOrg,
  resetPassword,
} from '@/services/account/Login';
import { reloadAuthorized } from '@/utils/Authorized';
import { SingletonBloomFilter } from '@/utils/authority';
import { getPrintRpl, getPrintLabel, getPrintElectronic, setPrintRpl, setPrintLabel, setPrintElectronic } from '@/utils/PrintTemplateStorage';
export default {
  namespace: 'login',
  state: {
    status: undefined,
  },
  effects: {
    *accountLogin({ payload, callback }, { call, put }) {
      yield put({ type: 'changeSubmitting', payload: true, });
      const response = yield call(accountLogin, payload);
      if (response && response.success) {
        cacheLogin(response.data);
        reloadAuthorized();
        sessionStorage.clear();
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params;
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = redirect;
            yield put({
              type: 'changeSubmitting',
              payload: false,
            });
            return;
          }
        }
        const passwordUsable = payload.loginAccount != payload.password
          && payload.loginAccount.indexOf(payload.password) == -1;
        setCookie("passwordUsable", passwordUsable ? 1 : 0, 1);
        yield put(routerRedux.replace('/'));
      } else {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: 'error',
            message: response.message,
          },
        });
      }
      yield put({
        type: 'changeSubmitting',
        payload: false,
      });
      if (callback) callback(response);
    },
    *phoneLogin({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      const response = yield call(phoneLogin, payload);
      if (response && response.success) {
        cacheLogin(response.data);
        sessionStorage.clear();
        reloadAuthorized();
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params;
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = redirect;
            yield put({
              type: 'changeSubmitting',
              payload: false,
            });
            return;
          }
        }
        yield put(routerRedux.replace(redirect || '/'));
      } else {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: 'error',
            message: response.message,
          },
        });
      }
      yield put({
        type: 'changeSubmitting',
        payload: false,
      });
    },

    *logout(_, { put }) {
      yield put({
        type: 'changeLoginStatus',
        payload: {
          status: false,
          currentAuthority: 'guest',
        },
      });
      //登录信息失效后打印机设置不能被清空
      let printRpl = getPrintRpl();
      let printLabel = getPrintLabel();
      let printElectronic = getPrintElectronic();
      clearLogin();
      SingletonBloomFilter.destory();
      reloadAuthorized();
      setPrintRpl(printRpl);
      setPrintLabel(printLabel);
      setPrintElectronic(printElectronic);
      yield put(
        routerRedux.push({
          pathname: '/user/login',
        })
      );
    },

    *check({ payload }, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      if (!loginKey()) {
        yield put(
          routerRedux.push({
            pathname: '/user/login',
            search: stringify({
              redirect: window.location.href,
            }),
          })
        );
      }
      yield put({
        type: 'changeSubmitting',
        payload: false,
      });
    },

    *modifyPassword({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      const response = yield call(modifyPassword, payload);
      yield put({
        type: 'changeSubmitting',
        payload: false,
      });
      if (callback) { callback(response); }
    },
    *modifyNewPassword({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      const response = yield call(modifyNewPassword, payload);
      yield put({
        type: 'changeSubmitting',
        payload: false,
      });
      if (callback) { callback(response); }
    },

    *switchOrg({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      const response = yield call(switchOrg, payload);
      yield put({
        type: 'changeSubmitting',
        payload: false,
      });
      // sessionStorage.clear();
      if (response && response.success) {
        // cacheLogin(response.data);
        SingletonBloomFilter.destory();
        cacheLogin(response.data);
        sessionStorage.clear();
        reloadAuthorized();
        yield put(routerRedux.push('/'));
      }
      if (callback) { callback(response); }
    },

    *forgetPassword({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      const response = yield call(forgetPassword, payload);
      yield put({
        type: 'changeSubmitting',
        payload: false,
      });
      if (callback) { callback(response); }
    },

    *resetPassword({ payload, callback }, { call, put }) {
      const response = yield call(resetPassword, payload);
      if (callback) { callback(response); }
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      return {
        ...state,
        result: payload.result,
        message: payload.message,
        status: payload.status,
      };
    },
    changeSubmitting(state, { payload }) {
      return {
        ...state,
        submitting: payload,
      };
    },
  },
};
