import {
    get,
    save,
    modify,
    remove,
    audit,
    query,
    queryIncBins,
    queryIncContainers,
    saveAndApprove,
    getByBillNumber,
    // getImportTemplateUrl,
    batchImport, previousBill, nextBill
} from '@/services/inner/IncInv';

export default {
    namespace: 'inc',

    state: {
        data: {
            list: [],
            pagination: {},
        },
        entity: {},
        showPage: 'query'
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

        *onSaveAndCreate({ payload, callback }, { call, put }) {
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

        *get({ payload }, { call, put }) {
            const response = yield call(get, payload);
            yield put({
                type: 'onView',
                payload: response.data ? response.data : {}
            });
        },
        *getByBillNumber({ payload,callback }, { call, put }){
            const response = yield call(getByBillNumber, payload);
            yield put({
                type: 'onView',
                payload: response.data ? response.data : {}
            });
            if(callback) callback(response);
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
        *onAudit({ payload, callback }, { call, put }) {
            const response = yield call(audit, payload);
            if (callback) callback(response);
        },

        *queryIncBins({ payload }, { call, put }) {
            const response = yield call(queryIncBins, payload);
            yield put({
                type: 'onQueryIncBins',
                payload: response.data
            });
        },

        *queryIncContainers({ payload }, { call, put }) {
            const response = yield call(queryIncContainers, payload);
            yield put({
                type: 'onQueryIncContainers',
                payload: response.data
            });
        },
        // *getImportTemplateUrl({ payload, callback }, { call, put }) {
        //     const response = yield call(getImportTemplateUrl, payload);
        //     if (callback) callback(response);
        // },
        *batchImport({ payload, callback }, { call, put }) {
            const response = yield call(batchImport, payload);
            if (callback) callback(response);
        },
        *showPage({ payload }, { call, put }) {
            yield put({
                type: 'onShowPage',
                showPage: payload.showPage,
                entityUuid: payload.entityUuid,
                importTemplateUrl: payload.importTemplateUrl,
                fromView: payload.fromView
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
                // importTemplateUrl: action.importTemplateUrl
            }
        },
        onQueryIncBins(state, action) {
            return {
                ...state,
                bins: action.payload
            }
        },
        onQueryIncContainers(state, action) {
            return {
                ...state,
                containers: action.payload
            }
        },
    }
}
