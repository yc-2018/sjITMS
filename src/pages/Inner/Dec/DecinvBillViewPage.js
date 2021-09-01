import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Form, Select, Input, InputNumber, message, Col, Button, Tabs, Divider } from 'antd';
import StandardTable from '@/components/StandardTable';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import Empty from '@/pages/Component/Form/Empty';
import TagUtil from '@/pages/Component/TagUtil';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { loginCompany,loginOrg } from '@/utils/LoginContext';
import { binUsage } from '@/utils/BinUsage';
import { convertCodeName, isEmptyObj } from '@/utils/utils';
import { decinvBillState, getStateCaption } from './DecinvBillState';
import { decLocale, itemNotLessZero, realQtyTooBig } from './DecInvBillLocale';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { decinvSourceBill } from './DecinvSourceBill';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { routerRedux } from 'dva/router';
import { OWNER_RES } from '@/pages/Basic/Owner/OwnerPermission';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
const TabPane = Tabs.TabPane;

@connect(({ dec, loading }) => ({
  dec,
  loading: loading.models.dec,
}))
export default class DecinvBillViewPage extends ViewPage {

  constructor(props) {
    super(props);

    this.state = {
      title: decLocale.title,
      entityUuid: props.dec.entityUuid,
      entity: {},
      operate: '',
      modalVisible: false,
      showProcessView:false,
      createPermission:'iwms.inner.dec.create'
    }
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dec.entity) {
      this.setState({
        entity: nextProps.dec.entity,
        title: decLocale.title + "：" + nextProps.dec.entity.billNumber,
        entityUuid: nextProps.dec.entity.uuid,
      });
    }
  }

  drawStateTag = () => {
    const { entity } = this.state;

    if (entity.state) {
      return (
        <TagUtil value={entity.state} />
      );
    }
  }

  previousBill = () => {
    const { entity } = this.state;
    if (entity.uuid) {
      this.props.dispatch({
        type: 'dec/previousBill',
        payload: entity.billNumber
      });
    }
  }

  nextBill = () => {
    const { entity } = this.state;
    if (entity.uuid) {
      this.props.dispatch({
        type: 'dec/nextBill',
        payload: entity.billNumber
      });
    }
  }

  drawActionButtion() {
    const { entity } = this.state;

    return (
      <Fragment>
        <Button onClick={this.onCancel}>
          {commonLocale.backLocale}
        </Button>
        <PrintButton
          reportParams={[{ 'billNumber': this.state.entity ? this.state.entity.billNumber : null }]}
          moduleId={'DECINVBILL'} />
        {entity.state === decinvBillState.SAVED.name &&
          <span>
            <Button onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}>
              {commonLocale.deleteLocale}
            </Button>
            <Button onClick={() => this.onEdit()}>
              {commonLocale.editLocale}
            </Button>
            <Button type="primary" onClick={() => this.handleModalVisible(commonLocale.auditLocale)}>
              {commonLocale.auditLocale}
            </Button>
            {/* <IPopconfirm onConfirm={() => this.onAuditDirect()} title={commonLocale.confirmAuditLocale}>
              <Button type="primary">{commonLocale.auditLocale}</Button>
            </IPopconfirm> */}
          </span>
        }
        {entity.state === decinvBillState.APPROVED.name &&
          <span>
            <Button type='primary' onClick={() => this.handleModalVisible(commonLocale.auditLocale)}>
              {commonLocale.auditLocale}
            </Button>
          </span>
        }
        {entity.state === decinvBillState.AUDITED.name && entity.version === 1 &&
          entity.sourceBill && entity.sourceBill.billType && entity.sourceBill.billType === 'AlcDiffBill' &&
          <span>
            <Button type='primary' onClick={() => this.onEditAudit()}>
              {commonLocale.editLocale}
            </Button>
          </span>
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
        type:'dec/getByBillNumber',
        payload:{
          dcUuid:loginOrg().type==='DC'?loginOrg().uuid:'',
          billNumber
        },
        callback:res=>{
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的损耗单' + billNumber + '不存在！');
            this.onCancel();
          }
        }
      })
      return 
    }
    this.props.dispatch({
      type: 'dec/get',
      payload: {
        uuid: uuid?uuid:this.state.entityUuid
      }
    });
  }

  onCancel = () => {
    this.props.dispatch({
      type: 'dec/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }

  onCreate = () => {
    this.props.dispatch({
      type: 'dec/showPage',
      payload: {
        showPage: 'create',
      }
    });
  }

  onEdit = () => {
    this.props.dispatch({
      type: 'dec/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entity.uuid
      }
    });
  }

  /**
   * 跳转到编辑页面
   */
  onEditAudit = () => {
    this.props.dispatch({
      type: 'dec/showPage',
      payload: {
        showPage: 'createAudit',
        entityUuid: this.state.entity.uuid
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
    const { operate, entity } = this.state;
    if (operate === commonLocale.deleteLocale) {
      this.onRemove();
    } else if (operate === commonLocale.auditLocale && entity.state === decinvBillState.APPROVED.name) {
      this.onAudit();
    } else if (operate === commonLocale.auditLocale && entity.state === decinvBillState.SAVED.name) {
      this.onAuditDirect();
    }
  }

  /**
  * 删除处理
  */
  onRemove = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'dec/onRemove',
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
   * 审核
   */
  onAudit = () => {
    const { dispatch } = this.props;
    const { entity } = this.state;

    dispatch({
      type: 'dec/showPage',
      payload: {
        showPage: 'audit',
        entityUuid: entity.uuid,
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }

  /**
   * 直接审核
   */
  onAuditDirect = () => {
    const { dispatch } = this.props;
    const { entity } = this.state;

    let decInvRealQtys = [];
    let items = entity.items;
    if (Array.isArray(items)) {
      for (let x = 0; x < items.length; x++) {
        let item = items[x];
        if (item.realQty < 0) {
          message.error(itemNotLessZero(item.line, decLocale.realQty));
          this.setState({
            modalVisible: !this.state.modalVisible
          });
          return;
        }
        if (item.realQty > item.qty) {
          message.error(realQtyTooBig(item.line));
          this.setState({
            modalVisible: !this.state.modalVisible
          });
          return;
        }

        let obj = {
          uuid: item.uuid,
          qty: item.realQty,
        };
        decInvRealQtys.push(obj);
      }
    }

    dispatch({
      type: 'dec/onAudit',
      payload: {
        uuid: entity.uuid,
        version: entity.version,
        decInvRealQtys: decInvRealQtys,
      },
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
  }

  /**
  * 跳转到退仓单详情页面
  */
  onStoreRtnView = (sourceBill) => {
    if (sourceBill.billType == 'StockTakeBill') {
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
    if (sourceBill.billType == 'StoreRtnBill') {
      this.props.dispatch({
        type: 'storeRtn/get',
        payload: sourceBill.billUuid,
        callback: (response) => {
          if (response && response.success) {
            this.props.dispatch(routerRedux.push({
              pathname: '/rtn/storeRtn',
              payload: {
                showPage: 'view',
                entityUuid: response.data ? response.data.uuid : undefined
              }
            }));
          }
        }
      });
    }
  }

  handleFieldChange = (value, fieldName, line) => {
    const { entity } = this.state;
    if (fieldName === 'price') {
      entity.items[line - 1].price = value;
    }
    this.setState({
      entity: entity
    })
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
          value: entity.totalRealQtyStr
        },
        {
          label: commonLocale.inAllRealArticleCountLocale,
          value: entity.totalRealArticleCount
        },
        {
          label: commonLocale.inAllRealAmountLocale,
          value: entity.totalRealAmount
        },
        {
          label: commonLocale.inAllRealVolumeLocale,
          value: entity.totalRealVolume
        },
        {
          label: commonLocale.inAllRealWeightLocale,
          value: entity.totalRealWeight
        },
      ]
    
      let timeLineData = [
        { title: '保存', subTitle: '',description:businessItems,current: entity.state == decinvBillState.SAVED.name,},
        { title: '审核', subTitle: '',description:auditItems,current: entity.state == decinvBillState.AUDITED.name, },
      ];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={timeLineData} />);
    }
    return others;
  }

  drawBasicInfoTab = () => {
  const {entity} = this.state;
    let basicItems = [{
      label: decLocale.type,
      value: entity.type
    }, {
      label: commonLocale.inWrhLocale,
      value: convertCodeName(entity.wrh)
    }, {
      label: commonLocale.ownerLocale,
      value: convertCodeName(entity.owner)
    }, {
      label: decLocale.decer,
      value: convertCodeName(entity.decer)
    }, {
      label: commonLocale.inUploadDateLocale,
      value: entity.uploadDate && moment(entity.uploadDate).format('YYYY-MM-DD')
    }, {
      label: commonLocale.inSourceBillLocale,
      value: entity.sourceBill&&entity.sourceBill.billNumber?
        <span> <a onClick={this.onStoreRtnView.bind(this, entity.sourceBill)}
        >{'['+entity.sourceBill.billNumber+']'}{decinvSourceBill[entity.sourceBill.billType]}</a> </span> : <Empty />
    },
    {
      label: commonLocale.noteLocale,
      value: entity.note
    }];


    const itemsColumns = [
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
        render: (val) => {
          return <span>
            <a onClick={this.onViewArticle.bind(true, val ? val.uuid : undefined)}><EllipsisCol colValue={convertCodeName(val)} /></a>
          </span>;
        }
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        dataIndex: 'qpcStr',
        key: 'qpcStr',
        width: itemColWidth.qpcStrColWidth + 10,
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
        title: decLocale.qtyStr,
        dataIndex: 'qtyStr',
        key: 'qtyStr',
        width: itemColWidth.qtyStrColWidth,
      },
      {
        title: decLocale.qty,
        dataIndex: 'qty',
        key: 'qty',
        width: itemColWidth.qtyColWidth
      },
      {
        title: commonLocale.inAllRealQtyStrLocale,
        dataIndex: 'realQtyStr',
        key: 'realQtyStr',
        width: itemColWidth.qtyStrColWidth,
      },
      {
        title: commonLocale.inAllRealQtyLocale,
        dataIndex: 'realQty',
        key: 'realQty',
        width: itemColWidth.qtyColWidth
      },
      {
        title: commonLocale.inPriceLocale,
        dataIndex: 'price',
        key: 'price',
        width: itemColWidth.priceColWidth
      },
    ];

   
    return (
      <TabPane key="basicInfo" tab={commonLocale.basicInfoLocale}>
        <ViewPanel items={basicItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()} />
        {/* <ViewPanel items={businessItems} title={commonLocale.bussinessLocale} /> */}
        <ViewTablePanel
          title={commonLocale.itemsLocale}
          columns={itemsColumns}
          data={entity.items ? entity.items : []}
          scroll={{ x: '160%', y: false }}
        />
        {/* <ViewPanel items={noteItems} title={commonLocale.noteLocale} /> */}
        <div>
          <ConfirmModal
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={decLocale.title + ':' + this.state.entity.billNumber}
            onOk={this.handleOk}
            onCancel={this.handleModalVisible}
          />
        </div>
      </TabPane>
    );
  }
}
