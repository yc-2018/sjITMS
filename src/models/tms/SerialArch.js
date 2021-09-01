import {
  query, save, queryNotExistInLineStores, saveLine, getLinesByArchCode, getStoresByArchLineUuid, getLine_ByUuid,
  modifyLine, saveLineStore, removeLineStore, sort, removeLine,
  getSerialArchByUuid, removeSerialArch, modifyArch, querySerialArchLines, batchImport
} from '@/services/tms/SerialArch';

export default {
  namespace: 'serialArch',

  state: {
    data: [],
    showPage: 'query',
    uuid: '',
    modalVisible: false,
    addStoreVisible: false,
    notExistInLineStores: [],
    existInLineStores: [],
    archLines: [],
    lineUuid: '',
    lineEntity: {},
    archEntity: {},
    lineModalVisible: false,
    createLine: true,
  },
  effects: {

    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        payload,
      });
    },
    *save({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },
    *querySerialArchLines({ payload, callback }, { call, put }) {
      const response = yield call(querySerialArchLines, payload);
      if (response && response.success) {
        yield put({
          type: 'saveSerialArchLines',
          payload: response.data
        });
      }
      if (callback) callback(response);
    },
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      yield put({
        type: 'onView',
        payload: {
          data: response.data,
          showPage: 'query',
          notExistInLineStores: [],
          existInLineStores: [],
          archLines: [],
          lineUuid: '',
          lineEntity: {},
        },
      });

      if (callback) callback(response);
    },
    *showCreateModal({ payload, callback }, { call, put }) {
      yield put({
        type: 'showPage',
        payload: payload
      })
    },
    *queryNotExistInLineStores({ payload, callback }, { call, put }) {
      const response = yield call(queryNotExistInLineStores, payload.pageFilter);
      if (response && response.success) {
        yield put({
          type: 'onView',
          payload: {
            notExistInLineStores: response.data,
            addStoreVisible: true,
            lineUuid: payload.lineUuid
          },
        });
      }
      if (callback) callback(response);
    },
    *refreshLineStore({ payload, callback }, { call, put }) {
      yield put({
        type: 'onView',
        payload: {
          existInLineStores: payload,
          addStoreVisible: false
        }
      })
    },
    *addLine({ payload, callback }, { call, put }) {
      const response = yield call(saveLine, payload);
      if (callback) callback(response);
    },
    *getLinesByArchCode({ payload, callback }, { call, put }) {
      const response = yield call(getLinesByArchCode, { archUuid: payload.uuid, companyUuid: payload.companyUuid });
      yield put({
        type: 'onView',
        payload: {
          archLines: response.data,
          lineModalVisible: false,
          lineEntity: {},
          lineUuid: ''
        }
      })
    },
    *getLinesByArchUuid({ payload, callback }, { call, put }) {
      const response = yield call(getLinesByArchCode, { companyUuid: payload.companyUuid, archUuid: payload.uuid });
      yield put({
        type: 'onView',
        payload: {
          archLines: response.data,
          lineModalVisible: false,
          lineEntity: {},
          lineUuid: ''
        }
      })
    },
    *getStoresByArchLineUuid({ payload, callback }, { call, put }) {
      const response = yield call(getStoresByArchLineUuid, payload);
      yield put({
        type: 'onView',
        payload: {
          existInLineStores: response.data,
          lineUuid: payload.lineUuid,
          addStoreVisible: false,
          lineEntity: payload.lineEntity
        }
      })
      if (callback) callback(response)
    },
    *getLineByUuid({ payload, callback }, { call, put }) {
      const response = yield call(getLine_ByUuid, payload);
      if (response && response.data) {
        let existInLineStores = [];
        if (response.data.stores) {
          response.data.stores.map(item => {
            let store = {};
            store = { ...item.store };
            existInLineStores.push(store);
          })
        }
        yield put({
          type: 'onView',
          payload: {
            lineEntity: response.data,
            lineModalVisible: true,
            createLine: false,
          }
        })
      }
    },
    *getLineEntity({ payload, callback }, { call, put }) {
      const response = yield call(getLine_ByUuid, payload);
      if (response && response.data) {
        yield put({
          type: 'onView',
          payload: {
            existInLineStores: response.data.stores,
            lineEntity: response.data,
            lineUuid: response.data.uuid,
            addStoreVisible: false
          }
        })
      }
    },
    *getSerialArch({ payload, callback }, { call, put }) {
      const response = yield call(getSerialArchByUuid, payload);
      if (response && response.data) {
        yield put({
          type: 'onView',
          payload: {
            archEntity: response.data
          }
        })
      }
    },
    *modifyLine({ payload, callback }, { call, put }) {
      const response = yield call(modifyLine, payload);
      if (callback) callback(response);
    },
    *modifySerialArch({ payload, callback }, { call, put }) {
      const response = yield call(modifyArch, payload);
      if (callback) callback(response);
    },
    *removeLine({ payload, callback }, { call, put }) {
      const response = yield call(removeLine, payload);
      if (callback) callback(response);
    },
    *saveLineStore({ payload, callback }, { call, put }) {
      const response = yield call(saveLineStore, payload);
      if (callback) callback(response);
    },
    *removeLineStore({ payload, callback }, { call, put }) {
      const response = yield call(removeLineStore, payload);
      yield put({
        type: 'getLineEntity',
        payload: { lineUuid: payload.lineUuid }
      });
      if (callback) callback(response);
    },
    *removeArch({ payload, callback }, { call, put }) {
      const response = yield call(removeSerialArch, payload);
      yield put({
        type: 'onView',
      });
      if (callback) callback(response);
    },
    *sort({ payload, callback }, { call, put }) {
      const response = yield call(sort, payload);
      if (response && response.success) {
        const res = yield call(getLine_ByUuid, { lineUuid: payload.startData.archLineUuid });
        yield put({
          type: 'onView',
          payload: {
            existInLineStores: res.data.stores,
            lineUuid: payload.lineUuid,
            lineEntity: res.data,
          }
        })
      }
      if (callback) callback(response);
    },
    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
      if (callback) callback(response);
    }
  },
  reducers: {
    onView(state, action) {
      return {
        ...state,
        ...action.payload
      }
    },
    onShowPage(state, action) {
      return {
        ...state, ...action.payload
      }
    },
    saveSerialArchLines(state, action) {
      return {
        ...state,
        archLines: action.payload,
      };
    },
  },
}