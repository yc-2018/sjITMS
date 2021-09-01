import {
    getNext,
    getBefore
} from '@/services/inner/InnerBill';

export default {
    namespace: 'innerBill',

    state: {

    },
    effects: {
        *next({ payload, callback }, { call, put }) {
            const response = yield call(getNext, payload);
            if (callback) callback(response);
        },

        *before({ payload, callback }, { call, put }) {
            const response = yield call(getBefore, payload);
            if (callback) callback(response);
        },
    }
}
