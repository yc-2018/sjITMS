import { connect } from 'dva';
import moment from 'moment';
import { Fragment } from 'react';
import { message, Button, Tabs, Divider, Table } from 'antd';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { loginCompany } from '@/utils/LoginContext';
import { convertCodeName, isEmptyObj } from '@/utils/utils';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { qtyStrToQty, toQtyStr } from '@/utils/QpcStrUtil';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import ToolbarPanel from '@/pages/Component/Page/inner/ToolbarPanel';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import Empty from '@/pages/Component/Form/Empty';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import TagUtil from '@/pages/Component/TagUtil';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import { decinvBillState, getStateCaption } from './DecinvBillState';
import { decLocale, itemNotLessZero, realQtyTooBig } from './DecInvBillLocale';
import { decinvSourceBill } from './DecinvSourceBill';
const TabPane = Tabs.TabPane;

@connect(({ dec, loading }) => ({
  dec,
  loading: loading.models.dec,
}))
export default class DecInvBillAuditPage extends ViewPage {

  constructor(props) {
    super(props);

    this.state = {
      title: decLocale.title,
      entityUuid: props.dec.entityUuid,
      entity: {},
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
        title: commonLocale.billNumberLocal + ":" + nextProps.dec.entity.billNumber,
        entityUuid: nextProps.dec.entity.uuid,
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
    const { entity } = this.state;

    if (entity.state) {
      return (
        <TagUtil value={entity.state}/>
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
        {(entity.state === decinvBillState.APPROVED.name || entity.state === decinvBillState.SAVED.name)
          &&
          <IPopconfirm onConfirm={() => this.onAudit()} title={commonLocale.confirmAuditLocale}>
            <Button type='primary'>{commonLocale.auditLocale}</Button>
          </IPopconfirm>
        }
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

  showViewPage = () => {
    this.props.dispatch({
      type: 'dec/showPage',
      payload: {
        showPage: 'view',
        entityUuid: this.state.entityUuid
      }
    });
  }

  onCancel = () => {
    this.props.dispatch({
      type: 'dec/showPage',
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

    let decInvRealQtys = [];
    let items = entity.items;

    if (Array.isArray(items)) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].realQty < 0) {
          message.error(itemNotLessZero(items[i].line, decLocale.realQty));
          return;
        }
        if (items[i].realQty > items[i].qty) {
          message.error(realQtyTooBig(items[i].line));
          return;
        }

        let obj = {
          uuid: items[i].uuid,
          qty: items[i].realQty,
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
          this.showViewPage();
          message.success(commonLocale.auditSuccessLocale);
        }
      }
    });
  };

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

  refreshColumns = (columns) => {
    columns.forEach(e => {
      if (e.width) {
        e.onCell = () => {
          return {
            style: {
              maxWidth: e.width,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }
          }
        }
      }
    });
  }

  drawBasicInfoTab = () => {
    const entity = this.props.dec.entity;

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
      value: entity.uploadDate
    }, {
      label: commonLocale.inSourceBillLocale,
      value: entity.sourceBill && !isEmptyObj(entity.sourceBill)
        ? `[${entity.sourceBill.billNumber}]${decinvSourceBill[entity.sourceBill.billType]}`
        : <Empty/>
    }, {
      label: commonLocale.noteLocale,
      value: entity.note
    }];

    let itemsColumns = [
      // {
      //   title: commonLocale.lineLocal,
      //   dataIndex: 'line',
      //   width: '60px',
      // },
      {
        title: commonLocale.inArticleLocale,
        dataIndex: 'article',
        key: 'article',
        width:colWidth.codeNameColWidth,
        render: (text, record) => {
          return <EllipsisCol colValue={`[${record.article.code}]${record.article.name}`} />;
        }
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        dataIndex: 'qpcStr',
        key: 'qpcStr',
        width: itemColWidth.qpcStrColWidth+100,
        render: (text, record) => {
          return `${record.qpcStr}/${record.munit}`;
        },
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
        title: commonLocale.inPriceLocale,
        dataIndex: 'price',
        key: 'price',
        width: itemColWidth.priceColWidth+100,
      },
      {
        title: commonLocale.bincodeLocale,
        dataIndex: 'binCode',
        key: 'binCode',
        width: colWidth.codeColWidth
      },
      {
        title: commonLocale.inContainerBarcodeLocale,
        dataIndex: 'containerBarcode',
        key: 'containerBarcode',
        width: colWidth.codeColWidth
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
        width: itemColWidth.numberEditColWidth+200,
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
        title: decLocale.amount,
        dataIndex: 'amount',
        key: 'amount',
        width: itemColWidth.amountColWidth,
        render:val=>val?val:<Empty/>
      },
      {
        title: decLocale.realQtyStr,
        key: 'realQtyStr',
        dataIndex: 'realQtyStr',
        width:itemColWidth.qtyStrEditColWidth+200,
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
        title: decLocale.realQty,
        key: 'realQty',
        width:itemColWidth.qtyStrEditColWidth,
        render: (record) => {
          return <span>{record.realQty ? record.realQty : 0}</span>
        }
      },
      {
        title: decLocale.realAmount,
        dataIndex: 'realAmount',
        key: 'realAmount',
        width: itemColWidth.qtyStrEditColWidth,
        render:text=>text ? text : <Empty/>
      },
      {
        title: commonLocale.noteLocale,
        dataIndex: 'note',
        key: 'note',
        width: itemColWidth.noteEditColWidth,
        render:text=>text ? text : <Empty/>
      },
    ];
    this.refreshColumns(itemsColumns);

    return (
      <TabPane key="basicInfo" tab={commonLocale.basicInfoLocale}>
        <ViewPanel items={basicItems} title={commonLocale.profileItemsLocale} />
        <ViewPanel title={commonLocale.articleLocale}> 
          <ItemEditTable
            notNote={true}
            noAddandDelete={true}
            columns={itemsColumns}
            scroll={{ x: 2800 }}
            data={this.state.entity.items ? this.state.entity.items : []}
            drawBatchButton={this.drawBatchButton}
          />
        </ViewPanel>
      </TabPane>
    );
  }
}
