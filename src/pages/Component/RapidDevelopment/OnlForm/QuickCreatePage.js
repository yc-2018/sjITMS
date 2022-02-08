import { connect } from 'dva';
import { Form, Select, Input, InputNumber, message, Col, DatePicker, Modal } from 'antd';
import moment from 'moment';

import { loginCompany, loginOrg, loginUser, getDefOwner, getActiveKey } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import {
  SimpleTreeSelect,
  SimpleRadio,
  SimpleAutoComplete,
} from '@/pages/Component/RapidDevelopment/CommonComponent';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class QuickCreatePage extends CreatePage {
  entity = {};

  //初始化表单数据
  initonlFormField = () => {
    const { onlFormField } = this.props;
    onlFormField.forEach(item => {
      //初始化表名称
      this.entity[item.onlFormHead.tableName] = {};
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
                this.entity[tableName] = response.result.records[0];
                this.setState({});
              }
            },
          });
        } else {
          const param = {
            tableName: item.onlFormHead.tableName,
            condition: {
              params: [{ field: 'parent_id', rule: 'eq', val: [this.props.quick.entityUuid] }],
            },
          };
          this.props.dispatch({
            type: 'quick/dynamicqueryById',
            payload: param,
            callback: response => {
              if (response.result.records != 'false') {
                this.entity[tableName] = response.result.records[0];
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
    console.log('data', data);
    console.log('tableName', this.state.tableName);
    console.log('entity', this.entity);
    return;
    // TODO 日期格式oracle保存有问题
    // 格式转换处理
    convertSaveData(data);

    //入参
    const param = [
      {
        tableName: this.state.tableName,
        data: [data],
      },
    ];
    this.props.dispatch({
      type: 'quick/saveOrUpdateEntities',
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

  handleChange = (value, tableName, dbFieldName, fieldShowType) => {
    console.log('value', value, 'dbFieldName', dbFieldName, 'fieldShowType', fieldShowType);
    if (fieldShowType == 'date') {
      this.entity[tableName][dbFieldName] = value.format('YYYY-MM-DD');
    } else if (fieldShowType == 'number') {
      this.entity[tableName][dbFieldName] = value;
    } else if (fieldShowType == 'sel_tree') {
      this.entity[tableName][dbFieldName] = value;
    } else if (fieldShowType == 'radio') {
      this.entity[tableName][dbFieldName] = value.target.value;
    } else if (fieldShowType == 'auto_complete') {
      this.entity[tableName][dbFieldName] = value;
    } else if (fieldShowType == 'textarea') {
      this.entity[tableName][dbFieldName] = value.target.value;
    } else {
      this.entity[tableName][dbFieldName] = value.target.value;
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
    //const tableName = this.state.tableName;
    //根据查询出来的配置渲染表单新增页面
    onlFormField.forEach(item => {
      let tableName = item.onlFormHead.tableName;
      let cols = [];
      item.onlFormFields.forEach(field => {
        let formItem;
        let rules = [{ required: !field.dbIsNull, message: `${field.dbFieldTxt}字段不能为空` }];
        const fieldExtendJson = field.fieldExtendJson ? JSON.parse(field.fieldExtendJson) : {}; // 扩展属性
        const commonPropertis = {
          disabled: field.isReadOnly,
          style: { width: '100%' },
          onChange: value =>
            this.handleChange(value, tableName, field.dbFieldName, field.fieldShowType),
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

        cols.push(
          <CFormItem key={tableName + field.dbFieldName} label={field.dbFieldTxt}>
            {getFieldDecorator(tableName + field.dbFieldName, {
              initialValue: convertInitialValue(
                this.entity[tableName][field.dbFieldName],
                field.fieldShowType
              ),
              rules: rules,
            })(formItem)}
          </CFormItem>
        );
      });

      formPanel.push(
        <FormPanel key={item.onlFormHead.id} title={item.onlFormHead.tableTxt} cols={cols} />
      );
    });

    return formPanel;
  };
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
