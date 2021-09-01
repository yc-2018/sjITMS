
/**物流模式 */
export const LogisticMode = {
  UNIFY: {
    name: 'UNIFY',
    caption: '统配'
  },
  ONESTEPCROSS: {
    name: 'ONESTEPCROSS',
    caption: '一步越库'
  },
  TWOSTEPCROSS: {
    name: 'TWOSTEPCROSS',
    caption: '二步越库'
  }
};

/**状态 */
export const State ={
  SAVED: {
    name: 'SAVED',
    caption: '已保存'
  },
  INITIAL: {
    name: 'INITIAL',
    caption: '初始'
  },
  BOOKING:{
    name: 'BOOKING',
    caption: '部分预约'
  },
  BOOKED: {
    name: 'BOOKED',
    caption: '完成预约'
  },
  PREVEXAM: {
    name: 'PREVEXAM',
    caption: '已预检'
  },
  INPROGRESS: {
    name: 'INPROGRESS',
    caption: '进行中'
  },
  FINISHED: {
    name: 'FINISHED',
    caption: '已完成'
  },
  ABORTED: {
    name: 'ABORTED',
    caption: '已作废'
  }
}

