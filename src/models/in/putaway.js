import {
  save, deletePutaway, modify, query, audit, get, getByBillNumberAndDcUuid,
  queryPutawayContainers,queryPutawayBins, saveAndAudit, previousBill, nextBill
}
  from '@/services/in/Putaway';

export default {
  namespace: 'putaway',

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
    *delete({ payload, callback }, { call, put }) {
      const response = yield call(deletePutaway, payload);
      if (callback) callback(response)
    },
    *modify({ payload, callback }, { call, put }) {
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
    *previousBill({ payload }, { call, put }) {
      const response = yield call(previousBill, payload);
      yield put({
        type: 'onView',
        entity: response.data
      });
    },

    *nextBill({ payload }, { call, put }) {
      const response = yield call(nextBill, payload);
      yield put({
        type: 'onView',
        entity: response.data
      });
    },
    *getByBillNumberAndDcUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByBillNumberAndDcUuid, payload);
      if (callback) callback(response);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
    },
    *audit({ payload, callback }, { call, put }) {
      const response = yield call(audit, payload);
      if (callback) callback(response);
    },
    *queryPutawayContainers({payload, callback }, { call, put }){
      const response = yield call(queryPutawayContainers, payload);
      if (response && response.success) {
        yield put({
          type: 'saveContainerStocks',
          payload: response.data
        });
      }
      if (callback) callback(response);      
    },
    *queryForBatch({payload, callback }, { call, put }){
      const response = yield call(queryPutawayContainers, payload);
      if (response && response.success) {
        yield put({
          type: 'saveBatchStocks',
          payload: {
            list: response.data.records ? response.data.records : [],
            pagination: {
              total: response.data.recordCount,
              pageSize: response.data.pageSize,
              current: response.data.page + 1,
              showTotal: total => `共 ${total} 条`,
            },
          },
        });
      }
      if (callback) callback(response);

    },
    *queryPutawayBins({payload, callback }, { call, put }){
      const response = yield call(queryPutawayBins, payload);
      if (response && response.success) {
        yield put({
          type: 'saveBins',
          payload: response.data
        });
      }
      if (callback) callback(response);

    },

    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid,
        ownerUuid: payload.ownerUuid,
        fromView: payload.fromView,
        billNumber: payload.billNumber
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
    onView(state, action) {
      return {
        ...state,
        entity: action.entity,
        billNumber: undefined,
      }
    },
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
        ownerUuid: action.ownerUuid,
        fromView: action.fromView,
        billNumber: action.billNumber
      }
    },
    saveContainerStocks(state,action){
      return {
        ...state,
        stocks: action.payload,
      };
    },
    saveBatchStocks(state,action){
      return {
        ...state,
        batchStocks: action.payload,
      };
    },
    saveBins(state,action){
      return {
        ...state,
        bins: action.payload,
      };
    }
  }
}
