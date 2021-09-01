import { query,save,modify,remove,get } from '@/services/facility/ReleaseContentConfig';
  
  export default {
    namespace: 'releasecontentconfig',
  
    state: {
        data: {
            list: [],
            pagination: {},
        },
        showPage: 'query'
    },
  
    effects: {
        *query({ payload }, { call, put }) {
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
          },
        *add({ payload, callback }, { call, put }) {
            const response = yield call(save, payload);
            if (callback) callback(response);
        },
        *modify({ payload, callback }, { call, put }) {
            const response = yield call(modify, payload);
            if (callback) callback(response);
        },
        *remove({ payload, callback }, { call, put }) {
            const response = yield call(remove, payload);
            if (callback) callback(response)
        },
        *get({ payload, callback }, { call, put }) {
            const response = yield call(get, payload);
            if (response && response.success) {
                yield put({
                  type: 'view',
                  entity: response.data,
                });
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
      view(state, action) {
        return {
          ...state,
          entity: action.payload,
        };
      },
    }
  }