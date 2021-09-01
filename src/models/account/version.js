import {
  getRfVersion,getAccountVersion,getBasicVersion,getFacilityVersion,getOpenapiVersion
} from '@/services/account/Version';

export default {
  namespace: 'version',

  state: {
    data:{}
  },
  effects: {
    *getRfVersion({ payload, callback }, { call, put }) {
      const response = yield call(getRfVersion);
      if(response && response.success){
        yield put({
          type: 'save',
          key: 'rf',
          value: response.data
        });
      }
    },
    *getAccountVersion({ payload, callback }, { call, put }) {
      const response = yield call(getAccountVersion);
      if(response && response.version){
        yield put({
          type: 'save',
          key: 'account',
          value: response.version.text
        });
      }
    },
    *getBasicVersion({ payload, callback }, { call, put }) {
      const response = yield call(getBasicVersion);
      if(response && response.version){
        yield put({
          type: 'save',
          key: 'basic',
          value: response.version.text
        });
      }
    },
    *getFacilityVersion({ payload, callback }, { call, put }) {
      const response = yield call(getFacilityVersion);
      if(response && response.version){
        yield put({
          type: 'save',
          key: 'facility',
          value: response.version.text
        });
      }
    },
    *getOpenapiVersion({ payload, callback }, { call, put }) {
        const response = yield call(getOpenapiVersion);
        if(response && response.version){
          yield put({
            type: 'save',
            key: 'openapi',
            value: response.version.text
          });
        }
    },
  },

  reducers: {
    save(state, action) {
      state.data[action.key]=action.value;
      return {
        ...state
      };
    },
  },
}