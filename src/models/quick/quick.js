import { queryData, queryColumns, queryAllData, queryCreateConfig,saveOrUpdateEntities,dynamicDelete } from '@/services/quick/Quick';
import { colWidth } from '@/utils/ColWidth';

export default {
  namespace: 'quick',

  subscriptions: {
    /**
     * 监听浏览器地址
     * @param dispatch 触发器，用于触发 effects 中的 query 方法
     * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
     */
    setup({ dispatch, history }) {
      history.listen(location => {
        if (location.payload && location.pathname == '/quick') {
          dispatch({
            type: 'showPage',
            payload: location.payload,
          });
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
    showPageMap:new Map(),
  },
  effects: {
    *queryColumns({ payload, callback }, { call }) {
      const response = yield call(queryColumns, payload);
      if (callback) callback(response);
    },
    *queryData({ payload, callback }, { call }) {
      const response = yield call(queryData, payload);
      if (callback) callback(response);
    },
    *queryAllData({ payload, callback }, { call, put }) {
      const response = yield call(queryAllData, payload);
      if (callback) callback(response);
    },
    *queryCreateConfig({ payload, callback }, { call, put }) {
      const response = yield call(queryCreateConfig, payload);
      if (callback) callback(response);
    },
    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid,
        fromView: payload.fromView,
      });
    },
  *saveOrUpdateEntities({ payload, callback }, { call, put }){
    const response = yield call(saveOrUpdateEntities, payload.param);
    if (response && response.success) {
      var showPageMap = new Map()
      showPageMap.set(payload.showPageK,payload.showPageV);
      yield put({
        type: 'onShowPageMap',
        showPageMap: showPageMap,
      });
      }
  if (callback) callback(response);
  },
  *dynamicDelete({ payload, callback }, { call, put }){
    const response = yield call(dynamicDelete, payload.params);
    // if (response && response.success) {
    //   var showPageMap = new Map()
    //   showPageMap.set(payload.showPageK,payload.showPageV);
    //   yield put({
    //     type: 'onShowPageMap',
    //     showPageMap: showPageMap,
    //   });
    //   }
  if (callback) callback(response);
  },
  *showPageMap({ payload }, { call, put }) {
    var showPageMap = new Map()
    showPageMap.set(payload.showPageK,payload.showPageV);
    yield put({
      type: 'onShowPageMap',
      showPageMap: showPageMap,
      });
    }
  },
  reducers: {
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
        importTemplateUrl: action.importTemplateUrl,
        importType: action.importType,
        fromView: action.fromView,
      };
    },
    onView(state, action) {
      return {
        ...state,
        entity: action.entity,
      };
    },
    onShowPageMap(state, action) {
      let mapGra = state.showPageMap;
      for (var [k, v] of action.showPageMap) {
        mapGra.set(k, v);
      }
      return {
        ...state,
        showPageMap: mapGra,
      };
    },
  },
};
