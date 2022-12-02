import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { commonLocale } from '@/utils/CommonLocale';
import StandardTable from '@/components/StandardTable';
import { colWidth } from '@/utils/ColWidth';
import { Modal, InputNumber, Button, message, Input } from 'antd';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import Empty from '@/pages/Component/Form/Empty';
import { dispatchReturnLocale } from './DispatchReturnLocale';
import { query, saveOrUpdateFee } from '@/services/sjtms/OtherFeeService';

@connect(({ dispatchReturnStore, loading }) => ({
  dispatchReturnStore,
  loading: loading.models.dispatchReturnStore,
}))
export default class StoreModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: props.visible,
      shipBillTmsUuid: props.shipBillTmsUuid,
      data: this.props.dispatchReturnStore.dataForStore,
      selectedRows: [],
      isView: props.isView,
      totalAmountAll: '',
      pageFilter: {
        page: 0,
        pageSize: 10,
        sortFields: {},
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dispatchCenterUuid: loginOrg().uuid,
          scheduleBillNumber: props.scheduleBillNumber,
        },
        likeKeyValues: {},
      },
      ParkingFee: undefined,
      confirmModal: false,
      confirmMessage: '',
    };
  }
  componentWillMount() {
    if (this.state.storeUuid) {
      this.refresh();
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.scheduleBillNumber != this.props.scheduleBillNumber) {
      this.state.pageFilter.searchKeyValues.scheduleBillNumber = nextProps.scheduleBillNumber;
      this.setState({
        scheduleBillNumber: nextProps.scheduleBillNumber,
        shipBillTmsUuid: nextProps.shipBillTmsUuid,
        pageFilter: this.state.pageFilter,
      });
      this.refresh(this.state.pageFilter);
    }
    if (nextProps.visible != this.props.visible) {
      this.setState({
        visible: nextProps.visible,
      });
    }

    if (
      nextProps.dispatchReturnStore.dataForStore &&
      nextProps.dispatchReturnStore.dataForStore != this.props.dispatchReturnStore.dataForStore
    ) {
      this.setState({
        data: nextProps.dispatchReturnStore.dataForStore,
      });
    }
  }

  refresh = async pageFilter => {
    this.getTotalAmount(pageFilter);
    this.props.dispatch({
      type: 'dispatchReturnStore/queryByStore',
      payload: pageFilter ? pageFilter : this.state.pageFilter,
    });
  };

  getTotalAmount = async pageFilter => {
    const response = await query(pageFilter ? pageFilter : this.state.pageFilter);
    if (response.success && response.data.records) {
      let data = response.data.records;
      let ParkingFee = data.find(a => a.feetype == 'ParkingFee');
      if (ParkingFee != undefined) {
        this.setState({ totalAmountAll: ParkingFee.amount, ParkingFee });
      }
    } else {
      this.setState({ totalAmountAll: '' });
    }
  };

  handleOk = async confirm => {
    const { shipBillTmsUuid, totalAmountAll, ParkingFee } = this.state;
    const params = {
      uuid: ParkingFee == undefined ? '' : ParkingFee.uuid,
      amount: totalAmountAll,
      feetype: 'ParkingFee',
      feename: '停车费',
      billuuid: shipBillTmsUuid,
      companyuuid: loginCompany().uuid,
      dispatchcenteruuid: loginOrg().uuid,
      confirm: confirm,
    };
    this.save(params);
  };

  save = async params => {
    const response = await saveOrUpdateFee(params);
    if (response && response.data > 0) {
      message.success('保存成功');
    } else if (response && response.data && response.data.indexOf('确认保存') > 0) {
      this.setState({ confirmModal: true, confirmMessage: response.data });
    } else {
      message.error('保存失败');
    }
  };

  handleCancel = () => {
    this.props.handleModal();
  };

  handleOnChange = e => {
    this.setState({ totalAmountAll: e });
  };

  columns = [
    {
      title: dispatchReturnLocale.archLine,
      dataIndex: 'archLine',
      width: colWidth.billNumberColWidth + 50,
      render: (val, record) => {
        return record.archlinecode && record.archlinename ? (
          '[' + record.archlinecode + ']' + record.archlinename
        ) : (
          <Empty />
        );
      },
    },
    {
      title: commonLocale.inStoreLocale,
      dataIndex: 'store',
      width: colWidth.billNumberColWidth + 50,
      render: (val, record) => {
        return record.storecode && record.storename ? (
          '[' + record.storecode + ']' + record.storename
        ) : (
          <Empty />
        );
      },
    },
    {
      title: dispatchReturnLocale.areaName,
      dataIndex: 'areaname',
      width: colWidth.billNumberColWidth + 50,
      render: val => (val ? val : ''),
    },
    {
      title: dispatchReturnLocale.parkingFee,
      dataIndex: 'parkingfee',
      width: colWidth.billNumberColWidth + 50,
      render: val => (val ? val : 0),
    },
  ];
  render() {
    const {
      selectedRows,
      visible,
      data,
      isView,
      totalAmountAll,
      confirmModal,
      confirmMessage,
    } = this.state;
    return (
      <div>
        <Modal
          title={
            '排车单门店明细费用信息（排车单号：' +
            (data.list[0] ? data.list[0].billnumber : '') +
            '）'
          }
          visible={visible}
          destroyOnClose={true}
          onCancel={() => this.handleCancel()}
          footer={[]}
          okText={commonLocale.confirmLocale}
          cancelText={commonLocale.cancelLocale}
          width={'70%'}
          style={{ overflow: 'auto' }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
            <div style={{ display: 'flex' }}>
              <div style={{ textAlign: 'center', height: '28px', lineHeight: '28px' }}>
                {dispatchReturnLocale.totalStopCarFee}：
              </div>
              <div style={{ marginRight: '10px' }}>
                <InputNumber
                  placeholder="请输入总停车费"
                  value={totalAmountAll}
                  style={{ width: '100%' }}
                  onChange={e => {
                    this.handleOnChange(e);
                  }}
                />
              </div>
              <div>
                <Button type="primary" onClick={() => this.handleOk(false)}>
                  {commonLocale.saveLocale}
                </Button>
              </div>
            </div>
          </div>
          <StandardTable
            rowKey={record => record.uuid}
            selectedRows={selectedRows}
            unShowRow={isView == true ? true : false}
            loading={this.props.loading}
            data={data}
            columns={this.columns}
          />
        </Modal>
        <Modal
          title="提示"
          visible={confirmModal}
          onCancel={() => {
            this.setState({ confirmModal: false });
          }}
          onOk={() => {
            this.handleOk(true);
            this.setState({ confirmModal: false });
          }}
        >
          <p style={{ fontSize: '15px', color: 'red' }}>{confirmMessage}</p>
        </Modal>
      </div>
    );
  }
}
