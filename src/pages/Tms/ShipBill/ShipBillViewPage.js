import { connect } from 'dva';
import { Fragment } from 'react';
import moment from "moment";
import { Button, Tabs, message, Table, Modal, Card, Row, Col, Statistic } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import Empty from '@/pages/Component/Form/Empty';
import TagUtil from '@/pages/Component/TagUtil';
import TimeLinePanel from '@/pages/Component/Form/TimeLinePanel';
import CollapsePanel from '@/pages/Component/Form/CollapsePanel';
import StandardTable from '@/components/StandardTable';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { convertCodeName, convertArticleDocField, composeQpcStrAndMunit, convertDate, convertDateToTime, groupBy } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { getMethodCaption } from '@/utils/OperateMethod';
import { State, WorkType } from './ShipBillContants';
import { shipBillLocale } from './ShipBillLocale';
import { SHIPBILL_RES } from './ShipBillPermission';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { orgType } from '@/utils/OrgType';
import { routerRedux } from 'dva/router';
import { CollectBinReviewType } from '@/pages/Tms/StoreHandoverBill/StoreHandoverBillContants';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';

import styles from './ShipBill.less';
import { TITLE_SEPARATION } from '@/utils/constants';

const TabPane = Tabs.TabPane;

@connect(({ shipbill, loading }) => ({
  shipbill,
  loading: loading.models.shipbill,
}))
export default class ShipBillViewPage extends ViewPage {
  constructor(props) {
    super(props);

    this.state = {
      entity: {},
      billItems: [],
      storeItems: [],
      containerItems: [],
      containerStockItems: [],
      qtyStrInfo: [],
      entityUuid: props.shipbill.entityUuid,
      billNumber: props.shipbill.billNumber,
      title: '',
      operate: '',
      modalVisible: false,
      createPermission: SHIPBILL_RES.CREATE,
    }
  }
  componentDidMount() {
    this.refresh(this.state.billNumber, this.state.entityUuid);
  }

  componentWillReceiveProps(nextProps) {
    const entity = nextProps.shipbill.entity;
    if (entity && entity.uuid) {
      let billItems = nextProps.shipbill.entity.billItems ? nextProps.shipbill.entity.billItems : [];
      billItems.forEach(function (data, index) {
        data.line = index + 1;
      });

      let storeItems = nextProps.shipbill.entity.storeItems ? nextProps.shipbill.entity.storeItems : [];
      storeItems.forEach(function (data, index) {
        data.line = index + 1;
      });

      let containerItems = nextProps.shipbill.entity.containerItems ? nextProps.shipbill.entity.containerItems : [];
      containerItems.forEach(function (data, index) {
        data.line = index + 1;
      });

      let containerStockItems = nextProps.shipbill.entity.containerStockItems ? nextProps.shipbill.entity.containerStockItems : [];
      containerStockItems.forEach(function (data, index) {
        data.line = index + 1;
      });

      let qtyStrInfo = nextProps.shipbill.entity.qtyStrInfos || [];
      qtyStrInfo.forEach(function (data, index) {
        data.line = index + 1;
      });

      this.setState({
        entity: nextProps.shipbill.entity,
        billItems: billItems,
        storeItems: storeItems,
        containerItems: containerItems,
        containerStockItems: containerStockItems,
        qtyStrInfo: qtyStrInfo,
        title: shipBillLocale.title + TITLE_SEPARATION + nextProps.shipbill.entity.billNumber,
        entityUuid: nextProps.shipbill.entity.uuid,
        showProcessView: false
      });
    } else if (nextProps.shipbill.entityUuid || nextProps.shipbill.billNumber) {
      this.setState({
        entityUuid: nextProps.shipbill.entityUuid,
        billNumber: nextProps.shipbill.billNumber
      });
      this.refresh(nextProps.shipbill.billNumber, nextProps.shipbill.entityUuid);
    }
    const nextBillNumber = nextProps.billNumber;
    if (nextBillNumber && nextBillNumber !== this.state.billNumber) {
      this.setState({
        billNumber: nextBillNumber
      });
      this.refresh(nextBillNumber);
    }
  }

