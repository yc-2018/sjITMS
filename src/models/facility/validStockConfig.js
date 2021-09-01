import {
    save, getByDCUuid
} from '@/services/facility/ValidStockConfig';

export default {
    namespace: 'validStockConfig',

    state: {
        data: {
            list: [],
            pagination: {}
        },
    },

    effects: {
        *save({ payload, callback }, { call, put }) {
            const response = yield call(save, payload);
            if (callback) callback(response);
        },
        *getBinUsagesByDCUuid({ payload, callback }, { call, put }) {
            const response = yield call(getByDCUuid, payload);
            if (callback) callback(response);
        },
    },

    reducers: {
        success(state, action) {
            return {
                ...state,
                data: action.payload,
            };
        },
    },
};