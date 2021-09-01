import { query, audit, remove, get, getByBillNumber, add, update, saveAndApprove } from '@/services/inner/AdjBill';

export default {
  namespace: 'adjBill',

  state: {
    data: {
      list: [],
      pagination: {}
    },
    fieldItems: [],
    showPage: 'query'
  },

  effects: {
    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        ...payload,
        fromView: payload.fromView,
      });
    },
    *query({ payload }, { call, put }) {
      const response = yield call(query, payload);
      if (response.success) {
        yield put({
          type: 'save',
          payload: {
            list: response.data.records,
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
    *getByBillNumber({ payload, callback }, { call, put }) {
      const response = yield call(getByBillNumber, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
      if (callback) callback(response);
    },
    *onShowReasonView({ payload, callback }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: 'adjReason',
      });
    },
    *onCancelReason({ payload, callback }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: 'query',
      });
    },
    *onAudit({ payload, callback }, { call, put }) {
      const response = yield call(audit, payload);
      if (callback) callback(response);
    },

    *onRemove({ payload, callback }, { call, put }) {
      const response = yield call(remove, payload);
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
      const response = yield call(saveAndApprove, payload);
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
        billNumber: action.billNumber,
        fromView: action.fromView,
      }
    },
    onView(state, action) {
      return {
        ...state,
        entity: action.entity,
        billNumber: undefined,
        entityUuid: undefined
      }
    },
  }
}
