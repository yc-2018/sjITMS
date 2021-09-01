import { connect } from 'dva';
import CreatePage from './CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { loginCompany, loginOrg, loginUser, getDefOwner,getActiveKey} from '@/utils/LoginContext';
import { Form, Select, Input, Switch, message, InputNumber, DatePicker, Modal } from 'antd';
import { commonLocale, notNullLocale,tooLongLocale, placeholderLocale, placeholderChooseLocale, confirmLineFieldNotNullLocale } from '@/utils/CommonLocale';
import { qtyStrToQty, add, toQtyStr } from '@/utils/QpcStrUtil';
import { convertCodeName } from '@/utils/utils';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import { formatDate } from '@/utils/utils';
import { alcNtcLocale } from './TransportOrderLocale';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import { STATE } from '@/utils/constants';
import { PRETYPE } from '@/utils/constants';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { MAX_DECIMAL_VALUE } from '@/utils/constants';
import { orderBillType, SchedulingType, urgencyLevel } from './TransportOrderContants';
import { addressToStr, addressToStr1 } from '@/utils/utils';
import { orderLocale } from '../../In/Order/OrderLocale';
import Empty from '@/pages/Component/Form/Empty';
import moment from 'moment';

const orderTypeOptions = [];
Object.keys(orderBillType).forEach(function (key) {
  orderTypeOptions.push(<Option value={orderBillType[key].name} key={orderBillType[key].name}>{orderBillType[key].caption}</Option>);
});

const urgencyLevelOptions = [];
Object.keys(urgencyLevel).forEach(function (key) {
  urgencyLevelOptions.push(<Option value={urgencyLevel[key].name} key={urgencyLevel[key].name}>{urgencyLevel[key].caption}</Option>);
});
@connect(({ transportOrder, order, article, store, dc, loading }) => ({
  transportOrder,
  order,
  article,
  store,
  dc,
  loading: loading.models.transportOrder,
}))
@Form.create()
export default class TransportOrderCreatePage extends CreatePage {

  constructor(props) {
    super(props);
    this.state = {
      title: commonLocale.createLocale + alcNtcLocale.title,
      entityUuid: props.transportOrder.entityUuid,
      orderBillItems: [],
      articleMap: {},
      qpcStrAndMunitOptions: [],
      qtyStr: '',
      entity: {
        owner: getDefOwner() ? getDefOwner() : undefined,
        articleDetails: []
      },
      articles: [],
      owner: getDefOwner(),
      addDetail: true
    }
  }

  componentDidMount() {
    if(this.state.entityUuid) {
      this.refresh();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.entityUuid && nextProps.transportOrder.entity!=this.props.transportOrder.entity&& nextProps.transportOrder.entity.uuid === this.state.entityUuid) {
      this.setState({
        entity: nextProps.transportOrder.entity,
        orderBillItems: nextProps.transportOrder.entity.articleDetails ? nextProps.transportOrder.entity.articleDetails : [],
        title: alcNtcLocale.title + "：" + nextProps.transportOrder.entity.billNumber,
      });
      if(nextProps.transportOrder.entity.articleDetails && nextProps.transportOrder.entity.articleDetails.length>0) {
        this.setState({
          addDetail: true
        })
      } else {
        this.setState({
          addDetail: false
        })
      }
    }

    if (nextProps.article.data.list && Array.isArray(nextProps.article.data.list)&&nextProps.article.data.list!=this.props.article.data.list)   {
      this.setState({
        articles: nextProps.article.data.list
      });

    }
    if (nextProps.article.qpcs && Array.isArray(nextProps.article.qpcs)) {
      const { articleMap } = this.state;
      articleMap[nextProps.article.articleUuid] = nextProps.article.qpcs;
      this.setState({
        articleMap: {
          ...articleMap
        }
      });
    }
  }

