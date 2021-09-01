import { PureComponent } from "react";
import { Input, InputNumber, Popconfirm, Divider } from 'antd';
import EditTable from '@/pages/Component/Form/EditTable';
import { itemColWidth } from '@/utils/ColWidth';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { commonLocale, tooLongLocale } from '@/utils/CommonLocale';
import { orgType } from  '@/utils/OrgType';
import { companyLocal } from '../Company/CompanyLocal';
import { convertCodeName } from '@/utils/utils';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';

export default class ErpConfiguration extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      data: props.data ? props.data : []
    }
  }

  componentDidMount = () => {
    this.handleData();
  }

  handleData = () => {
    const { data } = this.props;
    if (Array.isArray(data)) {
      data.map(item => {
        item['key'] = item.uuid;
      })
      this.setState({
        data: data,
      })
    }
  }

  onSave = (data) => {
    const { dispatch, companyUuid } = this.props;

    return new Promise(function (resolve, reject) {
      if (data) {
        if (data.erpName && data.erpName.length > 30) {
          resolve({
            success: false,
            message: tooLongLocale(companyLocal.erp, 30),
          });
          return;
        }
        if (data.serviceUrl && data.serviceUrl.length > 100) {
          resolve({
            success: false,
            message: tooLongLocale(companyLocal.interfaceAddress, 100),
          });
          return;
        }
        data['companyUuid'] = data.companyUuid;
        dispatch({
          type: 'erp/add',
          payload: data,
          callback: response => {
            if (response && response.success) {
              resolve({
                success: true,
                message: commonLocale.saveSuccessLocale
              })
              return;
            } else {
              resolve( {
                success: false
              })
              return;
            }
          }
        });
      }
    });
  }

  onFieldChange = (fieldName, e, target) => {
    target[fieldName] = e.target.value;
  }

  render() {
    const columns = [{
      title: companyLocal.dc,
      dataIndex: 'dc',
      width: itemColWidth.qpcStrEditColWidth,
      componentName: '',
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    }, {
      title: companyLocal.erp,
      dataIndex: 'erpName',
      width: itemColWidth.qpcStrEditColWidth,
      componentName: 'Input',
    }, {
      title: companyLocal.interfaceAddress,
      dataIndex: 'serviceUrl',
      width: itemColWidth.qpcStrEditColWidth,
      componentName: 'Input',
    }];

    const editTableProps = {
      columns: columns,
      onSave: this.onSave,
      value: this.state.data,
      onFieldChange: this.onFieldChange,
      noAddAndDelete: true,
      editEnable: true
    };
    return <EditTable {...editTableProps} />
  }
}
