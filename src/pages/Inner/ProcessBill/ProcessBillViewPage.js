import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import update from 'immutability-helper';
import HTML5Backend from 'react-dnd-html5-backend';
import PropTypes from 'prop-types';
import { Button, Tabs, Modal, message, Progress, Row, Col, Table, Spin } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import CollapsePanel from '@/pages/Component/Form/CollapsePanel';
import TimeLinePanel from '@/pages/Component/Form/TimeLinePanel';
import { RplMode, RplType, PickMethod } from '@/pages/Facility/PickArea/PickAreaContants';
import TagUtil from '@/pages/Component/TagUtil';
import { State, RplBillType } from '@/pages/Out/Rpl/RplContants';
import { PickupBillState, PickType } from '@/pages/Out/PickUp/PickUpBillContants';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import Empty from '@/pages/Component/Form/Empty';
import { convertCodeName } from '@/utils/utils';
import { binUsage, getUsageCaption } from '@/utils/BinUsage';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { PROCESSBILL_RES } from './ProcessBillPermission';
import { ProcessBillState, Type } from './ProcessBillContants';
import { processBillLocale } from './ProcessBillLocale';
import styles from './ProcessBill.less';
import { routerRedux } from 'dva/router';
const TabPane = Tabs.TabPane;

@connect(({ process, loading }) => ({
  process,
  loading: loading.models.process
}))
export default class ProcessBillViewPage extends ViewPage {
  constructor(props) {
    super(props);
    this.state = {
      entity: {},
      entityItems: [],
      rawItems: [],
      endItems: [],
      entityUuid: props.entityUuid,
      processBillNumber: props.processBillNumber,
      processState: props.processState,
      title: '',
      operate: '',
      modalVisible: false,
    }
  }
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    const { rawItems, endItems } = this.state;

