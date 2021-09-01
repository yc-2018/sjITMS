import { save,outWrh,getByBillNumber,get, query, assignDock, cancelAssignDock, abort, getDetail }from '@/services/in/InWrh';
// import { query } from '@/services/forward/in/Book';
export default {
  namespace: 'inwrh',
  state: {
    data: {
      list: [],
      pagination: {},
    },
    entity: {},
    showPage: 'query'
  },
  effects: {
    *onSave({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },
    *outWrh ({ payload, callback }, { call, put }) {
      const response = yield call(outWrh, payload);
      if (callback) callback(response);
    },
    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          billNumber: response.data.inwrhBill.billNumber
        });
      }
      if (callback) callback(response);
    },
    *getByBillNumber({ payload, callback }, { call, put }) {
      const response = yield call(getByBillNumber, payload);
      if (response && response.success) {
        yield put({
          type: 'onSaveBill',
          data: response.data
        });
      }
      if (callback) callback(response);
    },
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      if (callback) callback(response);
      if (response && response.success && response.data) {
        yield put({
          type: 'save',
          payload: {
            list: response.data.records ? response.data.records : [],
            pagination: {
              total: response.data.paging.recordCount,
              pageSize: response.data.paging.pageSize,
              current: response.data.page + 1,
              showTotal: response.data.paging.more ? undefined : total => `共 ${total} 条`,
            }
          },
        });
      }
    },
    *getDetail({ payload, callback }, { call, put }) {
      const response = yield call(getDetail, payload);
      if (response && response.success) {
        yield put({
          type: 'billView',
          entity: response.data
        });
      }
      if (callback) callback(response);
    },
    *abort({ payload, callback }, { call, put }) {
      const response = yield call(abort, payload);
      if (callback) callback(response);
    },
    *assignDock ({ payload, callback }, { call, put }) {
      const response = yield call(assignDock, payload);
      if (callback) callback(response);
    },
    *cancelAssignDock ({ payload, callback }, { call, put }) {
      const response = yield call(cancelAssignDock, payload);
      if (callback) callback(response);
    },
    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid,
        billNumber: payload.billNumber
      });
    },
  },
  reducers: {
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
        billNumber: action.billNumber
      }
    },
    onView(state, action) {
      return {
        ...state,
        entity: action.payload,
        entityUuid: action.entityUuid,
        billNumber: action.billNumber
      }
    },
    onSaveBill(state,action){
      return {
        ...state,
        entity: action.data,
        billNumber: undefined,
        entityUuid: undefined
      }
    },
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      }
    },
    billView(state, action) {
      return {
        ...state,
        entity: action.entity
      }
    }
  }
}
