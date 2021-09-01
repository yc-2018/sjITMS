import {
  get,
  modify,
} from '@/services/facility/CollectionBinReviewShipConfig';

export default {
  namespace: 'collectbinreviewshipconfig',

  state: {
    data: false,
    sourceDcUuid: null
  },

  effects: {
    *modify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (callback) callback(response);
    },

    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: {
            data: response.data,
            sourceDcUuid: payload.dcUuid
          }
        });
      }
      if (callback) callback(response);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload.data,
        sourceDcUuid: action.payload.sourceDcUuid
      };
    },
  }
}