import {
  query,
  get,
  online,
  offline,
  batchImport,
  // getImportTemplateUrl,
  save,
  modify,
  saveOrModifyArticleQpc,
  saveOrModifyArticleBarcode,
  saveOrModifyArticleVendor,
  saveOrModifyStorePickQty,
  removeArticleQpc,
  removeArticleBarcode,
  removeArticleVendor,
  removeStorePickQty,
  getQpcsByArticleUuid,
  fakeForInReceive,
  getByVendorUuid,
  queryByUuids,
  queryLikeBarcode,
  queryStock,
  getByCode
} from '@/services/basic/Article';

export default {
  namespace: 'article',
  subscriptions: {
    /**
     * 监听浏览器地址
     * @param dispatch 触发器，用于触发 effects 中的 query 方法
     * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
     */
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if(location.payload && location.pathname == "/basic/article"){
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
    showPage: 'query',
    qpcs: [],
    articles: []
  },

  effects: {
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success) {
        yield put({
          type: 'onQuery',
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
    *getByCode({ payload, callback }, { call, put }) {
      const response = yield call(getByCode, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          payload: response.data
        });
      }
      if (callback) callback(response);
    },

    *queryLikeBarcode({ payload, callback }, { call, put }) {
      const response = yield call(queryLikeBarcode, payload);
      if (callback) callback(response);
    },

    *online({ payload, callback }, { call, put }) {
      const response = yield call(online, payload);
      if (callback) callback(response);
    },

    *offline({ payload, callback }, { call, put }) {
      const response = yield call(offline, payload);
      if (callback) callback(response);
    },

    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid,
        importType: payload.importType,
        fromView: payload.fromView
      });
    },

    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
      if (callback) callback(response);
    },

    *save({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },

    *modify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (callback) callback(response);
    },

    *saveOrModifyArticleQpc({ payload, callback }, { call, put }) {
      const response = yield call(saveOrModifyArticleQpc, payload);
      if (callback) callback(response);
    },

    *saveOrModifyArticleBarcode({ payload, callback }, { call, put }) {
      const response = yield call(saveOrModifyArticleBarcode, payload);
      if (callback) callback(response);
    },

    *saveOrModifyArticleVendor({ payload, callback }, { call, put }) {
      const response = yield call(saveOrModifyArticleVendor, payload);
      if (callback) callback(response);
    },

    *saveOrModifyStorePickQty({ payload, callback }, { call, put }) {
      const response = yield call(saveOrModifyStorePickQty, payload);
      if (callback) callback(response);
    },

    *removeArticleQpc({ payload, callback }, { call, put }) {
      const response = yield call(removeArticleQpc, payload);
      if (callback) callback(response);
    },

    *removeArticleBarcode({ payload, callback }, { call, put }) {
      const response = yield call(removeArticleBarcode, payload);
      if (callback) callback(response);
    },

    *removeArticleVendor({ payload, callback }, { call, put }) {
      const response = yield call(removeArticleVendor, payload);
      if (callback) callback(response);
    },

    *removeStorePickQty({ payload, callback }, { call, put }) {
      const response = yield call(removeStorePickQty, payload);
      if (callback) callback(response);
    },

    *getQpcsByArticleUuid({ payload, callback }, { call, put }) {
      const response = yield call(getQpcsByArticleUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'onQueryQpcs',
          payload: response.data,
          articleUuid: payload.articleUuid
        });
      }
      if (callback) callback(response);
    },

    *fakeForInReceive({ payload, callback }, { call, put }) {
      const response = yield call(fakeForInReceive, payload);
      if (callback) callback(response);
    },
    *getByVendorUuid({ payload }, { call, put }) {
      const response = yield call(getByVendorUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'onQueryArticles',
          payload: response.data
        });
      }
    },
    *queryByUuids({ payload }, { call, put }) {
      const response = yield call(queryByUuids, payload);
      if (response && response.success) {
        yield put({
          type: 'onQueryArticles',
          payload: response.data
        });
      }
    },
    *queryStock({ payload, callback }, { call, put }) {
      const response = yield call(queryStock, payload);
      if (response && response.success) {
        let data = Array.isArray(response.data) ? response.data : [];
        let obj = {};
        data = data.reduce((cur, next) => {
          next.article.spec = next.spec;
          obj[next.article.uuid] ? "" : obj[next.article.uuid] = true && cur.push(next.article);
          return cur;
        }, [])//设置cur默认类型为数组，并且初始值为空的数组
        yield put({
          type: 'onQueryStock',
          payload: {
            list: data,
          },
        });
      }
      if (callback) callback(response);
    },
  },

  reducers: {
    onQuery(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },

    onQueryArticles(state, action) {
      return {
        ...state,
        articles: action.payload
      }
    },

    onQueryQpcs(state, action) {
      return {
        ...state,
        qpcs: action.payload,
        articleUuid: action.articleUuid
      };
    },

    onView(state, action) {
      return {
        ...state,
        entity: action.payload
      }
    },

    onQueryStock(state, action) {
      return {
        ...state,
        data: action.payload,
      }
    },

    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
        importType: action.importType,
        fromView: action.fromView
      }
    }
  },
}
