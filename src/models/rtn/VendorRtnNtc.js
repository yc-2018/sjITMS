import {
    save, getByUuid, query, remove, audit, modify, abort,getByBillNumber,
    batchImport, generatePickUpBill, finish, copy, saveAndApprove, confirm, rollback, previousBill, nextBill
} from '@/services/rtn/VendorRtnNtc';
import { message } from 'antd';

export default {
    namespace: 'vendorRtnNtc',
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
            if (response && response.success && response.data) {
                yield put({
                    type: 'onView',
                    entity: response.data,
                });
            } else if (payload && !response.data) {
                message.error("交接单不存在!");
                yield put({
                    type: 'showPage',
                    payload: {
                        showPage: 'query'
                    }
                });
            }
        },
      *previousBill({ payload, callback }, { call, put }) {
        const response = yield call(previousBill, payload);
        yield put({
          type: 'onView',
          entity: response.data
        });
        if (callback) callback(response);
      },

      *nextBill({ payload, callback }, { call, put }) {
        const response = yield call(nextBill, payload);
        yield put({
          type: 'onView',
          entity: response.data
        });
        if (callback) callback(response);
      },
      *getByBillNumber({ payload, callback }, { call, put }) {
        const response = yield call(getByBillNumber, payload);
        if (response && response.success) {
          yield put({
            type: 'onView',
            entity: response.data,
          });
        }
        if (callback) callback(response);
      },
        *save({ payload, callback }, { call, put }) {
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
        *modify({ payload, callback }, { call, put }) {
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
        *copy({ payload, callback }, { call, put }) {
            const response = yield call(copy, payload.uuid);
            if (response && response.success && payload.isView) {
                yield put({
                    type: 'onShowPage',
                    showPage: 'view',
                    entityUuid: response.data
                });
            }
            if (callback) callback(response);
        },
        *onSaveAndApprove({ payload, callback }, { call, put }) {
            const response = yield call(saveAndApprove, payload);
            if (response && response.success) {
                yield put({
                    type: 'onShowPage',
                    showPage: 'view',
                    entityUuid: response.data
                });
            }
            if (callback) callback(response);
        },
        *remove({ payload, callback }, { call, put }) {
            const response = yield call(remove, payload);
            if (callback) callback(response);
        },
        *finish({ payload, callback }, { call, put }) {
            const response = yield call(finish, payload);
            if (callback) callback(response);
        },
        *abort({ payload, callback }, { call, put }) {
            const response = yield call(abort, payload);
            if (callback) callback(response);
        },
        *audit({ payload, callback }, { call, put }) {
            const response = yield call(audit, payload);
            if (callback) callback(response);
        },
        *confirm({ payload, callback }, { call, put }) {
            const response = yield call(confirm, payload);
            if (callback) callback(response);
        },
        *rollback({ payload, callback }, { call, put }) {
            const response = yield call(rollback, payload);
            if (callback) callback(response);
        },
        *generatePickUpBill({ payload, callback }, { call, put }) {
            const response = yield call(generatePickUpBill, payload);
            if (callback) callback(response);
        },
        *batchImport({ payload, callback }, { call, put }) {
            const response = yield call(batchImport, payload);
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
