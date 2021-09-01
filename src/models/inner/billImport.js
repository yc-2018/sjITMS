import {
    save,
    modify,
    query,
    get,
    remove,
    getBillFieldItems,
    getByOwnerAndBillType,
    billImport
} from '@/services/inner/BillImport';
import { object } from 'prop-types';

export default {
    namespace: 'billImport',

    state: {
        data: {
            list: [],
            pagination: {}
        },
        fieldItems: [],
        showPage: 'home'
    },

    effects: {
        *showPage({ payload }, { call, put }) {
            yield put({
                type: 'onShowPage',
                ...payload,
            });
        },
        *clearFieldItems({ payload }, { call, put }) {
            yield put({
                type: 'saveFieldItems',
                payload: []
            });
        },
        *add({ payload, callback }, { call, put }) {
            const response = yield call(save, payload);
            if (response && response.success) {
                yield put({
                    type: 'saveFieldItems',
                    payload: []
                });
            }
            if (callback) callback(response);
        },
        *modify({ payload, callback }, { call, put }) {
            const response = yield call(modify, payload);
            if (response && response.success) {
                yield put({
                    type: 'saveFieldItems',
                    payload: []
                });
            }
            if (callback) callback(response);
        },
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
        *get({ payload, callback }, { call, put }) {
            const response = yield call(get, payload);
            if (response && response.success) {
                yield put({
                    type: 'success',
                    payload: {
                        entity: response.data
                    }
                });
            }
        },
        *getByOwnerAndBillType({ payload, callback }, { call, put }) {
            const response = yield call(getByOwnerAndBillType, payload);
            if (response && response.success) {
                yield put({
                    type: 'success',
                    payload: {
                        entity: response.data
                    }
                });
            }
        },
        *remove({ payload, callback }, { call, put }) {
            const response = yield call(remove, payload);
            if (callback) callback(response);
        },
        *getBillFieldItems({ payload, callback }, { call, put }) {
            const response = yield call(getBillFieldItems, payload);
            if (response && response.success) {
                yield put({
                    type: 'saveFieldItems',
                    payload: response.data
                });
            }
        },
        *billImport({ payload, callback }, { call, put }) {
            const response = yield call(billImport, payload);
            if (callback) callback(response);
        },
        *clearImportInfo({ payload }, { call, put }) {
            let initialImportInfo = {
                showPage: 'home',
                entityUuid: undefined,
                owner: undefined,
                billType: undefined,
                data: { entity: {} },
            };

            yield put({
                type: 'onInitialImportInfo',
                ...initialImportInfo,
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
        saveFieldItems(state, action) {
            return {
                ...state,
                fieldItems: action.payload,
            };
        },
        onShowPage(state, action) {
            return {
                ...state,
                showPage: action.showPage,
                entityUuid: action.entityUuid,
                owner: action.owner,
                billType: action.billType
            }
        },
        onInitialImportInfo(state, action) {
            return {
                ...state,
                ...action,
            }
        },
    }
}