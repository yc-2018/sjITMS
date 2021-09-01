import {
  query,
  add,
  update,
  get,
  remove,
  audit,
  queryInProgress,
  saveAndAudit,
  previousBill, nextBill, getByBillNumber
} from '@/services/in/Receive';

export default {
  namespace: 'receive',

  state: {
    data: {
      list: [],
      pagination: {}
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

    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          payload: response.data ? response.data : {}
        });
      }
      if (callback) callback(response);
    },
    *getByBillNumber({ payload, callback }, { call, put }) {
      const response = yield call(getByBillNumber, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          payload: response.data ? response.data : {}
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

    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid,
        fromView: payload.fromView,
        billNumber: payload.billNumber,
      });
    },
    *queryInProgress({payload,callback},{call,put}){
      const response = yield call(queryInProgress,payload);
      if(callback) callback(response);
    }
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    onView(state, action) {
      return {
        ...state,
        entity: action.payload,
        billNumber: action.billNumber
      }
    },
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
        fromView: action.fromView,
        billNumber: action.billNumber
      }
    }
  },

};
