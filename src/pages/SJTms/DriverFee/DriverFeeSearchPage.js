/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-10-26 16:04:34
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, Popconfirm, message, Steps } from 'antd';
import { handleBill } from '@/services/sjitms/TollFee';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import { havePermission } from '@/utils/authority';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class DriverFeeSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    showAuditPop: false,
    showRejectedPop: false,
    showCheckPop: false,
    operation: '',
  };

  handleBill = async data => {
    const { operation } = this.state;
    return await handleBill(data, operation);
  };

  //该方法用于写中间的功能按钮 多个按钮用<span>包裹
  drawToolsButton = () => {
    const { showAuditPop, showCheckPop, selectedRows, showRejectedPop } = this.state;

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
            this.handleBill(selectedRows[0]).then(response => {
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
            this.handleBill(selectedRows[0]).then(response => {
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
        <Popconfirm
          title="你确定要驳回所选中的内容吗?"
          visible={showRejectedPop}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showRejectedPop: visible });
          }}
          onCancel={() => {
            this.setState({ showRejectedPop: false });
          }}
          onConfirm={() => {
            this.setState({ showRejectedPop: false, operation: 'Rejected' });
            this.handleBill(selectedRows[0]).then(response => {
              if (response.success) {
                message.success('驳回成功！');
                this.setState({ operation: '' });
                this.onSearch();
              }
            });
          }}
        >
          <Button
            hidden={!havePermission(this.state.authority + '.rejected')}
            onClick={() => this.onBatchRejected()}
          >
            驳回
          </Button>
        </Popconfirm>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
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
      : this.batchProcessConfirmRef.show(
          '核对',
          selectedRows,
          this.approvedOrRejected,
          this.onSearch
        );
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
      : this.batchProcessConfirmRef.show(
          '审核',
          selectedRows,
          this.approvedOrRejected,
          this.onSearch
        );
  };

  onBatchRejected = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    this.setState({ operation: 'Rejected' });
    selectedRows.length == 1
      ? this.setState({ showRejectedPop: true })
      : this.batchProcessConfirmRef.show(
          '驳回',
          selectedRows,
          this.approvedOrRejected,
          this.onSearch
        );
  };

  drawcell = e => {
    if (e.column.fieldName == 'PARKINGFEE') {
      const component = <a onClick={() => this.props.onClose(e.record.UUID)}>{e.val}</a>;
      e.component = component;
    }
  };
}
