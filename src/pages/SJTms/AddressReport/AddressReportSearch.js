// 门店地图里面的审核
import React from 'react';
import { Button, message, Form } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { audit, voided } from '@/services/sjitms/AddressReport'
import QuickFormModal from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormModal';
import BatchProcessConfirm from '@/pages/SJTms/Dispatching/BatchProcessConfirm'

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
// 继承QuickFormSearchPage Search页面扩展
@Form.create()
export default class AddressReportSearch extends QuickFormSearchPage {
  state = {
    ...this.state,
    isNotHd: true,
    isRadio: true,
  };
  batchProcessConfirmRef = React.createRef();

  handleRowClick = e => {
    this.props.showStoreByReview(e);
  };

  onUpload = () => {
    this.props.switchTab('import');
  };

  drawSearchPanel = () => {};

  audits = async () => {
    const { selectedRows } = this.state;
    if (selectedRows.length === 0) return message.error('请选中一条记录');

    const result = await audit(selectedRows.map(e => e.UUID));
    if (result.success) {
      message.success('审核成功！');
      this.onSearch();
    }
  };

  drawToolbarPanel = () => {
    const { selectedRows } = this.state
    return (
      <>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)}/>
        {/* <Popconfirm */}
        {/*  placement="top" */}
        {/*  title="确认审核？" */}
        {/*  onConfirm={() => this.audits()} */}
        {/*  okText="是" */}
        {/*  cancelText="否" */}
        {/* > */}
        {/*  <Button type="primary">审核</Button> */}
        {/* </Popconfirm> */}
        <Button
          onClick={() => {
            if (selectedRows.length === 0) return message.error('请选择一条及以上审核项')
            // 全部都要是待审核状态
            if (selectedRows.some(i => i.STATNAME !== '待审核'))
              return message.error(`${selectedRows.find(i => i.STATNAME !== '待审核').STATNAME}状态不能审核`)
            this.batchProcessConfirmRef.show('审核', selectedRows, x => audit(x.UUID), this.onSearch,
              <b style={{ color: 'red' }}>请认真检查经纬度！以免后续司机找不到门店位置！</b>)
          }}
        >
          审核
        </Button>

        {/* <Popconfirm */}
        {/*   placement="top" */}
        {/*   title="确认作废？" */}
        {/*   onConfirm={() => this.cancellation()} */}
        {/*   okText="是" */}
        {/*   cancelText="否" */}
        {/* > */}
        {/*   <Button type="danger">作废</Button> */}
        {/* </Popconfirm> */}
        <Button
          onClick={() => {
            if (selectedRows.length === 0) return message.error('请选择一条及以上要作废的项')
            if (selectedRows.some(i => i.STATNAME !== '待审核'))
              return message.error(`${selectedRows.find(i => i.STATNAME !== '待审核').STATNAME}状态不能作废`)
            this.batchProcessConfirmRef.show('作废', selectedRows, x => voided(x.UUID), this.onSearch)
          }}
        >
          作废
        </Button>
        <Button type="primary" onClick={() => this.historyRef.show()}>
          历史记录
        </Button>
        <Button type="primary" onClick={() => this.refreshTable()}>
          刷新
        </Button>
        <QuickFormModal
          quickuuid="v_itms_store_address_report"
          onRef={e => (this.historyRef = e)}
        />
      </>)
  }
  
  /**
   * 编辑界面
   */
  onUpdate = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 0 && selectedRows[0].STAT === 'Saved') {
      const { onlFormField } = this.props;
      const field = onlFormField[0].onlFormFields.find(x => x.dbIsKey)?.dbFieldName
      this.props.switchTab('update', {
        entityUuid: selectedRows[0][field],
      });
    } else {
      message.error('请至少选中一条数据或该单据状态不是保存状态，不能修改');
    }
  };

}
