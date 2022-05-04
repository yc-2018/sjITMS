import {
  queryScheduleNo,
  queryOrder,
  queryStore,
  queryOrderUndelivered,
  confirmOrder,
  confirmStore,
  confirmOrderUndelivered,
  deliveredConfirmSchedule,
  unDeliveredConfirmSchedule,
  updateNoDelivered
} from '@/services/sjtms/DeliveredConfirm';

export default {
    namespace: 'deliveredConfirm1',
    subscriptions: {
        /**
         * 监听浏览器地址
         * @param dispatch 触发器，用于触发 effects 中的 query 方法
         * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
         */
        setup ({ dispatch, history }) {
          history.listen((location) => {
            if(location.payload && location.pathname == "/tms/DeliveredConfirm"){
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
        storeBillData:{
            list: [],
            pagination: {},
        },
        billData:{
            list: [],
            pagination: {},
        },
        storeData:{
            list: [],
            pagination: {},
        },
        orderUndelivereData:{
            list: [],
            pagination: {},
        },
        // entity: {},
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
        *queryScheduleNo({ payload,callback }, { call, put }) {
            const response = yield call(queryScheduleNo, payload);
            if (callback) callback(response);
        },
        *updateNoDelivered({ payload,callback }, { call, put }) {
            const response = yield call(updateNoDelivered, payload);
            if (callback) callback(response);
        },
        *queryBill({ payload }, { call, put }) {
            const response = yield call(queryOrder, payload);
            if (response.success) {
                yield put({
                    type: 'saveBill',
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
        *queryStore({ payload }, { call, put }) {
            const response = yield call(queryStore, payload);
            if (response.success) {
                yield put({
                    type: 'saveStore',
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
        *queryStoreBill({ payload }, { call, put }) {
            const response = yield call(queryOrder, payload);
            if (response.success) {
                yield put({
                    type: 'saveStoreBill',
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
        *queryOrderUndelivered({ payload }, { call, put }) {
            const response = yield call(queryOrderUndelivered, payload);
            if (response.success) {
                yield put({
                    type: 'saveOrderUndelivered',
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
        *confirmOrder({ payload,callback }, { call, put }) {
            const response = yield call(confirmOrder, payload);
            if (callback) callback(response);
        },
        *confirmStore({ payload,callback }, { call, put }) {
            const response = yield call(confirmStore, payload);
            if (callback) callback(response);
        },
        *confirmOrderUndelivered({ payload,callback }, { call, put }) {
            const response = yield call(confirmOrderUndelivered, payload);
            if (callback) callback(response);
        },
        *deliveredConfirmSchedule({ payload,callback }, { call, put }) {
            const response = yield call(deliveredConfirmSchedule, payload);
            if (callback) callback(response);
        },
        *unDeliveredConfirmSchedule({ payload,callback }, { call, put }) {
            const response = yield call(unDeliveredConfirmSchedule, payload);
            if (callback) callback(response);
        },


    },

    reducers: {
        saveStoreBill(state, action) {
            return {
                ...state,
                storeBillData: action.payload,
            };
        },
        saveBill(state, action) {
            return {
                ...state,
                billData: action.payload,
            };
        },
        saveStore(state, action) {
            return {
                ...state,
                storeData: action.payload,
            };
        },
        saveOrderUndelivered(state, action) {
            return {
                ...state,
                orderUndelivereData: action.payload,
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
