/**状态 */
export const BillType = {
    ORDERBILL: {
        name: 'ORDERBILL',
        caption: '订单'
    },
    INCINVBILL: {
        name: 'INCINVBILL',
        caption: '溢余单'
    },
    ALCNTCBILL: {
        name: 'ALCNTCBILL',
        caption: '配货通知单'
    },
    STORERTNNTC: {
        name: 'STORERTNNTC',
        caption: '门店退仓通知单'
    },
    VENDORRTNNTC: {
        name: 'VENDORRTNNTC',
        caption: '供应商退货通知单'
    }
}

export function getBillTypeCaption(name) {
    let caption;
    Object.keys(BillType).forEach(function (key) {
        if (BillType[key].name === name)
            caption = BillType[key].caption;
    });
    return caption;
}

