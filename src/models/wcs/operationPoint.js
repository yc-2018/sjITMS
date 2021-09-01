import {
  queryOperationPoint,
  removeOperationPoint,
  removeGateway,
  queryGateway,
  addGateway,
  addOperationPoint,
  queryArea,
  removeArea,
  addArea,
  querySection,
  removeSection,
  addSection,
  queryNode,
  removeNode,
  addNode,
  queryBin,
  removeBin,
  addBin,
  getTag,
  queryList,
  editBin,
  getOperationPoint,
  getArea,
  getSection
} from '@/services/wcs/OperationPoint';

export default {
  namespace: 'operationPoint',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },
  effects: {
    *queryOperationPoint({ payload, callback }, { call, put }) {
      const response = yield call(queryOperationPoint, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
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
    *queryGateway({ payload, callback }, { call, put }) {
      const response = yield call(queryGateway, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
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
    *queryArea({ payload, callback }, { call, put }) {
      const response = yield call(queryArea, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
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
    *querySection({ payload, callback }, { call, put }) {
      const response = yield call(querySection, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
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
    *queryNode({ payload, callback }, { call, put }) {
      const response = yield call(queryNode, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
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
    *getTag({ payload, callback }, { call, put }) {
      const response = yield call(getTag, payload);
      if (callback) callback(response);
    },
    *getOperationPoint({ payload, callback }, { call, put }) {
      const response = yield call(getOperationPoint, payload);
      if (callback) callback(response);
    },
    *getArea({ payload, callback }, { call, put }) {
      const response = yield call(getArea, payload);
      if (callback) callback(response);
    },
    *getSection({ payload, callback }, { call, put }) {
      const response = yield call(getSection, payload);
      if (callback) callback(response);
    },
    *queryList({ payload, callback }, { call, put }) {
      const response = yield call(queryList, payload);
      if (callback) callback(response);
    },
    *queryBin({ payload, callback }, { call, put }) {
      const response = yield call(queryBin, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
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
    *addGateway({ payload, callback }, { call, put }) {
      const response = yield call(addGateway, payload);
      if (callback) callback(response);
    },
    *addOperationPoint({ payload, callback }, { call, put }) {
      const response = yield call(addOperationPoint, payload);
      if (callback) callback(response);
    },
    *addArea({ payload, callback }, { call, put }) {
      const response = yield call(addArea, payload);
      if (callback) callback(response);
    },
    *addSection({ payload, callback }, { call, put }) {
      const response = yield call(addSection, payload);
      if (callback) callback(response);
    },
    *addNode({ payload, callback }, { call, put }) {
      const response = yield call(addNode, payload);
      if (callback) callback(response);
    },
    *addBin({ payload, callback }, { call, put }) {
      const response = yield call(addBin, payload);
      if (callback) callback(response);
    },
    *editBin({ payload, callback }, { call, put }) {
      const response = yield call(editBin, payload);
      if (callback) callback(response);
    },
    *removeOperationPoint({ payload, callback }, { call, put }) {
      const response = yield call(removeOperationPoint, payload);
      if (callback) callback(response);
    },
    *removeGateway({ payload, callback }, { call, put }) {
      const response = yield call(removeGateway, payload);
      if (callback) callback(response);
    },
    *removeArea({ payload, callback }, { call, put }) {
      const response = yield call(removeArea, payload);
      if (callback) callback(response);
    },
    *removeSection({ payload, callback }, { call, put }) {
      const response = yield call(removeSection, payload);
      if (callback) callback(response);
    },
    *removeNode({ payload, callback }, { call, put }) {
      const response = yield call(removeNode, payload);
      if (callback) callback(response);
    },
    *removeBin({ payload, callback }, { call, put }) {
      const response = yield call(removeBin, payload);
      if (callback) callback(response);
    }
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    }
  }
};
