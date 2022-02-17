import { connect } from 'dva';
import { Form, Select, Input, InputNumber, message, Col, DatePicker, Modal } from 'antd';
import moment from 'moment';
import {
  commonLocale,
  notNullLocale,
  placeholderLocale,
  placeholderChooseLocale,
  confirmLineFieldNotNullLocale,
} from '@/utils/CommonLocale';
import { loginCompany, loginOrg, loginUser, getDefOwner, getActiveKey } from '@/utils/LoginContext';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import {
  SimpleTreeSelect,
  SimpleRadio,
  SimpleAutoComplete,
} from '@/pages/Component/RapidDevelopment/CommonComponent';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { convertCodeName } from '@/utils/utils';
import { colWidth, itemColWidth } from '@/utils/ColWidth';

export default class QuickCreatePage extends CreatePage {
  entity = {};

  //初始化表单数据
  initonlFormField = () => {
    const { onlFormField } = this.props;
    onlFormField.forEach(item => {
      //初始化表名称
      this.entity[item.onlFormHead.tableName] = [];
      //一对一初始化entity
      console.log(item);
      if (
        item.onlFormHead.relationType != '0' ||
        item.onlFormHead.tableType == '1' ||
        item.onlFormHead.tableType == '0'
      ) {
        this.entity[item.onlFormHead.tableName][0] = {};
      }
    });
  };

  constructor(props) {
    super(props);
    this.state = {
      title: '测试标题',
      entityUuid: '',
      entity: {
        uuid: '',
      },
      //onlFormField: props.onlFormField,
      quickuuid: props.quickuuid,
      //tableName: props.tableName,
    };
    this.initonlFormField();
    //this.entity[this.props.tableName] = {};
  }

  dynamicqueryById() {
    if (this.props.quick.showPageMap.get(this.props.quickuuid).endsWith('update')) {
      //const { tableName } = this.state;
      const { onlFormField } = this.props;
      console.log('onlFormField', onlFormField);
      onlFormField.forEach(item => {
        let tableName = item.onlFormHead.tableName;
        if (item.onlFormHead.tableType == '1' || item.onlFormHead.tableType == '0') {
          var field = item.onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
          const param = {
            tableName: tableName,
            condition: {
              params: [{ field: field, rule: 'eq', val: [this.props.quick.entityUuid] }],
            },
          };
          this.props.dispatch({
            type: 'quick/dynamicqueryById',
            payload: param,
            callback: response => {
              if (response.result.records != 'false') {
                this.entity[tableName] = response.result.records;
                this.setState({});
              }
            },
          });
        } else {
          var field = item.onlFormFields.find(x => x.mainField != null && x.mainField != '')?.dbFieldName;
          const param = {
            tableName: item.onlFormHead.tableName,
            condition: {
              params: [{ field: field, rule: 'eq', val: [this.props.quick.entityUuid] }],
            },
          };
          this.props.dispatch({
            type: 'quick/dynamicqueryById',
            payload: param,
            callback: response => {
              if (response.result.records != 'false') {
                this.entity[tableName] = response.result.records;
                console.log(this.entity[tableName]);
                for (let i = 0; i < this.entity[tableName].length; i++) {
                  //增加line
                  this.entity[tableName][i] = { ...this.entity[tableName][i], line: i + 1 };
                }
                this.setState({});
              }
            },
          });
        }
      });
    }
  }

  componentDidMount() {
    this.dynamicqueryById();
  }

  onCancel = () => {
    this.props.form.resetFields();
    this.props.dispatch({
      type: 'quick/showPageMap',
      payload: {
        showPageK: this.state.quickuuid,
        showPageV: this.state.quickuuid + 'query',
      },
    });
  };

