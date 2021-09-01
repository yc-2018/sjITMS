import { query,queryByStore,confirm,confirmByStore,audit } from '@/services/tms/DispatchReturn';

export default {
    namespace: 'dispatchReturn',
    subscriptions: {
        /**
         * 监听浏览器地址
         * @param dispatch 触发器，用于触发 effects 中的 query 方法
         * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
         */
        setup ({ dispatch, history }) {
          history.listen((location) => {
            if(location.payload && location.pathname == "/tms/dispatchReturn"){
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
        dataForStore: {
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
            if (response.success&&response.data) {
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
      
        *queryByStore({ payload, callback }, { call, put }) {
            const response = yield call(queryByStore, payload);
            if (response.success) {
              yield put({
                type: 'saveByStore',
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

        *onConfirm({ payload, callback }, { call, put }) {
            const response = yield call(confirm, payload);
            if (callback) callback(response);
        },
        *onConfirmByStore({ payload, callback }, { call, put }) {
            const response = yield call(confirmByStore, payload);
            if (callback) callback(response);
        },
        *onAudit({ payload, callback }, { call, put }) {
            const response = yield call(audit, payload);
            if (callback) callback(response);
        },

        *showPage({ payload }, { call, put }) {
            yield put({
                type: 'onShowPage',
                showPage: payload.showPage,
                // entityUuid: payload.entityUuid,
                selectedRows:payload.selectedRows

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
        saveByStore(state, action) {
            return {
              ...state,
              dataForStore: action.payload,
            };
        },
        onShowPage(state, action) {
            return {
                ...state,
                showPage: action.showPage,
                // entityUuid: action.entityUuid
                selectedRows: action.selectedRows
            }
        }
    },
}