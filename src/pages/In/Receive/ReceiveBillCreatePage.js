import { connect } from 'dva';
import moment from 'moment';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import OrderBillNumberSelect from './OrderBillNumberSelect';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import { Form, Select, Input, InputNumber, message, Col, DatePicker, Modal } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale, confirmLineFieldNotNullLocale } from '@/utils/CommonLocale';
import { qtyStrToQty, add, toQtyStr } from '@/utils/QpcStrUtil';
import { convertCodeName } from '@/utils/utils';
import UserSelect from '@/pages/Component/Select/UserSelect';
import BinSelect from '@/pages/Component/Select/BinSelect';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import { formatDate } from '@/utils/utils';
import { receiveLocale } from './ReceiveLocale';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import ContainerSelect from '@/pages/Component/Select/ContainerSelect';
import { containerState } from '@/utils/ContainerState';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { binUsage, getUsageCaption } from '@/utils/BinUsage';
import { binState, getStateCaption } from '@/utils/BinState';
import Empty from '@/pages/Component/Form/Empty';
import PanelItemBatchAdd from '@/pages/Component/Form/PanelItemBatchAdd';
import { SHELFLIFE_TYPE } from '@/pages/Basic/Article/Constants';
import SearchFormItemBatchAdd from './SearchFormItemBatchAdd';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { Method } from './ReceiveContants';
import { RECEIVE_RES } from './ReceivePermission';

const FormItem = Form.Item;
@connect(({ receive, order,pickSchema, loading }) => ({
  receive,
  order,
  pickSchema,
  loading: loading.models.receive,
}))
@Form.create()
export default class ReceiveBillCreatePage extends CreatePage {

