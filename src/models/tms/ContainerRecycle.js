import { query, get, recycleByBarcode, recycleByQty, recycleByStores,getByStoreCode } from '@/services/tms/ContainerRecycle';

export default {
    namespace: 'containerRecycle',

    state: {
        data: {
            list: [],
            pagination: {},
        },
        entity: {},
        entityUuid: '',
        showPage: 'query'
    },

    effects: {
        *query({ payload, callback }, { call, put }) {
            const response = yield call(query, payload);
            if (response.success) {
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

        *get({ payload ,callback}, { call, put }) {
            const response = yield call(get, payload);
            yield put({
                type: 'onView',
                payload: response.data
            });
          if (callback) callback(response);
        },
        *getByStoreCode({ payload ,callback}, { call, put }) {
          const response = yield call(getByStoreCode, payload);
            yield put({
            type: 'onView',
            payload: response.data
          });
          if (callback) callback(response);
        },

        *recycleByQty({ payload, callback }, { call, put }) {
            const response = yield call(recycleByQty, payload);
            if (callback) callback(response);
        },

        *recycleByBarcode({ payload, callback }, { call, put }) {
            const response = yield call(recycleByBarcode, payload);
            if (callback) callback(response);
        },
        *recycleByStores({ payload, callback }, { call, put }) {
            const response = yield call(recycleByStores, payload);
            if (callback) callback(response);
        },
        *showPage({ payload }, { call, put }) {
            yield put({
                type: 'onShowPage',
                showPage: payload.showPage,
                entityUuid: payload.entityUuid,
              fromView: payload.fromView
            });
        }

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
