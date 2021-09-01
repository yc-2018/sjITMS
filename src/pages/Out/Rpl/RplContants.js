/**状态 */
export const State = {
  SAVED: {
    name: 'SAVED',
    caption: '已保存'
  },
  APPROVED: {
    name: 'APPROVED',
    caption: '已批准'
  },
  AUDITED: {
    name: 'AUDITED',
    caption: '已审核'
  },
  INPROGRESS:{
    name: 'INPROGRESS',
    caption: '进行中'
  }
};

/**类型 */
export const RplBillType = {
  CONTAINER: {
    name: 'CONTAINER',
    caption: '整托补货'
  },
  PART: {
    name: 'PART',
    caption: '非整托补货'
  }
};

/**补货来源 */
export const RplGenFrom = {
  WAVE: {
    name: 'WAVE',
    caption: '波次补货'
  },
  PRERPL: {
    name: 'PRERPL',
    caption: '预补补货'
  }
};

//是否指定库存补货
export const RplDateType = {
  NORMAL: {
    name: 'NORMAL',
    caption: '正常单据',
  },
  DESIGNATED: {
    name: 'DESIGNATED',
    caption: '指定日期',
  }
}