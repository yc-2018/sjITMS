/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-10-22 11:07:46
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, Popconfirm, message, Steps } from 'antd';
import { approvedOrRejected } from '@/services/sjitms/TollFee';
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
    operation: '',
  };

  approvedOrRejected = async data => {
    const { operation } = this.state;
    return await approvedOrRejected(data, operation);
  };

  //该方法用于写中间的功能按钮 多个按钮用<span>包裹
  drawToolsButton = () => {
    const { showAuditPop, selectedRows, showRejectedPop } = this.state;

    return (
      <span>
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
            this.approvedOrRejected(selectedRows[0]).then(response => {
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
            this.approvedOrRejected(selectedRows[0]).then(response => {
              if (response.success) {
                message.success('驳回成功！');
                this.setState({ operation: '' });
                this.onSearch();
              }
            });
          }}
        >
          <Button
            hidden={!havePermission(this.state.authority + '.audits')}
            onClick={() => this.onBatchRejected()}
          >
            驳回
          </Button>
        </Popconfirm>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
      </span>
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
