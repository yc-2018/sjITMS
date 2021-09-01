import { formatMessage } from 'umi/locale';
export const processingSchemeLocal = {
  title: formatMessage({id:'processing.scheme.title'}),
  articleAndSpec: formatMessage({id:'processing.articleAndSpec'}),
  typeTitle: formatMessage({id:'store.manage.type'}),
  operatingTypeTitle: formatMessage({id:'store.manage. operateType'}),
  distancePattern:formatMessage({id:'store.create.form.item.distance.validate.message.greaterThanZero'}),
  operatingAreaPattern: formatMessage({id:'store.create.form.item.operatingArea.validate.message.greaterThanZero'}),
  rawArticleCodes: formatMessage({id:'processing.raw.article.codes'}),
  endproductArticleCodes: formatMessage({id:'processing.endproduct.article.codes'}),
  shortName:formatMessage({id:'store.detail.basic.shortName'}),
  distance: formatMessage({id:'store.detail.basic.distance'}),
  operatingArea: formatMessage({id:'store.detail.basic.operatingArea'}),
  kilometre: formatMessage({id:'store.create.form.item.distance.unit'}),
  square: formatMessage({id:'store.create.form.item.operatingArea.unit'}),
  all:'全部',
  null:'无',
  importError: formatMessage({id:'common.excelImport.select.button.downloadTemplate.errror'}),
};
