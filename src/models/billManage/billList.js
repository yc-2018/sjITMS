import {cost,modify,remove,page,audit} from '@/services/billManage/billList';
export default {
    namespace: 'billList',
    subscriptions: {
      /**
       * 监听浏览器地址
       * @param dispatch 触发器，用于触发 effects 中的 query 方法
       * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
       */
      setup ({ dispatch, history }) {
        history.listen((location) => {
          if(location.payload && location.pathname == "/billmanage/billList"){
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
        showPage:'create',
        entityUuid:'',
        fromView:'',
        entity:{}
    },
  
    effects: { 

        *showPage({ payload }, { call, put }) {
          yield put({
          type: 'onShowPage',
          showPage: payload.showPage,
          entityUuid: payload.entityUuid,
          fromView: payload.fromView
        });
      },
    
      *cost({payload,callback},{call, put}){
        const response = yield call(cost,payload);
        if(callback) callback(response);
      },

      *modify({payload,callback},{call, put}){
        const response = yield call(modify,payload);
        if(callback) callback(response);
      },
      
      *remove({payload,callback},{call, put}){
        const response = yield call(remove,payload);
        if(callback) callback(response);
      },
      *page({payload,callback},{call,put}){
        const response = yield call(page,payload);
        if(response && response.success){
            yield put({
                type: 'onSave',
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
      *audit({payload,callback},{call,put}){
        const response = yield call(page,payload);
        if(callback) callback(response);
      }
    },
  
    reducers: {
    onSave(state,action){
        return {
            ...state,
            data: action.payload,
        }
    },
  
    onShowPage(state, action) {
        return {
          ...state,
          showPage: action.showPage,
          entityUuid: action.entityUuid?action.entityUuid:state.entityUuid,
          importType: action.importType?action.importType:state.importType,
          fromView: action.fromView?action.fromView:state.fromView
        }
      }
    },
}
