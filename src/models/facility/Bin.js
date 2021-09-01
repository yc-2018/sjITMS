import {
    saveZone, savePath, saveShelf, saveBin, queryZone, queryShelf, queryPath, queryBin,
    remove, getZoneByCode, queryList, genPathCode, genShelfCode, genBinCode,
    getBinByCode, alterBinUsage, alterBinType, queryBinTree, getSimBin,
    queryBinForArticleBusiness, queryByBincodes,batchUpBin, getContainersByBinCode
} from '@/services/facility/Bin';

export default {
    namespace: 'bin',

    state: {
        zone: {
            list: [],
            pagination: {},
        },
        path: {
            list: [],
            pagination: {},
        },
        shelf: {
            list: [],
            pagination: {},
        },
        bin: {
            list: [],
            pagination: {},
        },
        simBinList: [],
        binFacilityType: '',
        binTreeData: [],
        stock: {
            list: [],
            pagination: {},
        },
        binEntity: {},
        bins: [],
        zoneEntity: {}
    },

    effects: {
        *queryZone({ payload }, { call, put }) {
            const response = yield call(queryZone, payload);
            if (response.success) {
                yield put({
                    type: 'successZone',
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
        },
        *queryPath({ payload }, { call, put }) {
            const response = yield call(queryPath, payload);
            if (response.success) {
                yield put({
                    type: 'successPath',
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
        },
        *queryShelf({ payload }, { call, put }) {
            const response = yield call(queryShelf, payload);
            yield put({
                type: 'successShelf',
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
        },
        *queryBin({ payload }, { call, put }) {
            const response = yield call(queryBin, payload);
            if (response.success) {
                yield put({
                    type: 'successBin',
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
        },
        *queryStock({ payload }, { call, put }) {
            const response = yield call(queryBin, payload);
            if (response.success) {
                yield put({
                    type: 'successStock',
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
        },
        *queryList({ payload, callback }, { call, put }) {
            const response = yield call(queryList, payload);
            yield put({
                type: 'successSimBin',
                payload: response.data,
            });
            if (callback) callback(response);
        },
        *queryBinTree({ payload, callback }, { call, put }) {
            const response = yield call(queryBinTree, payload);
            yield put({
                type: 'successSimBin',
                payload: response.data,
            });
            if (callback) callback(response);
        },
        *addZone({ payload, callback }, { call, put }) {
            const response = yield call(saveZone, payload);
            if (callback) callback(response);
        },
        *genPathCode({ payload, callback }, { call, put }) {
            const response = yield call(genPathCode, payload);
            yield put({
                type: 'successSimBin',
                payload: response.data
            });
            if (callback) callback(response);
        },
        *genShelfCode({ payload, callback }, { call, put }) {
            const response = yield call(genShelfCode, payload);
            yield put({
                type: 'successSimBin',
                payload: response.data
            });
            if (callback) callback(response);
        },
        *genBinCode({ payload, callback }, { call, put }) {
            const response = yield call(genBinCode, payload);
            yield put({
                type: 'successSimBin',
                payload: response.data
            });
            if (callback) callback(response);
        },
        *modify({ payload, callback }, { call, put }) {
            const response = yield call(modify, payload);
            if (callback) callback(response);
        },
        *alterBinType({ payload, callback }, { call, put }) {
            const response = yield call(alterBinType, payload);
            if (callback) callback(response);
        },
        *alterBinUsage({ payload, callback }, { call, put }) {
            const response = yield call(alterBinUsage, payload);
            if (callback) callback(response);
        },
        *batchUpBin({ payload, callback }, { call, put }) {
            const response = yield call(batchUpBin, payload);
            if (callback) callback(response);
        },
        *remove({ payload, callback }, { call, put }) {
            const response = yield call(remove, payload);
            if (callback) callback(response);
        },
        *getBinByCode({ payload, callback }, { call, put }) {
            const response = yield call(getBinByCode, payload);
            yield put({
                type: 'successBinEntity',
                payload: response.data
            });
            if (callback) callback(response);
        },
        *getSimBinByCode({ payload, callback }, { call, put }) {
            const response = yield call(getSimBin, payload);
            if (callback) callback(response);
        },
        *queryBinForArticleBusiness({ payload, callback }, { call, put }) {
            const response = yield call(queryBinForArticleBusiness, payload);
            yield put({
                type: 'saveBinForArticleBusiness',
                payload: response.data
            })
            if (callback) callback(response);
        },
        *queryByBincodes({ payload, callback }, { call, put }) {
            const response = yield call(queryByBincodes, payload);
            yield put({
                type: 'onQueryBins',
                payload: response.data
            })
        },
        *getZoneByCode({ payload, callback }, { call, put }) {
            const response = yield call(getZoneByCode, payload);
            yield put({
                type: 'successZoneEntity',
                payload: response.data
            });
        },
        *getContainersByBinCode({ payload, callback }, { call, put }) {
            const response = yield call(getContainersByBinCode, payload);
            yield put({
                type: 'onGetContainersByBinCode',
                payload: response.data
            }); 
            if (callback) callback(response);
        },
    },

    reducers: {
        successZone(state, action) {
            return {
                ...state,
                zone: action.payload,
            };
        },
        successShelf(state, action) {
            return {
                ...state,
                shelf: action.payload,
            };
        },
        successPath(state, action) {
            return {
                ...state,
                path: action.payload,
            };
        },
        successBin(state, action) {
            return {
                ...state,
                bin: action.payload,
            };
        },
        successStock(state, action) {
            return {
                ...state,
                stock: action.payload,
            };
        },
        success(state, action) {
            return {
                ...state,
                simBinList: action.payload,
            };
        },
        successTree(state, action) {
            return {
                ...state,
                binTreeData: action.payload,
            };
        },
        successSimBin(state, action) {
            return {
                ...state,
                simBinList: action.payload,
            };
        },
        successBinEntity(state, action) {
            return {
                ...state,
                binEntity: action.payload,
            };
        },
        successZoneEntity(state, action) {
            return {
                ...state,
                zoneEntity: action.payload,
            };
        },
        saveBinForArticleBusiness(state, action) {
            return {
                ...state,
                binListBusiness: action.payload,
            }
        },
        onQueryBins(state, action) {
            return {
                ...state,
                bins: action.payload
            }
        },
        onGetContainersByBinCode(state, action) {
            return {
                ...state,
                containers: action.payload ? action.payload : [],
            }
        },
    },
};