  onSave = data => {
    // 这里可以收集到表单的数据
    // 自定义提交数据接口
    // 默认实现的数据保存接口
    console.log('entity', this.entity);

    // this.convertData(this.entity);
    // // TODO 日期格式oracle保存有问题
    // // 格式转换处理
    // convertSaveData(data);

    console.log("this.props.onlFormHead.code", this.props);
    //入参
    const param = {
      code: this.props.onlFormField[0].onlFormHead.code,
      entity: this.entity
    };
    this.props.dispatch({
      type: 'quick/saveFormData',
      payload: {
        showPageK: this.state.quickuuid,
        showPageV: this.state.quickuuid + 'query',
        param,
      },
      callback: response => {
        if (response.success) message.success(commonLocale.saveSuccessLocale);
      },
    });
  };
  convertData(datas) {
    const { onlFormField } = this.props;
    const map = new Map(Object.entries(datas));
    let newOnlFormHead;
    for (let i = 0; i < onlFormField.length; i++) {
      if (i == 0) {
        continue;
      }
      if (onlFormField[i].onlFormHead.relationType == '0') {
        newOnlFormHead = onlFormField[i];
      }
      onlFormField[i].onlFormFields.forEach(filed => {});
    }
    for (let key in datas) {
      if (key == newOnlFormHead.onlFormHead.tableName) {
        datas[key].forEach(data => {
          for (let s in data) {
            newOnlFormHead.onlFormFields.forEach((item, index) => {
              if (s == item.dbFieldName) {
                if (!item.dbIsNull && !data[s]) {
                  message.error(confirmLineFieldNotNullLocale(data.line, item.dbFieldTxt));
                  return false;
                }
                if (data[s].length > item.dbLength) {
                  message.error(
                    '第' + data.line + '的' + item.dbFieldTxt + '长度不能大于' + item.dbLength
                  );
                  return false;
                }
              }
            });
          }
        });
      }
    }
  }

  handleChange = () => {  }

  /**
   * 渲染表单组件
   */
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { onlFormField } = this.props;
    let formPanel = [];

    if (!onlFormField) {
      return null;
    }
    console.log("entity", this.entity);
    //const tableName = this.state.tableName;
    //根据查询出来的配置渲染表单新增页面
    onlFormField.forEach((item, index) => {
      console.log("index", index);
      let { tableName, tableType } = item.onlFormHead;
      let cols = [];
      if ((index == 1 || index == 2) && item.onlFormHead.relationType == '0') {
        return;
      }

      item.onlFormFields.forEach(field => {
        if(field.isShowForm){
        let formItem;
        let rules = [{ required: !field.dbIsNull, message: `${field.dbFieldTxt}字段不能为空` }];
        if(field.fieldValidType){
          const fieldValidJson = JSON.parse(field.fieldValidType)
          if(fieldValidJson.pattern !== null && fieldValidJson.message !== null){
            rules.push({
              pattern:new RegExp(fieldValidJson.pattern),
              message:fieldValidJson.message
            })
          }
        }
        const fieldExtendJson = field.fieldExtendJson ? JSON.parse(field.fieldExtendJson) : {}; // 扩展属性
        console.log("isReadOnly", field.isReadOnly);
        const commonPropertis = {
          disabled: field.isReadOnly,
          style: { width: '100%' },
          onChange: value =>
            this.handleChange(value, tableName, field.dbFieldName, field.fieldShowType, 0,fieldExtendJson,item.onlFormFields),
        }; // 通用属性
        if (field.fieldShowType == 'date') {
          formItem = <DatePicker {...commonPropertis} {...fieldExtendJson} />;
        } else if (field.fieldShowType == 'number') {
          formItem = <InputNumber {...commonPropertis} {...fieldExtendJson} />;
        } else if (field.fieldShowType == 'sel_tree') {
          formItem = <SimpleTreeSelect {...commonPropertis} {...fieldExtendJson} />;
        } else if (field.fieldShowType == 'radio') {
          formItem = <SimpleRadio {...commonPropertis} {...fieldExtendJson} />;
        } else if (field.fieldShowType == 'auto_complete') {
          formItem = <SimpleAutoComplete {...commonPropertis} {...fieldExtendJson} />;
        } else if (field.fieldShowType == 'textarea') {
          rules.push({
            max: field.dbLength,
            message: `${field.dbFieldTxt}字段长度不能超过${field.dbLength}`,
          });
          formItem = <Input.TextArea {...commonPropertis} {...fieldExtendJson} />;
        } else {
          rules.push({
            max: field.dbLength,
            message: `${field.dbFieldTxt}字段长度不能超过${field.dbLength}`,
          });
          formItem = <Input {...commonPropertis} {...fieldExtendJson} />;
        }
        let initialValue;
        if (JSON.stringify(this.entity[tableName]) != '[]') {
          initialValue = this.entity[tableName][0][field.dbFieldName];
        }
        cols.push(
          <CFormItem key={tableName + field.dbFieldName} label={field.dbFieldTxt}>
            {getFieldDecorator(tableName + field.dbFieldName, {
              initialValue: convertInitialValue(initialValue, field.fieldShowType),
              rules: rules,
            })(formItem)}
          </CFormItem>
        );
        }
      });

      formPanel.push(
        <FormPanel key={item.onlFormHead.id} title={item.onlFormHead.tableTxt} cols={cols} />
      );
    });

