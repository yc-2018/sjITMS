import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, Tabs, Modal, message } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import TagUtil from '@/pages/Component/TagUtil';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { convertCodeName } from '@/utils/utils';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { binUsage, getUsageCaption } from '@/utils/BinUsage';
import { PUTAWAY_RES } from './PutawayPermission';
import { PutawayBillState, OperateMethod } from './PutawayContants';
import { putawayLocale } from './PutawayLocale';
import TimeLinePanel from '@/pages/Component/Form/TimeLinePanel';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';

const TabPane = Tabs.TabPane;

@connect(({ putaway, loading }) => ({
  putaway,
  loading: loading.models.putaway,
}))
export default class PutawayViewPage extends ViewPage {
  constructor(props) {
    super(props);
    this.state = {
      entity: {},
      items: [],
      entityUuid: props.putaway.entityUuid,
      billNumber: props.billNumber,
      title: '',
      operate: '',
      modalVisible: false,
      createPermission: PUTAWAY_RES.CREATE,
    }
  }
  componentDidMount() {
    this.refresh(this.state.billNumber, this.state.entityUuid);
  }

  componentWillReceiveProps(nextProps) {
    const entity = nextProps.putaway.entity;
    if (entity && (entity.billNumber === this.state.billNumber || entity.uuid === this.state.entityUuid)) {
      this.setState({
        entity: entity,
        items: entity.items ? entity.items.sort(function (a, b) {
          return a.line - b.line
        }) : [],
        title: putawayLocale.title + '：' + entity.billNumber,
        entityUuid: entity.uuid,
        billNumber: entity.billNumber,
        showProcessView: false
      });
    }

    const nextBillNumber = nextProps.billNumber;
    if (nextBillNumber && nextBillNumber !== this.state.billNumber) {
      this.setState({
        billNumber: nextBillNumber
      });
      this.refresh(nextBillNumber);
    }
  }
  /**
  * 刷新
  */
  refresh = (billNumber, uuid) => {
    if (!billNumber && !uuid) {
      billNumber = this.state.billNumber;
    }

    if (billNumber) {
      this.props.dispatch({
        type: 'putaway/getByBillNumberAndDcUuid',
        payload: billNumber,
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的上架单' + billNumber + '不存在！');
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
        type: 'putaway/get',
        payload: uuid,
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的上架单不存在！');
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
      type: 'putaway/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }
  /**
  * 编辑
  */
  onEdit = () => {
    this.props.dispatch({
      type: 'putaway/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entityUuid,
        ownerUuid: this.state.entity.owner.uuid,
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
        type: 'putaway/previousBill',
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
        type: 'putaway/nextBill',
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
    if (operate === commonLocale.deleteLocale) {
      this.onDelete();
    } else if (operate === commonLocale.auditLocale) {
      this.onAudit();
    }
  }
  /**
   * 删除
   */
  onDelete = () => {
    const { entity } = this.state
    this.props.dispatch({
      type: 'putaway/delete',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: (response) => {
        if (response && response.success) {
          this.onBack();
          message.success(commonLocale.removeSuccessLocale)
        } else {
          message.error(response.message)
        }
      }
    })
  }
  /**
   * 审核
   */
  onAudit = () => {
    const { entity } = this.state
    this.props.dispatch({
      type: 'putaway/audit',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: response => {
        if (response && response.success) {
          this.refresh();
          message.success(commonLocale.auditSuccessLocale)
        }
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }

  /**
   * 绘制订单状态tag
   */
  drawStateTag = () => {
    if (this.state.entity.state) {
      return (
        <TagUtil value={this.state.entity.state} />
      );
    }
  }

  /**
   * 新建
   */
  onCreate = () => {
    this.props.dispatch({
      type: 'putaway/showPage',
      payload: {
        showPage: 'create',
        billNumber: this.state.billNumber
      }
    });
  }
  /**
  * 绘制右上角按钮
  */
  drawActionButtion = () => {
    if (this.state.entity.state) {
      return (
        <Fragment>
          <Button onClick={this.onBack}>
            {commonLocale.backLocale}
          </Button>
          {
            PutawayBillState[this.state.entity.state].name == 'SAVED' ?
              <Button onClick={() => this.handleModalVisible(commonLocale.deleteLocale)} disabled={!havePermission(PUTAWAY_RES.DELETE)}>
                {commonLocale.deleteLocale}
              </Button>
              : null
          }
          {
            PutawayBillState[this.state.entity.state].name == 'SAVED' ?
              <Button onClick={this.onEdit} disabled={!havePermission(PUTAWAY_RES.CREATE)}>
                {commonLocale.editLocale}
              </Button>
              : null
          }
          {
            PutawayBillState[this.state.entity.state].name == 'SAVED' ?
              <Button onClick={() => this.handleModalVisible(commonLocale.auditLocale)} type='primary' disabled={!havePermission(PUTAWAY_RES.AUDIT)}>
                {commonLocale.auditLocale}
              </Button>
              : null
          }
        </Fragment>
      );
    }
  }
  /**
  * 绘制信息详情
  */
  drawPutawayBillInfoTab = () => {
    const { entity } = this.state;

    const items = entity.items;
    let profileItems = [
      {
        label: putawayLocale.putawayBillType,
        value: entity.type ? OperateMethod[entity.type].caption : ''
      },
      {
        label: putawayLocale.putawayer,
        value: convertCodeName(entity.putawayer)
      },
      {
        label: commonLocale.inOwnerLocale,
        value: convertCodeName(entity.owner)
      },
      {
        label: commonLocale.noteLocale,
        value: entity.note
      }
    ];
    let timeLineData = [
      { title: putawayLocale.startTime, time: entity.startTime },
      { title: putawayLocale.endTime, time: entity.endTime }
    ];
    let current = 0;
    for (let i = timeLineData.length - 1; i >= 0; i--) {
      if (timeLineData[i].time) {
        current = i;
        break;
      }
    }
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
    let itemsCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: putawayLocale.articleAndSpec,
        width: itemColWidth.articleColWidth,
        render: record => <span><a onClick={this.onViewArticle.bind(this, record.article?record.article.uuid:undefined)}><EllipsisCol colValue={convertCodeName(record.article)} /></a><span> / {record.spec}</span></span>
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        width: itemColWidth.qpcStrColWidth,
        render: record => record.qpcStr + ' / ' + record.munit
      },
      {
        title: commonLocale.inQtyStrLocale,
        width: itemColWidth.qtyStrColWidth,
        dataIndex: 'qtyStr',
      },
      {
        title: commonLocale.inQtyLocale,
        width: itemColWidth.qtyStrColWidth,
        dataIndex: 'qty',
      },
      {
        title: commonLocale.inProductDateLocale,
        width: colWidth.dateColWidth,
        render: record => record.productDate ? moment(record.productDate).format('YYYY-MM-DD') : ''
      },
      {
        title: commonLocale.inValidDateLocale,
        width: colWidth.dateColWidth,
        render: record => record.validDate ? moment(record.validDate).format('YYYY-MM-DD') : ''
      },
      {
        title: putawayLocale.sourceContainerBar,
        width: colWidth.codeColWidth,
        render: record => record.sourceContainerBarcode == "-" ? record.sourceContainerBarcode : <a onClick={this.onViewContainer.bind(this, record.sourceContainerBarcode)}>{record.sourceContainerBarcode}</a>
      },
      {
        title: putawayLocale.targetContainerBar,
        width: colWidth.codeColWidth,
        render: record => record.targetContainerBarcode == "-" ? record.targetContainerBarcode : <a onClick={this.onViewContainer.bind(this, record.targetContainerBarcode)}>{record.targetContainerBarcode}</a>
      },
      {
        title: putawayLocale.sourceBin,
        width: colWidth.codeColWidth,
        render: record => <EllipsisCol colValue={record.sourceBinCode && record.sourceBinUsage ? (record.sourceBinCode + "[" + binUsage[record.sourceBinUsage].caption + "]") : <Empty />} />
      },
      {
        title: putawayLocale.targetBin,
        width: colWidth.codeColWidth,
        render: record => <EllipsisCol colValue={record.targetBinCode && record.targetBinUsage ? (record.targetBinCode + "[" + binUsage[record.targetBinUsage].caption + "]") : <Empty />} />
      },
    ]
    let noteItems = [{
      value: entity.note
    }];
    return (
      <TabPane key="basicInfo" tab={putawayLocale.title}>
          <ViewPanel onCollapse={this.onCollapse} items={profileItems} title={commonLocale.profileItemsLocale}  rightTile={this.darwProcess()}/>
          <ViewTablePanel
            title={commonLocale.itemsLocale}
            columns={itemsCols}
            data={this.state.items}
            tableId={'putaway.view.table'}
          />
          <div>
            <ConfirmModal
              visible={this.state.modalVisible}
              operate={this.state.operate}
              object={putawayLocale.title + ':' + this.state.entity.billNumber}
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
      this.drawPutawayBillInfoTab(),
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
      let allArticleQty = 0;
      let articleUuids = [];
      entity.items && entity.items.map(item => {
        if (articleUuids.indexOf(item.article.uuid) === -1) {
          allArticleQty = allArticleQty + 1;
          articleUuids.push(item.article.uuid);
        }
      })
      const data = [{
        title: '开始上架',
        subTitle: entity.startTime,
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
        subTitle: entity.endTime,
        current: entity.state == PutawayBillState.AUDITED.name,
      }];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
