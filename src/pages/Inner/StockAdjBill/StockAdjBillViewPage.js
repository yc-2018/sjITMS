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
import { convertCodeName, convertArticleDocField, isEmptyObj, convertDateToTime, convertDate, composeQpcStrAndMunit } from '@/utils/utils';
import { State, getStateCaption, AdjType, getAdjTypeCaption, QpcStrAdjType, getQpcStrAdjTypeCaption, VendorAdjType, getVendorAdjTypeCaption, ProductionBatchAdjType, getProductionBatchAdjTypeCaption } from './StockAdjBillContants';
import { stockAdjBillLocale } from './StockAdjBillLocale';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import ViewTable from '../StockTakeBill/ViewTable';
import styles from '../StockTakeBill/ViewTable.less';
import TabsPanel from '@/pages/Component/Form/TabsPanel';
import { getUsageCaption } from '@/utils/BinUsage';

const TabPane = Tabs.TabPane;

@connect(({ stockadj, loading }) => ({
  stockadj,
  loading: loading.models.stockadj,
}))
export default class StockAdjBillViewPage extends ViewPage {

  constructor(props) {
    super(props);

    this.state = {
      title: stockAdjBillLocale.title,
      entityUuid: props.stockadj.entityUuid,
      entity: {},
      operate: '',
      modalVisible: false,
      createPermission:'iwms.inner.stockAdjBill.create'
    }
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.stockadj.entity) {
      this.setState({
        entity: nextProps.stockadj.entity,
        title: stockAdjBillLocale.title + "：" + nextProps.stockadj.entity.billNumber,
        entityUuid: nextProps.stockadj.entity.uuid,
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


  drawActionButtion() {
    const { entity } = this.state;

    return (
      <Fragment>
        <Button onClick={this.onCancel}>
          {commonLocale.backLocale}
        </Button>
        {entity.state === State.SAVED.name &&
          <span>
            <Button onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}>
              {commonLocale.deleteLocale}
            </Button>
            <Button onClick={() => this.onCreate(this.state.entity.uuid)}>
              {commonLocale.editLocale}
            </Button>
            <Button type="primary" onClick={() => this.handleModalVisible(commonLocale.auditLocale)}>
              {commonLocale.auditLocale}
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
        type:'stockadj/getByBillNumber',
        payload:{
          billNumber:billNumber,
          dcUuid:loginOrg().type==='DC'?loginOrg().uuid:''
        },
        callback:res=>{
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的库存调整单' + billNumber + '不存在！');
            this.onCancel();
          }else{
            this.setState({
              billNumber: res.data.billNumber,
              entity: res.data,
              entityUuid:res.data.uuid
            })
          }
        }
      })
      return 
    }
    
      this.props.dispatch({
        type: 'stockadj/get',
        payload: {
          uuid: uuid?uuid:this.state.entityUuid
        }
      });
    
  }

