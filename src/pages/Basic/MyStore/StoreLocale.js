import { formatMessage } from 'umi/locale';
export const storeLocale = {
  title: formatMessage({ id: 'store.title' }),
  typeTitle: formatMessage({ id: 'store.manage.type' }),
  operatingTypeTitle: formatMessage({ id: 'store.manage. operateType' }),
  distancePattern: formatMessage({ id: 'store.create.form.item.distance.validate.message.greaterThanZero' }),
  operatingAreaPattern: formatMessage({ id: 'store.create.form.item.operatingArea.validate.message.greaterThanZero' }),
  storeType: formatMessage({ id: 'store.detail.basic.type' }),
  operatingType: formatMessage({ id: 'store.detail.basic.operatingType' }),
  shortName: formatMessage({ id: 'store.detail.basic.shortName' }),
  distance: formatMessage({ id: 'store.detail.basic.distance' }),
  operatingArea: formatMessage({ id: 'store.detail.basic.operatingArea' }),
  kilometre: formatMessage({ id: 'store.create.form.item.distance.unit' }),
  square: formatMessage({ id: 'store.create.form.item.operatingArea.unit' }),
  all: '全部',
  null: '无',
  importError: formatMessage({ id: 'common.excelImport.select.button.downloadTemplate.errror' }),
  arrivalType: formatMessage({ id: 'store.arrivalType' }),
  signIn: formatMessage({ id: 'store.signIn' }),
  receiveTime: formatMessage({ id: 'store.receiveTime' }),
  parkingFee: formatMessage({ id: 'store.parkingFee' }),
  tmsInfo: formatMessage({ id: 'store.tmsInfo' }),
  area: '区域'
};