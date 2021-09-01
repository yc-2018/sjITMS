import { Component } from "react";
import { Input, InputNumber, Popconfirm, Divider, message, Switch } from 'antd';
import EditTable from '@/pages/Component/Form/EditTable';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { commonLocale, notNullLocale } from '@/utils/CommonLocale';
import { orgType } from '@/utils/OrgType';
import { convertCodeName } from '@/utils/utils';
import { MAX_DECIMAL_VALUE } from '@/utils/constants';
import { ownerLocale } from './OwnerLocale';
import { havePermission } from '@/utils/authority';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';
import { routerRedux } from 'dva/router';
import { basicState, getStateCaption } from "@/utils/BasicState";
import IPopconfirm from "@/pages/Component/Modal/IPopconfirm";

export default class OwnerVendorTab extends Component {

  constructor(props) {
    super(props);

    this.state = {
      data: this.handleData(this.props),
      entity:props.entity,

    }
  }

  /**
   * 查询对应关系
   */
  handleData = (props) => {
    let data = props.data;

    if (Array.isArray(data)) {
      for (let item of data) {
        if (item.key && item.key.indexOf('NEW_TEMP_ID') > -1) {
          continue;
        }

        item['key'] = item.uuid;
        item['ownerVendorCode'] = item.ownerVendor.code;
        item['ownerVendorName'] = item.ownerVendor.name;
        if (item['vendor'] && typeof item['vendor'] =='string') {
          item['vendor'] = JSON.parse(item.vendor);
        }

        item.vendor['type'] = orgType.vendor.name;
        item['vendor'] = JSON.stringify(item.vendor);
        
      }

      return data;
    } else {
      return [];
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: this.handleData(nextProps)
    })
  }
  /**
   * 查询货主与门店对应关系
   */
  queryOwnerVendors = () => {
    const { entity } = this.state
    const { dispatch } = this.props
    return new Promise((resolve, reject) => {
      dispatch({
        type: 'owner/get',
			  payload: entity.uuid,
        callback: response => {
          if (response && response.success) {
            let ownerVendors = response.data.ownerVendors;

            for(var i =0;i<ownerVendors.length;i++){
              ownerVendors[i].key = ownerVendors[i].uuid
            }
            resolve({
              success: true,
              ownerVendors: ownerVendors
            })
            return;
          } else {
            resolve({
              success: false,
              ownerVendors: []
            })
            return;
          }
        }
      });
    });
  }


  /**
   * 删除门店货主关系
   */
  onRemoveOwnerVendor = (record)=>{
    const { dispatch } = this.props;

    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'owner/onRemoveOwnerVendor',
        payload:record.uuid,
        callback: response => {
          if (response && response.success) {
            resolve({
              success: true,
              message: commonLocale.removeSuccessLocale
            })
            return;
          } else {
            resolve({
              success: false
            })
            return;
          }
        }
      });
    });
  }

  /**
   * 保存
   */
  onSave = (data) => {
    const { dispatch, owner } = this.props;
    let that = this;
    return new Promise(function (resolve, reject) {
      if (data) {
        let value = { ...data }

        if (value.vendor) {
          let vendor = JSON.parse(value.vendor);
          value.vendor = {
            uuid: vendor.uuid,
            code: vendor.code,
            name: vendor.name
          }
        } else {
          resolve({
            success: false,
            message: notNullLocale(commonLocale.vendorLocale)
          })
          return;
        }
        if(!value.ownerVendorCode){
          resolve({
            success: false,
            message: notNullLocale(ownerLocale.ownerVendorCode)
          })
          return;
        }else{
          value.ownerVendor = {
            code: data.ownerVendorCode,
            name: data.ownerVendorName
          }
        }

        value.owner ={
          uuid:owner.uuid,
          code:owner.code,
          name:owner.name,
        }

        dispatch({
          type: 'owner/onSaveOwnerVendor',
          payload: value,
          callback: response => {
            if (response && response.success) {
              data['uuid'] = response.data;

              that.queryOwnerVendors().then(result => {
                if (result.success) {
                  let ownerVendors = result.ownerVendors || [];
                  if (ownerVendors.length > 0) {
                    that.setState({data: ownerVendors})
                  }
                }
              })
                .catch(reason => console.error(reason));
              resolve({
                success: true,
                message: commonLocale.saveSuccessLocale
              })
              return;
            } else {
              resolve({
                success: false
              })
              return;
            }
          }
        });
      }
    });
  }

  /**
   * 新增一行
   */
  addNew = () => {
    let newData = {
      vendor: undefined,
      ownerVendorCode: '',
      ownerVendorName: '',
      contactor: '',
      contactPhone: '',
      address: '',
      note: '',
    };
    const { data } = this.state;
    data.push(newData);
    this.setState({
      data: data
    });
    return newData;
  }


  /**
   * 跳转到供应商详情页面
   */
  onVendorView = (vendor) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/vendor',
      payload: {
        showPage: 'view',
        entityUuid: vendor.uuid,
      }
    }));
  }

  /**
   * 表格改变时调用
   */
  onFieldChange = (fieldName, e, target) => {
    if(fieldName === 'vendor'){
      target[fieldName] = e;
    }else{

      target[fieldName] = e.target.value;
    }
  }

