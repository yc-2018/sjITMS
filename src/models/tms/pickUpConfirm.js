import { queryArticleItem,confirmed } from '@/services/tms/PickUpConfirm';

export default {
    namespace: 'pickUpConfirm',
    subscriptions: {
        /**
         * 监听浏览器地址
         * @param dispatch 触发器，用于触发 effects 中的 query 方法
         * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
         */
        setup ({ dispatch, history }) {
          history.listen((location) => {
            if(location.payload && location.pathname == "/tms/pickUpConfirm"){
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
        // entity: {},
        entityUuid: '',
        showPage: 'query'
    },

    effects: {
      *queryArticleItem({ payload, callback }, { call, put }) {
        const response = yield call(queryArticleItem, payload);
        if (callback) callback(response);
      },

      *onConfirm({ payload, callback }, { call, put }) {
        const response = yield call(confirmed, payload);
        if (callback) callback(response);
      },
      
      *showPage({ payload }, { call, put }) {
        yield put({
          type: 'onShowPage',
          showPage: payload.showPage,
          entityUuid: payload.entityUuid,
        });
      },
    },

    reducers: {
        save(state, action) {
            return {
                ...state,
                data: action.payload,
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