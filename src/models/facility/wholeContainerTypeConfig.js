import {
    save, get, modify, query, remove
} from '@/services/facility/WholeContainerTypeConfig';

export default {
    namespace: 'wholecontainertypeconfig',

    state: {
        data: {
            list: [],
            pagination: {}
        }
    },

    effects: {
        *query({ payload }, { call, put }) {
            const response = yield call(query, payload);
            if (response.success) {
                yield put({
                    type: 'success',
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
        *remove({ payload, callback }, { call, put }) {
            const response = yield call(remove, payload);
            if (callback) callback(response);
        }
    },

    reducers: {
        success(state, action) {
          return {
            ...state,
            data: action.payload,
          };
        },
    }
};