import {query,save,getById,modify,deleteById} from '@/services/zz/ZzTest';



export default {
    namespace: 'zztest',
  
    subscriptions: {
      /**
       * 监听浏览器地址
       * @param dispatch 触发器，用于触发 effects 中的 query 方法
       * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
       */
      setup ({ dispatch, history }) {
        history.listen((location) => {
          if(location.payload && location.pathname == "/test/ZzTest"){
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
      showPage: 'query',
      entity: {}
    },
    effects: {
      *query({ payload, callback }, { call, put }) {
        const response = yield call(query, payload);
        if (response && response.success) {
          console.log("zztest接收到的list为",response.data.records)
          yield put({
            type: 'save',
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
        if (callback) callback(response);
      },
      *onSave({ payload, callback }, { call, put }) {
        const response = yield call(save, payload);
        if (response && response.success) {
          yield put({
            type: 'onShowPage',
            showPage: 'query',
            entityUuid: response.data
          });
        }
        if (callback) callback(response);
      },
      *onModify({ payload, callback }, { call, put }) {
        const response = yield call(modify, payload);
        if (response && response.success) {
          yield put({
            type: 'onShowPage',
            showPage: 'view',
            entityUuid: payload.id
          });
        }
        if (callback) callback(response);
      },
      *getById({ payload, callback }, { call, put }) {
        const response = yield call(getById, payload);
        console.log("接受到的pojo为", response.data)
        if (response && response.success) {
          yield put({
            type: 'onView',
            entity: response.data
          });
        }
        if (callback) callback(response);
      },
      *onDelete({ payload, callback }, { call, put }) {
        const response = yield call(deleteById, payload);
        // if (response && response.success) {
        //   yield put({
        //     type: 'onShowPage',
        //     showPage: 'query',
        //     entityUuid: payload.id
        //   });
        // }
        if (callback) callback(response);
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
      save(state, action) {
        return {
          ...state,
          data: action.payload,
        };
      },
      onShowPage(state, action) {
        return {
          ...state,
          showPage: action.showPage,
          entityUuid: action.entityUuid,
          importTemplateUrl: action.importTemplateUrl,
          importType: action.importType,
          fromView: action.fromView
        }
      },
      onView(state, action) {
        return {
          ...state,
          entity: action.entity
        };
      },
    },
  }
  