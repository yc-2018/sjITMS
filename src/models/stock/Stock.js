import {
  query,
  pageQuery,
  queryGroupedStock
} from '@/services/stock/Stock';
import { queryLockStocksWithLock } from '@/services/inner/StockLock';

export default {
  namespace: 'stock',

  state: {
    stocks: [],
    data: {
      list: [],
      pagination: {},
    },
    stockLinePageMap: new Map(),
    stockLineMap: new Map()
  },

  effects: {
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: {
            stocks: response.data ? response.data : [],
            line: payload.line
          }
        });
      }
      if (callback) callback(response);
    },
    *queryLockStocksWithLock({ payload, callback }, { call, put }) {
      const response = yield call(queryLockStocksWithLock, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: {
            stocks: response.data ? response.data : [],
            line: payload.line
          }
        });
      }
      if (callback) callback(response);
    },
    *queryGroupedStock({ payload, callback }, { call, put }) {
      const response = yield call(queryGroupedStock, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: {
            stocks: response.data ? response.data : [],
            line: payload.line
          }
        });
      }
      if (callback) callback(response);
    },
    *clearStocks({ }, { call, put }) {
      yield put({
        type: 'clear'
      });
    },
    *pageQuery({ payload, callback }, { call, put }) {
      const response = yield call(pageQuery, payload);
      if (response.success) {
        yield put({
          type: 'saveQueryResult',
          payload: {
            line: payload.line,
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
  },

  reducers: {
    save(state, action) {
      let stockLineMap = state.stockLineMap ? state.stockLineMap : new Map();
      if (action.payload.stocks && action.payload.line) {
        stockLineMap.set(action.payload.line, action.payload.stocks);
      }
      return {
        ...state,
        stocks: action.payload.stocks,
        stockLineMap: stockLineMap
      };
    },
    clear(state, action) {
      return {
        ...state,
        stocks: [],
        stockLineMap: new Map(),
        stockLinePageMap: new Map()
      };
    },
    saveQueryResult(state, action) {
      let stockLinePageMap = state.stockLinePageMap ? state.stockLinePageMap : new Map();
      if (action.payload && action.payload.line) {
        let data = action.payload;
        stockLinePageMap.set(action.payload.line, data);
      }
      console.log(action.payload);
      return {
        ...state,
        data: action.payload,
        stockLinePageMap: stockLinePageMap
      };
    }
  }
}
