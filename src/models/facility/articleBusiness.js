import {
  save,
  modify,
  getByDcUuidAndArticleUuid,
} from '@/services/facility/ArticleBusiness';

export default {
  namespace: 'articleBusiness',

  state: {
  },

  effects: {
    *add({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },

    *modify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (callback) callback(response);
    },

    *getByDcUuidAndArticleUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByDcUuidAndArticleUuid, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
  }
}