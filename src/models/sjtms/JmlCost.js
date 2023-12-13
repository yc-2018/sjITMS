import { batchImport } from '@/services/sjitms/Jmlcost';

export default {
  namespace: 'JmlCostImport',
  state: {},
  effects: {
    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
      if (callback) callback(response);
    },
  },
  reducers: {},
};
