/**状态 */
export const State = {
  SAVED: {
    name: 'SAVED',
    caption: '已保存'
  },
  AUDITED: {
    name: 'AUDITED',
    caption: '已审核'
  },
  INPROGRESS: {
    name: 'INPROGRESS',
    caption: '进行中'
  }
}

/**收货方式 */
export const Method = {
  MANUAL: {
    name: 'MANUAL',
    caption: '手工单据'
  },
  RF: {
    name: 'RF',
    caption: '手持终端'
  }
}

/**收货类型 */
export const Type = {
  NORMAL: {
    name: 'NORMAL',
    caption: '正常收货'
  },
  FAST: {
    name: 'FAST',
    caption: '快速收货'
  },
  ALLOT: {
    name: 'ALLOT',
    caption: '调拨收货'
  }
}