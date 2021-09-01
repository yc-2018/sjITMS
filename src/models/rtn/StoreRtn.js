import {
    save, getByUuid, query, remove, audit, modify, auditByState,getByBillNumber, querytargetbin, saveAndAudit, queryBinAndContainer, previousBill, queryBinAndContainerRntWrh, nextBill, queryMaxContainerByBinCode
} from '@/services/rtn/StoreRtn';
import { message } from 'antd';

export default {
    namespace: 'storeRtn',
    subscriptions: {
        /**
         * 监听浏览器地址
         * @param dispatch 触发器，用于触发 effects 中的 query 方法
         * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
         */
        setup({ dispatch, history }) {
            history.listen((location) => {
                if (location.payload && location.pathname == '/rtn/storeRtn') {
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
        entity: {},
        entityUuid: ''
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
            const response = yield call(getByUuid, payload);
            if (callback) callback(response);
            if (response && response.success && response.data) {
                yield put({
                    type: 'onView',
                    entity: response.data
                });
            } else if (payload && !response.data) {
                message.error("退仓单不存在!");
                yield put({
                    type: 'showPage',
                    payload: {
                        showPage: 'query'
                    }
                });
            }
          if (callback) callback(response);
        },
      *getByBillNumber({ payload, callback }, { call, put }) {
        const response = yield call(getByBillNumber, payload);
        if (response && response.success && response.data) {
          yield put({
            type: 'onView',
            entity: response.data
          });
        }
        if (callback) callback(response);
      },
        *previousBill({ payload }, { call, put }) {
            const response = yield call(previousBill, payload);
            if (response && response.success && response.data) {
                yield put({
                    type: 'onView',
                    entity: response.data
                });
            }
          },

        *nextBill({ payload }, { call, put }) {
            const response = yield call(nextBill, payload);
            yield put({
                type: 'onView',
                entity: response.data
            });
        },
        *save({ payload, callback }, { call, put }) {
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
            if (response && response.success) {
                yield put({
                    type: 'onShowPage',
                    showPage: 'view',
                    entityUuid: payload.uuid
                });
            }
            if (callback) callback(response);
        },
        *onSaveAndAudit({ payload, callback }, { call, put }) {
            const response = yield call(saveAndAudit, payload);
            if (response && response.success) {
                yield put({
                    type: 'onShowPage',
                    showPage: 'view',
                    entityUuid: response.data
                });
            }
            if (callback) callback(response);
        },
        *remove({ payload, callback }, { call, put }) {
            const response = yield call(remove, payload);
            if (callback) callback(response);
        },
        *audit({ payload, callback }, { call, put }) {
            const response = yield call(audit, payload);
            if (callback) callback(response);
        },
        *auditByState({ payload, callback }, { call, put }) {
            const response = yield call(auditByState, payload);
            if (callback) callback(response);
        },
        *querytargetbin({ payload, callback }, { call, put }) {
            const response = yield call(querytargetbin, payload);
            if (callback) callback(response);
        },
        *queryBinAndContainer({ payload, callback }, { call, put }) {
          const response = yield call(queryBinAndContainer, payload);
          if (callback) callback(response);
        },
        *queryBinAndContainerRntWrh({ payload, callback }, { call, put }) {
          const response = yield call(queryBinAndContainerRntWrh, payload);
          if (callback) callback(response);
        },
        *queryMaxContainerByBinCode({ payload, callback }, { call, put }) {
          const response = yield call(queryMaxContainerByBinCode, payload);
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
        *showCreatePage({ payload }, { call, put }) {
            yield put({
                type: 'onShowCreatePage',
                showPage: payload.showPage,
                entity: payload.entity,
            });
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
                entity: {},
              fromView: action.fromView
            }
        },
        onView(state, action) {
            return {
                ...state,
                entity: action.entity,
            };
        },
        onShowCreatePage(state, action) {
            return {
              ...state,
              entityUuid: undefined,
              entity: action.entity,
              showPage: action.showPage
            }
          },
    },
}
