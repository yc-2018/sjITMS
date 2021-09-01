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
    INPROGRESS: {
        name: 'INPROGRESS',
        caption: '进行中'
    },
    AUDITED: {
        name: 'AUDITED',
        caption: '已审核'
    }
};

/**状态 */
export const ItemState = {
    INITIAL: {
        name: 'INITIAL',
        caption: '初始'
    },
    INPROGRESS: {
        name: 'INPROGRESS',
        caption: '拣货中'
    },
    FINISHED: {
        name: 'FINISHED',
        caption: '完成'
    },
    EXCEPTION: {
        name: 'EXCEPTION',
        caption: '异常'
    },
    SKIP: {
        name: 'SKIP',
        caption: '跳过'
    },
    STOCKOUT: {
        name: 'STOCKOUT',
        caption: '缺货'
    },
};

/**类型 */
export const Type = {
    WHOLECONTAINER: {
        name: 'WHOLECONTAINER',
        caption: '整托'
    },
    PARTCONTAINER: {
        name: 'PARTCONTAINER',
        caption: '非整托'
    },
};

export const METHOD = {
    MANUAL: {
        name: 'MANUAL',
        caption: '手工单据'
    },
    RF: {
        name: 'RF',
        caption: '手持终端'
    },
}