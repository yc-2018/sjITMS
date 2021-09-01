import {
  save, saveOrder, saveItem, remove, removeOrder, removeItem, 
  modify, modifyOrder, modifyScheme, listSchemes, listOrders, getItemBySchemeUuid,
  getScheme, getOrder, adjust, downAdjust, query,getStoreUCN,batchImport,queryOrders
} from '@/services/out/StorePickOrder';

export default {
  namespace: 'storepickorder',
  state: {
    data: {
      list: [],
      pagination: {},
    },
    showPage: 'query'
  },
  effects: {
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: {
            list: response.data.records,
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
    *onSave({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },
    *onSaveOrder({ payload, callback }, { call, put }) {
      const response = yield call(saveOrder, payload);
      if (callback) callback(response);
    },
    *onSaveItem({ payload, callback }, { call, put }) {
      const response = yield call(saveItem, payload);
      if (callback) callback(response);
    },

    *onRemove({ payload, callback }, { call, put }) {
      const response = yield call(remove, payload);
      if (callback) callback(response);
    },
    *queryOrders({ payload, callback }, { call, put }) {
      const response = yield call(queryOrders, payload);
      if (callback) callback(response);
    },
    *onRemoveOrder({ payload, callback }, { call, put }) {
      const response = yield call(removeOrder, payload);
      if (callback) callback(response);
    },
    *onRemoveItem({ payload, callback }, { call, put }) {
      const response = yield call(removeItem, payload);
      if (callback) callback(response);
    },

    *onModify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (callback) callback(response);
    },
    *onModifyOrder({ payload, callback }, { call, put }) {
      const response = yield call(modifyOrder, payload);
      if (callback) callback(response);
    },
    *onModifyScheme({ payload, callback }, { call, put }) {
      const response = yield call(modifyScheme, payload);
      if (callback) callback(response);
    },

    *listSchemes({ payload }, { call, put }) {
      const response = yield call(listSchemes, payload);
      if (response && response.success) {
        yield put({
          type: 'saveListSchemes',
          payload: response.data ? response.data:[]
        });
      }
    },
    *listOrders({ payload }, { call, put }) {
      const response = yield call(listOrders, payload);
      if (response && response.success) {
        yield put({
          type: 'saveListOrders',
          payload: response
        });
      }
    },
    *getItemBySchemeUuid({ payload }, { call, put }) {
      const response = yield call(getItemBySchemeUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'saveListItems',
          payload: response
        });
      }
    },
    *getScheme({ payload }, { call, put }) {
      const response = yield call(getScheme, payload);
      if (response && response.success) {
        yield put({
          type: 'saveScheme',
          entity: response.data
        });
      }
    },
    *getOrder({ payload }, { call, put }) {
      const response = yield call(getOrder, payload);
      if (response && response.success) {
        yield put({
          type: 'saveOrder',
          entity: response.data
        });
      }
    },
    *adjust({ payload, callback }, { call, put }) {
      const response = yield call(adjust, payload);
      if (callback) callback(response);
    },
    *onShowSchemeView({ payload, callback }, { call, put}){
      yield put({
        type: 'onShowPage',
        showPage: 'pickOrderSchemeView',
      });
    },
    *onCancelSchemeView({ payload, callback }, { call, put}) {
      yield put({
        type: 'onShowPage',
        showPage: 'query',
      });
    },
    *getStoreUCN({payload,callback},{call,put}){
      const response = yield call(getStoreUCN,payload);
      yield put({
        type:'saveStores',
        payload: response.data
      })
    },
    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        importAllocateOrderUuid: payload.importAllocateOrderUuid
      });
    },
    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
      if (callback) callback(response);
    }
  },

  reducers: {
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
        importTemplateUrl: action.importTemplateUrl,
        importType: action.importType,
        importAllocateOrderUuid: action.importAllocateOrderUuid
      }
    },
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    saveListSchemes(state, action) {
      return {
        ...state,
        listSchemes: action.payload,
      };
    },
    saveListOrders(state,action){
      return {
        ...state,
        listOrders: action.payload,
      };
    },
    saveListItems(state, action) {
      return {
        ...state,
        listItems: action.payload,
      };
    },
    saveScheme(state, action) {
      return {
        ...state,
        schemeEntity: action.entity,
      };
    },
    saveOrder(state, action) {
      return {
        ...state,
        orderEntity: action.payload,
      };
    },
    saveStores(state,action){
      return{
        ...state,
        stores:action.payload
      }
    },
  },

};
