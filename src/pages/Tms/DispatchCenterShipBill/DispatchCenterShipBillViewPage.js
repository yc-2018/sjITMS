import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Tabs, message} from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import Empty from '@/pages/Component/Form/Empty';
import TagUtil from '@/pages/Component/TagUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { convertCodeName, convertArticleDocField, composeQpcStrAndMunit, convertDate, convertDateToTime } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { getMethodCaption } from '@/utils/OperateMethod';
import { WorkType } from './DispatchCenterShipBillContants';
import { shipBillLocale } from './DispatchCenterShipBillLocale';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { orgType } from '@/utils/OrgType';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';

import styles from './DispatchCenterShipBill.less';
import { ShipState } from '@/pages/Tms/DispatchCenterShipBill/ShipState';

const TabPane = Tabs.TabPane;

@connect(({ dispatchCenterShipBill, loading }) => ({
  dispatchCenterShipBill,
  loading: loading.models.dispatchCenterShipBill,
}))
export default class DispatchCenterShipBillViewPage extends ViewPage {
  constructor(props) {
    super(props);

    this.state = {
      entity: {},
      billItems: [],
      storeItems: [],
      containerItems: [],
      containerStockItems: [],
      attachmentItems: [],
      billNumber: props.billNumber,
      entityUuid: props.dispatchCenterShipBill.entityUuid,
      title: '',
      operate: '',
      modalVisible: false,
    }
  }
  componentDidMount() {
    this.refresh(this.state.billNumber, this.state.entityUuid);
  }

  componentWillReceiveProps(nextProps) {

    if (nextProps.dispatchCenterShipBill.entity) {
      let storeItems = nextProps.dispatchCenterShipBill.entity.shipBillStoreItems ? nextProps.dispatchCenterShipBill.entity.shipBillStoreItems : [];
      storeItems.forEach(function (data, index) {
        data.line = index + 1;
      });

      let containerItems = nextProps.dispatchCenterShipBill.entity.shipBillArticleItems ? nextProps.dispatchCenterShipBill.entity.shipBillArticleItems : [];
      containerItems.forEach(function (data, index) {
        data.line = index + 1;
      });

      let orderItems = nextProps.dispatchCenterShipBill.entity.orderDetails ? nextProps.dispatchCenterShipBill.entity.orderDetails : [];
      orderItems.forEach(function (data, index) {
        data.line = index + 1;
      });

      this.setState({
        entity: nextProps.dispatchCenterShipBill.entity,
        storeItems: storeItems,
        containerItems: containerItems,
        orderItems: orderItems,
        title: shipBillLocale.title + "：" + nextProps.dispatchCenterShipBill.entity.billNumber,
        entityUuid: nextProps.dispatchCenterShipBill.entity.uuid,
      });
    }
    if (this.props.dispatchCenterShipBill.entityUuid != nextProps.dispatchCenterShipBill.entityUuid) {
      this.setState({
        entityUuid: nextProps.dispatchCenterShipBill.entityUuid
      }, () => {
        this.refresh();
      });
    }
  }

  drawStateTag = () => {
    if (this.state.entity.stat) {
      return (
        <TagUtil value={this.state.entity.stat} />
      );
    }
  }

