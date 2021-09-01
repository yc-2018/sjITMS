import {
    save, get
} from '@/services/tms/ShipPlanDispatchConfig';

export default {
    namespace: 'shipplandispatchconfig',

    state: {
        data: {
            list: []
        },
    },

    effects: {
        *save({ payload, callback }, { call, put }) {
            const response = yield call(save, payload);
            if (callback) callback(response);
        },
        *get({ payload, callback }, { call, put }) {
            const response = yield call(get, payload);
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