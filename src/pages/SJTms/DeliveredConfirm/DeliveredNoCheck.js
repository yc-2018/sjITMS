import React, { PureComponent } from 'react';
import { Button, Form, message, Modal, Popconfirm } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { confirmOrder } from '@/services/sjtms/DeliveredConfirm';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import NocheckForm from './NoCheckForm';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import { calculateMemberWage } from '@/services/cost/CostCalculation';
@connect(({ quick, deliveredConfirm, loading }) => ({
  quick,
  deliveredConfirm,
  loading: loading.models.quick,
}))
@Form.create()
export default class DeliveredNoCheck extends QuickFormSearchPage {
  state = {
    ...this.state,
    tableHeight: 388.1,
    isNotHd: true,
    pageData: [],
    reasonModalVisible: false,
    deliveredDutyMdodalVisible: false,
    nocheckInfoVisible: false,
    checkRejectionResendMdodalVisible: false,
    batchLoading:false
  };

  exSearchFilter = () => {
    if (this.props.pageFilters) {
      return this.props.pageFilters.queryParams;
    }
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.pageFilters != this.props.pageFilters) {
      this.onSearch(nextProps.pageFilters);
    }
  }

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
        {this.CreateUnDeliveredDuty()}
        {this.checkRejections()}
        {this.nocheckInfo()}
      </>
    );
  };

  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {
    return (
      <div style={{ marginBottom: 10 }}>
        <Button onClick={this.checkAttribution} style={{ marginLeft: 10 }}>
          批量设置责任归属
        </Button>
        <Button style={{ marginLeft: 10 }} onClick={this.checkRejectionResend}>
          批量设置未送达类型
        </Button>

        <Button onClick={this.checkReason} style={{ marginLeft: 10 }}>
          批量设置未送达原因
        </Button>
        <Popconfirm
          title="确定保存?"
          onConfirm={this.checkSave}
          okText="确定"
          cancelText="取消"
          style={{ marginLeft: 10 }}
        >
          <Button loading = {this.state.batchLoading} type={'primary'} style={{ marginLeft: 10 }}>
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

  //批量设置原因
  checkReason = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选择记录');
      return;
    }
    this.setState({ reasonModalVisible: true });
  };

  //批量未送达类型
  checkAttribution = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选择记录');
      return;
    }
    this.setState({ deliveredDutyMdodalVisible: true });
  };
  //批量未送达类型
  checkRejectionResend = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选择记录');
      return;
    }
    this.setState({ checkRejectionResendMdodalVisible: true });
  };
  //批量保存
  checkSave = async () => {
   
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选择记录');
    }
    if (this.checkValue(selectedRows)) {
      return false;
    }
    this.setState({batchLoading:true})
    this.props.dispatch({
      type: 'deliveredConfirm1/updateNoDelivered',
      payload: selectedRows,
      callback: response => {
        if (response && response.success) {
          this.refreshTable();
          message.success('更新成功');
          this.setState({batchLoading:false})
          this.calculate(selectedRows);
        }
      },
    });
  };

  calculate = async selectedRows => {
    await calculateMemberWage(selectedRows[0].SCHEDULEBILLNUMBER);
  };

  checkValue = selectedRows => {
    let flag = false;
    selectedRows.forEach(e => {
      if (!e.UNDELIVEREDTYPE) {
        message.info('未送达类型存在空值请检查');
        flag = true;
        return;
      }
      if (!e.UNDELIVEREDREASON) {
        message.info('未送达原因存在空值请检查');
        flag = true;
        return;
      }
      if (!e.UNDELIVEREDDUTY) {
        message.info('未送达责任归属存在空值请检查');
        flag = true;
        return;
      }
    });
    return flag;
  };
  deliveredChage = (records, colum, e) => {
    records[colum.fieldName] = e.value;
  };

  checkRejections = () => {
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

    const CheckRejections = Form.create()(props => {
      const { dispatch, form } = props;
      const { getFieldDecorator } = form;
      const handleSubmitReason = () => {
        const { selectedRows, data } = this.state;
        form.validateFields((errors, fieldsValue) => {
          if (errors && errors.UNDELIVEREDTYPE) return;
          // let rows = selectedRows.map(row=>{
          //   return {
          //     UNDELIVEREDREASON:fieldsValue.UNDELIVEREDREASON.record.VALUE,
          //     UUID:row["UUID"]
          //   }
          // });
          selectedRows.forEach(e => (e.UNDELIVEREDTYPE = fieldsValue.UNDELIVEREDTYPE.record.VALUE));
          message.success('设置成功！');
          //this.checkSave();
          this.setState({
            checkRejectionResendMdodalVisible: !this.state.checkRejectionResendMdodalVisible,
          });
        });
      };
      return (
        <Modal
          visible={this.state.checkRejectionResendMdodalVisible}
          onCancel={() => this.onBatchSetReasonVisible(false)}
          onOk={handleSubmitReason}
          title={'批量设置未送达类型'}
        >
          <Form {...formItemLayout}>
            <Form.Item label={'未送达类型'}>
              {getFieldDecorator('UNDELIVEREDTYPE', {
                initialValue: undefined,
                rules: [{ required: true, message: '未送达类型不能为空' }],
              })(
                <SimpleAutoComplete
                  dictCode="UnDeliveredType"
                  valueField="VALUE"
                  textField="NAME"
                />
              )}
            </Form.Item>
          </Form>
        </Modal>
      );
    });

    return <CheckRejections />;
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
          message.success('设置成功！');
          //this.checkSave();
          this.setState({ reasonModalVisible: !this.state.reasonModalVisible });
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
          if (errors && errors.UnDeliveredDuty) return;

          selectedRows.forEach(e => (e.UNDELIVEREDDUTY = fieldsValue.UnDeliveredDuty.record.VALUE));
          //this.checkSave();
          message.success('设置成功！');
          this.setState({
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
    this.setState({ checkRejectionResendMdodalVisible: false });
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
