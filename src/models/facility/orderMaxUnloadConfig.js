import {
    getByCompanyUuidAndDcUuid,
    save
  } from '@/services/facility/OrderMaxUnloadConfig';
  
  export default {
    namespace: 'orderMaxUnloadConfig',
  
    state: {
      data: {},
    },
    effects: {
      *getByCompanyUuidAndDcUuid({ payload }, { call, put }) {
        const response = yield call(getByCompanyUuidAndDcUuid, payload);
        if (response && response.success) {
          yield put({
            type: 'saveInfo',
            payload: response.data,
          });
        }
      },
      *save({ payload, callback }, { call, put }) {
        const response = yield call(save, payload);
        if (callback) callback(response);
      }
    },
  
    reducers: {
      saveInfo(state, action) {
        return {
          ...state,
          data: action.payload,
        };
      },
    },
  };
  