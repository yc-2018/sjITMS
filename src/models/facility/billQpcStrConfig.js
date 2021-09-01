import {
  modify,
  getByDcUuid,
  getByBillType
} from '@/services/facility/BillQpcStrConfig';

export default {
  namespace: 'billQpcStrConfig',

  state: {
    data: [],
    entity:{}
  },

  effects: {
    *modify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (callback) callback(response);
    },

    *getByDcUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByDcUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: response.data ? response.data : [],
        });
      }
    },

    *getByBillType({ payload, callback }, { call, put }) {
      const response = yield call(getByBillType, payload);
      if (response && response.success) {
        yield put({
          type: 'get',
          payload: response.data ? response.data : {},
        });
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    get(state, action) {
      return {
        ...state,
        entity: action.payload,
      };
    },
  }
}