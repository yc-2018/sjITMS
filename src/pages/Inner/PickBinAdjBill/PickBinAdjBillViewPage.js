import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, Tabs, message } from 'antd';
import { formatMessage } from 'umi/locale';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import TagUtil from '@/pages/Component/TagUtil';
import TabsPanel from '@/pages/Component/Form/TabsPanel';
import Empty from '@/pages/Component/Form/Empty';
import { convertCodeName, convertArticleDocField } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import { BILL_STATE } from '@/utils/constants';
import ViewTable from '../StockTakeBill/ViewTable';
import styles from '../StockTakeBill/ViewTable.less';
import { pickBinAdjBillLocale } from './PickBinAdjBillLocale';
import { PickBinAdjBill_RES } from './PickBinAdjBilPermission';
import { State, METHOD } from './PickBinAdjBillContants';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import StandardTable from '@/components/StandardTable';
import { loginCompany,loginOrg } from '@/utils/LoginContext';

const TabPane = Tabs.TabPane;
@connect(({ pickBinAdjBill, loading }) => ({
  pickBinAdjBill,
  loading: loading.models.pickBinAdjBill,
}))
export default class PickBinAdjBillViewPage extends ViewPage {

  constructor(props) {
    super(props);

    this.state = {
      entity: props.pickBinAdjBill.entity,
      entityUuid: props.pickBinAdjBill.entityUuid,
      title: '',
      items: [],
      stockItems: [],
      operate: '',
      modalVisible: false,
      confirmLoading: false,
      createPermission:'iwms.inner.pickBinAdj.create'
    }
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.pickBinAdjBill.entity) {
      this.setState({
        entity: nextProps.pickBinAdjBill.entity,
        title: pickBinAdjBillLocale.title + '：' + nextProps.pickBinAdjBill.entity.billNumber,
        entityUuid: nextProps.pickBinAdjBill.entity.uuid,
      });
    }
  }

  refresh(billNumber,uuid) {
    if(billNumber){
      this.props.dispatch({
        type:"pickBinAdjBill/getByBillNumber",
        payload:{
          billNumber,
          dcUuid:loginOrg().type==='DC'?loginOrg().uuid:""
        },
        callback:res=>{
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的拣货位调整单' + billNumber + '不存在！');
            this.onBack();
          }
        }
      })
      return 
    }
    const { entityUuid } = this.state;

    this.props.dispatch({
      type: 'pickBinAdjBill/get',
      payload: uuid?uuid:entityUuid
    });
  }

  onBack = () => {
    this.props.dispatch({
      type: 'pickBinAdjBill/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }

  onCreate = () => {
    this.props.dispatch({
      type: 'pickBinAdjBill/showPage',
      payload: {
          showPage: 'create'
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
        type: 'pickBinAdjBill/previousBill',
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
        type: 'pickBinAdjBill/nextBill',
        payload: entity.billNumber
      });
    }
  }

  onEdit = () => {
    this.props.dispatch({
      type: 'pickBinAdjBill/showPage',
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
      this.onRemove();
    } else if (operate === commonLocale.auditLocale) {
      this.onAudit();
    }
  }

  onRemove = () => {
    const { dispatch } = this.props;
    const { entity } = this.state;

    this.setState({
      confirmLoading: !this.state.confirmLoading
    })

    dispatch({
      type: 'pickBinAdjBill/remove',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: response => {
        if (response && response.success) {
          this.onBack();
          message.success(commonLocale.removeSuccessLocale);
        }

        this.setState({
          modalVisible: false,
          confirmLoading: false
        })
      }
    });
  }

  onAudit = () => {
    const { dispatch } = this.props;
    const { entity } = this.state;

    this.setState({
      confirmLoading: !this.state.confirmLoading
    })

    dispatch({
      type: 'pickBinAdjBill/audit',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: (response) => {
        if (response && response.success) {
          this.refresh();
          message.success(commonLocale.auditSuccessLocale);
        }

        this.setState({
          modalVisible: false,
          confirmLoading: false
        });
      }
    });
  }

  drawActionButtion = () => {
    const { entity } = this.state;

    return (
      <Fragment>
         <Button onClick={this.onBack}>
          {commonLocale.backLocale}
        </Button>
        {entity && entity.state === State.SAVED.name&&<Button.Group size={2}>
          <Button onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}
            disabled={!havePermission(PickBinAdjBill_RES.DELETE)}>
            {commonLocale.deleteLocale}
          </Button>
          <Button onClick={this.onEdit}
            disabled={!havePermission(PickBinAdjBill_RES.EDIT)}>
            {commonLocale.editLocale}
          </Button>
        </Button.Group>}

        {entity && entity.state === State.SAVED.name&&<Button type="primary"
          disabled={!havePermission(PickBinAdjBill_RES.AUDIT)}
          onClick={
            () => this.handleModalVisible(commonLocale.auditLocale)
          } >
          {commonLocale.auditLocale}
        </Button>}

        <PrintButton
          reportParams={[{ billNumber: `${entity.billNumber}` }]}
          moduleId={PrintTemplateType.PICKBINADJBILL.name} />
       
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

  drawTabPanes = () => {
    let tabPanes = [
      this.drawBinTypeInfoTab(),
    ];

    return tabPanes;
  }


  drawStateTag = () => {
    if (this.state.entity.state) {
      return (
        <TagUtil value={this.state.entity.state} />
      );
    }
  }

  drawBinTypeInfoTab = () => {
    const { entity } = this.state;

    let basicItems = [{
      label: "调整员",
      value: convertCodeName(entity.pickBinAdjer)
    }, {
      label: "操作方式",
      value: entity.method ? METHOD[entity.method].caption : <Empty />
    },
    {
      label: commonLocale.noteLocale,
      value: entity.note
    }];

    let billtemColumns = [{
      title: "序号",
      dataIndex: 'line',
      width: itemColWidth.lineColWidth,
    }, {
      title: "商品",
      dataIndex: 'article',
      width: colWidth.codeNameColWidth + 50,
      render: (text, record) => <a onClick={() => this.onViewArticle(record.article.uuid)} >
        <EllipsisCol colValue={convertCodeName(record.article)} /></a>
    }, {
      title: "来源货位",
      dataIndex: 'sourceBinCode',
      width: colWidth.codeColWidth,
    }, {
      title: "目标货位",
      dataIndex: 'targetBinCode',
      width: colWidth.codeColWidth,
    }, {
      title: commonLocale.noteLocale,
      dataIndex: 'note',
      render: text => text ? <EllipsisCol colValue={text} /> : <Empty />,
      width: itemColWidth.noteEditColWidth
    }
    ];

    let stockItemColumns = [{
      title: commonLocale.articleLocale,
      dataIndex: 'articleDoc',
      width: itemColWidth.articleColWidth,
      render: (text, record) => <a onClick={() => this.onViewArticle(record.articleDoc.articleUuid)} >
        <EllipsisCol colValue={convertArticleDocField(record.articleDoc)} /></a>
    }, {
      title: "规格/计量单位",
      dataIndex: 'qpcStr',
      width: itemColWidth.qpcStrColWidth + 50,
      render: (text, record) => (record.qpcStr + '/' + record.articleDoc.articleSpec)
    },
    {
      title: "来源货位",
      dataIndex: 'fromBin',
      width: colWidth.codeColWidth,
    }, {
      title: "目标货位",
      dataIndex: 'toBin',
      width: colWidth.codeColWidth,
    }, {
      title: commonLocale.productionBatchLocale,
      dataIndex: 'productionBatch',
      width: itemColWidth.numberEditColWidth,
    }, {
      title: commonLocale.stockBatchLocale,
      dataIndex: 'stockBatch',
      width: itemColWidth.stockBatchColWidth,
      render: text => <EllipsisCol colValue={text} />
    }, {
      title: commonLocale.productionDateLocale,
      dataIndex: 'productionDate',
      width: colWidth.dateColWidth,
      render: (text) => moment(text).format("YYYY-MM-DD")
    }, {
      title: commonLocale.validDateLocale,
      dataIndex: 'validDate',
      width: colWidth.dateColWidth,
      render: (text) => moment(text).format("YYYY-MM-DD")
    }, {
      title: commonLocale.vendorLocale,
      dataIndex: 'supplier',
      width: colWidth.codeNameColWidth,
      render: (text, record) => (<EllipsisCol colValue={convertCodeName(record.supplier)} />)
    }, {
      title: commonLocale.ownerLocale,
      dataIndex: 'owner',
      width: colWidth.codeNameColWidth,
      render: (text, record) => (<EllipsisCol colValue={convertCodeName(record.owner)} />)
    }, {
      title: commonLocale.caseQtyStrLocale,
      dataIndex: 'caseQtyStr',
      width: itemColWidth.qtyStrColWidth,
    }, {
      title: commonLocale.qtyLocale,
      dataIndex: 'qty',
      width: itemColWidth.qtyColWidth
    }];

    let noteItems = [{
      label: commonLocale.noteLocale,
      value: entity.note
    }];

    let itemsTab = <Tabs defaultActiveKey="billItem">
      <TabPane tab={'单据明细'} key={'billItem'}>
        {/* <ViewTablePanel
          style={{ marginTop: '-30px' }}
          notNote
          columns={billtemColumns}
          data={this.state.entity.items ? entity.items : []}
          tableId={'pickBinAdj.view.billItem'}
        /> */}
         <div style={{marginTop:'-30px'}}>
        <StandardTable columns={billtemColumns}
          data={this.state.entity.items ? entity.items : []}
          minHeight={this.minHeight ? this.minHeight : 150}
          rowKey={record => record.uuid ? record.uuid : record.line}
          unShowRow={true}
          selectedRows={[]}
          comId={'pickBinAdj.view.billItem'}
          hasSettingColumns
          />
          </div>
          <div style={{height:'60px'}}></div>
      </TabPane>
      <TabPane tab={'库存明细'} key={'stockItem'}>
        {/* <ViewTablePanel
          style={{ marginTop: '-30px' }}
          notNote
          columns={stockItemColumns}
          data={this.state.entity.stockItems ? entity.stockItems : []}
          tableId={'pickBinAdj.view.stockItem'}
        /> */}
        <div style={{marginTop:'-30px'}}>
         <StandardTable columns={stockItemColumns}
          data={this.state.entity.stockItems ? entity.stockItems : []}
          minHeight={this.minHeight ? this.minHeight : 150}
          rowKey={record => record.uuid ? record.uuid : record.line}
          unShowRow={true}
          selectedRows={[]}
          comId={'pickBinAdj.view.stockItem'}
          hasSettingColumns
          /></div>
          <div style={{height:'60px'}}></div>
      </TabPane>

    </Tabs>;

    return (
      <TabPane key="basicInfo" tab={commonLocale.billInfoLocale}>
        <ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} />
        <ViewPanel children={itemsTab} title={'明细'} />
        <div>
          <ConfirmModal
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={pickBinAdjBillLocale.title + ':' + this.state.entity.billNumber}
            onOk={this.handleOk}
            onCancel={this.handleModalVisible}
            confirmLoading={this.state.confirmLoading}
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
      this.drawBinTypeInfoTab(),
    ];

    return tabPanes;
  }
}
