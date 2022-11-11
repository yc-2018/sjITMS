/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-11-11 14:40:17
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, Popconfirm, message } from 'antd';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import { vehicleApplyAudit, vehicleApplyRejected } from '@/services/sjitms/ScheduleBill';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class VehicleWeightSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    showAuditPop: false,
    showRejectedPop: false,
  };

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

  onBatchRejected = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    selectedRows.length == 1
      ? this.setState({ showRejectedPop: true })
      : this.batchProcessConfirmRef.show('驳回', selectedRows, this.onRejected, this.onSearch);
  };

  //审核
  onAudit = async record => {
    // console.log('record', record);
    return await vehicleApplyAudit(record.UUID);
  };

  //审核
  onRejected = async record => {
    // console.log('record', record);
    return await vehicleApplyRejected(record.UUID);
  };

  drawToolsButton = () => {
    const { showAuditPop, showRejectedPop, selectedRows } = this.state;
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
          title="你确定要驳回所选中的内容吗?"
          visible={showRejectedPop}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showRejectedPop: visible });
          }}
          onCancel={() => {
            this.setState({ showRejectedPop: false });
          }}
          onConfirm={() => {
            this.setState({ showRejectedPop: false });
            this.onRejected(selectedRows[0]).then(response => {
              if (response.success) {
                message.success('驳回成功！');
                this.onSearch();
              }
            });
          }}
        >
          <Button type="danger" onClick={() => this.onBatchRejected()}>
            驳回
          </Button>
        </Popconfirm>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
      </span>
    );
  }; //扩展中间功能按钮
}
