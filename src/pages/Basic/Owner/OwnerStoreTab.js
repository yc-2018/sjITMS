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
import Empty from "@/pages/Component/Form/Empty";

export default class OwnerStoreTab extends Component {

  constructor(props) {
    super(props);

    this.state = {
      data: this.handleData(this.props),
      ownerUuid:props.owner.uuid,
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
        item['ownerStoreCode'] = item.ownerStore.code;
        item['ownerStoreName'] = item.ownerStore.name;
        if (item['store'] && typeof item['store'] =='string') {
          item['store'] = JSON.parse(item.store );
        }

        item.store['type'] = orgType.store.name;
        item['store'] = JSON.stringify(item.store);
        
      }

      return data;
    } else {
      return [];
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: this.handleData(nextProps),
      ownerUuid:nextProps.owner.uuid
    })
  }


  /**
   * 查询货主门店对应关系
   */
  queryOwnerStores = ()=>{
    const { entity } = this.state
    const { dispatch } = this.props
    return new Promise((resolve, reject) => {
      dispatch({
        type: 'owner/get',
			  payload: entity.uuid,
        callback: response => {
          if (response && response.success) {
            let ownerStores = response.data.ownerStores;

            for(var i =0;i<ownerStores.length;i++){
              ownerStores[i].key = ownerStores[i].uuid
            }
            resolve({
              success: true,
              ownerStores: ownerStores
            })
            return;
          } else {
            resolve({
              success: false,
              ownerStores: []
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
  onRemoveOwnerStore = (record)=>{
    const { dispatch } = this.props;

    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'owner/onRemoveOwnerStore',
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

        if (value.store) {
          let store = JSON.parse(value.store);
          value.store = {
            uuid: store.uuid,
            code: store.code,
            name: store.name
          }
        } else {
          resolve({
            success: false,
            message: notNullLocale(commonLocale.inStoreLocale)
          })
          return;
        }
        if(!value.ownerStoreCode){
          resolve({
            success: false,
            message: notNullLocale(ownerLocale.ownerStoreCode)
          })
          return;
        }else{
          value.ownerStore = {
            code: data.ownerStoreCode,
            name: data.ownerStoreName,
            name: data.ownerStoreName
          }
        }

        value.owner ={
          uuid:owner.uuid,
          code:owner.code,
          name:owner.name,
        }

        dispatch({
          type: 'owner/onSaveOwnerStore',
          payload: value,
          callback: response => {
            if (response && response.success) {
              data['uuid'] = response.data;
              that.queryOwnerStores().then(result => {
                if (result.success) {
                  let ownerStores = result.ownerStores || [];
                  if (ownerStores.length > 0) {
                    that.setState({data: ownerStores})
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
      store: undefined,
      ownerStoreCode: '',
      ownerStoreName: '',
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
   * 跳转到门店详情页面
   */
  onVendorView = (vendor) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/store',
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
    if(fieldName === 'store'){
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
        type: 'owner/onLineForStore',
        payload: {
          uuid: record.uuid,
          ownerUuid: record.owner.Uuid,
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
        type: 'owner/offLineForStore',
        payload: {
          uuid: record.uuid,
          ownerUuid: record.owneruuid,
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
        title:commonLocale.inStoreLocale,
        dataIndex: 'store',
        width: colWidth.codeNameColWidth,
        componentName: 'OrgSelect',
        isRenderUCN: true,
        isNotEdit:true,
        orgType:'STORE',
        orgTypePlaceholder:'门店',
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
        title:ownerLocale.ownerStoreCode,
        dataIndex: 'ownerStoreCode',
        width: itemColWidth.qpcStrEditColWidth,
        componentName: 'Input',
        isNotEdit:true,
        render: loginOrg().type !== orgType.company.name ? (text, record) => {
          return text;
        } : ''
      },
      {
        title:ownerLocale.ownerStoreName,
        dataIndex: 'ownerStoreName',
        width: itemColWidth.qpcStrEditColWidth,
        componentName: 'Input',
        render: loginOrg().type !== orgType.company.name ? (text, record) => {
          return text;
        } : ''
      },
      {
        title:ownerLocale.ownerStoreContactor,
        dataIndex: 'contactor',
        width: itemColWidth.qpcStrEditColWidth,
        componentName: 'Input',
        render: loginOrg().type !== orgType.company.name ? (text, record) => {
          return text;
        } : ''
      },
      {
        title:ownerLocale.ownerStoreContactPhone,
        dataIndex: 'contactPhone',
        width: itemColWidth.qpcStrEditColWidth,
        componentName: 'Input',
        render: loginOrg().type !== orgType.company.name ? (text, record) => {
          return text;
        } : ''
      },
      {
        title:ownerLocale.ownerStoreAddress,
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
              object={ownerLocale.ownerStoreInfo}>
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
      onRemove: this.onRemoveOwnerStore,
      onFieldChange: this.onFieldChange,
      noAddAndDelete: loginOrg().type !== orgType.company.name ? true : false,
      editEnable: loginOrg().type === orgType.company.name,

    };
    return <EditTable {...editTableProps} />
  }
}