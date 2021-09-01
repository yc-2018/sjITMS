import { getByCarrier, beginloading, finishloading } from '@/services/tms/ChargeLoading'

export default {
  namespace: 'chargeLoading',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    entity: {},
    entityUuid: '',
    showPage: 'query'
  },

  effects: {
    *getByCarrier({ payload, callback }, { call, put }) {
      const response = yield call(getByCarrier, payload);
      yield put({
        type: 'onView',
        payload: response.data
      });
      if (callback) callback(response);

    },
    *beginloading({ payload, callback }, { call, put }) {
      const response = yield call(beginloading, payload);
      if (callback) callback(response);
    },
    *finishloading({ payload, callback }, { call, put }) {
      const response = yield call(finishloading, payload);
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
    onView(state, action) {
      return {
        ...state,
        entity: action.payload
      }
    }
  },
}