    return formPanel;
  };

  drawTable = () => {
    const { onlFormField } = this.props;
    let onlFormFieldss;
    //如果不是一对多；直接return;
    if (
      !onlFormField ||
      onlFormField[0].onlFormHead.relationType != '1' ||
      onlFormField.length < 2
    ) {
      return null;
    }
    onlFormField.forEach((onl, index) => {
      if (index!=0 && onl.onlFormHead.relationType=='0') {
        onlFormFieldss = onl;
      }
    });
    if(!onlFormFieldss){
      return ;
     }
    let columns = [];
    let tableTxt = onlFormFieldss.onlFormHead.tableTxt;
    let tableName = onlFormFieldss.onlFormHead.tableName;
    onlFormFieldss.onlFormFields.forEach((field, index) => {
      if (field.isShowForm) {
        const fieldExtendJson = field.fieldExtendJson ? JSON.parse(field.fieldExtendJson) : {}; // 扩展属性
        let tailItem = {
          title: field.dbFieldTxt,
          dataIndex: field.dbFieldName,
          key: tableName + field.dbFieldName + index,
          width: itemColWidth.articleEditColWidth,
          render: (text, record) => {
            return (
              <CFormItem key={tableName + field.dbFieldName + record.line} label={field.dbFieldTxt}>
                {getFieldDecorator(tableName + field.dbFieldName + record.line, {
                  initialValue: convertInitialValue(text, field.fieldShowType),
                })(
                  this.getWidget(
                    field,
                    {
                      disabled: field.isReadOnly,
                      style: { width: '100%' },
                      onChange: value =>
                        this.handleChange(
                          value,
                          tableName,
                          field.dbFieldName,
                          field.fieldShowType,
                          record.line,
                          fieldExtendJson,
                          onlFormFieldss.onlFormFields
                        ),
                    },
                    fieldExtendJson
                  )
                )}
              </CFormItem>
            );
          },
        };
        columns.push(tailItem);
      }
    });
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <div>
        <ItemEditTable
          title={tableTxt}
          columns={columns}
          data={this.entity[tableName]}
          handleFieldChange={this.handleFieldChange}
          drawTotalInfo={this.drawTotalInfo}
          drawBatchButton={this.drawBatchButton}
          notNote
        />
      </div>
    );
  };
  getWidget = (field, commonPropertis, fieldExtendJson) => {
    if (field.fieldShowType == 'date') {
      return <DatePicker {...commonPropertis} {...fieldExtendJson} />;
    } else if (field.fieldShowType == 'number') {
      return <InputNumber {...commonPropertis} {...fieldExtendJson} />;
    } else if (field.fieldShowType == 'sel_tree') {
      return <SimpleTreeSelect {...commonPropertis} {...fieldExtendJson} />;
    } else if (field.fieldShowType == 'radio') {
      return <SimpleRadio {...commonPropertis} {...fieldExtendJson} />;
    } else if (field.fieldShowType == 'auto_complete') {
      return <SimpleAutoComplete {...commonPropertis} {...fieldExtendJson} />;
    } else if (field.fieldShowType == 'textarea') {
      return <Input.TextArea {...commonPropertis} {...fieldExtendJson} />;
    } else {
      return <Input {...commonPropertis} {...fieldExtendJson} />;
    }
  };
  drawTotalInfo = () => {
    let allQtyStr = '0';
    let allQty = 0;
    let allAmount = 0;
    this.state.entity.items &&
      this.state.entity.items.map(item => {
        if (item.qty) {
          allQty = allQty + parseFloat(item.qty);
        }
        if (item.qtyStr) {
          allQtyStr = add(allQtyStr, item.qtyStr);
        }
        if (item.price) {
          allAmount = allAmount + item.price * item.qty;
        }
      });
    return (
      <span style={{ marginLeft: '10px' }}>
        {commonLocale.inAllQtyStrLocale}：{allQtyStr} |{commonLocale.inAllQtyLocale}：{allQty} |
        {commonLocale.inAllAmountLocale}：{allAmount ? allAmount : 0}
      </span>
    );
  };
  /**
   * 绘制按钮
   */
  drawBatchButton = selectedRowKeys => {};

  handleFieldChange(e, fieldName, line) {}
}

/**
 * 转换保存数据
 * @param {*} saveData
 */
function convertSaveData(saveData) {
  for (let key in saveData) {
    if (saveData[key]?._isAMomentObject) {
      saveData[key] = data[key].format('YYYY-MM-DD');
    }
  }
}

/**
 * 转换初始值
 * @param {*} value 值
 * @param {string} type 类型
 * @returns
 */
function convertInitialValue(value, type) {
  if (!value) {
    return value;
  }
  if (type == 'date') {
    return moment(value, 'YYYY/MM/DD');
  } else {
    return value;
  }
}
