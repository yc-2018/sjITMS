/**状态 */
export const State ={
  Saved: {
    name: 'Saved',
    caption: '已保存'
  },
  Approved: {
    name: 'Approved',
    caption: '已批准'
  },
  Shipping:{
    name: 'Shipping',
    caption: '装车中'
  },
  Shiped: {
    name: 'Shiped',
    caption: '已装车'
  },
  Delivering: {
    name: 'Delivering',
    caption: '配送中'
  },
  Returned: {
    name: 'Returned',
    caption: '已回车'
  },
  Finished: {
    name: 'Finished',
    caption: '已完成'
  },
  Aborted: {
    name: 'Aborted',
    caption: '已作废'
  },
  ABORTEDAFTERSHIPED: {
    name: 'ABORTEDAFTERSHIPED',
    caption: '装车后作废'
  }
}

export const editableState = ['Saved','Approved','Shipping','Shiped','Delivering']

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

/**类型 */
export const Type = {
  Normal: {
    name: 'Normal',
    caption: '正常排车'
  },
  Move: {
    name: 'Move',
    caption: '移车排车'
  },
}

export const MemberType = {
  DRIVER: {
    name: 'DRIVER',
    caption: '驾驶员'
  },
  STEVEDORE: {
    name: 'STEVEDORE',
    caption: '装卸员'
  },
  DEPUTYDRIVER: {
    name: 'DEPUTYDRIVER',
    caption: '副班司机'
  },
  DELIVERYMAN: {
    name: 'DELIVERYMAN',
    caption: '送货员',
  }
}


