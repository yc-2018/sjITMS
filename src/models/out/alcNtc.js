import {
  query,
  add,
  update,
  modifyInitial,
  get,
  remove,
  audit,
  abort,
  finish,
  copy,
  getWaveAlcNtcBills,
  getByNumber,
  // getImportTemplateUrl,
  batchImport,
  saveAndAudit,
  previousBill, nextBill
} from '@/services/out/AlcNtc';

export default {
  namespace: 'alcNtc',

  subscriptions: {
    /**
     * 监听浏览器地址
     * @param dispatch 触发器，用于触发 effects 中的 query 方法
     * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
     */
    setup({ dispatch, history }) {
      history.listen((location) => {
        if (location.payload && location.pathname == "/out/alcNtc") {
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
      if (callback) callback(response);
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
      const response = yield call(saveAndAudit, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'view',
          entityUuid: response.data
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

    *onModifyInitial({ payload, callback }, { call, put }) {
      const response = yield call(modifyInitial, payload);
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

    *previousBill({ payload, callback }, { call, put }) {
      const response = yield call(previousBill, payload);
      yield put({
        type: 'onView',
        entity: response.data
      });
      if (callback) callback(response);
    },

    *nextBill({ payload, callback }, { call, put }) {
      const response = yield call(nextBill, payload);
      yield put({
        type: 'onView',
        entity: response.data
      });
      if (callback) callback(response);
    },

    *onRemove({ payload, callback }, { call, put }) {
      const response = yield call(remove, payload);
      if (callback) callback(response);
    },

    *onAudit({ payload, callback }, { call, put }) {
      const response = yield call(audit, payload);
      if (callback) callback(response);
    },

    *onFinish({ payload, callback }, { call, put }) {
      const response = yield call(finish, payload);
      if (callback) callback(response);
    },

    *onAbort({ payload, callback }, { call, put }) {
      const response = yield call(abort, payload);
      if (callback) callback(response);
    },

    *copy({ payload, callback }, { call, put }) {
      const response = yield call(copy, payload);
      if (callback) callback(response);
    },

    *getWaveAlcNtcBills({ payload, callback }, { call, put }) {
      const response = yield call(getWaveAlcNtcBills, payload);
      if (response && response.success) {
        yield put({
          type: 'getBills',
          payload: response.data ? response.data : []
        });
      }
    },
    *getByNumber({ payload, callback }, { call, put }) {
      const response = yield call(getByNumber, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
      if (callback) callback(response);
    },

    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid,
        importTemplateUrl: payload.importTemplateUrl,
        fromView: payload.fromView
      });
    },

    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
      if (callback) callback(response);
    },

    *queryWaveAlcNtc({ payload }, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success) {
        yield put({
          type: 'saveAlcNtc',
          payload: {
            list: response.data.records ? response.data.records : [],
            pagination: {
              total: response.data.paging.recordCount,
              pageSize: response.data.paging.pageSize,
              current: response.data.page + 1,
              showTotal: response.data.paging.more ? undefined : total => `共 ${total} 条`,
            },
          },
        });
      }
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
    getBills(state, action) {
      return {
        ...state,
        bills: action.payload
      }
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
        fromView: action.fromView
        // importTemplateUrl: action.importTemplateUrl
      }
    },
    saveAlcNtc(state, action) {
      return {
        ...state,
        waveAlcNtcData: action.payload,
      };
    }
  },

};
