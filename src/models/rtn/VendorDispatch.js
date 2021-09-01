import {
    getByUuid, query, getByVendorUuid, genPickupBillByVendor, genPickupBillByContainer
} from '@/services/rtn/VendorDispatch';
import { message } from 'antd';

export default {
    namespace: 'vendorDispatch',
    state: {
        data: {
            list: [],
            pagination: {}
        },
        showPage: 'query',
        entity: {},
        entityUuid: ''
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
        *get({ payload, callback }, { call, put }) {
            const response = yield call(getByUuid, payload);
            if (response && response.success) {
                yield put({
                    type: 'onView',
                    entity: response.data,
                });
            }
          if (callback) callback(response);
        },
        *getByVendor({ payload, callback }, { call, put }) {
            const response = yield call(getByVendorUuid, payload);
            if (response && response.success) {
                yield put({
                    type: 'onView',
                    entity: response.data,
                });
            }
        },
        *genPickupBillByContainer({ payload, callback }, { call, put }) {
            const response = yield call(genPickupBillByContainer, payload);
            if (callback) callback(response);
        },
        *genPickupBillByVendor({ payload, callback }, { call, put }) {
            const response = yield call(genPickupBillByVendor, payload);
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
        success(state, action) {
            return {
                ...state,
                data: action.payload,
            };
        },
        onShowPage(state, action) {
            return {
                ...state,
                showPage: action.showPage,
                entityUuid: action.entityUuid,
              fromView: action.fromView
            }
        },
        onView(state, action) {
            return {
                ...state,
                entity: action.entity
            };
        }
    },
}
