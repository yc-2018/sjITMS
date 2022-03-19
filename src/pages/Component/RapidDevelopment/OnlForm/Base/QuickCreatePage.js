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
  tableKey = 0;

  formLoaded = () => {};
  beforeSave = data => {};
  exHandleChange = e => {};
  drawcell = e => {};

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

  /**
   * 设置运行时产生的props
   * @param {*} tableName 表名
   * @param {*} fieldName 字段
   * @param {*} props 属性
   * @param {*} key 一对多表格的key
   */
  setRunTimeProps = (tableName, fieldName, props, key) => {
    const { runTimeProps } = this.state;
    const field = tableName + '_' + fieldName + (key != undefined ? '_' + key : '');
    runTimeProps[field] = { ...runTimeProps[field], ...props };
    this.setState({ runTimeProps });
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
      onlFormInfos: props.onlFormField,
      formItems: {},
      tableItems: {},
      categories: [],
      runTimeProps: {},
    };
  }

  componentDidMount() {
    if (!this.props.onlFormField) {
      this.getCreateConfig();
    } else {
      this.initEntity();
      this.initForm();
    }
  }

  componentDidUpdate() {
    if (this.state.onlFormInfos && !this.runFormLoaded) {
      this.runFormLoaded = true;
      this.formLoaded();
    }
  }

  onCancel = () => {
    this.props.switchTab('query');
  };

  /**
   * 获取配置信息
   */
  getCreateConfig = () => {
    this.props.dispatch({
      type: 'quick/queryCreateConfig',
      payload: this.state.quickuuid,
      callback: response => {
        if (response.result) {
          this.setState({
            onlFormInfos: response.result,
          });

          this.initEntity();
          this.initForm();
        }
      },
    });
  };

  /**
   * 初始化表单
   */
  initForm = () => {
    this.initCategory();
    this.initFormItems();
  };

  /**
   * 初始化表单数据
   */
  initEntity = () => {
    const { onlFormInfos } = this.state;
    //初始化entity
    onlFormInfos.forEach(item => {
      this.entity[item.onlFormHead.tableName] = [];
    });
    if (this.props.showPageNow == 'update') {
      this.initUpdateEntity(onlFormInfos);
    } else {
      this.initCreateEntity(onlFormInfos);
    }
  };

  /**
   * 初始化更新表单
   */
  initUpdateEntity = onlFormInfos => {
    for (const onlFormInfo of onlFormInfos) {
      const { onlFormHead, onlFormFields } = onlFormInfo;
      let tableName = onlFormHead.tableName;
      let param;
      // 主表用主键关联，附表用外键关联
      if (onlFormHead.tableType != 2) {
        var field = onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
        param = {
          tableName: tableName,
          condition: {
            params: [{ field: field, rule: 'eq', val: [this.props.params.entityUuid] }],
          },
        };
      } else {
        var field = onlFormFields.find(x => x.mainField != null && x.mainField != '')?.dbFieldName;
        param = {
          tableName: onlFormHead.tableName,
          condition: {
            params: [{ field: field, rule: 'eq', val: [this.props.params.entityUuid] }],
          },
        };
      }
      this.props.dispatch({
        type: 'quick/dynamicqueryById',
        payload: param,
        callback: response => {
          // 请求的数据为空
          if (response.result.records == 'false') {
            return;
          }
          const records = response.result.records;

          if (onlFormHead.tableType != 2) {
            this.entity[tableName] = records;
            let title = onlFormHead.formTitle;
            if (onlFormHead.formTitle && onlFormHead.formTitle.indexOf(']') != -1) {
              const titles = onlFormInfo.onlFormHead.formTitle.split(']');
              var entityCode = records[0][titles[0].replace('[', '')];
              var entityTitle =
                titles[1].indexOf('}') == -1
                  ? titles[1]
                  : records[0][titles[1].replace('}', '').replace('{', '')];
              title = '[' + entityCode + ']' + entityTitle;
            }
            this.setState({ title: title });
          } else {
            this.entity[tableName] = response.result.records;
            // 一对多增加line
            if (onlFormHead.relationType == 0) {
              for (let i = 0; i < this.entity[tableName].length; i++) {
                this.entity[tableName][i] = {
                  ...this.entity[tableName][i],
                  line: i + 1,
                  key: this.tableKey++,
                };
              }
            }
            this.setState({});
          }
        },
      });
    }
  };

  /**
   * 初始化新建表单
   */
  initCreateEntity = onlFormInfos => {
    // 默认初始值
    for (const onlFormInfo of onlFormInfos) {
      const { onlFormHead, onlFormFields } = onlFormInfo;
      if (onlFormHead.tableType == 2) {
        continue;
      }
      const tableName = onlFormHead.tableName;
      this.entity[tableName][0] = {};
      const result = onlFormFields.filter(x => x.dbDefaultVal !== undefined);
      result.forEach(data => {
        this.entity[tableName][0][data.dbFieldName] = data.dbDefaultVal;
      });
    }
    this.setState({ title: '新建' + onlFormInfos[0].onlFormHead.tableTxt });
  };

  /**
   * 初始化分类
   */
  initCategory = () => {
    const { onlFormInfos } = this.state;
    let categories = [];
    for (const onlFormInfo of onlFormInfos) {
      const { onlFormHead, onlFormFields } = onlFormInfo;
      let { tableType, relationType } = onlFormHead;
      // 附表一对多情况
      if (tableType == 2 && relationType == 0) {
        categories.push({ category: onlFormHead.tableTxt, type: 1 });
      } else {
        // 默认表描述作为一个分类
        categories.push({ category: onlFormHead.tableTxt, type: 0 });
        // 找到有做分类处理的
        if (onlFormFields.find(field => field.category)) {
          const categorySorts = onlFormFields
            .map(field => {
              return { categorySort: field.categorySort, category: field.category };
            })
            .filter((item, index, arr) => arr.findIndex(x => x.category == item.category) === index)
            .sort(item => item.categorySort);
          for (const item of categorySorts) {
            categories.push({ category: item.category, type: 0 });
          }
        }
      }
    }
    // 去重
    categories = categories.filter(
      (item, index, arr) => arr.findIndex(x => x.category == item.category) === index
    );
    this.setState({ categories: categories });
  };

  /**
   * 初始化字段控件
   */
  initFormItems = () => {
    const { onlFormInfos } = this.state;
    let formItems = {};
    let tableItems = {};
    // 根据查询出来的配置渲染表单新增页面
    for (const onlFormInfo of onlFormInfos) {
      const { onlFormHead, onlFormFields } = onlFormInfo;
      let { tableName, tableType, relationType } = onlFormHead;

      for (const field of onlFormFields) {
        if (!field.isShowForm) {
          continue;
        }

        const rules = this.getFormRules(field);
        const fieldExtendJson = field.fieldExtendJson ? JSON.parse(field.fieldExtendJson) : {}; // 扩展属性
        const commonPropertis = {
          disabled: this.isReadOnly(field.isReadOnly),
          style: { width: '100%' },
        }; // 通用属性

        let item = {
          categoryName: field.category ? field.category : onlFormHead.tableTxt,
          key: tableName + '_' + field.dbFieldName,
          label: field.dbFieldTxt,
          rules: rules,
          component: this.getComponent(field),
          props: { ...commonPropertis, ...fieldExtendJson },
          tableName,
          fieldName: field.dbFieldName,
          fieldShowType: field.fieldShowType,
          onlFormInfo,
          onlFormField: field,
        };

        //控件增加组织查询
        this.isOrgSearch(item);

        // 附表一对多情况
        if (tableType == 2 && relationType == 0) {
          item.categoryName = onlFormHead.tableTxt;
          tableItems[item.key] = item;
        } else {
          formItems[item.key] = item;
        }
      }
    }
    this.setState({ tableItems, formItems });
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
   */
  handleChange = e => {
    const { tableName, fieldName, line, fieldShowType, props, valueEvent } = e;
    if (!this.entity[tableName][line]) {
      this.entity[tableName][line] = {};
    }
    const value = this.convertSaveValue(valueEvent, fieldShowType);
    this.entity[tableName][line][fieldName] = value;

    // 处理多值保存
    this.multiSave(e);
    // 字段联动
    this.linkField(e);

    // 执行扩展代码
    this.exHandleChange(e);
    this.setState({});
  };

  /**
   * 渲染表单组件
   */
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    let { formItems, categories, runTimeProps } = this.state;
    let formPanel = [];
    categories = categories.filter(x => x.type == 0);
    if (!categories) {
      return;
    }
    for (const categoryItem of categories) {
      let cols = [];
      for (const formItemKey in formItems) {
        const formItem = formItems[formItemKey];
        const e = { ...formItem };
        const { categoryName, key, tableName, fieldName } = formItem;
        if (categoryName != categoryItem.category) {
          continue;
        }
        e.props.onChange = valueEvent =>
          this.handleChange({
            valueEvent,
            line: 0,
            ...e,
          });
        e.props = { ...e.props, ...runTimeProps[tableName + '_' + fieldName] };
        this.reverseMultiSave(e);
        if (e.fieldShowType == 'auto_complete' || e.fieldShowType == 'sel_tree') {
          e.props.onSourceDataChange = data => {
            this.setRunTimeProps(e.tableName, e.fieldName, { sourceData: data });
          };
        }

        this.drawcell(e);

        let initialValue = this.entity[tableName][0] && this.entity[tableName][0][fieldName]; // 初始值
        cols.push(
          <CFormItem key={key} label={e.label}>
            {getFieldDecorator(key, {
              initialValue: this.convertInitialValue(initialValue, e.fieldShowType),
              rules: e.rules,
            })(<e.component {...e.props} />)}
          </CFormItem>
        );
      }
      if (cols.length > 0) {
        formPanel.push(
          <FormPanel key={categoryItem.category} title={categoryItem.category} cols={cols} />
        );
      }
    }
    return formPanel;
  };

  /**
   * 绘制一对多表格
   */
  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    let { tableItems, categories, runTimeProps } = this.state;
    categories = categories.filter(x => x.type == 1);
    if (!categories) {
      return;
    }
    let formPanel = [];
    for (const categoryItem of categories) {
      let cols = [];
      let currentTableName;
      for (const tableItemKey in tableItems) {
        const tableItem = tableItems[tableItemKey];
        const { categoryName, key, tableName, fieldName, label } = tableItem;
        if (categoryName != categoryItem.category) {
          continue;
        }
        currentTableName = tableName;

        let tailItem = {
          title: label,
          dataIndex: key,
          key: key,
          width: itemColWidth.articleEditColWidth,
          render: (text, record) => {
            const e = { ...tableItem };
            e.record = record;
            e.props.onChange = valueEvent =>
              this.handleChange({
                valueEvent,
                line: record.line - 1,
                ...e,
              });
            e.props = {
              ...e.props,
              ...runTimeProps[tableName + '_' + fieldName + '_' + record.key],
            };
            this.reverseMultiSave(e);
            if (e.fieldShowType == 'auto_complete' || e.fieldShowType == 'sel_tree') {
              e.props.onSourceDataChange = data => {
                this.setRunTimeProps(e.tableName, e.fieldName, { sourceData: data }, e.record.key);
              };
            }

            this.drawcell(e);

            let initialValue = this.entity[tableName][record.line - 1][fieldName]; // 初始值
            return (
              <Form.Item>
                {getFieldDecorator(key + '_' + (record.line - 1), {
                  initialValue: this.convertInitialValue(initialValue, e.fieldShowType),
                  rules: e.rules,
                })(<e.component {...e.props} />)}
              </Form.Item>
            );
          },
        };
        cols.push(tailItem);
      }
      if (cols.length > 0) {
        formPanel.push(
          <ItemEditTable
            key={categoryItem.category}
            title={categoryItem.category}
            columns={cols}
            data={this.entity[currentTableName]}
            newMember={() => {
              this.entity[currentTableName].push({
                line: this.entity[currentTableName].length + 1,
                key: this.tableKey++,
              });
              this.setState({});
            }}
            handleRemove={data => this.handleTableRemove(currentTableName, data)}
            notNote
          />
        );
      }
    }
    return formPanel;
  };

  /**
   * 处理表格删除事件，修复删除form表单没有更新的bug
   */
  handleTableRemove = (tableName, data) => {
    let fields = {};
    for (const row of data) {
      for (const key in row) {
        if (key == 'line' || key == 'key') {
          continue;
        }
        fields[tableName + '_' + key + '_' + (row.line - 1)] = row[key];
      }
    }
    this.props.form.setFieldsValue(fields);
  };

  /**
   * 处理多值保存
   */
  multiSave = e => {
    if (!e.props.multiSave) {
      return;
    }
    const { props, fieldShowType, tableName, line, valueEvent } = e;
    if (fieldShowType == 'auto_complete' || e.fieldShowType == 'sel_tree') {
      const multiSaves = props.multiSave.split(',');
      for (const multiSave of multiSaves) {
        const [key, value] = multiSave.split(':');
        this.entity[tableName][line][key] = getFieldShow(valueEvent.record, value);
      }
    }
  };

  /**
   * 多值保存反转初始化数据
   */
  reverseMultiSave = e => {
    if (!e.props.multiSave) {
      return;
    }
    const { fieldShowType, props, tableName, record, fieldName } = e;
    let line = record ? record.line - 1 : 0;
    if (fieldShowType == 'auto_complete' || e.fieldShowType == 'sel_tree') {
      const multiSaves = props.multiSave.split(',');
      const initialRecord = {};
      if (this.entity[tableName][line]) {
        for (const multiSave of multiSaves) {
          const [value, key] = multiSave.split(':');
          initialRecord[key] = this.entity[tableName][line][value];
        }
        initialRecord[props.valueField] = this.entity[tableName][line][fieldName];
        if (initialRecord[props.valueField] == undefined) {
          return;
        }
        e.props.initialRecord = initialRecord;
      }
    }
  };

  /**
   * 处理字段联动
   */
  linkField = e => {
    if (!e.props.linkField) {
      return;
    }
    const { fieldShowType, props, tableName, valueEvent } = e;
    if (fieldShowType == 'auto_complete') {
      const linkFilters = {};
      const linkFields = props.linkField.split(',');
      for (const linkField of linkFields) {
        const [field, key, value] = linkField.split(':');
        linkFilters[field] = { ...linkFilters[field], [key]: valueEvent.record[value] };
      }
      for (const field in linkFilters) {
        this.setRunTimeProps(tableName, field, { linkFilter: linkFilters[field] }, e.record?.key);
      }
    }
  };

  /**
   *判断是否增加组织查询
   */
  isOrgSearch = e => {
    if (!e.props.isOrgSearch) {
      return;
    }
    const { fieldShowType, props, tableName } = e;
    if (fieldShowType == 'auto_complete') {
      const orgFields = props.isOrgSearch.split(',');
      let loginOrgType = loginOrg().type.replace('_', '');
      let loginInfo = ['COMPANYUUID', loginOrgType, loginOrgType + 'UUID'];
      let loginObj = {};
      if (orgFields.indexOf('Company') != -1) {
        loginObj = {
          COMPANYUUID: loginCompany().uuid,
        };
      }
      if (orgFields.indexOf('Org') != -1) {
        loginObj = {
          ...loginObj,
          [loginOrgType + 'UUID']: loginOrg().uuid,
        };
      }
      if (props.isOrgSearch) {
        this.setRunTimeProps(tableName, e.fieldName, { linkFilter: loginObj }, e.record?.key);
      }
    }
  };

  /**
   * 判断是否只读
   * @param {*} readOnlyType field的isReadOnly字段
   * @returns
   */
  isReadOnly = readOnlyType => {
    const update = this.props.showPageNow == 'update';
    // readOnlyType （0：编辑时只读, 1:字段只读, 2:新增时只读, 3:不只读）
    return readOnlyType == 1 || (readOnlyType == 0 && update) || (readOnlyType == 2 && !update);
  };

  /**
   * 生成校验规则
   * @param {*} field onlFormField
   */
  getFormRules = field => {
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
    return rules;
  };

  /**
   * 根据控件类型获取控件
   */
  getComponent = field => {
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
    } else if (['text', 'textarea'].indexOf(fieldShowType) > -1 || !fieldShowType) {
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
    } else if (
      fieldShowType == 'text' ||
      fieldShowType == 'textarea' ||
      fieldShowType == 'radio' ||
      !fieldShowType
    ) {
      return e.target.value;
    } else if (fieldShowType == 'auto_complete' || fieldShowType == 'sel_tree') {
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
  if (!rowData || !str) {
    return;
  }
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
