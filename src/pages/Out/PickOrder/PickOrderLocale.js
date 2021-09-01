import { formatMessage } from 'umi/locale';

export const pickOrderLocale = {
  title: formatMessage({id:'pickOrder.title'}),
  addStorePickOrder: formatMessage({id:'pickOrder.addStorePickOrder'}),
  tabPickOrderTitle: formatMessage({id:'pickOrder.tabPickOrderTitle'}),
  storeGroupTitle: formatMessage({id:'pickOrder.storeGroupTitle'}),
  tabOperateInfoTitle: formatMessage({id:'pickOrder.tabOperateInfoTitle'}),
  pickOrderScheme: formatMessage({id:'pickOrder.pickOrderScheme'}),
  scheme: formatMessage({id:'pickOrder.scheme'}),
  storeGroupUpdate: formatMessage({id:'pickOrder.storeGroupUpdate'}),
  storeGroupAdd: formatMessage({id:'pickOrder.storeGroupAdd'}),
  orderNo: formatMessage({id:'pickOrder.orderNo'}),
  progressWarn: formatMessage({id:'pickOrder.progressWarn'}),
  progressTitle: formatMessage({id:'pickOrder.progressTitle'}),
  noData: formatMessage({id:'pickOrder.noData'}),
  addStoreGroup: formatMessage({id:'pickOrder.addStoreGroup'}),
  addScheme: formatMessage({id:'pickOrder.addScheme'}),
  schemeCode: formatMessage({id:'pickOrder.schemeCode'}),
  schemeName: formatMessage({id:'pickOrder.schemeName'}),
  codePattern: /\d{4}/,
  codePatternMessage: '代码只能是四位数字',
}