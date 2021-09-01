import { addonlyordertoschedule,removeonlyorderfromschedule,downtoschedule } from '@/services/tms/BillDispatching';

export default {
    namespace: 'billDispatching',

    state: {
        orderData: {
            list: [],
            pagination: {},
        },
        shipPlanData: {
            list: [],
            pagination: {},
        },
        entity: {},
        entityUuid: '',
        showPage: 'query'
    },

    effects: {
        *showPage({ payload }, { call, put }) {
            yield put({
                type: 'onShowPage',
                showPage: payload.showPage,
                entityUuid: payload.entityUuid,
            });
        },
       
        *addonlyordertoschedule({ payload,callback }, { call, put }) {
            const response = yield call(addonlyordertoschedule, payload);
            if (callback) callback(response);
        },
        *removeonlyorderfromschedule({ payload,callback }, { call, put }) {
            const response = yield call(removeonlyorderfromschedule, payload);
            if (callback) callback(response);
        },
        *downtoschedule({ payload,callback }, { call, put }) {
            const response = yield call(downtoschedule, payload);
            if (callback) callback(response);
        },

    },

    reducers: {
        onShowPage(state, action) {
            return {
                ...state,
                showPage: action.showPage,
                entityUuid: action.entityUuid
            }
        }
    },
}