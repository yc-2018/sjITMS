import {
  query,
  save,
  get,
  getPalletBinArts,
  queryIdleAndThisPostionUseing,
} from '@/services/out/PalletBin';

export default {
  namespace: 'palletBin',
  subscriptions: {
    /**
     * 监听浏览器地址
     * @param dispatch 触发器，用于触发 effects 中的 query 方法
     * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
     */
    setup({ dispatch, history }) {
      history.listen((location) => {
        if (location.payload && location.pathname == '/facility/palletBin') {
          dispatch({
            type: 'showPage',
            payload: location.payload,
          });
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
    starBarcode: '',
    palletBins: [],
    palletBinarts: [],
    showPage: 'query',
  },
  effects: {
    * query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      if (response.success) {
        yield put({
          type: 'success',
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
    * queryIdleAndThisPostionUseing({ payload, callback }, { call, put }) {
      const response = yield call(queryIdleAndThisPostionUseing, payload);
      if (response.success) {
        yield put({
          type: 'success',
          palletBins: response.data,
        });
      }
    },
    * onSave({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'query',
        });
      }
      if (callback) callback(response);
    },

    * get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'getOnView',
          payload: response.data,
        });
      }
      if (callback) callback(response);
    },

    * getPalletBinArts({ payload }, { call, put }) {
      const response = yield call(getPalletBinArts, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPalletBinArts',
          palletBinarts: response.data,
        });
      }
    },

    * onView({ payload, callback }, { call, put }) {
      yield put({
        type: 'success',
        palletBin: payload,
        //showDetailView: true,
      });
    },

    * showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        ...payload,
      });
    },
  },

  reducers: {
    success(state, action) {
      return {
        ...state,
        data: action.payload ? action.payload : {},
        entity: action.entity ? action.entity : {},
        palletBins: action.palletBins ? action.palletBins : [],
        entityUuid: action.entity ? action.entity.barcode : '',
      };
    },
    onShowPalletBinArts(state, action) {
      return {
        ...state,
        palletBinarts: action.palletBinarts,
      };
    },
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
      };
    },
    getOnView(state, action) {
      return {
        ...state,
        entity: action.payload,
      };
    },
  },
};
