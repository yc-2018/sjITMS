import {
  save,
  modify,
  getByArticleUuid,
} from '@/services/facility/ArticlePlate';

export default {
  namespace: 'articlePlate',

  state: {
  },

  effects: {
    *save({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },

    *modify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (callback) callback(response);
    },

    *getByArticleUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByArticleUuid, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
  }
}