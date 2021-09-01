import {
  query,
  save,
  modify,
  deleteUser,
  get,
  // getImportTemplateUrl,
  batchImport,
  checkByPhone,
  online,
  offline,
  getResourcesByUser,
  queryForShipBill,
  getByCodeAndOrgUuid
} from '@/services/account/User';

export default {
  namespace: 'user',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    showPage: 'query',
    entity: {}
  },

  effects: {
    *query({ callback, payload }, { call, put }) {
      const response = yield call(query, payload);
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
    *queryForShipBill({ callback, payload }, { call, put }) {
      const response = yield call(queryForShipBill, payload);
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
    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
      if (callback) callback(response);
    },
    *checkByPhone({ payload, callback }, { call, put }) {
      const response = yield call(checkByPhone, payload);
      if (callback) callback(response);
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(deleteUser, payload);
      if (callback) callback(response)
    },

    // *getImportTemplateUrl({ payload, callback }, { call, put }) {
    //   const response = yield call(getImportTemplateUrl, payload);
    //   if (callback) callback(response);
    // },
    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
      if (callback) callback(response);
    },
    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid,
        // importTemplateUrl: payload.importTemplateUrl,
        // importType: payload.importType,
      });
    },
    *online({ payload, callback }, { call, put }) {
      const response = yield call(online, payload);
      if (callback) callback(response);
    },
    *offline({ payload, callback }, { call, put }) {
      const response = yield call(offline, payload);
      if (callback) callback(response);
    },
    *getResourcesByUser({ payload, callback }, { call, put }) {
      const response = yield call(getResourcesByUser, payload);
      if (callback) callback(response);
    },
    *getByCodeAndOrgUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByCodeAndOrgUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
      if (callback) callback(response);
    },
    *getByCodeWithoutOrg({ payload, callback }, { call, put }) {
      const response = yield call(getByCodeWithoutOrg, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
      if (callback) callback(response);
    }
  },

  reducers: {
    save(state, action) {
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
        importTemplateUrl: action.importTemplateUrl,
        importType: action.importType,
      }
    },
    onView(state, action) {
      return {
        ...state,
        entity: action.entity
      };
    },
  },
};
