import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, Tabs, Modal, Steps, message, Tooltip, Row, Col,InputNumber } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import TagUtil from '@/pages/Component/TagUtil';
import TimeLinePanel from '@/pages/Component/Form/TimeLinePanel';
import CollapsePanel from '@/pages/Component/Form/CollapsePanel';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { sourceWay } from '@/utils/SourceWay';
import { havePermission } from '@/utils/authority';
import { commonLocale,placeholderLocale } from '@/utils/CommonLocale';
import { LogisticMode, State } from './OrderContants';
import { orderLocale } from './OrderLocale';
import { ORDER_RES } from './OrderPermission';
import styles from './Order.less';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import { MAX_DECIMAL_VALUE } from '@/utils/constants';
const TabPane = Tabs.TabPane;
import OperateCol from '@/pages/Component/Form/OperateCol';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';

@connect(({ order, loading }) => ({
  order,
  loading: loading.models.order,
}))
export default class OrderViewPage extends ViewPage {
  constructor(props) {
    super(props);
    this.state = {
      entity: {},
      items: [],
      number: props.billNumber,
      entityUuid: props.entityUuid,
      title: '',
      operate: '',
      modalVisible: false,
      createPermission: ORDER_RES.CREATE,
    }
  }
  componentDidMount() {
    this.refresh(this.state.number, this.state.entityUuid);
  }
  componentWillReceiveProps(nextProps) {
    let showPricingButton=false;
    const entity = nextProps.order.entity;
    if (entity&&(entity.billNumber === this.state.number || entity.uuid === this.state.entityUuid)) {
      if(entity.pricing==true && (entity.state=== State.INITIAL.name || entity.state==State.BOOKING.name||
        entity.state==State.BOOKED.name || entity.state==State.INPROGRESS.name)){
        showPricingButton=true;
      }
      this.setState({
        entity: entity,
        items: entity.items ? entity.items : [],
        title: orderLocale.title + '：' + entity.billNumber,
        entityUuid: entity.uuid,
        showPricingButton:showPricingButton,
        showProcessView: false,
        number: entity.billNumber
      });
    }
    const nextBillNumber = nextProps.billNumber;
    if (nextBillNumber && this.state.number !== nextBillNumber) {
      this.setState({
        number: nextBillNumber,
      });
      this.refresh(nextBillNumber);
    }
    // if(this.props.order.entityUuid!=nextProps.order.entityUuid){
    //   this.setState({
    //     entityUuid: nextProps.order.entityUuid,
    //   },()=>{
    //     this.refresh();
    //   });
    // }
    if(entity && entity.state){
      this.renderOperateCol();
    }
  }
  /**
   * 刷新
   */
  refresh=(number,uuid) => {
    const { entityUuid, billNumber } = this.state;
    if (!number && !uuid) {
      number = billNumber;
    }
    if (number) {
      this.props.dispatch({
        type: 'order/getByBillNumber',
        payload: {
          sourceBillNumber: number,
          dcUuid: loginOrg().uuid,
        },
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的入库订单' + number + '不存在！');
            this.onBack();
          } else {
            this.setState({
              number: res.data.billNumber,
            });
          }
        },
      });
      return;
    }

    if (uuid) {
      this.props.dispatch({
        type: 'order/get',
        payload: uuid,
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的入库订单不存在！');
            this.onBack();
          } else {
            this.setState({
              number: res.data.billNumber,
            });
          }
        },
      });
    } else {
      this.props.dispatch({
        type: 'order/get',
        payload: entityUuid,
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的入库订单不存在！');
            this.onBack();
          } else {
            this.setState({
              number: res.data.billNumber,
            });
          }
        },
      });
    }

  }

  /**
   * 返回
   */
  onBack = () => {
    this.props.dispatch({
      type: 'order/showPage',
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
      type: 'order/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entityUuid
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
    } else if (operate === commonLocale.abortLocale) {
      this.onAbort();
    } else if (operate === commonLocale.auditLocale) {
      this.onAudit();
    } else if (operate === commonLocale.finishLocale) {
      this.onFinish();
    } else if (operate === commonLocale.copyLocale) {
      this.onCopy();
    }
  }
  /**
   * 点击上一单
   */
  previousBill = () => {
    const { entity } = this.state;
    if (entity.uuid){
      this.props.dispatch({
        type: 'order/previousBill',
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
        type: 'order/nextBill',
        payload: entity.billNumber
      });
    }
  }

  onCreate = () => {
    this.props.dispatch({
      type: 'order/showPage',
      payload: {
        showPage: 'create',
        billNumber: this.state.billNumber,
      },
    });
  };

  /**
   * 删除
   */
  onDelete = () => {
    const { entity } = this.state
    this.props.dispatch({
      type: 'order/delete',
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
      type: 'order/audit',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: response => {
        if (response && response.success) {
          this.refresh();
          message.success(commonLocale.auditSuccessLocale)
        } else {
          message.error(response.message)
        }
      }
    })
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }
  /**
   * 作废
   */
  onAbort = () => {
    const { entity } = this.state
    this.props.dispatch({
      type: 'order/abort',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: response => {
        if (response && response.success) {
          this.refresh();
          message.success(commonLocale.abortSuccessLocale)
        } else {
          message.error(response.message)
        }
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }
  /**
   * 完成
   */
  onFinish = () => {
    const { entity } = this.state
    this.props.dispatch({
      type: 'order/finish',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: (response) => {
        if (response && response.success) {
          this.refresh();
          message.success(commonLocale.finishSuccessLocale)
        } else {
          message.error(response.message)
        }
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }
  /**
   * 复制
   */
  onCopy = () => {
    const { entity } = this.state
    this.props.dispatch({
      type: 'order/copy',
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
   * 核算
   */
  onPricing = (lines) => {
    if (!lines || lines.length <= 0) {
      message.warn('请先选择要修改的行！');
      return;
    }
    const { items,entity } = this.state;
    let data=[];
    lines.forEach(function (i) {
      if(items[i-1].receivedQty==0){
        data.push({
          itemBillUuid:items[i-1].uuid,
          price:items[i-1].price
        });
      }
    })
    if(data.length==0){
      message.warn('无可核价的明细！');
      return ;
    }
    this.props.dispatch({
      type: 'order/pricing',
      payload: {
        billUuid:entity.uuid,
        version:entity.version,
        data:data
      },
      callback: (response) => {
        if (response && response.success) {
          this.refresh();
          message.success(orderLocale.pricingSuccess)
        }
      }
    });
  }
  /**
   * 判断状态节点
   */
  getDot = (state) => {
    if (state === State.INPROGRESS.name) {
      return 1;
    }
    if (state === State.FINISHED.name) {
      return 2;
    }
    return 0;
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
   * 绘制省略的按钮
   */
  renderOperateCol = () => {
    const { entity} = this.state;

    let operations = [{
      name: '',
    }];
    operations.push({
      disVisible: !(this.state.entity.state && State[this.state.entity.state].name == 'SAVED'),
      disabled: !havePermission(ORDER_RES.CREATE),
      name: commonLocale.editLocale,
      onClick: this.onEdit.bind()
    })

    operations.push({
      disVisible: !(this.state.entity.state && State[this.state.entity.state].name == 'SAVED'),
      disabled: !havePermission(ORDER_RES.DELETE),
      name: commonLocale.deleteLocale,
      onClick: this.handleModalVisible.bind(this, commonLocale.deleteLocale, undefined)
    })

    operations.push({
      disabled: !havePermission(ORDER_RES.COPY),
      name: commonLocale.copyLocale,
      onClick: this.handleModalVisible.bind(this, commonLocale.copyLocale, undefined)
    })

    operations.push({
      disVisible: !(this.state.entity.state && State[this.state.entity.state].name == 'SAVED'),
      disabled: !havePermission(ORDER_RES.AUDIT),
      name: commonLocale.auditLocale,
      onClick: this.handleModalVisible.bind(this, commonLocale.auditLocale, undefined)
    })

    operations.push({
      disVisible: !(this.state.entity.state && State[this.state.entity.state].name == 'INITIAL'),
      disabled: !havePermission(ORDER_RES.ABORT),
      name: commonLocale.abortLocale,
      onClick: this.handleModalVisible.bind(this, commonLocale.abortLocale, undefined)
    })

    if(this.state.entity.state && (State[this.state.entity.state].name == 'INITIAL' || State[this.state.entity.state].name == 'BOOKING' ||
      State[this.state.entity.state].name == 'BOOKED' || State[this.state.entity.state].name == 'INPROGRESS')){

      operations.push({
        disabled: !havePermission(ORDER_RES.FINISH) || this.state.entity.notAllowFinish == true,
        name: commonLocale.finishLocale,
        onClick: this.handleModalVisible.bind(this, commonLocale.finishLocale, undefined)
      })
    }

    this.setState({
      operations: operations
    })
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
            moduleId={'ORDERBILL'}/>
          <OperateCol menus={this.state.operations} />
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          <Button onClick={this.onBack}>
            {commonLocale.backLocale}
          </Button>
        </Fragment>
      );
    }
  };

  /**
   * 表格变化时
   * @param {*} e
   * @param {*} fieldName
   * @param {*} key
   */
  handleFieldChange(e, fieldName, line) {
    const { items } = this.state;
    if (fieldName === 'price') {
      items[line - 1].price = e;
    }
  }

  viewProcessView = () => {
    this.setState({
      showProcessView: !this.state.showProcessView
    });
  };

  darwProcess = () => {
    return <a onClick={() => this.viewProcessView()}>流程进度</a>;
  };

  /**
   * 绘制信息详情
   */
  drawOrderBillInfoTab = () => {
    const { entity,showPricingButton } = this.state;
    const items = entity.items;
    var articles = [];
    var singleArticles = [];
    var showOperateCol=false;
    if (items) {
      items.map(e => {
        if (e.receivedQty > 0) {
          articles.push(e.article.uuid);
        }
      })
      let receivedItem=items.find(function(value, index, arr) {
        return value.receivedQty == 0;
      })
      if(receivedItem && showPricingButton==true){
        showOperateCol=true;
      }
    }
    for (var i = 0; i < articles.length; i++) {
      if (singleArticles.indexOf(articles[i]) == -1) {
        singleArticles.push(articles[i]);
      }
    }
    let profileItems = [
      {
        label: orderLocale.sourceBillNumber,
        value: entity.sourceBillNumber ? entity.sourceBillNumber : <Empty />
      },
      {
        label: orderLocale.type,
        value: entity.type ? entity.type : <Empty/>
      },
      {
        label: commonLocale.inVendorLocale,
        value: <a onClick={this.onViewVendor.bind(this, entity.vendor?entity.vendor.uuid:undefined) }
                  disabled={!havePermission(VENDOR_RES.VIEW)}>{convertCodeName(entity.vendor)}</a>
      },
      {
        label: commonLocale.inWrhLocale,
        value: convertCodeName(entity.wrh)
      },
      {
        label: commonLocale.sourceWayLocale,
        value: entity.sourceWay ? sourceWay[entity.sourceWay].caption : ''
      },
      {
        label: commonLocale.inlogisticModeLocale,
        value: entity.logisticMode ? LogisticMode[entity.logisticMode].caption : ''
      },
      {
        label: commonLocale.inOwnerLocale,
        value: convertCodeName(entity.owner)
      },
      {
        label: commonLocale.inValidDateLocale,
        value: entity.expireDate ? moment(entity.expireDate).format('YYYY-MM-DD') : <Empty />
      },
      {
        label: commonLocale.inBookDateLocale,
        value: entity.bookTime ? moment(entity.bookTime).format('YYYY-MM-DD') : <Empty />
      },
      {
        label: orderLocale.isPricing,
        value: entity.pricing==true ? commonLocale.yesLocale : commonLocale.noLocale
      },
      {
        label: commonLocale.noteLocale,
        value: entity.note,
      },
    ];

    let articleCols = [
      {
        title: commonLocale.lineLocal,
        key: 'line',
        dataIndex:'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: commonLocale.articleAndSpec,
        key: 'article',
        dataIndex: 'article',
        width: colWidth.codeNameColWidth,
        render: (text, record) => <span><a
          onClick={this.onViewArticle.bind(this, text ? text.uuid : undefined)}><EllipsisCol
          colValue={convertCodeName(text) + '/' + record.spec} /></a></span>,
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        width: itemColWidth.qpcStrEditColWidth,
        key: commonLocale.inQpcAndMunitLocale,
        dataIndex: ['qpcStr', 'munit'],
        render: (text, record) => record.qpcStr + ' / ' + record.munit,
      },
      {
        title: orderLocale.price,
        width: itemColWidth.priceColWidth,
        dataIndex: 'price',
        key: orderLocale.price,
        render: (text, record) => {
          if(showPricingButton==true && record.receivedQty==0){
            return (
              <InputNumber
                id = 'price'
                value={record.price ? record.price : 0}
                min={0}
                precision={4}
                max={MAX_DECIMAL_VALUE}
                onChange={e => this.handleFieldChange(e, 'price', record.line)}
                placeholder={placeholderLocale(orderLocale.price)}
                style={{ width: '100%' }}
              />
            );
          }
          return text;
        },
      },
      {
        title: orderLocale.receivedAndQtyStr,
        width: itemColWidth.qtyStrEditColWidth,
        key: orderLocale.receivedAndQtyStr,
        render: record => record.receivedQtyStr + ' / ' + record.qtyStr
      },
      {
        title: orderLocale.receivedAndAmount,
        width: itemColWidth.amountColWidth,
        key: orderLocale.receivedAndAmount,
        render: record => record.receivedAmount + ' / ' + record.amount
      },
      {
        title: '已预检数量',
        width: itemColWidth.amountColWidth,
        key: '已预检数量',
        render: record => record.previewdQty?record.previewdQty:<Empty/>
      },
      {
        title: '已预检件数',
        width: itemColWidth.amountColWidth,
        key: '已预检件数',
        render: record => record.previewdQtyStr?record.previewdQtyStr:<Empty/>
      },
      {
        title: commonLocale.vendorLocale,
        width: itemColWidth.articleColWidth,
        key: commonLocale.vendorLocale,
        render: record => {
          return record.vendor.uuid != undefined ? <a onClick={this.onViewVendor.bind(this, record.vendor?record.vendor.uuid:undefined) }
                                                      disabled={!havePermission(VENDOR_RES.VIEW)}><EllipsisCol colValue={convertCodeName(record.vendor)} /></a>:<Empty/>}
      },
      {
        title: commonLocale.stockBatchLocale,
        width: itemColWidth.amountColWidth,
        key: commonLocale.stockBatchLocale,
        render: record => record.orderBatch?record.orderBatch:<Empty/>
      },
      {
        title: commonLocale.noteLocale,
        width: itemColWidth.noteEditColWidth,
        key: commonLocale.noteLocale,
        render: record => record.note ? <EllipsisCol colValue={(record.note)}/> : <Empty/>,
      },
    ];
    if(showOperateCol==true){
      articleCols.splice(9,0,{
        title: commonLocale.operateLocale,
        width: itemColWidth.operateColWidth,
        fixed: 'right',
        key: 'action',
        render: (text, record) => {
          if(showPricingButton==true && record.receivedQty==0){
            return <a onClick={()=>this.onPricing([record.line])} disabled={!havePermission(ORDER_RES.PRICING)}
            >{orderLocale.pricing}</a>
          }
        },
      })
    }
    if(entity && entity.pricing==true){
      articleCols.splice(4,0,{
        title: '已核价',
        width: colWidth.enumColWidth,
        key: '已核价',
        render: record => record.priced?commonLocale.yesLocale:commonLocale.noLocale
      })
    }
    let timeLineData = [
      { title: orderLocale.stepsCreateTime, time: entity.createTime },
      {
        title: orderLocale.stepsBeginReceiveTime,
        time: entity.beginReceiveUploadTime ?
          entity.beginReceiveTime + orderLocale.beginReceiveUploadTime + '时间' + entity.beginReceiveUploadTime
          : entity.beginReceiveTime
      },
      {
        title: orderLocale.stepsEndReceiveTime,
        time: entity.endReceiveUploadTime ?
          entity.beginReceiveTime + orderLocale.endReceiveUploadTime + '时间' + entity.endReceiveUploadTime
          : entity.endReceiveTime
      },
    ];
    let current = this.getDot(entity.state);
    let collapseItems = [
      <TimeLinePanel header='时间轴' items={timeLineData} current={current} />
    ];
    return (
      <TabPane key="basicInfo" tab={orderLocale.title}>
        <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()}/>
        {showOperateCol == true &&
          <ViewTablePanel
            title={commonLocale.itemsLocale}
            columns={articleCols}
            data={this.state.items}
            scroll={{ x: 3000 }}
          />}
        {showOperateCol==false &&<ViewTablePanel
          notNote
          title={commonLocale.itemsLocale}
          columns={articleCols}
          data={this.state.items}
          scroll={{ x: 3000 }}
          tableId="order.view.table"
        />}
        <div>
          <ConfirmModal
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={orderLocale.title + ':' + this.state.entity.billNumber}
            onOk={this.handleOk}
            onCancel={this.handleModalVisible}
          />
        </div>
      </TabPane>
    );
  }
  drawBatchButton = (selectedRowKeys) => {
    const {items,showPricingButton}=this.state;
    let receivedItem=items.find(function(value, index, arr) {
      return value.receivedQty == 0;
    })
    if(receivedItem && showPricingButton){
      return [
        <a disabled={!havePermission(ORDER_RES.PRICING)} onClick={() => this.onPricing(selectedRowKeys)}>{orderLocale.batchPricing}</a>
      ];
    }
  }
  /**
   * 绘制Tab页
   */
  drawTabPanes = () => {
    let tabPanes = [
      this.drawOrderBillInfoTab(),
    ];
    return tabPanes;
  }
  drawOthers = () => {
    const others = [];
    if (this.state.showProcessView) {
      const { entity } = this.state;
      const data = [{
        title: orderLocale.stepsCreateTime,
        subTitle: entity.createTime,
        current: entity.state !== State.FINISHED.name && entity.state !== State.INPROGRESS.name,
        description: [{
          label: commonLocale.inAllQtyStrLocale,
          value: entity.totalQtyStr,
        }, {
          label: orderLocale.articleCount,
          value: entity.totalArticleCount,
        }, {
          label: commonLocale.inAllAmountLocale,
          value: entity.totalAmount,
        }, {
          label: commonLocale.inAllVolumeLocale,
          value: entity.totalVolume,
        }, {
          label: commonLocale.inAllWeightLocale,
          value: entity.totalWeight,
        }],
      }, {
        title: orderLocale.stepsBeginReceiveTime,
        subTitle: !entity.beginReceiveTime ? '' : (entity.beginReceiveTime + ' '
          + (entity.beginReceiveUploadTime ? (orderLocale.beginReceiveUploadTime + '：' + entity.beginReceiveUploadTime) : '')),
        current: entity.state === State.INPROGRESS.name,
        description: [{
          label: orderLocale.bookedQtyStr,
          value: entity.bookedQtyStr,
        }, {
          label: orderLocale.bookedArticleCount,
          value: entity.bookedArticleCount,
        }],
      }, {
        title: orderLocale.stepsEndReceiveTime,
        subTitle: !entity.endReceiveTime ? '' : (entity.endReceiveTime + ' '
          + (entity.endReceiveUploadTime ? (orderLocale.endReceiveUploadTime + '：' + entity.endReceiveUploadTime) : '')),
        current: entity.state === State.FINISHED.name,
        description: [{
          label: orderLocale.receivedQtyStr,
          value: entity.totalReceivedQtyStr,
        }, {
          label: orderLocale.receivedArticleCount,
          value: entity.totalReceivedArticleCount,
        }, {
          label: orderLocale.receivedAmount,
          value: entity.totalReceivedAmount,
        }, {
          label: orderLocale.totalReceivedVolume,
          value: entity.totalReceivedVolume,
        }, {
          label: orderLocale.totalReceivedWeight,
          value: entity.totalReceivedWeight,
        }],
      }];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  };
}
