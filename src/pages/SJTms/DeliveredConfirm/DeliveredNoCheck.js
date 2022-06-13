import React, { PureComponent } from 'react';
import { Button, Form, message, Select, Modal, Popconfirm } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { confirmOrder } from '@/services/sjtms/DeliveredConfirm';
import Result from '@/components/Result';
import { res } from '@/pages/In/Move/PlaneMovePermission';
import { queryIdleAndThisPostionUseing } from '@/services/facility/Container';
import { loginOrg, loginCompany, loginUser } from '@/utils/LoginContext';
import NocheckForm from './NoCheckForm';
import {
  SimpleTreeSelect,
  SimpleSelect,
  SimpleRadio,
  SimpleAutoComplete,
} from '@/pages/Component/RapidDevelopment/CommonComponent';
import SelfTackShipSearchForm from '@/pages/Tms/SelfTackShip/SelfTackShipSearchForm';
@connect(({ quick, deliveredConfirm, loading }) => ({
  quick,
  deliveredConfirm,
  loading: loading.models.quick,
}))
@Form.create()
export default class DeliveredNoCheck extends QuickFormSearchPage {
  state = {
    ...this.state,
    tableHeight: 500,
    isNotHd: true,
    pageData: [],
    reasonModalVisible: false,
    deliveredDutyMdodalVisible: false,
    nocheckInfoVisible: false,
  };

  exSearchFilter = () => {
    let flatt = this.props.pageFilters;
    return flatt;
  };

  drawcell = e => {
    //找到fieldName为CODE这一列 更改它的component
    if (e.column.fieldName == 'UNDELIVEREDDUTY') {
      const component = (
        <SimpleAutoComplete
          style={{ width: 100 }}
          dictCode={'UnDeliveredDuty'}
          value={e.record.UNDELIVEREDDUTY}
          onChange={this.deliveredChage.bind(this, e.record, e.column)}
        />
      );
      e.component = component;
    }
    if (e.column.fieldName == 'UNDELIVEREDTYPE') {
      const component = (
        <SimpleAutoComplete
          style={{ width: 100 }}
          dictCode={'UnDeliveredType'}
          value={e.record.UNDELIVEREDTYPE}
          onChange={this.deliveredChage.bind(this, e.record, e.column)}
        />
      );
      e.component = component;
    }
    if (e.column.fieldName == 'UNDELIVEREDREASON') {
      const component = (
        <SimpleAutoComplete
          dictCode={'UndeliveredReason'}
          style={{ width: 100 }}
          value={e.record.UNDELIVEREDREASON}
          onChange={this.deliveredChage.bind(this, e.record, e.column)}
        />
      );
      e.component = component;
    }
  };

