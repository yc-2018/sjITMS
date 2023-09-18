import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, Popconfirm, message } from 'antd';
import BatchProcessConfirm from '@/pages/SJTms/Dispatching/BatchProcessConfirm';
import { audit, aborted } from '@/services/cost/CostPlan';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class CostPlanApplySearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    showAuditPop: false,
    showAbortedPop: false,
  };

  onView = () => {};

  //批量审核（多选）
  onBatchAudit = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    selectedRows.length == 1
      ? this.setState({ showAuditPop: true })
      : this.batchProcessConfirmRef.show('审核', selectedRows, this.onAudit, this.onSearch);
  };

  //审核
  onAudit = async record => {
    return await audit(record.UUID);
  };

  //批量作废（多选）
  onBatchAborted = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    selectedRows.length == 1
      ? this.setState({ showAbortedPop: true })
      : this.batchProcessConfirmRef.show('作废', selectedRows, this.onAborted, this.onSearch);
  };

  //作废
  onAborted = async record => {
    return await aborted(record.UUID);
  };

  drawToolsButton = () => {
    const { showAuditPop, showAbortedPop, selectedRows } = this.state;
    return (
      <>
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
            this.setState({ showAuditPop: false });
            this.onAudit(selectedRows[0]).then(response => {
              if (response.success) {
                message.success('审核成功！');
                this.onSearch();
              }
            });
          }}
        >
          <Button onClick={() => this.onBatchAudit()}>审核</Button>
        </Popconfirm>
        <Popconfirm
          title="你确定要作废所选中的内容吗?"
          visible={showAbortedPop}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showAbortedPop: visible });
          }}
          onCancel={() => {
            this.setState({ showAbortedPop: false });
          }}
          onConfirm={() => {
            this.setState({ showAbortedPop: false });
            this.onAborted(selectedRows[0]).then(response => {
              if (response.success) {
                message.success('作废成功！');
                this.onSearch();
              }
            });
          }}
        >
          <Button onClick={() => this.onBatchAborted()}>作废</Button>
        </Popconfirm>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
      </>
    );
  };
}
