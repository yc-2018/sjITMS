import {
  queryData,
  queryColumns,
  queryAllData,
  queryCreateConfig,
  saveFormData,
  dynamicDelete,
  dynamicqueryById,
  selectCoulumns,
  getSelectField,
  dyDelete,
} from '@/services/quick/Quick';
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
        if (location.payload && location.pathname == '/test/test_form') {
          dispatch({ type: 'showPageMap', payload: location.payload });
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
    showPageMap: new Map(),
  },
  effects: {
    *queryColumns({ payload,headers, callback }, { call }) {
      const response = yield call(queryColumns, payload,headers);
      if (callback) callback(response);
    },
    *queryData({ payload,headers,callback }, { call }) {
      const response = yield call(queryData,payload,headers);
      if (callback) callback(response);
    },
    *queryAllData({ payload, callback }, { call,headers, put }) {
      const response = yield call(queryAllData, payload,headers);
      if (callback) callback(response);
    },
    *queryCreateConfig({ payload,headers, callback }, { call, put }) {
      const response = yield call(queryCreateConfig, payload,headers);
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
    *saveFormData({ payload, callback }, { call, put }) {
      const response = yield call(saveFormData, payload.param);
      if (callback) callback(response);
    },
    *dynamicDelete({ payload, callback }, { call, put }) {
      const response = yield call(dynamicDelete, payload);
      if (callback) callback(response);
    },
    *dyDelete({ payload, callback }, { call, put }) {
      const response = yield call(dyDelete, payload);
      if (callback) callback(response);
    },
    *showPageMap({ payload }, { call, put }) {
      var showPageMap = new Map();
      showPageMap.set(payload.showPageK, payload.showPageV);
      yield put({
        type: 'onShowPageMap',
        showPageMap: showPageMap,
        entityUuid: payload.entityUuid,
      });
    },
    *dynamicqueryById({ payload, callback }, { call }) {
      const response = yield call(dynamicqueryById, payload);
      if (callback) callback(response);
    },
    *selectCoulumns({ payload, callback }, { call, put }) {
      const response = yield call(selectCoulumns, payload);
      if (callback) callback(response);
    },
    *selectField({ payload, callback }, { call, put }) {
      const response = yield call(getSelectField, payload);
      if (callback) callback(response);
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
    onShowPageMap(state, action) {
      let mapGra = state.showPageMap;
      for (var [k, v] of action.showPageMap) {
        mapGra.set(k, v);
      }
      return {
        ...state,
        showPageMap: mapGra,
        entityUuid: action.entityUuid,
      };
    },
  },
};
