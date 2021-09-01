import {
    saveOrUpdate,
    getByDcUuid,
  } from '@/services/facility/StockTakeConfig';
  
  export default {
    namespace: 'stockTakeConfig',
  
    state: {
      data: {},
    },
  
    effects: {
      *saveOrUpdate({ payload, callback }, { call, put }) {
        const response = yield call(saveOrUpdate, payload);
        if (callback) callback(response);
      },
  
      *getByDcUuid({ payload, callback }, { call, put }) {
        const response = yield call(getByDcUuid, payload);
        yield put({
          type: 'save',
          payload: {
            entity: response.data,
          },
        });
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
    }
  }