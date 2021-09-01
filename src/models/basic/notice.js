import { checkLogin, loginUser } from '@/utils/LoginContext';
import {
  saveNotice, saveReplition, getNotice, getUnReadedNotice, query, readNotice,
  clearNotice, getUnReadedReplition, clearReplition, queryOrg
} from '@/services/basic/Notice';

export default {
  namespace: 'notice',

  state: {
    data: {
      list: [],
      pagination: {}
    },
    showPage: 'query',
  },

  effects: {
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: {
            list: response.data.records ? response.data.records : [],
            pagination: {
              total: response.data.paging.recordCount,
              pageSize: response.data.paging.pageSize,
              current: response.data.page + 1,
              showTotal: total => `共 ${total} 条`,
            },
          },
        });
      }
    },
    *onShowPage({ payload }, { call, put }) {
      yield put({
        type: 'showPage',
        showPage: payload.showPage,
      });
    },
    *onShowPageIcon({payload,callback},{call,put}){
      yield put({
      type: 'showPageforIcon',
        showPage: payload.showPage,
        currentNoticeUuid:payload.currentNoticeUuid
      });
    },
    *saveNotice({ payload, callback }, { call, put }) {
      const response = yield call(saveNotice, payload);
      if (callback) callback(response);
      if (response && response.success) {
        yield put({
          type: 'showPage',
          showPage: 'query',
        });
      }
    },

    *saveReplition({ payload, callback }, { call, put }) {
      const response = yield call(saveReplition, payload);
      if (response && response.success) {
        yield put({
          type: 'getNotice',
          payload: {
            uuid: payload.noticeUuid
          }
        });
      }
    },

    *getNotice({ payload, callback }, { call, put }) {
      const response = yield call(getNotice, payload);
      if (response && response.success) {
        yield put({
          type: 'showNotice',
          currentNotice: response.data
        });
      }
      if (callback) callback(response);
    },
    *readNotice({ payload, callback }, { call, put }) {
      yield call(readNotice, payload);
    },
    *clearNotice({ payload, callback }, { call, put }) {
      yield call(clearNotice, payload);
      if (callback) callback();
    },
    *clearReplition({ payload, callback }, { call, put }) {
      yield call(clearReplition, payload);
      if (callback) callback();
    },
    *queryOrg({ payload, callback }, { call, put }) {
      const response = yield call(queryOrg, payload);
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

    showNotice(state, action) {
      return {
        ...state,
        currentNotice: action.currentNotice,
        currentNoticeUuid:''
      };
    },

    showPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
      };
    },
    showPageforIcon(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        currentNoticeUuid:action.currentNoticeUuid,
      };
    },
  },
};
