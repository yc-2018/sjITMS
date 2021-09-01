import {
    save, get, getByDcUuid,getByCodeAndDcUuid, modify, query, remove
} from '@/services/facility/BinType';

export default {
    namespace: 'binType',
    subscriptions: {
        /**
         * 监听浏览器地址
         * @param dispatch 触发器，用于触发 effects 中的 query 方法
         * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
         */
        setup ({ dispatch, history }) {
          history.listen((location) => {
            if(location.payload && location.pathname == "/facility/binType"){
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
        entity: {}
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
            const response = yield call(get, payload);
            if (response && response.success) {
                yield put({
                    type: 'onView',
                    entity: response.data
                });
            }
            if (callback) callback(response);
        },
        *add({ payload, callback }, { call, put }) {
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
        *onSaveAndCreate({ payload, callback }, { call, put }) {
            const response = yield call(save, payload);
            if (response && response.success) {
                yield put({
                    type: 'onShowPage',
                    showPage: 'create'
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
        *remove({ payload, callback }, { call, put }) {
            const response = yield call(remove, payload);
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
        *getByCodeAndDcUuid({ payload, callback }, { call, put }) {
          const response = yield call(getByCodeAndDcUuid, payload);
          if (response && response.success) {
            yield put({
              type: 'onView',
              entity: response.data
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
};
