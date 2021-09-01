import { addorderaticlestoschedule,removeorderarticlesfromschedule,adjust } from '@/services/tms/PickUpDispatching';

export default {
    namespace: 'pickUpDispatching',

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
       
        *addorderaticlestoschedule({ payload,callback }, { call, put }) {
            const response = yield call(addorderaticlestoschedule, payload);
            if (callback) callback(response);
        },
        *removeorderarticlesfromschedule({ payload,callback }, { call, put }) {
            const response = yield call(removeorderarticlesfromschedule, payload);
            if (callback) callback(response);
        },
        *onAdjust({ payload,callback }, { call, put }) {
            const response = yield call(adjust, payload);
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