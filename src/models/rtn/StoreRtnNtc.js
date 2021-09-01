import {
    save, getByUuid, getByBillNumberAndDcUuid, query,
    remove, finish, modify, approve, copy,saveAndApprove,previousBill, nextBill,
    // getImportTemplateUrl,
    batchImport, abort
} from '@/services/rtn/StoreRtnNtc';
import { message } from 'antd';

export default {
    namespace: 'storeRtnNtc',
    state: {
        data: {
            list: [],
            pagination: {}
        },
        showPage: 'query',
        entity: {},
        entityUuid: ''
    },
    subscriptions: {
        /**
         * 监听浏览器地址
         * @param dispatch 触发器，用于触发 effects 中的 query 方法
         * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
         */
        setup({ dispatch, history }) {
            history.listen((location) => {
                if (location.payload && location.pathname == '/rtn/storeRtnNtc') {
                    dispatch({
                        type: 'showPage',
                        payload: location.payload,
                    })
                }
            });
        },
    },
    effects: {
        *query({ payload, callback }, { call, put }) {
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
          if (callback) callback(response);
        },
        *get({ payload, callback }, { call, put }) {
            const response = yield call(getByUuid, payload);
            if (response && response.success && response.data) {
                yield put({
                    type: 'onView',
                    entity: response.data,
                });
            } else if (payload && !response.data) {
                message.error("退仓通知单不存在!");
                yield put({
                    type: 'showPage',
                    payload: {
                        showPage: 'query'
                    }
                });
            }
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
        *getByBillNumberAndDcUuid({ payload, callback }, { call, put }) {
            const response = yield call(getByBillNumberAndDcUuid, payload);
            if (response && response.success) {
                yield put({
                    type: 'onView',
                    entity: response.data ? response.data : {},
                });
            }
            if (callback) callback(response);
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
        *copy({ payload, callback }, { call, put }) {
            const response = yield call(copy, payload.uuid);
            if (response && response.success && payload.isView) {
                yield put({
                    type: 'onShowPage',
                    showPage: 'view',
                    entityUuid: response.data
                });
            }
            if (callback) callback(response);
        },
        *onSaveAndApprove({ payload, callback }, { call, put }) {
            const response = yield call(saveAndApprove, payload);
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
        *finish({ payload, callback }, { call, put }) {
            const response = yield call(finish, payload);
            if (callback) callback(response);
        },
        *abort({ payload, callback }, { call, put }) {
            const response = yield call(abort, payload);
            if (callback) callback(response);
        },
        *approve({ payload, callback }, { call, put }) {
            const response = yield call(approve, payload);
            if (callback) callback(response);
        },
        *batchImport({ payload, callback }, { call, put }) {
            const response = yield call(batchImport, payload);
            if (callback) callback(response);
        },
        // *getImportTemplateUrl({ payload, callback }, { call, put }) {
        //     const response = yield call(getImportTemplateUrl, payload);
        //     if (callback) callback(response);
        // },
        *showPage({ payload }, { call, put }) {
            yield put({
                type: 'onShowPage',
                showPage: payload.showPage,
                entityUuid: payload.entityUuid,
              fromView: payload.fromView
                // importTemplateUrl: payload.importTemplateUrl,
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
                importTemplateUrl: action.importTemplateUrl,
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
}
