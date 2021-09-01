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
};
/** 类型 */
export const Type = {
  RECEIVE: {
    name: 'RECEIVE',
    caption: '收货修正'
  },
  STORE_RTN: {
    name: 'STORE_RTN',
    caption: '退仓修正'
  },
  VENDOR_RTN: {
    name: 'VENDOR_RTN',
    caption: '退货修正'
  },
};
/** 修正方向 */
export const AdjDirection = {
  UP: {
    name: 'UP',
    caption: '向上修正'
  },
  DOWN: {
    name: 'DOWN',
    caption: '向下修正'
  },
};
export const AdjSourceBill = {
  StoreRtnBill: '退仓单',
  ReceiveBill:'收货单',
  VendorRtnHandoverBill:'供应商交接单'
}
