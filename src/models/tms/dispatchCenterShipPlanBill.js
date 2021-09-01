import { queryShipPlan, getShipPlanByUuid, modifyShipPlan,onAborted,shipRollback,onApprove, getShipPlanByBillNumber,getMerge,adjust,queryScheduleBill,getByMember,modifybillonly } from '@/services/tms/DispatchCenterShipPlanBill';

export default {
  namespace: 'dispatchCenterShipPlanBill',
  subscriptions: {
    /**
     * 监听浏览器地址
     * @param dispatch 触发器，用于触发 effects 中的 query 方法
     * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
     */
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if(location.payload && location.pathname == "/tms/dispatchCenterShipPlanBill"){
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

    dataForSelect: {
      list: [],
      pagination: {},
    },

    entity: {},
    showPage: 'query'
  },

  effects: {
    *query({ payload, callback }, { call, put }) {
      const response = yield call(queryShipPlan, payload);
      if (response.success) {
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
      if (callback) callback(response);
    },
    *queryForSelect({ payload, callback }, { call, put }) {
      const response = yield call(queryShipPlan, payload);
      if (response.success) {
        yield put({
          type: 'saveForSelect',
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
      if (callback) callback(response);
    },

    *get({ payload,callback }, { call, put }) {
      const response = yield call(getShipPlanByUuid, payload);
      if (callback) callback(response);
    },
    *getMerge({ payload,callback }, { call, put }) {
      const response = yield call(getMerge, payload);
      if (callback) callback(response);
    },
    *getByMember({ payload,callback }, { call, put }) {
      const response = yield call(getByMember, payload);
      if (callback) callback(response);
    },
    *getForCreate ({ payload,callback }, { call, put }) {
      const response = yield call(getShipPlanByUuid, payload);
      if (callback) callback(response);
    },
    *getShipPlanByBillNumber({ payload, callback }, { call, put }) {
      const response = yield call(getShipPlanByBillNumber, payload);
      if (callback) callback(response);
    },

    *onModify({ payload, callback }, { call, put }) {
      const response = yield call(modifyShipPlan, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'view',
          entityUuid: payload.uuid
        });
      }
      if (callback) callback(response);
    },
    *onAbort({ payload, callback }, { call, put }) {
      const response = yield call(onAborted, payload);
      if (callback) callback(response);
    },
    *onRollBack({ payload, callback }, { call, put }) {
      const response = yield call(shipRollback, payload);
      if (callback) callback(response);
    },
    *onApprove({ payload, callback }, { call, put }) {
      const response = yield call(onApprove, payload);
      if (callback) callback(response);
    },
    *onAdjust({ payload, callback }, { call, put }) {
      const response = yield call(adjust, payload);
      if (callback) callback(response);
    },
    *modifybillonly({ payload, callback }, { call, put }) {
      const response = yield call(modifybillonly, payload);
      if (callback) callback(response);
    },
    *queryScheduleBill({ payload, callback }, { call, put }) {
      const response = yield call(queryScheduleBill, payload.searchKeyValues);
      if (callback) callback(response);
    },

    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid,
        fromView: payload.fromView
      });
    },


  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
        entity: {}
      };
    },
    saveForSelect(state, action) {
      return {
        ...state,
        dataForSelect: action.payload,
      };
    },

    onView(state, action) {
      return {
        ...state,
        entity: action.payload
      }
    },
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
        fromView: action.fromView
      }
    },
  },
}