  /**
   * 刷新
   */
  refresh(billNumber, uuid) {
    if (!billNumber && !uuid) {
      billNumber = this.state.entity.billNumber;
    }
    if (billNumber) {
      this.props.dispatch({
        type: 'dispatchCenterShipBill/getByBillNumber',
        payload: {
          billNumber: billNumber
        },
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的装车单' + billNumber + '不存在！');
            this.onBack();
          } else {
            this.setState({
              billNumber: res.data.billNumber
            });
          }
        }
      });
      return;
    }

    if (uuid) {
      this.props.dispatch({
        type: 'dispatchCenterShipBill/get',
        payload: uuid,
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的装车单不存在！');
            this.onBack();
          } else {
            this.setState({
              billNumber: res.data.billNumber
            });
          }
        }
      });
    }
  }
  /**
   * 返回
   */
  onBack = () => {
    this.props.dispatch({
      type: 'dispatchCenterShipBill/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  /**
   * 模态框显示/隐藏
   */
  handleModalVisible = (operate) => {
    if (operate) {
      this.setState({
        operate: operate
      })
    }
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }

  listToStr = (list) => {
    let listStr = '';
    Array.isArray(list) && list.forEach(function (data, index) {
      listStr = listStr + convertCodeName(data);
      if (index < list.length - 1) {
        listStr = listStr + '、';
      }
    });
    return listStr;
  }

  /**
   * 绘制右上角按钮
   */
  drawActionButtion = () => {
    return (
      <Fragment>
        <Button onClick={this.onBack} >
          {commonLocale.backLocale}
        </Button>
      </Fragment>
    );
  }

  darwProcess = () => {
    return <a onClick={() => this.viewProcessView()}>流程进度</a>;
  };

  viewProcessView = () => {
    this.setState({
      showProcessView: !this.state.showProcessView
    });
  };

  /**
   * 绘制信息详情
   */
  drawBillInfoTab = () => {
    const { entity } = this.state;

    let profileItems = [
      {
        label: commonLocale.billNumberLocal,
        value: entity.billNumber ? entity.billNumber : <Empty />
      },
      {
        label: shipBillLocale.shipPlanBill,
        value: entity.shipPlanBillNumber ? entity.shipPlanBillNumber : <Empty />
      },
      {
        label: shipBillLocale.serialArch,
        value: entity.serialArch ? convertCodeName(entity.serialArch) : <Empty />
      },
      {
        label: shipBillLocale.vehicle,
        value: entity.vehicle ? convertCodeName(entity.vehicle) : <Empty />
      }, {
        label: shipBillLocale.carrier,
        value: entity.carrier ? convertCodeName(entity.carrier) : <Empty />
      }
    ];
    let drivers = [];
    let stevedores = [];
    if (entity.employees) {
      entity.employees.forEach(function (employee) {
        if (WorkType.DRIVER.name == employee.vehicleEmployeeType)
          drivers.push(employee.vehicleEmployee);
        else
          stevedores.push(employee.vehicleEmployee);
      });
    }

    profileItems.push(
      {
        label: shipBillLocale.driver,
        value: drivers.length > 0 ? this.listToStr(drivers) : <Empty />
      },
      {
        label: shipBillLocale.stevedore,
        value: stevedores.length > 0 ? this.listToStr(stevedores) : <Empty />
      }, {
        label: "备注",
        value: entity.note
      }
    );

    let businessItems = [
        {
          label: commonLocale.inAllQtyStrLocale,
          value: entity.qtyStr ? entity.qtyStr : 0
        },
        {
          label: commonLocale.inAllAmountLocale,
          value: entity.amount ? entity.amount : 0
        },
        {
          label: commonLocale.inTmsAllWeightLocale,
          value: entity.weight ? entity.weight : 0
        },
        {
          label: commonLocale.inAllVolumeLocale,
          value: entity.volume ? entity.volume : 0
        },
        {
          label: shipBillLocale.totalStoreCount,
          value: entity.totalStoreCount ? entity.totalStoreCount : 0
        },
        {
          label: shipBillLocale.totalContainerCount,
          value: entity.containerCount ? entity.containerCount : 0
        }
      ];

    let storeItemsCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: commonLocale.inStoreLocale,
        key: 'store',
        width: colWidth.codeNameColWidth,
        render: (text, record) => <EllipsisCol colValue={record.store ? convertCodeName(record.store) : <Empty />} />
      },
      {
        title: commonLocale.caseQtyStrLocale,
        dataIndex: 'qtyStr',
        width: itemColWidth.qtyStrColWidth,
      },
      {
        title: shipBillLocale.containerCount,
        dataIndex: 'containerCount',
        width: itemColWidth.amountColWidth,
      },
      {
        title: commonLocale.inAmountLocale,
        dataIndex: 'amount',
        width: itemColWidth.amountColWidth,
      },
      {
        title: commonLocale.inTmsWeightLocale,
        key: 'weight',
        width: itemColWidth.amountColWidth,
        render: record => {
          return (
            <span>{record.weight ? Number(record.weight / 1000).toFixed(4) : 0}</span>
          );
        }
      },
      {
        title: commonLocale.inVolumeLocale,
        key: 'volume',
        width: itemColWidth.amountColWidth,
        render: record => {
          return (
            <span>{record.volume ? Number(record.volume / 1000000).toFixed(4) : 0}</span>
          );
        }
      }
    ]

    let orderItemsCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: commonLocale.billNumberLocal,
        key: 'orderNum',
        width: colWidth.billNumberColWidth,
        render: record => <EllipsisCol colValue={record.orderNum ? record.orderNum : <Empty />} />
      },
      {
        title: shipBillLocale.sourceBill,
        key: 'sourceNum',
        width: colWidth.billNumberColWidth,
        render: record => <EllipsisCol colValue={record.sourceNum ? record.sourceNum : <Empty />} />
      },
      {
        title: shipBillLocale.pickUpPoint,
        key: 'pickUpPoint',
        width: colWidth.codeNameColWidth,
        render: record => <EllipsisCol colValue={record.pickUpPoint ? convertCodeName(record.pickUpPoint) : <Empty />} />
      },
      {
        title: shipBillLocale.deliveryPoint,
        key: 'deliveryPoint',
        width: colWidth.codeNameColWidth,
        render: record => <EllipsisCol colValue={record.pickUpPoint ? convertCodeName(record.deliveryPoint) : <Empty />} />
      },
      {
        title: commonLocale.ownerLocale,
        width: colWidth.codeNameColWidth,
        key: 'owner',
        render: record => <EllipsisCol colValue={record.owner ? convertCodeName(record.owner) : <Empty />} />
      },
      {
        title: shipBillLocale.wholeCase,
        key: 'cartonCount',
        width: colWidth.codeNameColWidth,
        render: record => <EllipsisCol colValue={record.cartonCount ? record.cartonCount : 0} />
      },
      {
        title: shipBillLocale.passBox,
        width: colWidth.codeNameColWidth,
        key: 'containerCount',
        render: record => <EllipsisCol colValue={record.containerCount ? record.containerCount : 0} />
      },
      {
        title: commonLocale.inTmsAllWeightLocale,
        key: 'weight',
        width: colWidth.codeNameColWidth,
        render: record => <EllipsisCol colValue={ record.weight ? Number(record.weight / 1000).toFixed(4) : 0} />
      },
      {
        title: commonLocale.inAllVolumeLocale,
        key: 'volume',
        width: colWidth.codeNameColWidth,
        render: record => <EllipsisCol colValue={record.volume ? Number(record.volume / 1000000).toFixed(4) : 0} />
      }
    ]

    let containerStockItemsCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: commonLocale.inStoreLocale,
        key: 'store',
        width: colWidth.codeNameColWidth,
        render: (text, record) => <EllipsisCol colValue={convertCodeName(record.store)} />
      },
      {
        title: commonLocale.articleLocale,
        key: 'article',
        width: itemColWidth.articleColWidth,
        render: record => <a onClick={() => this.onViewArticle(record.article.uuid)} ><EllipsisCol colValue={convertCodeName(record.article)} /> </a>
      },
      {
        title: commonLocale.qpcStrLocale,
        width: itemColWidth.qpcStrColWidth,
        render: (val,record) => {
          if(record.qpcStr && record.spec) {
            return record.qpcStr+ '/' +record.spec
          } else {
            return <Empty />
          }
        }
      },
      {
        title: commonLocale.containerLocale,
        width: colWidth.codeNameColWidth,
        dataIndex: 'containerCode'
      },
      {
        title: commonLocale.productionDateLocale,
        key: 'productionDate',
        width: colWidth.dateColWidth,
        render: record => convertDate(record.productionDate)
      },
      {
        title: commonLocale.validDateLocale,
        key: 'validDate',
        width: colWidth.dateColWidth,
        render: record => convertDate(record.validDate)
      },
      {
        title: commonLocale.productionBatchLocale,
        dataIndex: 'productionBatch',
        width: itemColWidth.numberEditColWidth,
      },
      {
        title: commonLocale.inStockBatchLocale,
        dataIndex: 'stockBatch',
        width: itemColWidth.numberEditColWidth,
        render: text => <EllipsisCol colValue={text} />
      },
      {
        title: commonLocale.caseQtyStrLocale,
        dataIndex: 'qtyStr',
        width: itemColWidth.qtyStrColWidth,
      },
      {
        title: commonLocale.qtyLocale,
        dataIndex: 'qty',
        width: itemColWidth.qpcStrColWidth,
      },
      {
        title: commonLocale.ownerLocale,
        width: colWidth.codeNameColWidth,
        key: 'owner',
        render: record => <EllipsisCol colValue={convertCodeName(record.owner)} />
      }
    ]

    let tabPanes = [];
    tabPanes.push(
      <TabPane key="storeItems" tab={shipBillLocale.storeItems}>
        <ViewTablePanel
          data={this.state.storeItems}
          columns={storeItemsCols}
          notNote={true}
        />
      </TabPane>
    );

    tabPanes.push(
      <TabPane key="orderItems" tab={shipBillLocale.orderItems}>
        <ViewTablePanel
          data={this.state.orderItems}
          columns={orderItemsCols}
          notNote={true}
        />
      </TabPane>
    );

    tabPanes.push(
      <TabPane key="containerStockItems" tab={shipBillLocale.containerStockItems}>
        <ViewTablePanel
          data={this.state.containerItems}
          columns={containerStockItemsCols}
          notNote={true}
          scroll={{ x: 2400 }}
        />
      </TabPane>
    );

    let test = [
      <Tabs key='itemTabs' defaultActiveKey="billItems" className={styles.ItemTabs} >
        {tabPanes}
      </Tabs>
    ];

    return (
      <TabPane key="basicInfo" tab={commonLocale.billInfoLocale}>
        <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()}/>

        <ViewPanel children={test} title={commonLocale.itemsLocale} />,

        <div>
          <ConfirmModal
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={shipBillLocale.title + ':' + this.state.entity.billNumber}
            onOk={this.handleOk}
            onCancel={this.handleModalVisible}
          />
        </div>
      </TabPane>
    );
  }
  /**
   * 绘制Tab页
   */
  drawTabPanes = () => {
    let tabPanes = [
      this.drawBillInfoTab(),
    ];

    return tabPanes;
  }

  drawOthers = () => {
    const others = [];
    if (this.state.showProcessView) {
      const { entity } = this.state;
      const data = [{
        title: '开始装车时间',
        subTitle: entity.beginShipTime,
        current: entity.state !== '',
        description: [{
          label: commonLocale.inAllQtyStrLocale,
          value: entity.qtyStr ? entity.qtyStr : 0
        },
          {
            label: commonLocale.inAllAmountLocale,
            value: entity.amount ? entity.amount : 0
          },
          {
            label: commonLocale.inTmsAllWeightLocale,
            value: entity.weight ? entity.weight : 0
          },
          {
            label: commonLocale.inAllVolumeLocale,
            value: entity.volume ? entity.volume : 0
          },
          {
            label: shipBillLocale.totalStoreCount,
            value: entity.totalStoreCount ? entity.totalStoreCount : 0
          },
          {
            label: shipBillLocale.totalContainerCount,
            value: entity.containerCount ? entity.containerCount : 0
          }
        ]
      },
      {
        title: '结束装车时间',
        subTitle: entity.finishShipTime,
        current: entity.stat === ShipState.SHIPED.name,
      },
      {
        title: '出车时间',
        subTitle: entity.dispatchTime,
        current: entity.stat === ShipState.DELIVERING.name,

      },
      {
        title: '回车车时间',
        subTitle: entity.returnTime,
        current: entity.stat == ShipState.RETURNED.name,
      }];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
