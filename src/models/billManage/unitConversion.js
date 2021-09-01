
import { query,save,remove,get,update } from '@/services/billManage/unitConversion';
export default {
    namespace: 'unitConversion',
    subscriptions: {
      /**
       * 监听浏览器地址
       * @param dispatch 触发器，用于触发 effects 中的 query 方法
       * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
       */
      setup ({ dispatch, history }) {
        history.listen((location) => {
          if(location.payload && location.pathname == "/billmanage/unitConversion"){
            dispatch({
              type: 'showPage',
              payload: location.payload,
            })
          }
        });
      },
    },
    state: {
        data:{},
        showPage:'query',
        entityUuid:'',
        fromView:'',
        entity:{}
    },
  
    effects: {
      *query({payload},{call,put}){
        const response = yield call(query, payload);
        if (response && response.success && response.data) {
          yield put({
            type: 'onQuery',
            payload: {
              list: response.data.records ? response.data.records : [],
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

      *save({payload,callback},{call,put}){
        const response = yield call(save, payload);
        if(callback) callback(response);
      },

      *update({payload,callback},{call,put}){
        const response = yield call(update, payload);
        if(callback) callback(response);
      },


      *remove({payload,callback},{call,put}){
        const response = yield call(remove, payload);
        if(callback) callback(response);
      },
      
      *get({payload,callback},{call,put}){
        const response = yield call(get, payload);
        if(response && response.success){
          yield put({
            type: 'onView',
            payload:response.data
          })
        }
       
      },

      *showPage({ payload }, { call, put }) {
        yield put({
          type: 'onShowPage',
          showPage: payload.showPage,
          entityUuid: payload.entityUuid,
          fromView: payload.fromView
        });
      },
    
    },
  
    reducers: {
      onQuery(state, action) {
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
          entityUuid: action.entityUuid,
          importType: action.importType,
          fromView: action.fromView
        }
      }
    },
  }
  