/**
   * 切换启用禁用
   */
  onChangeState = (record) => {
    if (record.ownerState === basicState.ONLINE.name) {
      this.offline(record);
    } else {
      this.online(record);
    }
  }

  /**
   * 启用
   */
  online = (record) => {
    const { dispatch } = this.props;
    let that = this;

    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'owner/onLineForVendor',
        payload: {
          uuid: record.uuid,
          ownerUuid: record.owner.uuid,
        },
        callback: response => {
          if (response && response.success) {
            that.props.refresh();
            message.success(commonLocale.onlineSuccessLocale);
          }
        }
      });
    });
  }

  /**
   * 禁用
   */
  offline = (record, batch) => {
    const { dispatch } = this.props;
    let that = this;

    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'owner/offLineForVendor',
        payload: {
          uuid: record.uuid,
          ownerUuid: record.owner.uuid,
        },
        callback: response => {
        
          if (response && response.success) {
            that.props.refresh();
            message.success(commonLocale.offlineSuccessLocale);
          }
        }
      });
    });
  }

  render() {
    const columns = [
      {
        title:commonLocale.vendorLocale,
        dataIndex: 'vendor',
        width: colWidth.codeNameColWidth,
        componentName: 'OrgSelect',
        isRenderUCN: true,
        isNotEdit:true,
        render: loginOrg().type !== orgType.company.name ? (text, record) => {
          if (text) {
            return <a onClick={this.onVendorView.bind(this, JSON.parse(text))}
              disabled={!havePermission(VENDOR_RES.VIEW)}><EllipsisCol colValue={convertCodeName(JSON.parse(text))} /></a>;
          } else {
            return '<空>';
          }
        } : ''
      },
      {
        title:ownerLocale.ownerVendorCode,
        dataIndex: 'ownerVendorCode',
        isNotEdit:true,
        width: itemColWidth.qpcStrEditColWidth,
        componentName: 'Input',
        render: loginOrg().type !== orgType.company.name ? (text, record) => {
          return text;
        } : ''
      },
      {
        title:ownerLocale.ownerVendorName,
        dataIndex: 'ownerVendorName',
        width: itemColWidth.qpcStrEditColWidth,
        componentName: 'Input',
        render: loginOrg().type !== orgType.company.name ? (text, record) => {
          return text;
        } : ''
      },
      {
        title:ownerLocale.ownerVendorContactor,
        dataIndex: 'contactor',
        width: itemColWidth.qpcStrEditColWidth,
        componentName: 'Input',
        render: loginOrg().type !== orgType.company.name ? (text, record) => {
          return text;
        } : ''
      },
      {
        title:ownerLocale.ownerVendorContactPhone,
        dataIndex: 'contactPhone',
        width: itemColWidth.qpcStrEditColWidth,
        componentName: 'Input',
        render: loginOrg().type !== orgType.company.name ? (text, record) => {
          return text;
        } : ''
      },
      {
        title:ownerLocale.ownerVendorAddress,
        dataIndex: 'address',
        width: itemColWidth.qpcStrEditColWidth,
        componentName: 'Input',
        render: loginOrg().type !== orgType.company.name ? (text, record) => {
          return text;
        } : ''
      }, 
      {
        title:commonLocale.stateLocale,
        dataIndex: 'ownerState',
        width: itemColWidth.qpcStrEditColWidth,
        componentName: 'Switch',
        render: loginOrg().type !== orgType.company.name ? (text, record) => {
          return getStateCaption(text);
        } : (text, record)=>{
          let confirm = text === basicState.ONLINE.name ? commonLocale.offlineLocale : commonLocale.onlineLocale;
          return <div>
            <IPopconfirm  disabled={record.editable} onConfirm={this.onChangeState.bind(this, record)}
              // disabled={!havePermission(OWNER_RES.ONLINE)}
              operate={confirm}
              object={ownerLocale.ownerVendorInfo}>
              <Switch disabled={record.editable} checked={text!=undefined?text === basicState.ONLINE.name:true} size="small" />
            </IPopconfirm>
            &emsp; {text!=undefined?getStateCaption(text):getStateCaption('ONLINE')}

          </div>
        }
      }, 
      {
        title:commonLocale.noteLocale,
        dataIndex: 'note',
        width: itemColWidth.qpcStrEditColWidth,
        componentName: 'Input',
        render: loginOrg().type !== orgType.company.name ? (text, record) => {
          return text;
        } : ''
      }, 
    ];

    const editTableProps = {
      columns: columns,
      onSave: this.onSave,
      value: this.state.data,
      addNew: this.addNew,
      onRemove: this.onRemoveOwnerVendor,
      onFieldChange: this.onFieldChange,
      noAddAndDelete: loginOrg().type !== orgType.company.name ? true : false,
      editEnable: loginOrg().type === orgType.company.name,
    };
    return <EditTable {...editTableProps} />
  }
}