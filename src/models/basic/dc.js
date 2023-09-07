import {
  query,
  save,
  modify,
  enable,
  disable,
  get,
  getByCompanyUuid,
  getByCodeAndCompanyUuid
} from '@/services/basic/DC';

export default {
  namespace: 'dc',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    showPage: 'query',
    entity: {}
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
    *onSaveAndCreate({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'create'
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
    *online({ payload, callback }, { call, put }) {
      const response = yield call(enable, payload);
      if (callback) callback(response);
    },
    *offline({ payload, callback }, { call, put }) {
      const response = yield call(disable, payload);
      if (callback) callback(response);
    },
    *get({ payload, callback}, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
      if (callback) callback(response);
    },
    *getByCodeAndCompanyUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByCodeAndCompanyUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
      if (callback) callback(response);
    },
    *onView({ payload, callback }, { call, put }) {
      yield put({
        type: 'save',
        payload: {
          showDetailView: true,
          dc: payload
        }
      });
    },
    *onViewCreate({ payload, callback }, { call, put }) {
      yield put({
        type: 'save',
        payload: {
          showEditView: true,
          dc: payload
        }
      });
    },
    *onCancelEdit({ payload, callback }, { call, put }) {
      yield put({
        type: 'save',
        payload: {
          showEditView: false
        }
      });
      if (callback) callback();
    },
    *onCancel({ payload, callback }, { call, put }) {
      yield put({
        type: 'save',
        payload: {
          showDetailView: false
        }
      });
      if (callback) callback();
    },
    *getDCByCompanyUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByCompanyUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          dcList: response.data
        });
      }
      if (callback) callback(response);
    },
    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid
      });
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
        dcList: action.dcList
      };
    },
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
      }
    },
    onView(state, action) {
      return {
        ...state,
        entity: action.entity
      };
    }
  },
};
