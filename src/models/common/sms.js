import {
  sendLoginCaptcha,
  sendForgetPwdCaptcha,
} from '@/services/common/Sms';

export default {
  namespace: 'sms',

  state: {
  },

  effects: {
    *sendLoginCaptcha({ payload, callback }, { call, put }) {
      const response = yield call(sendLoginCaptcha, payload);
      if (callback) callback(response);
    },
    *sendForgetPwdCaptcha({ payload, callback }, { call, put }) {
      const response = yield call(sendForgetPwdCaptcha, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
}