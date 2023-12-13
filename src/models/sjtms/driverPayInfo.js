import { batchImport } from '@/services/sjitms/DriverPayInfo';

export default {
  namespace: 'driverPayInfo',
  state: {},
  effects: {
    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
      if (callback) callback(response);
    },
  },
  reducers: {},
};
