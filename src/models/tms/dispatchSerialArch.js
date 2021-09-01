import {
  save, getLineByUuid, query, changeDispatchState, changeSerialArchState, modifyArch, modifyLine,
  queryLines, removeSerialArch, removeLine, removeLineStore, saveLineStore,getStoreUCN,
  saveLine, getStoresByArchLineUuid, sort, batchImport,getLinesByArchUuid,getSerialArchByUuid,getOnlineSerialArchs,getSerialArch,
  queryDispatchSerialArchLineStore, getStoreUCNByStoreCodeName,getLinesByArchCodeAndClassGroupCodeName, batchImportSerialArchLine,
  batchRemoveLineStore
} from '@/services/tms/DispatchSerialArch';
export default {
  namespace: 'dispatchSerialArch',
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
    selectedSerialArch: {},
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
    *queryLines({ payload, callback }, { call, put }) {
      const response = yield call(queryLines, payload);
      if (response && response.success) {
        yield put({
          type: 'showPage',
          payload: {
            existInLineStores: response.data,
            addStoreVisible: false
          }
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
    *queryDispatchSerialArchLineStore({ payload, callback }, { call, put }) {
      const response = yield call(queryDispatchSerialArchLineStore, payload);
      if (callback) callback(response);
    },
    *showCreateModal({ payload, callback }, { call, put }) {
      yield put({
        type: 'showPage',
        payload: payload
      })
    },
    *changeDispatchState({ payload, callback }, { call, put }) {
      const response = yield call(changeDispatchState, payload);
      if (callback) callback(response);
    },
    *changeSerialArchState({ payload, callback }, { call, put }) {
      const response = yield call(changeSerialArchState, payload);
      if (callback) callback(response);
    },
    *addLine({ payload, callback }, { call, put }) {
      const response = yield call(saveLine, payload);
      if (callback) callback(response);
    },
    *getLinesByArchUuid({ payload, callback }, { call, put }) {
      const response = yield call(getLinesByArchUuid, payload);
      yield put({
        type: 'saveSerialArchLines',
        payload: {
          archLines: response.data,
          lineModalVisible: false,
          lineEntity: {},
          lineUuid: ''
        }
      })
      if (callback) callback(response);
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
    *getSerialArchByUuid({ payload, callback }, { call, put }) {
      const response = yield call(getSerialArchByUuid, payload);
      yield put({
        type: 'onView',
        payload: {
          selectedSerialArch: response.data
        }
      })
      if (callback) callback(response)
    },
    *getStoreUCN({ payload, callback }, { call, put }) {
      const response = yield call(getStoreUCN, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          payload: {
            addStoreVisible: true
          }
        });
      }
      if (callback) callback(response);
    },
    *getStoreUCNByStoreCodeName({ payload, callback }, { call, put }) {
      const response = yield call(getStoreUCNByStoreCodeName, payload);
      yield put({
        type: 'onView',
        payload: {
          data: response.data,
          showPage: 'query'
        },
      });
      if (callback) callback(response);
    },
    *getLinesByArchCodeAndClassGroupCodeName({ payload, callback }, { call, put }) {
      const response = yield call(getLinesByArchCodeAndClassGroupCodeName, payload);
      yield put({
        type: 'onView',
        payload: {
          data: response.data,
          showPage: 'query'
        },
      });
      if (callback) callback(response);
    },
    *getLineByUuid({ payload, callback }, { call, put }) {
      const response = yield call(getLineByUuid, payload);
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
    *modifyLine({ payload, callback }, { call, put }) {
      const response = yield call(modifyLine, payload);
      if (callback) callback(response);
    },
    *modifyArch({ payload, callback }, { call, put }) {
      const response = yield call(modifyArch, payload);
      if (callback) callback(response);
    },
    *removeLine({ payload, callback }, { call, put }) {
      const response = yield call(removeLine, payload);
      if (callback) callback(response);
    },
    *removeSerialArch({ payload, callback }, { call, put }) {
      const response = yield call(removeSerialArch, payload);
      if (callback) callback(response);
    },
    *saveLineStore({ payload, callback }, { call, put }) {
      const response = yield call(saveLineStore, payload);
      if (callback) callback(response);
    },
    *removeLineStore({ payload, callback }, { call, put }) {
      const response = yield call(removeLineStore, payload);
      if (callback) callback(response);
    },
    *batchRemoveLineStore({ payload, callback }, { call, put }) {
      const response = yield call(batchRemoveLineStore, payload);
      if (callback) callback(response);
    },
    *sort({ payload, callback }, { call, put }) {
      const response = yield call(sort, payload);
      if (callback) callback(response);
    },
    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
      if (callback) callback(response);
    },
    *batchImportSerialArchLine({ payload, callback }, { call, put }) {
      const response = yield call(batchImportSerialArchLine, payload);
      if (callback) callback(response);
    },
    *getOnlineSerialArchs({ payload, callback }, { call, put }){
      const response = yield call(getOnlineSerialArchs, payload);
      yield put({
        type: 'onSaveForSelect',
        payload:response.data
      });
      if (callback) callback(response);
    },
    *getSerialArch({ payload, callback }, { call, put }){
      const response = yield call(getSerialArch, payload);
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
    onSaveForSelect(state, action) {
      return {
        ...state,
        onLineList: action.payload
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
