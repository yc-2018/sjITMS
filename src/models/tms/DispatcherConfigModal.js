import {
   getByCompanyUuid
} from '@/services/tms/DispatcherConfig';

export default {
    namespace: 'dispatcherconfigModal',

    state: {
        data: {
            list: [],
            pagination: {}
        }
    },

    effects: {
        *getByCompanyUuid({payload,callback}, { call, put }) {
            const response = yield call(getByCompanyUuid, payload);
            if(response.success){
                yield put({
                    type:'getByCompanyUuids',
                    payload:response.data
                })
            }
        },
    },

    reducers: {
        getByCompanyUuids(state, action) {
            return {
                ...state,
                dispatchData: action.payload,
            };
        },
    }
};