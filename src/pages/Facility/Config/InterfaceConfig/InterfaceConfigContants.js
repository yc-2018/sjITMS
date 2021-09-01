import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { Select } from 'antd';
const Option = Select.Option;


/** 接口名称 */
export const InterfaceType = {
  STOREDOWNLOAD: {
    name: 'STOREDOWNLOAD',
    org:'COMPANY',
    caption: '接收门店',
  },
  VENDORDOWNLOAD: {
    name: 'VENDORDOWNLOAD',
    org:'COMPANY',    
    caption: '接收供应商',
  },
  CATEGORYDOWNLOAD: {
    name: 'CATEGORYDOWNLOAD',
    org:'COMPANY',
    caption: '接收商品类别',
  },
  ARTICLEDOWNLOAD: {
    name: 'ARTICLEDOWNLOAD',
    org:'COMPANY',
    caption: '接收商品',
  },
  ARTICLEUPLOADTIME:{
    name: 'ARTICLEUPLOADTIME',
    org:'DC',
    caption: '上传商品装盘建议',
  },
  ORDERDOWNLOAD: {
    name: 'ORDERDOWNLOAD',
    org:'DC',
    caption: '接收入库订单',
  },
  RECEIVEAUDITEDTIME: {
    org:'DC',
    name: 'RECEIVEAUDITEDTIME',
    caption: '上传收货单',
  },
  ORDERABORT: {
    name: 'ORDERABORT',
    org:'DC',
    caption: '作废订单',
  },
  ORDERFINISH:{
    name:'ORDERFINISH',
    org:'DC',
    caption:'完成订单',
  },
  ALCNTCDOWNLOAD: {
    name: 'ALCNTCDOWNLOAD',
    org:'DC',
    caption: '接收配货通知单',
  },
  ALCNTCBILLUPLOADTIME:{
    name: 'ALCNTCBILLUPLOADTIME',
    org:'DC',
    caption: '作废配货通知单',
  },
  ALCNTCBILLFINISH:{
    name:'ALCNTCBILLFINISH',
    org:'DC',
    caption:'完成配货通知单',
  },
  PICKUPBILLTOIPS:{
    name:'PICKUPBILLTOIPS',
    org:'DC',
    caption:'发送拣货单到IPS',
  },
  IPSPICKUP:{
    name:'IPSPICKUP',
    org:'DC',
    caption:'IPS拣货',
  },
  RTNNTCDOWNLOAD: {
    name: 'RTNNTCDOWNLOAD',
    org:'DC',
    caption: '接收退仓通知单',
  },
  RTNAUDITEDTIME: {
    name: 'RTNAUDITEDTIME',
    org:'DC',
    caption: '上传退仓单',
  },
  VENDORHANDOVERUPLOADTIME:{
    name:'VENDORHANDOVERUPLOADTIME',
    org:'DC',
    caption:'上传供应商退货交接单',
  },
  STORERTNNTCABORT:{
    name:'STORERTNNTCABORT',
    org:'DC',
    caption:'作废退仓通知单',
  },
  STOREHANDOVERUPLOADTIME:{
    name:'STOREHANDOVERUPLOADTIME',
    org:'COMPANY',
    caption:'上传门店交接单',
  },
  ALCDIFFDOWNLOAD:{
    name:'ALCDIFFDOWNLOAD',
    org:'DC',
    caption:'接收配货差异单',
  },
  ALCDIFFUPLOADTIME:{
    name:'ALCDIFFUPLOADTIME',
    org:'DC',
    caption:'上传配货差异单',
  },
  DECINVUPLOAD:{
    name:'DECINVUPLOAD',
    org:'DC',
    caption:'上传损耗单',
  },
  INCINVUPLOAD: {
    name: 'INCINVUPLOAD',
    org:'DC',
    caption: '上传溢余单',
  },
  MOVEUPLOADTIME: {
    name: 'MOVEUPLOADTIME',
    org:'DC',
    caption: '上传移库单',
  },
  PROCESSUPLOAD:{
    name:'PROCESSUPLOAD',
    org:'DC',
    caption: '上传加工单',
  },
  VENDORRTNNTCUPLOADTIME:{
    name:'VENDORRTNNTCUPLOADTIME',
    org:'DC',
    caption: '上传供应商退货通知单',
  },
  VENDORRTNNTCDOWNLOAD:{
    name:'VENDORRTNNTCDOWNLOAD',
    org:'DC',
    caption: '接收供应商退货通知单',
  },
  USERDOWNLOAD:{
    name:'USERDOWNLOAD',
    org:'COMPANY',
    caption: '接收用户',
  },
}


/** 日志级别 */
export const Level = {
  SUCCESS: {
    name: 'SUCCESS',
    caption: '成功',
  },
  FAIL: {
    name: 'FAIL',
    caption: '失败',
  }
}

export function getTypeOptions() {
  const interfaceTypeOptions = [];
  interfaceTypeOptions.push(<Option key='interfaceTypeAll' value=''>全部</Option>);
  Object.keys(InterfaceType).forEach(function (key) {
    if(loginOrg().type===InterfaceType[key].org){
      interfaceTypeOptions.push(<Option key={InterfaceType[key].name} value={InterfaceType[key].name}>{InterfaceType[key].caption}</Option>);
    }
  });
  return interfaceTypeOptions;
}
 