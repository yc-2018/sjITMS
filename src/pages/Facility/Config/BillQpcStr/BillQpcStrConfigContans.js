/**支持配置的单据类型*/
export const billType = {
  ORDERBILL: {
    name: 'ORDERBILL',
    caption: '入库订单',
  },
  RTNBILL: {
    name: 'RTNBILL',
    caption: '退仓通知单',
  },
  ALCDIFFBILL: {
    name: 'ALCDIFFBILL',
    caption: '配货差异单',
  },
}

/**支持配置的规格*/
export const qpcStrFrom = {
  FROMBILL: {
    name: 'FROMBILL',
    caption: '单据规格',
  },
  FROMARTICLE: {
    name: 'FROMARTICLE',
    caption: '默认规格',
  }
}