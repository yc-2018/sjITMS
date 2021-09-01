import { formatMessage } from 'umi/locale';
export const storeLocale = {
  title: formatMessage({id:'storeCashCollRecords.title'}),
  vehicleNum: formatMessage({id:'storeCashCollRecords.vehicleNum'}),
  shipPlanBill: formatMessage({id:'storeCashCollRecords.shipPlanBill'}),
  driver: formatMessage({id:'storeCashCollRecords.driver'}),
  transportOrderBill: formatMessage({id:'storeCashCollRecords.transportOrderBill'}),
  sourceBill: formatMessage({id:'storeCashCollRecords.sourceBill'}),
  wmsBill: formatMessage({id:'storeCashCollRecords.wmsBill'}),
  storeCode: formatMessage({id:'storeCashCollRecords.storeCode'}),
  storeName: formatMessage({id:'storeCashCollRecords.storeName'}),
  isCash: formatMessage({id:'storeCashCollRecords.isCash'}),
  isCount: formatMessage({id:'storeCashCollRecords.isCount'}),
  nowCash: formatMessage({id:'storeCashCollRecords.nowCash'}),




  typeTitle: formatMessage({id:'store.manage.type'}),
  operatingTypeTitle: formatMessage({id:'store.manage. operateType'}),
  distancePattern:formatMessage({id:'store.create.form.item.distance.validate.message.greaterThanZero'}),
  operatingAreaPattern: formatMessage({id:'store.create.form.item.operatingArea.validate.message.greaterThanZero'}),
  storeType:formatMessage({id:'store.detail.basic.type'}),
  operatingType: formatMessage({id:'store.detail.basic.operatingType'}),
  shortName:formatMessage({id:'store.detail.basic.shortName'}),
  distance: formatMessage({id:'store.detail.basic.distance'}),
  operatingArea: formatMessage({id:'store.detail.basic.operatingArea'}),
  kilometre: formatMessage({id:'store.create.form.item.distance.unit'}),
  square: formatMessage({id:'store.create.form.item.operatingArea.unit'}),
  all:'全部',
  null:'无',
  importError: formatMessage({id:'common.excelImport.select.button.downloadTemplate.errror'}),
  arrivalType:formatMessage({id:'store.arrivalType'}),
  signIn:formatMessage({id:'store.signIn'}),
  receiveTime:formatMessage({id:'store.receiveTime'}),
  parkingFee:formatMessage({id:'store.parkingFee'}),
  tmsInfo:formatMessage({id:'store.tmsInfo'}),
};
