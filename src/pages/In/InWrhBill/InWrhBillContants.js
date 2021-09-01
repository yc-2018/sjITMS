
/**状态 */
export const State ={
  INITIAL: {
    name: 'INITIAL',
    caption: '已入园'
  },
  HASDOCK:{
    name: 'HASDOCK',
    caption: '已分配码头'
  },

  RECEIVING: {
    name: 'RECEIVING',
    caption: '收货中'
  },

  FINISHED: {
    name: 'FINISHED',
    caption: '已出园'
  },

  ABORTED:{
    name: 'ABORTED',
    caption: '已作废'
  }
};
export const OperateType ={
  WEB: {
    name: 'WEB',
    caption: 'Web操作'
  },
  APP:{
    name: 'APP',
    caption: 'App操作'
  }
}

export const DockState={
  'FREE':'空闲',
  'USING':'使用中',
  'DISENABLED':'已停用',
  'ASSIGNED':'已分配'
}

export const dockListState= {
  FREE: {
    name: 'FREE',
    caption: '空闲'
  },
  USING: {
    name: 'USING',
    caption: '使用中'
  },
  DISENABLED: {
    name: 'DISENABLED',
    caption: '已停用'
  },
  ASSIGNED:{
    name: 'ASSIGNED',
    caption: '已分配'
  }
}

export const BookState= {
  BOOKED: {
    name: 'BOOKED',
    caption: '已预约'
  },
  BOOKING: {
    name: 'BOOKING',
    caption: '部分预约'
  },
  NOBOOK: {
    name: 'NOBOOK',
    caption: '无预约'
  },
  
}
