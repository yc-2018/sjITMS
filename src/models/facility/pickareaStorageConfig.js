import {
    save, getByDCUuidAndPickareaUuid, query, remove, modify
} from '@/services/facility/PickareaStorageConfig';

export default {
    namespace: 'pickareaStorageConfig',

    state: {
        data: {
            list: [],
            pagination: {}
        },
    },

    effects: {
        *query({ payload }, { call, put }) {
            const response = yield call(query, payload);
            if (response && response.success) {
                yield put({
                    type: 'success',
                    payload: {
                        list: response.data && response.data.records ? response.data.records : [],
                        pagination: {
                            total: response.data && response.data.paging && response.data.paging.recordCount ? response.data.paging.recordCount : 0,
                            pageSize: response.data && response.data.paging && response.data.paging.pageSize ? response.data.paging.pageSize : 20,
                            current: response.data && response.data.page ? response.data.page + 1 : 1,
                            showTotal: total => `共 ${total} 条`,
                        },
                    },
                });
            }
        },
        *save({ payload, callback }, { call, put }) {
            const response = yield call(save, payload);
            if (callback) callback(response);
        },
        *remove({ payload, callback }, { call, put }) {
            const response = yield call(remove, payload);
            if (callback) callback(response);
        },
        *modify({ payload, callback }, { call, put }) {
          const response = yield call(modify, payload);
          if (callback) callback(response);
        },
        *getByDCUuidAndPickareaUuid({ payload, callback }, { call, put }) {
          const response = yield call(getByDCUuidAndPickareaUuid, payload);
          if (callback) callback(response);
        },
        *onCancel({ payload, callback }, { call, put }) {
            yield put({
                type: 'success',
                payload: {
                    showDetailView: false,
                    showDetailEditForm: false
                }
            });
            if (callback) callback();
        },
        *onViewCreate({ payload, callback }, { call, put }) {
            yield put({
                type: 'success',
                payload: {
                    showEditView: true,
                    binType: payload
                }
            });
        },
        *onViewDetail({ payload, callback }, { call, put }) {
            yield put({
                type: 'success',
                payload: {
                    showDetailView: true,
                    binType: payload,
                }
            });
        },
    },

    reducers: {
        success(state, action) {
            return {
                ...state,
                data: action.payload,
            };
        },
    },
};
