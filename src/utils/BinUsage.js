export const binUsage = {
    StorageBin: {
        name: 'StorageBin',
        caption: '存储位'
    },
    PickUpStorageBin: {
        name: 'PickUpStorageBin',
        caption: '拣货存储位'
    },
    PickUpBin: {
        name: 'PickUpBin',
        caption: '拣货位'
    },
    UnifyReceiveStorageBin: {
        name: 'UnifyReceiveStorageBin',
        caption: '统配收货暂存位'
    },
    PickUpTemporaryBin: {
        name: 'PickUpTemporaryBin',
        caption: '拣货暂存位'
    },
    RplTemporaryBin: {
        name: 'RplTemporaryBin',
        caption: '补货暂存位'
    },
    PickTransitBin: {
        name: 'PickTransitBin',
        caption: '上架中转位'
    },
    UnifyCollectTemporaryBin: {
        name: 'UnifyCollectTemporaryBin',
        caption: '统配集货暂存位'
    },
    OneStepReceiveStorageBin: {
        name: 'OneStepReceiveStorageBin',
        caption: '一步越库收货暂存位'
    },
    TwoStepReceiveStorageBin: {
        name: 'TwoStepReceiveStorageBin',
        caption: '二步越库收货暂存位'
    },
    MoveTemporaryBin: {
        name: 'MoveTemporaryBin',
        caption: '移库暂存位'
    },
    CollectBin: {
        name: 'CollectBin',
        caption: '集货位'
    },
    VendorRtnReceiveTempBin: {
        name: 'VendorRtnReceiveTempBin',
        caption: '退仓收货暂存位'
    },
    VendorRtnBin: {
        name: 'VendorRtnBin',
        caption: '供应商退货位'
    },
    VendorRtnCollectTempBin: {
        name: 'VendorRtnCollectTempBin',
        caption: '供应商退货集货暂存位'
    },
    VendorRtnCollectBin: {
        name: 'VendorRtnCollectBin',
        caption: '供应商退货集货位'
    },
    VendorRtnPickUpTempBin: {
        name: 'VendorRtnPickUpTempBin',
        caption: '供应商退货拣货暂存位'
    },
    CrossCollectTempBin: {
        name: 'CrossCollectTempBin',
        caption: '越库集货暂存位'
    },
    TwoCrossAllocateTransferBin: {
        name: 'TwoCrossAllocateTransferBin',
        caption: '二步越库分拨中转位'
    },
    StoreAllocateBin: {
        name: 'StoreAllocateBin',
        caption: '门店分拨位'
    },
    Virtuality: {
        name: 'Virtuality',
        caption: '虚拟货位'
    },
    UnifyAdjBin: {
        name: 'UnifyAdjBin',
        caption: '统配更正位'
    },
    TranSitAndStraightAdjBin: {
        name: 'TranSitAndStraightAdjBin',
        caption: '越库更正位'
    },
    RawProcessBin:{
        name:'RawProcessBin',
        caption:'原料加工位'
    },
    EndProductProcessBin:{
        name:'EndProductProcessBin',
        caption:'成品加工位'
    },
    AllocateTransferBin:{
        name:'AllocateTransferBin',
        caption:'分拨中转位'
    },
}

export function getUsageCaption(usage) {
    for (let x in binUsage) {
        if (binUsage[x].name === usage) {
            return binUsage[x].caption;
        }
    }

    return usage ? usage : '';
}