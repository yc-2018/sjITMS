import { havePermission } from '@/utils/authority';
export const StockTakePlanLocale = {
  title: '盘点计划',
  remove: '删除',
  finish: '完成',
  schema: '盘点模式',
  brightTake: '明盘',
  blindTake: '盲盘',
  operateMehthod: '盘点方式',
  handTerminal: '手持终端',
  manualBill: '手工单据',
  owner: '货主',
  scopeInfo: '盘点范围',
  conditionInfo: '分单依据',
  BRIGHT_TAKE: 'BRIGHT_TAKE',
  BLIND_TAKE: 'BLIND_TAKE',
  billInfo: '单据信息',
  pickArea: '拣货分区',
  binUsage: '货位用途',
  binScope: '货位范围',
  change: '动销',
  articleScope: '商品范围',
  splitConfition: '分单条件',
  maxBillCount: '最大单据数',
  maxBinCount: '最大货位数',
  path: '货道',
  zone: '货区',
  existStock: '存在库存',
  pattern: /^(\s*\w{1,8}(-\w{1,8})?([(]{1}(\w{1}\/)*[^\/][)]{1})?\s*){1}(,\s*\w{1,8}(-\w{1,8})?([(]{1}(\w{1}\/)*[^\/][)]{1})?\s*)*$/,
  message: '满足格式10、10(1/2)、10-20，多个以逗号隔开，最大长度100',
  serialNum: '序列号',
  type: '盘点库存处理方式',
  virtualityBin: '虚拟货位'
}

export const StockTakePlanState = {
  'INITIAL': '初始',
  'INPROGRESS': '进行中',
  'FINISHED': '已完成'
}

/**状态 */
export const State = {
  INITIAL: {
    name: 'INITIAL',
    caption: '初始',
  },
  INPROGRESS: {
    name: 'INPROGRESS',
    caption: '进行中',
  },
  FINISHED: {
    name: 'FINISHED',
    caption: '已完成',
  }
}

export const Type = {
  DEC_INC: {
    name: 'DEC_INC',
    caption: '损耗溢余',
  },
  VIRTUALITY_STOCK: {
    name: 'VIRTUALITY_STOCK',
    caption: '虚拟货位',
  }
}


export const StockTakeSchema = {
  'BLIND_TAKE': '盲盘',
  'BRIGHT_TAKE': '明盘',
}

export const OperateMethod = {
  'MANUAL': '手工单据',
  'RF': '手持终端'
}

const RES_CREATE = "iwms.inner.stockTakePlan.create";
const RES_EDIT = "iwms.inner.stockTakePlan.edit";
const RES_VIEW = "iwms.inner.stockTakePlan.view";
const RES_DELETE = "iwms.inner.stockTakePlan.delete";
const RES_FINISH = "iwms.inner.stockTakePlan.finish";
const RES_GENTAKEBILL = "iwms.inner.stockTakePlan.generateStockTakeBill";

export const StockTakePlanPerm = {
  CREATE: !havePermission(RES_CREATE),//RES_CREATE,
  EDIT: !havePermission(RES_EDIT),//RES_EDIT,
  VIEW: !havePermission(RES_VIEW),//RES_VIEW,
  FINISH: !havePermission(RES_FINISH),//RES_DELETE,
  REMOVE: !havePermission(RES_DELETE),//RES_ENABLE,
  GENTAKEBILL: !havePermission(RES_GENTAKEBILL),//RES_DISENABLE
};
