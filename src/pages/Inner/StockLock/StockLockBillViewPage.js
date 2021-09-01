import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, Tabs, Modal, message } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import Empty from '@/pages/Component/Form/Empty';
import TagUtil from '@/pages/Component/TagUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { convertCodeName } from '@/utils/utils';
import { commonLocale } from '@/utils/CommonLocale';
import { binUsage } from '@/utils/BinUsage';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { toQtyStr } from '@/utils/QpcStrUtil';
import { STOCKLOCKBILL_RES } from './StockLockBillPermission';
import { lockType, state } from './StockLockContants';
import { stockLockBillLocale } from './StockLockBillLocale';
import { routerRedux } from 'dva/router';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
const TabPane = Tabs.TabPane;

@connect(({ stocklock, loading }) => ({
  stocklock,
  loading: loading.models.stocklock,
}))
export default class StockLockBillViewPage extends ViewPage {
  constructor(props) {
    super(props);
    this.state = {
      entity: {},
      items: [],
      entityUuid: props.entityUuid,
      title: '',
      operate: '',
      modalVisible: false,
      showProcessView:false,
      createPermission:'iwms.inner.lock.create'
    }
  }
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.stocklock.entity) {
      this.setState({
        entity: nextProps.stocklock.entity,
        title: stockLockBillLocale.title + '：' + nextProps.stocklock.entity.billNumber,
        entityUuid: nextProps.stocklock.entity.uuid,
      });
    }
  }
  /**
  * 刷新
  */
  refresh(billNumber,uuid) {
    if(billNumber){
      this.props.dispatch({
        type: 'stocklock/getByBillNumber',
        payload: {
          billNumber: billNumber,
          dcUuid:loginOrg().type==='DC'?loginOrg().uuid:''
        },
        callback:res=>{
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的锁定解锁单' + billNumber + '不存在！');
            this.onBack();
          }
        }
      });
      return 
    }
    const { entityUuid } = this.state;
    this.props.dispatch({
      type: 'stocklock/get',
      payload: {
        uuid: uuid?uuid:entityUuid
      }
    });
  }
  /**
  * 返回
  */
  onBack = () => {
    this.props.dispatch({
      type: 'stocklock/showPage',
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
        type: 'stocklock/previousBill',
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
        type: 'stocklock/nextBill',
        payload: entity.billNumber
      });
    }
  }
  /**
  * 编辑
  */
  onEdit = () => {
    this.props.dispatch({
      type: 'stocklock/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entityUuid
      }
    });
  }
  /**
   * 新建
   */
  onCreate = () => {
    this.props.dispatch({
      type: 'stocklock/showPage',
      payload: {
        showPage: 'create',
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
      type: 'stocklock/onRemove',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.removeSuccessLocale)
        }
        this.onBack();
      }
    })
  }
  /**
   * 审核
   */
  onAudit = () => {
    const { entity } = this.state
    this.props.dispatch({
      type: 'stocklock/audit',
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
    })
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
            state[this.state.entity.state].name == 'SAVED' ?
              <Button onClick={() => this.handleModalVisible(commonLocale.deleteLocale)} disabled={!havePermission(STOCKLOCKBILL_RES.DELETE)}>
                {commonLocale.deleteLocale}
              </Button>
              : null
          }
          {
            state[this.state.entity.state].name == 'SAVED' ?
              <Button onClick={this.onEdit} disabled={!havePermission(STOCKLOCKBILL_RES.CREATE)}>
                {commonLocale.editLocale}
              </Button>
              : null
          }
          {
            state[this.state.entity.state].name == 'SAVED' ?
              <Button type='primary' onClick={() => this.handleModalVisible(commonLocale.auditLocale)}>
                {commonLocale.auditLocale}
              </Button>
              : null
          }
          {/* {
            <Button type="primary" onClick={() => this.previousBill()}>
              {commonLocale.previousBill}
            </Button>
          }
          {
            <Button type="primary" onClick={() => this.nextBill()}>
              {commonLocale.nextBill}
            </Button>
          } */}
        </Fragment>
      );
    }
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

      let businessItems = [{
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
      }];
      let auditItems = [
      ]
    
      let timeLineData = [
        { title: '保存', subTitle: '',description:businessItems,current: entity.state == state.SAVED.name,},
        { title: '审核', subTitle: '',description:auditItems,current: entity.state == state.AUDITED.name, },
      ];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={timeLineData} />);
    }
    return others;
  }

  /**
  * 绘制信息详情
  */
  drawStockLockBillBillInfoTab = () => {
    const { entity } = this.state;

    let profileItems = [
      {
        label: stockLockBillLocale.type,
        value: entity.type ? lockType[entity.type].caption : ''
      },
      {
        label: stockLockBillLocale.reason,
        value: entity.reason
      },
      {
        label: commonLocale.inOwnerLocale,
        value: convertCodeName(entity.owner)
      },
      {
        label: stockLockBillLocale.locker,
        value: convertCodeName(entity.locker)
      },
      
      // {
      //   label: stockLockBillLocale.unlockDate,
      //   value: entity.unlockDate
      // },
    ];
   
    let itemsCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: stockLockBillLocale.articleAndSpec,
        width: itemColWidth.articleColWidth,
        render: (record) => {
          return <span>
            <a onClick={this.onViewArticle.bind(true, record.article ? record.article.uuid : undefined)}><EllipsisCol colValue={convertCodeName(record.article)+ ' / ' + record.spec}/></a>
          </span> ;
          }  
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        width: itemColWidth.qpcStrColWidth,
        render: record => record.qpcStr + ' / ' + record.munit
      },
      {
        title: commonLocale.vendorLocale,
        width: colWidth.codeNameColWidth,
        render: record => <EllipsisCol colValue={convertCodeName(record.vendor)} />
      },
      {
        title: commonLocale.bincodeLocale,
        width: colWidth.codeColWidth,
        render: record => <EllipsisCol colValue={record.binCode && record.binUsage ? (record.binCode + "[" + binUsage[record.binUsage].caption + "]") : <Empty />} />
      },
      {
        title: commonLocale.containerLocale,
        width: colWidth.codeColWidth-100,
        render: record => record.containerBarcode == "-" ? record.containerBarcode : <a onClick={this.onViewContainer.bind(true, record.containerBarcode)}>{record.containerBarcode}</a>
      },
      {
        title: commonLocale.productionDateLocale,
        width: colWidth.dateColWidth,
        render: record => record.productDate ? moment(record.productDate).format('YYYY-MM-DD') : <Empty />
      },
      {
        title: commonLocale.validDateLocale,
        width: colWidth.dateColWidth,
        render: record => record.validDate ? moment(record.validDate).format('YYYY-MM-DD') : <Empty />
      },
      {
        title: commonLocale.productionBatchLocale,
        width: itemColWidth.numberEditColWidth,
        dataIndex: 'productionBatch',
      },
      {
        title: commonLocale.caseQtyStrLocale,
        width: itemColWidth.qtyStrColWidth,
        dataIndex: 'qtyStr',
      },
      {
        title: commonLocale.qtyLocale,
        width: itemColWidth.qtyStrColWidth,
        dataIndex: 'qty',
      },
    ]
    let noteItems = [{
      value: entity.note
    }];

    if(entity.type === lockType.LOCK.name){
      profileItems.push(
        {
          label: stockLockBillLocale.unlockDate,
          value: entity.unlockDate
        }
      )
    }
    profileItems.push(
      {
        label: commonLocale.noteLocale,
        value: entity.note
    }
    )

    const data = [];
    var line = 1;
    entity.items ? entity.items.map(e => {
      let result = undefined;
      for (var i = 0; i < data.length; i++) {
        if (e.article.uuid === data[i].article.uuid &&
          e.qpcStr === data[i].qpcStr &&
          e.vendor.uuid === data[i].vendor.uuid &&
          e.productionBatch === data[i].productionBatch &&
          e.binCode === data[i].binCode &&
          e.containerBarcode === data[i].containerBarcode) {
          data[i].qty = e.qty + data[i].qty;
          data[i].qtyStr = toQtyStr(data[i].qty, data[i].qpcStr)
          result = e;
        }
      }
      if (!result) {
        e.line = line;
        line++;
        data.push(e)
      }
    }) : [];

    return (
      <TabPane key="basicInfo" tab={stockLockBillLocale.title}>
        <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()}/>
        {/* <ViewPanel items={businessItems} title={commonLocale.bussinessLocale} /> */}
        <ViewTablePanel
          // scroll={{ x: 2400 }}
          title={commonLocale.itemsLocale}
          columns={itemsCols}
          data={data}
          tableId={'stocklock.view.table'}
        />
        {/* <ViewPanel items={noteItems} title={commonLocale.noteLocale} /> */}
        <div>
          <ConfirmModal
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={stockLockBillLocale.title + ':' + this.state.entity.billNumber}
            onOk={this.handleOk}
            onCancel={this.handleModalVisible}
          />
        </div>
      </TabPane>
    );
  }
  
    /**
   * 跳转到商品详情页面
   */
  onArticleView = (val) => {
    this.props.dispatch({
      type: 'article/get',
      payload: {
        uuid: val.uuid
      },

      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/basic/article',
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
  * 绘制Tab页
  */
  drawTabPanes = () => {
    let tabPanes = [
      this.drawStockLockBillBillInfoTab(),
    ];

    return tabPanes;
  }
}