  drawStateTag = () => {
    if (this.state.entity.state) {
      return (
        <TagUtil value={this.state.entity.state} />
      );
    }
  }

  /**
   * 刷新
   */
  refresh(billNumber, entityUuid) {
    if (!billNumber && !entityUuid) {
      billNumber = this.state.billNumber;
    }
    if (billNumber) {
      this.props.dispatch({
        type: 'shipbill/getByBillNumber',
        payload: {
          billNumber: billNumber,
          dcUuid: loginOrg().uuid
        },
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的装车单' + billNumber + '不存在！');
            this.onBack();
          } else {
            this.setState({
              billNumber: res.data.billNumber,
            });
          }
        }
      });
      return;
    }
    if (entityUuid) {
      this.props.dispatch({
        type: 'shipbill/get',
        payload: entityUuid,
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的装车单' + billNumber + '不存在！');
            this.onBack();
          } else {
            this.setState({
              billNumber: res.data.billNumber,
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
      type: 'shipbill/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  /**
   * 打印
   */
  onPrint = () => {

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
  /**
   * 模态框确认操作
   */
  handleOk = () => {
    const { operate } = this.state;
    if (operate === commonLocale.deleteLocale) {
      this.onDelete();
    } else if (operate === commonLocale.auditLocale) {
      this.onAudit();
    }
  }

  onAudit = () => {
    const { entity } = this.state;
    this.props.dispatch({
      type: 'shipbill/onAudit',
      payload: entity,
      callback: (response) => {
        if (response && response.success) {
          this.refresh();
          message.success(commonLocale.auditSuccessLocale);
        }
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  };

  onDelete = () => {
    const { entity } = this.state
    this.props.dispatch({
      type: 'shipbill/onRemove',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: (response) => {
        if (response && response.success) {
          this.onBack();
          message.success(commonLocale.removeSuccessLocale)
        }
      }
    })
  }

  /**
   * 新建
   */
  onCreate = () => {
    this.props.dispatch({
      type: 'shipbill/showPage',
      payload: {
        showPage: 'create',
        billNumber: this.state.billNumber
      }
    });
  }

  onEdit = () => {
    this.props.dispatch({
      type: 'shipbill/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entityUuid,
        billNumber: this.state.billNumber
      }
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
   * 判断状态节点
   */
  getDot = (state) => {
    if (state === State.SAVED.name || state === State.INPROGRESS.name) { return 0; }
    if (state === State.FINISHED.name) { return 1; }
  }

  /**
   * 绘制右上角按钮
   */
  drawActionButtion = () => {
    return (
      <Fragment>
        {
          (orgType.carrier.name != loginOrg().type && State.SAVED.name === this.state.entity.state) &&
          <Button disabled={!havePermission(SHIPBILL_RES.EDIT)} type="primary" onClick={this.onEdit}>
            {commonLocale.editLocale}
          </Button>
        }
        {
          (orgType.carrier.name != loginOrg().type && State.SAVED.name === this.state.entity.state) ?
            <Button disabled={!havePermission(SHIPBILL_RES.AUDIT)} type="primary" onClick={() => this.handleModalVisible(commonLocale.auditLocale)}>
              {commonLocale.auditLocale}
            </Button>
            : null
        }
        {
          (orgType.carrier.name != loginOrg().type && State.SAVED.name === this.state.entity.state) ?
            <Button disabled={!havePermission(SHIPBILL_RES.DELETE)} type="primary" onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}>
              {commonLocale.deleteLocale}
            </Button>
            : null
        }
        <Button onClick={this.onBack} >
          {commonLocale.backLocale}
        </Button>
        <PrintButton
          reportParams={[{ billNumber: this.state.entity ? this.state.entity.billNumber : null }]}
          moduleId={PrintTemplateType.SHIPBILL.name} />
      </Fragment>
    );
  }

  onViewShipPlanBill = (planBillNumber) => {
    this.props.dispatch({
      type: 'shipplanbill/getByBillNumber',
      payload: {
        billNumber: planBillNumber
      },
      callback: (response) => {
        if (response && response.success && response.data) {
          this.props.dispatch(routerRedux.push(
            {
              pathname: '/tms/shipplanbill',
              payload: {
                showPage: 'view',
                entityUuid: response.data.uuid
              }
            }
          ))
        }
      }
    })
  }

  /**
   * 绘制信息详情
   */
  drawBillInfoTab = () => {
    const { entity, attachmentItems } = this.state;

    let profileItems = [
      {
        label: shipBillLocale.shipPlanBill,
        value: <a onClick={this.onViewShipPlanBill.bind(true, entity.shipPlanBillNumber)}>
          {entity.shipPlanBillNumber ? entity.shipPlanBillNumber : <Empty />}</a>
      },
      {
        label: shipBillLocale.serialArch,
        value: entity.serialArch ? convertCodeName(entity.serialArch) : <Empty />
      },
      {
        label: shipBillLocale.vehicle,
        value: <a onClick={this.onViewVehicle.bind(true, entity.vehicle ? entity.vehicle.uuid : undefined)}>
          {entity.vehicle ? convertCodeName(entity.vehicle) : <Empty />}</a>
      }, {
        label: shipBillLocale.carrier,
        value: entity.carrier ? convertCodeName(entity.carrier) : <Empty />
      },
      {
        label: commonLocale.operateMethodLocale,
        value: entity.operateMethod ? getMethodCaption(entity.operateMethod) : ''
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
      },
      {
        label: commonLocale.noteLocale,
        value: entity.note
      }
    );


    let billItemsCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: shipBillLocale.fromOrg,
        key: 'fromOrg',
        width: colWidth.codeNameColWidth,
        render: (text, record) => loginOrg().type === 'DC' ? <EllipsisCol colValue={convertCodeName(record.fromOrg)} />
          : <a onClick={this.onViewDC.bind(true, record.fromOrg ? record.fromOrg.uuid : undefined)}>
            {<EllipsisCol colValue={convertCodeName(record.fromOrg)} />}</a>
      },
      {
        title: commonLocale.inStoreLocale,
        key: 'store',
        width: colWidth.codeNameColWidth,
        render: (text, record) => <EllipsisCol colValue={convertCodeName(record.store)} />
      },
      {
        title: commonLocale.containerLocale,
        width: colWidth.codeNameColWidth,
        dataIndex: 'containerBarcode',
        render: (text, record) => <a onClick={this.onViewContainer.bind(true, text)}
                                     disabled={'-' === text}>{text}</a>
      },
      {
        title: shipBillLocale.ship,
        dataIndex: 'ship',
        key: 'ship',
        width: itemColWidth.lineColWidth,
        render: (text, record) => (record.ship ? '是' : '否')
      },
      {
        title: shipBillLocale.shiper,
        key: 'shiper',
        width: colWidth.codeNameColWidth,
        render: record => <EllipsisCol colValue={convertCodeName(record.shiper)} />
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
        dataIndex: 'volume',
        width: itemColWidth.amountColWidth,
      },
      {
        title: commonLocale.noteLocale,
        dataIndex: 'note',
        render: text => text ? <EllipsisCol colValue={text} /> : <Empty />,
        width: itemColWidth.noteEditColWidth
      }
    ]

    let storeItemsCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: shipBillLocale.fromOrg,
        key: 'fromOrg',
        width: colWidth.codeNameColWidth,
        render: (text, record) => loginOrg().type === 'DC' ? <EllipsisCol colValue={convertCodeName(record.fromOrg)} />
          : <a onClick={this.onViewDC.bind(true, record.fromOrg ? record.fromOrg.uuid : undefined)}>
            {<EllipsisCol colValue={convertCodeName(record.fromOrg)} />}</a>
      },
      {
        title: commonLocale.inStoreLocale,
        key: 'store',
        width: colWidth.codeNameColWidth,
        render: (text, record) => <EllipsisCol colValue={convertCodeName(record.store)} />
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
        dataIndex: 'volume',
        width: itemColWidth.amountColWidth,
      }
    ]

    let containerItemsCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: shipBillLocale.fromOrg,
        key: 'fromOrg',
        width: colWidth.codeNameColWidth,
        render: (text, record) => loginOrg().type === 'DC' ? <EllipsisCol colValue={convertCodeName(record.fromOrg)} />
          : <a onClick={this.onViewDC.bind(true, record.fromOrg ? record.fromOrg.uuid : undefined)}>
            {<EllipsisCol colValue={convertCodeName(record.fromOrg)} />}</a>
      },
      {
        title: commonLocale.inStoreLocale,
        key: 'store',
        width: colWidth.codeNameColWidth,
        render: (text, record) => <EllipsisCol colValue={convertCodeName(record.store)} />
      },
      {
        title: commonLocale.containerLocale,
        width: colWidth.codeNameColWidth,
        dataIndex: 'containerBarcode',
        render: (text, record) => <a onClick={this.onViewContainer.bind(true, text)}
                                     disabled={'-' === text}>{text}</a>
      },
      {
        title: shipBillLocale.parentContainer,
        width: colWidth.codeNameColWidth,
        dataIndex: 'parentContainerBarcode',
        render: (text, record) => <a onClick={this.onViewContainer.bind(true, text)}
                                     disabled={'-' === text}>{text}</a>
      },
      {
        title: shipBillLocale.containerType,
        key: 'containerType',
        width: colWidth.codeNameColWidth,
        render: record => <EllipsisCol colValue={convertCodeName(record.containerType)} />
      },
      {
        title: shipBillLocale.shiper,
        key: 'shiper',
        width: colWidth.codeNameColWidth,
        render: record => <EllipsisCol colValue={convertCodeName(record.shiper)} />
      },
      {
        title: shipBillLocale.ship,
        dataIndex: 'ship',
        key: 'ship',
        width: itemColWidth.lineColWidth,
        render: (text, record) => (record.ship ? '是' : '否')
      }
    ]

    let containerStockItemsCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: shipBillLocale.fromOrg,
        key: 'fromOrg',
        width: colWidth.codeNameColWidth,
        render: (text, record) => loginOrg().type === 'DC' ? <EllipsisCol colValue={convertCodeName(record.fromOrg)} />
          : <a onClick={this.onViewDC.bind(true, record.fromOrg ? record.fromOrg.uuid : undefined)}>
            {<EllipsisCol colValue={convertCodeName(record.fromOrg)} />}</a>
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
        render: record => <a onClick={() => this.onViewArticle(record.article.articleUuid)} ><EllipsisCol colValue={convertArticleDocField(record.article)} /> </a>
      },
      {
        title: commonLocale.qpcStrLocale,
        width: itemColWidth.qpcStrColWidth,
        render: record => composeQpcStrAndMunit(record)
      },
      {
        title: commonLocale.bincodeLocale,
        width: colWidth.codeNameColWidth,
        dataIndex: 'binCode',
      },
      {
        title: commonLocale.containerLocale,
        width: colWidth.codeNameColWidth,
        dataIndex: 'containerBarcode',
        render: (text, record) => <a onClick={this.onViewContainer.bind(true, text)}
                                     disabled={'-' === text}>{text}</a>
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
        title: commonLocale.vendorLocale,
        key: 'vendor',
        width: colWidth.codeNameColWidth,
        render: record => <EllipsisCol colValue={convertCodeName(record.vendor)} />
      },
      {
        title: commonLocale.ownerLocale,
        width: colWidth.codeNameColWidth,
        key: 'owner',
        render: record => <EllipsisCol colValue={convertCodeName(record.owner)} />
      }
    ]


    let attachmentItemsCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: shipBillLocale.fromOrg,
        key: 'fromOrg',
        dataIndex: 'fromOrg',
        width: colWidth.codeNameColWidth,
        render: (text, record) => <EllipsisCol colValue={convertCodeName(record.fromOrg)} />
      },
      {
        title: commonLocale.inStoreLocale,
        dataIndex: 'store',
        width: colWidth.codeNameColWidth,
        render: (text, record) => <EllipsisCol colValue={convertCodeName(record.store)} />
      },
      {
        title: shipBillLocale.attachment,
        dataIndex: 'attachment',
        width: colWidth.codeNameColWidth,
        render: (text, record) => <EllipsisCol colValue={convertCodeName(record.attachment)} />
      },
      {
        title: commonLocale.caseQtyStrLocale,
        dataIndex: 'qtyStr',
        width: itemColWidth.qtyStrColWidth,
      },
      {
        title: shipBillLocale.shiper,
        key: 'shiper',
        width: colWidth.codeNameColWidth,
        render: record => <EllipsisCol colValue={convertCodeName(record.shiper)} />
      },
      {
        title: commonLocale.noteLocale,
        dataIndex: 'note',
        render: text => text ? <EllipsisCol colValue={text} /> : <Empty />,
        width: itemColWidth.noteEditColWidth
      }

    ]

    let tabPanes = [];
    if (State.SAVED.name === entity.state) {
      tabPanes.push(
        <TabPane key="billItems" tab={shipBillLocale.storeItems}>
          <ViewTablePanel
            data={this.state.billItems}
            columns={billItemsCols}
            notNote={true}
            scroll={{ x: 1800 }}
          />
        </TabPane>
      );

      tabPanes.push(
        <TabPane key="attachmentItems" forceRende={true} tab={shipBillLocale.attachmentItems}>
          <ViewTablePanel
            data={this.state.attachmentItems}
            columns={attachmentItemsCols}
            notNote={true}
            scroll={{ x: 1800 }}
          />
        </TabPane>
      );
    } else {
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
        <TabPane key="containerItems" tab={shipBillLocale.containerItems}>
          <ViewTablePanel
            data={this.state.containerItems}
            columns={containerItemsCols}
            scroll={{ x: 1800 }}
          />
        </TabPane>
      );

      tabPanes.push(
        <TabPane key="containerStockItems" tab={shipBillLocale.containerStockItems}>
          <ViewTablePanel
            data={this.state.containerStockItems}
            columns={containerStockItemsCols}
            notNote={true}
            scroll={{ x: 2400 }}
          />
        </TabPane>
      );

      // tabPanes.push(
      //   <TabPane key="qtyStrInfo" forceRende={true} tab={shipBillLocale.qtyStrInfo}>
      //     <ViewTablePanel
      //       style={{ marginTop: 20 }}
      //       data={this.state.qtyStrInfo}
      //       columns={qtyStrInfoCols}
      //       // notNote={true}
      //       tableId={'shipbill.view.qtyStrInfoTable'}
      //     />
      //   </TabPane>
      // );
      tabPanes.push(
        <TabPane key="attachmentItems" tab={shipBillLocale.attachmentItems}>
          <ViewTablePanel
            data={this.state.attachmentItems}
            columns={attachmentItemsCols}
            notNote={true}
          />
        </TabPane>
      );
    }

    let test = [
      <Tabs key='itemTabs' defaultActiveKey="billItems" className={styles.ItemTabs} >
        {tabPanes}
      </Tabs>
    ];

    return (
      <TabPane key="basicInfo" tab={commonLocale.billInfoLocale}>
          <ViewPanel onCollapse={this.onCollapse} items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()} />
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

  viewProcessView = () => {
    this.setState({
      showProcessView: !this.state.showProcessView
    });
  }

  darwProcess = () => {
    return <a onClick={() => this.viewProcessView()}>流程进度</a>;
  }
  drawOthers = () =>{
    const others = [];
    if(this.state.showProcessView){
      const  entity  = this.state.entity;
      let statisticProfile = entity.tmsStatisticProfile;
      const data = [{
        title:'开始装车时间',
        subTitle:entity.createInfo.time,
        current: entity.state !== '',
        description:[
          {
            label: commonLocale.inAllQtyStrLocale,
            value: statisticProfile.qtyStr ? statisticProfile.qtyStr : "0"
          },
          {
            label: commonLocale.inAllAmountLocale,
            value: statisticProfile.amount
          },
          {
            label: commonLocale.inTmsAllWeightLocale,
            value: statisticProfile.weight ? Number(statisticProfile.weight / 1000).toFixed(4) : 0
          },
          {
            label: commonLocale.inAllVolumeLocale,
            value: statisticProfile.volume
          },
          {
            label: shipBillLocale.totalStoreCount,
            value: entity.totalStoreCount
          },
          {
            label: shipBillLocale.totalContainerCount,
            value: entity.totalContainerCount
          }
        ]
      },{
        title:'完成装车时间',
        subTitle:entity.finishShipTime,
        current: entity.state === State.FINISHED.name,
        description: [

        ]
      }
      ];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
