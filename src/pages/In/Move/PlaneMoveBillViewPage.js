import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Button, Tabs, message } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import Empty from '@/pages/Component/Form/Empty';
import TagUtil from '@/pages/Component/TagUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import TimeLinePanel from '@/pages/Component/Form/TimeLinePanel';
import { itemColWidth, colWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { binUsage } from '@/utils/BinUsage';
import { planeMoveLocale } from './PlaneMoveLocale';
import { res } from './PlaneMovePermission';
import { state, getTypeCaption } from './PlaneMoveContants';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';

const TabPane = Tabs.TabPane;

@connect(({ planeMove, loading }) => ({
  planeMove,
  loading: loading.models.planeMove,
}))
export default class PlaneMoveBillViewPage extends ViewPage {

  constructor(props) {
    super(props);

    this.state = {
      entityUuid: props.entityUuid,
      billNumber: props.billNumber,
      title: '',
      operate: '',
      modalVisible: false,
      entity: {
        items: []
      }
    }
  }

  componentDidMount() {
    this.refresh(this.state.billNumber);
  }

  componentWillReceiveProps(nextProps) {
    const entity = nextProps.planeMove.entity;
    if (entity && entity.billNumber === this.state.billNumber) {
      this.setState({
        entity: entity,
        title: planeMoveLocale.title + '：' + entity.billNumber,
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

  refresh = (billNumber, uuid) => {
    if (!billNumber && !uuid) {
      billNumber = this.state.billNumber;
    }

    if (billNumber) {
      this.props.dispatch({
        type: 'planeMove/getByBillNumber',
        payload: {
          billNumber: billNumber
        },
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的平移单' + billNumber + '不存在！');
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
        type: 'planeMove/get',
        payload: {
          uuid: uuid
        },
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的平移单不存在！');
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

  onBack = () => {
    this.props.dispatch({
      type: 'planeMove/showPage',
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
        type: 'planeMove/previousBill',
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
        type: 'planeMove/nextBill',
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
    const { operate } = this.state;
    if (operate === commonLocale.auditLocale) {
      this.onAudit();
    }
  }
  onAudit = () => {
    this.props.dispatch({
      type: 'planeMove/audit',
      payload: {
        uuid: this.state.entity.uuid,
        version: this.state.entity.version
      },
      callback: response => {
        if (response && response.success) {
          this.props.dispatch({
            type: 'planeMove/get',
            payload: {
              uuid: this.state.entity.uuid
            }
          });
          message.success(commonLocale.auditSuccessLocale)
        } else {
          message.error(response.message)
        }
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }

  drawStateTag = () => {
    if (this.state.entity.state) {
      return (
        <TagUtil value={this.state.entity.state} />
      );
    }
  }

  drawActionButtion = () => {
    return (
      <Fragment>
        <Button onClick={this.onBack}>
          {commonLocale.backLocale}
        </Button>
        {
          state.INPROGRESS.name === this.state.entity.state ?
            <Button type="primary" disabled={!havePermission(res.audit)}
              onClick={() => this.handleModalVisible(commonLocale.auditLocale)}>
              {commonLocale.auditLocale}
            </Button>
            : null
        }
      </Fragment>
    );
  }

  drawPlaneMoveInfoTab = () => {
    const { entity } = this.state;

    let profileItems = [
      {
        label: planeMoveLocale.type,
        value: getTypeCaption(entity.type)
      },
      {
        label: planeMoveLocale.mover,
        value: convertCodeName(entity.mover)
      },
      {
        label: commonLocale.ownerLocale,
        value: convertCodeName(entity.owner)
      },
      {
        label: planeMoveLocale.sourceWrh,
        value: convertCodeName(entity.sourceWrh)
      },
      {
        label: planeMoveLocale.targetWrh,
        value: convertCodeName(entity.targetWrh)
      },
      {
        label: commonLocale.noteLocale,
        value: entity.note
      }
    ];

    /**
     * 时间轴
     */
    let timeLineData = [
      { title: planeMoveLocale.startPlanMoveDate, time: entity.startPlaneMoveDate },
      { title: planeMoveLocale.endPlanMoveDate, time: entity.endPlaneMoveDate },
    ];

    timeLineData.sort(function (a, b) {
      if (a.time && b.time) {
        return a.time > b.time;
      } else if (a.time) {
        return false;
      }
      return true;
    });
    let current = 0;
    for (let i = timeLineData.length - 1; i >= 0; i--) {
      if (timeLineData[i].time) {
        current = i;
        break;
      }
    }

    // 收缩
    let collapseItems = [
      <TimeLinePanel header={commonLocale.timeLineLocale} items={timeLineData} current={current} />
    ];
    let businessItems = [{
      label: commonLocale.inAllQtyStrLocale,
      value: entity.totalQtyStr
    }, {
      label: commonLocale.inAllArticleCountLocale,
      value: entity.totalArticleCount
    }, {
      label: commonLocale.inAllAmountLocale,
      value: entity.totalAmount
    }, {
      label: commonLocale.inAllVolumeLocale,
      value: entity.totalVolume
    }, {
      label: commonLocale.inAllWeightLocale,
      value: entity.totalWeight
    }];

    let articleCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: planeMoveLocale.articleAndSpec,
        width: itemColWidth.articleColWidth,
        render: record => <span><a onClick={this.onViewArticle.bind(this, record.article?record.article.uuid:undefined)}><EllipsisCol colValue={convertCodeName(record.article)} /></a><span> / {record.spec}</span></span>
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        width: itemColWidth.qpcStrColWidth,
        render: record => record.qpcStr + ' / ' + record.munit
      },
      {
        title: commonLocale.caseQtyStrLocale,
        width: itemColWidth.priceColWidth,
        render: record => record.qtyStr
      },
      {
        title: planeMoveLocale.sourceBinCode,
        width: colWidth.dateEditColWidth,
        render: record => <EllipsisCol colValue={record.sourceBinCode && record.sourceBinUsage ? (record.sourceBinCode + "[" + binUsage[record.sourceBinUsage].caption + "]") : <Empty />} />
      },
      {
        title: planeMoveLocale.sourceContainerBarcode,
        width: colWidth.qpcStrColWidth,
        render: record => record.sourceContainerBarcode == "-" ? record.sourceContainerBarcode : <a onClick={this.onViewContainer.bind(this, record.sourceContainerBarcode)}>{record.sourceContainerBarcode}</a>
      },
      {
        title: planeMoveLocale.targetBinCode,
        width: colWidth.dateEditColWidth,
        render: record => <EllipsisCol colValue={record.targetBinCode && record.targetBinUsage ? (record.targetBinCode + "[" + binUsage[record.targetBinUsage].caption + "]") : <Empty />} />
      },
      {
        title: planeMoveLocale.targetContainerBarcode,
        width: colWidth.qpcStrColWidth,
        render: record => record.targetContainerBarcode == "-" ? record.targetContainerBarcode : <a onClick={this.onViewContainer.bind(this, record.targetContainerBarcode)}>{record.targetContainerBarcode}</a>
      },
      {
        title: commonLocale.productionDateLocale,
        width: colWidth.dateColWidth,
        render: record => moment(record.productDate).format('YYYY-MM-DD')
      },
      {
        title: commonLocale.validDateLocale,
        width: colWidth.dateColWidth,
        render: record => moment(record.validDate).format('YYYY-MM-DD')
      },
      {
        title: commonLocale.productionBatchLocale,
        width: itemColWidth.numberEditColWidth,
        render: record => <EllipsisCol colValue={record.productionBatch} />
      },
    ];
    let noteItems = [{
      value: entity.note
    }];

    return (
      <TabPane key="basicInfo" tab={planeMoveLocale.title}>
          <ViewPanel onCollapse={this.onCollapse} items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()} />
          <ViewTablePanel
            title={commonLocale.itemsLocale}
            columns={articleCols}
            data={entity.items ? entity.items : []}
            tableId={'planeMove.view.table'}
          />
          <div>
            <ConfirmModal
              visible={this.state.modalVisible}
              operate={this.state.operate}
              object={planeMoveLocale.title + ':' + this.state.entity.billNumber}
              onOk={this.handleOk}
              onCancel={this.handleModalVisible}
            />
          </div>
      </TabPane>
    );
  }

  drawTabPanes = () => {
    let tabPanes = [
      this.drawPlaneMoveInfoTab(),
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
  drawOthers = () => {
    const others = [];
    if (this.state.showProcessView) {
      const { entity } = this.state;
      const data = [{
        title: '开始平移',
        subTitle: entity.startPlaneMoveDate,
        current: entity.state !== '',
        description: [{
          label: commonLocale.inAllQtyStrLocale,
          value: entity.totalQtyStr
        }, {
          label: commonLocale.inAllArticleCountLocale,
          value: entity.totalArticleCount
        }, {
          label: commonLocale.inAllAmountLocale,
          value: entity.totalAmount
        }, {
          label: commonLocale.inAllVolumeLocale,
          value: entity.totalVolume
        }, {
          label: commonLocale.inAllWeightLocale,
          value: entity.totalWeight
        }
        ]
      },{
        title: '结束',
        subTitle: entity.endPlaneMoveDate,
        current: entity.state == state.audited.name,
      }];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
