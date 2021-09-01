/**加工单单状态 */
export const ProcessBillState = {
  SAVED: {
    name: 'SAVED',
    caption: '已保存',
  },
  AUDITED: {
    name: 'AUDITED',
    caption: '已审核',
  },
}

/**类型 */
export const Type = {
  RAW: {
    name: 'RAW',
    caption: '原料',
  },
  ENDPRODUCT: {
    name: 'ENDPRODUCT',
    caption: '成品',
  },
}

export const SourceBill = {
  StockTakeBill: '盘点单',
  StoreRtnBill: '退仓单',
  ReceiveBill: '收货单',
  IncInvBill: '溢余单',
}