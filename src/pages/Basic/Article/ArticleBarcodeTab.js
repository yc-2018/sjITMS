import { PureComponent } from "react";
import { Input, InputNumber, Popconfirm, Divider } from 'antd';
import EditTable from '@/pages/Component/Form/EditTable';
import { itemColWidth } from '@/utils/ColWidth';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { match1MN } from '@/utils/utils';
import { articleLocale } from './ArticleLocale';
import { commonLocale } from '@/utils/CommonLocale';
import { orgType } from  '@/utils/OrgType';
import { tooLongLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import {RESOURCE_IWMS_BASIC_ARTICLE_EDIT} from './Permission';
import { qpcStrFrom } from '@/pages/Facility/Config/BillQpcStr/BillQpcStrConfigContans';

export default class ArticleBarcodeTab extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      data: props.data ? props.data : []
    }
  }

  componentDidMount = () => {
    this.handleData(this.props.data);
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.data) {
      this.handleData([])
    }

    if (nextProps.data&&nextProps.data!=this.props.data){
      this.handleData(nextProps.data)
    }
  }

  handleData = (data) => {
    if (Array.isArray(data)) {
      data.map(item => {
        item['key'] = item.uuid;
      });
      this.setState({
        data: data,
      })
    }
  }

  onSave = (data) => {
    const { dispatch, article } = this.props;

    return new Promise(function (resolve, reject) {
      if (data) {
        if(data.barcode===""){
          resolve({
            success: false,
            message: "条码不可以为空"
          });
        }
        if(data.qpcStr===""){
          resolve({
            success: false,
            message: "规格不可以为空"
          });
        }
        if (!match1MN(data.qpcStr)) {
          resolve({
            success: false,
            message: articleLocale.articleQpcQpcStrNotMatch
          });
          return;
        }
        if (data.barcode.length > 30) {
          resolve({
            success: false,
            message: tooLongLocale(articleLocale.barcode, 30),
          });
          return;
        }

        // 校验重复
        if (Array.isArray(article.barcodes) && article.barcodes.length > 0) {
          let arr;
          if (!data.uuid) {
            arr = article.barcodes
              .filter(item => item.uuid)
              .filter(item => item.qpcStr === data.qpcStr)
              .filter(item => item.barcode === data.barcode);
          } else {
            arr = article.barcodes
              .filter(item => item.uuid !== data.uuid)
              .filter(item => item.qpcStr === data.qpcStr)
              .filter(item => item.barcode === data.barcode);
          }

          if (arr.length > 0) {
            resolve({
              success: false,
              message: '条码：' + data.barcode + '，规格：' + data.qpcStr + ' 已存在'
            });
            return;
          }
        }

        data['articleUuid'] = article.uuid;
        data['companyUuid'] = loginCompany().uuid;

        dispatch({
          type: 'article/saveOrModifyArticleBarcode',
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

  addNew = () => {
    let newData = {
      qpcStr: '',
      barcode: '',
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

    let that=this;
    return new Promise(function (resolve, reject) {
      that.checkEditOrRemove(record).then(result=>{
        if(!result.success){
          let message = result.checkResult === 'isDefault' ? record.barcode + '为默认的条码不允许删除' : '';
          resolve({
            success: false,
            message: message
          })
          return;
        }
        dispatch({
          type: 'article/removeArticleBarcode',
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
      })
    });
  }

  checkEditOrRemove=(record)=>{
    let { code } = this.props.article;
    return new Promise(function (resolve, reject) {
      if (code === record.barcode) {
        resolve({
          success: false,
          checkResult:'isDefault'
        })
        return;
      } else {
        resolve({
          success: true
        })
      }
    });
  }

  onFieldChange = (fieldName, e, target) => {
    if (fieldName === 'qpcStr') {
      target[fieldName] = e;
    } else {
      target[fieldName] = e.target.value;
    }
  }

  render() {
    const columns = [{
      title: articleLocale.barcode,
      dataIndex: 'barcode',
      width: itemColWidth.qpcStrEditColWidth,
      componentName: 'Input',
      render: loginOrg().type !== orgType.company.name ? (text, record) => {
        return text;
      } : ''
    }, {
      title: articleLocale.barcodeQpcStr,
      dataIndex: 'qpcStr',
      width: itemColWidth.qpcStrEditColWidth,
      componentName: 'QpcStrSelect',
      render: loginOrg().type !== orgType.company.name ? (text, record) => {
        return text;
      } : ''
    }];

    const editTableProps = {
      columns: columns,
      checkEditOrRemove:this.checkEditOrRemove,
      onSave: this.onSave,
      value: this.state.data,
      addNew: this.addNew,
      onRemove: this.onRemove,
      onFieldChange: this.onFieldChange,
      articleUuid: this.props.article.uuid,
      noAddAndDelete: loginOrg().type !== orgType.company.name || !havePermission(RESOURCE_IWMS_BASIC_ARTICLE_EDIT),
      editEnable: loginOrg().type === orgType.company.name && havePermission(RESOURCE_IWMS_BASIC_ARTICLE_EDIT),
    };
    return <EditTable {...editTableProps} />
  }
}
