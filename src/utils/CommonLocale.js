import { formatMessage } from 'umi/locale';
const common_code_key = "common.code";
const common_name_key = "common.name";
const common_state_key = "common.state";
const common_sourceWay_key = "common.sourceWay";
const common_sourceType_key = "common.sourceType";
const common_operate_key = "common.operate";
const common_operateMethod_key = "common.operateMethod";
const common_yes_key = "common.yes";
const common_no_key = "common.no";
const common_all_key = "common.all";
const common_empty = "common.tips.empty";
const common_action_create_key = "common.action.create";
const common_action_save_key = "common.action.save";
const common_action_add_key = "common.action.add";
const common_action_import_key = "common.action.import";
const common_action_edit_key = "common.action.edit";
const common_action_finish_key = "common.action.finish";
const common_action_delete_key = "common.action.delete";
const common_action_view_key = "common.action.view";
const common_action_set_default_key = "common.action.setDefault";
const common_action_audit_key = "common.action.audit";
const common_action_approve_key = "common.action.approve";
const common_button_confirm = "common.button.confirm";
const common_button_cancel = "common.button.cancel";
const common_operate_confirm_enable = "common.operate.confirm.enable";
const common_operate_confirm_disable = "common.operate.confirm.disable";
const common_operate_confirm_delete = "common.operate.confirm.delete";
const common_operate_confirm_audit = "common.operate.confirm.audit";
const common_operate_confirm_clearItems = "common.operate.confirm.clearItems";
const common_operate_confirm_lineFieldNotNull = "common.operate.confirm.lineFieldNotNull";
const common_notnull_validate = "common.notnull.validate";
const common_toolong_validate = "common.toolong.validate";
const common_placeholder = "common.placeholder";
const common_placeholder_choose = "common.placeholder.choose";
const common_placeholder_contained = "common.placeholder.contained";
const common_placeholder_choose_contained = "common.placeholder.choose.contained";
const common_stock_article = "common.stock.article";
const common_stock_bincode = "common.stock.bincode";
const common_stock_container = "common.stock.container";
const common_stock_productionBatch = "common.stock.productionBatch";
const common_stock_stockBatch = "common.stock.stockBatch";
const common_stock_productionDate = "common.stock.productionDate";
const common_stock_validDate = "common.stock.validDate";
const common_stock_vendor = "common.stock.vendor";
const common_stock_owner = "common.stock.owner";
const common_stock_qpcStr = "common.stock.qpcStr";
const common_stock_qpc = "common.stock.qpc";
const common_stock_qty = "common.stock.qty";
const common_stock_caseQtyStr = "common.stock.caseQtyStr";
export function getMessage(key, value) {
  return formatMessage({ id: key }, value);
}
export function placeholderChooseLocale(name) {
  return getMessage(common_placeholder_choose, {
    name: name
  });
}
export function placeholderLocale(name) {
  return getMessage(common_placeholder, {
    name: name
  });
}
export function placeholderChooseContainedLocale(name) {
  return getMessage(common_placeholder_choose_contained, {
    name: name
  });
}
export function placeholderContainedLocale(name) {
  return getMessage(common_placeholder_contained, {
    name: name
  });
}
export function notNullLocale(name) {
  return getMessage(common_notnull_validate, {
    name: name
  });
}
export function tooLongLocale(name, length) {
  return getMessage(common_toolong_validate, {
    name: name,
    length: length
  });
}
export const codeLocale = getMessage(common_code_key);
export const nameLocale = getMessage(common_name_key);
export const stateLocale = getMessage(common_state_key);
export const operateLocale = getMessage(common_operate_key);
export const operateMethodLocale = getMessage(common_operateMethod_key);
export const sourceWayLocale = getMessage(common_sourceWay_key);
export const sourceTypeLocale = getMessage(common_sourceType_key);
export const yesLocale = getMessage(common_yes_key);
export const noLocale = getMessage(common_no_key);
export const allLocale = getMessage(common_all_key);
export const emptyLocale = getMessage(common_empty);
export const createLocale = getMessage(common_action_create_key);
export const saveLocale = getMessage(common_action_save_key);
export const addLocale = getMessage(common_action_add_key);
export const importLocale = getMessage(common_action_import_key);
export const editLocale = getMessage(common_action_edit_key);
export const finishLocale = getMessage(common_action_finish_key);
export const deleteLocale = getMessage(common_action_delete_key);
export const viewLocale = getMessage(common_action_view_key);
export const setDefaultLocale = getMessage(common_action_set_default_key);
export const auditLocale = getMessage(common_action_audit_key);
export const approveLocale = getMessage(common_action_approve_key);
export const confirmLocale = getMessage(common_button_confirm);
export const cancelLocale = getMessage(common_button_cancel);
export const confirmEnableLocale = getMessage(common_operate_confirm_enable);
export const confirmDisableLocale = getMessage(common_operate_confirm_disable);
export const confirmDeleteLocale = getMessage(common_operate_confirm_delete);
export function confirmAuditLocale(item) {
  return getMessage(common_operate_confirm_audit, {
    item: item
  });
}
export function confirmClearItemsLocale(item) {
  return getMessage(common_operate_confirm_clearItems, {
    item: item
  });
}
export function confirmLineFieldNotNullLocale(line, item) {
  return getMessage(common_operate_confirm_lineFieldNotNull, {
    line: line,
    item: item
  });
}
export const commonLocale = {
  codeLocale: codeLocale,
  nameLocale: nameLocale,
  shelfCode:'代码',
  congfigLocale: '配置信息',
  billNumberLocal: "单号",
  orderBillNumberLocal: "订单号",
  lineLocal: "行",
  storeAllocationBinCode: "分拨位",
  articleCategory: '商品类别',
  codeAndNameLocale: '代码/名称',
  vehicleType:'车型',
  carrier:'承运商',
  pickAreNameLocale: '拣货分区',
  palletBinTypeLocale:'板位类型',
  wrhNameLocale:'仓位',
  dockNameLocale:'码头',
  containerTypeNameLocale:'容器类型',
  shortNameLocale: '简称',
  contactorLocale: '联系人',
  contactPhoneLocale: '联系方式',
  zipCodeLocale: '邮编',
  addressLocale: '地址',
  custom1Locale: '自定义字段1',
  ipLocal: 'IP地址',
  lightStepLocal: '服务地址',
  portLocal: '端口号',
  waveLocal: '波次号',
  attachMent:'附件',
  operateAreaLocale: '经营面积',
  homeUrlLocale: '主页',
  customField1: '自定义字段1',
  noteLocale: '备注',
  onlineLocale: '启用',
  offlineLocale: '禁用',
  abortLocale: '作废',
  copyLocale: '复制',
  batchOnlineLocale: '批量启用',
  batchOfflineLocale: '批量禁用',
  batchAddLocale: '新增',
  batchModifyLocale: '批量修改',
  batchRemoveLocale: '删除',
  batchCancelLocale: '批量取消',
  batchAuditLocale: '审核',
  batchApproveLocale: '批准',
  batchFinishLocale: '完成',
  batchAbortLocale: '作废',
  batchCopyLocale: '复制',
  modifyState: '修改状态',
  batchModifyStateLocal: '修改状态',
  downloadLocale: '下载',
  importStore: '导入门店',
  taskNumberLocale: '作业点号',
  taskNameLocale: '作业点名称',
  taskOrderLocale: '作业点顺序',
  stateLocale: stateLocale,
  operateLocale: operateLocale,
  operateMethodLocale: operateMethodLocale,
  sourceWayLocale: sourceWayLocale,
  sourceTypeLocale: sourceTypeLocale,
  manageLocal: '管理',
  yesLocale: yesLocale,
  noLocale: noLocale,
  allLocale: allLocale,
  createLocale: createLocale,
  saveLocale: saveLocale,
  addLocale: addLocale,
  importLocale: importLocale,
  editLocale: editLocale,
  deleteLocale: deleteLocale,
  finishLocale: finishLocale,
  viewLocale: viewLocale,
  approveLocale: approveLocale,
  auditLocale: auditLocale,
  setDefaultLocale: setDefaultLocale,
  confirmLocale: confirmLocale,
  cancelLocale: cancelLocale,
  confirmEnableLocale: confirmEnableLocale,
  confirmDisableLocale: confirmDisableLocale,
  confirmDeleteLocale: confirmDeleteLocale,
  confirmAuditLocale: '确认审核吗',
  steps: '时间轴',
  basicInfoLocale: '基本信息',
  billInfoLocale: '单据信息',
  billItemsLocale: '单据明细',
  profileItemsLocale: '概要',
  itemsLocale: '明细',
  itemsLineLocale: '明细行',
  bussinessLocale: '业务信息',
  operateInfoLocale: '操作日志',
  timeLineLocale: '时间轴',
  saveSuccessLocale: '保存成功',
  modifySuccessLocale: '修改成功',
  onlineSuccessLocale: '启用成功',
  offlineSuccessLocale: '禁用成功',
  removeSuccessLocale: '删除成功',
  inValidSuccessLocale: '失效成功',
  auditSuccessLocale: '审核成功',
  batchReviewSuccessLocale: '批量复查成功',
  approveSuccessLocale: '批准成功',
  abortSuccessLocale: '作废成功',
  finishSuccessLocale: '完成成功',
  startSuccessLocale: '启动成功',
  rollBackSuccessLocale: '回滚成功',
  confirmSuccessLocale: '确认成功',
  copySuccessLocale: '复制成功',
  saveAndAuditSuccess: '保存并审核成功',
  backLocale: '返回',
  printLocale: '打印',
  printSuccessLocale: '打印成功',
  printerLocale: '打印机',
  printerConfigLocale: '打印机设置',
  printTemplateLocale: '打印模板',
  printTemplateConfigLocale: '打印模板设置',
  printTimeLocale: '打印时间',
  downloadTemplate: '模板下载',
  // 单据
  inDCLocale: '配送中心',
  inDispatchCenterLocale: '调度中心',
  inOwnerLocale: '货主',
  inWrhLocale: '仓位',
  inStoreLocale: '门店',
  inVendorLocale: '供应商',
  inlogisticModeLocale: '物流方式',
  inWaveTypeLocale: '波次类型',
  inOrderBillNumberLocale: '订单号',
  sourceBillNumberLocal: '来源订单号',
  inUploadDateLocale: '上传时间',
  inDownloadDateLocale: '下发时间',
  inArticleLocale: '商品',
  rawArticleLocal: '原料明细',
  endproductArticleLocal: '成品明细',
  inArticleCodesLocale: '包含的商品代码',
  inQpcAndMunitLocale: '规格/计量单位',
  inQtyStrLocale: '件数',
  inQtyLocale: '数量',
  inProductDateLocale: '生产日期',
  inBookDateLocale: '预约日期',
  inValidDateLocale: '到效日期',
  inContainerBarcodeLocale: '容器',
  inProductionBatchLocale: '批号',
  inStockBatchLocale: '批次',
  inSourceBillLocale: '单据来源',
  inPriceLocale: '单价',
  inBinCodeLocale: '货位',
  inBinUsageLocale: '货位用途',
  inAllQtyLocale: '总数量',
  inAllPlanQtyLocale: '计划数量',
  inAllRealQtyLocale: '实际数量',
  inAllQtyStrLocale: '总件数',
  inAllPlanQtyStrLocale: '计划件数',
  inAllRealQtyStrLocale: '实际件数',
  inAllShipQtyStrLocale: '装车件数',
  inAllArticleCountLocale: '总品项数',
  inAllPlanArticleCountLocale: '计划品项数',
  inAllRealArticleCountLocale: '实际品项数',
  inAllShipArticleCountLocale: '装车品项数',
  inAllVolumeLocale: '总体积(m³)',
  inAllPlanVolumeLocale: '计划体积(m³)',
  inAllRealVolumeLocale: '实际体积(m³)',
  inAllShipVolumeLocale: '装车体积(m³)',
  inVolumeLocale: '体积(m³)',
  inTmsAllWeightLocale: '总重量(吨)',
  inAllWeightLocale: '总重量(kg)',
  inAllPlanWeightLocale: '计划重量(kg)',
  inAllRealWeightLocale: '实际重量(kg)',
  inAllShipWeightLocale: '装车重量(kg)',
  inWeightLocale: '重量(kg)',
  inTmsWeightLocale: '重量(吨)',
  inAllAmountLocale: '总金额',
  inAllPlanAmountLocale: '计划金额',
  inAllRealAmountLocale: '实际金额',
  inAllShipAmountLocale: '装车金额',
  inAmountLocale: '金额',
  inAllStoresLocale: '总门店数',
  inAllPlanStoresLocale: '计划门店数',
  inAllRealStoresLocale: '实际门店数',
  inAllShipStoresLocale: '装车门店数',
  inAllBillsLocale: '总单数',
  inAllPlanBillsLocale: '计划单数',
  inAllRealBillsLocale: '实际单数',
  inAllShipBillsLocale: '装车单数',
  queryBillDays: '查询天数',
  addItemLocal: '新增',
  batchAddDataLocale: '添加',
  //库存通用
  articleLocale: getMessage(common_stock_article),
  bincodeLocale: getMessage(common_stock_bincode),
  containerLocale: getMessage(common_stock_container),
  productionBatchLocale: getMessage(common_stock_productionBatch),
  stockBatchLocale: getMessage(common_stock_stockBatch),
  productionDateLocale: getMessage(common_stock_productionDate),
  validDateLocale: getMessage(common_stock_validDate),
  vendorLocale: getMessage(common_stock_vendor),
  ownerLocale: getMessage(common_stock_owner),
  qpcStrLocale: getMessage(common_stock_qpcStr),
  qpcLocale: getMessage(common_stock_qpc),
  qtyLocale: getMessage(common_stock_qty),
  caseQtyStrLocale: getMessage(common_stock_caseQtyStr),
  // 基本资料
  vendorCodeLocale: '供应商代码',
  vendorNameLocale: '供应商名称',

  previousBill: '上一单',
  nextBill: '下一单',
  articleAndSpec: formatMessage({ id: 'orderBill.articleAndSpec' }),
};