  onCancel = () => {
    this.props.dispatch({
      type: 'stockadj/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }

  onCreate = (entityUuid) => {
    this.props.dispatch({
      type: 'stockadj/showPage',
      payload: {
        showPage: 'create',
        entityUuid
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
      type: 'stockadj/onRemove',
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
      type: 'stockadj/onAudit',
      payload: {
        uuid: entity.uuid,
        version: entity.version
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

  drawTabPanes = () => {
    let tabPanes = [
      this.drawBasicInfoTab()
    ];

    return tabPanes;
  }

  convertBinField(binCode, binUsage) {
    if (binCode && binUsage) {
      return binCode + '[' + getUsageCaption(binUsage) + ']';
    }

    if (binCode)
      return binCode;
    return '';
  }

  drawBasicInfoTab = () => {
    const entity = this.state.entity;

    let profileItems = [
      {
        label: stockAdjBillLocale.adjType,
        value: entity.adjType ? getAdjTypeCaption(entity.adjType) : <Empty />
      },
      {
        label: stockAdjBillLocale.adjer,
        value: entity.adjer ? convertCodeName(entity.adjer) : <Empty />
      },
      {
        label: stockAdjBillLocale.reason,
        value: entity.reason ? entity.reason : <Empty />
      },
      {
        label: commonLocale.inWrhLocale,
        value: entity.wrh ? convertCodeName(entity.wrh) : <Empty />
      },
      {
        label: commonLocale.ownerLocale,
        value: entity.owner ? convertCodeName(entity.owner) : <Empty />
      }

      // {
      //     label: commonLocale.inUploadDateLocale,
      //     value: entity.uploadDate ? convertDateToTime(entity.uploadDate) : <Empty />
      // }
    ];

    if (entity && AdjType.STOCKBATCHMERGE.name === entity.adjType) {
      profileItems.push(
        {
          label: stockAdjBillLocale.qpcStrAdjType,
          value: entity.qpcStrAdjType ? getQpcStrAdjTypeCaption(entity.qpcStrAdjType) : <Empty />
        }
      );

      profileItems.push(
        {
          label: stockAdjBillLocale.vendorAdjType,
          value: entity.vendorAdjType ? getVendorAdjTypeCaption(entity.vendorAdjType) : <Empty />
        }
      );

      profileItems.push(
        {
          label: stockAdjBillLocale.productionBatchAdjType,
          value: entity.productionBatchAdjType ? getProductionBatchAdjTypeCaption(entity.productionBatchAdjType) : <Empty />
        }
      );
    }
    profileItems.push(
      {
        label: commonLocale.noteLocale,
        value: entity.note
      }
    )

    const billtemColumns = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        width: colWidth.codeNameColWidth,
        render: record => <a onClick={() => this.onViewArticle(record.article.articleUuid)} ><EllipsisCol colValue={convertArticleDocField(record.article)} /></a>
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        key: 'qpcStr',
        width: itemColWidth.qpcStrColWidth,
        render: record => composeQpcStrAndMunit(record)
      },
      {
        title: commonLocale.bincodeLocale,
        key: 'binCode',
        width: colWidth.codeColWidth,
        render: record => <EllipsisCol colValue={this.convertBinField(record.binCode, record.binUsage)} />
      },
      {
        title: commonLocale.inContainerBarcodeLocale,
        dataIndex: 'containerBarcode',
        key: 'containerBarcode',
        width: colWidth.codeColWidth,
      },
      {
        title: commonLocale.inProductionBatchLocale,
        dataIndex: 'productionBatch',
        key: 'productionBatch',
        width: itemColWidth.numberEditColWidth,
      },
      {
        title: commonLocale.inProductDateLocale,
        key: 'productionDate',
        width: colWidth.dateColWidth,
        render: record => record.productionDate ? convertDate(record.productionDate) : <Empty />
      }];

    if (AdjType.PRODUCTIONBATCH.name === entity.adjType) {
      billtemColumns.push(
        {
          title: stockAdjBillLocale.newProductionDate,
          key: 'newProductionDate',
          width: colWidth.dateColWidth,
          render: record => record.newProductionDate ? convertDate(record.newProductionDate) : <Empty />
        }
      );
      billtemColumns.push(
        {
          title: stockAdjBillLocale.newProductionBatch,
          dataIndex: 'newProductionBatch',
          key: 'newProductionBatch',
          width: itemColWidth.numberEditColWidth,
        },
      );
    }

    billtemColumns.push(
      {
        title: commonLocale.vendorLocale,
        key: 'vendor',
        width: colWidth.codeNameColWidth,
        render: record => record.vendor ? <EllipsisCol colValue={convertCodeName(record.vendor)} /> : <Empty />
      }
    );

    if (AdjType.VENDOR.name === entity.adjType) {
      billtemColumns.push(
        {
          title: stockAdjBillLocale.newVendor,
          key: 'newVendor',
          width: colWidth.codeNameColWidth,
          render: record => record.newVendor ? <EllipsisCol colValue={convertCodeName(record.newVendor)} /> : <Empty />
        }
      );
    }

    billtemColumns.push(
      {
        title: commonLocale.noteLocale,
        dataIndex: 'note',
        render: text => text ? <EllipsisCol colValue={text} /> : <Empty />,
      }
    );

    const stockItemColumns = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        width: colWidth.codeNameColWidth,
        render: record => <a onClick={() => this.onViewArticle(record.article.articleUuid)} ><EllipsisCol colValue={convertArticleDocField(record.article)} /></a>
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        key: 'qpcStr',
        width: itemColWidth.qpcStrColWidth,
        render: record => composeQpcStrAndMunit(record)
      },
      {
        title: stockAdjBillLocale.newQpcStr,
        key: 'newQpcStr',
        width: itemColWidth.qpcStrColWidth,
        render: record => record && record.newQpcStr && record.article && record.article.munit ? (record.newQpcStr + "/" + record.article.munit) : <Empty />
      },
      {
        title: commonLocale.bincodeLocale,
        key: 'binCode',
        width: colWidth.codeColWidth,
        render: record => <EllipsisCol colValue={this.convertBinField(record.binCode, record.binUsage)} />
      },
      {
        title: commonLocale.inContainerBarcodeLocale,
        dataIndex: 'containerBarcode',
        key: 'containerBarcode',
        width: colWidth.codeColWidth,
      },
      {
        title: commonLocale.inProductionBatchLocale,
        dataIndex: 'productionBatch',
        key: 'productionBatch',
        width: itemColWidth.numberEditColWidth,
      },
      {
        title: stockAdjBillLocale.newProductionBatch,
        dataIndex: 'newProductionBatch',
        key: 'newProductionBatch',
        width: itemColWidth.numberEditColWidth,
      },
      {
        title: commonLocale.inProductDateLocale,
        key: 'productDate',
        width: colWidth.dateColWidth,
        render: record => convertDate(record.productionDate)
      },
      {
        title: stockAdjBillLocale.newProductionDate,
        key: 'newProductionDate',
        width: colWidth.dateColWidth,
        render: record => convertDate(record.newProductionDate)
      },
      {
        title: commonLocale.vendorLocale,
        key: 'vendor',
        width: colWidth.codeNameColWidth,
        render: record => <EllipsisCol colValue={convertCodeName(record.vendor)} />
      },
      {
        title: stockAdjBillLocale.newVendor,
        key: 'newVendor',
        width: colWidth.codeNameColWidth,
        render: record => <EllipsisCol colValue={convertCodeName(record.newVendor)} />
      },
      {
        title: commonLocale.stockBatchLocale,
        dataIndex: 'stockBatch',
        width: itemColWidth.numberEditColWidth,
        render: text => <EllipsisCol colValue={text} />
      },
      {
        title: stockAdjBillLocale.newStockBatch,
        dataIndex: 'newStockBatch',
        width: itemColWidth.numberEditColWidth,
        render: text => <EllipsisCol colValue={text} />
      },
      {
        title: commonLocale.caseQtyStrLocale,
        dataIndex: 'qtyStr',
        width: itemColWidth.qtyStrColWidth,
      },
      {
        title: commonLocale.qtyLocale,
        dataIndex: 'qty',
        width: itemColWidth.qtyColWidth
      }
    ];

    let noteItems = [{
      label: commonLocale.noteLocale,
      value: entity.note
    }]

    let itemColumns = [];
    billtemColumns.forEach(function (item) {
      if (item != null)
        itemColumns.push(item);
    });
    let tabsItem = [
      <ViewTable columns={itemColumns}
        title="单据明细"
        scroll={{ x: 1500 }}
        data={entity.billItems ? entity.billItems : []} />
    ]

    if (State.AUDITED.name === entity.state) {
      let columns = [];
      stockItemColumns.forEach(function (item) {
        if (item != null)
          columns.push(item);
      });
      tabsItem = columns;
    }

    return (
      <TabPane key="basicInfo" tab={commonLocale.billInfoLocale}>
        <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} />
        <ViewTablePanel
          title={'明细'}
          columns={itemColumns}
          data={entity.billItems ? entity.billItems : []}
          tableId={'stockadj.view.table'}
        />
        {/* <TabsPanel title="明细" items={tabsItem} /> */}
        {/* <ViewPanel items={noteItems} title={commonLocale.noteLocale} /> */}
        <div>
          <ConfirmModal
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={stockAdjBillLocale.title + ':' + this.state.entity.billNumber}
            onOk={this.handleOk}
            onCancel={this.handleModalVisible}
          />
        </div>
      </TabPane>
    );
  }
}
