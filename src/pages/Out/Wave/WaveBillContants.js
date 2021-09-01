/**波次单状态 */
export const WaveBillState = {
  SAVED: {
    name: 'SAVED',
    caption: '已保存',
  },
  STARTING: {
    name: 'STARTING',
    caption: '启动中',
  },
  STARTED: {
    name: 'STARTED',
    caption: '启动完成',
  },
  STARTEXCEPTION: {
    name: 'STARTEXCEPTION',
    caption: '启动异常',
  },
  INPROGRESS: {
    name: 'INPROGRESS',
    caption: '进行中',
  },
  FINISHED: {
    name: 'FINISHED',
    caption: '已完成',
  },
  ABORTED:{
    name: 'ABORTED',
    caption: '已作废',
  }
}

/**配货通知单详情状态 */
export const WaveAlcNtcItemState = {
  INITIAL: {
    name: 'INITIAL',
    caption: '初始',
  },
  DONE: {
    name: 'DONE',
    caption: '已完成',
  },
  USED:{
    name:'USED',
    caption: '已使用',
  }
}

/**波次类型 */
export const WaveType = {
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
  },
  PRERPL:{
    name:'PRERPL',
    caption:'预补'
  }
};

/**库存分配类型 */
export const StockAllocateType = {
  INTURN: {
    name: 'INTURN',
    caption: '依次满足'
  },
  LOOP: {
    name: 'LOOP',
    caption: '循环分配'
  },
  AVG: {
    name: 'AVG',
    caption: '平均分配'
  },
}

