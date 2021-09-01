import {
    getByUuid, query, modifyStockTaker, modifyStockTakeMethod,
    modifyStockTakeSchema, snap, check, finish,
    repeatTake, abort, queryCheckByItemUuid, getByBillNumber,previousBill, nextBill
} from '@/services/inner/StockTakeBill';
import { add, toQtyStr, accAdd, accMul } from '@/utils/QpcStrUtil';

export default {
    namespace: 'stockTakeBill',
    subscriptions: {
        /**
         * 监听浏览器地址
         * @param dispatch 触发器，用于触发 effects 中的 query 方法
         * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
         */
        setup({ dispatch, history }) {
            history.listen((location) => {
                if (location.payload && location.pathname == '/inner/stockTakeBill') {
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
        entityUuid: '',
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
        *getForEdit({ payload, callback }, { call, put }) {
            const response = yield call(getByUuid, payload);
            if (response && response.success && response.data) {

                let groupFilters = [];
                let newSnaps = [];
                let index = 1;
                if (response.data.snapItems && response.data.snapItems.length > 0) {
                    response.data.snapItems.forEach(function (e) {
                        let groupFilter = e.article.articleUuid + e.qpcStr + e.binCode + e.containerBarcode
                            + e.vendor.uuid + e.productionBatch + e.wrhUuid;
                        if (groupFilters.indexOf(groupFilter) == -1) {
                            groupFilters.push(groupFilter);
                            e.line = index++;
                            newSnaps.push(e);
                        } else {
                            let newSnap = null;
                            for (let i = 0; i < newSnaps.length; i++) {
                                let key = newSnaps[i].article.articleUuid + newSnaps[i].qpcStr + newSnaps[i].binCode + newSnaps[i].containerBarcode
                                    + newSnaps[i].vendor.uuid + newSnaps[i].productionBatch + newSnaps[i].wrhUuid;
                                if (key === groupFilter) {
                                    newSnaps[i].qty = accAdd(newSnaps[i].qty, e.qty);
                                    newSnaps[i].caseQtyStr = toQtyStr(newSnaps[i].qty, newSnaps[i].qpcStr);
                                }
                            }
                        }
                    })
                }

                if (response.data.checkItems === undefined) {
                    if (newSnaps) {
                        response.data.checkItems = newSnaps;
                    } else
                        response.data.checkItems = [];
                }

                yield put({
                    type: 'onView',
                    entity: response.data,
                });
            }
        },
        *get({ payload, callback }, { call, put }) {
            const response = yield call(getByUuid, payload);
            if (callback) callback(response);
            if (response && response.success && response.data) {
                let groupFilters = [];
                let checkInfos = [];
                if (response.data.snapItems && response.data.snapItems.length > 0) {
                    response.data.snapItems.forEach(function (e) {
                        let groupFilter = e.article.articleUuid + e.qpcStr + e.binCode + e.containerBarcode
                            + e.vendor.uuid + e.productionBatch + e.wrhUuid;
                        if (groupFilters.indexOf(groupFilter) == -1) {
                            groupFilters.push(groupFilter);
                            checkInfos.push(e);
                        } else {
                            let newSnap = null;
                            for (let i = 0; i < checkInfos.length; i++) {
                                let key = checkInfos[i].article.articleUuid + checkInfos[i].qpcStr + checkInfos[i].binCode + checkInfos[i].containerBarcode
                                    + checkInfos[i].vendor.uuid + checkInfos[i].productionBatch + checkInfos[i].wrhUuid;
                                if (key === groupFilter) {
                                    checkInfos[i].qty = accAdd(checkInfos[i].qty, e.qty);
                                    checkInfos[i].caseQtyStr = toQtyStr(checkInfos[i].qty, checkInfos[i].qpcStr);
                                }
                            }
                        }
                    })
                }

                response.data.snapItems = checkInfos;

                const checks = [];
                if (checkInfos) {
                    for (let checkInfo of checkInfos) {
                        if (response.data.checkItems && response.data.checkItems.length > 0) {
                            Array.isArray(response.data.checkItems)
                                && response.data.checkItems.forEach(function (check) {
                                    if (checkInfo.article.articleUuid === check.article.articleUuid
                                        && checkInfo.binCode === check.binCode
                                        && checkInfo.containerBarcode === check.containerBarcode
                                        && checkInfo.qpcStr === check.qpcStr
                                        && checkInfo.productionBatch === check.productionBatch
                                        && checkInfo.vendor.uuid === check.vendor.uuid
                                    ) {
                                        checkInfo['checkQty'] = check.qty;
                                        checkInfo['checkCaseQtyStr'] = check.caseQtyStr;
                                        checks.push(check);
                                    }
                                });
                        }
                    }

                    if (response.data.checkItems && response.data.checkItems.length > 0) {
                        Array.isArray(response.data.checkItems)
                            && response.data.checkItems.forEach(function (check) {
                                const oldCheck = [];
                                if (checks.length > 0) {
                                    Array.isArray(checks) &&
                                        checks.forEach(function (c) {
                                            if (c.uuid === check.uuid)
                                                oldCheck.push(check);
                                        })
                                }

                                if (oldCheck.length == 0) {
                                    check['checkQty'] = check.qty;
                                    check['checkCaseQtyStr'] = check.caseQtyStr;
                                    check['qty'] = 0;
                                    check['caseQtyStr'] = '0';

                                    checkInfos.push(check);
                                }
                            });
                    }
                }

                yield put({
                    type: 'onView',
                    entity: response.data,
                });
            }
        },
        *getByBillNumber({ payload, callback }, { call, put }) {
            const response = yield call(getByBillNumber, payload);
            if (callback) callback(response);
        },
      *previousBill({ payload }, { call, put }) {
        const response = yield call(previousBill, payload);
        yield put({
          type: 'onView',
          entity: response.data
        });
      },

      *nextBill({ payload }, { call, put }) {
        const response = yield call(nextBill, payload);
        yield put({
          type: 'onView',
          entity: response.data
        });
      },
        *queryCheckByItemUuid({ payload, callback }, { call, put }) {
            const response = yield call(queryCheckByItemUuid, payload);
            if (callback) callback(response);
        },
        *modifyStockTakeMethod({ payload, callback }, { call, put }) {
            const response = yield call(modifyStockTakeMethod, payload);
            if (callback) callback(response);
        },
        *modifyStockTaker({ payload, callback }, { call, put }) {
            const response = yield call(modifyStockTaker, payload);
            if (callback) callback(response);
        },
        *modifyStockTakeSchema({ payload, callback }, { call, put }) {
            const response = yield call(modifyStockTakeSchema, payload);
            if (callback) callback(response);
        },

        *snap({ payload, callback }, { call, put }) {
            const response = yield call(snap, payload);
            if (callback) callback(response);
        },
        *check({ payload, callback }, { call, put }) {
            const response = yield call(check, payload);
            if (callback) callback(response);
        },
        *finish({ payload, callback }, { call, put }) {
            const response = yield call(finish, payload);
            if (callback) callback(response);
        },
        *repeatTake({ payload, callback }, { call, put }) {
            const response = yield call(repeatTake, payload);
            if (callback) callback(response);
        },
        *abort({ payload, callback }, { call, put }) {
            const response = yield call(abort, payload);
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
                entity: action.entity,
            };
        }
    },
}
