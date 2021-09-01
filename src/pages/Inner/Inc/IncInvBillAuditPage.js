import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Form, Select, Input, InputNumber, message, Col, Button, Tabs, Tag } from 'antd';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ToolbarPanel from '@/pages/Component/Page/inner/ToolbarPanel';
import Empty from '@/pages/Component/Form/Empty';
import TagUtil from '@/pages/Component/TagUtil';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { loginCompany,loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { qtyStrToQty, add, toQtyStr } from '@/utils/QpcStrUtil';
import { havePermission } from '@/utils/authority';
import { binUsage } from '@/utils/BinUsage';
import { INC_RES } from './IncInvBillPermission';
import { State } from './IncInvBillContants';
import { incLocale } from './IncInvBillLocale';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
const TabPane = Tabs.TabPane;
@connect(({ inc, loading }) => ({
  inc,
  loading: loading.models.inc,
}))
export default class IncInvBillAuditPage extends ViewPage {

  constructor(props) {
    super(props);

    this.state = {
      title: incLocale.title,
      entityUuid: props.inc.entityUuid,
      entity: {},
      operate: '',
      modalVisible: false,
      createPermission:"iwms.inner.inc.create"
    }
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.inc.entity) {
      this.setState({
        entity: nextProps.inc.entity,
        title: commonLocale.billNumberLocal + "：" + nextProps.inc.entity.billNumber,
        entityUuid: nextProps.inc.entity.uuid,
      });
    }
  }
  /**
   * 绘制按钮
   */
  drawBatchButton = () => {
    return (
      <span style={{paddingBottom:'10px'}}>
        <a onClick={() => this.handlebatchAddrealqty()}>批量填充实际件数</a>
      </span>
    )
  }
  /**
   * 批量填充实际件数 数量
   */
  handlebatchAddrealqty =()=>{
    if (this.state.entity) {
      if(this.state.entity.items&&this.state.entity.items.length>0){
        for(let item of this.state.entity.items){
          item.realQty = item.qty;
          item.realQtyStr = item.qtyStr;
        }
      }
      this.setState({
        entity: {...this.state.entity},
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

  drawActionButtion() {
    return (
      <Fragment>
        <Button onClick={this.onCancel}>
          {commonLocale.backLocale}
        </Button>
        {this.state.entity.state === State.APPROVED.name
          &&
          <Button type='primary'
            onClick={() => this.handleModalVisible(commonLocale.auditLocale)}
            disabled={!havePermission(INC_RES.AUDIT)}>
            {commonLocale.auditLocale}
          </Button>
        }
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

  onView = () => {
    this.props.dispatch({
      type: 'inc/showPage',
      payload: {
        showPage: 'view',
        entityUuid: this.state.entityUuid
      }
    });
  }

  onCancel = () => {
    this.props.dispatch({
      type: 'inc/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  /**
 * 审核处理
 */
  onAudit = () => {
    const { dispatch } = this.props;
    const { entity } = this.state;

    let incRealQtyStr = [];
    let items = entity.items;
    if (Array.isArray(items)) {
      for (let x =0;x<items.length;x++) {
        let item = items[x];
        if (item.realQtyStr > item.qtyStr) {
          message.error('实际件数不能大于件数');
          this.setState({
            modalVisible: !this.state.modalVisible
          });
          return;
        }

        let obj = {
          uuid: item.uuid,
          qtyStr: item.realQtyStr,
        };
        incRealQtyStr.push(obj);
      }
    }
    dispatch({
      type: 'inc/onAudit',
      payload: {
        uuid: entity.uuid,
        version: entity.version,
        realQtyStr: incRealQtyStr,
      },
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.auditSuccessLocale);
          this.onView();
        }
        this.handleModalVisible();
      }
    });
  };

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

  drawTabPanes = () => {
    let tabPanes = [
      this.drawBasicInfoTab()
    ];

    return tabPanes;
  }

  onFieldChange = (value, field, index) => {
    const { entity } = this.state;

    if (field === 'qtyStr') {
      entity.items[index - 1].realQtyStr = value;
      entity.items[index - 1].realQty = qtyStrToQty(value, entity.items[index - 1].qpcStr);
      entity.items[index - 1].realAmount = entity.items[index - 1].realQty * entity.items[index - 1].price;
    }

    this.setState({
      entity: { ...entity },
    });
  }

  drawBasicInfoTab = () => {
    const entity = this.props.inc.entity;
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
      value: entity.sourceBill ? entity.sourceBill.billType + ',' + entity.sourceBill.billNumber : <Empty />
    }];

    let businessItems = [{
      label: commonLocale.inAllQtyStrLocale,
      value: allQtyStr
    }, {
      label: '总品项数',
      value: allArticleQty
    }, {
      label: commonLocale.inAllAmountLocale,
      value: allAmount
    }];

    const columns = [
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        dataIndex: 'article',
        width: colWidth.codeNameColWidth,
        render: val => <EllipsisCol colValue={convertCodeName(val)} />
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
      },
      {
        title: commonLocale.inBinUsageLocale,
        dataIndex: 'binUsage',
        key: 'binUsage',
        width: colWidth.enumColWidth,
        render: val => {
          return (
            <span>{val ? binUsage[val].caption : <Empty />}</span>
          );
        }
      },
      {
        title: commonLocale.inContainerBarcodeLocale,
        dataIndex: 'containerBarcode',
        key: 'containerBarcode',
        width: colWidth.codeColWidth,
      },
      {
        title: commonLocale.inProductDateLocale,
        dataIndex: 'productDate',
        key: 'productDate',
        width: colWidth.dateColWidth,
        render: val => moment(val).format('YYYY-MM-DD')
      },
      {
        title: commonLocale.inPriceLocale,
        dataIndex: 'price',
        key: 'price',
        width: itemColWidth.priceColWidth
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
        width: itemColWidth.qtyStrEditColWidth,
        render: (text, record) => {
          return (
            <QtyStrInput
              value={record.realQtyStr ? record.realQtyStr : null}
              onChange={
                e => this.onFieldChange(e, 'qtyStr', record.line)
              }
            />
          );
        }
      },
      {
        title: '实际数量',
        dataIndex: 'realQty',
        key: 'realQty',
        width: itemColWidth.qtyColWidth
      },
      {
        title: commonLocale.noteLocale,
        dataIndex: 'note',
      }
    ];

    let noteItems = [{
      label: commonLocale.noteLocale,
      value: entity.note
    }]
    return (
      <TabPane key="basicInfo" tab={commonLocale.basicInfoLocale}>
        <ViewPanel items={basicItems} title={commonLocale.profileItemsLocale} />
        <ViewPanel items={businessItems} title={commonLocale.bussinessLocale} />
        <ViewPanel title={commonLocale.itemsLocale}> 
          <ItemEditTable
            notNote={true}
            noAddandDelete={true}
            columns={columns}
            scroll={{ x: 2400 }}
            data={entity.items ? entity.items : []}
            drawBatchButton={this.drawBatchButton}
          />
        </ViewPanel>
        <ViewPanel items={noteItems} title={commonLocale.noteLocale} />
        <ConfirmModal
          visible={this.state.modalVisible}
          operate={this.state.operate}
          object={incLocale.title + ':' + this.state.entity.billNumber}
          onOk={this.handleOk}
          onCancel={this.handleModalVisible}
        />
      </TabPane>
    );
  }
}