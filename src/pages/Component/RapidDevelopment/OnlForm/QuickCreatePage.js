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

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class QuickCreatePage extends CreatePage {
  entity = {};

  beforeSave = (data) => { }
  exHandleChange = (e, tableName, dbFieldName, line, formInfo, onlFormField) => { }
  drawcell = (e) => { }

  //初始化表单数据
  initOnlFormField = () => {
    const { onlFormInfos } = this.state;
    //初始化entity
    onlFormInfos.forEach(item => {
      this.entity[item.onlFormHead.tableName] = [];
    });
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

  // 校验一对多子表的数据
  verifyTable(datas) {
    const { onlFormInfos } = this.state;
    const map = new Map(Object.entries(datas));
    let newOnlFormHead;
    for (let i = 0; i < onlFormInfos.length; i++) {
      if (i == 0) {
        continue;
      }
      if (onlFormInfos[i].onlFormHead.relationType == '0') {
        newOnlFormHead = onlFormInfos[i];
      }
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
    console.log("handleChange", this.entity)

    // 执行扩展代码
    this.exHandleChange(e, tableName, dbFieldName, line, formInfo, onlFormField);
    this.setState({})
  }

  setFieldsValue = (tableName, dbFieldName, value, line) => {
    const fieldName = tableName + '_' + dbFieldName + (line == undefined ? '' : '_' + line);
    this.props.form.setFieldsValue({ [fieldName]: value });
    this.entity[tableName][line == undefined ? 0 : line][dbFieldName] = value;
    // handleChange();   // 手动触发值改变事件
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
    const { onlFormInfos } = this.state;
    let formPanel = [];
    let updateOrAdd = this.props.showPageNow == 'update';
    if (!onlFormInfos) {
      return null;
    }
    // 根据查询出来的配置渲染表单新增页面
    for (const onlFormInfo of onlFormInfos) {
      const { onlFormHead, onlFormFields } = onlFormInfo;
      let { tableName, tableType, relationType } = onlFormHead;
      let cols = [];
      // 附表一对多情况不进行该方式渲染
      if (tableType == 2 && relationType == 0) {
        continue;
      }

      // 所有序号
      const categorySorts = onlFormFields
        .map(current => current.categorySort)
        .filter((element, index, self) => self.indexOf(element) === index)
        .sort();
        
      for (const category of categorySorts) {
        for (const field of onlFormFields) {
          if (!field.isShowForm || category != field.categorySort) {
            continue;
          }

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

          // isReadOnly （1:字段只读,2:新增时只读,3:不只读，0：编辑时只读）
          let isReadOnly = field.isReadOnly == 1 || (field.isReadOnly == 0 && updateOrAdd) || (field.isReadOnly == 2 && !updateOrAdd);

          const fieldExtendJson = field.fieldExtendJson ? JSON.parse(field.fieldExtendJson) : {}; // 扩展属性
          const commonPropertis = {
            disabled: isReadOnly,
            style: { width: '100%' },
            onChange: e => this.handleChange(e, tableName, field.dbFieldName, 0, onlFormInfo, field)
          }; // 通用属性

          let e = {
            onlFormInfo,
            onlFormField: field,
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
          <FormPanel key={onlFormHead.id} title={category} cols={cols} />
        );
      }
      return formPanel;
    };
  }

  drawTable = () => {
    let updateOrAdd = this.props.showPageNow == 'update';
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

      //isReadOnly （1:字段只读,2:新增时只读,3:不只读，0：编辑时只读）
      let isReadOnly = field.isReadOnly == 1 || (field.isReadOnly == 0 && updateOrAdd) || (field.isReadOnly == 2 && !updateOrAdd);

      const fieldExtendJson = field.fieldExtendJson ? JSON.parse(field.fieldExtendJson) : {}; // 扩展属性
      let tailItem = {
        title: field.dbFieldTxt,
        dataIndex: tableName + field.dbFieldName,
        key: tableName + field.dbFieldName,
        width: itemColWidth.articleEditColWidth,
        render: (text, record) => {
          const commonPropertis = {
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
            value: record[field.dbFieldName]
          };

          let e = {
            onlFormInfo: formInfo,
            onlFormField: field,
            record: record,
            component: this.getComponent(field),
            props: { ...commonPropertis, ...fieldExtendJson }
          };

          this.drawcell(e);

          return <e.component {...e.props}></e.component>;
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
          drawTotalInfo={this.drawTotalInfo}
          drawBatchButton={this.drawBatchButton}
          notNote
        />
      </div>
    );
  };

  
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
}
