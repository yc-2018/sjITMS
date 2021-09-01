import {batchImport} from '@/services/billManage/billDataImport';
  
  export default {
    namespace: 'dataImport',
    subscriptions: {
      /**
       * 监听浏览器地址
       * @param dispatch 触发器，用于触发 effects 中的 query 方法
       * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
       */
      setup ({ dispatch, history }) {
        history.listen((location) => {
          if(location.payload && location.pathname == "/billmanage/dataImport"){
            dispatch({
              type: 'showPage',
              payload: location.payload,
            })
          }
        });
      },
    },
    state: {
        importType:'BILLDATA'
    },
  
    effects: {
     
      *showPage({ payload }, { call, put }) {
        yield put({
          type: 'onShowPage',
          showPage: payload.showPage,
          entityUuid: payload.entityUuid,
          importType: payload.importType,
          fromView: payload.fromView
        });
      },
  
      *batchImport({ payload, callback }, { call, put }) {
        const response = yield call(batchImport, payload);
        if (callback) callback(response);
      },
    },
  
    reducers: {
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
  