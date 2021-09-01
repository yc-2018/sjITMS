/**上架单状态 */
export const PutawayBillState={
  SAVED:{
    name:'SAVED',
    caption:'已保存',
  },
  INPROGRESS: {
    name: 'INPROGRESS',
    caption: '进行中'
  },
  AUDITED: {
    name: 'AUDITED',
    caption: '已审核',
  }
}

/**上架单类型 */
export const PutawayBillType = {
  ACTIVE: {
    name: 'ACTIVE',
    caption: '主动上架',
  },
  INSTRUCTION: {
    name: 'INSTRUCTION',
    caption: '指令上架',
  },
  RPL_BACK_PLATE: {
    name: 'RPL_BACK_PLATE',
    caption: '补货回板',
  }
}

/**操作方式 */
export const OperateMethod = {
  MANUAL: {
    name: 'MANUAL',
    caption: '手工单据',
  },
  RF: {
    name: 'RF',
    caption: '手持终端',
  }
}