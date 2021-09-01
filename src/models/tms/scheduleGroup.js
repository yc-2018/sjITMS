import { save, get,query,modify,deleteByUuids,remove } from '@/services/tms/ScheduleGroup';
import { queryWaveNumByState } from '@/services/tms/TransportOrder';

export default {
  namespace: 'scheduleGroup',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    showPage: 'query'
  },
  effects: {
    *query({ payload,callback }, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: response.data
        });
      }
      if (callback) callback(response);

    },
    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (callback) callback(response);
    },
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
    *deleteByUuids({ payload, callback }, { call, put }) {
      const response = yield call(deleteByUuids, payload);
      if (callback) callback(response);
    },
    *queryWaveNumByState({ payload, callback }, { call, put }) {
      const response = yield call(queryWaveNumByState, payload);
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
  },
}