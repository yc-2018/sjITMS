import { getShipPlanByBillNumber,getByRelationBillNumber,move,getShipPlanByUuid } from '@/services/tms/ShipPlanBillDispatch';

export default {
    namespace: 'relationplanbill',
    subscriptions: {
        /**
         * 监听浏览器地址
         * @param dispatch 触发器，用于触发 effects 中的 query 方法
         * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
         */
        setup ({ dispatch, history }) {
          history.listen((location) => {
            if(location.payload && location.pathname == "/tms/relationplanbill"){
              dispatch({
                type: 'showPage',
                payload: location.payload,
              })
            }
          });
        },
    },
    state: {
        data: {
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
        *getShipPlanByBillNumber({ payload }, { call, put }) {
            const response = yield call(getShipPlanByBillNumber, payload);
            if (response.success) {
                yield put({
                    type: 'saveShipPlanBill',
                    payload:response.data
                });
            }
        },
        *getShipPlanByUuid({ payload }, { call, put }) {
            const response = yield call(getShipPlanByUuid, payload);
            if (response.success) {
                yield put({
                    type: 'saveShipPlanBillRelation',
                    payload:response.data
                });
            }
        },
        *onMove({ payload,callback }, { call, put }) {
            const response = yield call(move, payload);
            if(callback) callback(response)

        }

    },

    reducers: {
        saveShipPlanBill(state, action) {
            return {
                ...state,
                shipPlanBill: action.payload,
            };
        },
        saveShipPlanBillRelation(state, action) {
            return {
                ...state,
                shipPlanBillRelation: action.payload,
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