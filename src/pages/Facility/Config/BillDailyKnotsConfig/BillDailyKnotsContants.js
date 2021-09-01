/**日结类型 */
export const DailyType = {
  ORDER_RECEIVE: {
    name: 'ORDER_RECEIVE',
    caption: '订单收货日结',
  },
  ORDER_EXPIRE: {
    name: 'ORDER_EXPIRE',
    caption: '订单过期日结',
  },
  RECEIVE: {
    name: 'RECEIVE',
    caption: '收货日结',
  },
  CONTAINERBIND: {
    name: 'CONTAINERBIND',
    caption: '容器绑定单日结',
  },
  MOVE: {
    name: 'MOVE',
    caption: '移库单日结',
  },
  CONTAINER_MERGER: {
    name: 'CONTAINER_MERGER',
    caption: '容器拆并单日结',
  },
  CONTAINER_REVIEW: {
    name: 'CONTAINER_REVIEW',
    caption: '容器复查单日结',
  },
  COLLECTBIN_REVIEW: {
    name: 'COLLECTBIN_REVIEW',
    caption: '集货位复查单日结',
  },
  RTNNTC_EXPIRE: {
    name: 'RTNNTC_EXPIRE',
    caption: '退仓通知单到期日结',
  },
  RTN_RECEIVE: {
    name: 'RTN_RECEIVE',
    caption: '退仓单收货日结',
  },
  RTN_HANDOVER: {
    name: 'RTN_HANDOVER',
    caption: '供应商交接单日结',
  },
  ALCNTC_EXPIRE: {
    name: 'ALCNTC_EXPIRE',
    caption: '配单过期日结',
  },
  STOCK: {
    name: 'STOCK',
    caption: '库存日结',
  },
  ALCNTC_SHIP_FINISH: {
    name: 'ALCNTC_SHIP_FINISH',
    caption: '配单装车状态刷新日结',
  },
  ALCNTC_PICKUP_FINISH: {
    name: 'ALCNTC_PICKUP_FINISH',
    caption: '配单拣货完成日结',
  },
  STOCKCOMPARE: {
    name: 'STOCKCOMPARE',
    caption: '库存对账',
  },
  RTN_NTC_HANDOVER: {
    name: 'RTN_NTC_HANDOVER',
    caption: '供应商退货通知单交接日结',
  },
  SUPERMANAGEMENT: {
    name: 'SUPERMANAGEMENT',
    caption: '商品超保失效日期',
  },
  PREVEXAM: {
    name: 'PREVEXAM',
    caption: '预检单日结',
  },
  STOCKLOCKUNLOCK: {
    name: 'STOCKLOCKUNLOCK',
    caption: '库存锁定单自动解锁'
  }
}

/** 日志级别 */
export const LogLevel = {
  SUCCESS: {
    name: 'SUCCESS',
    caption: '成功',
  },
  FAIL: {
    name: 'FAIL',
    caption: '失败',
  },
  IGNORE: {
    name: 'IGNORE',
    caption: '忽略',
  },
}
