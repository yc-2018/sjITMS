import { routerRedux } from 'dva/router';
import { getPageQuery } from '@/utils/utils';
import { checkLogin, loginUser } from '@/utils/LoginContext';
import { getUnReadedNotice, getUnReadedReplition } from '@/services/basic/Notice';

export default {
  namespace: 'unRead',

  state: {
    notices: [],
    replitions: []
  },

  effects: {
    *getUnReadedNotice({ payload, callback }, { call, put }) {
      const response = yield call(getUnReadedNotice, payload);
      if (response && response.success) {
        yield put({
          type: 'unReadNotice',
          notices: response.data
        });
      }
    },

    *getUnReadedReplition({ payload, callback }, { call, put }) {
      const response = yield call(getUnReadedReplition, payload);
      if (response && response.success) {
        yield put({
          type: 'unReadReplition',
          replitions: response.data
        });
      }
    },
  },

  reducers: {
    unReadNotice(state, action) {
      return {
        ...state,
        notices: action.notices
      }
    },
    unReadReplition(state, action) {
      return {
        ...state,
        replitions: action.replitions,
      }
    },
  },
};