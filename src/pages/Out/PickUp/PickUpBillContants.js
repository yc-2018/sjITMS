/**
 * 拣货单状态
 */
export const PickupBillState = {
  SAVED: {
    name: 'SAVED',
    caption: '已保存',
  },
  APPROVED: {
    name: 'APPROVED',
    caption: '已批准',
  },
  SENDED: {
    name: 'SENDED',
    caption: '已发送',
  },
  INPROGRESS: {
    name: 'INPROGRESS',
    caption: '进行中',
  },
  AUDITED: {
    name: 'AUDITED',
    caption: '已审核',
  }
}
/**
 * 拣货方式
 */
export const PickType = {
  CONTAINER: {
    name: 'CONTAINER',
    caption: '整托',
  },
  PART: {
    name: 'PART',
    caption: '非整托',
  }
}

/**
 * 拣货详情单状态
 */
export const PickupBillItemState = {
  INITIAL: {
    name: 'INITIAL',
    caption: '初始',
  },
  INPROGRESS: {
    name: 'INPROGRESS',
    caption: '拣货中',
  },
  FINISHED: {
    name: 'FINISHED',
    caption: '已完成',
  },
  EXCEPTION: {
    name: 'EXCEPTION',
    caption: '异常',
  },
  SKIP: {
    name: 'SKIP',
    caption: '跳过',
  },
  STOCKOUT: {
    name: 'STOCKOUT',
    caption: '缺货',
  },
}

/**操作方法 */
export const OperateMethod = {
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
    caption: '打印标签'
  },
  ROBOT: {
    name: 'ROBOT',
    caption: '机器人拣货'
  },
}

/**单据类型 */
export const PickupDateType = {
  NORMAL: {
    name: 'NORMAL',
    caption: '正常单据'
  },
  DESIGNATED: {
    name: 'DESIGNATED',
    caption: '指定日期'
  },
}