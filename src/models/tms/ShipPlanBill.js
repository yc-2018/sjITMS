import { query, get, save, modify, approve, abort, remove, modifyBillItem, getByBillNumber, previousBill, nextBill } from '@/services/tms/ShipPlanBill';
import {
  queryShipPlanDeliveryDispatch
} from '@/services/tms/ShipPlanDispatch';

export default {
  namespace: 'shipplanbill',
  subscriptions: {
    /**
     * 监听浏览器地址
     * @param dispatch 触发器，用于触发 effects 中的 query 方法
     * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
     */
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if(location.payload && location.pathname == "/tms/shipplanbill"){
          dispatch({
            type: 'showPage',
            payload: location.payload,
          })
        }
      });
    },
  },
  state: {
    shipPlanDeliveryDispatch: {
      list: [],
      pagination: {},
    },
    shipPlanDispatch: {},

    data: {
      list: [],
      pagination: {},
    },

    fromOrgData: {
      list: [],
      pagination: {},
    },

    toOrgData: {
      list: [],
      pagination: {},
    },

    entity: {},
    showPage: 'query'
  },

  effects: {
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
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

    *get({ payload }, { call, put }) {
      const response = yield call(get, payload);
      yield put({
        type: 'onView',
        payload: response.data
      });
    },

    *previousBill({ payload }, { call, put }) {
      const response = yield call(previousBill, payload);
      yield put({
        type: 'onView',
        payload: response.data
      });
    },

    *nextBill({ payload }, { call, put }) {
      const response = yield call(nextBill, payload);
      yield put({
        type: 'onView',
        payload: response.data
      });
    },

    *getByBillNumber({ payload, callback }, { call, put }) {
      const response = yield call(getByBillNumber, payload);
      if (response.success) {
        yield put({
          type: 'saveEntity',
          payload: response.data
        });
      }
      if (callback) callback(response);
    },

    *onSave({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'view',
          entityUuid: response.data
        });
      }
      if (callback) callback(response);
    },

    *onSaveAndCreate({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'create'
        });
      }
      if (callback) callback(response);
    },

    *onModify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'view',
          entityUuid: payload.uuid
        });
      }
      if (callback) callback(response);
    },

    *onModifyBillItem({ payload, callback }, { call, put }) {
      const response = yield call(modifyBillItem, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'view',
          entityUuid: payload.uuid
        });
      }
      if (callback) callback(response);
    },

    *onApprove({ payload, callback }, { call, put }) {
      const response = yield call(approve, payload);
      if (callback) callback(response);
    },

    *onAbort({ payload, callback }, { call, put }) {
      const response = yield call(abort, payload);
      if (callback) callback(response);
    },

    *onRemove({ payload, callback }, { call, put }) {
      const response = yield call(remove, payload);
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

    *showCreatePage({ payload }, { call, put }) {
      yield put({
        type: 'showCreate',
        showPage: payload.showPage,
        entity: payload.entity
      })
    },

    * queryShipPlanDeliveryDispatch({ payload, callback }, { call, put }) {
      const response = yield call(queryShipPlanDeliveryDispatch, payload);
      const type = payload.queryType ? payload.queryType : 'saveDeliveryDispatch';
      if (response.success) {
        yield put({
          type: type,
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
    }

  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
        entity: {}
      };
    },
    queryFromOrg(state, action) {
      return {
        ...state,
        fromOrgData: action.payload
      };
    },
    queryToOrg(state, action) {
      return {
        ...state,
        toOrgData: action.payload
      };
    },
    saveEntity(state, action) {
      return {
        ...state,
        entity: action.payload,
      };
    },
    saveDeliveryDispatch(state, action) {
      return {
        ...state,
        shipPlanDeliveryDispatch: action.payload,
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
    showCreate(state, action) {
      return { ...state, ...action }
    }
  },
}
