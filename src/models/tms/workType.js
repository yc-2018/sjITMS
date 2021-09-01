import { save, getByUserUuidAndDispatchCenterUuid, modify, remove,query } from '@/services/tms/WorkType';

export default {
  namespace: 'workType',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    dataForAdd: {
      list: [],
      pagination: {},
    },
    entity: {},
    showPage: 'query'
  },

  effects: {
    *getByUserUuidAndDispatchCenterUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByUserUuidAndDispatchCenterUuid, payload);
      yield put({
        type: 'onView',
        payload: response.data
      });
      if (callback) callback(response);
    },
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
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

      if (callback) callback(response);
    },
    *queryForAdd({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      yield put({
        type: 'saveForAdd',
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

      if (callback) callback(response);
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

    *onSaveAndCreate({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'create',
          entityUuid: undefined,
          entity: {}
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

    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid
      });
    }

  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    saveForAdd(state, action) {
      return {
        ...state,
        dataForAdd: action.payload,
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
        entity: {}
      }
    },
    showCreatePage(state, action) {
      return {
        ...state,
        entityUuid: undefined,
        entity: action.payload.entity,
        showPage: action.payload.showPage,
      }
    },
  },
}
