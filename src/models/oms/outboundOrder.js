import { uploading } from '@/services/oms/outBoundOrder';

export default {
    namespace: 'outBoundOrder',
    state: {},
    effects: {
        *uploading({ payload, callback }, { call, put }) {
            const response = yield call(uploading, payload);
            if (callback) {
                callback(response);
            }
        },
    },
    reducers: {},
};