import { 
  queryScheme,saveScheme,modifyScheme,removeScheme,getScheme,isDef,
  queryAllocateOrder,getAllocateOrder,saveAllocateOrder,modifyAllocateOrder,removeAllocateOrder,
  saveAllocateOrderItem, queryAllocateOrderItem, adjust, removeAllocateOrderItem,getStoreUCN,batchImport
} from '@/services/out/StockOrder';

export default {
  namespace: 'stockAllocateOrder',
  state: {
    showPage:'query',
    data:[],
    allocateOrders:[],
    allocateOrderItems:[]
  },
  effects: {
    *queryScheme({ payload }, { call, put }) {
      const response = yield call(queryScheme, payload);
      if (response && response.success) {
        yield put({
          type: 'saveListSchemes',
          payload: response.data ? response.data :[]
        });
      }
    },
    *saveScheme({ payload, callback }, { call, put }) {
      const response = yield call(saveScheme, payload);
      if(callback) callback(response);
    },
    *modifyScheme({ payload, callback }, { call, put }) {
      const response = yield call(modifyScheme, payload);
      if(callback) callback(response);
    },
    *removeScheme({ payload, callback }, { call, put }) {
      const response = yield call(removeScheme, payload);
      if(callback) callback(response);
    },
    *getScheme({ payload, callback }, { call, put }) {
      const response = yield call(getScheme, payload);
      if (response && response.success) {
        yield put({
          type: 'saveStockScheme',
          payload: response.data
        });
      }
      if(callback) callback(response);
    },
    *isDef({ payload, callback }, { call, put }) {
      const response = yield call(isDef, payload);
      if(callback) callback(response);
    },
    *queryAllocateOrder({ payload }, { call, put }) {
      const response = yield call(queryAllocateOrder, payload);
      if (response && response.success) {
        yield put({
          type: 'saveAllocateOrders',
          payload: response.data ? response.data : []
        });
      }
    },
    *getAllocateOrder({ payload}, { call, put }) {
      const response = yield call(getAllocateOrder, payload);
      if (response && response.success) {
        yield put({
          type: 'saveAllocateOrder',
          payload: response.data
        });
      }
    },
    *saveAllocateOrder({ payload, callback }, { call, put }) {
      const response = yield call(saveAllocateOrder, payload);
      if(callback) callback(response);
    },
    *modifyAllocateOrder({ payload, callback }, { call, put }) {
      const response = yield call(modifyAllocateOrder, payload);
      if(callback) callback(response);
    },
    *removeAllocateOrder({ payload, callback }, { call, put }) {
      const response = yield call(removeAllocateOrder, payload);
      if(callback) callback(response);
    },
    *saveAllocateOrderItem({ payload, callback }, { call, put }) {
      const response = yield call(saveAllocateOrderItem, payload);
      if(callback) callback(response);
    },
    *queryAllocateOrderItem({ payload }, { call, put }) {
      const response = yield call(queryAllocateOrderItem, payload);
      if (response && response.success) {
        yield put({
          type: 'saveAllocateOrderItems',
          payload: {
            list: response.data.records ? response.data.records : [],
            pagination: {
              total: response.data.paging.recordCount,
              pageSize: response.data.paging.pageSize,
              current: response.data.page + 1,
              showTotal: total => `共 ${total}条`,
            }
          },
        });
      }
    },
    *adjust({ payload, callback }, { call, put }) {
      const response = yield call(adjust, payload);
      if(callback) callback(response);
    },
    *removeAllocateOrderItem({ payload, callback }, { call, put }) {
      const response = yield call(removeAllocateOrderItem, payload);
      if(callback) callback(response);
      },        
    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        importAllocateOrderUuid: payload.importAllocateOrderUuid,
        fromView: payload.fromView
      });
    },

    *getStoreUCN({payload,callback},{call,put}){
      const response = yield call(getStoreUCN,payload);
      yield put({
        type:'saveStores',
        payload: response.data
      })
    },
    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
      if (callback) callback(response);
    }
  },

  reducers: {
    saveListSchemes(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    saveStockScheme(state, action) {
      return {
        ...state,
        stockScheme: action.payload,
      };
    },
    saveAllocateOrders(state, action) {
      return {
        ...state,
        allocateOrders: action.payload,
      };
    },
    saveAllocateOrder(state, action) {
      return {
        ...state,
        allocateOrder: action.payload,
      };
    },
    saveAllocateOrderItems(state, action) {
      return {
        ...state,
        allocateOrderItems: action.payload,
      };
    },
    saveStores(state,action){
      return{
        ...state,
        stores:action.payload
      }
    },
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        importTemplateUrl: action.importTemplateUrl,
        importType: action.importType,
        importAllocateOrderUuid: action.importAllocateOrderUuid,
        fromView: action.fromView

      }
    },
  },

};
