/**状态 */
export const State = {
    SAVED: {
        name: 'SAVED',
        caption: '已保存'
    },
    INPROGRESS: {
        name: 'INPROGRESS',
        caption: '进行中'
    },
    SHIPPED: {
        name: 'SHIPED',
        caption: '已装车'
    },
    DELIVERING: {
        name: 'DELIVERING',
        caption: '配送中',
    },
    RETURNED: {
        name: 'RETURNED',
        caption: '已回车',
    },
    FINISHED: {
        name: 'FINISHED',
        caption: '已完成'
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

export function getStateCaption(name) {
    let caption;
    Object.keys(State).forEach(function (key) {
        if (State[key].name === name)
            caption = State[key].caption;
    });
    return caption;
}

