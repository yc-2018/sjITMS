import { batchImport } from '@/services/cost/BasicSource';

export default {
  namespace: 'basicSource',
  state: {},
  effects: {
    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
      if (callback) callback(response);
    },
  },
  reducers: {},
};
