import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, Tabs, message } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import TagUtil from '@/pages/Component/TagUtil';
import Empty from '@/pages/Component/Form/Empty';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { convertCodeName } from '@/utils/utils';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { binUsage, getUsageCaption } from '@/utils/BinUsage';
import { ADJ_RES } from './AdjBillPermission';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';
import { State, Type, AdjSourceBill } from './AdjBillContants';
import { adjBillLocale } from './AdjBillLocale';
import { OWNER_RES } from '@/pages/Basic/Owner/OwnerPermission';
import { routerRedux } from 'dva/router';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import styles from "@/pages/Out/Wave/Wave.less";
const TabPane = Tabs.TabPane;
@connect(({ adjBill, loading }) => ({
  adjBill,
  loading: loading.models.adjBill,
}))
export default class AdjBillViewPage extends ViewPage {
  constructor(props) {
    super(props);
    this.state = {
      entity: {},
      billNumber: props.billNumber,
      entityUuid: props.entityUuid,
      title: '',
      operate: '',
      modalVisible: false,
      createPermission: ADJ_RES.CREATE,
    }
  }
  componentDidMount() {
    this.refresh(this.state.billNumber, this.state.entityUuid);
  }
  componentWillReceiveProps(nextProps) {
    const entity = nextProps.adjBill.entity;
    if (entity && (entity.billNumber === this.state.billNumber || entity.uuid === this.state.entityUuid)) {
      this.setState({
        entity: entity,
        title: adjBillLocale.title + "：" + entity.billNumber,
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
        type: 'adjBill/getByBillNumber',
        payload: billNumber,
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的修正单' + billNumber + '不存在！');
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
        type: 'adjBill/get',
        payload: uuid,
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的修正单不存在！');
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
      type: 'adjBill/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }
  /**
   * 新建
   */
  onCreate = () => {
    this.props.dispatch({
      type: 'adjBill/showPage',
      payload: {
        showPage: 'create',
        billNumber: this.state.billNumber
      }
    });
  }
  /**
   * 编辑
   */
  onEdit = () => {
    this.props.dispatch({
      type: 'adjBill/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entityUuid,
      }
    });
  }
  onViewSourceBill = sourceBill => {
    if (sourceBill.billType == AdjSourceBill.ReceiveBill.name) {
      this.props.dispatch(routerRedux.push({
        pathname: '/in/receive',
        payload: {
          showPage: 'view',
          billNumber: sourceBill.billNumber
        }
      }));
    } else if (sourceBill.billType == AdjSourceBill.StoreRtnBill.name) {
      this.props.dispatch(routerRedux.push({
        pathname: '/rtn/storeRtn',
        payload: {
          showPage: 'view',
          entityUuid: sourceBill.billUuid
        }
      }));
    } else if (sourceBill.billType == AdjSourceBill.VendorRtnHandoverBill.name) {
      this.props.dispatch(routerRedux.push({
        pathname: '/rtn/vendorHandover',
        payload: {
          showPage: 'view',
          entityUuid: sourceBill.billUuid
        }
      }));
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
      type: 'adjBill/onRemove',
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
      type: 'adjBill/onAudit',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: response => {
        if (response && response.success) {
          this.refresh(this.state.billNumber);
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
          <PrintButton
            reportParams={[{ 'billNumber': this.state.entity ? this.state.entity.billNumber : null }]}
            moduleId={PrintTemplateType.ADJBILL.name} />
          {
            State[this.state.entity.state].name == 'SAVED' ?
              <Button onClick={() => this.handleModalVisible(commonLocale.deleteLocale)} disabled={!havePermission(ADJ_RES.REMOVE)}>
                {commonLocale.deleteLocale}
              </Button>
              : null
          }
          {
            State[this.state.entity.state].name == 'SAVED' ?
              <Button onClick={this.onEdit} disabled={!havePermission(ADJ_RES.CREATE)}>
                {commonLocale.editLocale}
              </Button>
              : null
          }
          {
            State[this.state.entity.state].name == 'SAVED' ?
              <Button onClick={() => this.handleModalVisible(commonLocale.auditLocale)} type='primary' disabled={!havePermission(ADJ_RES.AUDIT)}>
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
  drawAdjBillInfoTab = () => {
    const { entity } = this.state;
    const upItems = [];
    const downItems = [];
    if (entity.items) {
      entity.items.forEach(item => {
        if (item.direction == "UP") {
          upItems.push(item);
        } else {
          downItems.push(item);
        }
      });
    }
    const { sourceBill } = entity;
    let profileItems = [
      {
        label: adjBillLocale.type,
        value: entity.type ? Type[entity.type].caption : <Empty />,
      },
      {
        label: adjBillLocale.state,
        value: entity.state ? State[entity.state].caption : <Empty />,
      },
      {
        label: adjBillLocale.adjer,
        value: convertCodeName(entity.adjer),
      },
      {
        label: adjBillLocale.sourceBill,
        value: entity.sourceBill ? <a onClick={()=>this.onViewSourceBill(sourceBill)}>{[sourceBill.billNumber] + AdjSourceBill[sourceBill.billType].caption }</a> : <Empty />
      },
      {
        label: commonLocale.noteLocale,
        value: entity.note
      }
    ];
    let itemsCols = [
      {
        title: commonLocale.lineLocal,
        width: itemColWidth.lineColWidth,
        key: 'line',
        render: (text, record, index) => `${index + 1}`
      },
      {
        title: commonLocale.articleAndSpec,
        dataIndex: 'article',
        key: 'article',
        width: itemColWidth.articleColWidth,
        render: (text, record) =>  <span><a onClick={this.onViewArticle.bind(this, text ? text.uuid : undefined)}><EllipsisCol colValue={convertCodeName(text)+"/"+record.spec} /></a><span></span></span>
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        width: itemColWidth.qpcStrColWidth,
        key: 'qpcStr',
        render: record => record.qpcStr + ' / ' + record.munit
      },
      {
        title: commonLocale.inQtyStrLocale,
        width: itemColWidth.qtyStrColWidth,
        dataIndex: 'qtyStr',
        key: 'qtyStr',
      },
      {
        title: commonLocale.inQtyLocale,
        width: itemColWidth.qtyStrColWidth,
        dataIndex: 'qty',
        key: 'qty',
      },
      {
        title: commonLocale.inPriceLocale,
        width: itemColWidth.priceColWidth,
        dataIndex: 'price',
        key: 'price',
      },
      {
        title: commonLocale.inVendorLocale,
        width: colWidth.codeNameColWidth,
        key: 'vendor',
        render: record => {
          return record.vendor != undefined ? <a onClick={this.onViewVendor.bind(this, record.vendor ? record.vendor.uuid : undefined)}
                                                 disabled={!havePermission(VENDOR_RES.VIEW)}><EllipsisCol colValue={convertCodeName(record.vendor)} /></a> : <Empty />
        }
      },
      {
        title: commonLocale.inProductDateLocale,
        width: colWidth.dateColWidth,
        key: 'productDate',
        render: record => record.productDate ? moment(record.productDate).format('YYYY-MM-DD') : ''
      },
      {
        title: commonLocale.inValidDateLocale,
        width: colWidth.dateColWidth,
        key: 'validDate',
        render: record => record.validDate ? moment(record.validDate).format('YYYY-MM-DD') : ''
      },
      {
        title: commonLocale.inContainerBarcodeLocale,
        width: itemColWidth.containerCol,
        key: 'containerBarcode',
        render: record => record.sourceContainerBarcode == "-" ? record.containerBarcode : <a onClick={this.onViewContainer.bind(this, record.containerBarcode)}>{record.containerBarcode}</a>
      },
      {
        title: adjBillLocale.binAndBinUsage,
        width: colWidth.codeNameColWidth,
        key: 'bin',
        render: record => <EllipsisCol colValue={record.binCode && record.binUsage ? (record.binCode + "[" + binUsage[record.binUsage].caption + "]") : <Empty />} />
      },
      {
        title: commonLocale.inStockBatchLocale,
        width: itemColWidth.stockBatchColWidth,
        dataIndex: 'stockBatch',
        key: 'stockBatch',
        render: val => <EllipsisCol colValue={val} />
      },
      {
        title: adjBillLocale.reason,
        width: itemColWidth.noteEditColWidth,
        dataIndex: 'reason',
        key: 'reason',
        render: val => val == null ? <Empty /> : val,
      },
    ]
    let tabPanes = [
      <TabPane tab='正向修改' key="upItems">
        <ViewTablePanel
          data={upItems}
          columns={itemsCols}
        />
      </TabPane>,
      <TabPane tab="逆向修改" key="downItems">
        <ViewTablePanel
          data={downItems}
          columns={itemsCols}
        />
      </TabPane>
    ];
    let tabsItem = [
      <Tabs key='itemTabs' defaultActiveKey="billItems" className={styles.ItemTabs}>
        {tabPanes}
      </Tabs>
    ]
    return (
      <TabPane key="basicInfo" tab={adjBillLocale.title}>
          <ViewPanel onCollapse={this.onCollapse} items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()} />
          <ViewPanel title={commonLocale.itemsLocale} children={tabsItem} />
          <div>
            <ConfirmModal
              visible={this.state.modalVisible}
              operate={this.state.operate}
              object={adjBillLocale.title + ':' + this.state.entity.billNumber}
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
      this.drawAdjBillInfoTab(),
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
        title: '保存',
        subTitle: entity.createInfo.time,
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
        title: '审核',
        subTitle: entity.lastModifyInfo.time,
        current: entity.state == State.AUDITED.name,
      }];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
