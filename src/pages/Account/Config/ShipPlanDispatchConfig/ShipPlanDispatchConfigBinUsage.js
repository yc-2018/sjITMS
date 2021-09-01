export const binUsage = {
    CollectBin: {
        name: 'CollectBin',
        caption: '集货位',
        describe: '勾选后可在排车看板页面查看集货位上的信息',
        disableChecked: true
    },
    UnifyCollectTemporaryBin: {
        name: 'UnifyCollectTemporaryBin',
        caption: '统配集货暂存位',
        describe: '勾选后可在排车看板页面查看统配集货暂存位上的信息'
    },
    CrossCollectTempBin: {
        name: 'CrossCollectTempBin',
        caption: '越库集货暂存位',
        describe: '勾选后可在排车看板页面查看越库集货暂存位上的信息'
    },
    StoreAllocateBin: {
        name: 'StoreAllocateBin',
        caption: '门店分拨位',
        describe: '勾选后可在排车看板页面查看门店分拨位上的信息'
    }
}

export function getUsageCaption(usage) {
    let caption;
    Object.keys(binUsage).forEach(function (key) {
        if (binUsage[key].name === usage) {
            caption = binUsage[key].caption;
        }
    });
    return caption;
}