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
import CreatePage from '@/pages/Component/RapidDevelopment/CommonLayout/CreatePage';
import FormPanel from '@/pages/Component/RapidDevelopment/CommonLayout/Form/FormPanel';
import CFormItem from '@/pages/Component/RapidDevelopment/CommonLayout/Form/CFormItem';
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
import Address from '@/pages/Component/Form/Address';

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
  afterSave = data => {};
  exHandleChange = e => {};
  drawcell = e => {};

  getFieldKey = (tableName, dbFieldName, key) => tableName + '_' + dbFieldName + (key == undefined ? '' : '_' + key);

  /**
   * 设置字段的值
   * @param {*} tableName 表名
   * @param {*} dbFieldName 字段
   * @param {*} value 值
   * @param {*} line 行
   */
  setFieldsValue = (tableName, dbFieldName, value, line) => {
    const fieldKey = this.getFieldKey(tableName, dbFieldName, line);
    this.entity[tableName][line == undefined ? 0 : line][dbFieldName] = value;
    this.props.form.setFieldsValue({ [fieldKey]: value });
  };

  /**
   * 设置运行时产生的props
   * @param {*} tableName 表名
   * @param {*} fieldName 字段
   * @param {*} props 属性
   * @param {*} key 一对多表格的key
   * @param {*} reRender 是否重新渲染
   */
  setRunTimeProps = (tableName, fieldName, props, key, reRender) => {
    const { runTimeProps } = this.state;
    const fieldKey = this.getFieldKey(tableName, fieldName, key);
    runTimeProps[fieldKey] = { ...runTimeProps[fieldKey], ...props };
    if (reRender) {
      this.setState({ runTimeProps });
    } else {
      this.state.runTimeProps = runTimeProps;
    }
  };

  getRunTimeProps = (tableName, fieldName, key) => {
    return {
      ...this.state.runTimeProps[this.getFieldKey(tableName, fieldName)],
      ...this.state.runTimeProps[this.getFieldKey(tableName, fieldName, key)]
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      title: '',
      loading: true,
      quickuuid: props.quickuuid,
      onlFormInfos: props.onlFormField,
      formItems: {},
      tableItems: {},
      categories: [],
      runTimeProps: {},
    };
  }

  componentDidMount() {
    this.init();
    // 将本组件交给父级
    this.props.onRef && this.props.onRef(this);
  }

  init = async () => {
    if (!this.props.onlFormField) {
      const response = await this.queryCreateConfig();
      if (response.result) {
        this.setState({
          onlFormInfos: response.result,
        });
      }
    }
    await this.initEntity();
    this.initForm();
    this.formLoaded();
  };

  onSaving = () => {
    this.setState({ saving: true });
    this.props.onSaving && this.props.onSaving();
  };

  onCancel = () => {
    if (this.props.onCancel) {
      this.props.onCancel();
    } else if (this.props.switchTab) {
      this.props.switchTab('query');
    }
  };

  onSaved = success => {
    this.setState({ saving: false });
    if (this.props.onSaved) {
      this.props.onSaved(success);
    } else if (this.props.switchTab) {
      this.props.switchTab('query');
    }
  };

  /**
   * 初始化表单
   */
  initForm = () => {
    this.initCategory();
    this.initFormItems();
    this.setState({ loading: false });
  };

  /**
   * 初始化表单数据
   */
  initEntity = async () => {
    const { onlFormInfos } = this.state;
    //初始化entity
    onlFormInfos.forEach(item => {
      this.entity[item.onlFormHead.tableName] = [];
    });
    if (this.props.showPageNow == 'update') {
      await this.initUpdateEntity(onlFormInfos);
    } else {
      this.initCreateEntity(onlFormInfos);
    }
  };

  /**
   * 初始化更新表单
   */
  initUpdateEntity = async onlFormInfos => {
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
      const response = await this.queryEntityData(param);
      // 请求的数据为空
      if (response.result.records == 'false') {
        return;
      }
      const records = response.result.records;

      if (onlFormHead.tableType != 2) {
        this.entity[tableName] = records;
        //address组件初始值
        let addItem = onlFormFields.find(item => item.fieldShowType == 'address');
        if (addItem) {
          let address = {
            country: records[0].COUNTRY,
            city: records[0].CITY,
            province: records[0].PROVINCE,
            district: records[0].DISTRICT,
            street: records[0].STREET,
          };
          this.entity[tableName][0][addItem.dbFieldName] = address;
        }

        //title处理
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
    }
  };

  /**
   * 获取配置信息
   */
  queryCreateConfig = () => {
    return new Promise((resolve, reject) => {
      this.props.dispatch({
        type: 'quick/queryCreateConfig',
        payload: this.state.quickuuid,
        callback: response => {
          resolve(response);
        },
      });
    });
  };

  /**
   * 获取实体数据
   * @param {*} param 参数
   */
  queryEntityData = param => {
    return new Promise((resolve, reject) => {
      this.props.dispatch({
        type: 'quick/dynamicqueryById',
        payload: param,
        callback: response => {
          resolve(response);
        },
      });
    });
  };

  /**
   * 保存实体数据
   * @param {*} param 参数
   */
  saveEntityData = param => {
    return new Promise((resolve, reject) => {
      this.props.dispatch({
        type: 'quick/saveFormData',
        payload: {
          param,
        },
        callback: response => {
          resolve(response);
        },
      });
    });
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
      const result = onlFormFields.filter(x => x.fieldDefaultValue !== undefined);
      result.forEach(data => {
        this.entity[tableName][0][data.dbFieldName] = data.fieldDefaultValue;
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
    categories = categories
      .filter((item, index, arr) => arr.findIndex(x => x.category == item.category) === index)
      .sort((a, b) => a.categorySort - b.categorySort);
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
          style: { width: field.fieldLength == 0 ? '100%' : field.fieldLength },
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
          dbType: field.dbType,
          onlFormInfo,
          onlFormField: field,
        };

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

  onSave = async data => {
    const { entity } = this;
    const { onlFormInfos } = this.state;

    //保存前对address字段做处理 不进行保存
    for (let onlFormInfo of onlFormInfos) {
      let addItem = onlFormInfo.onlFormFields.find(item => item.fieldShowType == 'address');
      if (addItem) {
        delete this.entity[onlFormInfo.onlFormHead.tableName][0][addItem.dbFieldName];
      }
    }

    const result = this.beforeSave(entity);
    if (result === false) {
      return;
    }

    this.onSaveSetOrg();

    //入参
    const param = { code: this.state.onlFormInfos[0].onlFormHead.code, entity: entity };
    this.onSaving();
    const response = await this.saveEntityData(param);
    const success = response.success == true;
    this.afterSave(success);
    this.onSaved(success);
    if (success) {
      message.success(commonLocale.saveSuccessLocale);
    }
  };

  /**
   * 保存时加入组织uuid和企业uuid
   */
  onSaveSetOrg = () => {
    let loginOrgType = loginOrg().type.replace('_', '');
    let loginInfo = ['COMPANYUUID', loginOrgType, loginOrgType + 'UUID'];
    let loginObj = {
      COMPANYUUID: loginCompany().uuid,
      [loginOrgType]: loginOrg().uuid,
      [loginOrgType + 'UUID']: loginOrg().uuid,
    };

    for (let onlFormInfo of this.state.onlFormInfos) {
      const { tableName } = onlFormInfo.onlFormHead;
      for (let field of onlFormInfo.onlFormFields) {
        if (loginInfo.indexOf(field.dbFieldName.toUpperCase()) != -1 && !field.isShowForm) {
          this.entity[tableName].forEach(data => {
            data[field.dbFieldName] = loginObj[field.dbFieldName.toUpperCase()];
          });
        }
      }
    }
  }

  /**
   * 处理值改变事件
   */
  handleChange = e => {
    const { tableName, fieldName, line, fieldShowType, props, valueEvent } = e;
    if (!this.entity[tableName][line]) {
      this.entity[tableName][line] = {};
    }
    const value = this.convertSaveValue(valueEvent, fieldShowType);
    //address单独处理
    if (fieldShowType == 'address') {
      for (var key in value) {
        this.entity[tableName][line][key.toUpperCase()] = value[key];
      }
      this.entity[tableName][line][fieldName] = null;
    } else {
      this.entity[tableName][line][fieldName] = value;
    }

    // 处理多值保存
    this.multiSave(e);
    // 字段联动
    this.handleLinkField(e);

    // 执行扩展代码
    this.exHandleChange(e);
    this.setState({});
    // console.log('entity', this.entity);
    // console.log('runtime', this.state.runTimeProps);
  };

  getGutt = () => {
    const { onlFormInfos } = this.state;
    let { formItems, categories } = this.state;
    let nums = onlFormInfos[0].onlFormHead.formTemplate
      ? onlFormInfos[0].onlFormHead.formTemplate
      : 4;
    nums = nums == 0 ? 4 : nums;
    let gutt = [];
    for (var i = 0; i < categories.length; i++) {
      let guttItems = [];
      for (var j = 0; j < Object.getOwnPropertyNames(formItems).length; j++) {
        guttItems.push(nums);
      }
      gutt.push(guttItems);
    }
    return gutt;
  };

  /**
   * 渲染表单组件
   */
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    let { formItems, categories } = this.state;
    let formPanel = [];
    categories = categories.filter(x => x.type == 0);
    if (!categories || !this.state.onlFormInfos) {
      return;
    }
    let z = 0;
    let gutt = this.state.onlFormInfos[0].onlFormHead.formTemplateList
      ? this.state.onlFormInfos[0].onlFormHead.formTemplateList
      : this.getGutt()
        ? this.getGutt()
        : [];
    for (const categoryItem of categories) {
      let cols = [];
      for (const formItemKey in formItems) {
        const formItem = formItems[formItemKey];
        const e = { ...formItem };
        const { categoryName, key, tableName, fieldName } = formItem;
        if (categoryName != categoryItem.category) {
          continue;
        }
        this.propsSpecialTreatment(e);
        this.drawcell(e);

        let initialValue = this.entity[tableName][0] && this.entity[tableName][0][fieldName]; // 初始值
        cols.push(
          <CFormItem key={key} label={e.label}>
            {getFieldDecorator(key, {
              initialValue: this.convertInitialValue(initialValue, e.fieldShowType, e.dbType),
              rules: e.rules,
            })(<e.component {...e.props} />)}
          </CFormItem>
        );
      }
      if (cols.length > 0) {
        formPanel.push(
          <FormPanel
            key={categoryItem.category}
            title={this.props.noCategory ? undefined : categoryItem.category}
            cols={cols}
            gutterCols={gutt[z] ? gutt[z] : null}
          />
        );
        z++;
      }
    }
    if (formPanel.length == 0) {
      return null;
    } else {
      return formPanel;
    }
  };

  /**
   * 绘制一对多表格
   */
  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    let { tableItems, categories } = this.state;
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
            this.propsSpecialTreatment(e);
            this.drawcell(e);

            let initialValue = this.entity[tableName][record.line - 1][fieldName]; // 初始值
            return (
              <Form.Item>
                {getFieldDecorator(key + '_' + (record.line - 1), {
                  initialValue: this.convertInitialValue(initialValue, e.fieldShowType, e.dbType),
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
            title={this.props.noCategory ? undefined : categoryItem.category}
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
      for (const field in row) {
        if (field == 'line' || field == 'key') {
          continue;
        }
        fields[this.getFieldKey(tableName, field, (row.line - 1))] = row[field];
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
   * 特殊处理控件的props
   */
  propsSpecialTreatment = e => {
    // this.reverseMultiSave(e);
    this.childComponetSourceDataSave(e);
    this.setOrgSearch(e);
    this.setRunTimeProps(e.tableName, e.fieldName, { onChange: valueEvent => this.handleChange({ valueEvent, line: e.record ? e.record.line - 1 : 0, ...e, }) }, e.record?.key);
    e.props = { ...e.props, ...this.getRunTimeProps(e.tableName, e.fieldName, e.record?.key) };
  }

  /**
   * 保存子控件的数据，重新render时可以重复使用
   */
  childComponetSourceDataSave = e => {
    const { fieldShowType, props, tableName, record, fieldName } = e;
    if (fieldShowType == 'auto_complete' || fieldShowType == 'sel_tree') {
      e.props.onSourceDataChange = (data, valueEvent) => {
        if(!this.getRunTimeProps(tableName, fieldName, record?.key)?.sourceData){
          this.handleLinkField({ ...e, valueEvent });   // 触发过滤
        }
        this.setRunTimeProps(tableName, fieldName, { sourceData: data }, record?.key, true);
      };
    }
  }

  // /**
  //  * 多值保存反转初始化数据
  //  */
  // reverseMultiSave = e => {
  //   if (!e.props.multiSave) {
  //     return;
  //   }
  //   const { fieldShowType, props, tableName, record, fieldName } = e;
  //   let line = record ? record.line - 1 : 0;
  //   if (fieldShowType == 'auto_complete' || e.fieldShowType == 'sel_tree') {
  //     const multiSaves = props.multiSave.split(',');
  //     const initialRecord = {};
  //     if (this.entity[tableName][line]) {
  //       for (const multiSave of multiSaves) {
  //         const [value, key] = multiSave.split(':');
  //         initialRecord[key] = this.entity[tableName][line][value];
  //       }
  //       initialRecord[props.valueField] = this.entity[tableName][line][fieldName];
  //       if (initialRecord[props.valueField] == undefined) {
  //         return;
  //       }
  //       e.props.initialRecord = initialRecord;
  //     }
  //     this.linkField(e);
  //   }
  // };

  /**
   * 处理字段联动
   */
  handleLinkField = e => {
    if (!e.props.linkField || !e.valueEvent) {
      return;
    }
    const { fieldShowType, props, tableName: currentTableName, valueEvent } = e;
    if (fieldShowType == 'auto_complete') {
      const linkFilters = {};
      const linkFields = props.linkField.split(',');
      for (const linkField of linkFields) {
        let [field, key, value, tableName] = linkField.split(':');
        tableName = tableName || currentTableName;
        if(linkFilters[tableName] == undefined){
          linkFilters[tableName] = {};
        }
        if(linkFilters[tableName][field] == undefined){
          linkFilters[tableName][field] = {};
        }
        linkFilters[tableName][field] = { ...linkFilters[tableName][field], [key]: valueEvent.record[value] };
      }
      for (const tableName in linkFilters) {
        for (const field in linkFilters[tableName]) {
          this.setLinkFilter(tableName, field, e.record?.key, linkFilters[tableName][field]);
        }
      }
    }
  }

  /**
   * 设置字段联动
   */
  setLinkFilter = (tableName, field, key, linkFilter) => {
    const globalLinkFilter = this.getRunTimeProps(tableName, field)?.linkFilter;
    const oldLinkFilter = this.getRunTimeProps(tableName, field, key)?.linkFilter;
    this.setRunTimeProps(tableName, field, { linkFilter: { ...oldLinkFilter, ...globalLinkFilter, ...linkFilter} }, key);
  }

  /**
   *判断是否增加组织查询
   */
  setOrgSearch = e => {
    if (!e.props.isOrgSearch) {
      return;
    }
    const { fieldShowType, props, tableName, record, fieldName } = e;
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
      this.setLinkFilter(tableName, fieldName, record?.key, loginObj);
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
    } else if (field.fieldShowType == 'address') {
      return Address;
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
  convertInitialValue = (value, fieldShowType, dbType) => {
    if (value == undefined || value == null) {
      return value;
    }
    if (fieldShowType == 'date') {
      return moment(value, 'YYYY/MM/DD');
    } else if (['text', 'textarea'].indexOf(fieldShowType) > -1 || !fieldShowType) {
      return value.toString();
    } else if (dbType == 'Integer') {
      return parseInt(value);
    } else if (dbType == 'Double' || dbType == 'BigDecimal') {
      return parseFloat(value);
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
