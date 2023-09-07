/*
 * @Author: Liaorongchang
 * @Date: 2023-08-08 17:06:51
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-09-07 18:08:31
 * @version: 1.0
 */
import React from 'react';
import { Form, Button, Modal, Popconfirm, Table, Badge } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import CostBillViewForm from '@/pages/NewCost/CostBill/CostBillViewForm';
import StandardTable from '@/pages/Component/RapidDevelopment/CommonLayout/RyzeStandardTable/index';
import { createChildBill } from '@/services/cost/CostBill';
///CommonLayout/RyzeStandardTable
@connect(({ quick, deliveredConfirm, loading }) => ({
  quick,
  deliveredConfirm,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
@Form.create()
export default class CostBillSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    selectCords: [],
    billState: [],
    e: {},
    showCreate: false,
    isExMerge: true,
  };

  onView = record => {};

  drawToolsButton = () => {
    const { showCreate, selectedRows } = this.state;
    return (
      <Popconfirm
        title="确定要生成所选账单的子帐单吗?"
        visible={showCreate}
        onVisibleChange={visible => {
          if (!visible) this.setState({ showCreate: visible });
        }}
        onCancel={() => {
          this.setState({ showCreate: false });
        }}
        onConfirm={() => {
          this.setState({ showCreate: false });
          createChildBill(selectedRows[0].UUID);
          // this.handleCancelIssue(selectedRows[0]).then(response => {
          //   if (response.success) {
          //     message.success('取消成功！');
          //     this.onSearch();
          //   }
          // });
        }}
      >
        <Button type="primary" onClick={() => this.handleChildBill()}>
          子帐单生成
        </Button>
      </Popconfirm>
    );
  };

  handleChildBill = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    this.setState({ showCreate: true });
  };

  exSearchFilter = () => {
    return [
      {
        field: 'PLAN_UUID',
        type: 'VarChar',
        rule: 'eq',
        val: this.props.params.entityUuid,
      },
    ];
  };

  drawcell = e => {
    //找到fieldName为CODE这一列 更改它的component
    if (e.column.fieldName == 'BILL_NUMBER') {
      const component = <a onClick={() => this.checkDtl(e)}>{e.record.BILL_NUMBER}</a>;
      e.component = component;
    }
  };

  checkDtl = e => {
    this.setState({ isModalVisible: true, e });
  };

  handleOk = () => {
    this.setState({ isModalVisible: false });
  };

  handleCancel = () => {
    this.setState({ isModalVisible: false });
  };

  //绘制子表格
  expandedRowRender = (record, index) => {
    const { selectedRows, key, childSelectedRows } = this.state;
    const columns = [
      { title: 'Date', dataIndex: 'date', key: 'date' },
      { title: 'Name', dataIndex: 'name', key: 'name' },
      {
        title: 'Status',
        key: 'state',
        dataIndex: 'state',
      },
      { title: 'Upgrade Status', dataIndex: 'upgradeNum', key: 'upgradeNum' },
      { title: 'Cc', dataIndex: 'cc', key: 'cc' },
    ];

    const data = [];
    for (let i = 0; i < 50; ++i) {
      data.push({
        key: i,
        date: '2014-12-24 23:12:00',
        name: 'This is production name',
        state: 'finish',
        upgradeNum: 'Upgraded: 56',
        cc: '1',
      });
    }
    return (
      <div>
        <StandardTable
          // settingClass={{
          //   display: 'flex',
          //   justifyContent: 'flex-end',
          //   width: '10%',
          //   marginTop: '0',
          //   marginBottom: '5px',
          //   marginLeft: '90%',
          // }}
          selectRowKeys={childSelectedRows}
          handleRowSelectChange={this.handleChildRowSelectChange}
          handleChildRowSelectChange={this.handleChildRowSelectChange}
          // onView={this.onView}
          rowSelection={this.state.rowSelection}
          quickuuid={this.props.quickuuid + 'ex'}
          minHeight={this.state.minHeight}
          colTotal={[]}
          unShowRow={this.state.unShowRow ? this.state.unShowRow : false}
          onRow={this.handleOnRow}
          rowKey={record => record.uuid}
          hasSettingColumns={
            this.state.hasSettingColumns == undefined ? true : this.state.hasSettingColumns
          }
          selectedRows={selectedRows}
          // loading={tableLoading}
          tableHeight={this.state.tableHeight}
          data={data}
          columns={columns}
          noPagination={false}
          newScroll={{ x: false, y: false }}
          onSelectRow={this.handleSelectRows}
          onChange={this.handleStandardTableChange}
          comId={key + 'ex'}
          rest={this.state.rest}
          // rowClassName={(record, index) => {
          //   if (record.clicked) {
          //     return styles.clickedStyle;
          //   }
          //   if (record.errorStyle) {
          //     return styles.errorStyle;
          //   }
          //   if (this.setrowClassName(record, index)) {
          //     return this.setrowClassName(record, index);
          //   }
          //   if (index % 2 === 0) {
          //     return styles.lightRow;
          //   }
          // }}
          noActionCol={this.state.noActionCol}
          canDrag={this.state.canDragTable}
          pageSize={sessionStorage.getItem('searchPageLine')}
          noToolbarPanel={
            !this.state.noToolbar && this.drawToolbarPanel && this.drawToolbarPanel() ? false : true
          }
          drapTableChange={this.drapTableChange}
          handleRowClick={this.handleRowClick}
          isRadio={this.state.isRadio}
          RightClickMenu={this.drawRightClickMenus()}
          isMerge={false}
        />
      </div>
    );
  };

  // //绘制上方按钮
  drawActionButton = () => {
    const { isModalVisible, e } = this.state;
    return (
      <>
        <Button
          onClick={() => {
            this.props.switchTab('query');
          }}
        >
          返回
        </Button>
        <Modal
          visible={isModalVisible}
          onOk={this.handleOk.bind()}
          onCancel={this.handleCancel.bind()}
          width={'90%'}
          bodyStyle={{ height: 'calc(82vh)', overflowY: 'auto' }}
        >
          <CostBillViewForm
            key={e.val}
            showPageNow="query"
            quickuuid="123"
            {...e}
            {...this.props}
            location={{ pathname: '1' }}
          />
        </Modal>
      </>
    );
  };
}
