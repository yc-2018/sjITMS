import {
    save, query, remove
} from '@/services/facility/VendorPickerScopeConfig';

export default {
    namespace: 'vendorPickerConfig',

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
        *save({ payload, callback }, { call, put }) {
            const response = yield call(save, payload);
            if (callback) callback(response);
        },
        *remove({ payload, callback }, { call, put }) {
            const response = yield call(remove, payload);
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