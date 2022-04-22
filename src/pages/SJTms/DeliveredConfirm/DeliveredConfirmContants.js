
/**状态 */
export const OrderType = {
  Delivery: {
      name: 'Delivery',
      caption: '配送'
  },
  TransportIn: {
      name: 'TransportIn',
      caption: '调拨入'
  },
  TransportOut: {
      name: 'TransportOut',
      caption: '调拨出'
  },
  OnlyBill: {
      name: 'OnlyBill',
      caption: '单据过账'
  },
  TakeDelivery: {
    name: 'TakeDelivery',
    caption: '提货'
  },
  PackageDelivery:{
    name:'PackageDelivery',
    caption:'包裹配送'
  }
};

/**送达情况 */
export const DeliveredType = {
    Pending: {
        name: 'Pending',
        caption: '待处理'
    },
    NotDelivered: {
        name: 'NotDelivered',
        caption: '未送达'
    },
    Delivered: {
        name: 'Delivered',
        caption: '已送达'
    },
}


/**未送达责任归属 */
export const UnDeliveredDuty = {
    Warehouse: {
        name: 'Warehouse',
        caption: '仓库'
    },
    Driver: {
        name: 'Driver',
        caption: '司机'
    },
    Store: {
        name: 'Store',
        caption: '门店'
    },
}

/**未送达类型 */
export const UnDeliveredType = {
    ReSend: {
        name: 'ReSend',
        caption: '重送'
    },
    Reject: {
        name: 'Reject',
        caption: '拒收'
    },
}


