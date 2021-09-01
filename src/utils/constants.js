import { formatMessage } from 'umi/locale';

/** 前端状态显示值 */
export const STATUS = {
  ONLINE: formatMessage({ id: 'common.table.content.enabled' }),
  OFFLINE: formatMessage({ id: 'common.table.content.disabled' }),
};

/** 状态对应Badge显示 */
export const STATUS_BADGE = {
  ONLINE: 'processing',
  OFFLINE: 'error'
};

/** 后端状态-启用禁用 */
export const STATE = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE'
}

/** 来源方式 */
export const SOURCE_WAY = {
  CREATE: "CREATE",
  INTERFACE_IMPORT: "INTERFACE_IMPORT",
  FILE_IMPORT: "FILE_IMPORT",
}
/** 来源方式 */
export const SOURCE_WAY_CN = {
  CREATE: "人工新建",
  INTERFACE_IMPORT: "接口导入",
  FILE_IMPORT: "文件导入",
}

/** 进度条状态 */
export const PROGRESS_STATUS = {
  success: 'success',
  exception: 'exception',
  active: 'active',
  normal: 'normal',
};

// ----- 登录相关常量 -----
export const LOGIN_USER = "user";
export const LOGIN_ORG = "org";
export const LOGIN_COMPANY = "company";
export const LOGIN_JWT_KEY = "iwmsJwt";
export const LOGIN_INFO_JWT = "iwmsLoginJwt";

// ----- 资源权限相关常量 -----

/** iwms权限 */
export const RESOURCE_IWMS = "iwms";

/** 账号管理 */
export const RESOURCE_IWMS_ACCOUNT = "iwms.account";

/** 账号管理 - 用户管理 */
export const RESOURCE_IWMS_ACCOUNT_USER = "iwms.account.user";
/** 账号管理 - 用户管理 - 新建用户 */
export const RESOURCE_IWMS_ACCOUNT_USER_CREATE = "iwms.account.user.create";
/** 账号管理 - 用户管理 - 查看用户 */
export const RESOURCE_IWMS_ACCOUNT_USER_VIEW = "iwms.account.user.view";
/** 账号管理 - 用户管理 - 启用禁用用户 */
export const RESOURCE_IWMS_ACCOUNT_USER_ONLINE = "iwms.account.user.online";
/** 账号管理 - 用户管理 - 删除用户 */
export const RESOURCE_IWMS_ACCOUNT_USER_REMOVE = "iwms.account.user.remove";
/** 账号管理 - 用户管理 - 授权用户 */
export const RESOURCE_IWMS_ACCOUNT_USER_AUTHORIZE = "iwms.account.user.authorize";

/** 账号管理 - 角色管理 */
export const RESOURCE_IWMS_ACCOUNT_ROLE = "iwms.account.role";
/** 账号管理 - 角色管理 - 新建角色 */
export const RESOURCE_IWMS_ACCOUNT_ROLE_CREATE = "iwms.account.role.create";
/** 账号管理 - 角色管理 - 查看角色 */
export const RESOURCE_IWMS_ACCOUNT_ROLE_VIEW = "iwms.account.role.view";
/** 账号管理 - 角色管理 - 启用禁用角色 */
export const RESOURCE_IWMS_ACCOUNT_ROLE_ONLINE = "iwms.account.role.online";
/** 账号管理 - 角色管理 - 删除角色 */
export const RESOURCE_IWMS_ACCOUNT_ROLE_REMOVE = "iwms.account.role.remove";
/** 账号管理 - 角色管理 - 授权角色 */
export const RESOURCE_IWMS_ACCOUNT_ROLE_AUTHORIZE = "iwms.account.role.authorize";

/** 基本资料管理 */
export const RESOURCE_IWMS_BASIC = "iwms.basic";

