import {
    query, add, remove,queryPlanConfig,update,getByCompanyUuid,insert
} from '@/services/tms/DispatcherConfig';

export default {
    namespace: 'dispatcherconfig',

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
            const response = yield call(add, payload);
            if (callback) callback(response);
        },
        *remove({ payload, callback }, { call, put }) {
            const response = yield call(remove, payload);
            if (callback) callback(response);
        },
        *queryPlanConfig({ payload }, { call, put }) {
            const response = yield call(queryPlanConfig, payload);
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
        *update({payload,callback}, { call, put }) {
            const response = yield call(update, payload);
            if (callback) callback(response);
        },
        *insert({payload,callback}, { call, put }) {
            const response = yield call(insert, payload);
            if (callback) callback(response);
        },
        *getByCompanyUuid({payload,callback}, { call, put }) {
            const response = yield call(getByCompanyUuid, payload);
            if(response.success){
                yield put({
                    type:'getByCompanyUuid',
                    payload:response.data
                })
            }
        },
    },

    reducers: {
        success(state, action) {
            return {
                ...state,
                data: action.payload,
            };
        },
        getByCompanyUuid(state, action) {
            return {
                ...state,
                dispatchData: action.payload,
            };
        },
    }
};