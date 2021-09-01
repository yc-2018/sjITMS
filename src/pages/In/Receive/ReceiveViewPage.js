import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Form, Select, Input, InputNumber, message, Col, Button, Tabs, Divider } from 'antd';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import TagUtil from '@/pages/Component/TagUtil';
import Empty from '@/pages/Component/Form/Empty';
import { loginCompany } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { binUsage, getUsageCaption } from '@/utils/BinUsage';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { State, Type, Method } from './ReceiveContants';
import { receiveLocale } from './ReceiveLocale';
import { RECEIVE_RES } from './ReceivePermission';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import TimeLinePanel from '@/pages/Component/Form/TimeLinePanel';
import CollapsePanel from '@/pages/Component/Form/CollapsePanel';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { ORDER_RES } from '@/pages/In/Order/OrderPermission';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';
import { routerRedux } from 'dva/router';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';

const TabPane = Tabs.TabPane;
@connect(({ receive, loading }) => ({
  receive,
  loading: loading.models.receive,
}))
export default class ReceiveViewPage extends ViewPage {

  constructor(props) {
    super(props);

    this.state = {
      title: receiveLocale.title,
      entityUuid: props.entityUuid,
      billNumber: props.billNumber,
      entity: {},
      operate: '',
      modalVisible: false,
      createPermission: RECEIVE_RES.CREATE,
    }
  }

  componentDidMount() {
    this.refresh(this.state.billNumber, this.state.entityUuid);
  }

