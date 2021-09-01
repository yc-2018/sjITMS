import {
  queryShipPlanDeliveryDispatch, queryShipPlanDispatch, queryShipPlanDeliveryTaskItem
} from '@/services/tms/ShipPlanDispatch';

export default {
  namespace: 'shipPlanDispatch',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    deliveryData: {
      list: [],
      pagination: {},
    },
    deliveryTaskItem: {
      stockItems: [],
      containerItems: [],
      attachmentItems: []
    },
    deliveryTaskEntity: {},
    entity: {},
    showPage: 'query',
    uuid: '',
  },
  effects: {

    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        payload,
      });
    },

    *query({ payload, callback }, { call, put }) {
      const response = yield call(queryShipPlanDispatch, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: {
            list: response.data ? response.data : [],
          },
        });

        if (callback) callback(response);
      }
    },
    *queryDispatch({ payload, callback }, { call, put }) {
      const response = yield call(queryShipPlanDeliveryDispatch, payload);
      yield put({
        type: 'refreshDeliveryData',
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
    *queryShipPlanDeliveryTaskItem({ payload, callback }, { call, put }) {
      const response = yield call(queryShipPlanDeliveryTaskItem, payload);
      if (response.success) {
        yield put({
          type: 'refreshDeliveryTaskItem',
          payload: {
            deliveryTaskItem: response.data
          },
        });
      }

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
    onShowPage(state, action) {
      return {
        ...state, ...action.payload
      }
    },
    refreshDeliveryData(state, action) {
      return {
        ...state,
        deliveryData: action.payload
      }
    },
    refreshDeliveryTaskItem(state, action) {
      return {
        ...state,
        deliveryTaskItem: action.payload.deliveryTaskItem
      }
    }
  },
}