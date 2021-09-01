import { formatMessage } from 'umi/locale';
export const selfTackShipLocale = {
  title: formatMessage({ id: 'selfTackShip.title' }),
  waveBillNumber: formatMessage({ id: 'selfTackShip.waveBillNumber' }),
  tackShip: formatMessage({ id: 'selfTackShip.tackShip' }),
  batchTackShip: formatMessage({ id: 'selfTackShip.batchTackShip' }),
  alcBillNumber: formatMessage({ id: 'selfTackShip.alcBillNumber' }),
  tackShipSuccess: formatMessage({ id: 'selfTackShip.tackShipSuccess' }),




  articleTableTitle: formatMessage({ id: 'orderBill.articleTableTitle' }),
  articleCodeMessege: formatMessage({ id: 'orderBill.articleCodeMessege' }),
  importError: formatMessage({ id: 'orderBill.batch.fail' }),
  ModalDelete: formatMessage({ id: 'orderBill.remove.confirm' }),
  ModalAudit: formatMessage({ id: 'orderBill.audit.confirm' }),
  IPopconfirmDeleteTitle: formatMessage({ id: 'orderBill.remove.confirm' }),
  IPopconfirmFinishTitle: formatMessage({ id: 'orderBill.finish.confirm' }),
  IPopconfirmAbortTitle: formatMessage({ id: 'orderBill.abort.confirm' }),
  auditMessage: formatMessage({ id: 'orderBill.audit.confirm.message' }),
  sourceBillNumber: formatMessage({ id: 'orderBill.sourceBillNumber' }),
  wrh: formatMessage({ id: 'orderBill.wrh' }),
  qtyStr: formatMessage({ id: 'orderBill.qtyStrs' }),
  createTime: formatMessage({ id: 'orderBill.createTime' }),
  article: formatMessage({ id: 'orderBill.articles' }),
  articleInfoLocale: formatMessage({ id: 'orderBill.articleInfo' }),
  articleAndSpec: formatMessage({ id: 'orderBill.articleAndSpec' }),
  price: formatMessage({ id: 'orderBill.price' }),
  abort: formatMessage({ id: 'orderBill.abort' }),
  receivedQtyStr: formatMessage({ id: 'orderBill.receivedQtyStr' }),
  articleCount: formatMessage({ id: 'orderBill.articleCount' }),
  receivedArticleCount: formatMessage({ id: 'orderBill.receivedArticleCount' }),
  receivedAmount: formatMessage({ id: 'orderBill.receivedAmount' }),
  receivedAndQtyStr: formatMessage({ id: 'orderBill.receivedAndQtyStr' }),
  receivedAndAmount: formatMessage({ id: 'orderBill.receivedAndAmount' }),
  steps: formatMessage({ id: 'orderBill.steps' }),
  stepsCreateTime: formatMessage({ id: 'orderBill.stepsCreateTime' }),
  stepsBeginReceiveTime: formatMessage({ id: 'orderBill.stepsBeginReceiveTime' }),
  stepsEndReceiveTime: formatMessage({ id: 'orderBill.stepsEndReceiveTime' }),
  stepsUploadTime: formatMessage({ id: 'orderBill.stepsUploadTime' }),
  beginReceiveUploadTime: formatMessage({ id: 'orderBill.beginReceiveUploadTime' }),
  endReceiveUploadTime: formatMessage({ id: 'orderBill.endReceiveUploadTime' }),
  totalVolume: formatMessage({ id: 'orderBill.totalVolume' }),
  totalWeight: formatMessage({ id: 'orderBill.totalWeight' }),
  totalReceivedVolume: formatMessage({ id: 'orderBill.totalReceivedVolume' }),
  totalReceivedWeight: formatMessage({ id: 'orderBill.totalReceivedWeight' }),
  bookedQtyStr: formatMessage({ id: 'orderBill.bookedQtyStr' }),
  bookedArticleCount: formatMessage({ id: 'orderBill.bookedArticleCount' }),
  type: formatMessage({ id: 'orderBill.type' }),
  pricing: formatMessage({ id: 'orderBill.pricing' }),
  batchPricing: formatMessage({ id: 'orderBill.batchPricing' }),
  isPricing: formatMessage({ id: 'orderBill.isPricing' }),
  pricingContent: formatMessage({ id: 'orderBill.pricingContent' }),
  pricingSuccess: formatMessage({ id: 'orderBill.pricingSuccess' }),
  originalPrice: formatMessage({ id: 'orderBill.originalPrice' }),
}

export function itemRepeat(line1, line2) {
  return formatMessage({ id: 'orderBill.validate.itemRepeat' }, {
    line1: line1,
    line2: line2
  });
}
