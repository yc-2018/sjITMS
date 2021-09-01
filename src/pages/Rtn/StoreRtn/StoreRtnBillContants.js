/**状态 */
export const State = {
  SAVED: {
    name: 'SAVED',
    caption: '已保存'
  },
  INPROGRESS: {
    name: 'INPROGRESS',
    caption: '进行中'
  },
  AUDITED: {
    name: 'AUDITED',
    caption: '已审核'
  }
};

/**状态 */
export const Type = {
  RTNWRH: {
    name: 'RTNWRH',
    caption: '好退'
  },
  RTNVENDOR: {
    name: 'RTNVENDOR',
    caption: '返厂'
  },
  DECINV: {
    name: 'DECINV',
    caption: '损耗'
  }
};

export const METHOD = {
  MANUAL: {
      name: 'MANUAL',
      caption: '手工单据'
  },
  RF: {
      name: 'RF',
      caption: '手持终端'
  },
}

//退货类型
export const ReturnType = {
  RETURNSTORE: {
    name: 'RETURNSTORE',
    caption: '门店退货',
  },
  REJECTIONSTORE: {
    name: 'REJECTIONSTORE',
    caption: '门店拒收',
  },
}

export const GetCaptionByName = (name) => {
  if(!name)
    return "";

  let types = Object.keys(ReturnType);
  for(i = 0; i < types.length; i ++){
    if(types[i].name === name){
      return types[i].caption;
    }
  }
  return ""
}