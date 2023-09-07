
 /** 保质期类型枚举 */
 export const SHELFLIFE_TYPE = {
  PRODUCTDATE: '按生产日期',
  VALIDDATE: '按到效期',
  NOCARE: '不管理保质期'
 }

 /** 上架货位 */
export const PUTAWAY_BIN = {
  PICKUPBIN: '拣货位',
  STORAGEBIN: '存储位',
  FIRSTPICKUP: '优先拣货位',
}

/** 门店起要量 */
export const PICK_QPC = {
  CASE: '整箱',
  SPLIT: '零散',
}

/** 轻重属性 */
export const WEIGHT_SORT = {
  NORMAL: '正常品',
  LIGHT: '轻货',
  HEAVY: '重货',
}

/** 混载属性 */
export const MixArticle = {
  NOMIX: {
    name: 'NOMIX',
    caption: '不混载，仅限同一商品同一批号'
  },
  PBATCHNOTMIX: {
    name: 'PBATCHNOTMIX',
    caption: '不同商品可混载，同一商品不同批号不可混载'
  },
  PBATCHMIX: {
    name: 'PBATCHMIX',
    caption: '不同商品可混载，同一商品不同批号可混载'
  },
}
 /** 结算单位 */
 export const SETTLE_UNIT = {
   QTY: '数量',
   WEIGHT: '重量',
 }
