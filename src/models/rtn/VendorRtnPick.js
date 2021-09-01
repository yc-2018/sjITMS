import {
    getByUuid, query, alterMethod, alterPicker, getByBillNumber,audit, auditWhole, previousBill, nextBill
} from '@/services/rtn/VendorRtnPick';
import { message } from 'antd';

export default {
    namespace: 'vendorRtnPick',
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
        *alterMethod({ payload, callback }, { call, put }) {
            const response = yield call(alterMethod, payload);
            if (callback) callback(response);
        },
        *alterPicker({ payload, callback }, { call, put }) {
            const response = yield call(alterPicker, payload);
            if (callback) callback(response);
        },
        *audit({ payload, callback }, { call, put }) {
            const response = yield call(audit, payload);
            if (callback) callback(response);
        },
        *auditWhole({ payload, callback }, { call, put }) {
            const response = yield call(auditWhole, payload);
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
