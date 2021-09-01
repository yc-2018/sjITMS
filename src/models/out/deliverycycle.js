import {save,modify,remove,getDeliveryCycleList,getDeliveryCycleByUuid,setDefault,
   saveStoreGroup, modifyStoreGroup, removeStoreGroup, getStoreGroup, getStoreGroups, queryStoreGroup,
   saveStoreDeliveryCycle, modifyStoreDeliveryCycle, removeStoreDeliveryCycle, getStoreDeliveryCycle, getStoreDeliveryCycleWave, query, batchImport
  }
  from '@/services/out/Deliverycycle';

export default {
  namespace: 'deliverycycle',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    entity: {},
    showPage: 'query'
  },
  effects: {
    // 配送周期
    *onSave({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },
    *onModify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (callback) callback(response);
    },
    *onRemove({ payload, callback }, { call, put }) {
      const response = yield call(remove, payload);
      if (callback) callback(response);
    },
    *setDefault({ payload, callback }, { call, put }) {
      const response = yield call(setDefault, payload);
      if (callback) callback(response);
    },
    *getDeliveryCycle({ payload, callback }, { call, put }) {
      const response = yield call(getDeliveryCycleByUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
    },
    *getDeliveryCycleList({ payload, callback }, { call, put }){
      const response = yield call(getDeliveryCycleList, payload);
      if (response && response.success) {
        yield put({
          type: 'saveCycleList',
          cycleList: response.data
        });
      }
    },


    // 门店组
    *onSaveStoreGroup({ payload, callback }, { call, put }) {
      const response = yield call(saveStoreGroup, payload);
      if (callback) callback(response);
    },
    *onModifyStoreGroup({ payload, callback }, { call, put }) {
      const response = yield call(modifyStoreGroup, payload);
      if (callback) callback(response);
    },
    *onRemoveStoreGroup({ payload, callback }, { call, put }) {
      const response = yield call(removeStoreGroup, payload);
      if (callback) callback(response);
    },
    *getStoreGroup({ payload, callback }, { call, put }) {
      const response = yield call(getStoreGroup, payload);
      if (response && response.success) {
        yield put({
          type: 'onViewStoreGroup',
          groupEntity: response.data
        });
      }
    },
    *getStoreGroups({ payload, callback }, { call, put }){
      const response = yield call(getStoreGroups, payload);
      if (response && response.success) {
        yield put({
          type: 'saveGroupList',
          groupList: response.data
        });
      }
    },
    // 门店
    
    *onSaveStoreDeliveryCycle({ payload, callback }, { call, put }) {
      const response = yield call(saveStoreDeliveryCycle, payload);
      if (callback) callback(response);
    },
    *onModifyStoreDeliveryCycle({ payload, callback }, { call, put }) {
      const response = yield call(modifyStoreDeliveryCycle, payload);
      if (callback) callback(response);
    },
    *onRemoveStoreDeliveryCycle({ payload, callback }, { call, put }) {
      const response = yield call(removeStoreDeliveryCycle, payload);
      if (callback) callback(response);
    },
    *getStoreDeliveryCycle({ payload, callback }, { call, put }) {
      const response = yield call(getStoreDeliveryCycle, payload);
      if (response && response.success) {
        yield put({
          type: 'onViewStore',
          storeEntity: response.data
        });
      }
    },
    *getStoreDeliveryCycleWave({ payload, callback }, { call, put }) {
      const response = yield call(getStoreDeliveryCycleWave, payload);
      if (response && response.success) {
        yield put({
          type: 'onViewStoreWave',
          storeWaveEntity: response.data
        });
      }
    },
    *query({ payload }, { call, put }) {
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
    },
    

    *onShowTypeView({ payload, callback }, { call, put}){
      yield put({
        type: 'onShowPage',
        showPage: 'deliverycycleTypeView',
      });
    },
    *onCancelDeliverycycleType({ payload, callback }, { call, put}) {
      yield put({
        type: 'onShowPage',
        showPage: 'query',
      });
    },
    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        importStoreGroupUuid: payload.importStoreGroupUuid
      });
    },
    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
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
    onView(state,action){
      return {
        ...state,
        entity: action.entity,
      }
    },
    onViewStoreGroup(state,action){
      return {
        ...state,
        groupEntity: action.groupEntity,
      }
    },
    onViewStore(state,action){
      return {
        ...state,
        storeEntity: action.storeEntity
      }
    },
    onViewStoreWave(state,action){
      return {
        ...state,
        storeWaveEntity: action.storeWaveEntity
      }
    },
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
        importTemplateUrl: action.importTemplateUrl,
        importType: action.importType,
        importStoreGroupUuid: action.importStoreGroupUuid
      }
    },
    saveCycleList(state,action){
      return {
        ...state,
        cycleList: action.cycleList,
      }
    },
    saveGroupList(state,action){
      return {
        ...state,
        groupList: action.groupList,
      }
    }
  }
}
