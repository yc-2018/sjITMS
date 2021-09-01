import { getByCarrier, updateTime } from '@/services/tms/CheckInAndCheckOut'

export default {
  namespace: 'checkInAndCheckOut',

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
    * getByCarrier({ payload, callback }, { call, put }) {
      const response = yield call(getByCarrier, payload);
      yield put({
        type: 'onView',
        payload: response.data
      });
      if (callback) callback(response);

    },
    * updateTime({ payload, callback }, { call, put }) {
      const response = yield call(updateTime, payload);
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
    },
    // onShowPage(state, action) {
    //   return {
    //     ...state,
    //     showPage: action.showPage,
    //     entityUuid: action.entityUuid
    //   }
    // }
  },
}
