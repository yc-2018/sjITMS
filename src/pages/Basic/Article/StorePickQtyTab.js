import { PureComponent } from "react";
import { Input, InputNumber, Popconfirm, Divider } from 'antd';
import EditTable from '@/pages/Component/Form/EditTable';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { commonLocale, notNullLocale } from '@/utils/CommonLocale';
import { orgType } from '@/utils/OrgType';
import { convertCodeName } from '@/utils/utils';
import { MAX_DECIMAL_VALUE } from '@/utils/constants';
import { PICK_QPC } from './Constants';
import { articleLocale } from './ArticleLocale';
export default class StorePickQtyTab extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      data: this.handleData(),
    }
  }

  handleData = () => {
    let data = this.props.data;

    if (Array.isArray(data)) {
      data.map(item => {
        item['key'] = item.uuid;
      });

      return data;
    } else {
      return [];
    }
  }

  onSave = (data) => {
    const { dispatch, article } = this.props;

    return new Promise(function (resolve, reject) {
      if (!data.storeType) {
        resolve({
          success: false,
          message: notNullLocale(articleLocale.storePickQtyStoreType)
        });
        return;
      }

      if (!data.pickQpc) {
        resolve({
          success: false,
          message: notNullLocale(articleLocale.storePickQtyPickQpc)
        });
        return;
      }
      if(data.count<=0){
          resolve({
            success: false,
            message: "出货倍数须大于0"
          });
          return;
      }

      data['articleUuid'] = article.uuid;
      data['companyUuid'] = loginCompany().uuid;

      dispatch({
        type: 'article/saveOrModifyStorePickQty',
        payload: data,
        callback: response => {
          if (response && response.success) {
            data['uuid'] = response.data;
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
    });
  }

  addNew = () => {
    let newData = {
      storeType: '',
      pickQpc: '',
      count: 0,
    };
    const { data } = this.state;
    data.push(newData);
    this.setState({
      data: data
    });
    return newData;
  }

  onRemove = (record) => {
    const { dispatch } = this.props;

    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'article/removeStorePickQty',
        payload: {
          articleUuid: record.articleUuid,
          uuid: record.uuid
        },
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

  onFieldChange = (fieldName, e, target) => {
    if (fieldName === 'pickQpc') {
      if (e === 'CASE') {
        target.count = 1;
      }
      target[fieldName] = e;
    } else if (fieldName === 'count') {
      target[fieldName] = e;
    } else {
      target[fieldName] = e;
      target['pickQpc'] = 'CASE'
      target.count = 1;
    }
  }

  render() {
    const columns = [{
      title: articleLocale.storePickQtyStoreType,
      dataIndex: 'storeType',
      width: itemColWidth.qpcStrEditColWidth,
      componentName: 'StoreTypeSelect',
      render: loginOrg().type !== orgType.company.name ? (text, record) => {
        return text;
      } : ''
    }, {
      title: articleLocale.storePickQtyPickQpc,
      width: itemColWidth.qpcStrEditColWidth,
      dataIndex: 'pickQpc',
      componentName: 'PickQpc',
      render: loginOrg().type !== orgType.company.name ? (text, record) => {
        return PICK_QPC[text];
      } : ''
    }, {
      title: articleLocale.storePickQtyCount,
      dataIndex: 'count',
      width: itemColWidth.qpcStrEditColWidth,
      componentName: 'InputNumber',
      min: 0,
      max: MAX_DECIMAL_VALUE,
      render: loginOrg().type !== orgType.company.name ? (text, record) => {
        if (record.pickQpc === 'CASE') {
          return 1;
        }
        return text;
      } : ''
    }];

    const editTableProps = {
      columns: columns,
      onSave: this.onSave,
      value: this.state.data,
      addNew: this.addNew,
      onRemove: this.onRemove,
      onFieldChange: this.onFieldChange,
      noAddAndDelete: loginOrg().type !== orgType.company.name ? true : false,
      editEnable: loginOrg().type === orgType.company.name,
    };
    return <EditTable {...editTableProps} />
  }
}
