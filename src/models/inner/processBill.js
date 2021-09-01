import { query,get,audit,remove,save,modify,queryProcessAbleStock,queryProcessEndArticles,queryContainers,saveAndApprove,previousBill, nextBill  } from '@/services/inner/ProcessBill';

export default {
  namespace: 'process',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    entity: {},
    showPage: 'query',
  },
  effects: {
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);

      if (response && response.success && response.data) {
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

    *queryProcessArticles({ payload }, { call, put }) {
      const response = yield call(queryProcessAbleStock, payload);
      if (response && response.success) {

        //商品去重
        let data = Array.isArray(response.data) ? response.data : [];
        let stocks=[...data];
        let obj = {};
        data = data.reduce((cur, next) => {
          next.article.spec=next.spec;
          obj[next.article.articleUuid] ? "" : obj[next.article.articleUuid] = true && cur.push(next.article);
          return cur;
        }, [])//设置cur默认类型为数组，并且初始值为空的数组

        yield put({
          type: 'onQueryArticles',
          payload: {
            data:data,
            stocks:stocks
          },
        });
      }
    },

    *queryBatchAddStocks({ payload }, { call, put }) {
      const response = yield call(queryProcessAbleStock, payload);
      yield put({
        type: 'onQueryBatchAddStocks',
        payload: response.data ? response.data : [],
      });
    },
    
    *queryProcessEndArticles({payload},{call,put}){
      const response = yield call(queryProcessEndArticles,payload);
      if(response && response.success){
        yield put({
          type: 'onQueryEndArticles',
          data: response.data
        });
      }
    },
    *queryContainers({payload},{call,put}){
      const response = yield call(queryContainers,payload);
      if(response && response.success){
        yield put({
          type: 'onQueryContainers',
          data: response.data
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
    *onAudit({ payload, callback }, { call, put }) {
      const response = yield call(audit, payload);
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
      onQueryArticles(state, action) {
        return {
          ...state,
          articles: action.payload.data,
          stocks: action.payload.stocks
        }
      },
      onQueryEndArticles(state,action){
        return {
          ...state,
          endArticles: action.data,
        }
      },
      onQueryContainers(state,action){
        return {
          ...state,
          containers: action.data,
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
      onQueryBatchAddStocks(state, action) {
        return {
          ...state,
          stockList: action.payload
        }
      },
    }
  }
