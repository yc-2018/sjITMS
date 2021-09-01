import {
  save, getByCompanyUuidAndDcUuid
} from '@/services/facility/QueryBillDateConfig';
export default {
  namespace: 'queryBillDateConfig',

  state: {
    data: {},
    showPage: 'query',
  },
  effects: {
    *save({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },
    *getByCompanyUuidAndDcUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByCompanyUuidAndDcUuid, payload);
      if (response && response.success && response.data) {
        //存缓存里
        localStorage.setItem(
          window.location.hostname + '-queryBillDays',
          response.data.days,
        );

        yield put({
          type: 'saves',
          payload: {
            entity: response.data,
          },
        });
      }
      if (callback) callback(response);
    },
    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        fromView: payload.fromView
      });
    },
  },
  reducers: {
    saves(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        fromView: action.fromView
      }
    }
  },
};