  //该方法会覆盖所有的上层按钮
  drawActionButton = () => {
    return (
      <>
        {this.CreateFormReason()}
        {this.CreateUnDeliveredDuty(0)}
        {this.nocheckInfo()}
      </>
    );
  };

  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {
    return (
      <div style={{ marginBottom: 10 }}>
        <Popconfirm title="确定重送?" onConfirm={this.checkResend} okText="确定" cancelText="取消">
          <Button>批量重送</Button>
        </Popconfirm>
        <Popconfirm
          title="确定拒收?"
          onConfirm={this.checkRejection}
          okText="确定"
          cancelText="取消"
        >
          <Button style={{ marginLeft: 10 }}>批量拒收</Button>
        </Popconfirm>

        <Button onClick={this.checkReason} style={{ marginLeft: 10 }}>
          批量设置原因
        </Button>
        <Button onClick={this.checkAttribution} style={{ marginLeft: 10 }}>
          批量设置责任归属
        </Button>
        <Popconfirm
          title="确定保存?"
          onConfirm={this.checkSave}
          okText="确定"
          cancelText="取消"
          style={{ marginLeft: 10 }}
        >
          <Button type={'primary'} style={{ marginLeft: 10 }}>
            批量保存
          </Button>
        </Popconfirm>
      </div>
    );
  };
  //未送达原因管理
  checkNoReason = () => {
    this.setState({ nocheckInfoVisible: true });
  };
  //重送
  checkResend = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选择记录');
    }
    selectedRows.forEach(e => {
      e.UNDELIVEREDTYPE = 'ReSend';
    });
    this.setState({ selectedRows });
  };
  //拒收
  checkRejection = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选择记录');
    }
    selectedRows.forEach(e => (e.UNDELIVEREDTYPE = 'Reject'));
    this.setState({ selectedRows });
  };

  //批量设置原因
  checkReason = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选择记录');
    }
    this.setState({ reasonModalVisible: true });
  };

  //批量未送达类型
  checkAttribution = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选择记录');
    }
    this.setState({ deliveredDutyMdodalVisible: true });
  };
  deliveredChage = (records, colum, e) => {
    records[colum.fieldName] = e.value;
  };
  CreateFormReason = () => {
    const formItemLayout = {
      labelCol: {
        xs: { span: 48 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 48 },
        sm: { span: 10 },
      },
    };

    const CreateFormReason = Form.create()(props => {
      const { dispatch, form } = props;
      const { getFieldDecorator } = form;
      const handleSubmitReason = () => {
        const { selectedRows, data } = this.state;
        form.validateFields((errors, fieldsValue) => {
          console.log('errors', fieldsValue);
          if (errors && errors.UnDeliveredDuty) return;
          // let rows = selectedRows.map(row=>{
          //   return {
          //     UNDELIVEREDREASON:fieldsValue.UNDELIVEREDREASON.record.VALUE,
          //     UUID:row["UUID"]
          //   }
          // });
          selectedRows.forEach(
            e => (e.UNDELIVEREDREASON = fieldsValue.UNDELIVEREDREASON.record.VALUE)
          );
          this.setState({ selectedRows, reasonModalVisible: !this.state.reasonModalVisible });
          // this.props.dispatch({
          //     type: 'deliveredConfirm1/updateNoDelivered',
          //     payload: rows,
          //     callback:response=>{
          //         console.log("response",response);
          //       if(response&&response.success){
          //         this.refreshTable();
          //         message.success("更新成功");
          //         this.setState({
          //           reasonModalVisible:!this.state.reasonModalVisible
          //           })
          //       }
          //     }
          //   })
        });
      };
      return (
        <Modal
          visible={this.state.reasonModalVisible}
          onCancel={() => this.onBatchSetReasonVisible(false)}
          onOk={handleSubmitReason}
          title={'批量设置原因'}
        >
          <Form {...formItemLayout}>
            <Form.Item label={'未送达原因'}>
              {getFieldDecorator('UNDELIVEREDREASON', {
                initialValue: undefined,
                rules: [{ required: true, message: '未送达原因不能为空' }],
              })(
                <SimpleAutoComplete
                  dictCode="UndeliveredReason"
                  valueField="VALUE"
                  textField="NAME"
                />
              )}
            </Form.Item>
          </Form>
        </Modal>
      );
    });

    return <CreateFormReason />;
  };
  nocheckInfo = () => {
    return (
      <Modal
        width={'auto'}
        height={'auto'}
        footer={null}
        style={{ overflow: 'auto' }}
        visible={this.state.nocheckInfoVisible}
        onCancel={() => this.setState({ nocheckInfoVisible: false })}
        title={'未送达原因管理'}
      >
        <NocheckForm quickuuid="sj_pretype" location={{ pathname: window.location.pathname }} />
      </Modal>
    );
  };
  //批量设置责任归属
  CreateUnDeliveredDuty = () => {
    const formItemLayout = {
      labelCol: {
        xs: { span: 48 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 48 },
        sm: { span: 10 },
      },
    };

    const CreateFormReason = Form.create()(props => {
      const { dispatch, form } = props;
      const { getFieldDecorator } = form;
      const handleSubmitReason = () => {
        const { selectedRows } = this.state;
        form.validateFields((errors, fieldsValue) => {
          console.log('errors', fieldsValue);
          if (errors && errors.UnDeliveredDuty) return;

          selectedRows.forEach(e => (e.UNDELIVEREDDUTY = fieldsValue.UnDeliveredDuty.record.VALUE));
          this.setState({
            selectedRows,
            deliveredDutyMdodalVisible: !this.state.deliveredDutyMdodalVisible,
          });
        });
      };
      return (
        <Modal
          visible={this.state.deliveredDutyMdodalVisible}
          onCancel={() => this.onBatchSetReasonVisible(false)}
          onOk={handleSubmitReason}
          title={'批量设置责任归属'}
        >
          <Form {...formItemLayout}>
            <Form.Item label={'责任归属'}>
              {getFieldDecorator('UnDeliveredDuty', {
                initialValue: undefined,
                rules: [{ required: true, message: '责任归属不能为空' }],
              })(
                <SimpleAutoComplete
                  dictCode="UnDeliveredDuty"
                  valueField="VALUE"
                  textField="NAME"
                />
              )}
            </Form.Item>
          </Form>
        </Modal>
      );
    });

    return <CreateFormReason />;
  };

  onBatchSetReasonVisible = () => {
    this.setState({ reasonModalVisible: false });
    this.setState({ deliveredDutyMdodalVisible: false });
  };

  //保存
  checkSave = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选择记录');
    }
    this.props.dispatch({
      type: 'deliveredConfirm1/updateNoDelivered',
      payload: this.state.selectedRows,
      callback: response => {
        console.log('response', response);
        if (response && response.success) {
          this.refreshTable();
          message.success('更新成功');
        }
      },
    });
  };

  checkAndSave = async () => {
    const { selectedRows } = this.state;
    selectedRows.forEach(e => {
      e.companyUuid = loginCompany().uuid;
      e.dispatchCenterUuid = loginOrg().uuid;
    });
    await confirmOrder(selectedRows).then(result => {
      if (result && result.success) {
        this.refreshTable();
        message.success('保存成功');
      }
    });
  };
}
