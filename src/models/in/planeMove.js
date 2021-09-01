import { get, audit, query, previousBill, nextBill, getByBillNumber } from '@/services/in/PlaneMove';

export default {
    namespace: 'planeMove',
    subscriptions: {
        /**
         * 监听浏览器地址
         * @param dispatch 触发器，用于触发 effects 中的 query 方法
         * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
         */
        setup ({ dispatch, history }) {
          history.listen((location) => {
            if(location.payload && location.pathname == "/in/planeMove"){
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

        *get({ payload, callback }, { call, put }) {
            const response = yield call(get, payload);
            if (response && response.success) {
                yield put({
                    type: 'onView',
                    payload: response.data
                });
            }
          if (callback) callback(response);
        },
      *getByBillNumber({ payload, callback }, { call, put }) {
        const response = yield call(getByBillNumber, payload);
        if (response && response.success) {
          yield put({
            type: 'onView',
            payload: response.data
          });
        }
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

        *audit({ payload, callback }, { call, put }) {
            const response = yield call(audit, payload);
            if (callback) callback(response);
        },

        *showPage({ payload }, { call, put }) {
            yield put({
                type: 'onShowPage',
                showPage: payload.showPage,
                entityUuid: payload.entityUuid,
                fromView: payload.fromView,
                billNumber: payload.billNumber
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
                entity: action.payload,
                billNumber: undefined,
            }
        },
        onShowPage(state, action) {
            return {
                ...state,
                showPage: action.showPage,
                entityUuid: action.entityUuid,
              fromView: action.fromView,
              billNumber: action.billNumber
            }
        }
    },
}
