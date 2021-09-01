import {
  getOwnerByCompanyUuid, save, onLine, offLine, get,getByCode, modify, query, getDefOwner,batchImport,
  queryOwnerVendors,queryOwnerStores,saveOwnerStore,saveOwnerVendor,
  offLineForStore,offLineForVendor,onLineForStore,onLineForVendor,
  removeOwnerStore,removeOwnerVendor
} from '@/services/basic/Owner';

export default {
  namespace: 'owner',
  subscriptions: {
    /**
     * 监听浏览器地址
     * @param dispatch 触发器，用于触发 effects 中的 query 方法
     * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
     */
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if(location.payload && location.pathname == "/basic/owner"){
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
    showPage: 'query',
    entity: {}
  },

  effects: {
    *query({ payload }, { call, put }) {
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
    *getOwnerByCompanyUuid({ payload, callback }, { call, put }) {
      const response = yield call(getOwnerByCompanyUuid, payload);
      if (callback) callback(response);
      if (response && response.success) {
        yield put({
          type: 'save',
          ownerList: response.data
        });
      }
    },
    *getDefOwner({ payload, callback }, { call, put }) {
      const response = yield call(getDefOwner, payload);
      if (response && response.success && response.data) {
        localStorage.setItem(
          window.location.hostname + '-owner',
          JSON.stringify({
            uuid: response.data.uuid,
            code: response.data.code,
            name: response.data.name,
          })
        );
      }
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
    *onSaveOwnerStore({ payload, callback }, { call, put }) {
      const response = yield call(saveOwnerStore, payload);
      if (callback) callback(response);
    },
    *onSaveOwnerVendor({ payload, callback }, { call, put }) {
      const response = yield call(saveOwnerVendor, payload);
      if (callback) callback(response);
    },
    *queryOwnerStores({ payload, callback }, { call, put }) {
      const response = yield call(queryOwnerStores, payload);
      if (response && response.success) {
        yield put({
          type: 'onSaveStores',
          payload: response.data,
          ownerUuid: payload
        });
      }
      if (callback) callback(response);
    },
    *queryOwnerVendors({ payload, callback }, { call, put }) {
      const response = yield call(queryOwnerVendors, payload);
      if (response && response.success) {
        yield put({
          type: 'onSaveVendors',
          payload: response.data,
          ownerUuid: payload
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
    *onLine({ payload, callback }, { call, put }) {
      const response = yield call(onLine, payload);
      if (callback) callback(response);
    },
    *offLine({ payload, callback }, { call, put }) {
      const response = yield call(offLine, payload);
      if (callback) callback(response);
    },
    *onLineForStore({ payload, callback }, { call, put }) {
      const response = yield call(onLineForStore, payload);
      if (callback) callback(response);
    },
    *offLineForStore({ payload, callback }, { call, put }) {
      const response = yield call(offLineForStore, payload);
      if (callback) callback(response);
    },
    *onLineForVendor({ payload, callback }, { call, put }) {
      const response = yield call(onLineForVendor, payload);
      if (callback) callback(response);
    },
    *offLineForVendor({ payload, callback }, { call, put }) {
      const response = yield call(offLineForVendor, payload);
      if (callback) callback(response);
    },
    *onRemoveOwnerStore({ payload, callback }, { call, put }) {
      const response = yield call(removeOwnerStore, payload);
      if (callback) callback(response);
    },
    *onRemoveOwnerVendor({ payload, callback }, { call, put }) {
      const response = yield call(removeOwnerVendor, payload);
      if (callback) callback(response);
    },
    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data ? response.data : {}
        });
      }
      if (callback) callback(response);
    },
    *getByCode({ payload, callback }, { call, put }) {
      const response = yield call(getByCode, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data ? response.data : {}
        });
      }
      if (callback) callback(response);
    },
    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
      if (callback) callback(response);
    },
    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid,
        importType: payload.importType,
        fromView: payload.fromView
      });
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
        ownerList: action.ownerList
      };
    },
    onSaveVendors(state, action) {
      return {
        ...state,
        vendors: action.payload,
        ownerUuid: action.ownerUuid
      };
    },
    onSaveStores(state, action) {
      return {
        ...state,
        stores: action.payload,
        ownerUuid: action.ownerUuid
      };
    },
    onView(state, action) {
      return {
        ...state,
        entity: action.entity
      }
    },
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
        importType: action.importType,
        fromView: action.fromView
      }
    }
  },
};
