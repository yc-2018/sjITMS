import { getByDcUuid,getByCodeAndDcUuid,save,modify,remove,query,get} from '@/services/out/CollectBinScheme';

export default {
  namespace: 'collectBinScheme',
  state: {
    data: {
      list: [],
      pagination: {},
    },
    entity: {},
    showPage: 'query'
  },
  effects: {
    *query({payload,callback},{call,put}){
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
      if (callback) callback(response);
    },
    *getByDcUuid({ payload }, { call, put }) {
      const response = yield call(getByDcUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'saveListSchemes',
          payload: response
        });
      }
    },
    *getByCodeAndDcUuid({payload},{call,put}) {
      const response = yield call(getByCodeAndDcUuid,payload);
      if(response && response.success){
        yield put({
          type:'onView',
          payload:response
        })
      }
    },
    *get({payload},{call,put}) {
      const response = yield call(get, payload);
      if(response && response.success){
        yield put({
          type:'onView',
          payload:response
        })
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
  },

  reducers: {
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
    onView(state,action) {
      return {
        ...state,
        entity:action.payload
      }
    },
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
        fromView: action.fromView
      }
    }
  },

};
