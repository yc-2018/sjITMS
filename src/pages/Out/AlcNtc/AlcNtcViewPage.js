import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import {Icon, Input, message, Button, Tabs } from 'antd';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import { loginCompany, loginOrg, getActiveKey } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { qtyStrToQty, add, toQtyStr } from '@/utils/QpcStrUtil';
import { ShipState } from './AlcNtcContants';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import TagUtil from '@/pages/Component/TagUtil';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import { State } from './AlcNtcContants';
import { alcNtcLocale } from './AlcNtcLocale';
import { ALCNTC_RES } from './AlcNtcPermission';
import Empty from '@/pages/Component/Form/Empty';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { orgType } from '@/utils/OrgType';
import { ORDER_RES } from '../../In/Order/OrderPermission';
import { routerRedux } from 'dva/router';
import { STORE_RES } from '@/pages/Basic/Store/StorePermission';
import { WAVEBILL_RES } from '@/pages/Out/Wave/WaveBillPermission';
import { SchedulingType } from '@/pages/Out/AlcNtc/AlcNtcContants';
const TabPane = Tabs.TabPane;
@connect(({ alcNtc, loading }) => ({
  alcNtc,
  loading: loading.models.alcNtc,
}))
export default class AlcNtcViewPage extends ViewPage {

  constructor(props) {
    super(props);

    this.state = {
      title: alcNtcLocale.title,
      entityUuid: props.alcNtc.entityUuid,
      billNumber: props.billNumber,
      entity: {},
      operate: '',
      modalVisible: false,
      createPermission: ALCNTC_RES.CREATE,
    }
  }

