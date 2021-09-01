import {
    save, getByUuid, getByBillNumber, query,
    remove, audit, modify, saveAndAudit,previousBill, nextBill
} from '@/services/inner/PickBinAdjBill';
import { message } from 'antd';

export default {
    namespace: 'pickBinAdjBill',
    state: {
        data: {
            list: [],
            pagination: {}
        },
        showPage: 'query',
        entity: {},
        entityUuid: '',
        billItems: [],
        stockItems: []
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
                    billItems: response.data.items
                });
            } else if (payload && !response.data) {
                message.error("拣货位调整单不存在!");
                yield put({
                    type: 'showPage',
                    payload: {
                        showPage: 'query'
                    }
                });
            }
        },
        *getByBillNumber({ payload, callback }, { call, put }){
            const response = yield call(getByBillNumber, payload);
            if (response && response.success && response.data) {
                yield put({
                    type: 'onView',
                    entity: response.data,
                    billItems: response.data.items
                });
            }
            if(callback) callback(response);
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
                    entityUuid: response.data
                });
            }
            if (callback) callback(response);
        },
        *saveAndAudit({ payload, callback }, { call, put }) {
            const response = yield call(saveAndAudit, payload);
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
        *audit({ payload, callback }, { call, put }) {
            const response = yield call(audit, payload);
            if (callback) callback(response);
        },
      *previousBill({ payload }, { call, put }) {
        const response = yield call(previousBill, payload);
        yield put({
          type: 'onView',
          entity: response.data
        });
      },

      *nextBill({ payload }, { call, put }) {
        const response = yield call(nextBill, payload);
        yield put({
          type: 'onView',
          entity: response.data
        });
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
                entity: action.entity,
                billItems: action.billItems
            };
        }
    },
}