/** 基本资料管理 - 配送中心 */
export const RESOURCE_IWMS_BASIC_DC = "iwms.basic.dc";
/** 基本资料管理 - 配送中心 - 新建配送中心 */
export const RESOURCE_IWMS_BASIC_DC_CREATE = "iwms.basic.dc.create";
/** 基本资料管理 - 配送中心 - 查看配送中心 */
export const RESOURCE_IWMS_BASIC_DC_VIEW = "iwms.basic.dc.view";

/** 基本资料管理 - 门店 */
export const RESOURCE_IWMS_BASIC_STORE = "iwms.basic.store";
/** 基本资料管理 - 门店 - 新建门店 */
export const RESOURCE_IWMS_BASIC_STORE_CREATE = "iwms.basic.store.create";
/** 基本资料管理 - 门店 - 查看门店 */
export const RESOURCE_IWMS_BASIC_STORE_VIEW = "iwms.basic.store.view";

/** 基本资料管理 - 门店类型 */
export const RESOURCE_IWMS_BASIC_STORETYPE = "iwms.basic.storeType";
/** 基本资料管理 - 门店 - 新建门店类型*/
export const RESOURCE_IWMS_BASIC_STORETYPE_CREATE = "iwms.basic.storeType.create";
/** 基本资料管理 - 门店 - 删除门店类型 */
export const RESOURCE_IWMS_BASIC_STORETYPE_REMOVE = "iwms.basic.storeType.remove";

/** 基本资料管理 - 承运商 */
export const RESOURCE_IWMS_BASIC_CARRIER = "iwms.basic.carrier";
/** 基本资料管理 - 承运商 - 新建承运商 */
export const RESOURCE_IWMS_BASIC_CARRIER_CREATE = "iwms.basic.carrier.create";
/** 基本资料管理 - 承运商 - 查看承运商 */
export const RESOURCE_IWMS_BASIC_CARRIER_VIEW = "iwms.basic.carrier.view";

/** 基本资料管理 - 供应商 */
export const RESOURCE_IWMS_BASIC_VENDOR = "iwms.basic.vendor";
/** 基本资料管理 - 供应商 - 新建供应商 */
export const RESOURCE_IWMS_BASIC_VENDOR_CREATE = "iwms.basic.vendor.create";
/** 基本资料管理 - 供应商 - 查看供应商 */
export const RESOURCE_IWMS_BASIC_VENDOR_VIEW = "iwms.basic.vendor.view";

/** 基本资料管理 - 车辆 */
export const RESOURCE_IWMS_BASIC_VEHICLE = "iwms.basic.vehicle";
/** 基本资料管理 - 车辆 - 新建车辆 */
export const RESOURCE_IWMS_BASIC_VEHICLE_CREATE = "iwms.basic.vehicle.create";
/** 基本资料管理 - 车辆 - 查看车辆 */
export const RESOURCE_IWMS_BASIC_VEHICLE_VIEW = "iwms.basic.vehicle.view";
/** 基本资料管理 - 车辆 - 新建车辆类型 */
export const RESOURCE_IWMS_BASIC_VEHICLE_CREATE_TYPE = "iwms.basic.vehicle.createtype";

/** 基本资料管理 - 货主 */
export const RESOURCE_IWMS_BASIC_OWNER = "iwms.basic.owner";
/** 基本资料管理 - 货主 - 新建货主 */
export const RESOURCE_IWMS_BASIC_OWNER_CREATE = "iwms.basic.owner.create";
/** 基本资料管理 - 货主 - 查看货主 */
export const RESOURCE_IWMS_BASIC_OWNER_VIEW = "iwms.basic.owner.view";

/** 基本资料管理 - 商品类别 */
export const RESOURCE_IWMS_BASIC_CATEGORY = "iwms.basic.category";
/** 基本资料管理 - 商品类别 - 新建商品类别 */
export const RESOURCE_IWMS_BASIC_CATEGORY_CREATE = "iwms.basic.category.create";
/** 基本资料管理 - 商品类别 - 查看商品类别 */
export const RESOURCE_IWMS_BASIC_CATEGORY_VIEW = "iwms.basic.category.view";
/** 基本资料管理 - 商品类别 - 删除商品类别 */
export const RESOURCE_IWMS_BASIC_CATEGORY_REMOVE = "iwms.basic.category.remove";