  constructor(props) {
    super(props);
    this.state = {
      title: commonLocale.createLocale + receiveLocale.title,
      entityUuid: props.entityUuid,
      entity: {
        method: Method.MANUAL.name,
        type: 'NORMAL',
        receiver: {
          uuid: loginUser().uuid,
          code: loginUser().code,
          name: loginUser().name
        },
        items: []
      },//收货单
      order: {
        items: []
      }, //入库单明细,
      batchAddVisible: false,
      allArticleList: [],
      searchedArticleList: [],
      auditButton : true,
      showBinCodeModal:false,
      auditPermission: RECEIVE_RES.AUDIT,
      schemaList:[],
    }
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.entityUuid && nextProps.receive.entity.uuid === this.state.entityUuid && !nextProps.order.entity.uuid) {
      this.setState({
        entity: nextProps.receive.entity,
        title: receiveLocale.title + "：" + nextProps.receive.entity.billNumber,
      });
      this.getOrder(nextProps.receive.entity.orderBillNumber);
    }
    if (nextProps.order.entity && nextProps.order.entity.uuid) {
      this.setState({
        order: nextProps.order.entity
      })
    }
    if(nextProps.pickSchema.schemaList&&nextProps.pickSchema.schemaList!=this.props.pickSchema.schemaList){
      this.setState({
        schemaList:[...nextProps.pickSchema.schemaList]
      })
    }
    let order = nextProps.order.entity;
    if (order && order.billNumber && this.state.entity.orderBillNumber !== order.billNumber) {
      let entity = this.state.entity;
      entity.orderBillNumber = order.billNumber;
      entity.vendor = order.vendor;
      entity.wrh = order.wrh;
      entity.owner = order.owner;
      entity.logisticMode = order.logisticMode;
      let items = [];
      let i = 1;
      Array.isArray(order.items) && order.items.forEach(function (item) {
        if (item.receivedQty < item.qty) {
          let receiveItem = {
            line: i,
            article: item.article,
            qpcStr: item.receiveQpcStr,
            price: item.price,
            spec: item.spec,
            munit: item.receiveMunit,
            qty: item.qty - item.receivedQty,
            qtyStr: toQtyStr(item.qty - item.receivedQty, item.receiveQpcStr),
            manageBatch:item.manageBatch,
            shelfLifeType: item.shelfLifeType
          }
          items.push(receiveItem);
          i++;
        }
      });
      entity.items = items;
      this.setState({
        entity: { ...entity },
        order: order,
        allArticleList: [...items]
      })
    }
  }
  onCancel = () => {
    this.props.form.resetFields();
    this.props.dispatch({
      type: 'receive/showPage',
      payload: {
        showPage: 'query'
      }
    });
    this.getOrder(null);
  }

  onSave = (data) => {
    const creation = this.convertData(data);
    if (!creation) {
      return;
    }
    if (!this.state.entity.uuid) {
      this.props.dispatch({
        type: 'receive/onSave',
        payload: creation,
        callback: (response) => {
          if (response && response.success) {
            this.props.order.entity={};
            this.props.form.resetFields();
            //this.getOrder(null);
            message.success(commonLocale.saveSuccessLocale);
          }
        }
      });
    } else {
      creation.uuid = this.state.entity.uuid;
      creation.version = this.state.entity.version;
      this.props.dispatch({
        type: 'receive/onModify',
        payload: creation,
        callback: (response) => {
          if (response && response.success) {
            this.props.order.entity={};
            this.props.form.resetFields();
            //this.getOrder(null);
            message.success(commonLocale.modifySuccessLocale);
          }
        }
      });
    }
  }

  onSaveAndCreate = (data) => {
    const creation = this.convertData(data);
    if (!creation) {
      return;
    }
    this.props.dispatch({
      type: 'receive/onSaveAndCreate',
      payload: creation,
      callback: (response) => {
        if (response && response.success) {
          this.props.order.entity={};
          this.setState({
            entity: {
              companyUuid: loginCompany().uuid,
              dcUuid: loginOrg().uuid,
              method: Method.MANUAL.name,
              type: 'NORMAL',
              receiver: {
                uuid: loginUser().uuid,
                code: loginUser().code,
                name: loginUser().name
              },
              items: []
            }
          }, () => { });
          this.props.form.resetFields();
          //this.getOrder(null);
          message.success(commonLocale.saveSuccessLocale);
        }
      }
    });
  }

  convertData(data) {
    const { entity } = this.state;
    let items = [];
    if (this.state.entity.items.length === 0) {
      message.error(notNullLocale(commonLocale.itemsLocale));
      return false;
    }

    for (let i = 0; i <= entity.items.length - 1; i++) {
      if (!entity.items[i].article) {
        message.error(confirmLineFieldNotNullLocale(entity.items[i].line, commonLocale.inArticleLocale));
        return false;
      } else if (!entity.items[i].qpcStr) {
        message.error(confirmLineFieldNotNullLocale(entity.items[i].line, commonLocale.inQpcAndMunitLocale));
        return false;
      } else if (!entity.items[i].productDate) {
        message.error(confirmLineFieldNotNullLocale(entity.items[i].line, commonLocale.inProductDateLocale));
        return false;
      } else if (!entity.items[i].validDate) {
        message.error(confirmLineFieldNotNullLocale(entity.items[i].line, commonLocale.inValidDateLocale));
        return false;
      } else if (!entity.items[i].qty || entity.items[i].qty <= 0) {
        message.error('第' + entity.items[i].line + '行数量必须大于0');
        return false;
      } else if (entity.items[i].note && entity.items[i].note.length > 255) {
        message.error('第' + entity.items[i].line + '行备注长度最大为255');
        return false;
      } else if(!entity.items[i].containerBarcode&&
        (!entity.items[i].targetBinCode||(entity.items[i].targetBinCode&&entity.items[i].targetBinUsage==binUsage.StorageBin.name))){
          message.error(confirmLineFieldNotNullLocale(entity.items[i].line, commonLocale.inContainerBarcodeLocale));
        return false;
      }
      
      let articleItem = {};
      articleItem.productDate = formatDate(entity.items[i].productDate, true);
      articleItem.validDate = formatDate(entity.items[i].validDate, true);
      articleItem.article = entity.items[i].article;
      articleItem.containerBarcode = entity.items[i].containerBarcode;
      articleItem.note = entity.items[i].note;
      articleItem.qpcStr = entity.items[i].qpcStr;
      articleItem.qty = entity.items[i].qty;
      articleItem.line = entity.items[i].line;
      articleItem.targetBinCode = entity.items[i].targetBinCode;
      articleItem.targetBinUsage = entity.items[i].targetBinUsage;
      articleItem.productionBatch = entity.items[i].productionBatch;
      items.push(articleItem);
    }

    let receiveCreation = {
      orderBillNumber: data.orderBillNumber,
      receiver: JSON.parse(data.receiver),
      note: data.note,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      items: items
    }
    return receiveCreation;
  }

  refresh = () => {
    const that = this;
    if (this.state.entityUuid === undefined && this.props.receive.entity && this.props.receive.orderBillNumber) {
      this.props.receive.entity['orderBillNumber'] = this.props.receive.orderBillNumber;
      this.getOrder(this.props.receive.entity.orderBillNumber);
    } else {
      this.getOrder(null);
    }
    if (this.state.entityUuid) {
      this.props.dispatch({
        type: 'receive/get',
        payload: {
          uuid: this.state.entityUuid
        },
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('编辑的收货单不存在！');
            that.onCancel();
            return;
          }
        }
      });
    }
  }

  onOrderChange = (value) => {
    const { entity } = this.state;
    let originalOrder = this.props.form.getFieldValue('orderBillNumber');
    if (!originalOrder || entity.items.length === 0) {
      this.getOrder(value);
      return;
    }

    if (originalOrder != value) {
      Modal.confirm({
        title: '修改订单会导致明细改变，请确认修改？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          entity.items = [];
          this.setState({
            entity: { ...entity }
          });
          this.getOrder(value);
        },
        onCancel: () => {
          this.props.form.setFieldsValue({
            orderBillNumber: originalOrder
          });
        }
      });
    }
  }

  getOrder = (value) => {
    this.props.dispatch({
      type: 'order/getByBillNumberForReceive',
      payload: {
        sourceBillNumber: value,
        dcUuid: loginOrg().uuid
      }
    });
  }

  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;
    let cols = [
      <CFormItem label={commonLocale.inOrderBillNumberLocale} key='orderBillNumber'>
        {getFieldDecorator('orderBillNumber', {
          initialValue: entity.orderBillNumber,
          rules: [
            { required: true, message: notNullLocale(commonLocale.inOrderBillNumberLocale) }
          ],
        })(<OrderBillNumberSelect onChange={this.onOrderChange} showSourceBill={true} logisticMode='UNIFY' states={['INITIAL', 'BOOKING', 'BOOKED', 'INPROGRESS','PREVEXAM']} />)}
      </CFormItem>,
      <CFormItem label={commonLocale.inWrhLocale} key='wrh'>
        {getFieldDecorator('wrh')(<Col>{this.state.entity.wrh ? convertCodeName(this.state.entity.wrh) : <Empty />} </Col>)}
      </CFormItem>,
      <CFormItem label={commonLocale.inlogisticModeLocale} key='logisticsType'>
        {getFieldDecorator('logisticsType')(<Col>{this.state.entity.logisticMode ? LogisticMode[this.state.entity.logisticMode].caption : <Empty />}</Col>)}
      </CFormItem>,
      <CFormItem label={commonLocale.inOwnerLocale} key='owner'>
        {getFieldDecorator('owner')(<Col>{this.state.entity.owner ? convertCodeName(this.state.entity.owner) : <Empty />}</Col>)}
      </CFormItem>,
      <CFormItem label={commonLocale.vendorLocale} key='vendor'>
        {getFieldDecorator('vendor')(<Col>{this.state.entity.vendor ? convertCodeName(this.state.entity.vendor) : <Empty />}</Col>)}
      </CFormItem>,
      <CFormItem label={receiveLocale.receiver} key='receiver'>
        {getFieldDecorator('receiver', {
          initialValue: JSON.stringify(entity.receiver),
          rules: [
            { required: true, message: notNullLocale(receiveLocale.receiver) }
          ],
        })(<UserSelect single={true} />)}
      </CFormItem>,
    ];
    return [
      <FormPanel key='basicInfo' noteLabelSpan={4} title={commonLocale.basicInfoLocale} cols={cols} noteCol={this.drawNotePanel()} />
    ];
  }

  getArticles = (line) => {
    const { order, entity, entityUuid } = this.state;
    let articles = [];
    let articleUuids = [];
    order.items && order.items.forEach(function (e) {
      if (e.receivedQty < e.qty || (entityUuid && entity.uuid == entityUuid && e.receivedQty == e.qty)) {
        if (articleUuids.indexOf(e.article.uuid) === -1) {
          articles.push({
            uuid: e.article.uuid,
            code: e.article.code,
            name: e.article.name,
            spec: e.spec
          });
          articleUuids.push(e.article.uuid);
        }
      }
    });
    if (articles.length === 1) {
      entity.items[line - 1].article = {
        uuid: articles[0].uuid,
        code: articles[0].code,
        name: articles[0].name
      };
      entity.items[line - 1].spec = articles[0].spec;
    }
    return articles;
  }

  getArticleOptions = () => {
    let articleOptions = [];
    this.getArticles().forEach(function (e) {
      articleOptions.push(
        <Select.Option key={JSON.stringify(e)} value={JSON.stringify(e)}>{convertCodeName(e)}</Select.Option>
      );
    });
    return articleOptions;
  }

  getQpcStrs = (line) => {
    const { order, entity, entityUuid } = this.state;
    let qpcStrs = [];
    if (!entity.items[line - 1].article) {
      return qpcStrs;
    }
    order.items && order.items.forEach(function (e) {
      if (e.receivedQty < e.qty || (entityUuid && entity.uuid == entityUuid && e.receivedQty == e.qty)) {
        if (e.article && e.article.uuid === entity.items[line - 1].article.uuid) {
          if (e.receiveQpcStr && qpcStrs.indexOf(JSON.stringify({
            qpcStr: e.receiveQpcStr,
            munit: e.receiveMunit
          })) === -1)
            qpcStrs.push(JSON.stringify({
              qpcStr: e.receiveQpcStr,
              munit: e.receiveMunit
            }));
        }
      }
    });
    if (qpcStrs.length === 1) {
      entity.items[line - 1].qpcStr = JSON.parse(qpcStrs[0]).qpcStr;
      entity.items[line - 1].munit = JSON.parse(qpcStrs[0]).munit;
    }
    return qpcStrs;
  }

  getQpcStrOptions = (line) => {
    let qpcStrOptions = [];
    this.getQpcStrs(line).forEach(function (e) {
      qpcStrOptions.push(
        <Select.Option key={e} value={e}>
          {JSON.parse(e).qpcStr + '/' + JSON.parse(e).munit}
        </Select.Option>
      );
    });
    return qpcStrOptions;
  }

  getPrices = (line) => {
    const { order, entity, entityUuid } = this.state;
    let prices = [];
    if (!entity.items[line - 1].article || !entity.items[line - 1].qpcStr) {
      return prices;
    }
    order.items && order.items.forEach(function (e) {
      if (e.receivedQty < e.qty || (entityUuid && entity.uuid == entityUuid && e.receivedQty == e.qty)) {
        if (e.article.uuid === entity.items[line - 1].article.uuid &&
          e.receiveQpcStr === entity.items[line - 1].qpcStr) {
          if (prices.indexOf(e.price) === -1)
            prices.push(e.price);
        }
      }
    });
    if (prices.length === 1) {
      entity.items[line - 1].price = prices[0];
    }
    return prices;
  }

  getPriceOptions = (line) => {
    let priceOptions = [];
    this.getPrices(line).forEach(function (e) {
      priceOptions.push(<Select.Option key={e} value={e}>{e}</Select.Option>);
    });
    return priceOptions;
  }

  getCanReceiveQty = (line) => {
    const { order, entity } = this.state;

    const record = entity.items[line - 1];
    let canReceiveQty = 0;
    if (!record.article || !record.qpcStr || record.price === undefined) {
      canReceiveQty = 0;
    }
    else {
      order.items.forEach(function (e) {
        if (e.article.uuid === record.article.uuid
          && e.qpcStr === record.qpcStr && e.price === record.price)
          canReceiveQty = e.qty - e.receivedQty;
      });
    }

    return canReceiveQty;
  }

  getShelfLifeType = (line) => {
    const { order, entity } = this.state;

    let shelfLife = {};
    if (!entity.items[line - 1].article) {
      return shelfLife;
    }
    order.items && order.items.forEach(function (e) {
      if (e.article.uuid === entity.items[line - 1].article.uuid) {
        shelfLife = {
          shelfLifeType: e.shelfLifeType,
          shelfLifeDays: e.shelfLifeDays
        };
      }
    });
    return shelfLife;
  }

  handleFieldChange(e, fieldName, line) {
    const { entity } = this.state;
    const target = entity.items[line - 1];
    if (fieldName === 'article') {
      let article = JSON.parse(e);
      target.article = {
        uuid: article.uuid,
        code: article.code,
        name: article.name
      };
      target.spec = article.spec;
      this.props.dispatch({
        type: 'article/get',
        payload: {
          uuid: article.uuid
        },
        callback: response => {
          if (response && response.success && response.data) {
            let data = response.data.manageBatch;
            target.manageBatch = data
          }
        }
      });
      const qpcStrs = this.getQpcStrs(line);
      if (qpcStrs.length > 0) {
        target.qpcStr = JSON.parse(qpcStrs[0]).qpcStr;
        target.munit = JSON.parse(qpcStrs[0]).munit;
      }
      const prices = this.getPrices(line);
      if (prices.length > 0) {
        target.price = prices[0];
      }
      let canReceiveQty = this.getCanReceiveQty(line);
      target.qty = canReceiveQty;
      target.qtyStr = toQtyStr(canReceiveQty, target.qpcStr);
      if(target.targetBinCode!=null){
        target.targetBinUsage = undefined;
        target.targetBinCode = undefined;
      }
      if(target.containerBarcode!=null){
        target.containerBarcode = undefined;
      }
      if(target.productDate!=null){
        target.productDate = undefined;
      }
      if(target.validDate!=null){
        target.validDate = undefined;
      }
      if(target.manageBatch){
        target.productionBatch = '';
      }
    } else if (fieldName === 'qpcStr') {
      const qpcStrMunit = JSON.parse(e);
      target.qpcStr = qpcStrMunit.qpcStr;
      target.munit = qpcStrMunit.munit;
      const prices = this.getPrices(line);
      if (prices.length > 0) {
        target.price = prices[0];
      }
      let canReceiveQty = this.getCanReceiveQty(line);
      target.qty = canReceiveQty;
      target.qtyStr = toQtyStr(canReceiveQty, target.qpcStr);
    } else if (fieldName === 'price') {
      target.price = e;
      let canReceiveQty = this.getCanReceiveQty(line);
      target.qty = canReceiveQty;
      target.qtyStr = toQtyStr(canReceiveQty, target.qpcStr);
    } else if ((fieldName === 'productDate' || fieldName === 'validDate') && e) {
      const shelfLife = this.getShelfLifeType(line);
      if (shelfLife.shelfLifeType === 'VALIDDATE') {
        target.validDate = e.startOf('day');
        target.productDate = moment(e).add(-shelfLife.shelfLifeDays, 'days');
      } else {
        target.productDate = e.startOf('day');
        target.validDate = moment(e).add(shelfLife.shelfLifeDays, 'days');
      }
    } else if (fieldName === 'qtyStr') {
      if (e) {
        target.qtyStr = e;
        target.qty = qtyStrToQty(e.toString(), target.qpcStr);
      }
    } else if (fieldName === 'containerBarcode') {
      target.containerBarcode = e;
    } else if(fieldName === 'targetBinCode'){
      const binCodeUsage = JSON.parse(e);
      target.targetBinCode = binCodeUsage.code;
      target.targetBinUsage = binCodeUsage.usage;
    } else if(fieldName === 'productionBatch'){
      target.productionBatch = e;
    }

    this.setState({
      entity: { ...entity },
    })
  }

  disabledProductDate(current) {
    return current > moment().endOf('day');
  }

  disabledValidDate(current) {
    return current && current < moment().add(-1, 'days').endOf('day');
  }

  drawTable = () => {
      const { entity } = this.state;
    const columns = [
      {
        title: commonLocale.inArticleLocale,
        dataIndex: 'article',
        key: 'article',
        width: itemColWidth.articleEditColWidth,
        render: (text, record) => {
          if (this.getArticles(record.line).length === 1) {
            return convertCodeName(this.getArticles(record.line)[0]);
          }
          return (
            <Select value={record.article ? JSON.stringify({
              ...record.article,
              spec: record.spec
            }) : placeholderChooseLocale(commonLocale.articleLocale)} onChange={e => this.handleFieldChange(e, 'article', record.line)}>
              {this.getArticleOptions(record.line)}
            </Select>
          );
        }
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        dataIndex: 'qpcStr',
        key: 'qpcStr',
        width: itemColWidth.qpcStrEditColWidth + 20,
        render: (text, record) => {
          if (this.getQpcStrs(record.line).length === 1) {
            let qpcStrMunit = JSON.parse(this.getQpcStrs(record.line)[0]);
            return qpcStrMunit.qpcStr + '/' + qpcStrMunit.munit;
          }
          return (
            <Select value={record.qpcStr ? JSON.stringify({
              qpcStr: record.qpcStr,
              munit: record.munit
            }) : placeholderChooseLocale(commonLocale.inQpcAndMunitLocale)}
              onChange={e => this.handleFieldChange(e, 'qpcStr', record.line)}>
              {this.getQpcStrOptions(record.line)}
            </Select>
          );
        },
      },
      {
        title: commonLocale.inPriceLocale,
        dataIndex: 'price',
        key: 'price',
        width: itemColWidth.priceColWidth + 60,
        render: (text, record) => {
          if (this.getPrices(record.line).length === 1) {
            return this.getPrices(record.line)[0];
          }
          return (
            <Select value={record.price ? record.price : placeholderChooseLocale(commonLocale.inPriceLocale)} onChange={e => this.handleFieldChange(e, 'price', record.line)}>
              {this.getPriceOptions(record.line)}
            </Select>
          );
        }
      },
      {
        title: commonLocale.inProductDateLocale,
        dataIndex: 'productDate',
        key: 'productDate',
        width: itemColWidth.dateEditColWidth,
        render: (value, record) => {
          const shelfLife = this.getShelfLifeType(record.line);
          if (shelfLife.shelfLifeType) {
            if (shelfLife.shelfLifeType === 'NOCARE') {
              record.productDate = '8888-12-31';
              return '8888-12-31';
            } else if (shelfLife.shelfLifeType === 'VALIDDATE') {
              return value ? moment(value).format('YYYY-MM-DD') : <Empty />;
            } else {

              return (
                <DatePicker
                  disabledDate={this.disabledProductDate}
                  value={value ? moment(value) : null} allowClear={false}
                  onChange={(data) => this.handleFieldChange(data, 'productDate', record.line)} />
              );
            }

          }
          return <Empty />;
        },
      },
      {
        title: commonLocale.inValidDateLocale,
        dataIndex: 'validDate',
        key: 'validDate',
        width: itemColWidth.dateEditColWidth,
        render: (value, record) => {
          const shelfLife = this.getShelfLifeType(record.line);
          if (shelfLife.shelfLifeType) {
            if (shelfLife.shelfLifeType === 'NOCARE') {
              record.validDate = '8888-12-31';
              return '8888-12-31';
            } else if (shelfLife.shelfLifeType === 'VALIDDATE') {
              return (
                <DatePicker value={value ? moment(value) : null} allowClear={false}
                  onChange={(data) => this.handleFieldChange(data, 'validDate', record.line)}
                  disabledDate={this.disabledValidDate} />
              );
            } else {
              return value ? moment(value).format('YYYY-MM-DD') : <Empty />;
            }
          }
          return <Empty />;
        },
      },
      {
        title: commonLocale.inQtyStrLocale,
        dataIndex: 'qtyStr',
        key: 'qtyStr',
        width: itemColWidth.qtyStrEditColWidth,
        render: (text, record) => {
          return (
            <QtyStrInput
              value={record.qtyStr}
              onChange={
                e => this.handleFieldChange(e, 'qtyStr', record.line)
              }
              placeholder={placeholderLocale(commonLocale.inQtyStrLocale)}
            />
          );
        }
      },
      {
        title: commonLocale.inQtyLocale,
        key: 'qty',
        width: itemColWidth.qtyColWidth,
        render: (record) => {
          return <span>{record.qty ? record.qty : 0}</span>
        }
      },
      {
        title: commonLocale.inContainerBarcodeLocale,
        dataIndex: 'containerBarcode',
        key: 'containerBarcode',
        width: itemColWidth.containerEditColWidth,
        render: (text, record) => {
          if(record.targetBinUsage == binUsage.PickUpBin.name || record.targetBinUsage == binUsage.PickUpStorageBin.name){
            record.containerBarcode = '-';
            return <span>{record.containerBarcode}</span>;
          }
          if(record.containerBarcode == '-'){
            record.containerBarcode = undefined;
          }
          return (
            <ContainerSelect
              state={containerState.IDLE.name}
              value={record.containerBarcode}
              onChange={e => this.handleFieldChange(e, 'containerBarcode', record.line)}
              placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)}
            />
          )
        },
      },
      {
        title: receiveLocale.targetBin,
        dataIndex: 'targetBinCode',
        key: 'targetBinCode',
        width: itemColWidth.binCodeEditColWidth+40,
        render: (text, record) => {
          if(this.state.entity.wrh){
            return <BinSelect
              usages={[binUsage.StorageBin.name, binUsage.PickUpBin.name,binUsage.PickUpStorageBin.name]}
              states = {[binState.FREE.name,binState.USING.name]}
              disabled={false}
              multiple={false}
              getUsage
              wrhUuid={this.state.entity.wrh ? this.state.entity.wrh.uuid : undefined}
              value={record.targetBinCode ? JSON.stringify({
                code: record.targetBinCode,
                usage: record.targetBinUsage
              }) : undefined}
              placeholder={placeholderLocale(receiveLocale.targetBin)}
              onChange={
                e => this.handleFieldChange(e, 'targetBinCode', record.line)
              }
            />
          }else{
            return <Empty/>
          }
          
        },
      },
      {
        title: commonLocale.inProductionBatchLocale,
        dataIndex: 'productionBatch',
        key: 'productionBatch',
        width: itemColWidth.containerEditColWidth,
        render: (text, record) => {

          return(
            <Input
              value={record.productionBatch}
              disabled={!record.manageBatch}
              onChange={
                e => this.handleFieldChange(e.target.value, 'productionBatch', record.line)
              }
              placeholder={placeholderLocale(commonLocale.inProductionBatchLocale)}
            />
          )
        }
      },
    ];
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };

    const { form: { getFieldDecorator } } = this.props;
    return (
      <div>
        <ItemEditTable
          title={commonLocale.inArticleLocale}
          columns={columns}
          data={this.state.entity.items}
          handleFieldChange={this.handleFieldChange}
          drawTotalInfo={this.drawTotalInfo}
          drawBatchButton={this.drawBatchButton}
          // scroll={{ x: 2040 }}
          notNote
        />
        <PanelItemBatchAdd
          searchPanel={<SearchFormItemBatchAdd refresh={this.onSearch} fieldsValue={''} />}
          visible={this.state.batchAddVisible}
          columns={this.columns}
          tableId={'receive.create.table'}
          data={{ list: this.state.searchedArticleList }}
          handlebatchAddVisible={this.handlebatchAddVisible}
          getSeletedItems={this.getItemList}
          noPagination={true}
        />
         <Modal
            title={'批量设置'}
            visible={this.state.showBinCodeModal}
            onOk={this.onOk}
            onCancel={() => this.handlebatchSetBinVisible()}
            destroyOnClose={true}>
            <Form {...formItemLayout}>
              {this.state.showBinCodeModal && <FormItem key='bin' label={receiveLocale.targetBin}>
                {
                  getFieldDecorator('bin', {
                    rules: [
                      { required: true, message: notNullLocale(receiveLocale.targetBinCode) }
                    ],
                  })(
                    <BinSelect 
                      placeholder={placeholderChooseLocale(receiveLocale.targetBinCode)}
                      states = {[binState.FREE.name,binState.USING.name]}
                      usages={[binUsage.StorageBin.name, binUsage.PickUpBin.name,binUsage.PickUpStorageBin.name]}
                      disabled={false}
                      multiple={false}
                      getUsage
                      wrhUuid={this.state.entity.wrh ? this.state.entity.wrh.uuid : undefined}
                    />
                  )
                }
              </FormItem>}
              {this.state.showContainerModal && <FormItem key='container' label={pickUpBillLocale.targetContainerBarcode}>
                {
                  getFieldDecorator('container', {
                    rules: [
                      { required: true, message: notNullLocale(pickUpBillLocale.targetContainerBarcode) }
                    ],
                  })(
                    <ContainerSelect state={containerState.IDLE.name}
                      placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)} />
                  )
                }
              </FormItem>}
            </Form >
          </Modal>
      </div>
    )
  }

  drawTotalInfo = () => {
    let allQtyStr = '0';
    let allQty = 0;
    let allAmount = 0;
    this.state.entity.items && this.state.entity.items.map(item => {
      if (item.qty) {
        allQty = allQty + parseFloat(item.qty)
      }
      if (item.qtyStr) {
        allQtyStr = add(allQtyStr, item.qtyStr);
      }
      if (item.price) {
        allAmount = allAmount + item.price * item.qty;
      }
    })
    return (
      <span style={{ marginLeft: '10px' }}>
        {commonLocale.inAllQtyStrLocale}：{allQtyStr}  |
        {commonLocale.inAllQtyLocale}：{allQty}  |
        {commonLocale.inAllAmountLocale}：{allAmount ? allAmount :0}
      </span>
    );
  }
  /**
   * 绘制按钮
   */
  drawBatchButton = (selectedRowKeys) => {
    return (
      <div style={{"display":'inline'}}>
        <span>
          <a onClick={() => this.handlebatchAddVisible()}>添加</a>
        </span>
        &emsp;
        <span>
          <a onClick={() => this.handlebatchSetBin(selectedRowKeys)}>批量设置拣货位</a>
        </span>
        &emsp;
        <span>
          <a onClick={() => this.handlebatchSetBinVisible(true,selectedRowKeys)}>批量设置目标货位</a>
        </span>
      </div>
    )
  }
  /**搜索*/
  onSearch = (data) => {
    if (this.state.allArticleList.length === 0) {
      return;
    }
    let resultSearch = [];
    if (data && data.articleCode) {
      resultSearch = this.state.allArticleList.filter(item => { if (item.article.code.includes(data.articleCode)) return item; })
    } else {
      resultSearch = [...this.state.allArticleList]
    }
    this.setState({
      searchedArticleList: [...resultSearch]
    })
  }

  /** 批量添加弹出框*/
  handlebatchAddVisible = () => {
    this.setState({
      batchAddVisible: !this.state.batchAddVisible
    })
  }
  /** 批量设置指定目标货位 */
  handlebatchSetBinVisible = (flag,selectedRowKeys)=>{
    if (flag) {
      if (Array.isArray(selectedRowKeys) && selectedRowKeys.length === 0) {
        message.warn('请勾选，再进行批量操作');
        return;
      }
      this.setState({
        showBinCodeModal: true,
        selectedRowKeys: selectedRowKeys
      });
    }else{
      this.setState({
        showBinCodeModal: false,
        selectedRowKeys: []
      })
    }
    
  }
  /** 弹出框确认 */
  onOk = ()=>{
    this.props.form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      const entity = this.state.entity;
      let lines = this.state.selectedRowKeys;
      let bin = JSON.parse(fieldsValue.bin);
      Array.isArray(lines) && lines.forEach(function (line) {
        entity.items[line - 1].targetBinCode = bin.code;
        entity.items[line - 1].targetBinUsage = bin.usage;
      })
      this.setState({
        entity:{...entity},
      });
      this.handlebatchSetBinVisible();
    })
  }

  /** 批量设置拣货位 */
  handlebatchSetBin = (selectedRowKeys)=>{
    if (Array.isArray(selectedRowKeys) && selectedRowKeys.length === 0) {
      message.warn('请勾选，再进行批量操作');
      return;
    }

    let articleUuids = [];
    for(let i of selectedRowKeys){
      let article = this.state.entity.items[i-1].article;
      articleUuids.push(article.uuid);
    }

    this.props.dispatch({
      type: 'pickSchema/queryByArticles',
      payload: {
        articleUuids:articleUuids
      },
      callback: (response) => {
        if (response && response.success) {
          let errorInfo = '';
          // 设置商品的贱货位 有整件拣货位取整件否则取拆零，都没有时跳过该商品
          for(let t of this.state.entity.items){
            for(let i of this.state.schemaList){
              if(t.article.uuid === i.articleUuid){
                if(i.caseBinCode){
                  t.targetBinCode = i.caseBinCode;
                  t.targetBinUsage = i.caseBinUsage;
                }else if(i.splitBinCode){
                  t.targetBinCode = i.splitBinCode;
                  t.targetBinUsage = i.splitBinUsage;
                }
              }
            }
            if(t.targetBinCode == null && t.targetBinUsage == null) {
              errorInfo = errorInfo + '第' + t.line + '行商品没有设置拣货位;';
            }
          }
          this.setState({
            entity:{...this.state.entity}
          })
          if(errorInfo != '') {
            message.info(errorInfo);
          }
        }
      }
    });

    this.setState({
      selectedRowKeys: selectedRowKeys,
    })
  }

  /**获取批量增加的集合*/
  getItemList = (value) => {
    const { entity } = this.state;
    var newList = [];
    for (let i = 0; i < value.length; i++) {
      if (entity.items && entity.items.find(function (item) {
        return item.article && item.article.uuid === value[i].article.uuid && item.qpcStr === value[i].qpcStr &&
          item.munit === value[i].munit && item.spec === value[i].spec && item.price === value[i].price && item.qty === value[i].qty
      }) === undefined) {
        let temp = { ...value[i] };
        newList.push(temp);
      }
    }
    this.state.line = entity.items.length + 1;
    newList.map(item => {
      item.line = this.state.line;
      this.state.line++;
    });
    entity.items = [...entity.items, ...newList];
    this.setState({
      entity: { ...entity }
    })
  }
  columns = [
    {
      title: commonLocale.inArticleLocale,
      key: 'article',
      dataIndex: 'article',
      width: colWidth.codeNameColWidth + 50,
      render: (val) => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: commonLocale.inQpcAndMunitLocale,
      key: 'qpcStr',
      dataIndex: 'qpcStr',
      width: itemColWidth.qpcStrColWidth + 50,
      render: (val, record) => { return record.qpcStr ? record.qpcStr + '/' + record.munit : <Empty/>; }
    },
    {
      title: commonLocale.inPriceLocale,
      dataIndex: 'price',
      key: 'price',
      width: itemColWidth.priceColWidth + 50,
    },
    {
      title: '保质期类型',
      dataIndex: 'shelfLifeType',
      key: 'shelfLifeType',
      width: colWidth.enumColWidth + 50,
      render: (val) => SHELFLIFE_TYPE[val]
    },
    {
      title: commonLocale.inQtyStrLocale,
      dataIndex: 'qtyStr',
      key: 'qtyStr',
      width: itemColWidth.qtyStrEditColWidth,
    },
    {
      title: commonLocale.inQtyLocale,
      key: 'qty',
      dataIndex: 'qty',
      width: itemColWidth.qtyColWidth,
      render: (val, record) => { return record.qty ? record.qty : 0; }
    },
  ]
}
