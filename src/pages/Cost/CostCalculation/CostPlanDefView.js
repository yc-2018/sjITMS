/*
 * @Author: Liaorongchang
 * @Date: 2022-06-10 09:30:40
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-06-15 16:05:59
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Fragment } from 'react';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { Route, Switch } from 'react-router-dom';
import QuickViewPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickViewPage';
import { message, Modal, Button } from 'antd';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import CostProjectCreate from '@/pages/Cost/CostProject/CostProjectCreate';
import BasicSourceDataSearchPage from '@/pages/Cost/BasicSource/BasicSourceDataSearchPage';
import { dynamicQuery } from '@/services/quick/Quick';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//View界面扩展
export default class CostPlanDefView extends QuickViewPage {
  state = {
    ...this.state,
    noActionCol: false,
    notNote: false,
    modalParam: {},
    isModalVisible: false,
    dataSource: [],
  }; // noActionCol: false

  onBack = () => {
    this.props.switchTab('view', {
      entityUuid: this.props.params.entityUuid,
    });
  };

  drawcell = e => {
    if (e.onlFormField.dbFieldName == 'DATASOURCE') {
      const component = (
        <a onClick={() => this.checkDataSource(e)} style={{ color: 'rgb(59, 119, 227)' }}>
          {e.val}
        </a>
      );
      e.component = component;
    }
  };

  checkDataSource = async e => {
    const dataSourceUuid = e.record.DATASOURCE_UUID.split(',');
    let param = {
      tableName: 'cost_form',
      condition: {
        params: [{ field: 'UUID', rule: 'in', val: dataSourceUuid }],
      },
    };
    const columnsData = await dynamicQuery(param);
    if (columnsData && columnsData.success) {
      this.setState({ isModalVisible: true, dataSource: columnsData.result.records });
    }
  };

  handleOnClick = record => {
    this.setState({
      modalParam: {
        entityUuid: record.UUID,
        title: record.ITEM_NAME,
      },
    });
    this.createPageModalRef.show();
  };

  dataSourceModal = () => {
    const { dataSource } = this.state;
    const { dateInterval } = this.props.params;

    let arr = [];
    dataSource.forEach(data => {
      arr.push(
        <BasicSourceDataSearchPage
          title={data.TABLENAME_CN}
          tableName={data.TABLENAME}
          scroll={{
            x: 4000,
            y: 'calc(50vh)',
          }}
          selectedRows={data.UUID}
        />
      );
    });
    return arr;
  };

  handleOk = () => {
    this.setState({ isModalVisible: false, dataSourceName: [], dataSourceUuid: [] });
  };

  handleCancel = () => {
    this.setState({ isModalVisible: false, dataSourceName: [], dataSourceUuid: [] });
  };

  renderOperateCol = record => {
    const { modalParam } = this.state;
    return (
      <div>
        <CreatePageModal
          modal={{ title: modalParam.title, width: 1000 }}
          page={{
            quickuuid: 'COST_PROJECT',
            params: modalParam,
            showPageNow: 'update',
            readOnly: true,
          }}
          customPage={CostProjectCreate}
          onRef={node => (this.createPageModalRef = node)}
        />
        <a onClick={() => this.handleOnClick(record)} style={{ color: '#3B77E3' }}>
          查看
        </a>
      </div>
    );
  };

  /**
   * 绘制右上角按钮
   */
  drawActionButtion = () => {
    const { isModalVisible } = this.state;
    return (
      <Fragment>
        <Modal
          visible={isModalVisible}
          onOk={this.handleOk.bind()}
          onCancel={this.handleCancel.bind()}
          width={'80%'}
          bodyStyle={{ height: '800px', overflowY: 'auto' }}
        >
          {this.dataSourceModal()}
        </Modal>
        <Button onClick={this.onBack}>{commonLocale.backLocale}</Button>
        <Button
          hidden={!havePermission(this.state.quickuuid + '.edit')}
          type="primary"
          onClick={this.onEdit}
        >
          {commonLocale.editLocale}
        </Button>
      </Fragment>
    );
  };
}
