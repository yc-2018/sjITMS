import {
  save, deleteWave, modify, query, get, getByWaveUuid, getSchedule, start, finish,
  rollBack, confirm, queryStoreInfo, execute, modifyOrderItem, queryWaveDifference, queryUnReceivedInfo, queryReceiveStockInfos,
  getByNumber, abort, recalcPalletBin,previousBill, nextBill
} from '@/services/out/Wave';

export default {
  namespace: 'wave',

  subscriptions: {
    /**
     * 监听浏览器地址
     * @param dispatch 触发器，用于触发 effects 中的 query 方法
     * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
     */
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if(location.payload && location.pathname == "/out/wave"){
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
    showPage: 'query'
  },
  effects: {
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
    *onRemove({ payload, callback }, { call, put }) {
      const response = yield call(deleteWave, payload);
      if (callback) callback(response)
    },
    *modify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'view',
          entityUuid: payload.uuid,
          waveBillNumber: payload.waveBillNumber,
        });
      }
      if (callback) callback(response);
    },
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
    *getByWaveUuid({ payload }, { call, put }) {
      const response = yield call(getByWaveUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'saveItems',
          waveAlcNtcItems: response.data
        });
      }
    },
    *getSchedule({ payload }, { call, put }) {
      const response = yield call(getSchedule, payload);
      if (response && response.success) {
        yield put({
          type: 'saveSchedule',
          schedule: response.data
        });
      }
    },
    *queryStoreInfo({ payload, callback }, { call, put }) {
      const response = yield call(queryStoreInfo, payload);
      if (response && response.success) {
        yield put({
          type: 'saveStoreInfo',
          storeInfos: response.data
        });
      }
    },
    *onStart({ payload, callback }, { call, put }) {
      const response = yield call(start, payload);
      if (callback) callback(response)
    },
    *onFinish({ payload, callback }, { call, put }) {
      const response = yield call(finish, payload);
      if (callback) callback(response)
    },
    *onExecute({ payload, callback }, { call, put }) {
      const response = yield call(execute, payload);
      if (callback) callback(response)
    },
    *onRollBack({ payload, callback }, { call, put }) {
      const response = yield call(rollBack, payload);
      if (callback) callback(response)
    },
    *onConfirm({ payload, callback }, { call, put }) {
      const response = yield call(confirm, payload);
      if (callback) callback(response)
    },

    *modifyOrderItem({ payload, callback }, { call, put }) {
      const response = yield call(modifyOrderItem, payload);
      if (callback) callback(response)
    },
    *queryWaveDifference({ payload, callback }, { call, put }) {
      const response = yield call(queryWaveDifference, payload);
      if (response && response.success) {
        yield put({
          type: 'saveDiffInfo',
          waveAlcntcInfos: response.data
        });
      }
    },
    *queryUnReceivedInfo({ payload, callback }, { call, put }) {
      const response = yield call(queryUnReceivedInfo, payload);
      if (response && response.success) {
        yield put({
          type: 'saveUnReceivedInfo',
          unReceivedInfo: response.data
        });
      }
    },
    *queryReceiveStockInfos({ payload, callback }, { call, put }) {
      const response = yield call(queryReceiveStockInfos, payload);
      if (response && response.success) {
        yield put({
          type: 'saveReceiveStockInfo',
          receiveStockInfo: response.data
        });
      }
    },
    *getByNumber({ payload, callback }, { call, put }) {
      const response = yield call(getByNumber, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
      if (callback) callback(response);
    },
    *onAbort({ payload, callback }, { call, put }) {
      const response = yield call(abort, payload);
      if (callback) callback(response)
    },

    *previousBill({ payload, callback }, { call, put }) {
      const response = yield call(previousBill, payload);
      yield put({
        type: 'onView',
        entity: response.data
      });
      if (callback) callback(response);
    },

    *nextBill({ payload, callback }, { call, put }) {
      const response = yield call(nextBill, payload);
      yield put({
        type: 'onView',
        entity: response.data
      });
      if (callback) callback(response);
    },

    *recalcPalletBin({ payload, callback }, { call, put }) {
      const response = yield call(recalcPalletBin, payload);
      if (callback) callback(response)
    },

    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid,
        waveBillNumber: payload.waveBillNumber,
        waveState: payload.state,
        fromView: payload.fromView,
        billNumber: payload.billNumber
      });
    },
    *onShowTypeView({ payload, callback }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: 'waveTypeView',
      });
    },
    *onCancelWaveType({ payload, callback }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: 'query',
      });
    },

  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    onView(state, action) {
      return {
        ...state,
        entity: action.entity,
        billNumber: undefined
      }
    },
    saveItems(state, action) {
      return {
        ...state,
        entityItems: action.waveAlcNtcItems
      }
    },
    saveSchedule(state, action) {
      return {
        ...state,
        schedule: action.schedule
      }
    },
    saveStoreInfo(state, action) {
      return {
        ...state,
        storeInfos: action.storeInfos
      }
    },
    saveDiffInfo(state, action) {
      return {
        ...state,
        waveAlcntcInfos: action.waveAlcntcInfos
      }
    },
    saveUnReceivedInfo(state, action) {
      return {
        ...state,
        unReceivedInfo: action.unReceivedInfo
      }
    },
    saveReceiveStockInfo(state, action) {
      return {
        ...state,
        receiveStockInfo: action.receiveStockInfo
      }
    },
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
        waveBillNumber: action.waveBillNumber,
        waveState: action.waveState,
        fromView: action.fromView,
        billNumber: action.billNumber
      }
    }
  }
}
