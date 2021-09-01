import {
  query,
  add,
  update,
  online,
  offline,
  get,
  batchImport,
  // getImportTemplateUrl,
  getByCompanyUuid,
  getByCompanyUuidAndCode
} from '@/services/tms/Carrier';

export default {
  namespace: 'carrier',
  subscriptions: {
    /**
     * ???????
     * @param dispatch ???????? effects ?? query ??
     * @param history ?????????????? location ??????????
     */
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if(location.payload && location.pathname == "/tms/carrier"){
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
      pagination: {}
    },
    showPage: 'query',
    entity: {},
    carrierList: [],
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
              showTotal: total => `共 ${total}条`,
            }
          },
        });
      }
    },

    *onSave({ payload, callback }, { call, put }) {
      const response = yield call(add, payload);
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
      const response = yield call(add, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'create'
        });
      }
      if (callback) callback(response);
    },
    *onModify({ payload, callback }, { call, put }) {
      const response = yield call(update, payload);
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
          payload: response.data
        });
      }
      if (callback) callback(response);
    },
    *getByCode({ payload, callback }, { call, put }) {
      const response = yield call(getByCompanyUuidAndCode, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          payload: response.data
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

    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid,
        fromView: payload.fromView
        // importTemplateUrl: payload.importTemplateUrl,
        // importType: payload.importType,
      });
    },
    *getByCompanyUuid({ payload }, { call, put }) {
      const response = yield call(getByCompanyUuid, payload);
      yield put({
        type: 'updateState',
        payload: {
          carrierList: response.data
        }
      })
    }
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    updateState(state, action) {
      return { ...state, ...action.payload };
    },
    onView(state, action) {
      return {
        ...state,
        entity: action.payload
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
