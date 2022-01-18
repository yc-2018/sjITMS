import {queryDate,queryColumns,queryAllDate} from '@/services/quick/Quick';
import { colWidth } from '@/utils/ColWidth';





export default {
    namespace: 'quick',
  
    subscriptions: {
      /**
       * 监听浏览器地址
       * @param dispatch 触发器，用于触发 effects 中的 query 方法
       * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
       */
      setup ({ dispatch, history }) {
        history.listen((location) => {
          if(location.payload && location.pathname == "/quick"){
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
        pagination: {},
      },
      showPage: 'query',
      entity: {},
      map:new Map()
    },
    effects: {
      *queryColumns({ payload, callback }, { call, put }) {
        const response = yield call(queryColumns, payload);
        if (response && response.success) {
            console.log("可以吗？",response)
            const columnsz =  response.result.columns;
            var columns = [];   
            for(var i = 0;i<columnsz.length;i++){
              var column = {
                title:columnsz[i].fieldTxt,
                dataIndex:columnsz[i].fieldName,
                key:columnsz[i].fieldName,
                sorter:true,
                width:colWidth.codeColWidth,
                fieldType:columnsz[i].fieldType
                }
                columns[i] = column;
            }
            var map = new Map()
            map.set(payload.reportCode+'columns',columns)
            map.set(payload.reportCode+'reportHeadName',response.result.reportHeadName)
            yield put({
            type: 'save',
            payload: {
                quickuuid:payload,
                map
               },
            });
        }
        if (callback) callback(response);
      },
      *queryDate({ payload, callback }, { call, put }) {
        const response = yield call(queryDate, payload);
        if (response && response.success) {
            console.log("获取到的数据为",response)
            let lists = []
            if(response.data.records!=null){
               lists = response.data.records
            }
            var data={
              list: response.data.records,
              pagination: {
                total: response.data.paging.recordCount,
                pageSize: response.data.paging.pageSize,
                current: response.data.page ,
                showTotal: total => `共 ${total} 条`,
              },
            }
            var map = new Map()
            map.set(payload.quickuuid+'data',data)
            yield put({
            type: 'save',
            payload: {
                quickuuid:payload.quickuuid,
                map
               },
              });
            }
        if (callback) callback(response);
      },
      *queryAllDate({ payload, callback }, { call, put }){
        const response = yield call(queryAllDate, payload);
        if (response && response.success) {
          var data={
            list: response.data.records,
          }
          var map = new Map()
          map.set(payload.quickuuid+'data',data)
          yield put({
          type: 'save',
          payload: {
              quickuuid:payload.quickuuid,
              map
             },
            });
          }
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
        console.log("page",action.payload)
        let mapGra =state.map;
        for (var [k,v] of action.payload.map) {
          mapGra.set(k,v)
        }
        return {
          ...state,
          data:action.payload,
          map:mapGra
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
  