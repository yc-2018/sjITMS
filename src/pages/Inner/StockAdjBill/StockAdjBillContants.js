/**状态 */
export const State = {
  SAVED: {
    name: 'SAVED',
    caption: '已保存'
  },
  AUDITED: {
    name: 'AUDITED',
    caption: '已审核'
  }
}

export function getStateCaption(name) {
  let caption;
  Object.keys(State).forEach(function (key) {
    if (State[key].name === name)
      caption = State[key].caption;
  });
  return caption;
}

/**调整类型 */
export const AdjType = {
  PRODUCTIONBATCH: {
    name: 'PRODUCTIONBATCH',
    caption: '批号调整'
  },
  VENDOR: {
    name: 'VENDOR',
    caption: '供应商调整'
  },
  STOCKBATCHMERGE: {
    name: 'STOCKBATCHMERGE',
    caption: '批次合并'
  }
}

export function getAdjTypeCaption(name) {
  let caption;
  Object.keys(AdjType).forEach(function (key) {
    if (AdjType[key].name === name)
      caption = AdjType[key].caption;
  });
  return caption;
}

/** 规格调整 */
export const QpcStrAdjType = {
  STOCK: {
    name: 'STOCK',
    caption: '库存规格'
  },
  ONE: {
    name: 'ONE',
    caption: '1*1*1'
  },
  DEFAULT: {
    name: 'DEFAULT',
    caption: '默认规格'
  }
}

export function getQpcStrAdjTypeCaption(name) {
  let caption;
  Object.keys(QpcStrAdjType).forEach(function (key) {
    if (QpcStrAdjType[key].name === name)
      caption = QpcStrAdjType[key].caption;
  });
  return caption;
}


/** 供应商调整 */
export const VendorAdjType = {
  STOCK: {
    name: 'STOCK',
    caption: '库存供应商'
  },
  DEFAULT: {
    name: 'DEFAULT',
    caption: '默认供应商'
  }
}

export function getVendorAdjTypeCaption(name) {
  let caption;
  Object.keys(VendorAdjType).forEach(function (key) {
    if (VendorAdjType[key].name === name)
      caption = VendorAdjType[key].caption;
  });
  return caption;
}

/** 批号调整 */
export const ProductionBatchAdjType = {
  MIN: {
    name: 'MIN',
    caption: '最小批号'
  },
  MAX: {
    name: 'MAX',
    caption: '最大批号'
  }
}

export function getProductionBatchAdjTypeCaption(name) {
  let caption;
  Object.keys(ProductionBatchAdjType).forEach(function (key) {
    if (ProductionBatchAdjType[key].name === name)
      caption = ProductionBatchAdjType[key].caption;
  });
  return caption;
}



