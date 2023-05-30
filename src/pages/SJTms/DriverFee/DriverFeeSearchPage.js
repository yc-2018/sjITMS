/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-04-18 15:39:37
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, Popconfirm, message, Modal, Form, Input } from 'antd';
import { handleBill, handleConfirm } from '@/services/sjitms/TollFee';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import { havePermission } from '@/utils/authority';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class DriverFeeSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    showAuditPop: false,
    showRejectedModal: false,
    showCheckPop: false,
    showConfirmPop: false,
    operation: '',
  };

  handleBill = async (data, fieldsValue) => {
    if (fieldsValue == undefined) {
      fieldsValue = '';
    }
    const { operation } = this.state;
    return await handleBill(data, operation, fieldsValue.note);
  };

  handleConfirm = async data => {
    return await handleConfirm(data);
  };

  //该方法用于写中间的功能按钮 多个按钮用<span>包裹
  drawToolsButton = () => {
    const {
      showAuditPop,
      showCheckPop,
      selectedRows,
      showRejectedModal,
      showConfirmPop,
    } = this.state;
    const { getFieldDecorator } = this.props.form;

    return (
      <span>
        <Popconfirm
          title="你确定要核对所选中的内容吗?"
          visible={showCheckPop}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showCheckPop: visible });
          }}
          onCancel={() => {
            this.setState({ showCheckPop: false });
          }}
          onConfirm={() => {
            this.setState({ showCheckPop: false, operation: 'Checked' });
            this.handleBill(selectedRows[0], '').then(response => {
              if (response.success) {
                message.success('核对成功！');
                this.setState({ operation: '' });
                this.onSearch();
              }
            });
          }}
        >
          <Button
            hidden={!havePermission(this.state.authority + '.checked')}
            onClick={() => this.onBatchChecked()}
          >
            核对
          </Button>
        </Popconfirm>

        <Popconfirm
          title="你确定要审核所选中的内容吗?"
          visible={showAuditPop}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showAuditPop: visible });
          }}
          onCancel={() => {
            this.setState({ showAuditPop: false });
          }}
          onConfirm={() => {
            this.setState({ showAuditPop: false, operation: 'Approved' });
            this.handleBill(selectedRows[0], '').then(response => {
              if (response.success) {
                message.success('审核成功！');
                this.setState({ operation: '' });
                this.onSearch();
              }
            });
          }}
        >
          <Button
            hidden={!havePermission(this.state.authority + '.audits')}
            onClick={() => this.onBatchApproved()}
          >
            审批
          </Button>
        </Popconfirm>
        <Button
          hidden={!havePermission(this.state.authority + '.rejected')}
          onClick={() => this.onBatchRejected()}
        >
          驳回
        </Button>

        <Popconfirm
          title="你确定要确认所选中的内容吗?"
          visible={showConfirmPop}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showConfirmPop: visible });
          }}
          onCancel={() => {
            this.setState({ showConfirmPop: false });
          }}
          onConfirm={() => {
            this.setState({ showConfirmPop: false });
            this.handleConfirm(selectedRows[0]).then(response => {
              if (response.success) {
                message.success('确认成功！');
                this.setState({ operation: '' });
                this.onSearch();
              }
            });
          }}
        >
          <Button
            hidden={!havePermission(this.state.authority + '.confirm')}
            onClick={() => this.onBatchConfirm()}
          >
            确认
          </Button>
        </Popconfirm>

        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
        <Modal
          title="驳回申请"
          visible={showRejectedModal}
          key={selectedRows[0]}
          onOk={() => {
            this.props.form.validateFields((err, fieldsValue) => {
              if (err) {
                return;
              }
              this.handleBill(selectedRows[0], fieldsValue).then(response => {
                if (response.success) {
                  message.success('驳回成功！');
                  this.setState({ operation: '', showRejectedModal: false });
                  this.onSearch();
                }
              });
            });
          }}
          onCancel={() => {
            this.setState({ showRejectedModal: false });
          }}
        >
          <Form>
            <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 15 }} label="驳回原因">
              {getFieldDecorator('note', {})(<Input />)}
            </Form.Item>
          </Form>
        </Modal>
      </span>
    );
  };

  onBatchChecked = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    this.setState({ operation: 'Checked' });
    selectedRows.length == 1
      ? this.setState({ showCheckPop: true })
      : this.batchProcessConfirmRef.show('核对', selectedRows, this.handleBill, this.onSearch);
  };

  onBatchConfirm = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    selectedRows.length == 1
      ? this.setState({ showConfirmPop: true })
      : this.batchProcessConfirmRef.show('确认', selectedRows, this.handleConfirm, this.onSearch);
  };

  onBatchApproved = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    this.setState({ operation: 'Approved' });
    selectedRows.length == 1
      ? this.setState({ showAuditPop: true })
      : this.batchProcessConfirmRef.show('审核', selectedRows, this.handleBill, this.onSearch);
  };

  onBatchRejected = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length != 1) {
      message.warn('请选中一条数据！');
      return;
    }
    if (selectedRows[0].FEESTAT != 'Committed' && selectedRows[0].FEESTAT != 'Checked') {
      message.error('该申请当前状态不是已提交或已核对，不能驳回');
      return;
    }
    this.setState({ showRejectedModal: true });
  };

  drawcell = row => {
    if (row.column.fieldName == 'PARKINGFEE') {
      const params = {
        field: 'UUID',
        type: 'VarChar',
        rule: 'eq',
        val: row.record.UUID,
      };
      row.component =
        row.record.MAXPARKINGFEE < row.record.PARKINGFEE ? (
          <span
            style={{ padding: '0 10px', background: 'red', color: '#fff' }}
            onClick={() => this.props.onClose(params)}
          >
            {row.val}
          </span>
        ) : (
          <a onClick={() => this.props.onClose(params)}>{row.val}</a>
        );
    }
    if (row.column.fieldName == 'BILLNUMBER') {
      const params = {
        field: 'SCHEDULENUM',
        type: 'VarChar',
        rule: 'eq',
        val: row.record.BILLNUMBER,
      };
      row.component = <a onClick={() => this.props.onLogClose(params)}>{row.val}</a>;
    }
  };
}
