/*
 * @Author: Liaorongchang
 * @Date: 2023-09-13 11:19:08
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-11-07 15:54:09
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, Popconfirm, message } from 'antd';
import BatchProcessConfirm from '@/pages/SJTms/Dispatching/BatchProcessConfirm';
import { audit, invalid } from '@/services/bms/DriverFee';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class DriverFeeSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    showAudit: false,
    showInvalid: false,
  };

  onView = () => {};

  handleAudit = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    if (selectedRows.length == 1) {
      this.setState({ showAudit: true });
    } else {
      this.batchProcessConfirmRef.show('费用审批', selectedRows, this.audit, this.onSearch);
    }
  };

  audit = async data => {
    return await audit(data.UUID);
  };

  handleInvalid = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    if (selectedRows.length == 1) {
      this.setState({ showInvalid: true });
    } else {
      this.batchProcessConfirmRef.show('费用作废', selectedRows, this.invalid, this.onSearch);
    }
  };

  invalid = async data => {
    return await invalid(data.UUID);
  };

  handleCancel = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    if (selectedRows.length == 1) {
      this.setState({ showCancel: true });
    } else {
      this.batchProcessConfirmRef.show('费用取消', selectedRows, this.cancel, this.onSearch);
    }
  };

  cancel = async data => {
    return await cancel(data.UUID);
  };

  drawToolsButton = () => {
    const { showAudit, showInvalid, selectedRows } = this.state;
    return (
      <>
        <Popconfirm
          title="确定审核所选费用项吗?"
          visible={showAudit}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showAudit: visible });
          }}
          onCancel={() => {
            this.setState({ showAudit: false });
          }}
          onConfirm={() => {
            this.setState({ showAudit: false });
            audit(selectedRows[0].UUID).then(response => {
              if (response.success) {
                message.success('审核成功！');
                this.onSearch();
              }
            });
          }}
        >
          <Button
            onClick={() => {
              this.handleAudit();
            }}
          >
            审批
          </Button>
        </Popconfirm>

        <Popconfirm
          title="确定作废所选费用项吗?"
          visible={showInvalid}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showInvalid: visible });
          }}
          onCancel={() => {
            this.setState({ showInvalid: false });
          }}
          onConfirm={() => {
            this.setState({ showInvalid: false });
            invalid(selectedRows[0].UUID).then(response => {
              if (response.success) {
                message.success('作废成功！');
                this.onSearch();
              }
            });
          }}
        >
          <Button
            type="danger"
            onClick={() => {
              this.handleInvalid();
            }}
          >
            作废
          </Button>
        </Popconfirm>

        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
      </>
    );
  };

  drawcell = row => {
    // if (row.column.fieldName == 'BILL_NUMBER') {
    //   const params = {
    //     field: 'SCHEDULENUM',
    //     type: 'VarChar',
    //     rule: 'eq',
    //     val: row.record.BILL_NUMBER
    //     ,
    //   };
    //   row.component = <a onClick={() => {console.log("cccc");}}>{row.val}</a>;
    // }
  };
}
