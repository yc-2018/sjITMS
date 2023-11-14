import CreatePage from '@/pages/Component/RapidDevelopment/CommonLayout/CreatePage';
import FormPanel from '@/pages/Component/RapidDevelopment/CommonLayout/Form/FormPanel';
import CFormItem from '@/pages/Component/RapidDevelopment/CommonLayout/Form/CFormItem';
import React, { Component, Fragment } from 'react';
import {
  getSubjectBill,
  updateSubjectBill,
  getPlanParticulars,
  exportPlan,
} from '@/services/bms/CostCalculation';
import { Form, message, Modal, Button, Spin } from 'antd';
import ExportJsonExcel from 'js-export-excel';
import StandardTable from '@/pages/Component/RapidDevelopment/CommonLayout/RyzeStandardTable/index';
import styles from '@/pages/Component/RapidDevelopment/CommonLayout/transportOrder.less';
const costTypes = [
  { DICT_CODE: 'costType', SORT_ORDER: 1, VALUE: '0', NAME: '税前加项' },
  { DICT_CODE: 'costType', SORT_ORDER: 2, VALUE: '1', NAME: '税前减项' },
  { DICT_CODE: 'costType', SORT_ORDER: 3, VALUE: '2', NAME: '税费项' },
  { DICT_CODE: 'costType', SORT_ORDER: 4, VALUE: '3', NAME: '税后减项' },
  { DICT_CODE: 'costType', SORT_ORDER: 5, VALUE: '4', NAME: '税后加项' },
  { DICT_CODE: 'costType', SORT_ORDER: 6, VALUE: '5', NAME: '汇总项' },
  { DICT_CODE: 'costType', SORT_ORDER: 7, VALUE: '6', NAME: '其他' },
];

@Form.create()
export default class CostBillEditView extends CreatePage {
  state = {
    title: '查看',
    isModalVisible: false,
    loading: false,
  };
  entity = {};

  componentDidMount() {
    const { billUuid, subjectUuid } = this.props.params;
    getSubjectBill({ billUuid, subjectUuid }).then(response => {
      const billInfo = response.data;
      billInfo.projects.map(project => {
        const planItem = billInfo.planItems.find(planItem => planItem.projectUuid == project.uuid);
        project.calcSort = planItem.calcSort;
      });
      this.setState({ loading: false, billInfo, billUuid, subjectUuid });
      // 初始化费用
      response.data.billDetail.map(x => (this.entity[x.projectCode] = x.amount));
    });
  }
  drawCreateButtons = () => {
    return (
      <Fragment>
        <Button key="cancel" onClick={this.callBack}>
          返回
        </Button>
        <Button
          key="save"
          type="primary"
          loading={this.state.saving}
          onClick={this.handleexportPlan.bind(this)}
        >
          导出
        </Button>
      </Fragment>
    );
  };
  handleChange = (key, value) => {
    if (value == '') {
      value = 0;
    }
    this.entity[key] = value;
    this.linkCalculate(key);
  };

  callBack = () => {
    const { e, dateString } = this.props.params;
    this.props.switchTab('calculation', { entityUuid: e.uuid, e, dateString });
  };

  handleexportPlan = async () => {
    await exportPlan(this.state.billUuid, this.state.subjectUuid).then(response => {
      if (response.data) {
        var option = [];
        option.fileName = '导出的费用';
        const { data } = response;

        for (const item in data) {
          if (item == 'excelName') {
            option.fileName = data[item][0].name;
            continue;
          }
          const system = [];
          for (const filed in data[item][0]) {
            system.push(filed);
          }
          const datas = {
            sheetData: data[item],
            sheetName: item,
            sheetFilter: system,
            sheetHeader: system,
          };
          if (option.datas) {
            option.datas.push(datas);
          } else {
            option.datas = [datas];
          }
        }
        const toExcel = new ExportJsonExcel(option);
        toExcel.saveExcel();
      }
    });
  };
  showView = async projectCode => {
    this.setState({ loading: true });
    await getPlanParticulars(this.state.subjectUuid, this.state.billUuid, projectCode).then(e => {
      if (e && e.success && e.data) {
        const col = [];
        const data = e.data[0];
        for (let s in data) {
          let ss = {
            title: s,
            dataIndex: s,
            width: 100,
          };
          col.push(ss);
        }
        this.setState({ dataSource: e.data, col, loading: false });
        this.setState({ isModalVisible: true, projectCode });
      } else {
        message.error('查询失败，请稍后再试');
        this.setState({ loading: false });
      }
    });
  };
  onCancel = () => {
    const { dateString, e, view } = this.props.params;
    this.props.switchTab(view ? view : 'import', {
      entityUuid: this.props.params.entityUuid,
      dateString,
      e,
    });
  };

