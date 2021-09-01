import { save, saveAndAudit, modify, get, getByGroupNo, audit, query, byOrders,finish, previousBill, nextBill } from '@/services/in/Preview';
import { getByBillNumbers } from '@/services/in/Order';

export default {
  namespace: 'preview',

  subscriptions: {
    /**
     * 监听浏览器地址
     * @param dispatch 触发器，用于触发 effects 中的 query 方法
     * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
     */
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if(location.payload && location.pathname == "/in/preview"){
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
  },

  effects: {
    *onSave({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'view',
          entityUuid: response.data.uuid,
          groupNo: response.data.groupNo,
          ocrDate: response.data.ocrDate,
        });
      }
      if (callback) callback(response);
    },
    *onSaveAndCreate({ payload, callback }, { call, put }) {
      if (payload.groupNo){
        payload.uuid = undefined;
      }
      const response = yield call(saveAndAudit, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'view',
          entityUuid: response.data.uuid,
          groupNo: response.data.groupNo,
          ocrDate: response.data.ocrDate,
        });
      }
      if (callback) callback(response);
    },

    *onModify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (response && response.success) {
        if (payload[0].groupNo){
          yield put({
            type: 'onShowPage',
            showPage: 'view',
            groupNo: payload[0].groupNo,
            ocrDate: payload[0].ocrDate,
          });
        }else {
          yield put({
            type: 'onShowPage',
            showPage: 'view',
            entityUuid: payload[0].uuid
          });
        }
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
    },

    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          payload: response.data,
        });
      }
      if (callback) callback(response);
    },

    *previousBill({ payload, callback }, { call, put }) {
      const response = yield call(previousBill, payload);
      yield put({
        type: 'onView',
        payload: response.data,
      });
      if (callback) callback(response);
    },

    *nextBill({ payload, callback }, { call, put }) {
      const response = yield call(nextBill, payload);
      yield put({
        type: 'onView',
        payload: response.data,
      });
      if (callback) callback(response);
    },

    * getByGroupNo({ payload, callback }, { call, put }) {
      const response = yield call(getByGroupNo, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          payload: {
            list: response.data ? response.data : [],
          }
        });
      }
      if (callback) callback(response);
    },

    * audit({ payload, callback }, { call, put }) {
      if (payload.groupNo){
        payload.uuid = undefined;
      }
      const response = yield call(audit, payload);
      if (callback) callback(response);
    },

    *finish({ payload, callback }, { call, put }) { 
      const response = yield call(finish, payload);
      if (callback) callback(response);
    },

    *getByBillNumbers({ payload, callback }, { call, put }) {
      const response = yield call(byOrders, payload);
      if (callback) callback(response);
    },

    * showPage({ payload }, { call, put }) {
      console.log(payload.refresh);
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid,
        version: payload.version,
        groupNo: payload.groupNo,
        ocrDate: payload.ocrDate,
        orderBillNumbers: payload.orderBillNumbers,
        refresh: payload.refresh,
        queryFilter: payload.queryFilter,
        fromView: payload.fromView
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
        entity: action.payload,
        refresh: false,
      };
    },
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
        version: action.version,
        groupNo: action.groupNo,
        ocrDate: action.ocrDate,
        orderBillNumbers: action.orderBillNumbers,
        refresh: action.refresh,
        queryFilter: action.queryFilter,
        fromView: action.fromView
      };
    },
  },
};
