import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Form, Select, Input, InputNumber, message, Col, Button, Tabs, Divider } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import Empty from '@/pages/Component/Form/Empty';
import TagUtil from '@/pages/Component/TagUtil';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { loginCompany,loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { qtyStrToQty, add, toQtyStr } from '@/utils/QpcStrUtil';
import { binUsage } from '@/utils/BinUsage';
import { State } from './IncInvBillContants';
import { INC_RES } from './IncInvBillPermission';
import { incLocale } from './IncInvBillLocale';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { decinvSourceBill } from '@/pages/Inner/Dec/DecinvSourceBill';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import { routerRedux } from 'dva/router';

const TabPane = Tabs.TabPane;
@connect(({ inc, loading }) => ({
  inc,
  loading: loading.models.inc,
}))
export default class IncInvBillViewPage extends ViewPage {

  constructor(props) {
    super(props);

    this.state = {
      title: incLocale.title,
      entityUuid: props.inc.entityUuid,
      entity: {},
      operate: '',
      modalVisible: false,
      showProcessView:false,
      createPermission:'iwms.inner.inc.create'
    }
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.inc.entity) {
      this.setState({
        entity: nextProps.inc.entity,
        title: incLocale.title + "：" + nextProps.inc.entity.billNumber,
        entityUuid: nextProps.inc.entity.uuid,
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

  previousBill = () => {
    const { entity } = this.state;
    if (entity.uuid){
      this.props.dispatch({
        type: 'inc/previousBill',
        payload: entity.billNumber
      });
    }
  }

  nextBill = () => {
    const { entity } = this.state;
    if (entity.uuid){
      this.props.dispatch({
        type: 'inc/nextBill',
        payload: entity.billNumber
      });
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
          moduleId={PrintTemplateType.INCINVBILL.name} />
        {
          this.state.entity.state && State[this.state.entity.state].name == State.SAVED.name &&
          <span>
            <Button onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}
              disabled={!havePermission(INC_RES.REMOVE)}>
              {commonLocale.deleteLocale}
            </Button>
            <Button
              disabled={!havePermission(INC_RES.CREATE)}
              onClick={() => this.onEdit()}>
              {commonLocale.editLocale}
            </Button>
            <Button type='primary'
              onClick={() => this.handleModalVisible(commonLocale.auditLocale)}
              disabled={!havePermission(INC_RES.AUDIT)}>
              {commonLocale.auditLocale}
            </Button>
          </span>
        }
        {
          this.state.entity.state && State[this.state.entity.state].name == State.APPROVED.name &&
          <Button type='primary'
            onClick={() => this.onAudit(commonLocale.auditLocale)}
            disabled={!havePermission(INC_RES.AUDIT)}>
            {commonLocale.auditLocale}
          </Button>
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

  refresh = (billNumber,uuid) => {
    if(billNumber){
      this.props.dispatch({
        type:"inc/getByBillNumber",
        payload:{
          dcUuid:loginOrg().type==='DC'?loginOrg().uuid:'',
          billNumber
        },
        callback:res=>{
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的溢余单' + billNumber + '不存在！');
            this.onCancel();
          }
        }
      })
      return 
    }
    this.props.dispatch({
      type: 'inc/get',
      payload: {
        uuid: uuid?uuid:this.state.entityUuid
      }
    });
  }

  onCancel = () => {
    this.props.dispatch({
      type: 'inc/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }

  onCreate = () => {
    this.props.dispatch({
      type: 'inc/showPage',
      payload: {
        showPage: 'create',
      
      }
    });
  }
  onEdit = () => {
    this.props.dispatch({
      type: 'inc/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entity.uuid
      }
    });
  }

  /**
   * 跳转到盘点单详情页面
   */
  onsStockTakeBillView = (sourceBill) => {
    this.props.dispatch({
      type: 'stockTakeBill/get',
      payload: sourceBill.billUuid,
      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/inner/stockTakeBill',
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
      this.onSimpleAudit();
    }
  }

  /**
  * 删除处理
  */
  onRemove = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'inc/onRemove',
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
   * 审核处理
   */
  onSimpleAudit = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'inc/onAudit',
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

  /**
   * 跳转到审核页面
   */
  onAudit = () => {
    const { dispatch } = this.props;

    dispatch({
      type: 'inc/showPage',
      payload: {
        showPage: 'audit',
        entityUuid: this.state.entity.uuid,
      }
    });
  }

  drawTabPanes = () => {
    let tabPanes = [
      this.drawBasicInfoTab()
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

      let businessItems = [
        {
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
        },
       
      ];
      let auditItems = [
        {
          label: commonLocale.inAllRealQtyStrLocale,
          value: entity.realTotalQtystr
        },
        {
          label: commonLocale.inAllRealArticleCountLocale,
          value: entity.realTotalArticleCount
        },
        {
          label: commonLocale.inAllRealAmountLocale,
          value: entity.realTotalAmount
        },
        {
          label: commonLocale.inAllRealVolumeLocale,
          value: entity.realTotalVolume
        },
        {
          label: commonLocale.inAllRealWeightLocale,
          value: entity.realTotalWeight
        },
      ]
    
      let timeLineData = [
        { title: '保存', subTitle: '',description:businessItems,current: entity.state == State.SAVED.name,},
        { title: '审核', subTitle: '',description:auditItems,current: entity.state == State.AUDITED.name, },
      ];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={timeLineData} />);
    }
    return others;
  }

  drawBasicInfoTab = () => {
    const {entity} = this.state;
    let allArticleQty = 0;
    let articleUuids = [];
    let allQtyStr = '0';
    let allAmount = 0;
    entity.items && entity.items.map(item => {
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
    let basicItems = [{
      label: incLocale.type,
      value: entity.type
    }, {
      label: commonLocale.inWrhLocale,
      value: convertCodeName(entity.wrh)
    }, {
      label: commonLocale.inOwnerLocale,
      value: convertCodeName(entity.owner)
    }, {
      label: incLocale.incer,
      value: convertCodeName(entity.incer)
    }, {
      label: commonLocale.inUploadDateLocale,
      value: entity.uploadDate ? moment(entity.uploadDate).format('YYYY-MM-DD') : <Empty />
    }, {
      label: '来源单据',
      // value: entity.sourceBill ? decinvSourceBill[entity.sourceBill.billType] + ',' + entity.sourceBill.billNumber : <Empty />
      value: entity.sourceBill && entity.sourceBill.billNumber !=undefined ?
      <span> <a onClick={this.onsStockTakeBillView.bind(this, entity.sourceBill)}
        >[{entity.sourceBill.billNumber}]{decinvSourceBill[entity.sourceBill.billType]}</a> </span> : <Empty />
    },
    {
      label: commonLocale.noteLocale,
      value: entity.note
    }];

   

    const columns = [
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
        render: (val) => {
          return <span>
            <a onClick={this.onViewArticle.bind(true, val ? val.uuid : undefined)}><EllipsisCol colValue={convertCodeName(val)}/></a>
          </span> ;
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
        title: '实际件数',
        dataIndex: 'realQtyStr',
        key: 'realQtyStr',
        width: itemColWidth.qtyStrColWidth
      },
      {
        title: '实际数量',
        dataIndex: 'realQty',
        key: 'realQty',
        width: itemColWidth.qtyColWidth
      },
      {
        title: commonLocale.inPriceLocale,
        dataIndex: 'price',
        key: 'price',
        width: itemColWidth.priceColWidth,
        render: val => <EllipsisCol colValue={val} />
      },
    ];

    return (
      <TabPane key="basicInfo" tab={commonLocale.basicInfoLocale}>
        <ViewPanel items={basicItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()}/>
        <ViewTablePanel title={commonLocale.itemsLocale} scroll={{ x: 2400 }} columns={columns} data={entity.items ? entity.items : []} />
        <div>
          <ConfirmModal
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={incLocale.title + ':' + this.state.entity.billNumber}
            onOk={this.handleOk}
            onCancel={this.handleModalVisible}
          />
        </div>
      </TabPane>
    );
  }
}
