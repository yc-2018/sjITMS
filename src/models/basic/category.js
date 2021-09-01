import {
  save, deleteCategory, modify, query, online, offline, get, getByCode, batchImport,
  // getImportTemplateUrl,
  getByCompanyUuid,
} from '@/services/basic/Category';

export default {
  namespace: 'category',
  subscriptions: {
    /**
     * 监听浏览器地址
     * @param dispatch 触发器，用于触发 effects 中的 query 方法
     * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
     */
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if(location.payload && location.pathname == "/basic/category"){
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
    *onSave({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(deleteCategory, payload);
      if (callback) callback(response)
    },
    *onModify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (callback) callback(response);
    },
    *online({ payload, callback }, { call, put }) {
      const response = yield call(online, payload);
      if (callback) callback(response);
    },
    *offline({ payload, callback }, { call, put }) {
      const response = yield call(offline, payload);
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
    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
      if (callback) callback(response);
    },
    // *getImportTemplateUrl({ payload, callback }, { call, put }) {
    //   const response = yield call(getImportTemplateUrl, payload);
    //   if (callback) callback(response);
    // },
    *getByCompanyUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByCompanyUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'onUpper',
          upperList: response.data
        });
      }
      if (callback) callback(response);
    },
    *onShowLevelView({ payload, callback }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: 'levelView',
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
        // importTemplateUrl: payload.importTemplateUrl,
        // importType: payload.importType,
        upperCode: payload.upperCode,
        fromView: payload.fromView
      });
    },
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload
      };
    },
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
        importTemplateUrl: action.importTemplateUrl,
        importType: action.importType,
        upperCode: action.upperCode,
        fromView: action.fromView
      }
    },
    onView(state, action) {
      return {
        ...state,
        entity: action.entity
      };
    },
    onUpper(state, action) {
      return {
        ...state,
        upperList: action.upperList
      };
    }
  },
}