/** 通知管理 */
export const RESOURCE_IWMS_NOTICE = "iwms.notice";
/** 通知管理 - 下发通知 */
export const RESOURCE_IWMS_NOTICE_CREATE = "iwms.notice.create";
/** 通知管理 - 查看通知 */
export const RESOURCE_IWMS_NOTICE_VIEW = "iwms.notice.view";

/** 登录页面选项key */
export const LOGIN_PAGE_KEY = {
  phoneLogin: 'phoneLogin',
  accountLogin: 'accountLogin',
  forgetPwd: 'forgetPwd',
};

/** 验证码key */
export const CAPTCHA_KEY = "captcha";

/** 离开确认 操作 */
export const CONFIRM_LEAVE_ACTION = {
  NEW: 'NEW',
  EDIT: 'EDIT',
}


/** 配送中心 - 启用禁用 */
export const DC_STATUS = {
  ONLINE: formatMessage({ id: 'dc.index.search.content.enable' }),
  OFFLINE: formatMessage({ id: 'dc.index.search.content.disable' }),
}

/** 企业编辑类型 */
export const COMPANY_EDIT_TYPE = {
  basic: 'basic',
  used: 'used',
}

/** 门店编辑类型 */
export const STORE_EDIT_TYPE = {
  basic: 'basic'
}
/**货主编辑类型 */
export const OWNER_EDIT_TYPE = {
  basic: 'basic'
}
/** 供应商 - 启用禁用 */
export const VENDOR_STATUS = {
  ONLINE: formatMessage({ id: 'vendor.index.search.content.enable' }),
  OFFLINE: formatMessage({ id: 'vendor.index.search.content.disable' }),
}

/** 实体日志过滤条件 service caption */
export const SERVICE_CAPTION = {
  store: 'StoreServiceImpl',
  carrier: 'CarrierServiceImpl',
  dc: 'DCServiceImpl',
  owner: 'OwnerServiceImpl',
  vendor: 'VendorServiceImpl',
  vehicle: 'VehicleServiceImpl',
  article: 'ArticleServiceImpl',
  company: 'CompanyServiceImpl',
  user: 'UserServiceImpl',
  bin: 'BinServiceImpl',
  serialArch: 'SerialArchServiceImpl',
  billSort:'SmallSortServiceImpl'
}

/** 角色后端状态 */
export const ROLE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
}

/**  类型模块 过滤条件 标题*/
export const PRETYPE = {
  store: 'STORETYPE',
  storeOperating: 'STOREOPERATINGTYPE',
  storeArea:'STOREAREA',
  notice: 'NOTICETYPE',
  categoryLevel: 'CATEGORYLEVEL',
  unLoadAdvice: 'UNLOADADVICE',
  decinvType: 'DECINVTYPE',
  stockLockBillReason: 'STOCKLOCKBILLREASON',
  incInvType: 'INCINVTYPE',
  closeReason: 'CLOSEREASON',
  moveType: 'MOVETYPE',
  waveType: 'WAVETYPE',
  alcNtcType: 'ALCNTCTYPE',
  deliverycycleType: 'DELIVERYCYCLETYPE',
  rtnType:'STORERTNTYPE',
  stockAdjReason: 'STOCKADJREASON',
  returnDistributionType: 'RETURNDISTRIBUTIONTYPE',
  orderType: 'ORDERTYPE',
  adjReason:'ADJREASON',
  vendorUnLoader:'VENDORUNLOADER',
  dealMethod:'DEALMETHOD',
  unDeliveredReason:'UNDELIVEREDREASON',
  defaultQpcUnit:'DEFAULTQPCUNIT',
  billData:'BILLDATATYPE',
  dateLimit:'DATELIMIT'
}

