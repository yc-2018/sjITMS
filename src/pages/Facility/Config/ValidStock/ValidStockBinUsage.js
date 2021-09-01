export const binUsage = {
    StorageBin: {
        name: 'StorageBin',
        caption: '存储位',
        disableChecked: true,
    },
    PickUpStorageBin: {
        name: 'PickUpStorageBin',
        caption: '拣货存储位',
        disableChecked: true,
    },
    PickUpBin: {
        name: 'PickUpBin',
        caption: '拣货位',
        disableChecked: true,
    },
    UnifyReceiveStorageBin: {
        name: 'UnifyReceiveStorageBin',
        caption: '统配收货暂存位',
    },
    PickTransitBin: {
      name: 'PickTransitBin',
      caption: '上架中转位'
    },
    EndProductProcessBin:{
      name:'EndProductProcessBin',
      caption:'成品加工位'
    },
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
