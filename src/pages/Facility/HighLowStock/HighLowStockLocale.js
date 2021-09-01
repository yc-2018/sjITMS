import { formatMessage } from 'umi/locale';
export const highLowStockLocale = {
  title: formatMessage({ id: 'highLowStock.title' }),
  article:formatMessage({ id: 'highLowStock.article' }),
  binCode:formatMessage({ id: 'highLowStock.binCode' }),
  binType:formatMessage({ id: 'highLowStock.binType' }),
  qpcStr:formatMessage({ id: 'highLowStock.qpcStr' }),
  lowStockQtyStr:formatMessage({ id: 'highLowStock.lowStockQtyStr' }),
  lowStockQty:formatMessage({ id: 'highLowStock.lowStockQty' }),
  highStockQtyStr:formatMessage({ id: 'highLowStock.highStockQtyStr' }),
  highStockQty:formatMessage({ id: 'highLowStock.highStockQty' }),
  binCodeRange:formatMessage({ id: 'highLowStock.binCodeRange' }),
  selectFixValue:formatMessage({ id: 'highLowStock.select.fixValue' }),
  selectPlateValue:formatMessage({ id: 'highLowStock.select.plate' }),
  binTypeAndRange:formatMessage({ id: 'highLowStock.binTypeAndRange.validate.message.notNull' }),
  lowAndHighStock:formatMessage({ id: 'highLowStock.lowAndHighStock.validate.message.notNull' })
};