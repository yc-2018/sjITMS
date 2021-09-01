import {
  get,
  save,
  modify,
  remove,
  audit,
  query,
  saveAndApprove,
  getByBillNumber,
  queryDecAbleStock, previousBill, nextBill, queryDecBins} from '@/services/inner/DecInv';

export default {
  namespace: 'dec',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    entity: {},
    showPage: 'query',
    articles: [],
    stocks: []
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

    *onSave({ payload, callback }, { call, put }) {
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

    *onModify({ payload, callback }, { call, put }) {
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

    *onRemove({ payload, callback }, { call, put }) {
      const response = yield call(remove, payload);
      if (callback) callback(response);
    },

    *onSaveAndCreate({ payload, callback }, { call, put }) {
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

    *get({ payload }, { call, put }) {
      const response = yield call(get, payload);
      yield put({
        type: 'onView',
        payload: response.data ? response.data : {}
      });
    },
    *getByBillNumber({ payload,callback }, { call, put }){
      const response = yield call(getByBillNumber, payload);
      yield put({
        type: 'onView',
        payload: response.data ? response.data : {}
      });
      if(callback) callback(response);
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
    *queryDecBins({ payload }, { call, put }) {
      const response = yield call(queryDecBins, payload);
      yield put({
        type: 'onQueryDecBins',
        payload: response.data
      });
    },    *queryDecArticles({ payload, callback }, { call, put }) {
      const response = yield call(queryDecAbleStock, payload);
      if (response && response.success) {

        //商品去重
        let data = Array.isArray(response.data.records) ? response.data.records : [];
        let stocks = [...data];
        let obj = {};
        data = data.reduce((cur, next) => {
          next.article.spec = next.spec;
          obj[next.article.uuid] ? "" : obj[next.article.uuid] = true && cur.push(next.article);
          return cur;
        }, [])//设置cur默认类型为数组，并且初始值为空的数组
        yield put({
          type: 'onQueryArticles',
          payload: {
            data: data,
            stocks: stocks
          },
        });
      }
      if (callback) callback(response);
    },

    *queryBatchAddStocks({ payload }, { call, put }) {
      const response = yield call(queryDecAbleStock, payload);
      if (response && response.success) {
        yield put({
          type: 'onQueryBatchAddStocks',
          payload: {
            list: response.data && response.data.records ? response.data.records : [],
            pagination: {
              total: response.data ? response.data.paging.recordCount : 0,
              pageSize: response.data ? response.data.paging.pageSize : 0,
              current: response.data ? response.data.page + 1 : 1,
              showTotal: total => `共 ${total} 条`,
            },
          },
        });
      }
    },

    *onAudit({ payload, callback }, { call, put }) {
      const response = yield call(audit, payload);
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
    save(state, action) {
      return {
        ...state,
        data: action.payload,
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
        entityUuid: action.entityUuid,
        fromView: action.fromView
      }
    },
    onQueryArticles(state, action) {
      return {
        ...state,
        articles: action.payload.data,
        stocks: action.payload.stocks
      }
    },
    onQueryDecBins(state, action) {
      return {
        ...state,
        bins: action.payload
      }
    },
    onQueryBatchAddStocks(state, action) {
      return {
        ...state,
        stockList: action.payload
      }
    },
  },
}
