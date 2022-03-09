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
  SimpleAddress,
} from '@/pages/Component/RapidDevelopment/CommonComponent';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { convertCodeName } from '@/utils/utils';
import { colWidth, itemColWidth } from '@/utils/ColWidth';

/**
 * 新增编辑界面
 * 新建页面基类，子类加标注@Form.create()
 * 子类可实现的方法：
 * beforeSave
 * exHandleChange
 * drawcell
 * 子类可调用的方法：
 * entity
 * setFieldsValue
 */
export default class QuickCreatePage extends CreatePage {
  entity = {};

  beforeSave = (data) => { }
  exHandleChange = (e, tableName, dbFieldName, line, formInfo, onlFormField) => { }
  drawcell = (e) => { }

  /**
   * 设置字段的值
   * @param {*} tableName 表名
   * @param {*} dbFieldName 字段
   * @param {*} value 值
   * @param {*} line 行
   */
  setFieldsValue = (tableName, dbFieldName, value, line) => {
    const fieldName = tableName + '_' + dbFieldName + (line == undefined ? '' : '_' + line);
    this.entity[tableName][line == undefined ? 0 : line][dbFieldName] = value;
    this.props.form.setFieldsValue({ [fieldName]: value });
  };

  constructor(props) {
    super(props);
    this.state = {
      title: '',
      entityUuid: '',
      entity: {
        uuid: '',
      },
      quickuuid: props.quickuuid,
      onlFormInfos: props.onlFormField
    };
    this.initOnlFormField();
  }

  //初始化表单数据
  initOnlFormField = () => {
    const { onlFormInfos } = this.state;
    //初始化entity
    onlFormInfos.forEach(item => {
      this.entity[item.onlFormHead.tableName] = [];
    });
  };

