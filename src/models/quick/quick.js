import { queryData, queryColumns, queryAllData, queryCreateConfig } from '@/services/quick/Quick';
import { colWidth } from '@/utils/ColWidth';

export default {
  namespace: 'quick',

  subscriptions: {
    /**
     * 监听浏览器地址
     * @param dispatch 触发器，用于触发 effects 中的 query 方法
     * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
     */
    setup({ dispatch, history }) {
      history.listen(location => {
        if (location.payload && location.pathname == '/quick') {
          dispatch({
            type: 'showPage',
            payload: location.payload,
          });
        }
      });
    },
  },

  state: {
    data: {
      pagination: {},
    },
    showPage: 'query',
    entity: {},
  },
  effects: {
    *queryColumns({ payload, callback }, { call }) {
      const response = yield call(queryColumns, payload);
      if (callback) callback(response);
    },
    *queryData({ payload, callback }, { call }) {
      const response = yield call(queryData, payload);
      if (callback) callback(response);
    },
    *queryAllData({ payload, callback }, { call, put }) {
      const response = yield call(queryAllData, payload);
      if (response && response.success) {
        var data = {
          list: response.data.records,
        };
        var map = new Map();
        map.set(payload.quickuuid + 'data', data);
        yield put({
          type: 'save',
          payload: {
            quickuuid: payload.quickuuid,
            map,
          },
        });
      }
      if (callback) callback(response);
    },
    *queryCreateConfig({ payload, callback }, { call, put }) {
      const response = yield call(queryCreateConfig, payload);
      if (response && response.success) {
        let onlFormFields = [];
        var onlFormHead = response.result.onlFormHead;
        onlFormFields = response.result.onlFormFields;
        var map = new Map();
        map.set(payload + 'onlFormHead', onlFormHead);
        map.set(payload + 'onlFormFields', onlFormFields);
        yield put({
          type: 'save',
          payload: {
            map,
          },
        });
      }
      if (callback) callback(response);
    },
    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid,
        fromView: payload.fromView,
      });
    },
  },
  reducers: {
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
        importTemplateUrl: action.importTemplateUrl,
        importType: action.importType,
        fromView: action.fromView,
      };
    },
    onView(state, action) {
      return {
        ...state,
        entity: action.entity,
      };
    },
  },
};
