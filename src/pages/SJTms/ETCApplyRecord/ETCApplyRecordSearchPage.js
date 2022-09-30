/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-09-30 15:36:11
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import { Popconfirm, Button, message } from 'antd';
import { approval, rejected } from '@/services/sjitms/ETCIssueAndRecycle';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ETCApplyRecordSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    approval: false,
    rejected: false,
  };

  //申请发卡
  approval = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    selectedRows.length == 1
      ? this.setState({ approval: true })
      : this.batchProcessConfirmRef.show(
          '批准发卡',
          selectedRows,
          this.handleApproval,
          this.onSearch
        );
  };

  handleApproval = async selectedRow => {
    return await approval(selectedRow.UUID);
  };

  //驳回发卡
  rejected = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    selectedRows.length == 1
      ? this.setState({ rejected: true })
      : this.batchProcessConfirmRef.show(
          '驳回申请',
          selectedRows,
          this.handleRejected,
          this.onSearch
        );
  };

  handleRejected = async selectedRow => {
    return await rejected(selectedRow.UUID);
  };

  drawToolsButton = () => {
    const { approval, rejected, selectedRows } = this.state;
    return (
      <span>
        <Popconfirm
          title="确认批准?"
          visible={approval}
          onVisibleChange={visible => {
            if (!visible) this.setState({ approval: visible });
          }}
          onCancel={() => {
            this.setState({ approval: false });
          }}
          onConfirm={() => {
            this.setState({ approval: false });
            this.handleApproval(selectedRows[0]).then(response => {
              if (response.success) {
                message.success('批准成功！');
                this.onSearch();
              }
            });
          }}
        >
          <Button onClick={() => this.approval()}>批准</Button>
        </Popconfirm>

        <Popconfirm
          title="确认驳回?"
          visible={rejected}
          onVisibleChange={visible => {
            if (!visible) this.setState({ rejected: visible });
          }}
          onCancel={() => {
            this.setState({ rejected: false });
          }}
          onConfirm={() => {
            this.setState({ rejected: false });
            this.handleRejected(selectedRows[0]).then(response => {
              if (response.success) {
                message.success('驳回成功！');
                this.onSearch();
              }
            });
          }}
        >
          <Button onClick={() => this.rejected()}>驳回</Button>
        </Popconfirm>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
      </span>
    );
  };
}