  dynamicqueryById() {
    const { onlFormField } = this.props;
    if (this.props.showPageNow == 'update') {
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
                let title =item.onlFormHead.formTitle; 
                if(item.onlFormHead.formTitle && item.onlFormHead.formTitle.indexOf("]")!=-1){   
                  const titles =  item.onlFormHead.formTitle.split("]");
                  var entityCode = response.result.records[0][titles[0].replace("[","")];
                  var entityTitle = titles[1].indexOf("}")==-1?titles[1] : response.result.records[0][titles[1].replace("}","").replace("{","")];
                  title = '['+entityCode+']'+entityTitle;
                }
                this.setState({title:title});
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
    } else {
      this.setState({ title: '新建' + onlFormField[0].onlFormHead.tableTxt });
      //默认初始值
      onlFormField.forEach(item => {
        let tableName = item.onlFormHead.tableName;
        if (item.onlFormHead.tableType == '1' || item.onlFormHead.tableType == '0') {
          const result = item.onlFormFields.filter(x => x.dbDefaultVal !== undefined);
          this.entity[tableName][0] = {};
          result.forEach(data => {
            this.entity[tableName][0][data.dbFieldName] = data.dbDefaultVal;
          });
          this.setState({});
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
    const { entity } = this;
    const { onlFormInfos } = this.state;
    const result = this.beforeSave(entity);
    if (result === false) {
      return;
    }

    //插入组织uuid和企业uuid
    let loginOrgType = loginOrg().type.replace('_', '');
    let loginInfo = ['COMPANYUUID', loginOrgType, loginOrgType + 'UUID'];
    let loginObj = {
      COMPANYUUID: loginCompany().uuid,
      [loginOrgType]: loginOrg().uuid,
      [loginOrgType + 'UUID']: loginOrg().uuid,
    };

    for (let onlFormInfo of onlFormInfos) {
      const { tableName } = onlFormInfo.onlFormHead;
      for (let field of onlFormInfo.onlFormFields) {
        if (loginInfo.indexOf(field.dbFieldName.toUpperCase()) != -1) {
          entity[tableName].forEach(data => {
            data[field.dbFieldName] = loginObj[field.dbFieldName.toUpperCase()];
          });
        }
      }
    }

    //入参
    const param = { code: this.state.onlFormInfos[0].onlFormHead.code, entity: entity };
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

    // 处理多值保存
    const fieldExtendJson = onlFormField.fieldExtendJson ? JSON.parse(onlFormField.fieldExtendJson) : {};
    if (fieldExtendJson.multiSave) {
      const multiSaves = fieldExtendJson.multiSave.split(",");
      for (const multiSave of multiSaves) {
        const [key, value] = multiSave.split(":");
        if (onlFormField.fieldShowType == "auto_complete") {
          this.entity[tableName][line][key] = getFieldShow(e.record, value);
        }
      }
    }

    // 执行扩展代码
    this.exHandleChange(e, tableName, dbFieldName, line, formInfo, onlFormField);
    this.setState({})
  }

  /**
   * 渲染表单组件
   */
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { onlFormInfos } = this.state;
    let formPanel = [];
    if (!onlFormInfos) {
      return null;
    }
    // 根据查询出来的配置渲染表单新增页面
    for (const onlFormInfo of onlFormInfos) {
      const { onlFormHead, onlFormFields } = onlFormInfo;
      let { tableName, tableType, relationType } = onlFormHead;
      // 附表一对多情况不进行该方式渲染
      if (tableType == 2 && relationType == 0) {
        continue;
      }

      // 分组
      const categorySorts = onlFormFields
        .map(current => current.categorySort)
        .filter((element, index, self) => self.indexOf(element) === index)
        .sort();
        
      for (const categorySort of categorySorts) {
        let categoryName;
        let cols = [];

        for (const field of onlFormFields) {
          if (!field.isShowForm || categorySort != field.categorySort) {
            continue;
          }
          categoryName = field.category;

          const rules = this.getFormRules(field);
          const isReadOnly = this.isReadOnly(field.isReadOnly);
          const fieldExtendJson = field.fieldExtendJson ? JSON.parse(field.fieldExtendJson) : {}; // 扩展属性
          const commonPropertis = {
            disabled: isReadOnly,
            style: { width: '100%' },
            onChange: e => this.handleChange(e, tableName, field.dbFieldName, 0, onlFormInfo, field)
          }; // 通用属性

          let e = {
            onlFormInfo,
            onlFormField: field,
            rules: rules,
            component: this.getComponent(field),
            props: { ...commonPropertis, ...fieldExtendJson }
          };

          this.drawcell(e);

          let initialValue = this.entity[tableName][0] && this.entity[tableName][0][field.dbFieldName]; // 初始值
          cols.push(
            <CFormItem key={tableName + "_" + field.dbFieldName} label={field.dbFieldTxt}>
              {getFieldDecorator(tableName + "_" + field.dbFieldName, {
                initialValue: this.convertInitialValue(initialValue, field.fieldShowType),
                rules: rules,
              })(<e.component {...e.props}></e.component>)}
            </CFormItem>
          );
        }
        
        formPanel.push(
          <FormPanel key={onlFormHead.id + categoryName} title={categoryName} cols={cols} />
        );
      }
      return formPanel;
    };
  }

  /**
   * 绘制一对多表格
   */
  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    // 找到一对多的数据
    const formInfo = this.state.onlFormInfos.find(
      formInfo => formInfo.onlFormHead.tableType == 2 && formInfo.onlFormHead.relationType == 0
    );
    if (!formInfo) {
      return;
    }

    const { onlFormHead, onlFormFields } = formInfo;
    let columns = [];
    let tableTxt = onlFormHead.tableTxt;
    let tableName = onlFormHead.tableName;
    for (const field of onlFormFields) {
      if (!field.isShowForm) {
        continue;
      }

      const rules = this.getFormRules(field);
      const isReadOnly = this.isReadOnly(field.isReadOnly);
      const fieldExtendJson = field.fieldExtendJson ? JSON.parse(field.fieldExtendJson) : {}; // 扩展属性
      let tailItem = {
        title: field.dbFieldTxt,
        dataIndex: tableName + field.dbFieldName,
        key: tableName + field.dbFieldName,
        width: itemColWidth.articleEditColWidth,
        render: (text, record) => {
          const commonPropertis = {
            disabled: isReadOnly,
            style: { width: '100%' },
            onChange: e =>
              this.handleChange(
                e,
                tableName,
                field.dbFieldName,
                record.line - 1,
                formInfo,
                field
              )
          };

          let e = {
            onlFormInfo: formInfo,
            onlFormField: field,
            record: record,
            rules: rules,
            component: this.getComponent(field),
            props: { ...commonPropertis, ...fieldExtendJson }
          };

          this.drawcell(e);

          let initialValue = this.entity[tableName][record.line - 1][field.dbFieldName]; // 初始值
          return <Form.Item>
            {
              getFieldDecorator(tableName + "_" + field.dbFieldName + "_" + (record.line - 1), {
                initialValue: this.convertInitialValue(initialValue, field.fieldShowType),
                rules: rules
              })(<e.component {...e.props}></e.component>)
            }
          </Form.Item>;
        },
      };
      columns.push(tailItem);
    }
    
    return (
      <div>
        <ItemEditTable
          title={tableTxt}
          columns={columns}
          data={this.entity[tableName]}
          handleRemove={(data) => this.handleTableRemove(tableName, data)}
          notNote
        />
      </div>
    );
  };

  /**
   * 处理表格删除事件，修复删除form表单没有更新的bug
   */
  handleTableRemove = (tableName, data) => {
    let fields = {};
    for (const row of data) {
      for (const key in row) {
        if (key == "line") {
          continue;
        }
        fields[tableName + "_" + key + "_" + (row.line - 1)] = row[key];
      }
    }
    this.props.form.setFieldsValue(fields);
  }

  /**
   * 判断是否只读
   * @param {*} readOnlyType field的isReadOnly字段
   * @returns 
   */
  isReadOnly = (readOnlyType) => {
    const update = this.props.showPageNow == 'update';
    // readOnlyType （0：编辑时只读, 1:字段只读, 2:新增时只读, 3:不只读）
    return readOnlyType == 1 || (readOnlyType == 0 && update) || (readOnlyType == 2 && !update);
  }

  /**
   * 生成校验规则
   * @param {*} field onlFormField
   */
  getFormRules = (field) => {
    let rules = [{ required: !field.dbIsNull, message: `${field.dbFieldTxt}字段不能为空` }];
    if (field.fieldValidType) {
      const fieldValidJson = JSON.parse(field.fieldValidType)
      if (fieldValidJson.pattern !== null && fieldValidJson.message !== null) {
        rules.push({
          pattern: new RegExp(fieldValidJson.pattern),
          message: fieldValidJson.message
        })
      }
    }

    if (["text", "textarea"].indexOf(field.fieldShowType) > -1) {
      rules.push({
        max: field.dbLength,
        message: `${field.dbFieldTxt}字段长度不能超过${field.dbLength}`,
      });
    }
    return rules;
  }
  
  /**
   * 根据控件类型获取控件
   */
  getComponent = (field) => {
    if (field.fieldShowType == 'date') {
      return DatePicker;
    } else if (field.fieldShowType == 'number') {
      return InputNumber;
    } else if (field.fieldShowType == 'sel_tree') {
      return SimpleTreeSelect;
    } else if (field.fieldShowType == 'radio') {
      return SimpleRadio;
    } else if (field.fieldShowType == 'auto_complete') {
      return SimpleAutoComplete;
    } else if (field.fieldShowType == 'textarea') {
      return Input.TextArea;
    } else {
      return Input;
    }
  };

  /**
   * 转换初始值
   * @param {*} value 值
   * @param {string} fieldShowType 类型
   * @returns
   */
   convertInitialValue = (value, fieldShowType) => {
    if (value == undefined || value == null) {
      return value;
    }
    if (fieldShowType == 'date') {
      return moment(value, 'YYYY/MM/DD');
    } else if (["text", "textarea"].indexOf(fieldShowType) > -1 || !fieldShowType) {
      return value.toString();
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
    } else if (fieldShowType == 'text' || fieldShowType == 'textarea' || fieldShowType == 'radio' || !fieldShowType) {
      return e.target.value;
    } else if (fieldShowType == 'auto_complete') {
      return e.value;
    } else {
      return e;
    }
  };
}

/**
 * 获取定义字段的显示，允许通过 %字段名% 的方式插入值
 * @param {Map} rowData 原始数据
 * @param {String} str 用户定义的字段文本
 */
 function getFieldShow(rowData, str) {
  var reg = /%\w+%/g;
  var matchFields = str.match(reg);
  if (matchFields) {
    for (const replaceText of matchFields) {
      var field = replaceText.replaceAll('%', '');
      str = str.replaceAll(replaceText, rowData[field]);
    }
    return str;
  } else {
    return rowData[str];
  }
}