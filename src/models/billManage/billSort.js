import {bigSort,modify,page,queryByCodeOrName,querySortGroup,remove,
    smallSortpage,smallSortmodify,smallSort,smallSortremove,smallObjectpage,smallSortByUuid,
    smallObjectremove,smallObject} from '@/services/billManage/billSort';

export default {
    namespace: 'billSort',
    subscriptions: {
      /**
       * 监听浏览器地址
       * @param dispatch 触发器，用于触发 effects 中的 query 方法
       * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
       */
      setup ({ dispatch, history }) {
        history.listen((location) => {
          if(location.payload && location.pathname == "/billmanage/billSort"){
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
       bigEntity:{},
       smallEntity:{},
       existSortObject:[],
       bigSorts:[],
       smallSorts:[],
       pagination:{}
    },
  
    effects: {
        *bigSort({payload,callback},{call,put}){
            const response = yield call(bigSort,payload);
            if(callback) callback(response);
        },
        *smallSort({payload,callback},{call,put}){
            const response = yield call(smallSort,payload);
            if(callback) callback(response);
        },
        *smallObject({payload,callback},{call,put}){
            const response = yield call(smallObject,payload);
            if(callback) callback(response);
        },
        *smallSortmodify({payload,callback},{call,put}){
            const response = yield call(smallSortmodify,payload);
            if(callback) callback(response);
        },
        *modify({payload,callback},{call,put}){
            const response = yield call(modify,payload);
            if(callback) callback(response);
        },

        *page({payload,callback},{call,put}){
            const response = yield call(page);
            if (response && response.success) {
                yield put({
                  type: 'onSorts',
                  payload: {
                    bigSorts: response.data ? response.data : [],
                    
                  },
                });
              }
        },
        *smallObjectpage({payload,callback},{call,put}){
            const response = yield call(smallObjectpage,payload);
            if (response && response.success) {
                yield put({
                  type: 'onSorts',
                  payload: {
                    existSortObject: response.data.records ? response.data.records : [],
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
        *queryByCodeOrName({payload,callback},{call,put}){
            const response = yield call(queryByCodeOrName,payload);
            if (response && response.success) {
                yield put({
                  type: 'onSave',
                  payload: {
                      bigEntity:response.data ? response.data : [],
                  } 
                });
              }
        },
        *smallSortByUuid({payload,callback},{call,put}){
          const response = yield call(smallSortByUuid,payload);
          if (response && response.success) {
              yield put({
                type: 'onSave',
                payload: {
                    smallEntity:response.data ? response.data : [],
                } 
              });
            }
        },
        *querySortGroup({payload,callback},{call,put}){
            const response = yield call(querySortGroup,payload);
            if (response && response.success) {
                yield put({
                  type: 'onQuery',
                  payload: response.data ? response.data : [],
                  
                });
              }
        },
        *remove({payload,callback},{call,put}){
            const response = yield call(remove,payload);
            if(callback) callback(response);
        },
        *smallSortremove({payload,callback},{call,put}){
            const response = yield call(smallSortremove,payload);
            if(callback) callback(response);
        },
        *smallObjectremove({payload,callback},{call,put}){
            const response = yield call(smallObjectremove,payload);
            if(callback) callback(response);
        },
        *smallSortpage({payload,callback},{call,put}){
            const response = yield call(smallSortpage,payload);
            if (response && response.success) {
                yield put({
                  type: 'onSorts',
                  payload:{
                   smallSorts: response.data ? response.data : [],
                  } 
                });
              }
        },


       *showPage({ payload }, { call, put }) {
        yield put({
          type: 'onShowPage',
          showPage: payload.showPage,
          entityUuid: payload.entityUuid,
          importType: payload.importType,
          fromView: payload.fromView
        });
      },
  
    },
  
    reducers: {
      onView(state, action) {
        return {
          ...state,
          entity: action.payload
        }
      },
      onSave(state, action){
        return {
            ...state,
            entity: action.entity?action.entity:state.entity,
            smallEntity:action.smallEntity?action.smallEntity:state.smallEntity
          };
      },
      onQuery(state, action) {
        return {
          ...state,
          data: action.payload,
        };
      },
      onSorts(state, action){
        return {
            ...state,
            smallSorts:action.payload.smallSorts?action.payload.smallSorts:state.smallSorts,
            bigSorts:action.payload.bigSorts?action.payload.bigSorts:state.bigSorts,
            existSortObject:action.payload.existSortObject?action.payload.existSortObject:state.existSortObject,
            pagination:action.payload.pagination?action.payload.pagination:state.pagination
          };
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