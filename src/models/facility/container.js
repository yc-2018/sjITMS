import {
    query,
    save,
    get,
    getContainerArts,
    queryIdleAndThisPostionUseing
} from '@/services/facility/Container';

export default {
    namespace: 'container',
    subscriptions: {
        /**
         * 监听浏览器地址
         * @param dispatch 触发器，用于触发 effects 中的 query 方法
         * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
         */
        setup({ dispatch, history }) {
          history.listen((location) => {
            if (location.payload && '-' !== location.payload.entityUuid && location.pathname == '/facility/container') {
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
        entity: {},
        starBarcode: '',
        containers: [],
        containerarts: [],
        showPage: 'query',
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
            if (callback) callback(response);
        },
        *queryIdleAndThisPostionUseing({ payload, callback }, { call, put }) {
            const response = yield call(queryIdleAndThisPostionUseing, payload);
            if (response.success) {
                yield put({
                    type: 'success',
                    containers: response.data
                });
            }
          if (callback) callback(response);
        },
        *onSave({ payload, callback }, { call, put }) {
            const response = yield call(save, payload);
            if (response && response.success) {
                yield put({
                    type: 'onShowPage',
                    showPage: 'query'
                });
            }
            if (callback) callback(response);
        },

        *get({ payload, callback }, { call, put }) {
            const response = yield call(get, payload);
            if (response && response.success) {
              yield put({
                type: 'success',
                entity: response.data,
              });
            }
            if (callback) callback(response);
        },

        *getContainerArts({ payload }, { call, put }) {
            const response = yield call(getContainerArts, payload);
            if (response && response.success) {
                yield put({
                    type: 'onShowContainerArts',
                    containerarts: response.data
                });
            }
        },

        *onView({ payload, callback }, { call, put }) {
            yield put({
                type: 'success',
                container: payload
                //showDetailView: true,
            });
        },

        *showPage({ payload }, { call, put }) {
            yield put({
                type: 'onShowPage',
                showPage: payload.showPage,
                entityUuid: payload.entityUuid,
                fromView: payload.fromView,
                entity: payload.entity
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
        success(state, action) {
            return {
                ...state,
                // data: action.payload,
                entity: action.entity ? action.entity : {},
                containers: action.containers ? action.containers : [],
                entityUuid: action.entity ? action.entity.barcode : '',
            };
        },
        onShowContainerArts(state, action) {
            return {
                ...state,
                containerarts: action.containerarts
            };
        },
        onShowPage(state, action) {
            return {
                ...state,
                showPage: action.showPage,
                entity: action.entity,
                entityUuid: action.entityUuid,
                fromView: action.fromView,
            }
        },
        getOnView(state, action) {
          return {
            ...state,
            entity: action.payload,
          };
        },
    },
};
