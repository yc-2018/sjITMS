/*
 * @Author: Liaorongchang
 * @Date: 2022-04-16 17:45:18
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-10-21 15:32:07
 * @version: 1.0
 */
/*
 * @Author: Liaorongchang
 * @Date: 2022-03-25 10:17:08
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-03-28 17:24:09
 * @version: 1.0
 */
import { connect } from 'dva';
import { Form } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import ItemEditTable from './ItemEditTable';
import FormPanel from '@/pages/Component/RapidDevelopment/CommonLayout/Form/FormPanel';
import CFormItem from '@/pages/Component/RapidDevelopment/CommonLayout/Form/CFormItem';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class HighWagAreaCreatePage extends QuickCreatePage {
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
        const { categoryName, key, tableName, fieldName, onlFormField } = formItem;
        if (categoryName != categoryItem.category) {
          continue;
        }
        const data = this.entity[tableName].filter(x => x.TYPE == 'return');
        let initialValue; // 初始值
        if (tableName == 'sj_itms_highwayareagroup_dtl') {
          initialValue = data[0] != undefined ? data[0][fieldName] : onlFormField.fieldDefaultValue;
        } else {
          initialValue = this.entity[tableName][0] && this.entity[tableName][0][fieldName];
        }

        this.propsSpecialTreatment(e);
        this.drawcell(e);

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
    const { getFieldDecorator, validateFields } = this.props.form;
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
        const { categoryName, key, tableName, fieldName, label, onlFormField } = tableItem;
        if (categoryName != categoryItem.category) {
          continue;
        }
        currentTableName = tableName;
        let mustInput = onlFormField.dbIsNull ? '' : '*';
        let tailItem = {
          title: (
            <div>
              <span>{label}</span>
              <span style={{ color: 'red' }}>{mustInput}</span>
            </div>
          ),
          dataIndex: key,
          key: key,
          width: onlFormField.fieldLength,
          render: (text, record) => {
            const e = { ...tableItem };
            e.record = record;
            this.propsSpecialTreatment(e);
            this.drawcell(e);
            let initialValue =
              this.entity[tableName][record.line - 1] &&
              this.entity[tableName][record.line - 1][fieldName]; // 初始值
            if (initialValue == undefined && onlFormField.fieldDefaultValue) {
              this.entity[tableName][record.line - 1][fieldName] = onlFormField.fieldDefaultValue;
              initialValue = onlFormField.fieldDefaultValue;
            }
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
        const data = this.entity[currentTableName].filter(x => x.TYPE != 'return');
        const datas = data != undefined ? data : [];
        formPanel.push(
          <ItemEditTable
            key={categoryItem.category}
            title={this.props.noCategory ? undefined : categoryItem.category}
            columns={cols}
            data={datas}
            newMember={() => {
              this.entity[currentTableName].push({
                line: this.entity[currentTableName].length + 1,
                key: this.tableKey++,
              });
              this.setState({});
            }}
            // handleRemove={data => this.handleTableRemove(currentTableName, data)}
            batchRemove={selectRows => this.batchRemove(selectRows)}
            notNote
          />
        );
      }
    }
    return formPanel;
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
          orderBy: ['TYPE-'],
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
   * 初始化新建表单
   */
  initCreateEntity = onlFormInfos => {
    // 默认初始值
    for (const onlFormInfo of onlFormInfos) {
      const { onlFormHead, onlFormFields } = onlFormInfo;
      if (onlFormHead.tableType == 2 && onlFormHead.tableTxt != '返程高速路线') {
        continue;
      }
      const tableName = onlFormHead.tableName;
      this.entity[tableName][0] = {};
      console.log(onlFormHead);
      const result = onlFormFields.filter(x => x.fieldDefaultValue !== undefined);
      result.forEach(data => {
        this.entity[tableName][0][data.dbFieldName] = data.fieldDefaultValue;
      });
    }
    this.setState({ title: '新建' + onlFormInfos[0].onlFormHead.tableTxt });
  };

  batchRemove = selectRows => {
    const data = this.entity['sj_itms_highwayareagroup_dtl'];
    for (let i = data.length - 1; i >= 0; i--) {
      if (selectRows.indexOf(data[i].line) >= 0) {
        data.splice(i, 1);
      }
    }
    for (let i = 0; i < data.length; i++) {
      data[i].key = i;
      data[i].line = i + 1;
    }
    this.setState({});
  };

  exHandleChange = e => {
    const { form } = this.props;
    if (e.fieldName == 'TOTAL') {
      let total = 0;
      this.entity['sj_itms_highwayareagroup_dtl'].forEach(data => {
        total = total + data.TOTAL;
      });
      this.entity['sj_itms_highwayareagroup_head'][0]['TOTAL'] = total;
    }
  };
}
