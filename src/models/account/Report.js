import {
  getUrl, getReportMenu, queryMenu, add, update, get, remove,changeOrder
} from '@/services/account/Report';

export default {
  namespace: 'report',

  state: {
    entity: {}
  },

  effects: {
    *getUrl({ payload, callback }, { call, put }) {
      const response = yield call(getUrl, payload);
      if (response && response.success) {
        yield put({
          type: 'saveReportUrl',
          payload: {
            reportUrl:response.data,
            reportUuid:payload
          }
        });
      }
    },
    *getReportMenu({ callback }, { call, put }) {
      const response = yield call(getReportMenu);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: response.data ? response.data : []
        });
      }
    },
    *queryMenu({ callback }, { call, put }) {
      const response = yield call(queryMenu);
      if(response&&response.success){
        yield put({
          type:'saveMenu',
          payload:response.data
        })
      }
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(add, payload);
      if (callback) callback(response);
    },
    *update({ payload, callback }, { call, put }) {
      const response = yield call(update, payload);
      if (callback) callback(response);
    },
    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'show',
          entity: response.data ? response.data : null
        });
      }
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(remove, payload);
      if (callback) callback(response);
    },
    *changeOrder({ payload, callback }, { call, put }) {
      const response = yield call(changeOrder, payload);
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
    saveMenu(state,action){
      return {
        ...state,
        menuList:action.payload
      }
    },
    saveReportUrl(state, action) {
      return {
        ...state,
        reportUrl: action.payload.reportUrl,
        reportUuid:action.payload.reportUuid
      };
    },
    show(state, action) {
      return {
        ...state,
        entity: action.entity
      };
    },
  },
}