/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-07-20 09:35:04
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, Popconfirm, message } from 'antd';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import { audit } from '@/services/sjitms/ShippingOrder';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ShippingOrderSearchPage extends QuickFormSearchPage {
  state = { ...this.state, showAuditPop: false };

  onUpdate = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 0) {
      if (selectedRows[0].CHECKSTUTA == 1) {
        message.error('该托运单已审核，不能编辑');
        return;
      }
      const { onlFormField } = this.props;
      var field = onlFormField[0].onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
      this.props.switchTab('update', {
        entityUuid: selectedRows[0][field],
      });
    } else {
      message.error('请至少选中一条数据！');
    }
  };

  onBatchAudit = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    selectedRows.length == 1
      ? this.setState({ showAuditPop: true })
      : this.batchProcessConfirmRef.show('审核', selectedRows, this.onAudit, this.queryCoulumns);
  };

  onAudit = async selectedRows => {
    return await audit(selectedRows.UUID);
  };

  drawToolbarPanel = () => {
    const { showAuditPop, selectedRows } = this.state;
    return (
      <span>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
        <Popconfirm
          title="你确定要审核所选中的内容吗?"
          visible={showAuditPop}
          onCancel={() => {
            this.setState({ showAuditPop: false });
          }}
          onConfirm={() => {
            this.setState({ showAuditPop: false });
            this.onAudit(selectedRows[0]).then(response => {
              if (response && response.success) {
                message.success('审核成功！');
                this.queryCoulumns();
              }
            });
          }}
        >
          <Button onClick={() => this.onBatchAudit()}>审核</Button>
        </Popconfirm>
      </span>
    );
  };
}
