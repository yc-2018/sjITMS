import {
  getCaptcha,
  verifyCaptcha
} from '@/services/common/Captcha';

export default {
  namespace: 'captcha',

  state: {
  },

  effects: {
    *getCaptcha({ payload, callback }, { call, put }) {
      const response = yield call(getCaptcha, payload);
      if (callback) callback(response);
    },
    *verifyCaptcha({ payload, callback }, { call, put }) {
      // const response = yield call(verifyCaptcha, payload);
      const response = {success:true};
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