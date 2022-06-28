import CreatePage from '@/pages/Component/RapidDevelopment/CommonLayout/CreatePage';
import FormPanel from '@/pages/Component/RapidDevelopment/CommonLayout/Form/FormPanel';
import CFormItem from '@/pages/Component/RapidDevelopment/CommonLayout/Form/CFormItem';
import React, { Component } from 'react';
import { getSubjectBill, updateSubjectBill } from '@/services/cost/CostCalculation';
import { Form, Input, InputNumber, message } from 'antd';

const billUuid = 'b64595de103f40059ffadf78523c47c7';
const subjectUuid = 'B666';

@Form.create()
export default class CostBillEdit extends CreatePage {
  state = {
    title: '编辑',
  };
  entity = {};

  componentDidMount() {
    getSubjectBill({ billUuid, subjectUuid }).then(response => {
      this.setState({ loading: false, billInfo: response.data });
    });
  }

  handleChange = (key, value) => {
    this.entity[key] = value;
    this.linkCalculate(key, value);
    console.log(this.entity);
  };

  onCancel = () => {
    this.props.switchTab('view', {});
  };

  /**
   * 联动计算
   */
  linkCalculate = () => {};

  onSave = async () => {
    const response = await updateSubjectBill({ billUuid, subjectUuid, updateMap: this.entity });
    if (response.success) {
      message.success('保存成功');
      this.props.switchTab('view', {params:{}});
    }
  };

  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { billInfo } = this.state;
    const costTypes = [
      { DICT_CODE: 'costType', SORT_ORDER: 1, VALUE: '0', NAME: '税前加项' },
      { DICT_CODE: 'costType', SORT_ORDER: 2, VALUE: '1', NAME: '税前减项' },
      { DICT_CODE: 'costType', SORT_ORDER: 3, VALUE: '2', NAME: '税费项' },
      { DICT_CODE: 'costType', SORT_ORDER: 4, VALUE: '3', NAME: '税后减项' },
      { DICT_CODE: 'costType', SORT_ORDER: 5, VALUE: '4', NAME: '税后加项' },
      { DICT_CODE: 'costType', SORT_ORDER: 6, VALUE: '5', NAME: '汇总项' },
      { DICT_CODE: 'costType', SORT_ORDER: 7, VALUE: '6', NAME: '其他' },
    ];
    let formPanel = [];
    let baseCols = [];
    if (!billInfo?.billSubject || !billInfo?.billDetail) {
      return;
    }
    for (const subject of billInfo.billSubject) {
      baseCols.push(
        <CFormItem key={subject.fieldName} label={subject.fieldTxt}>
          {getFieldDecorator(subject.fieldName, {
            initialValue: subject.fieldValue,
            // rules: e.rules,
          })(<Input readOnly />)}
        </CFormItem>
      );
    }
    formPanel.push(<FormPanel key="base" title="基础资料" cols={baseCols} />);

    for (const costType of costTypes) {
      let calcCols = [];
      for (const detail of billInfo.billDetail) {
        if (
          billInfo.projects.find(project => project.UUID == detail.projectUuid)?.TYPE !=
          costType.VALUE
        ) {
          continue;
        }
        calcCols.push(
          <CFormItem key={detail.projectCode} label={detail.projectName}>
            {getFieldDecorator(detail.projectCode, {
              initialValue: detail.amount,
              // rules: e.rules,
            })(
              <InputNumber
                controls={false}
                onChange={value => this.handleChange(detail.projectCode, value)}
              />
            )}
          </CFormItem>
        );
      }
      if (calcCols.length > 0) {
        formPanel.push(
          <FormPanel key={'projectType' + costType.VALUE} title={costType.NAME} cols={calcCols} />
        );
      }
    }

    return formPanel;
  };
}
