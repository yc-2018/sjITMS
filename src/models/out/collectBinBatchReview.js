import { queryStoreInfos,batchReview } from '@/services/inner/CollectBinReviewBill';

export default {
  namespace: 'collectBinBatchReview',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    entity: {},
    showPage: 'query'
  },
  effects: {
    *queryStoreInfos({payload,callback}, {call,put}) {
      const response = yield call(queryStoreInfos, payload);
      if(response.success){
        yield put({
          type: 'save',
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
      if (callback) callback(response);
    },
    *batchReview({payload,callback}, {call,put}) {
      const response = yield call(batchReview, payload);
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
        entityUuid: action.entityUuid
      }
    }
  },
}
