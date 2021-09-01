import { query,add,remove,update,get,queryValid,inValid} from '@/services/inner/SuperManagement';

export default {
  namespace: 'supermanagement',

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
    *onSave({ payload, callback }, { call, put }) {
      const response = yield call(add, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'view',
          entityUuid: response.data
        });
      }
      if (callback) callback(response);
    },

    *onRemove({ payload, callback }, { call, put }) {
      const response = yield call(remove, payload);
      if (callback) callback(response);
    },

    *inValid({ payload, callback }, { call, put }) {
      const response = yield call(inValid, payload);
      if (callback) callback(response);
    },

    *onModify({ payload, callback }, { call, put }) {
      const response = yield call(update, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'view',
          entityUuid: payload.uuid
        });
      }
      if (callback) callback(response);
    },

    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid,
      });
    },


    
    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          payload: response.data ? response.data : {}
        });
      }
    },

    *queryValid({ payload, callback }, { call, put }) {
      const response = yield call(queryValid, payload);
      if (response.success) {
        // yield put({
        //   type: 'save',
        //   payload: {
        //     list: response.data.records ? response.data.records : [],
        //     pagination: {
        //       total: response.data.paging.recordCount,
        //       pageSize: response.data.paging.pageSize,
        //       current: response.data.page + 1,
        //       showTotal: total => `共 ${total} 条`,
        //     },
        //   },
        // });
      }
      if (callback) callback(response);
    },


    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid,
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
    onView(state, action) {
      return {
        ...state,
        entity: action.payload,
      }
    },
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid
      }
    }
  },
}