  onCancel = () => {
    this.props.form.resetFields();
    this.props.dispatch({
      type: 'transportOrder/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  onSave = (data) => {
    const creation = this.convertData(data);
    if (!creation) {
      return;
    }
    if(creation && creation.orderItemSplits.length === 0) {
      message.error('当前没有有效拆单数据，无需确认');
      return;
    }
    this.props.dispatch({
      type: 'transportOrder/split',
      payload: creation,
      callback: (response) => {
        if (response && response.success) {
          this.props.form.resetFields();
          message.success('拆单成功');
        }
      }
    });
  }

  convertData(data) {
    const { entity, orderBillItems } = this.state;
    let items = [];
    if(Array.isArray(orderBillItems) && orderBillItems.length > 0 ) {
      for (let i = 0; i < orderBillItems.length; i++) {
        if (!orderBillItems[i].article) {
          orderBillItems.splice(i, 1);
          if (orderBillItems[i] && orderBillItems[i].line) {
            orderBillItems[i].line = i + 1;
          }
          i = i - 1;
        }
      }
      for (let i = 0; i <= orderBillItems.length - 1; i++) {
        let articleItem = {};
        if(orderBillItems && orderBillItems[i].qtyStr1) {
          articleItem.orderArticleDetailUuid = orderBillItems[i].uuid;
          articleItem.qtyStr = orderBillItems[i].qtyStr1;
          items.push(articleItem);
        }
        if (orderBillItems[i].qtyStr1 < 0) {
          message.error('第' + orderBillItems[i].line + '行拆单件数必须大于0');
          return false;
        }
        if (parseFloat(orderBillItems[i].qtyStr1) > parseFloat(orderBillItems[i].qtyStr)) {
          message.error('第' + orderBillItems[i].line + '行拆单件数大于件数');
          return false;
        }
      }
    }
    if( data.cartonCount > entity.cartonCount ) {
      message.error('拆单箱数大于总箱数');
      return false;
    }
    let alcNtcCreation = {
      cartonCount: entity.cartonCount1 ? entity.cartonCount1 : 0,
      orderUuid: this.state.entity.uuid,
      orderItemSplits : items,
    };
    return alcNtcCreation;
  }

  refresh = () => {
    this.props.dispatch({
      type: 'transportOrder/get',
      payload: this.state.entityUuid
    });
  }

  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, orderBillItems } = this.state;
    if (entity.store) {
      entity.store.type = 'STORE';
    }
    let cols = [
      <CFormItem key='billNumber' label={commonLocale.billNumberLocal}>
        {
          getFieldDecorator('billNumber', {
          })(
            <span>{ entity ? entity.billNumber : <Empty /> }</span>
          )
        }
      </CFormItem>,
      <CFormItem key='wmsNum' label={alcNtcLocale.wmsNum}>
        {
          getFieldDecorator('wmsNum', {
          })(
            <span>{ entity && entity.wmsNum ? entity.wmsNum : <Empty /> }</span>
          )
        }
      </CFormItem>,
      <CFormItem key='sourceNum' label={alcNtcLocale.sourceBillNumber}>
        {
          getFieldDecorator('sourceNum', {
          })(
            <span>{ entity && entity.sourceNum ? entity.sourceNum : <Empty /> }</span>
          )
        }
      </CFormItem>,
      <CFormItem key='waveNum' label={alcNtcLocale.waveNum}>
        {
          getFieldDecorator('waveNum', {
          })(
            <span>{ entity && entity.waveNum ? entity.waveNum : <Empty /> }</span>
          )
        }
      </CFormItem>,
      <CFormItem label={commonLocale.inOwnerLocale} key='owner'>
        {getFieldDecorator('owner', {
        })(
          <span>{ entity ? convertCodeName(entity.owner) : <Empty /> }</span>
        )}
      </CFormItem>,
      <CFormItem label={alcNtcLocale.orderType} key='orderType'>
        {getFieldDecorator('orderType', {
        }
        )(
          <span>{ entity && entity.orderType ? orderBillType[entity.orderType].caption : <Empty /> }</span>)}
      </CFormItem>,
      <CFormItem label={alcNtcLocale.urgencyLevel} key='urgencyLevel'>
        {getFieldDecorator('urgencyLevel', {}
        )(
          <span>{ entity && entity.urgencyLevel ? '是' : '否' }</span>
          )}
      </CFormItem>,
      <CFormItem key='orderTime' label={alcNtcLocale.orderTime}>
        {
          getFieldDecorator('orderTime', {
          })(
            <span>{ entity && entity.orderTime ? moment(entity.orderTime).format('YYYY-MM-DD') : <Empty /> }</span>
          )
        }
      </CFormItem>,
      <CFormItem label={alcNtcLocale.pickUpPoint} key='pickUpPoint'>
        {getFieldDecorator('pickUpPoint', {
        })(
          <span>{ entity.pickUpPoint ? convertCodeName(entity.pickUpPoint) : <Empty /> }</span>
        )}
      </CFormItem>,
      <CFormItem label={alcNtcLocale.deliveryPoint} key='deliveryPoint'>
        {getFieldDecorator('deliveryPoint', {
        })(
          <span>{ entity.deliveryPoint ? convertCodeName(entity.deliveryPoint) : <Empty /> }</span>
        )}
      </CFormItem>,
      <CFormItem label={alcNtcLocale.finalPoint} key='finalPoint'>
        {
          getFieldDecorator('finalPoint')(
            <span>{ entity.finalPoint ? convertCodeName(entity.finalPoint) : <Empty /> }</span>
          )
        }
      </CFormItem>
    ];
    let cols1 = [
      <CFormItem key='cartonCount' label={alcNtcLocale.wholeCase}>
        {getFieldDecorator('cartonCount', {
        })(
          <span>
            <span>{entity.cartonCount ? entity.cartonCount : 0}</span>&emsp;
            <InputNumber
              min={0}
              precision={0}
              onChange={e => this.handleFieldChange(e, 'cartonCount','')}
              style={{display: orderBillItems.length > 0 ? 'none' : 'inline-block', width:70}}
             />
          </span>
        )}
      </CFormItem>,
      <CFormItem key='containerCount' label={alcNtcLocale.passBox}>
        {getFieldDecorator('containerCount', {
        })(
          <span>{entity.containerCount ? entity.containerCount : 0}</span>
        )}
      </CFormItem>,
      <CFormItem key='weight' label={alcNtcLocale.weight}>
        {getFieldDecorator('weight', {
        })(
          <span>{entity.weight ? entity.weight : 0}</span>
        )}
      </CFormItem>,
      <CFormItem key='volume' label={alcNtcLocale.volume}>
        {getFieldDecorator('volume', {
        })(
          <span>{entity.volume ? entity.volume : 0}</span>
        )}
      </CFormItem>
    ];
    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={cols} />,
      <FormPanel key='basicInfo1' title={'业务信息'} cols={cols1} />
    ];
  }

  handleFieldChange(e, fieldName, line) {
    const { orderBillItems, entity } = this.state;
    if (fieldName === 'qtyStr') {
      orderBillItems[line - 1].qtyStr1 = e;
    }
    if (fieldName === 'cartonCount') {
      entity.cartonCount1 = e;
    }
    this.setState({
      orderBillItems: orderBillItems.slice(),
      entity: { ...entity }
    });
  }
  /**
   * 绘制明细表格
   */
  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, orderBillItems, addDetail } = this.state;
    let articleCols = [
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        width: itemColWidth.articleEditColWidth,
        render: (record) => {
          return record.article ? convertCodeName(record.article) : <Empty />;
        }
      },
      {
        title: alcNtcLocale.secondCode,
        dataIndex: 'barcode',
        key: 'barcode',
        width: itemColWidth.qtyColWidth-50,
        render: (text, record) => {
          return <span>{record.barcode ? record.barcode : <Empty />}</span>
        }
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        key: 'qpcStr',
        width: itemColWidth.qpcStrEditColWidth+60,
        render: (val, record) => {
          return record.qpcStr + '/' + record.munit;
        }
      },
      {
        title: commonLocale.inQtyStrLocale,
        key: 'qtyStr',
        width: itemColWidth.qtyStrEditColWidth,
        render: (text, record) => {
          return <span>
            <span>{record.qtyStr ? record.qtyStr : '0+0'}</span>&emsp;
            <InputNumber
              min={0}
              precision={0}
              onChange={e => this.handleFieldChange(e, 'qtyStr', record.line)}
              style={{width: 60}} />
          </span>
        }
      },
      // {
      //   title: alcNtcLocale.amount,
      //   dataIndex: 'amount',
      //   key: 'amount',
      //   width: itemColWidth.qtyColWidth-50,
      //   render: (text, record) => {
      //     return <span>{record.amount ? record.amount : 0}</span>
      //   }
      // },
      // {
      //   title: alcNtcLocale.weight,
      //   key: 'weight',
      //   width: itemColWidth.qtyColWidth-50,
      //   render: (record) => {
      //     return record.weight/1000;
      //   }
      // },
      // {
      //   title: alcNtcLocale.volume,
      //   key: 'volume',
      //   width: itemColWidth.qtyColWidth-50,
      //   render: (record) => {
      //     return record.volume/1000000;
      //   }
      // },

    ];
    return (
      <ItemEditTable
        title={orderLocale.articleTableTitle}
        notNote
        columns={articleCols}
        data={orderBillItems}
        noAddandDelete={true}
      />
    )
  }
}
