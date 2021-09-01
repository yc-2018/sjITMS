import { query,confirm,pageHistory } from '@/services/tms/CheckReceiptBill';

export default {
    namespace: 'checkReceiptBill',
    subscriptions: {
        /**
         * 监听浏览器地址
         * @param dispatch 触发器，用于触发 effects 中的 query 方法
         * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
         */
        setup ({ dispatch, history }) {
          history.listen((location) => {
            if(location.payload && location.pathname == "/tms/checkReceiptBill"){
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
        *showPage({ payload }, { call, put }) {
            yield put({
                type: 'onShowPage',
                showPage: payload.showPage,
                entityUuid: payload.entityUuid,
            });
        },
        *query({ payload }, { call, put }) {
            const response = yield call(query, payload);
            if (response.success) {
                yield put({
                    type: 'save',
                    payload: {
                        list: response.data ? response.data : [],
                        // pagination: {
                        //     total: response.data.paging.recordCount,
                        //     pageSize: response.data.paging.pageSize,
                        //     current: response.data.page + 1,
                        //     showTotal: total => `共 ${total} 条`,
                        // },
                    },
                });
            }
        },
        *queryForHistory({ payload }, { call, put }) {
            const response = yield call(pageHistory, payload);
            if (response.success) {
                yield put({
                    type: 'saveForHistory',
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
        *confirm({ payload,callback }, { call, put }) {
            const response = yield call(confirm, payload);
            if (callback) callback(response);
        }
        

    },

    reducers: {
        save(state, action) {
            return {
                ...state,
                data: action.payload,
            };
        },
        saveForHistory(state, action) {
            return {
                ...state,
                dataForHistory: action.payload,
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
                entityUuid: action.entityUuid
            }
        }
    },
}