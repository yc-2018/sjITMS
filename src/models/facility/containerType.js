import {
    save,
    modify,
    query,
    get,
    getByCode,
    getByCompanyAndDc,
    remove
} from '@/services/facility/ContainerType';

export default {
    namespace: 'containerType',

    subscriptions: {
        /**
         * ???????
         * @param dispatch ???????? effects ?? query ??
         * @param history ?????????????? location ??????????
         */
        setup({ dispatch, history }) {
            history.listen((location) => {
                if (location.payload && location.pathname == '/facility/containerType') {
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
            pagination: {}
        },
        showPage: 'query',
    },

    effects: {
        *showPage({ payload }, { call, put }) {
            yield put({
                type: 'onShowPage',
                showPage: payload.showPage,
                entityUuid: payload.entityUuid,
                fromView: payload.fromView,
                entity: payload.entity,
            });
        },
        *add({ payload, callback }, { call, put }) {
            const response = yield call(save, payload);
            if (callback) callback(response);
        },
        *modify({ payload, callback }, { call, put }) {
            const response = yield call(modify, payload);
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
                    type: 'getOnView',
                    payload: response.data,
                });
            }
        },
        *getByCompanyAndDc({ payload, callback }, { call, put }) {
            const response = yield call(getByCompanyAndDc, payload);
            if (response && response.success) {
                yield put({
                    type: 'success',
                    payload: {
                        list: response.data
                    }
                });
            }
        },
        *remove({ payload, callback }, { call, put }) {
            const response = yield call(remove, payload);
            if (callback) callback(response);
        },
      *getByCode({ payload, callback }, { call, put }) {
        const response = yield call(getByCode, payload);
        if (response && response.success) {
          yield put({
            type: 'getOnView',
            payload: response.data
          });
        }
        if (callback) callback(response);
      },
    },

    reducers: {
        success(state, action) {
            return {
                ...state,
                data: action.payload,
            };
        },
        getOnView(state, action) {
          return {
            ...state,
            entity: action.payload,
          };
        },
        onShowPage(state, action) {
            return {
                ...state,
                showPage: action.showPage,
                entity: action.entity,
                entityUuid: action.entityUuid,
                fromView: action.fromView
            }
        },
    }
}
