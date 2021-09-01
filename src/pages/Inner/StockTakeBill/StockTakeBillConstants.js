/** 盘点单 盘点模式 */
export const SCHEMA = {
  BLIND_TAKE: {
    name: 'BLIND_TAKE',
    caption: '盲盘',
  },
  BRIGHT_TAKE: {
    name: 'BRIGHT_TAKE',
    caption: '明盘',
  },
}

/** 盘点单 盘点方式 */
export const METHOD = {
  MANUAL: {
    name: 'MANUAL',
    caption: '手工单据',
  },
  RF: {
    name: 'RF',
    caption: '手持终端',
  }
}

/**状态 */
export const State = {
  INITIAL: {
    name: 'INITIAL',
    caption: '初始',
  },
  INPROGRESS: {
    name: 'INPROGRESS',
    caption: '进行中',
  },
  TAKED: {
    name: 'TAKED',
    caption: '已盘入',
  },
  FINISHED: {
    name: 'FINISHED',
    caption: '已完成',
  },
  ABORTED: {
    name: 'ABORTED',
    caption: '已作废',
  },
}
