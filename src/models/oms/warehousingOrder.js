import { uploading } from '@/services/oms/warehousingOrder';

export default {
    namespace: 'warehousingOrder',
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