export const operateMethod = {
    MANUAL: {
        name: 'MANUAL',
        caption: '手工单据'
    },
    RF: {
        name: 'RF',
        caption: '手持终端'
    },
    RFID: {
        name: 'RFID',
        caption: '电子标签'
    },
    LABEL: {
        name: 'LABEL',
        caption: '标签拣货'
    },
    ROBOT: {
        name: 'ROBOT',
        caption: '机器人拣货'
    }
}

export const simpleOperateMethod = {
    MANUAL: {
        name: 'MANUAL',
        caption: '手工单据'
    },
    RF: {
        name: 'RF',
        caption: '手持终端'
    },
    SELFSHIP: {
      name: 'SELFSHIP',
      caption: '自提装车'
    }
}

export function getMethodCaption(method) {
    let caption;

    for (let x in operateMethod) {
        if (operateMethod[x].name === method) {
            caption = operateMethod[x].caption;
            break;
        }
    }
    return caption;
}
