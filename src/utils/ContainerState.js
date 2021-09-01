export const containerState = {
    IDLE: {
        name: 'IDLE',
        caption: '空闲'
    },
    LOCKED: {
        name: 'LOCKED',
        caption: '已锁定'
    },
    RECEIVING: {
        name: 'RECEIVING',
        caption: '收货中'
    },
    RTNWRHRECEIVING: {
        name: 'RTNWRHRECEIVING',
        caption: '好退退仓收货中'
    },
    RTNVENDORRECEIVING: {
        name: 'RTNVENDORRECEIVING',
        caption: '返厂退仓收货中'
    },
    MOVING: {
        name: 'MOVING',
        caption: '平移中'
    },
    ALLOCATING: {
      name: 'ALLOCATING',
      caption: '分拨中'
    },
    PUTAWAYING: {
        name: 'PUTAWAYING',
        caption: '上架中'
    },
    RTNPUTAWAYING: {
        name: 'RTNPUTAWAYING',
        caption: '退仓上架中'
    },
    MERGERING: {
        name: 'MERGERING',
        caption: '拆并中'
    },
    SHIFTING: {
        name: 'SHIFTING',
        caption: '移库中'
    },
    ABORTED: {
        name: 'ABORTED',
        caption: '已作废'
    },
    STACONTAINERMOVELOCKED: {
        name: 'STACONTAINERMOVELOCKED',
        caption: '移库锁定'
    },
    USEING: {
        name: 'USEING',
        caption: '已使用'
    },
    PICKUPING: {
        name: 'PICKUPING',
        caption: '拣货中'
    },
    HANDOVERING: {
        name: 'HANDOVERING',
        caption: '交接中'
    },
    SHIPING: {
        name: 'SHIPING',
        caption: '装车中'
    },
    SHIPED: {
        name: 'SHIPED',
        caption: '已装车'
    },
    INSTORE: {
        name: 'INSTORE',
        caption: '在门店'
    }
}

export function getStateCaption(state) {
    let caption;

    for (let x in containerState) {
        if (containerState[x].name === state) {
            caption = containerState[x].caption;
            break;
        }
    }

    return caption;
}