import {
  save,
  modify,
  query,
  getByCompanyUuidAndUuid,
  enable,
  disable,
  saveStoreType,
  getStoreTypesByCompanyUuid,
  queryStoreType,
  batchImport,
  getByCompanyUuidAndCode,
  modifyStoreTms,
  saveStoreTms,
  modifyAllowReceiveDay
} from '@/services/basic/Store';

export default {
  namespace: 'store',

  subscriptions: {
    /**
     * 监听浏览器地址
     * @param dispatch 触发器，用于触发 effects 中的 query 方法
     * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
     */
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if(location.payload && location.pathname == "/basic/store"){
          dispatch({
            type: 'showPage',
            payload: location.payload,
          })
        }
      });
    },
  },

  state: {
    data: {
      list: [],
      pagination: {},
    },
    showPage: 'query',
    entity: {}
  },
  effects: {
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: {
            list: response.data.records,
            pagination: {
              total: response.data.paging.recordCount,
              pageSize: response.data.paging.pageSize,
              current: response.data.page + 1,
              showTotal: total => `共 ${total} 条`,
            },
          },
        });
      }
      if (callback) callback(response);
    },
    *onSave({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'view',
          entityUuid: response.data
        });
      }
      if (callback) callback(response);
    },
    *modifyStoreTms({ payload, callback }, { call, put }) {
      const response = yield call(modifyStoreTms, payload);
      if (callback) callback(response);
    },

    *saveStoreTms({ payload, callback }, { call, put }) {
      const response = yield call(saveStoreTms, payload);
      if (callback) callback(response);
    },
    *modifyAllowReceiveDay({ payload, callback }, { call, put }) {
      const response = yield call(modifyAllowReceiveDay, payload);
      if (callback) callback(response);
    },
    *onSaveAndCreate({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'create'
        });
      }
      if (callback) callback(response);
    },
    *onModify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'view',
          entityUuid: payload.uuid
        });
      }
      if (callback) callback(response);
    },
    *online({ payload, callback }, { call, put }) {
      const response = yield call(enable, payload);
      if (callback) callback(response);
    },
    *offline({ payload, callback }, { call, put }) {
      const response = yield call(disable, payload);
      if (callback) callback(response);
    },
    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
      if (callback) callback(response);
    },

    /* 门店类型部分 开始 */
    *queryStoreType({ payload }, { call, put }) {
      const response = yield call(queryStoreType, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: {
            list: response.data.records,
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
    *addStoreType({ payload, callback }, { call, put }) {
      const response = yield call(saveStoreType, payload);
      if (callback) callback(response);
    },
    *getStoreTypesByCompanyUuid({ payload, callback }, { call, put }) {
      const response = yield call(getStoreTypesByCompanyUuid, payload);
      if (callback) callback(response);
    },
    /* 门店类型部分 结束 */
    *getByCompanyUuidAndUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByCompanyUuidAndUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
      if (callback) callback(response);
    },
    *getByCompanyUuidAndCode({ payload, callback }, { call, put }) {
      const response = yield call(getByCompanyUuidAndCode, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
      if (callback) callback(response);
    },
    *onShowTypeView({ payload, callback }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: 'typeView',
      });
    },
    *onShowOperatingTypeView({ payload, callback }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: 'operatingTypeView',
      });
    },
    *onShowStoreAreaView({ payload, callback }, { call, put }){
      yield put({
        type: 'onShowPage',
        showPage: 'storeAreaView',
      });
    },
    *onCancelType({ payload, callback }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: 'query',
      });
    },
    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid,
        fromView: payload.fromView
      });
    },
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
        importTemplateUrl: action.importTemplateUrl,
        importType: action.importType,
        fromView: action.fromView
      }
    },
    onView(state, action) {
      return {
        ...state,
        entity: action.entity
      };
    },
  },
}
