import { query, get, save, modify, remove, offline, online, getClassGroupUserByUuid, modifyClassGroupUser, deleteClassGroupUser,
  modifyClassGroupVehicle, deleteClassGroupVehicle, modifyClassGroupCustomer, deleteClassGroupCustomer, getByCode } from '@/services/tms/Team';

export default {
  namespace: 'team',
  subscriptions: {
    /**
     * 监听浏览器地址
     * @param dispatch 触发器，用于触发 effects 中的 query 方法
     * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
     */
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if(location.payload && location.pathname == "/basic/team"){
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

    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      yield put({
        type: 'onView',
        payload: response.data
      });
      if (callback) callback(response);
    },

    *getByCode({ payload, callback }, { call, put }) {
      const response = yield call(getByCode, payload);
      yield put({
        type: 'onView',
        payload: response.data
      });
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
          showPage: 'create',
          entityUuid: undefined,
          entity: {}
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

    *onRemove({ payload, callback }, { call, put }) {
      const response = yield call(remove, payload);
      if (callback) callback(response);
    },

    *online({ payload, callback }, { call, put }) {
      const response = yield call(online, payload);
      if (callback) callback(response);
    },

    *offline({ payload, callback }, { call, put }) {
      const response = yield call(offline, payload);
      if (callback) callback(response);
    },

    *getClassGroupUserByUuid({ payload, callback }, { call, put }) {
      const response = yield call(getClassGroupUserByUuid, payload);
      if (callback) callback(response);
    },

    *modifyClassGroupUser({ payload, callback }, { call, put }) {
      const response = yield call(modifyClassGroupUser, payload);
      if (callback) callback(response);
    },

    *deleteClassGroupUser({ payload, callback }, { call, put }) {
      const response = yield call(deleteClassGroupUser, payload);
      if (callback) callback(response);
    },

    *modifyClassGroupVehicle({ payload, callback }, { call, put }) {
      const response = yield call(modifyClassGroupVehicle, payload);
      if (callback) callback(response);
    },

    *deleteClassGroupVehicle({ payload, callback }, { call, put }) {
      const response = yield call(deleteClassGroupVehicle, payload);
      if (callback) callback(response);
    },
    *modifyClassGroupCustomer({ payload, callback }, { call, put }) {
      const response = yield call(modifyClassGroupCustomer, payload);
      if (callback) callback(response);
    },

    *deleteClassGroupCustomer({ payload, callback }, { call, put }) {
      const response = yield call(deleteClassGroupCustomer, payload);
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
  },
}
