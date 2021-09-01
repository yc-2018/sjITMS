import {
  get, queryByDockGroup, query, save, modify, disable, enable, stateModify,getByCode
} from '@/services/facility/Dock';
import { queryDockGroup, getDockGroup, saveDockGroup, modifyDockGroup, deleteDockGroup, getDockGroupByCompanyUuid } from '@/services/facility/DockGroup';
import { getContainerArts } from '@/services/facility/Container';
export default {
  namespace: 'dock',
  state: {
    data: {
      list: [],
      pagination: {}
    },
    dockGroupData: {
      list: [],
      pagination: {}
    },
    dockGroupList: [],
    showPage: 'query',
  },
  effects: {
    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        fromView: payload.fromView,
        ...payload,
      });
    },
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      if (callback) callback(response);
      if (response.success) {
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
    },
    *getDockGroupByCompanyUuid({ payload, callback }, { call, put }) {
      const response = yield call(getDockGroupByCompanyUuid, payload);
      if (callback) callback(response);
      if (response && response.success) {
        yield put({
          type: 'refreshList',
          dockGroupList: response.data ? response.data : []
        });
      }
    },
    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (callback) callback(response);
      if (response && response.success) {
        yield put({
          type: 'getOnView',
          payload: response.data,
        });
      }
    },
    *getByCode({ payload,callback }, { call, put }) {
      const response = yield call(getByCode, payload);
      if (response && response.success) {
        yield put({
          type: 'getOnView',
          payload: response.data
        });
      }
      if (callback) callback(response);
    },
    *queryByDockGroup({ payload, callback }, { call, put }){
      const response = yield call(queryByDockGroup, payload);
      if (response && response.success) {
        yield put({
          type: 'saveDockList',
          payload: {
            dockList: response.data
          }
        });
      }
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },
    *modify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (callback) callback(response);
    },
    *online({ payload, callback }, { call, put }) {
      const response = yield call(enable, payload);
      if (callback) callback(response);
    },
    *offline({ payload, callback }, { call, put }) {
      const response = yield call(disable, payload);
      if (callback) callback(response);
    },
    *stateModify({ payload, callback }, { call, put }) {
      const response = yield call(stateModify, payload);
      if (callback) callback(response);
    },
    *queryDockGroup({ payload }, { call, put }) {
      const response = yield call(queryDockGroup, payload);
      yield put({
        type: 'saveDockGroup',
        payload: {
          list: response.data.records,
          pagination: {
            total: response.data.paging.recordCount,
            pageSize: response.data.paging.pageSize,
            current: response.data.page + 1,
            showTotal: total => `共 ${total} 条`,
          },
          showDockGroupPagination: true
        },
      });
    },
    *getDockGroup({ payload, callback }, { call, put }) {
      const response = yield call(getDockGroup, payload);
      if (callback) callback(response);
    },
    *addDockGroup({ payload, callback }, { call, put }) {
      const response = yield call(saveDockGroup, payload);
      if (callback) callback(response);
    },
    *modifyDockGroup({ payload, callback }, { call, put }) {
      const response = yield call(modifyDockGroup, payload);
      if (callback) callback(response);
    },
    *deleteDockGroup({ payload, callback }, { call, put }) {
      const response = yield call(deleteDockGroup, payload);
      if (callback) callback(response);
    },
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload
      };
    },
    saveDockGroup(state, action) {
      return {
        ...state,
        dockGroupData: action.payload,
        dockGroupList: action.dockGroupList
      };
    },
    saveDockList(state,action){
      return {
        ...state,
        data: action.payload
      };
    },
    refreshList(state, action) {
      return {
        ...state,
        dockGroupList: action.dockGroupList
      };
    },
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
        fromView: action.fromView,
      }
    },
    getOnView(state, action) {
      return {
        ...state,
        entity: action.payload,
      };
    },
  }
};
