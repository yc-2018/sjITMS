/**
 * 订单类型
 */
export const OrderBillType = {
  Delivery:{
    name:'Delivery',
    caption:'配送'
  },
  TransportIn:{
    name:'TransportIn',
    caption:'调拨入'
  },
  TransportOut:{
    name:'TransportOut',
    caption:'调拨出'
  },
  OnlyBill:{
    name:'OnlyBill',
    caption:'单据过账'
  },
  TakeDelivery: {
    name: 'TakeDelivery',
    caption: '提货'
  },
  PackageDelivery:{
    name:'PackageDelivery',
    caption:'包裹配送'
  }
}

/**
 * 订单状态
 */
export const OrderBillStat = {
  Initial:{
    name:'Initial',
    caption:'初始'
  },
  Scheduled:{
    name:'Scheduled',
    caption:'已排车'
  },
  Shiped:{
    name:'Shiped',
    caption:'已装车'
  },
  Delivering:{
    name:'Delivering',
    caption:'配送中'
  },
  Finished:{
    name:'Finished',
    caption:'已完成'
  },
  Canceled:{
    name:'Canceled',
    caption:'已取消'
  },
}

export const OrderBillPendingTag = {
  Normal:{
    name:'Normal',
    caption:'正常'
  },
  Pending:{
    name:'Pending',
    caption:'待定'
  },
}

/**
 * 紧急程度
 */
export const OrderBillUrgencyLevel = {
  Low:{
    name:'Low',
    caption:'低'
  },
  Normal:{
    name:'Normal',
    caption:'普通'
  },
  High:{
    name:'High',
    caption:'高'
  },
}

export const OrderStat = {
  Initial:{
    name:'Initial',
    caption:'初始'
  },
  Resend:{
    name:'Resend',
    caption:'重送'
  },
  Reschedule:{
    name:'Reschedule',
    caption:'再排'
  },
}

export const TaskType = {
  Delivery:{
    name:'Delivery',
    caption:'配送'
  },
  OnlyBill:{
    name:'OnlyBill',
    caption:'单据过账'
  },
  TakeDelivery:{
    name:'TakeDelivery',
    caption:'提货'
  },
}