import {
  query,
  save,
  modify,
  get,
  enable,
  disable,
  batchImport,
  getByCode
} from '@/services/basic/Vendor';

export default {
  namespace: 'vendor',
  subscriptions: {
    /**
     * 监听浏览器地址
     * @param dispatch 触发器，用于触发 effects 中的 query 方法
     * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
     */
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if(location.payload && location.pathname == "/basic/vendor"){
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
    dataForDeliverySelectForPick:{
      list: [],
      pagination: {},
    },
    showPage: 'query',
    entity: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
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
    *queryForDeliverySelectForPick({ payload }, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success) {
        yield put({
          type: 'saveForDeliverySelectForPick',
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
    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
      if (callback) callback(response);
    },
    *getByCode({ payload, callback }, { call, put }) {
      const response = yield call(getByCode, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
      if (callback) callback(response);
    },
    *enable({ payload, callback }, { call, put }) {
      const response = yield call(enable, payload);
      if (callback) callback(response);
    },
    *disable({ payload, callback }, { call, put }) {
      const response = yield call(disable, payload);
      if (callback) callback(response);
    },
    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid,
        fromView: payload.fromView
        // importTemplateUrl: payload.importTemplateUrl,
      });
    },
    *onShowUnLoaderView({ payload, callback }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: 'unLoaderView',
      });
    },
    *onCancelType({ payload, callback }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: 'query',
      });
    },
    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
      if (callback) callback(response);
    },
    // *getImportTemplateUrl({ payload, callback }, { call, put }) {
    //   const response = yield call(getImportTemplateUrl, payload);
    //   if (callback) callback(response);
    // },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    saveForDeliverySelectForPick(state, action) {
      return {
        ...state,
        dataForDeliverySelectForPick: action.payload,
      };
    },
    onView(state, action) {
      return {
        ...state,
        entity: action.entity
      }
    },
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
        importTemplateUrl: action.importTemplateUrl,
        fromView: action.fromView
      }
    }
  },
};
