import {
    get,
    save,
    modify,
    remove,
    audit,
    query,
    getBinUsagesByConfigType,
    saveAndAudit, previousBill, nextBill,getByBillNumber
} from '@/services/inner/StockAdjBill';

export default {
    namespace: 'stockadj',

    state: {
        data: {
            list: [],
            pagination: {},
        },
        entity: {},
        showPage: 'query',
        adjAbleStockBillItems: {
            list: [],
            pagination: {},
        }
    },
    effects: {
        *query({ payload, callback }, { call, put }) {
            const response = yield call(query, payload);

            if (response && response.success) {
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
            }
        },

        *onSave({ payload, callback }, { call, put }) {
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

        *onModify({ payload, callback }, { call, put }) {
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

        *onRemove({ payload, callback }, { call, put }) {
            const response = yield call(remove, payload);
            if (callback) callback(response);
        },

        *onSaveAndAudit({ payload, callback }, { call, put }) {
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
        *get({ payload, callback }, { call, put }) {
            const response = yield call(get, payload);
            yield put({
                type: 'onView',
                payload: response.data
            });
          if (callback) callback(response);
        },
        *getByBillNumber({ payload, callback }, { call, put }){
            const response = yield call(getByBillNumber, payload);
            yield put({
                type: 'onView',
                payload: response.data
            });
          if (callback) callback(response);
        },
        *previousBill({ payload }, { call, put }) {
            const response = yield call(previousBill, payload);
            yield put({
              type: 'onView',
              payload: response.data
            });
          },
      
          *nextBill({ payload }, { call, put }) {
            const response = yield call(nextBill, payload);
            yield put({
              type: 'onView',
              payload: response.data
            });
          },
        *getBinUsagesByConfigType({ payload }, { call, put }) {
            const response = yield call(getBinUsagesByConfigType, payload);
            yield put({
                type: 'save',
                payload: {
                    adjBinUsages: response.data
                }
            });
        },

        *onAudit({ payload, callback }, { call, put }) {
            const response = yield call(audit, payload);
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

        *onShowReasonView({ payload, callback }, { call, put }) {
            yield put({
                type: 'onShowPage',
                showPage: 'reasonView',
            });
        },

        *onCancelReason({ payload, callback }, { call, put }) {
            yield put({
                type: 'onShowPage',
                showPage: 'query',
            });
        },

    },
    reducers: {
        save(state, action) {
            return {
                ...state,
                data: action.payload,
            };
        },
        onView(state, action) {
            return {
                ...state,
                entity: action.payload
            }
        },
        onShowPage(state, action) {
            return {
                ...state,
                showPage: action.showPage,
                entityUuid: action.entityUuid,
              fromView: action.fromView
            }
        }
    },
}
