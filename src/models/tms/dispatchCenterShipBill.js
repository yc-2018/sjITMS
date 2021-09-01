import {
  query, get, getByBillNumber, updateDispatchTime, updateReturnTime
} from '@/services/tms/DispatchCenterShipBill';

export default {
  namespace: 'dispatchCenterShipBill',
  state: {
    data: {
      list: [],
      pagination: {},
    },
    entity: {},
    unShipItems: [],
    unShipContainerData: {
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

    *getByBillNumber({ payload, callback }, { call, put }) {
      const response = yield call(getByBillNumber, payload);
      if (callback) callback(response);
      if (response && response.success) {
        yield put({
          type: 'onView',
          payload: response.data
        });
      }
    },

    *updateDispatchTime({ payload, callback }, { call, put }) {
      const response = yield call(updateDispatchTime, payload);
      if (callback) callback(response);
    },

    *updateReturnTime({ payload, callback }, { call, put }) {
      const response = yield call(updateReturnTime, payload);
      if (callback) callback(response);
    },

    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid
      });
    }

  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    saveWaitShipItem(state, action) {
      return {
        ...state,
        unShipItems: action.payload,
      };
    },
    saveUnShipItemData(state, action) {
      return {
        ...state,
        unShipContainerData: action.payload,
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
        entity: {}
      }
    },
    showCreatePage(state, action) {
      return {
        ...state,
        entityUuid: undefined,
        entity: action.payload.entity,
        showPage: action.payload.showPage,
      }
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
    }
  },
}
