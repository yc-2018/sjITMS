import { PureComponent } from "react";
import { Input, InputNumber, Popconfirm, Divider, message } from 'antd';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import EditTable from '@/pages/Component/Form/EditTable';
import { itemColWidth } from '@/utils/ColWidth';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { match1MN, matchMN } from '@/utils/utils';
import { commonLocale } from '@/utils/CommonLocale';
import { orgType } from '@/utils/OrgType';
import { MAX_CM_VALUE, MAX_G_VALUE } from '@/utils/constants';
import { articleLocale } from './ArticleLocale';
import Empty from "@/pages/Component/Form/Empty";
import { hpcMul } from "@/utils/HpcCalculate";

export default class ArticleQpcTab extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      data: this.handleData(this.props)
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: this.handleData(nextProps)
    });

    this.handleArticlePlate(nextProps);
    this.querySettleQpcStr(nextProps.article);
  }

  componentDidMount() {
    this.handleArticlePlate(this.props);
    this.querySettleQpcStr(this.props.article);
  }

  handleData = (props) => {
    const { data } = props;

    if (Array.isArray(data)) {
      data.map(item => {
        item['key'] = item.uuid;
      });
      return data;
    } else {
      return [];
    }
  }

  querySettleQpcStr = (article) => {
    if (loginOrg().type !== orgType.company.name) {
      return;
    }
    this.props.dispatch({
      type: 'articleBusiness/querySettleQpcStr',
      payload: {
        articleUuid: article && article.uuid ? article.uuid : '',
        companyUuid: loginOrg().uuid,
      },
      callback: response => {
        if (response && response.success) {
          this.setState({
            settleQpcStrs: response.data || []
          })
        }
      }
    });
  }

  handleArticlePlate = (props) => {
    const { dispatch, article } = props;
    const { data } = this.state;

    if (loginOrg().type === orgType.dc.name) {
      this.fetchArticlePlate().then(result => {
        if (result.success) {
          let articlePlate = result.data || [];
          if (articlePlate.length > 0) {
            for (let x = 0; x < data.length; x++) {
              for (let y = 0; y < articlePlate.length; y++) {
                if (articlePlate[y].article.uuid == article.uuid
                  && data[x].qpcStr == articlePlate[y].qpcStr) {
                  data[x]['articlePlateUuid'] = articlePlate[y].uuid;
                  data[x]['plateAdvice'] = articlePlate[y].plateAdvice;
                  data[x]['plate'] = articlePlate[y].plate;
                  break;
                }
              }
            }

            this.setState({ data: [...data] })
          }
        }
      })
        .catch(reason => console.error(reason));
    }
  }

  fetchArticlePlate = () => {
    const { dispatch, article } = this.props;

    return new Promise((resolve, reject) => {
      dispatch({
        type: 'articlePlate/getByArticleUuid',
        payload: {
          articleUuid: article && article.uuid ? article.uuid : '',
          dcUuid: loginOrg().uuid,
        },
        callback: response => {
          if (response && response.success) {
            let articlePlate = response.data || [];
            resolve({
              success: true,
              data: articlePlate
            })
            return;
          } else {
            resolve({
              success: false,
              data: []
            })
            return;
          }
        }
      });
    });
  }

  onSave = (data) => {
    const { dispatch, article } = this.props;

    return new Promise((resolve, reject) => {
      if (!match1MN(data.qpcStr)) {
        resolve({
          success: false,
          message: articleLocale.qpcQpcStrNotMatch
        })
        return;
      }

      if (!data.munit) {
        resolve({
          success: false,
          message: articleLocale.qpcMunitNotNull
        })
        return;
      }

      if(loginOrg().type === orgType.dc.name && !data.plateAdvice){
        resolve({
          success: false,
          message: "装盘建议不能为空"
        })
        return;
      }

      if (loginOrg().type === orgType.dc.name && (data.plateAdvice.length > 30 || !matchMN(data.plateAdvice))) {
        resolve({
          success: false,
          message: articleLocale.qpcPlateAdviceNotMatch
        })
        return;
      }

      // 校验重复
      if (Array.isArray(article.qpcs) && article.qpcs.length > 0) {
        let arr;
        if (!data.uuid) {
          arr = article.qpcs
            .filter(item => item.uuid)
            .filter(item => item.qpcStr === data.qpcStr);
        } else {
          arr = article.qpcs
            .filter(item => item.uuid !== data.uuid)
            .filter(item => item.qpcStr === data.qpcStr);
        }

        if (arr.length > 0) {
          resolve({
            success: false,
            message: '规格：' + data.qpcStr + ' 已存在'
          });
          return;
        }
      }

      data['articleUuid'] = article.uuid;
      data['companyUuid'] = loginCompany().uuid;

      if (loginOrg().type === orgType.company.name) {
        dispatch({
          type: 'article/saveOrModifyArticleQpc',
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
        })
      }

      if (loginOrg().type === orgType.dc.name) {
        let params = {
          articleCode: article.code,
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid,
          qpcStr: data.qpcStr,
          plateAdvice: data.plateAdvice,
        };

        let type = 'articlePlate/save';
        if (data.articlePlateUuid) {
          type = 'articlePlate/modify';
          params['uuid'] = data.articlePlateUuid;
        }

        dispatch({
          type: type,
          payload: params,
          callback: response => {
            if (response && response.success) {
              if (type === 'articlePlate/save') {
                let plateUuid = response.data;
                data['articlePlateUuid'] = plateUuid;
              }
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
        })
      }
    })
  }

  cancel = (e, key) => {
    this.clickedCancel = true;
    e.preventDefault();
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    for(let i = 0;i < newData.length;i++) {
      newData[i].plateAdvice = "";
    };
    this.setState({ data: newData });
    this.clickedCancel = false;
  }
  addNew = () => {
    let newData = {
      qpcStr: '',
      munit: '',
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      defaultQpcStr: false
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
      if (!record.uuid || record.uuid.indexOf('NEW_TEMP_ID') > -1) {
        resolve({
          success: true
        })
        return;
      }

      dispatch({
        type: 'article/removeArticleQpc',
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
    if (fieldName === 'qpcStr') {
      let value = e.target.value;
      target[fieldName] = value;
      if (match1MN(value)) {
        let arr = value.split('\*');
        let r = 1;
        arr.map(item => {
          r = hpcMul(r, item);
        })

        target.paq = parseFloat(r.toFixed(4));
      } else {
        target.paq = undefined;
      }
    } else if (fieldName === 'plateAdvice') {
      let value = e.target.value;
      target[fieldName] = value;
      if (matchMN(value)) {
        let arr = value.split('\*');
        let r = 1;
        arr.map(item => {
          r = hpcMul(r, item);
        })

        target.plate = parseFloat(r.toFixed(4)).toString();
      } else {
        target.plate = undefined;
      }
    } else if (fieldName === 'munit') {
      target[fieldName] = e.target.value;
    } else {
      target[fieldName] = e;
    }
  }

  handleSetDefaultQpcStr = (record) => {
    record.defaultQpcStr = true;
    this.onSave(record)
      .then(result => {
        if (result.success) {
          result.message && message.success(result.message);
          this.props.refresh();
        }
      })
      .catch(reason => console.error(reason));
  }

  render() {
    const columns = [{
      title: articleLocale.qpcQpcStr,
      dataIndex: 'qpcStr',
      width: itemColWidth.qpcStrEditColWidth - 50,
      componentName: 'Input',
      placeholder: '格式为1*m*n',
      render: loginOrg().type !== orgType.company.name ? (text, record) => {
        return text;
      } : ''
    }, {
      title: articleLocale.qpcMunit,
      dataIndex: 'munit',
      width: itemColWidth.numberEditColWidth - 50,
      componentName: 'Input',
      render: loginOrg().type !== orgType.company.name ? (text, record) => {
        return text;
      } : ''
    }, {
      title: articleLocale.qpcPaq,
      dataIndex: 'paq',
      width: itemColWidth.qpcStrEditColWidth - 50,
      render: (text, record) => {
        return text;
      }
    }, {
      title: articleLocale.qpcLength,
      dataIndex: 'length',
      width: itemColWidth.numberEditColWidth - 50,
      componentName: 'InputNumber',
      min: 0,
      max: MAX_CM_VALUE,
      render: loginOrg().type !== orgType.company.name ? (text, record) => {
        return text;
      } : ''
    }, {
      title: articleLocale.qpcWidth,
      dataIndex: 'width',
      width: itemColWidth.numberEditColWidth - 50,
      componentName: 'InputNumber',
      min: 0,
      max: MAX_CM_VALUE,
      render: loginOrg().type !== orgType.company.name ? (text, record) => {
        return text;
      } : ''
    }, {
      title: articleLocale.qpcHeight,
      dataIndex: 'height',
      width: itemColWidth.numberEditColWidth - 50,
      componentName: 'InputNumber',
      min: 0,
      max: MAX_CM_VALUE,
      render: loginOrg().type !== orgType.company.name ? (text, record) => {
        return text;
      } : ''
    }, {
      title: articleLocale.qpcWeight,
      dataIndex: 'weight',
      width: itemColWidth.numberEditColWidth - 50,
      componentName: 'InputNumber',
      min: 0,
      max: MAX_G_VALUE,
      render: loginOrg().type !== orgType.company.name ? (text, record) => {
        return text;
      } : ''
    }, {
      title: articleLocale.qpcDefaultQpcStr,
      dataIndex: 'defaultQpcStr',
      width: itemColWidth.qpcStrEditColWidth - 50,
      render: (text, record) => {
        if (text)
          return commonLocale.yesLocale;
        else {
          if (record.editable || loginOrg().type !== orgType.company.name) {
            return commonLocale.noLocale;
          }
          return (<a onClick={this.handleSetDefaultQpcStr.bind(this, record)}>{commonLocale.setDefaultLocale}</a>);
        }
      }
    }];

    if (loginOrg().type === orgType.dc.name) {
      columns.push({
        title: articleLocale.articlePlatePlateAdvice,
        dataIndex: 'plateAdvice',
        width: itemColWidth.numberEditColWidth - 40,
        componentName: 'Input'
      });
      columns.push({
        title: articleLocale.articlePlatePlate,
        dataIndex: 'plate',
        width: itemColWidth.numberEditColWidth - 50,
        render: (text, record) => {
          return text?text:<Empty/>;
        }
      });
    }
    const editTableProps = {
      columns: columns,
      onSave: this.onSave,
      value: this.state.data,
      addNew: this.addNew,
      onRemove: this.onRemove,
      onFieldChange: this.onFieldChange,
      noAddAndDelete: loginOrg().type !== orgType.company.name ? true : false,
      editEnable: loginOrg().type === orgType.company.name || loginOrg().type === orgType.dc.name
    };
    return <EditTable {...editTableProps} />
  }
}
