/**状态 */
export const State = {
    SAVED: {
        name: 'SAVED',
        caption: '已保存'
    },
    APPROVED: {
        name: 'APPROVED',
        caption: '已批准'
    },
    SHIPPROGRESS: {
        name: 'SHIPPROGRESS',
        caption: '装车中'   
    },
    FINISHED: {
        name: 'FINISHED',
        caption: '已完成'
    },
    ABORTED: {
        name: 'ABORTED',
        caption: '已作废'
    },
    ABORTEDAFTERSHIPED: {
      name: 'ABORTEDAFTERSHIPED',
      caption: '装车后作废'
    }
}

export const WorkType = {
    DRIVER: {
        name: 'DRIVER',
        caption: '驾驶员'
    },
    STEVEDORE: {
        name: 'STEVEDORE',
        caption: '装卸员'
    }
}

export const ShipPlanType = {
    DELIVERY: {
        name: 'DELIVERY',
        caption: '配送'
    },
    TRANSPORT: {
        name: 'TRANSPORT',
        caption: '转运'
    },
    TRANSFER: {
        name: 'TRANSFER',
        caption: '调拨'
    },
    RTN: {
        name: 'RTN',
        caption: '退仓'
    }
}


export function getStateCaption(name) {
    let caption;
    Object.keys(State).forEach(function (key) {
        if (State[key].name === name)
            caption = State[key].caption;
    });
    return caption;
}