    if (nextProps.process.entity && nextProps.process.entity != this.props.process.entity) {
      this.setState({
        entity: nextProps.process.entity,
        entityItems: nextProps.process.entity.items,
        title: processBillLocale.title + ':' + nextProps.process.entity.billNumber,
        entityUuid: nextProps.process.entity.uuid,
        processBillNumber: nextProps.process.entity.billNumber
      });
      let rawLine = 1;
      let endLine = 1;
      if (nextProps.process.entity.items.length > 0) {
        rawItems.length = 0;
        endItems.length = 0;
        nextProps.process.entity.items.forEach(item => {
          if (item.type === Type.RAW.name) {
            item.line = rawLine;
            rawLine++;
            rawItems.push(item);
          } else if (item.type === Type.ENDPRODUCT.name) {
            item.line = endLine;
            endLine++;
            endItems.push(item);
          }
        });
        this.setState({
          rawItems: [...rawItems],
          endItems: [...endItems],
        })
      }
    }

  }
  /**
  * 刷新
  */
  refresh() {
    const { entityUuid } = this.state;
    this.props.dispatch({
      type: 'process/get',
      payload: {
        uuid: entityUuid
      },
    });
  }

  /**
  * 返回
  */
  onBack = () => {
    this.props.dispatch({
      type: 'process/showPage',
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
    if (entity.uuid) {
      this.props.dispatch({
        type: 'process/previousBill',
        payload: entity.billNumber
      });
    }
  }
  /**
   * 点击下一单
   */
  nextBill = () => {
    const { entity } = this.state;
    if (entity.uuid) {
      this.props.dispatch({
        type: 'process/nextBill',
        payload: entity.billNumber
      });
    }
  }
  /**
  * 编辑
  */
  onEdit = () => {
    this.props.dispatch({
      type: 'process/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entityUuid,
        processBillNumber: this.state.processBillNumber
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

  /**
   * 模态框确认操作
   */
  handleOk = () => {
    const { operate } = this.state;
    if (operate === commonLocale.deleteLocale) {
      this.onDelete();
    }

    if (operate === commonLocale.auditLocale) {
      this.onAudit();
    }
  }

  /**
   * 删除
   */
  onDelete = () => {
    const { entity } = this.state
    this.props.dispatch({
      type: 'process/onRemove',
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
  * 审核
  */
  onAudit = () => {
    const { entity } = this.state
    this.props.dispatch({
      type: 'process/onAudit',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: (response) => {
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
            ProcessBillState[this.state.entity.state].name == 'SAVED' ?
              <Button onClick={this.onEdit}
                disabled={!havePermission(PROCESSBILL_RES.CREATE)}
              >
                {commonLocale.editLocale}
              </Button>
              : null
          }
          {
            ProcessBillState[this.state.entity.state].name == 'SAVED' ?
              <Button onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}
                disabled={!havePermission(PROCESSBILL_RES.REMOVE)}
              >
                {commonLocale.deleteLocale}
              </Button>
              : null
          }
          {
            ProcessBillState[this.state.entity.state].name == 'SAVED' ?
              <Button onClick={() => this.handleModalVisible(commonLocale.auditLocale)}
                type='primary'
                disabled={!havePermission(PROCESSBILL_RES.AUDIT)}
              >
                {commonLocale.auditLocale}
              </Button>
              : null
          }
          {
            <Button type="primary" onClick={() => this.previousBill()}>
              {commonLocale.previousBill}
            </Button>
          }
          {
            <Button type="primary" onClick={() => this.nextBill()}>
              {commonLocale.nextBill}
            </Button>
          }

        </Fragment>
      );
    }
  }

  /**
  * 绘制信息详情
  */
  drawItemInfoTab = () => {
    const { entity, entityItems, endItems, rawItems } = this.state;

    // 基本信息
    let profileItems = [
      {
        label: processBillLocale.processScheme,
        value: entity.processScheme ? convertCodeName(entity.processScheme) : <Empty />
      },
      {
        label: commonLocale.inOwnerLocale,
        value: convertCodeName(entity.owner)
      },
      {
        label: commonLocale.inWrhLocale,
        value: convertCodeName(entity.wrh)
      },
      {
        label: commonLocale.noteLocale,
        value: entity.note
      }
    ];

    // 统计信息
    let businessItems = [{
      label: processBillLocale.raw + commonLocale.inAllQtyStrLocale,
      value: entity.rawTotalQtyStr
    }, {
      label: processBillLocale.end + commonLocale.inAllQtyStrLocale,
      value: entity.endProductTotalQtyStr
    }, {
      label: processBillLocale.raw + commonLocale.inAllAmountLocale,
      value: entity.rawTotalAmount
    }, {
      label: processBillLocale.end + commonLocale.inAllAmountLocale,
      value: entity.endProductTotalAmount
    }, {
      label: processBillLocale.raw + commonLocale.inAllVolumeLocale,
      value: entity.rawTotalVolume
    }, {
      label: processBillLocale.end + commonLocale.inAllVolumeLocale,
      value: entity.endProductTotalVolume
    }, {
      label: processBillLocale.raw + commonLocale.inAllWeightLocale,
      value: entity.rawTotalWeight
    }, {
      label: processBillLocale.end + commonLocale.inAllWeightLocale,
      value: entity.endProductTotalWeight
    }, {
      label: processBillLocale.raw + commonLocale.inAllArticleCountLocale,
      value: entity.rawTotalArticleCount
    }, {
      label: processBillLocale.end + commonLocale.inAllArticleCountLocale,
      value: entity.endProductTotalArticleCount
    }];

    // 原料信息
    let rawCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: commonLocale.inArticleLocale,
        dataIndex: 'article',
        key: 'article',
        width: colWidth.codeNameColWidth,
        render: (text, record) => {
          return <span>
            <a onClick={this.onViewArticle.bind(true, record.article ? record.article.uuid : undefined)}><EllipsisCol colValue={`[${record.article.code}]${record.article.name}`} /></a>
          </span>;
        }
      },
      {
        title: commonLocale.vendorLocale,
        dataIndex: 'vendor',
        key: 'vendor',
        width: colWidth.codeNameColWidth,
        render: val => <EllipsisCol colValue={convertCodeName(val)} />
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
        title: commonLocale.bincodeLocale,
        key: 'binCode',
        width: colWidth.codeColWidth,
        render: record => <EllipsisCol colValue={record.binCode && record.binUsage ? (record.binCode + "[" + binUsage[record.binUsage].caption + "]") : <Empty />} />
      },
      {
        title: commonLocale.inContainerBarcodeLocale,
        key: 'containerBarcode',
        width: colWidth.codeColWidth - 100,
        render: record => record.containerBarcode == "-" ? record.containerBarcode : <a onClick={this.onViewContainer.bind(true, record.containerBarcode)}>{record.containerBarcode}</a>

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
        title: commonLocale.inProductionBatchLocale,
        dataIndex: 'productionBatch',
        key: 'productionBatch',
        width: itemColWidth.numberEditColWidth,
      },
      {
        title: commonLocale.inStockBatchLocale,
        dataIndex: 'stockBatch',
        key: 'stockBatch',
        width: itemColWidth.numberEditColWidth,
        render: val => val ? <EllipsisCol colValue={val} /> : <Empty />
      },
      {
        title: commonLocale.caseQtyStrLocale,
        dataIndex: 'qtyStr',
        key: 'qtyStr',
        width: itemColWidth.qtyStrColWidth,
      },
      {
        title: commonLocale.inQtyLocale,
        dataIndex: 'qty',
        key: 'qty',
        width: itemColWidth.qtyColWidth
      },
      {
        title: commonLocale.inPriceLocale,
        dataIndex: 'price',
        key: 'price',
        width: itemColWidth.priceColWidth,
      }
    ];

    // 成品信息
    let endCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        dataIndex: 'article',
        width: colWidth.codeNameColWidth,
        render: (text, record) => {
          return <span>
            <a onClick={this.onViewArticle.bind(true, record.article ? record.article.uuid : undefined)}><EllipsisCol colValue={`[${record.article.code}]${record.article.name}`} /></a>
          </span>;
        }
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
        title: commonLocale.vendorLocale,
        dataIndex: 'vendor',
        key: 'vendor',
        width: colWidth.codeNameColWidth,
        render: val => <EllipsisCol colValue={convertCodeName(val)} />
      },
      {
        title: commonLocale.bincodeLocale,
        dataIndex: 'binCode',
        key: 'binCode',
        width: colWidth.codeColWidth,
        render: (val, record) => {
          return (
            record.binCode && record.binUsage ? (record.binCode + "[" + binUsage[record.binUsage].caption + "]") : <Empty />
          );
        }
      },
      {
        title: commonLocale.inContainerBarcodeLocale,
        key: 'containerBarcode',
        width: colWidth.codeColWidth - 100,
        render: record => record.containerBarcode == "-" ? record.containerBarcode : <a onClick={this.onViewContainer.bind(true, record.containerBarcode)}>{record.containerBarcode}</a>

      },
      {
        title: commonLocale.inProductDateLocale,
        dataIndex: 'productDate',
        key: 'productDate',
        width: colWidth.dateColWidth,
        render: val => moment(val).format('YYYY-MM-DD')
      },
      {
        title: commonLocale.inValidDateLocale,
        dataIndex: 'validDate',
        key: 'validDate',
        width: colWidth.dateColWidth,
        render: val => moment(val).format('YYYY-MM-DD')
      },
      {
        title: commonLocale.productionBatchLocale,
        dataIndex: 'productionBatch',
        key: 'productionBatch',
        width: itemColWidth.numberEditColWidth
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
        title: commonLocale.inPriceLocale,
        dataIndex: 'price',
        key: 'price',
        width: itemColWidth.priceColWidth,
        render: val => <EllipsisCol colValue={val} />
      },
      {
        title: commonLocale.noteLocale,
        dataIndex: 'note',
        render: text => text ? <EllipsisCol colValue={text} /> : <Empty />,
        width: itemColWidth.noteEditColWidth
      }
    ];

    let itemsTab = <Tabs defaultActiveKey="raw" className={styles.ItemTabs} >
      <TabPane tab={processBillLocale.rawInfoList} key="raw">
        <ViewTablePanel
          columns={rawCols}
          data={rawItems}
          hasPagination={false}
        />
      </TabPane>
      <TabPane tab={processBillLocale.endInfoList} key="end">
        <ViewTablePanel
          columns={endCols}
          data={endItems}
          notNote
          hasPagination={false}
        />
      </TabPane>
    </Tabs>;

    return (
      <TabPane key="basicInfo" tab={processBillLocale.title}>
        <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} />
        <ViewPanel items={businessItems} title={commonLocale.bussinessLocale} />,
        <ViewPanel children={itemsTab} title={commonLocale.itemsLocale} />,
        {/* <ViewPanel items={noteItems} title={commonLocale.noteLocale} /> */}
        <div>
          <ConfirmModal
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={processBillLocale.title + ':' + this.state.entity.billNumber}
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
      this.drawItemInfoTab(),
    ];

    return tabPanes;
  }
}