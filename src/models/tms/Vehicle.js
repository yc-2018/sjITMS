import {
  query, save, modify, deleteEntity, getByUuid as getByVehicleUuid, online, offline, free, saveEmp, removeEmp,getByDispatchCenterUuid,getByCode
} from '@/services/tms/Vehicle';

export default {
  namespace: 'vehicle',
  subscriptions: {
    /**
     * 监听浏览器地址
     * @param dispatch 触发器，用于触发 effects 中的 query 方法
     * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
     */
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if(location.payload && location.pathname == "/tms/vehicle"){
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
      const response = yield call(deleteEntity, payload);
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
      const response = yield call(getByVehicleUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          payload: {
            showPage: 'view',
            entity: response.data,
            uuid: response.data.uuid
          }
        });
      }
      if (callback) callback(response);
    },
    *getByCode({ payload, callback }, { call, put }) {
      const response = yield call(getByCode, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          payload: {
            showPage: 'view',
            entity: response.data,
          }
        });
      }
      if (callback) callback(response);
    },

    *getByDispatchCenterUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByDispatchCenterUuid);
      if (response && response.success) {
        yield put({
          type: 'onSaveForDispatchCenter',
          payload:  response.data,
        });
      }
    },
    *getByUuidForCreate({ payload, callback }, { call, put }) {
      const response = yield call(getByVehicleUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          payload: {
            showPage: 'create',
            entity: response.data
          }
        });
      }
    },
    *online({ payload, callback }, { call, put }) {
      const response = yield call(online, payload);
      if (callback) callback(response);
    },
    *offline({ payload, callback }, { call, put }) {
      const response = yield call(offline, payload);
      if (callback) callback(response);
    },
    *free({ payload, callback }, { call, put }) {
      const response = yield call(free, payload);
      if (callback) callback(response);
    },
    *saveEmployee({ payload, callback }, { call, put }) {
      const response = yield call(saveEmp, payload);
      const res = yield call(getByVehicleUuid, payload.vehicleUuid);
      if (res && res.success) {
        yield put({
          type: 'onShowPage',
          payload: {
            showPage: 'view',
            entity: res.data
          }
        });
        if (callback) callback(response);
      }
    },
    *saveEmployeeForCreat({ payload, callback }, { call, put }) {
      const response = yield call(saveEmp, payload);
      const res = yield call(getByVehicleUuid, payload.vehicleUuid);
      if (res && res.success) {
        yield put({
          type: 'onShowPage',
          payload: {
            showPage: 'create',
            entity: res.data
          }
        });
        if (callback) callback(response);
      }
    },
    *removeEmp({ payload, callback }, { call, put }) {
      const response = yield call(removeEmp, payload);
      const res = yield call(getByVehicleUuid, payload.vehicleUuid);
      if (res && res.success) {
        yield put({
          type: 'onShowPage',
          payload: {
            showPage: 'view',
            entity: res.data
          }
        });
        if (callback) callback(response);
      }
    },
    *removeEmpForCreat({ payload, callback }, { call, put }) {
      const response = yield call(removeEmp, payload);
      const res = yield call(getByVehicleUuid, payload.vehicleUuid);
      if (res && res.success) {
        yield put({
          type: 'onShowPage',
          payload: {
            showPage: 'create',
            entity: res.data
          }
        });
        if (callback) callback(response);
      }
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
        ...action.payload
      }
    },
    onShowPage(state, action) {
      return {
        ...state, fromView: action.fromView, ...action.payload
      }
    },
    onSaveForDispatchCenter(state, action) {
      return {
        ...state,
        vehicleList:action.payload
      }
    },
  },
}
