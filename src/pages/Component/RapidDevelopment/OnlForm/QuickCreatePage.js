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
  SimpleSelect,
  SimpleTreeSelect,
  SimpleRadio,
  SimpleAutoComplete,
} from '@/pages/Component/RapidDevelopment/CommonComponent';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { convertCodeName } from '@/utils/utils';
import { colWidth, itemColWidth } from '@/utils/ColWidth';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class QuickCreatePage extends CreatePage {
  entity = {};
  exComponentProperty = {};

  beforeSave = data => {};
  exHandleChange = (e, tableName, dbFieldName, line, formInfo, onlFormField) => {};

  //初始化表单数据
  initonlFormField = () => {
    const { onlFormField } = this.props;
    //初始化entity
    onlFormField.forEach(item => {
      this.entity[item.onlFormHead.tableName] = [];
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
      quickuuid: props.quickuuid,
    };
    this.initonlFormField();
  }

  dynamicqueryById() {
    if (this.props.showPageNow == 'update') {
      //const { tableName } = this.state;
      const { onlFormField } = this.props;
      onlFormField.forEach(item => {
        let tableName = item.onlFormHead.tableName;
        if (item.onlFormHead.tableType == '1' || item.onlFormHead.tableType == '0') {
          var field = item.onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
          const param = {
            tableName: tableName,
            condition: {
              params: [{ field: field, rule: 'eq', val: [this.props.params.entityUuid] }],
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
          var field = item.onlFormFields.find(x => x.mainField != null && x.mainField != '')
            ?.dbFieldName;
          const param = {
            tableName: item.onlFormHead.tableName,
            condition: {
              params: [{ field: field, rule: 'eq', val: [this.props.params.entityUuid] }],
            },
          };
          this.props.dispatch({
            type: 'quick/dynamicqueryById',
            payload: param,
            callback: response => {
              if (response.result.records != 'false') {
                this.entity[tableName] = response.result.records;
                for (let i = 0; i < this.entity[tableName].length; i++) {
                  //增加line
                  this.entity[tableName][i] = {
                    ...this.entity[tableName][i],
                    line: i + 1,
                  };
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
    this.props.switchTab('query');
  };

  onSave = data => {
    const result = this.beforeSave(this.entity);
    if (result === false) {
      return;
    }

    //入参
    const param = { code: this.props.onlFormField[0].onlFormHead.code, entity: this.entity };
    this.props.dispatch({
      type: 'quick/saveFormData',
      payload: {
        param,
      },
      callback: response => {
        if (response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.props.switchTab('query');
        }
      },
    });
  };

  // 校验一对多子表的数据
  verifyTable(datas) {
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

  /**
   * 处理值改变事件
   * @param {} e
   * @param {*} tableName
   * @param {*} dbFieldName
   * @param {*} line
   * @param {*} formInfo
   * @param {*} onlFormField
   */
  handleChange = (e, tableName, dbFieldName, line, formInfo, onlFormField) => {
    if (!this.entity[tableName][line]) {
      this.entity[tableName][line] = {};
    }

    const value = this.convertSaveValue(e, onlFormField.fieldShowType);
    this.entity[tableName][line][dbFieldName] = value;

    // 执行扩展代码
    this.exHandleChange(e, tableName, dbFieldName, line, formInfo, onlFormField);
  };

  setFieldsValue = (tableName, dbFieldName, value, line) => {
    const fieldName = tableName + '_' + dbFieldName + (line == undefined ? '' : '_' + line);
    this.props.form.setFieldsValue({ [fieldName]: value });
    this.entity[tableName][line == undefined ? 0 : line][dbFieldName] = value;
    // handleChange();   // 手动触发值改变事件
  };

  setComponentproperty = (tableName, dbFieldName, props, line) => {
    const fieldName = tableName + '_' + dbFieldName;
    if (line == undefined) {
      this.exComponentProperty[fieldName] = props;
    } else {
      if (!this.exComponentProperty[fieldName]) {
        this.exComponentProperty[fieldName] = [];
      }
      this.exComponentProperty[fieldName][line] = props;
    }
  };

  /**
   * 转换初始值
   * @param {*} value 值
   * @param {string} fieldShowType 类型
   * @returns
   */
  convertInitialValue = (value, fieldShowType) => {
    if (!value) {
      return value;
    }
    if (fieldShowType == 'date') {
      return moment(value, 'YYYY/MM/DD');
    } else {
      return value;
    }
  };

  /**
   * 转换保存数据
   * @param {*} e 值改变事件的参数
   * @param {string} fieldShowType 类型
   */
  convertSaveValue = (e, fieldShowType) => {
    if (fieldShowType == 'date') {
      return e.format('YYYY-MM-DD');
    } else if (fieldShowType == 'text' || fieldShowType == 'textarea' || fieldShowType == 'radio') {
      return e.target.value;
    } else if (fieldShowType == 'auto_complete') {
      return e.value;
    } else {
      return e;
    }
  };

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
    console.log('onlFormField', onlFormField);
    //根据查询出来的配置渲染表单新增页面
    onlFormField.forEach(item => {
      let { tableName, tableType, relationType } = item.onlFormHead;
      let cols = [];
      // 附表一对多情况不进行该方式渲染
      if (tableType == 2 && relationType == 0) {
        return;
      }

      item.onlFormFields.forEach(field => {
        if (field.isShowForm) {
          let formItem;
          let rules = [{ required: !field.dbIsNull, message: `${field.dbFieldTxt}字段不能为空` }];
          if (field.fieldValidType) {
            const fieldValidJson = JSON.parse(field.fieldValidType);
            if (fieldValidJson.pattern !== null && fieldValidJson.message !== null) {
              rules.push({
                pattern: new RegExp(fieldValidJson.pattern),
                message: fieldValidJson.message,
              });
            }
          }
          if (['text', 'textarea'].indexOf(field.fieldShowType) > -1) {
            rules.push({
              max: field.dbLength,
              message: `${field.dbFieldTxt}字段长度不能超过${field.dbLength}`,
            });
          }

          const fieldExtendJson = field.fieldExtendJson ? JSON.parse(field.fieldExtendJson) : {}; // 扩展属性
          const commonPropertis = {
            disabled: field.isReadOnly,
            style: { width: '100%' },
            onChange: e => this.handleChange(e, tableName, field.dbFieldName, 0, item, field),
          }; // 通用属性
          const exComponentPropertis = this.exComponentProperty[
            tableName + '_' + field.dbFieldName
          ]; // 代码扩展属性

          // let initialValue =
          //   this.entity[tableName][0] && this.entity[tableName][0][field.dbFieldName]; // 初始值
          let initialValue = field.dbDefaultVal;
          cols.push(
            <CFormItem key={tableName + '_' + field.dbFieldName} label={field.dbFieldTxt}>
              {getFieldDecorator(tableName + '_' + field.dbFieldName, {
                initialValue: this.convertInitialValue(initialValue, field.fieldShowType),
                rules: rules,
              })(this.getWidget(field, commonPropertis, fieldExtendJson, exComponentPropertis))}
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
    const { getFieldDecorator } = this.props.form;
    // 找到一对多的数据
    const formInfo = this.props.onlFormField.find(
      formInfo => formInfo.onlFormHead.tableType == 2 && formInfo.onlFormHead.relationType == 0
    );
    if (!formInfo) {
      return;
    }

    const { onlFormHead, onlFormFields } = formInfo;
    let columns = [];
    let tableTxt = onlFormHead.tableTxt;
    let tableName = onlFormHead.tableName;
    onlFormFields.forEach((field, index) => {
      console.log('field', field);
      if (field.isShowForm) {
        const fieldExtendJson = field.fieldExtendJson ? JSON.parse(field.fieldExtendJson) : {}; // 扩展属性
        const exComponentPropertis = this.exComponentProperty[tableName + '_' + field.dbFieldName]; // 代码扩展属性
        let tailItem = {
          title: field.dbFieldTxt,
          dataIndex: field.dbFieldName,
          key: tableName + field.dbFieldName + index,
          width: itemColWidth.articleEditColWidth,
          render: (text, record) => {
            const exComponentPropertis = this.exComponentProperty[
              tableName + '_' + field.dbFieldName
            ]; // 代码扩展属性

            return (
              <CFormItem
                key={`${tableName}_${field.dbFieldName}_${record.line - 1}`}
                label={field.dbFieldTxt}
              >
                {getFieldDecorator(`${tableName}_${field.dbFieldName}_${record.line - 1}`, {
                  initialValue: this.convertInitialValue(field.dbDefaultVal, field.dbType),
                })(
                  this.getWidget(
                    field,
                    {
                      disabled: field.isReadOnly,
                      style: { width: '100%' },
                      onChange: e =>
                        this.handleChange(
                          e,
                          tableName,
                          field.dbFieldName,
                          record.line - 1,
                          formInfo,
                          field
                        ),
                    },
                    fieldExtendJson,
                    exComponentPropertis
                      ? exComponentPropertis[record.line - 1]
                      : exComponentPropertis
                  )
                )}
              </CFormItem>
            );
          },
        };
        columns.push(tailItem);
      }
    });

    return (
      <div>
        <ItemEditTable
          title={tableTxt}
          columns={columns}
          data={this.entity[tableName]}
          handleFieldChange={this.handleFieldChange}
          drawTotalInfo={this.drawTotalInfo}
          drawBatchButton={this.drawBatchButton}
          handleRemove={data => this.handleTableRemove(tableName, data)}
          notNote
        />
      </div>
    );
  };

  handleTableRemove = (tableName, data) => {
    // for (const key in this.exComponentProperty) {
    //   if (!key.startsWith(tableName)) {
    //     break;
    //   }
    //   for (const item of data) {
    //     this.exComponentProperty[key].splice(data.line - 1, 1);
    //   }
    // }
  };

  getWidget = (field, commonPropertis, fieldExtendJson, exComponentPropertis) => {
    if (field.fieldShowType == 'date') {
      return <DatePicker {...commonPropertis} {...fieldExtendJson} {...exComponentPropertis} />;
    } else if (field.fieldShowType == 'number') {
      return <InputNumber {...commonPropertis} {...fieldExtendJson} {...exComponentPropertis} />;
    } else if (field.fieldShowType == 'sel_tree') {
      return (
        <SimpleTreeSelect {...commonPropertis} {...fieldExtendJson} {...exComponentPropertis} />
      );
    } else if (field.fieldShowType == 'radio') {
      return <SimpleRadio {...commonPropertis} {...fieldExtendJson} {...exComponentPropertis} />;
    } else if (field.fieldShowType == 'auto_complete') {
      return (
        <SimpleAutoComplete {...commonPropertis} {...fieldExtendJson} {...exComponentPropertis} />
      );
    } else if (field.fieldShowType == 'textarea') {
      return <Input.TextArea {...commonPropertis} {...fieldExtendJson} {...exComponentPropertis} />;
    } else if (field.fieldShowType == 'list') {
      return (
        <SimpleSelect
          allowClear
          placeholder={'请选择' + field.dbFieldTxt}
          {...commonPropertis}
          {...fieldExtendJson}
        />
      );
    } else {
      return <Input {...commonPropertis} {...fieldExtendJson} {...exComponentPropertis} />;
    }
  };

  handleFieldChange(e, fieldName, line) {}
}
