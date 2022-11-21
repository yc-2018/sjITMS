/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-11-15 14:40:40
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, Popconfirm, message } from 'antd';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import { havePermission } from '@/utils/authority';
import {
  vehicleApplyAudit,
  vehicleApplyRejected,
  portVehicleApply,
} from '@/services/sjitms/VehicleWeight';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class VehicleWeightSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    showAuditPop: false,
    showRejectedPop: false,
    noActionCol: true,
  };

  port = async () => {
    const { pageFilters } = this.state;
    await portVehicleApply(pageFilters);
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
    return await vehicleApplyAudit(record.UUID);
  };

  //审核
  onRejected = async record => {
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
          <Button
            onClick={() => this.onBatchAudit()}
            hidden={!havePermission(this.state.authority + '.audit')}
          >
            审核
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
            this.setState({ showRejectedPop: false });
            this.onRejected(selectedRows[0]).then(response => {
              if (response.success) {
                message.success('驳回成功！');
                this.onSearch();
              }
            });
          }}
        >
          <Button
            type="danger"
            onClick={() => this.onBatchRejected()}
            hidden={!havePermission(this.state.authority + '.rejected')}
          >
            驳回
          </Button>
          {/* <Button onClick={() => this.port()}>导出</Button> */}
        </Popconfirm>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
      </span>
    );
  };

  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    //额外的菜单选项
    const menus = [];
    menus.push({
      // disabled: !havePermission(STORE_RES.CREATE), //权限认证
      name: '测试', //功能名称
      onClick: this.test, //功能实现
    });
    return (
      <div>
        <Button
          hidden={!havePermission(this.state.authority + '.port')}
          onClick={this.port}
          type="primary"
        >
          导出
        </Button>
      </div>
    );
  };
}
