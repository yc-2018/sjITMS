/**状态 */
export const State = {
  Saved: {
    name: 'Saved',
    caption: '已保存',
    color: '#2DCB38'
  },
  Initial: {
    name: 'Initial',
    caption: '初始',
    color: '#9CBAF1'
  },
  Scheduled: {
    name: 'Scheduled',
    caption: '已排车',
    color: '#3B77E3'
  },
  Shiped: {
    name: 'Shiped',
    caption: '已装车',
    color: '#D8DAE6'
  },
  Delivering: {
    name: 'Delivering',
    caption: '配送中',
    color: '#2DCB38'
  },
  ForConfirm: {
    name: 'ForConfirm',
    caption: '待确认',
    color: '#D8DAE6'
  },
  Confirm: {
    name: 'Confirm',
    caption: '已确认',
    color: '#9CBAF1'
  },
  WaitResend: {
    name: 'WaitResend',
    caption: '待重送',
    color: '#D8DAE6'
  },
  Finished: {
    name: 'Finished',
    caption: '已完成',
    color: '#D8DAE6'
  },
  Canceled: {
    name: 'Canceled',
    caption: '已取消',
    color: '#D8DAE6'
  }
};

/**装车状态 */
export const ShipState = {
  INITIAL: {
    name: 'INITIAL',
    caption: '未装车'
  },
  SHIPING: {
    name: 'SHIPING',
    caption: '装车中'
  },
  SHIPED: {
    name: 'SHIPED',
    caption: '装车完成'
  }
};

/**订单类型 */
export const orderBillType = {
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

export const urgencyLevel = {
  Low: {
    name: 'Low',
    caption: '低'
  },
  Normal: {
    name: 'Normal',
    caption: '普通'
  },
  High: {
    name: 'High',
    caption: '高'
  }
};


//配单类型
export const SchedulingType = {
  SELFHANDOVER:{
    name: 'SELFHANDOVER',
    caption: '自提'
  },
  DELIVERY:{
    name: 'DELIVERY',
    caption: '调度配送',
  }
}

//配单类型
export const filedCodeName = {
  billNumber:{
    name: 'billNumber',
    caption: '单号'
  },
  wmsNum:{
    name: 'wmsNum',
    caption: '物流单号',
  },
  sourceNum:{
    name: 'sourceNum',
    caption: '物流来源单号'
  },
  waveNum:{
    name: 'waveNum',
    caption: '波次号',
  },
  cartonCount:{
    name: 'cartonCount',
    caption: '整箱数(估)'
  },
  scatteredCount:{
    name: 'scatteredCount',
    caption: '零散数(估)',
  },
  weight:{
    name: 'weight',
    caption: '重量'
  },
  volume:{
    name: 'volume',
    caption: '体积',
  },
  scheduleNum:{
    name: 'scheduleNum',
    caption: '排车单号'
  },
  realCartonCount:{
    name: 'realCartonCount',
    caption: '整箱数(复核)',
  },
  realScatteredCount:{
    name: 'realScatteredCount',
    caption: '零散数(复核)'
  },
  realContainerCount:{
    name: 'realContainerCount',
    caption: '周转箱数(复核)',
  },
  owners:{
    name: 'owners',
    caption: '货主'
  },
  orderType:{
    name: 'orderType',
    caption: '订单类型',
  },
  urgencyLevel:{
    name: 'urgencyLevel',
    caption: '是否紧急'
  },
  pickUppointAddress:{
    name: 'pickUppointAddress',
    caption: '取货点具体位置',
  },
  deliveryPointCode:{
    name: 'deliveryPointCode',
    caption: '送货点代码'
  },
  deliveryPointName:{
    name: 'deliveryPointName',
    caption: '送货点名称',
  },
  deliveryPointAddress:{
    name: 'deliveryPointAddress',
    caption: '送货点地址'
  },
  deliveryPointConstracts:{
    name: 'deliveryPointConstracts',
    caption: '送货点联系人',
  },
  deliveryPointPhone:{
    name: 'deliveryPointPhone',
    caption: '送货点联系电话'
  },
  finalPointCode:{
    name: 'finalPointCode',
    caption: '最终点代码',
  },
  finalPointName:{
    name: 'finalPointName',
    caption: '最终点名称'
  },
  finalPointAddress:{
    name: 'finalPointAddress',
    caption: '最终点地址',
  },
  finalPointConstracts:{
    name: 'finalPointConstracts',
    caption: '最终点联系人'
  },
  finalPointPhone:{
    name: 'finalPointPhone',
    caption: '最终点联系电话',
  },
  stat:{
    name: 'stat',
    caption: '状态'
  },
  appointmentTime:{
    name: 'appointmentTime',
    caption: '预约时间',
  },
  note:{
    name: 'note',
    caption: '备注'
  },
  orderTime:{
    name: 'orderTime',
    caption: '下单日期',
  },
  deliveryPointSpecificAddress:{
    name: 'deliveryPointSpecificAddress',
    caption: '送货点具体位置',
  },
  finalPointSpecificAddress:{
    name: 'finalPointSpecificAddress',
    caption: '最终点具体位置'
  },
  sourceOrderBillTms:{
    name: 'sourceOrderBillTms',
    caption: '来源运输订单号',
  },
  containerCount:{
    name: 'containerCount',
    caption: '周转箱数(估)'
  }
}


