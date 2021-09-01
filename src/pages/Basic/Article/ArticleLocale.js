import { formatMessage } from 'umi/locale';

export const articleLocale = {
  title: formatMessage({ id: 'article.title' }),
  createArticle: formatMessage({ id: 'article.create' }),
  manageUnloadAdvice: formatMessage({ id: 'article.create.unloadAdvice' }),
  importArticle: formatMessage({ id: 'article.import.article' }),
  importArticleQpc: formatMessage({ id: 'article.import.articleQpc' }),
  importArticleBarcode: formatMessage({ id: 'article.import.articleBarcode' }),
  importArticleVendor: formatMessage({ id: 'article.import.articleVendor' }),
  importStorePickQty: formatMessage({ id: 'article.import.storePickQty' }),
  articleSpec: formatMessage({ id: 'article.column.spec' }),
  articleCategory: formatMessage({ id: 'article.column.category' }),
  articleOwner: formatMessage({ id: 'article.column.owner' }),
  articleBarcode: formatMessage({ id: 'article.column.barcode' }),
  articleDefaultVendor: formatMessage({ id: 'article.column.defaultVendor' }),
  articlePurchasePrice: formatMessage({ id: 'article.column.purchasePrice' }),
  articleSalePrice: formatMessage({ id: 'article.column.salePrice' }),
  articleOrigin: formatMessage({ id: 'article.column.origin' }),
  articleGroupName: formatMessage({ id: 'article.column.groupName' }),
  articleShelfLifeType: formatMessage({ id: 'article.column.shelfLifeType' }),
  articleShelfLifeDays: formatMessage({ id: 'article.column.shelfLifeDays' }),
  articleReceiveControlDays: formatMessage({ id: 'article.column.receiveControlDays' }),
  articleDeliveryControlDays: formatMessage({ id: 'article.column.deliveryControlDays' }),
  articleReturnControlDays: formatMessage({ id: 'article.column.returnControlDays' }),
  articleCodeNameBarcode: formatMessage({ id: 'article.column.codeNameBarcode' }),
  articleCategoryCodeName: formatMessage({ id: 'article.column.categoryCodeName' }),

  articleBusinessPutawayBin: formatMessage({ id: 'articleBusiness.column.putawayBin' }),
  articleBusinessUnLoadAdvice: formatMessage({ id: 'articleBusiness.column.unLoadAdvice' }),
  articleBusinessProcess: formatMessage({ id: 'articleBusiness.column.process' }),
  articleBusinessWeightSort: formatMessage({ id: 'articleBusiness.column.weightSort'}),

  tabBasicInfo: formatMessage({ id: 'article.detail.tab.basicInfo' }),
  tabQpc: formatMessage({ id: 'article.detail.tab.qpc' }),
  tabBarcode: formatMessage({ id: 'article.detail.tab.barcode' }),
  tabVendor: formatMessage({ id: 'article.detail.tab.vendor' }),
  tabStorePickQpc: formatMessage({ id: 'article.detail.tab.storePickQpc' }),

  panelBasic: formatMessage({ id: 'article.panel.basic' }),
  panelShelfLife: formatMessage({ id: 'article.panel.shelfLife' }),
  panelBusiness: formatMessage({ id: 'article.panel.business' }),
  panelNote: formatMessage({ id: 'article.panel.note' }),

  createTitle: formatMessage({ id: 'article.create.title' }),

  qpcQpcStrNotMatch: formatMessage({ id: 'article.qpc.validate.qpcStr.notMatch' }),
  qpcMunitNotNull: formatMessage({ id: 'article.qpc.validate.munit.notNull' }),
  qpcPlateAdviceNotMatch: formatMessage({ id: 'article.qpc.validate.plateAdvice.notMatch' }),
  qpcQpcStr: formatMessage({ id: 'article.qpc.column.qpcStr' }),
  qpcPaq: formatMessage({ id: 'article.qpc.column.paq' }),
  qpcMunit: formatMessage({ id: 'article.qpc.column.munit' }),
  qpcLength: formatMessage({ id: 'article.qpc.column.length' }),
  qpcWidth: formatMessage({ id: 'article.qpc.column.width' }),
  qpcHeight: formatMessage({ id: 'article.qpc.column.height' }),
  qpcWeight: formatMessage({ id: 'article.qpc.column.weight' }),
  qpcDefaultQpcStr: formatMessage({ id: 'article.qpc.column.defaultQpcStr' }),

  articlePlatePlateAdvice:  formatMessage({ id: 'articlePlate.column.plateAdvice' }),
  articlePlatePlate:  formatMessage({ id: 'articlePlate.column.plate' }),

  barcode: formatMessage({ id: 'article.barcode' }),
  barcodeQpcStr: formatMessage({ id: 'article.barcode.qpcStr' }),

  vendor: formatMessage({ id: 'article.vendor.column.vendor' }),
  vendorDefaultReceive: formatMessage({ id: 'article.vendor.column.defaultReceive' }),
  vendorDefaultReturn: formatMessage({ id: 'article.vendor.column.defaultReturn' }),
  vendorDefaultReceivePrice: formatMessage({ id: 'article.vendor.column.defaultReceivePrice' }),
  vendorDefaultReturnPrice: formatMessage({ id: 'article.vendor.column.defaultReturnPrice' }),
  vendorIsDefaultVendor: formatMessage({ id: 'article.vendor.column.isDefaultVendor' }),
  vendorSetPreferred: formatMessage({ id: 'article.vendor.operate.setPreferred' }),
  vendorSetDefaultVendorSuccessed: formatMessage({ id: 'article.vendor.message.setDefaultVendor' }),

  storePickQtyStoreType: formatMessage({ id: 'article.storepickqty.column.storeType' }),
  storePickQtyPickQpc: formatMessage({ id: 'article.storepickqty.column.pickQpc' }),
  storePickQtyCount: formatMessage({ id: 'article.storepickqty.column.count' }),
  storePickQtyCountNotInRange: formatMessage({ id: 'article.storepickqty.validate.count' }),

  pickSchemaCaseBin: formatMessage({ id: 'pickSchema.column.caseBin' }),
  pickSchemaSplitBin: formatMessage({ id: 'pickSchema.column.splitBin' }),
  pickSchemaNoDefaultQpcStr: formatMessage({ id: 'pickSchema.message.noDefaultQpcStr' }),

  setPickBin: formatMessage({ id: 'articleBusiness.column.setPickBin' }),
  manageBatch: formatMessage({ id: 'articleBusiness.column.manageBatch' }),
  newArticle: formatMessage({ id: 'articleBusiness.column.newArticle' }),
  pickQpcStr: '拣货规格',
  mixArticle: '混载属性',
};
