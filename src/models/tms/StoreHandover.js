import { query, get, modify, dcconfirm, getByBillNumber, previousBill, nextBill } from '@/services/tms/StoreHandover';

export default {
    namespace: 'storeHandover',
    subscriptions: {
        /**
         * ???????
         * @param dispatch ???????? effects ?? query ??
         * @param history ?????????????? location ??????????
         */
        setup ({ dispatch, history }) {
          history.listen((location) => {
            if(location.payload && location.pathname == "/tms/storeHandoverbill"){
              dispatch({
                type: 'showPage',
                payload: location.payload,
              })
            }
          });
        },
      },
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

        *get({ payload }, { call, put }) {
            const response = yield call(get, payload);
            yield put({
                type: 'onView',
                payload: response.data
            });
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

        *getByBillNumber({ payload, callback }, { call, put }) {
            const response = yield call(getByBillNumber, payload);
            yield put({
                type: 'onView',
                payload: response.data ? response.data : {},
            });
            if (callback) callback(response);
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

        *modify({ payload, callback }, { call, put }) {
            const response = yield call(modify, payload);
            if (callback) callback(response);
        },

        *onDCConfirm({ payload, callback }, { call, put }) {
            const response = yield call(dcconfirm, payload);
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
