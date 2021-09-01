import {
  query, save, modify, deleteEntity, getByUuid, getByCompanyUuid,getByCodeAndCompanyUuid
} from '@/services/tms/VehicleType';

export default {
  namespace: 'vehicleType',

  subscriptions: {
    /**
     * ???????
     * @param dispatch ???????? effects ?? query ??
     * @param history ?????????????? location ??????????
     */
    setup({ dispatch, history }) {
      history.listen((location) => {
        if (location.payload && location.pathname == "/tms/vehicleType") {
          dispatch({
            type: 'showPage',
            payload: location.payload,
          })
        }
      });
    },
  },


  state: {
    data: {
      list: [],
      pagination: {},
    },
    entity: {},
    showPage: 'query',
    uuid: '',
    vehicleTypeList: [],
  },
  effects: {

    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        fromView: payload.fromView,
        payload,
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },
    *modify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (callback) callback(response);
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(deleteEntity, payload);
      if (response && response.success) {
        yield put({
          type: 'showPage',
          payload: {
            showPage: 'query'
          }
        });
      }
      if (callback) callback(response)
    },
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
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

      if (callback) callback(response);
    },

    *getByUuid({ payload, callback }, { call, put }) {
      if (!payload || payload === '') {
        yield put({
          type: 'onShowPage',
          payload: {
            entity: {}
          }
        });
        return;
      }

      const response = yield call(getByUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          payload: {
            entity: response.data
          }
        });
      }
      if (callback) callback(response);
    },
    *getByCode({ payload, callback }, { call, put }) {
      const response = yield call(getByCodeAndCompanyUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          payload: {
            entity: response.data
          }
        });
      }
      if (callback) callback(response);
    },


    *getByCompanyUuid({ payload }, { call, put }) {
      const response = yield call(getByCompanyUuid, payload);
      yield put({
        type: 'onView',
        payload: {
          vehicleTypeList: response.data
        }
      })
    }
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
        ...action.payload
      }
    },
    onShowPage(state, action) {
      return {
        ...state, fromView: action.fromView, ...action.payload
      }
    }
  },
}
