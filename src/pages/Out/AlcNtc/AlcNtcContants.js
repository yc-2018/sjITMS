/**状态 */
export const State = {
  SAVED: {
    name: 'SAVED',
    caption: '已保存'
  },
  INITIAL: {
    name: 'INITIAL',
    caption: '初始'
  },
  USED: {
    name: 'USED',
    caption: '已使用'
  },
  INALC: {
    name: 'INALC',
    caption: '待配货'
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
