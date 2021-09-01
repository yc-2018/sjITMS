/**状态 */
export const State = {
    UNHANDOVER: {
        name: 'UNHANDOVER',
        caption: '未交接'
    },
    HANDOVERING: {
        name: 'HANDOVERING',
        caption: '交接中'
    },
    STOREHANDOVER: {
        name: 'STOREHANDOVER',
        caption: '已交接'
    },
    AUDITED: {
        name: 'AUDITED',
        caption: '已审核'
    }
};

/**状态 */
export const CollectBinReviewType = {
    ATTACHMENT: {
        name: 'ATTACHMENT',
        caption: '附件'
    },
    WHOLECONTAINERQTYSTR: {
        name: 'WHOLECONTAINERQTYSTR',
        caption: '整箱数'
    },
    CONTAINERTYPE: {
        name: 'CONTAINERTYPE',
        caption: '容器类型'
    }
};

export const ContainerRecycleType = {
    ByQty: {
        name: 'ByQty',
        caption: '按数量'
    },
    ByBarcode: {
        name: 'ByBarcode',
        caption: '按条码'
    },
}