  componentDidMount() {
    this.refresh(this.state.billNumber, this.state.entityUuid);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.alcNtc.entity) {
      this.setState({
        entity: nextProps.alcNtc.entity,
        title: alcNtcLocale.title + "：" + nextProps.alcNtc.entity.billNumber,
        entityUuid: nextProps.alcNtc.entity.uuid,
      });
    } else if (this.state.entityUuid && nextProps.alcNtc.entityUuid && this.state.entityUuid != nextProps.alcNtc.entityUuid) {
       //this.refresh(nextProps.alcNtc.entityUuid);
    }
    const nextBillNumber = nextProps.alcNtc.entity.billNumber ? nextProps.alcNtc.entity.billNumber : nextProps.billNumber;
    if (nextBillNumber && nextBillNumber !== this.state.billNumber) {
      this.setState({
        billNumber: nextBillNumber
      });
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
    const state = this.state.entity.state;
    return loginOrg().type == orgType.store.name ?
      <Button onClick={this.onCancel}>
        {commonLocale.backLocale}
      </Button> : (
        <Fragment>
          <Button onClick={this.onCancel}>
            {commonLocale.backLocale}
          </Button>
          <Button onClick={() => this.handleModalVisible(commonLocale.copyLocale)} disabled={!havePermission(ALCNTC_RES.COPY)}>
            {commonLocale.copyLocale}
          </Button>
          <PrintButton
            reportParams={[{ billNumber: `${this.state.entity.billNumber}` }]}
            moduleId={PrintTemplateType.ALCNTCBILL.name} />
          {
            state && (State[state].name == State.SAVED.name || State[state].name === State.INITIAL.name
              || State[state].name === State.USED.name) &&
            <span>
              <Button
                disabled={!havePermission(ALCNTC_RES.EDIT)}
                onClick={() => this.onEdit()}>
                {commonLocale.editLocale}
              </Button>
            </span>
          }
          {
            state && State[state].name == State.SAVED.name &&
            <span>
              <Button
                onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}
                disabled={!havePermission(ALCNTC_RES.REMOVE)}
              >{commonLocale.deleteLocale}</Button>
              <Button type='primary'
                onClick={() => this.handleModalVisible(commonLocale.auditLocale)}
                disabled={!havePermission(ALCNTC_RES.AUDIT)}
              >{commonLocale.auditLocale}</Button>
            </span>
          }
          {state && State[state].name === State.INITIAL.name &&
            <Button
              onClick={() => this.handleModalVisible(commonLocale.abortLocale)}
              disabled={!havePermission(ALCNTC_RES.ABORT)}
            >{commonLocale.abortLocale}</Button>
          }
          {
            state && (State[state].name === State.INITIAL.name || State[state].name === State.INALC.name
              || State[state].name === State.INPROGRESS.name) &&
            <Button type='primary'
              onClick={() => this.handleModalVisible(commonLocale.finishLocale)}
              disabled={!havePermission(ALCNTC_RES.FINISH)}
            >{commonLocale.finishLocale}</Button>
          }
        </Fragment>
      );
  }

  refresh(billNumber, uuid) {
    if (!billNumber && !uuid) {
      billNumber = this.state.billNumber;
    }
    if (uuid) {
      this.props.dispatch({
        type: 'alcNtc/get',
        payload: {
          uuid: uuid
        },
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的配货通知单不存在！');
            this.onCancel();
          } else {
            this.setState({
              billNumber: res.data.billNumber
            });
          }
        }
      });
    }

    if (billNumber) {
      this.props.dispatch({
        type: 'alcNtc/getByNumber',
        payload: billNumber,
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的配货通知单' + billNumber + '不存在！');
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
      this.onRemove();
    } else if (operate === commonLocale.auditLocale) {
      this.onAudit();
    } else if (operate === commonLocale.abortLocale) {
      this.onAbort();
    } else if (operate === commonLocale.finishLocale) {
      this.onFinish();
    } else if (operate === commonLocale.copyLocale) {
      this.onCopy();
    }
  }

  onCancel = () => {
    this.props.dispatch({
      type: 'alcNtc/showPage',
      payload: {
        showPage: 'query',
        fromView: true
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
        type: 'alcNtc/previousBill',
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
        type: 'alcNtc/nextBill',
        payload: entity.billNumber
      });
    }
  }

  onCreate = () => {
    this.props.dispatch({
      type: 'alcNtc/showPage',
      payload: {
        showPage: 'create',
      }
    });
  }

  onEdit = () => {
    this.props.dispatch({
      type: 'alcNtc/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entity.uuid
      }
    });
  }

  onRemove = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'alcNtc/onRemove',
      payload: this.state.entity,
      callback: (response) => {
        if (response && response.success) {
          this.onCancel();
          message.success(commonLocale.removeSuccessLocale);
        }
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  };

  onAudit = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'alcNtc/onAudit',
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

  onAbort = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'alcNtc/onAbort',
      payload: this.state.entity,
      callback: (response) => {
        if (response && response.success) {
          this.refresh();
          message.success(commonLocale.abortSuccessLocale);
        }
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  };

  onFinish = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'alcNtc/onFinish',
      payload: this.state.entity,
      callback: (response) => {
        if (response && response.success) {
          this.refresh();
          message.success(commonLocale.finishSuccessLocale);
        }
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  };

  onCopy = () => {
    const { entity } = this.state

    this.props.dispatch({
      type: 'alcNtc/copy',
      payload: {
        billNumber: entity.billNumber,
        dcUuid: entity.dcUuid
      },
      callback: (response) => {
        if (response && response.success) {
          this.refresh();
          message.success(commonLocale.copySuccessLocale)
        }
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }

  /**
   * 跳转到波次单详情页面
   */
  onWaveView = (record) => {
    this.props.dispatch({
      type: 'wave/getByNumber',
      payload: record,

      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/out/wave',
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
   * 跳转到订单详情页面
   */
  onOrderView = (record) => {
    this.props.dispatch({
      type: 'order/getByBillNumberAndDcUuid',
      payload: {
        dcUuid: loginOrg().uuid,
        sourceBillNumber: record
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

  //商品列查询
  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={placeholderLocale(commonLocale.inStoreLocale)}
          value={this.state.searchText}
          onChange={e => this.setText(e.target.value ? e.target.value : undefined)}
          onPressEnter={() => this.handleSearch(confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={
            () => this.handleSearch(confirm)
          }
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          {'查询'}
        </Button>
        <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
          {'重置'}
        </Button>
      </div>
    ),
    filterIcon: () => (
      <Icon type="search" style={{ color: this.state.searchText ? '#1890ff' : undefined }} />
    ),
    render: val =>
      <a onClick={this.onViewStore.bind(true, val ? val.uuid : undefined)}
        disabled={!havePermission(STORE_RES.VIEW)}><EllipsisCol colValue={convertCodeName(val)} /> </a>,
  });

  drawTabPanes = () => {
    let tabPanes = [
      this.drawBasicInfoTab(),
    ];

    return tabPanes;
  }

  darwProcess = () => {
    return <a onClick={() => this.viewProcessView()}>流程进度</a>;
  };

  viewProcessView = () => {
    this.setState({
      showProcessView: !this.state.showProcessView
    });
  };

  drawBasicInfoTab = () => {
    // const entity = this.props.alcNtc.entity;
    const entity = this.state.entity
    let allArticleQty = 0;
    let articleUuids = [];
    let allQtyStr = '0';
    let allAmount = 0;
    entity && entity.items && entity.items.map(item => {
      if (item.qtyStr) {
        allQtyStr = add(allQtyStr, item.qtyStr);
      }
      if (articleUuids.indexOf(item.article.uuid) === -1) {
        allArticleQty = allArticleQty + 1;
        articleUuids.push(item.article.uuid);
      }
      if (item.price) {
        allAmount = allAmount + item.price * item.qty;
      }
    })
    //概要内容
    let basicItems = [{
      label: alcNtcLocale.type,
      value: entity ? entity.type : ''
    },
    {
      label: '调度类型',
      value: entity.schedulingType && SchedulingType[entity.schedulingType].caption
    },
    {
      label: commonLocale.inOwnerLocale,
      value: convertCodeName(entity.owner)
    },
    {
      label: commonLocale.inStoreLocale,
      value: <a onClick={this.onViewStore.bind(true, entity.store ? entity.store.uuid : undefined)}
        disabled={!havePermission(STORE_RES.VIEW)}>{convertCodeName(entity.store)}</a>
    },
    {
      label: commonLocale.inlogisticModeLocale,
      value: entity.logisticMode && LogisticMode[entity.logisticMode].caption
    }, {
      label: commonLocale.inWrhLocale,
      value: convertCodeName(entity.wrh)
    }, {
      label: alcNtcLocale.waveBillNumber,
      value: entity.waveBillNumber ?
        <span> <a onClick={this.onWaveView.bind(this, entity.waveBillNumber)}
          disabled={!havePermission(WAVEBILL_RES.VIEW)}>{entity.waveBillNumber}</a> </span> : <Empty />
    }, {
      label: commonLocale.validDateLocale,
      value: moment(entity.expireDate).format('YYYY-MM-DD')
    }, {
      label: '配货日期',
      value: moment(entity.alcDate).format('YYYY-MM-DD')
    },
    {
      label: alcNtcLocale.sourceBillNumber,
      value: entity.sourceBillNumber
    },
    {
      label: commonLocale.orderBillNumberLocal,
      value: entity.orderBillNumber ?
        <span> <a onClick={this.onOrderView.bind(this, entity.orderBillNumber)}
          disabled={!havePermission(ORDER_RES.VIEW)}>{entity.orderBillNumber}</a> </span> : <Empty />
    },
    {
      label: alcNtcLocale.sourceOrderBillNumber,
      value: entity.sourceOrderBillNumber
    },
    {
      label: alcNtcLocale.groupName,
      value: entity.groupName
    },
    {
      label: commonLocale.noteLocale,
      value: entity.note
    }
    ];

    //明细表格
    const columns = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth
      },
      {
        title: commonLocale.inArticleLocale,
        width: colWidth.codeColWidth,
        render: (record) =>
          <span>
            <a onClick={this.onViewArticle.bind(this, record.article?record.article.uuid:undefined)}
            ><EllipsisCol colValue={convertCodeName(record.article)} /></a>
          </span>
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        key: 'qpcStr',
        width: itemColWidth.qpcStrColWidth,
        render: (val, record) => {
          return record.qpcStr + '/' + record.munit;
        }
      },
      {
        title: commonLocale.inPriceLocale,
        dataIndex: 'price',
        key: 'price',
        width: itemColWidth.priceColWidth,
        render: text => text != undefined ? text : <Empty />
      },
      {
        title: commonLocale.inQtyStrLocale + '/' + commonLocale.inAllPlanQtyStrLocale + '/' + commonLocale.inAllRealQtyStrLocale,
        key: 'qtyStr',
        width: itemColWidth.qtyStrColWidth * 2,
        render: (record) => {
          return record.qtyStr + '/' + record.planQtyStr + '/' + record.realQtyStr;
        }
      },
      {
        title: commonLocale.inQtyLocale + '/' + commonLocale.inAllPlanQtyLocale + '/' + commonLocale.inAllRealQtyLocale,
        key: 'qty',
        width: itemColWidth.qtyColWidth * 2,
        render: (record) => {
          return record.qty + '/' + record.planQty + '/' + record.realQty;
        }
      },
      {
        title: "批号",
        dataIndex: 'productionBatch',
        width: colWidth.dateColWidth,
        render: val => {
          return val ? val : <Empty />
        }
      },
      {
        title: "指定开始生产日期",
        dataIndex: 'targetProductDate',
        width: colWidth.dateColWidth,
        render: val => {
          return val ? moment(val).format('YYYY-MM-DD') : < Empty />;
        }
      },
      {
        title: "指定结束生产日期",
        dataIndex: 'targetValidDate',
        width: colWidth.dateColWidth,
        render: val => {
          return val ? moment(val).format('YYYY-MM-DD') : < Empty />;
        }
      },
    ];

    return (
      <TabPane key="basicInfo" tab={commonLocale.basicInfoLocale}>
        <ViewPanel items={basicItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()}/>
        <ViewTablePanel title={commonLocale.itemsLocale} scroll={{ x: 1300, y: 300 }} columns={columns} data={entity.items ? entity.items : []} />
        <ConfirmModal
          visible={this.state.modalVisible}
          operate={this.state.operate}
          object={alcNtcLocale.title + ':' + this.state.entity.billNumber}
          onOk={this.handleOk}
          onCancel={this.handleModalVisible}
        />
      </TabPane>
    );
  }

  drawOthers = () => {
    const others = [];
    if (this.state.showProcessView) {
      const { entity } = this.state;

      const data = [{
        title: '配单接收',
        subTitle: entity.createInfo.time,
        current: entity.state !== '',
        description: [{
          label: commonLocale.inAllQtyStrLocale,
          value: entity.totalQtyStr
        },
          {
            label: commonLocale.inAllArticleCountLocale,
            value: entity.totalArticleCount
          },
          {
            label: commonLocale.inAllAmountLocale,
            value: entity.totalAmount
          },
          {
            label: commonLocale.inAllVolumeLocale,
            value: entity.totalVolume
          },
          {
            label: commonLocale.inAllWeightLocale,
            value: entity.totalWeight
          }
        ]
      },
        {
          title: '开始拣货',
          subTitle: entity.startPickTime,
          current: entity.state == State.INPROGRESS.name,
          description: [
            {
              label: commonLocale.inAllPlanQtyStrLocale,
              value: entity.totalPlanQtyStr
            },
            {
              label: commonLocale.inAllPlanArticleCountLocale,
              value: entity.totalPlanArticleCount
            },
            {
              label: commonLocale.inAllPlanAmountLocale,
              value: entity.totalPlanAmount
            },
            {
              label: commonLocale.inAllPlanVolumeLocale,
              value: entity.totalPlanVolume
            },
            {
              label: commonLocale.inAllPlanWeightLocale,
              value: entity.totalPlanWeight
            }
          ]
        },
        {
          title: '结束拣货',
          subTitle: entity.endPickTime,
          current: entity.state == State.FINISHED.name,
          description: [
            {
              label: commonLocale.inAllRealQtyStrLocale,
              value: entity.totalRealQtyStr
            }, {
              label: commonLocale.inAllRealArticleCountLocale,
              value: entity.totalRealArticleCount
            }, {
              label: commonLocale.inAllRealAmountLocale,
              value: entity.totalRealAmount
            }, {
              label: commonLocale.inAllRealVolumeLocale,
              value: entity.totalRealVolume
            }, {
              label: commonLocale.inAllRealWeightLocale,
              value: entity.totalRealWeight
            }]
        },
        {
          title: '开始装车',
          subTitle: entity.startShipTime,
          current: entity.shipState == ShipState.SHIPING.name,
          description: [

          ]
        },
        {
          title: '结束装车',
          subTitle: !entity.shipUploadDate ? entity.endShipTime : entity.endShipTime + ' 装车上传：' + entity.shipUploadDate ,
          current: entity.shipState == ShipState.SHIPED.name,
          description: [
            {
              label: commonLocale.inAllShipQtyStrLocale,
              value: entity.totalShipQtyStr
            }, {
              label: commonLocale.inAllShipArticleCountLocale,
              value: entity.totalShipArticleCount
            }, {
              label: commonLocale.inAllShipAmountLocale,
              value: entity.totalShipAmount
            }, {
              label: commonLocale.inAllShipVolumeLocale,
              value: entity.totalShipVolume
            }, {
              label: commonLocale.inAllShipWeightLocale,
              value: entity.totalShipWeight
            }]
        }
      ];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }

}