/** 基本资料管理 - 仓位 */
export const RESOURCE_IWMS_BASIC_WRH = "iwms.basic.wrh";
/** 基本资料管理 - 仓位 - 新建仓位 */
export const RESOURCE_IWMS_BASIC_WRH_CREATE = "iwms.basic.wrh.create";
/** 基本资料管理 - 仓位 - 查看仓位 */
export const RESOURCE_IWMS_BASIC_WRH_VIEW = "iwms.basic.wrh.view";

/** 仓位 - 启用禁用 */
export const WRH_STATUS = {
  ONLINE: formatMessage({ id: 'wrh.index.search.content.enable' }),
  OFFLINE: formatMessage({ id: 'wrh.index.search.content.disable' }),
}

/** 基本资料管理 - 货位类型 */
export const RESOURCE_IWMS_FACILITY_BINTYPE = "iwms.facility.binType";
/** 基本资料管理 - 货位类型 - 新建货位类型 */
export const RESOURCE_IWMS_FACILITY_BINTYPE_CREATE = "iwms.facility.binType.create";
/** 基本资料管理 - 货位类型 - 查看货位类型 */
export const RESOURCE_IWMS_FACILITY_BINTYPE_VIEW = "iwms.facility.binType.view";

/** 物流设备管理 - 码头 */
export const RESOURCE_IWMS_FACILITY_DOCK = "iwms.facility.dock";
/** 物流设备管理 - 码头 - 新建码头 */
export const RESOURCE_IWMS_FACILITY_DOCK_CREATE = "iwms.facility.dock.create";
/** 物流设备管理 - 码头 - 查看码头 */
export const RESOURCE_IWMS_FACILITY_DOCK_VIEW = "iwms.facility.dock.view";

/** 码头 - 状态 */
export const DOCK_STATUS = {
  FREE: formatMessage({ id: 'dock.state.free' }),
  DISENABLED: formatMessage({ id: 'dock.state.disenabled' }),
  USING: formatMessage({ id: 'dock.state.using' }),
}

/** 码头 - 用途 */
export const DOCK_USAGE = {
  RECEIPT: formatMessage({ id: 'dock.usage.receipt' }),
  DELIVERY: formatMessage({ id: 'dock.usage.delivery' }),
  RETURNED: formatMessage({ id: 'dock.usage.returned' }),
}

/** 货位 - 状态 */
export const BIN_STATE = {
  FREE: formatMessage({ id: 'bin.state.free' }),
  LOCKED: formatMessage({ id: 'bin.state.locked' }),
  EXCEPITON: formatMessage({ id: 'bin.state.exception' }),
  USING: formatMessage({ id: 'bin.state.using' }),
}

/**  货位 货位设施类型 */
export const BIN_FACILITY = {
  ZONE: 'ZONE',
  PATH: 'PATH',
  SHELF: 'SHELF',
  BIN: 'BIN',
}

/** 拣货位调整单 状态 */
export const BILL_STATE = {
  INITIAL: "未审核",
  AUDIT: "已审核"
}

/** 拣货位调整单 操作方式 */
export const BILL_METHOD = {
  MANUAL: "手工单据",
  HANDHELD: "手持终端"
}

/** 整数最大值 */
export const MAX_INTEGER_VALUE = 2147483647;

/** OSS 上传 路径 */
export const OSS_UPLOAD_URL = '/iwms-account/account/oss/upload';

/** 厘米 10,4 */
export const MAX_CM_VALUE = 999999.9999;
/** 立方厘米 10,4 */
export const MAX_CC_VALUE = 999999999999999999.9999;
/** 克 19,4 */
export const MAX_G_VALUE = 999999999999999.9999;
/** 16,4 */
export const MAX_DECIMAL_VALUE = 999999999999.9999;

// 详情页分隔符
export const TITLE_SEPARATION = "：";

// 详情页基本资料标题分割符
export const BASIC_TITLE_SEPARATION = "]";