  componentWillReceiveProps(nextProps) {
    const entity = nextProps.receive.entity;
    if (entity && (entity.billNumber === this.state.billNumber || entity.uuid === this.state.entityUuid)) {
      this.setState({
        entity: entity,
        title: receiveLocale.title + "：" + entity.billNumber,
        entityUuid: entity.uuid,
        billNumber: entity.billNumber,
        showProcessView: false
      });
    }

    const nextBillNumber = nextProps.billNumber;
    if (nextBillNumber && this.state.billNumber !== nextBillNumber) {
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

  drawActionButtion() {
    return (
      <Fragment>
        <Button onClick={this.onCancel}>
          {commonLocale.backLocale}
        </Button>
        <PrintButton
          reportParams={[{ 'billNumber': this.state.entity ? this.state.entity.billNumber : null }]}
          moduleId={'RECEIVEBILL'} />
        {
          this.state.entity.state && this.state.entity.state === State.SAVED.name &&
          <span>
            <Button disabled={!havePermission(RECEIVE_RES.REMOVE)}
              onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}>
              {commonLocale.deleteLocale}
            </Button>
            <Button disabled={!havePermission(RECEIVE_RES.CREATE)}
              onClick={() => this.onEdit()}>
              {commonLocale.editLocale}
            </Button>
            <Button disabled={!havePermission(RECEIVE_RES.AUDIT)} type='primary'
              onClick={() => this.handleModalVisible(commonLocale.auditLocale)}>
              {commonLocale.auditLocale}
            </Button>
          </span>
        }
        {
          this.state.entity.state && this.state.entity.state === State.INPROGRESS.name &&
          <Button disabled={!havePermission(RECEIVE_RES.AUDIT)} type='primary'
            onClick={() => this.handleModalVisible(commonLocale.auditLocale)}>
            {commonLocale.auditLocale}
          </Button>
        }
      </Fragment>
    );
  }

  refresh = (billNumber, uuid) => {
    if (!billNumber && !uuid) {
      billNumber = this.state.billNumber;
    }

    if (billNumber) {
      this.props.dispatch({
        type: 'receive/getByBillNumber',
        payload: {
          billNumber: billNumber
        },
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的收货单' + billNumber + '不存在！');
            this.onCancel();
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
        type: 'receive/get',
        payload: {
          uuid: uuid
        },
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的收货单不存在！');
            this.onCancel();
          } else {
            this.setState({
              billNumber: res.data.billNumber
            });
          }
        }
      });
    }

  }

  onCancel = () => {
    this.props.dispatch({
      type: 'receive/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }

  onEdit = () => {
    this.props.dispatch({
      type: 'receive/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entity.uuid
      }
    });
  }

  onCreate = () => {
    this.props.dispatch({
      type: 'receive/showPage',
      payload: {
        showPage: 'create'
      }
    });
  }

  /**
   * 点击上一单
   */
  previousBill = () => {
    const { entity } = this.state;
    if (entity.uuid){
      this.props.dispatch({
        type: 'receive/previousBill',
        payload: entity.billNumber
      });
    }
  }
  /**
   * 点击下一单
   */
  nextBill = () => {
    const { entity } = this.state;
    if (entity.uuid){
      this.props.dispatch({
        type: 'receive/nextBill',
        payload: entity.billNumber
      });
    }
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
    const {
      operate
    } = this.state;
    if (operate === commonLocale.deleteLocale) {
      this.onRemove();
    } else if (operate === commonLocale.auditLocale) {
      this.onAudit();
    }
  }

  /**
  * 删除处理
  */
  onRemove = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'receive/onRemove',
      payload: this.state.entity,
      callback: (response) => {
        if (response && response.success) {
          this.onCancel();
          message.success(commonLocale.removeSuccessLocale);
        }
      }
    });
  };

   /**
   * 跳转到订单详情页面
   */
  onOrderView = (record) => {
    this.props.dispatch({
      type: 'order/getByBillNumberAndDcUuid',
      payload: {
        dcUuid: record.dcUuid,
        sourceBillNumber: record.orderBillNumber
      },
      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/in/order',
            payload: {
              showPage: 'view',
              entityUuid: response.data ? response.data.uuid : undefined
            }
          }));
        }
      }
    });
  }

  /**
   * 审核处理
   */
  onAudit = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'receive/onAudit',
      payload: this.state.entity,
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

  drawTabPanes = () => {
    let tabPanes = [
      this.drawBasicInfoTab()
    ];

    return tabPanes;
  }

  drawBasicInfoTab = () => {
    const { entity } = this.state;
    let allArticleQty = 0;
    let articleUuids = [];
    entity.items && entity.items.map(item => {
      if (articleUuids.indexOf(item.article.uuid) === -1) {
        allArticleQty = allArticleQty + 1;
        articleUuids.push(item.article.uuid);
      }
    })
    let basicItems = [{
      label: commonLocale.inOrderBillNumberLocale,
      value: <a onClick={this.onOrderView.bind(this, entity) }
            disabled={!havePermission(ORDER_RES.VIEW)}>{entity.orderBillNumber}</a>
    }, {
      label: commonLocale.inWrhLocale,
      value: convertCodeName(entity.wrh)
    }, {
      label: commonLocale.inlogisticModeLocale,
      value: entity.logisticMode ? LogisticMode[entity.logisticMode].caption : ''
    }, {
      label: commonLocale.inVendorLocale,
      value: <a onClick={this.onViewVendor.bind(this, entity.vendor?entity.vendor.uuid:undefined) }
            disabled={!havePermission(VENDOR_RES.VIEW)}>{convertCodeName(entity.vendor)}</a>
    }, {
      label: commonLocale.inOwnerLocale,
      value: convertCodeName(entity.owner)
    }, {
      label: receiveLocale.receiver,
      value: convertCodeName(entity.receiver)
    }, {
      label: receiveLocale.method,
      value: entity.method && Method[entity.method].caption
    }, {
      label: receiveLocale.type,
      value: entity.type && Type[entity.type].caption
    }, {
      label: commonLocale.sourceBillNumberLocal,
      value: entity.sourceOrderBillNumber
    },
      {
        label: commonLocale.noteLocale,
        value: entity.note
      }];

    let businessItems = [{
      label: commonLocale.inAllQtyStrLocale,
      value: entity.qtyStr
    }, {
      label: receiveLocale.allArticles,
      value: allArticleQty
    }, {
      label: commonLocale.inAllAmountLocale,
      value: entity.amount
    }, {
      label: commonLocale.inAllVolumeLocale,
      value: entity.volume
    }, {
      label: commonLocale.inAllWeightLocale,
      value: entity.weight
    }];

    const columns = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth
      },
      {
        title: commonLocale.inArticleLocale,
        dataIndex: 'article',
        key: 'article',
        width: colWidth.codeNameColWidth,
        render: text => <a onClick={this.onViewArticle.bind(this, text?text.uuid:undefined)}><EllipsisCol colValue={convertCodeName(text)} /></a>
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        dataIndex: 'qpcStr',
        key: 'qpcStr',
        width: itemColWidth.qpcStrColWidth,
        render: (text, record) => {
          return `${record.qpcStr}/${record.munit}`;
        },
      },
      {
        title: commonLocale.inQtyStrLocale,
        dataIndex: 'qtyStr',
        key: 'qtyStr',
        width: itemColWidth.qtyStrColWidth
      },
      {
        title: commonLocale.inQtyLocale,
        dataIndex: 'qty',
        key: 'qty',
        width: itemColWidth.qtyColWidth
      },
      {
        title: commonLocale.inProductDateLocale,
        dataIndex: 'productDate',
        key: 'productDate',
        width: colWidth.dateColWidth,
        render: (val) => {
          return moment(val).format('YYYY-MM-DD');
        }
      },
      {
        title: commonLocale.inValidDateLocale,
        dataIndex: 'validDate',
        key: 'validDate',
        width: colWidth.dateColWidth,
        render: (val) => {
          return moment(val).format('YYYY-MM-DD');
        }
      },
      {
        title: commonLocale.inContainerBarcodeLocale,
        dataIndex: 'containerBarcode',
        key: 'containerBarcode',
        width: colWidth.codeColWidth,
        render: (val) =>{
          return <a onClick={this.onViewContainer.bind(this, val)}>{val}</a>
        }
      },
      {
        title: receiveLocale.targetBin,
        key: 'targetBinCode',
        dataIndex: 'targetBinCode',
        width: colWidth.codeColWidth,
        render: (val,record) => {
          return record.targetBinCode?record.targetBinCode+'['+(record.targetBinUsage!=undefined?binUsage[record.targetBinUsage].caption:<Empty/>)+']':<Empty/>;
        }
      },
      {
        title: commonLocale.inProductionBatchLocale,
        dataIndex: 'productionBatch',
        key: 'productionBatch',
        width: itemColWidth.numberEditColWidth
      }
    ];

    let noteItems = [{
      label: commonLocale.noteLocale,
      value: entity.note
    }]
    let timeLineData = [
      { title: receiveLocale.startReceiveTime, time: entity.startReceiveTime },
    ];
    if (entity.state === State.AUDITED.name) {
      timeLineData.push({ title: receiveLocale.endReceiveTime, time: entity.endReceiveTime });
    } else {
      timeLineData.push({ title: receiveLocale.endReceiveTime, time: undefined });
    }
    if(entity.uploadDate){
      timeLineData.push({ title: commonLocale.inUploadDateLocale, time: entity.uploadDate });
    }
    let current = 0;
    for (let i = timeLineData.length - 1; i >= 0; i--) {
      if (timeLineData[i].time) {
        current = i;
        break;
      }
    }
    let collapseItems = [
      <TimeLinePanel header={commonLocale.timeLineLocale} items={timeLineData} current={current} />
    ];
    return (

      <TabPane key="basicInfo" tab={commonLocale.basicInfoLocale}>
        <ViewPanel onCollapse={this.onCollapse} items={basicItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()} />
        <ViewTablePanel
          title={commonLocale.itemsLocale}
          columns={columns}
          data={entity.items ? entity.items : []}
          tableId={'receive.view.table'}
        />
        <div>
        <ConfirmModal
        visible={this.state.modalVisible}
        operate={this.state.operate}
        object={receiveLocale.title + ':' + this.state.billNumber}
        onOk={this.handleOk}
        onCancel={this.handleModalVisible}
        />
      </div>
    </TabPane>
    );
  }

  viewProcessView = () => {
    this.setState({
      showProcessView: !this.state.showProcessView
    });
  }

  darwProcess = () => {
    return <a onClick={() => this.viewProcessView()}>流程进度</a>;
  }
  drawOthers = () => {
    const others = [];
    if (this.state.showProcessView) {
      const { entity } = this.state;
      let allArticleQty = 0;
      let articleUuids = [];
      entity.items && entity.items.map(item => {
        if (articleUuids.indexOf(item.article.uuid) === -1) {
          allArticleQty = allArticleQty + 1;
          articleUuids.push(item.article.uuid);
        }
      })
      const data = [{
        title: '开始收货',
        subTitle: entity.startReceiveTime,
        current: entity.state !== '',
        description: [{
          label: commonLocale.inAllQtyStrLocale,
          value: entity.qtyStr
        }, {
          label: receiveLocale.allArticles,
          value: allArticleQty
        }, {
          label: commonLocale.inAllAmountLocale,
          value: entity.amount
        }, {
          label: commonLocale.inAllVolumeLocale,
          value: entity.volume
        }, {
          label: commonLocale.inAllWeightLocale,
          value: entity.weight
        }
        ]
      },{
        title: '结束',
        subTitle: !entity.endReceiveTime ? "" : (entity.endReceiveTime + " "
          + (entity.uploadDate ? (commonLocale.inUploadDateLocale + "：" + entity.uploadDate) : "")),
        current: entity.state == State.AUDITED.name,
      }];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
