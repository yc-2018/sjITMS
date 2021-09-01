import { Component } from "react";
import { Input, InputNumber, Popconfirm, Divider, message } from 'antd';
import EditTable from '@/pages/Component/Form/EditTable';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { commonLocale, notNullLocale } from '@/utils/CommonLocale';
import { orgType } from '@/utils/OrgType';
import { convertCodeName } from '@/utils/utils';
import { MAX_DECIMAL_VALUE } from '@/utils/constants';
import { articleLocale } from './ArticleLocale';
import { havePermission } from '@/utils/authority';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';
import { routerRedux } from 'dva/router';

export default class ArticleVendorTab extends Component {

  constructor(props) {
    super(props);

    this.state = {
      data: this.handleData(this.props)
    }
  }

  handleData = (props) => {
    let data = props.data;

    if (Array.isArray(data)) {
      let defaultVendor = props.article.defaultVendor;
      for (let item of data) {
        // let val = {
        //   uuid: item.vendor.uuid,
        //   code: item.vendor.code,
        //   name: item.vendor.name
        // };
        if (item.key && item.key.indexOf('NEW_TEMP_ID') > -1) {
          continue;
        }

        item['key'] = item.uuid;
        if (item['vendor'] && typeof item['vendor'] =='string') {
          item['vendor'] = JSON.parse(item.vendor);
        }
        if (defaultVendor && defaultVendor.uuid === item.vendor.uuid) {
          item['isDefaultVendor'] = true;
        } else {
          item['isDefaultVendor'] = false;
        }
        
        // item.vendor['type'] = orgType.vendor.name;
        item['vendor'] = JSON.stringify(item.vendor);
        // item['vendor'] = JSON.stringify(val);
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

  onSave = (data) => {
    const { dispatch, article } = this.props;

    return new Promise(function (resolve, reject) {
      if (data) {
        let articleVendor = { ...data }
        articleVendor['articleUuid'] = article.uuid;
        articleVendor['companyUuid'] = loginCompany().uuid;

        if (articleVendor.vendor) {
          let vendor = JSON.parse(articleVendor.vendor);
          articleVendor.vendor = {
            uuid: vendor.uuid,
            code: vendor.code,
            name: vendor.name
          }
        } else {
          resolve({
            success: false,
            message: notNullLocale(articleLocale.vendor)
          })
          return;
        }

        dispatch({
          type: 'article/saveOrModifyArticleVendor',
          payload: articleVendor,
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
      }
    });
  }

  addNew = () => {
    let newData = {
      vendorCode: '',
      defaultReceivePrice: 0,
      defaultReturnPrice: 0,
      defaultReceive: false,
      defaultReturn: false,
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
        type: 'article/removeArticleVendor',
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

  onFieldChange = (fieldName, e, target) => {
    if (fieldName === 'defaultReceive') {
      target[fieldName] = e.target.value;
    } else if (fieldName === 'defaultReturn') {
      target[fieldName] = e.target.value;
    } else {
      target[fieldName] = e;
    }
  }

  handleSetDefaultReceive = (record) => {
    record.defaultReceive = true;
    this.onSave(record)
      .then(result => {
        if (result.success) {
          result.message && message.success(result.message);
          this.props.refresh();
        }
      })
      .catch(reason => console.error(reason));
  }

  handleSetDefaultReturn = (record) => {
    record.defaultReturn = true;
    this.onSave(record)
      .then(result => {
        if (result.success) {
          result.message && message.success(result.message);
          this.props.refresh();
        }
      })
      .catch(reason => console.error(reason));
  }

  handleSetDefaultVendor = (record) => {
    const { dispatch, article } = this.props;
    const { data } = this.state;

    if (record) {
      let currVendorCode = JSON.parse(record.vendor).code;
      let tempArticle = article;
      tempArticle.defaultVendorCode = currVendorCode;
      tempArticle.categoryCode = article.category.code;
      tempArticle.ownerCode = article.owner.code;
      delete tempArticle.vendors;
      delete tempArticle.qpcs;
      delete tempArticle.storePickQtys;
      delete tempArticle.barcodes;

      dispatch({
        type: 'article/modify',
        payload: tempArticle,
        callback: response => {
          if (response && response.success) {
            message.success(articleLocale.vendorSetDefaultVendorSuccessed);
            this.props.refresh();
          }
        },
      });
    }
  }

  render() {
    const columns = [{
      title: articleLocale.vendor,
      dataIndex: 'vendor',
      width: colWidth.codeNameColWidth,
      // componentName: 'OrgSelect',
      componentName: 'VendorSelect',
      isRenderUCN: true,
      render: loginOrg().type !== orgType.company.name ? (text, record) => {
        if (text) {
          return <a onClick={this.onVendorView.bind(this, JSON.parse(text))}
            disabled={!havePermission(VENDOR_RES.VIEW)}><EllipsisCol colValue={convertCodeName(JSON.parse(text))} /></a>;
        } else {
          return '<空>';
        }
      } : ''
    }, {
      title: articleLocale.vendorDefaultReceive,
      dataIndex: 'defaultReceive',
      width: 120,
      render: (text, record) => {
        if (text)
          return commonLocale.yesLocale;
        else {
          if (record.editable || loginOrg().type !== orgType.company.name) {
            return commonLocale.noLocale;
          }
          return (<a onClick={this.handleSetDefaultReceive.bind(this, record)}>
            {articleLocale.vendorSetPreferred}
          </a>);
        }
      }
    }, {
      title: articleLocale.vendorDefaultReturn,
      dataIndex: 'defaultReturn',
      width: 120,
      render: (text, record) => {
        if (text)
          return commonLocale.yesLocale;
        else {
          if (record.editable || loginOrg().type !== orgType.company.name) {
            return commonLocale.noLocale;
          }
          return (<a onClick={this.handleSetDefaultReturn.bind(this, record)}>
            {articleLocale.vendorSetPreferred}
          </a>);
        }
      }
    }, {
      title: articleLocale.vendorDefaultReceivePrice,
      dataIndex: 'defaultReceivePrice',
      width: 120,
      componentName: 'InputNumber',
      min: 0,
      max: MAX_DECIMAL_VALUE,
      render: loginOrg().type !== orgType.company.name ? (text, record) => {
        return text;
      } : ''
    }, {
      title: articleLocale.vendorDefaultReturnPrice,
      dataIndex: 'defaultReturnPrice',
      componentName: 'InputNumber',
      width: 120,
      min: 0,
      max: MAX_DECIMAL_VALUE,
      render: loginOrg().type !== orgType.company.name ? (text, record) => {
        return text;
      } : ''
    }, {
      title: articleLocale.vendorIsDefaultVendor,
      dataIndex: 'isDefaultVendor',
      width: 120,
      render: (text, record) => {
        if (text)
          return commonLocale.yesLocale;
        else {
          if (record.editable || loginOrg().type !== orgType.company.name) {
            return commonLocale.noLocale;
          }
          return (<a onClick={this.handleSetDefaultVendor.bind(this, record)}>
            {commonLocale.setDefaultLocale}
          </a>);
        }
      }
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
      ownerUuid: this.props.article.owner.uuid
    };
    return <EditTable {...editTableProps} />
  }
}
