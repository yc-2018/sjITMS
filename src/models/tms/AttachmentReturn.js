import { query, queryReturns,modify,batchSave,remove,save } from '@/services/tms/AttachmentReturn';

export default {
    namespace: 'attachmentReturn',

    state: {
        data: {
            list: [],
            pagination: {},
        },
        entity: {},
        entityUuid: '',
        showPage: 'query'
    },

    effects: {
        *showPage({ payload }, { call, put }) {
            yield put({
                type: 'onShowPage',
                showPage: payload.showPage,
                // entityUuid: payload.entityUuid,
                record: payload.record,
              fromView: payload.fromView
            });
        },
        *onModify({ payload, callback }, { call, put }) {
            const response = yield call(modify, payload);
            if (callback) callback(response);
        },
        *onSave({ payload, callback }, { call, put }) {
            const response = yield call(save, payload);
            if (callback) callback(response);
        },
        *onRemove({ payload, callback }, { call, put }) {
            const response = yield call(remove, payload);
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
      
        *queryReturns({ payload, callback }, { call, put }) {
            const response = yield call(queryReturns, payload);
            if (response && response.success) {
              yield put({
                type: 'saveReturns',
                payload:response.data,
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
        saveReturns(state, action) {
            return {
                ...state,
                returns: action.payload
            }
        },
        onShowPage(state, action) {
            return {
                ...state,
                showPage: action.showPage,
                // entityUuid: action.entityUuid
                record: action.record,
              fromView: action.fromView
            }
        }
    },
}
