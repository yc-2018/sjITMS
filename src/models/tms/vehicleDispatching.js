import { queryOrder,queryShipPlan,saveShipPlan,modifyShipPlan,saveShipPlanOnly,modifyShipPlanOnly,
    addordertoschedule,updateorderpendingtag,removeorderfromschedule,remove } from '@/services/tms/vehicleDispatching';

export default {
    namespace: 'vehicleDispatching',

    state: {
        orderData: {
            list: [],
        },
        pendingOrderData: {
            list: [],
        },
        shipPlanData: {
            list: [],
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
        *queryOrder({ payload }, { call, put }) {
            const response = yield call(queryOrder, payload.searchKeyValues);
            if (response.success) {
                yield put({
                    type: 'saveOrder',
                    payload: {list:response.data?response.data:[]}
                });
            }
        },
        *queryPendingOrder({ payload }, { call, put }) {
            const response = yield call(queryOrder, payload.searchKeyValues);
           
            if (response.success) {
                yield put({
                    type: 'savePendingOrder',
                    payload: {list:response.data?response.data:[]}
                });
            }
        },
        *queryShipPlan({ payload }, { call, put }) {
            const response = yield call(queryShipPlan, payload.searchKeyValues);
                if (response.success) {
                yield put({
                    type: 'saveShipPlan',
                    payload: {list:response.data?response.data:[]}

                });
            }
        },

        *onSaveShipPlan({ payload,callback }, { call, put }) {
            const response = yield call(saveShipPlan, payload);
            if (callback) callback(response);
        },
        *onModifyShipPlan({ payload,callback }, { call, put }) {
            const response = yield call(modifyShipPlan, payload);
            if (callback) callback(response);
        },
        *onSaveShipPlanOnly({ payload,callback }, { call, put }) {
            const response = yield call(saveShipPlanOnly, payload);
            if (callback) callback(response);
        },
        *onModifyShipPlanOnly({ payload,callback }, { call, put }) {
            const response = yield call(modifyShipPlanOnly, payload);
            if (callback) callback(response);
        },
        *addordertoschedule({ payload,callback }, { call, put }) {
            const response = yield call(addordertoschedule, payload);
            if (callback) callback(response);
        },
        *removeorderfromschedule({ payload,callback }, { call, put }) {
            const response = yield call(removeorderfromschedule, payload);
            if (callback) callback(response);
        },

        *updateorderpendingtag({ payload,callback }, { call, put }) {
            const response = yield call(updateorderpendingtag, payload);
            if (callback) callback(response);
        },
        *onRemove({ payload,callback }, { call, put }) {
            const response = yield call(remove, payload);
            if (callback) callback(response);
        },

    },

    reducers: {
        saveOrder(state, action) {
            return {
                ...state,
                orderData: action.payload,
            };
        },
        savePendingOrder(state, action) {
            return {
                ...state,
                pendingOrderData: action.payload,
            };
        },
        saveShipPlan(state, action) {
            return {
                ...state,
                shipPlanData: action.payload,
            };
        },
        onView(state, action) {
            return {
                ...state,
                entity: action.payload
            }
        },
        onShowPage(state, action) {
            return {
                ...state,
                showPage: action.showPage,
                entityUuid: action.entityUuid
            }
        }
    },
}