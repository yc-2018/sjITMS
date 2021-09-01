import {
  save, deletePlan, finish, query, getByBillNumber, generateTakeBill, modify,billUuid
} from '@/services/inner/StockTakePlan';

export default {
  namespace: 'stockTakePlanBill',
  subscriptions: {
    /**
     * ???????
     * @param dispatch ???????? effects ?? query ??
     * @param history ?????????????? location ??????????
     */
    setup({ dispatch, history }) {
      history.listen((location) => {
        if (location.payload && location.pathname == '/inner/stockTakePlanBill') {
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
    billNumber: '',
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
    *delete({ payload, callback }, { call, put }) {
      const response = yield call(deletePlan, payload);
      if (callback) callback(response)
    },
    *finish({ payload, callback }, { call, put }) {
      const response = yield call(finish, payload);
      if (callback) callback(response);
    },
    *generateTakeBill({ payload, callback }, { call, put }) {
      const response = yield call(generateTakeBill, payload);
      if (callback) callback(response);
    },
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      yield put({
        type: 'save',
        payload: {
          list: response.data && response.data.records ? response.data.records : [],
          pagination: {
            total: response.data && response.data.paging && response.data.paging.recordCount ? response.data.paging.recordCount : '' ,
            pageSize: response.data && response.data.paging && response.data.paging.pageSize ? response.data.paging.pageSize : '',
            current: response.data && response.data.page ?  response.data.page + 1 : 1,
            showTotal: total => `共 ${total} 条`,
          },
        },
      });

      if (callback) callback(response);
    },

    *getByBillNumber({ payload, callback }, { call, put }) {
      const response = yield call(getByBillNumber, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          payload: {
            entity: response.data
          }
        });
      }
      if(callback) callback(response);
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(deletePlan, payload);
      if (response && response.success) {
        yield put({
          type: 'showPage',
          payload: {
            showPage: 'query'
          }
        });
      } if (callback) callback(response);
    },
    *billUuid({payload, callback},{call, put}){
      const response = yield call(billUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          payload: {
            entity: response.data
          }
        });
      }
      if(callback) callback(response);
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
