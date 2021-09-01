import {
    save, onLine, offLine, get, modify, query,getByCodeAndDcUuid
} from '@/services/basic/Wrh';
import {
    getByCompanyUuid
} from '@/services/basic/DC';

export default {
    namespace: 'wrh',
    subscriptions: {
        /**
         * 监听浏览器地址
         * @param dispatch 触发器，用于触发 effects 中的 query 方法
         * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
         */
        setup ({ dispatch, history }) {
          history.listen((location) => {
            if(location.payload && location.pathname == "/facility/wrh"){
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
        showPage: 'query'
    },

    effects: {
        *query({ payload }, { call, put }) {
            const response = yield call(query, payload);
            if(response.success){
              yield put({
                type: 'success',
                payload: {
                  list: response.data.records,
                  pagination: {
                    total: response.data.paging.recordCount,
                    pageSize: response.data.paging.pageSize,
                    current: response.data.page + 1,
                    showTotal: total => `共 ${total} 条`,
                  },
                },
              });
            }
        },

        *get({ payload, callback }, { call, put }) {
            const response = yield call(get, payload);
            yield put({
                type: 'getOnView',
                payload: response.data,
            });
            if (callback) callback(response);
        },
        *getByCodeAndDcUuid({ payload, callback }, { call, put }) {
          const response = yield call(getByCodeAndDcUuid, payload);
          yield put({
            type: 'getOnView',
            payload: response.data,
          });
          if (callback) callback(response);
      },


        *add({ payload, callback }, { call, put }) {
            const response = yield call(save, payload);
            if (callback) callback(response);
        },
        *modify({ payload, callback }, { call, put }) {
            const response = yield call(modify, payload);
            if (callback) callback(response);
        },
        *enable({ payload, callback }, { call, put }) {
            const response = yield call(onLine, payload);
            if (callback) callback(response);
        },
        *disable({ payload, callback }, { call, put }) {
            const response = yield call(offLine, payload);
            if (callback) callback(response);
        },
        *onCancel({ payload, callback }, { call, put }) {
            yield put({
                type: 'success',
                payload: {
                    showDetailView: false,
                    showDetailEditForm: false
                }
            });
            if (callback) callback();
        },
        *onCancelEdit({ payload, callback }, { call, put }) {
            yield put({
                type: 'success',
                payload: {
                    showEditView: false,
                    showDetailEditForm: false
                }
            });
            if (callback) callback();
        },
        *onViewCreate({ payload, callback }, { call, put }) {
            yield put({
                type: 'success',
                payload: {
                    showEditView: true,
                    wrh: payload
                }
            });
        },
        *onViewDetail({ payload, callback }, { call, put }) {
            yield put({
                type: 'success',
                payload: {
                    showDetailView: true,
                    wrh: payload
                }
            });
        },
        *getDCByCompanyUuid({ payload, callback }, { call, put }) {
            const response = yield call(getByCompanyUuid, payload);
            yield put({
                type: 'saveDC',
                payload: {
                    dcs: response.data
                }
            });
            if (callback) callback(response);
        },
        *showPage({ payload }, { call, put }) {
            yield put({
                type: 'onShowPage',
                showPage: payload.showPage,
                entityUuid: payload.entityUuid,
                entity: payload.entity,
                fromView: payload.fromView
            });
        },
    },

    reducers: {
        success(state, action) {
            return {
                ...state,
                data: action.payload,
            };
        },
        getOnView(state, action) {
            return {
                ...state,
                entity: action.payload,
            };
        },
        saveDC(state, action) {
            return {
                ...state,
                ...action.payload,
            };
        },
        onShowPage(state, action) {
            return {
                ...state,
                showPage: action.showPage,
                entityUuid: action.entityUuid,
                entity: action.entity,
                fromView: action.fromView
            }
        }
    },
};