  /**
   * 联动计算
   */
  linkCalculate = key => {
    const { projects, billDetail, planItems } = this.state.billInfo;
    const calculateProject = projects.find(x => x.code == key);
    // 筛选出费用内计算的项目
    const linkProjects = projects.filter(
      x =>
        x.formulaType == 1 &&
        x.code != key &&
        x.calcSort > calculateProject.calcSort &&
        x.sql.indexOf(calculateProject.itemName) > -1
    );
    for (const linkProject of linkProjects) {
      let sql = linkProject.sql;
      // 匹配到对应项且将其替换成值
      for (const project of projects) {
        sql = sql.replace(project.itemName, this.entity[project.code]);
      }
      // 使用动态js命令更新关联项目
      sql = 'this.entity.' + linkProject.code + '=' + sql;
      eval(sql);
      // 通知表单更新页面
      this.props.form.setFieldsValue({ [linkProject.code]: this.entity[linkProject.code] });
      // 处理其下级依赖
      this.linkCalculate(linkProject.code);
    }
  };

  onSave = async () => {
    const { billUuid, subjectUuid } = this.state;
    const response = await updateSubjectBill({ billUuid, subjectUuid, updateMap: this.entity });
    if (response.success) {
      message.success('保存成功');
      this.props.switchTab('view', { params: {} });
    }
  };

  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { billInfo } = this.state;
    let formPanel = [];
    let baseCols = [];
    if (!billInfo?.billSubject || !billInfo?.billDetail) {
      return;
    }
    // 基础资料
    for (const subject of billInfo.billSubject) {
      baseCols.push(
        <CFormItem key={subject.fieldName} label={subject.fieldTxt}>
          {getFieldDecorator(subject.fieldName, {
            initialValue: subject.fieldValue,
          })(<>{subject.fieldValue}</>)}
        </CFormItem>
      );
    }
    formPanel.push(<FormPanel key="base" title="基础资料" cols={baseCols} />);

    // 根据不同计费项类型渲染出多个panel
    for (const costType of costTypes) {
      let calcCols = [];
      for (const detail of billInfo.billDetail) {
        const project = billInfo.projects.find(project => project.uuid == detail.projectUuid);
        if (project?.type != costType.VALUE) {
          continue;
        }
        let calcComponent = null;
        // 汇总项无法修改
        // if (project.formulaType == 1) {
        //   calcComponent = (
        //     <Tooltip title={project.sql}>
        //       {getFieldDecorator(detail.projectCode, {
        //         initialValue: detail.amount,
        //         rules: [{ required: true, message: `字段不能为空` }],
        //       })(
        //         <InputNumber
        //           readOnly
        //           onChange={value => this.handleChange(detail.projectCode, value)}
        //         />
        //       )}
        //     </Tooltip>
        //   );
        // } else {
        calcComponent = getFieldDecorator(detail.projectCode, {
          initialValue: detail.amount,
        })(
          <>
            <a onClick={() => this.showView(detail.projectName)}>{detail.amount}</a>
          </>
        );
        //}
        calcCols.push(
          <CFormItem key={detail.projectCode} label={detail.projectName}>
            {calcComponent}
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
  drawTable = () => {
    return (
      <Modal
        visible={this.state.isModalVisible}
        onCancel={() => this.setState({ isModalVisible: false })}
        width={'80%'}
        bodyStyle={{ height: 'calc(75vh)', overflowY: 'auto' }} //calc(80vh)
      >
        <div style={{ marginTop: '1rem' }}>
          <StandardTable
            dataSource={this.state.dataSource}
            columns={this.state.col}
            // noPagination
            size="middle"
            colTotal={[]}
            rowClassName={(record, index) => {
              let name = '';
              if (index % 2 === 0) {
                name = styles.lightRow;
              }
              return name;
            }}
            styles
            // width="800"
          />
        </div>
      </Modal>
    );
  };

  render() {
    const { loading } = this.state;
    const { noBorder } = this.props;
    const Wrapper = noBorder ? this.NoBorderWrapper : this.PanelWrapper;
    return (
      <Spin spinning={loading}>
        <Wrapper>{this.drawForm()}</Wrapper>
      </Spin>
    );
  }
}
