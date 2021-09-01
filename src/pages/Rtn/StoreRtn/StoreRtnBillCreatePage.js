import moment from 'moment';
import { connect } from 'dva';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import { Form, Select, Divider, Input, InputNumber, message, Col, DatePicker, Modal } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { qtyStrToQty, add, toQtyStr, Subtr, accAdd } from '@/utils/QpcStrUtil';
import { convertCodeName } from '@/utils/utils';
import { containerState } from '@/utils/ContainerState';
import { formatDate } from '@/utils/utils';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import UserSelect from '@/pages/Component/Select/UserSelect';
import CreatePage from './StoreRtnCreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import style from '@/pages/Component/Form/ItemEditTable.less';
import ContainerSelect from '@/pages/Component/Select/ContainerSelect';
import { storeRtnLocal } from './StoreRtnBillLocale';
import { Type, ReturnType } from './StoreRtnBillContants';
import RtnContainerModal from './RtnContainerModal';
import RtnTypeModal from './RtnTypeModal';
import TargetBinModal from './TargetBinModal';
import StoreRtnNtcBillSelect from './StoreRtnNtcBillSelect';
import Empty from '@/pages/Component/Form/Empty';
import { billType, qpcStrFrom } from '@/pages/Facility/Config/BillQpcStr/BillQpcStrConfigContans';
import BinSelect from '@/pages/Component/Select/BinSelect';
import { binUsage } from '@/utils/BinUsage';
import { binState } from '@/utils/BinState';
const typeOptions = [];
Object.keys(Type).forEach(function (key) {
  typeOptions.push(<Option value={Type[key].name}
                           key={Type[key].name}>
    {Type[key].caption}
  </Option>);
});
const returnTypeOptions = [];
Object.keys(ReturnType).forEach(function (key){
  returnTypeOptions.push(<Option value={ReturnType[key].name}
                                 key={ReturnType[key].name}>
    {ReturnType[key].caption}
  </Option>)
});
@connect(({ storeRtn, storeRtnNtc, article, billQpcStrConfig, pickSchema, loading }) => ({
  storeRtn, storeRtnNtc, article, billQpcStrConfig, pickSchema,
  loading: loading.models.storeRtn,
}))
@Form.create()
export default class StoreRtnBillCreatePage extends CreatePage {
  constructor(props) {
    super(props);
    this.state = {
      title: commonLocale.createLocale + storeRtnLocal.title,
      entityUuid: props.entityUuid,
      entity: {
        rtner: {
          uuid: loginUser().uuid,
          code: loginUser().code,
          name: loginUser().name
        },
        items: []
      },
      rtner: {
        uuid: loginUser().uuid,
        code: loginUser().code,
        name: loginUser().name
      },
      ntcBill: {
        items: []
      },
      articles: [],
      auditButton: true,
      selectedRowKeys: [],
      containerModalVisible: false,
      typeModalVisible: false,
      pickUpBinModalVisible: false,
      billConfig: {},
      schemaList: []
    }
  }
  componentDidMount() {
    this.queryBillQpcStrConfig()
    this.refresh();
  }
  componentWillReceiveProps(nextProps) {
    const { articles } = this.state;

    if (nextProps.entityUuid && nextProps.entityUuid != this.props.entityUuid) {

      this.setState({
        entityUuid: nextProps.entityUuid
      }, () => {
        this.refresh()
      })
    }
    this.refresh()

    let nextConfig = nextProps.billQpcStrConfig.entity;

    if (nextProps.article.articles && nextProps.article.articles.length > 0) {
      nextProps.article.articles.forEach(function (e) {
        articles[e.uuid] = e;
      });
      this.setState({
        articles: articles
      });
    }
    if (nextProps.billQpcStrConfig.entity && nextProps.billQpcStrConfig.entity.uuid) {
      this.setState({
        billConfig: nextProps.billQpcStrConfig.entity
      });
    }
    if (nextProps.pickSchema.schemaList && nextProps.pickSchema.schemaList != this.props.pickSchema.schemaList) {
      this.setState({
        schemaList: [...nextProps.pickSchema.schemaList]
      })
    }
  }
  queryBillQpcStrConfig = () => {
    this.props.dispatch({
      type: 'billQpcStrConfig/getByBillType',
      payload: {
        dcUuid: loginOrg().uuid,
        billType: 'RTNBILL'
      }
    });
  }
  queryArticle = (articleUuid) => {
    this.props.dispatch({
      type: 'article/get',
      payload: {
        uuid: articleUuid
      }
    });
  }
  queryArticles = (articleUuids) => {
    this.props.dispatch({
      type: 'article/queryByUuids',
      payload: articleUuids
    });
  }
  onCancel = () => {
    this.props.form.resetFields();
    if (!this.props.storeRtn.entityUuid) {
      this.props.dispatch({
        type: 'storeRtn/showPage',
        payload: {
          showPage: 'query',
        }
      });
    } else {
      this.props.dispatch({
        type: 'storeRtn/showPage',
        payload: {
          showPage: 'view',
          entityUuid: this.props.storeRtn.entityUuid,
        }
      });
    }
    this.getNtcBill('');
  }
  onSave = (data) => {
    const { entity } = this.state;
    let bill = {
      ...entity,
    };
    if (!bill) {
      return;
    }
    bill.rtner = JSON.parse(data.rtner);
    bill.note = data.note;
    bill.companyUuid = loginCompany().uuid;
    bill.dcUuid = loginOrg().uuid;
    bill.returnType = data.returnType;
    if (this.validate(bill) === false)
      return;
    if (!bill.uuid) {
      this.props.dispatch({
        type: 'storeRtn/save',
        payload: bill,
        callback: (response) => {
          if (response && response.success) {
            this.props.form.resetFields();
            this.getNtcBill('');
            message.success(commonLocale.saveSuccessLocale);
          }
        }
      });
    } else {
      this.props.dispatch({
        type: 'storeRtn/modify',
        payload: bill,
        callback: (response) => {
          if (response && response.success) {
            this.props.form.resetFields();
            this.getNtcBill('');
            message.success(commonLocale.modifySuccessLocale);
          }
        }
      });
    }
  }
  onSaveAndCreate = (data) => {
    const { entity } = this.state;
    let bill = {
      ...entity,
    };
    if (!bill) {
      return;
    }
    bill.rtner = JSON.parse(data.rtner);
    bill.note = data.note;
    bill.companyUuid = loginCompany().uuid;
    bill.dcUuid = loginOrg().uuid;
    if (this.validate(bill) === false)
      return;
    this.getNtcBill('');
    this.props.dispatch({
      type: 'storeRtn/onSaveAndAudit',
      payload: bill,
      callback: (response) => {
        if (response && response.success) {
          this.props.form.resetFields();
          this.getNtcBill('');
          message.success(commonLocale.saveAndAuditSuccess);
        }
      }
    });
  }
  validate = (entity) => {
    if (entity.items.length === 0) {
      message.error('退仓明细不能为空');
      return false;
    }
    for (let i = entity.items.length - 1; i >= 0; i--) {
      const shelfLife = this.getShelfLife(entity.items[i]);
      if (entity.items[i].article && entity.items[i].type === 0) {
        message.error(`第${entity.items[i].line}行退仓类型不能为空！`);
        return false;
      }
      if (entity.items[i].article && entity.items[i].qty === 0) {
        message.error(`第${entity.items[i].line}行退仓数量不能为0！`);
        return false;
      }
      // if (entity.items[i].article && !(Type.RTNWRH.name == entity.items[i].type &&
      //     (binUsage.PickUpBin.name == entity.items[i].targetBinUsage || binUsage.PickUpStorageBin.name == entity.items[i].targetBinUsage))
      //     && !entity.items[i].containerBarcode) {
      //     message.error(`第${entity.items[i].line}行容器条码不能为空！`);
      //     return false;
      // }
      if (entity.items[i].article && !entity.items[i].productDate) {
        message.error(`第${entity.items[i].line}行生产日期不能为空！`);
        return false;
      }
      if (entity.items[i].article && !entity.items[i].productionBatch) {
        message.error(`第${entity.items[i].line}行批号不能为空！`);
        return false;
      }
      if (entity.items[i].article && entity.items[i].productDate
        && moment(entity.items[i].productDate).startOf('day') > moment(new Date()).startOf('day')
        && Type.RTNWRH.name === entity.items[i].type
        && shelfLife && shelfLife.shelfLifeType !== 'NOCARE') {
        message.error(`第${entity.items[i].line}行生产日期不能晚于当前日期！`);
        return false;
      }
      if (entity.items[i].article && !entity.items[i].validDate) {
        message.error(`第${entity.items[i].line}行到效期不能为空！`);
        return false;
      }
      if (entity.items[i].article && entity.items[i].validDate
        && moment(entity.items[i].validDate).startOf('day') < moment(new Date()).startOf('day')
        && Type.RTNWRH.name === entity.items[i].type
        && shelfLife && shelfLife.shelfLifeType !== 'NOCARE') {
        message.error(`第${entity.items[i].line}行到效期不能早于当前日期！`);
        return false;
      }
      if (entity.items[i].article && !entity.items[i].vendor) {
        message.error(`第${entity.items[i].line}行供应商不能为空！`);
        return false;
      }
      entity.items[i].productDate = formatDate(entity.items[i].productDate, true);
      entity.items[i].validDate = formatDate(entity.items[i].validDate, true);
    }
    return true;
  }
  refresh = () => {
    if (this.props.storeRtn.entity.rtnNtcBillNumber) {
      this.getNtcBill(this.props.storeRtn.entity.rtnNtcBillNumber);
      return;
    }
    if (this.state.entityUuid) {
      this.props.dispatch({
        type: 'storeRtn/get',
        payload: this.state.entityUuid,
        callback: res => {
          if (res.success && res.data)
            this.setState({
              entity: res.data,
              entityUuid: res.data.uuid,
              title: storeRtnLocal.title + "：" + res.data.billNumber,
            }, () => {
              this.getNtcBill(res.data.rtnNtcBillNumber);
            });
        }
      });
    }
  }
  onChangeNtcBill = (value) => {
    const { entity } = this.state;
    let originalNtcBill = this.props.form.getFieldValue('rtnNtcBillNumber');
    if (!originalNtcBill || entity.items.length === 0) {
      this.getNtcBill(value);
      return;
    }
    if (originalNtcBill != value) {
      Modal.confirm({
        title: '修改通知单会导致明细改变，请确认修改？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          entity.items = [];
          this.setState({
            entity: { ...entity }
          });
          this.getNtcBill(value);
        },
        onCancel: () => {
          this.props.form.setFieldsValue({
            rtnNtcBillNumber: originalNtcBill
          });
        }
      });
    }
  }
  getNtcBill = (value) => {
    this.props.dispatch({
      type: 'storeRtnNtc/getByBillNumberAndDcUuid',
      payload: {
        billNumber: value,
        dcUuid: loginOrg().uuid
      },
      callback: (response) => {
        if (response.data && response.success) {
          this.setState({
            ntcBill: response.data
          })
          this.refreshItem(response.data);
        }
      }
    });
  }

  //刷新明细
  refreshItem = (ntcBill) => {

    if (ntcBill && ntcBill.billNumber) {
      let entity = this.state.entity;
      entity.rtnNtcBillNumber = ntcBill.billNumber;
      entity.store = ntcBill.store;
      entity.wrh = ntcBill.wrh;
      entity.owner = ntcBill.owner;


      let items = [];
      let i = 1;
      let groupFilters = [];
      Array.isArray(ntcBill.items)
      && ntcBill.items.forEach(function (item) {
        if (item.realQty < item.qty ) {
          let rtnItem = {
            line: i,
            article: item.article,
            vendor: item.vendor,
            qpcStr: item.qpcStr,
            stockBatch: item.stockBatch,
            price: item.price,
            qty: Subtr(item.qty, item.realQty),
            qtyStr: toQtyStr(Subtr(item.qty, item.realQty), item.qpcStr)
          }

          items.push(rtnItem);
          i++;
          }

      });
      entity.items = items;
      let articleUuids = [];
      entity.items.forEach(function (e) {
        if (articleUuids.indexOf(e.article.articleUuid) == -1) {
          articleUuids.push(e.article.articleUuid);
        }
      });
      this.queryArticles(articleUuids);
      this.setState({
        entity: { ...entity },
        ntcBill: ntcBill,
      })
    }
  }
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;
    let cols = [
      <CFormItem label={storeRtnLocal.rtnNtcBillNumber}
                 key='rtnNtcBillNumber'>
        {getFieldDecorator('rtnNtcBillNumber', {
          initialValue: entity.rtnNtcBillNumber,
          rules: [
            {
              required: true,
              message: notNullLocale(storeRtnLocal.rtnNtcBillNumber)
            }
          ],
        })(<StoreRtnNtcBillSelect
          onChange={this.onChangeNtcBill} />)}
      </CFormItem>,
      <CFormItem label={commonLocale.inWrhLocale} key='wrh'>
        {getFieldDecorator('wrh')
        (<Col>{this.state.entity.wrh ?
          convertCodeName(this.state.entity.wrh) : <Empty />} </Col>)}
      </CFormItem>,
      <CFormItem label={commonLocale.inOwnerLocale} key='owner'>
        {getFieldDecorator('owner')
        (<Col>{this.state.entity.owner ?
          convertCodeName(this.state.entity.owner) : <Empty />}</Col>)}
      </CFormItem>,
      <CFormItem label={commonLocale.inStoreLocale} key='store'>
        {getFieldDecorator('store')
        (<Col>{this.state.entity.store ?
          convertCodeName(this.state.entity.store) : <Empty />}</Col>)}
      </CFormItem>,
      <CFormItem label={storeRtnLocal.rtner} key='rtner'>
        {getFieldDecorator('rtner', {
          initialValue: JSON.stringify(entity.rtner ? entity.rtner : rtner),
          rules: [
            {
              required: true,
              message: notNullLocale(storeRtnLocal.rtner)
            }
          ],
        })(<UserSelect autoFocus single={true} />)}
      </CFormItem>,
      <CFormItem label={'单据类型'} key='returnType'>
        {getFieldDecorator('returnType', {
          initialValue: entity.returnType? entity.returnType: ReturnType.RETURNSTORE.name
        })(<Select value={entity.returnType? entity.returnType: ReturnType.RETURNSTORE.name}>
          {returnTypeOptions}
        </Select>)}
      </CFormItem>
    ];
    return [<FormPanel key='basicInfo'
                       title={commonLocale.basicInfoLocale}
                       cols={cols} />
    ];
  }
  getArticles = (line) => {
    const { ntcBill, entity } = this.state;
    let articles = [];
    let articleUuids = [];
    ntcBill.items && ntcBill.items.forEach(function (e) {
      if (e.realQty < e.qty) {
        if (articleUuids.indexOf(e.article.articleUuid) === -1) {
          articles.push({
            uuid: e.article.articleUuid,
            code: e.article.articleCode,
            name: e.article.articleName,
            spec: e.article.articleSpec
          });
          articleUuids.push(e.article.articleUuid);
        }
      }
    });
    if (articles.length === 1) {
      entity.items[line - 1].article = {
        articleUuid: articles[0].uuid,
        articleCode: articles[0].code,
        articleName: articles[0].name,
        articleSpec: articles[0].spec,
        munit: entity.items[line - 1].article && entity.items[line - 1].article.munit
          ? entity.items[line - 1].article.munit : articles[0].munit
      };
    }
    return articles;
  }
  getArticleOptions = () => {
    let articleOptions = [];
    this.getArticles().forEach(function (e) {
      articleOptions.push(
        <Select.Option key={JSON.stringify(e)} value={JSON.stringify(e)}>
          {'[' + e.code + ']' + e.name}</Select.Option>
      );
    });
    return articleOptions;
  }
  getQpcStrs = (line) => {
    const { ntcBill, entity, articles, billConfig } = this.state;
    let qpcStrs = [];
    if (!entity.items[line - 1].article) {
      return qpcStrs;
    }
    if (qpcStrFrom.FROMARTICLE.name === billConfig.qpcStrFrom) {
      if (!articles || !articles[entity.items[line - 1].article.articleUuid])
        return qpcStrs;
      let article = articles[entity.items[line - 1].article.articleUuid];
      if (!article.qpcs)
        return qpcStrs;
      let qpcInfo = article.qpcs.find(function (qpc) {
        return qpc.defaultQpcStr == true;
      });
      if (!qpcInfo) {
        qpcInfo = article.qpcs[0];
      }
      qpcStrs.push(JSON.stringify({
        qpcStr: qpcInfo.qpcStr,
        munit: qpcInfo.munit
      }));
    } else {
      ntcBill.items && ntcBill.items.forEach(function (e) {
        if (e.realQty < e.qty) {
          if (e.article
            && e.article.articleUuid === entity.items[line - 1].article.articleUuid) {
            if (e.qpcStr && qpcStrs.indexOf(JSON.stringify({
              qpcStr: e.qpcStr,
              munit: e.article.munit
            })) === -1)
              qpcStrs.push(JSON.stringify({
                qpcStr: e.qpcStr,
                munit: e.article.munit
              }));
          }
        }
      });
    }
    if (qpcStrs.length === 1) {
      entity.items[line - 1].qpcStr = JSON.parse(qpcStrs[0]).qpcStr;
      entity.items[line - 1].article.munit = JSON.parse(qpcStrs[0]).munit;
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
  getVendors = (line) => {
    const { ntcBill, entity, billConfig } = this.state;
    let vendors = [];
    if (!entity.items[line - 1].article
      || !entity.items[line - 1].qpcStr) {
      return vendors;
    }
    let vendorUuids = [];
    ntcBill.items && ntcBill.items.forEach(function (e) {
      if (e.realQty < e.qty) {
        if (e.article.articleUuid === entity.items[line - 1].article.articleUuid &&
          e.vendor && vendorUuids.indexOf(e.vendor.uuid) === -1) {
          if (billConfig.qpcStrFrom === qpcStrFrom.FROMARTICLE.name) {
            vendors.push(e.vendor);
            vendorUuids.push(e.vendor.uuid)
          }
          if (e.qpcStr === entity.items[line - 1].qpcStr && billConfig.qpcStrFrom === qpcStrFrom.FROMBILL.name) {
            vendors.push(e.vendor);
            vendorUuids.push(e.vendor.uuid)
          }
        }
      }
    });
    if (vendors.length === 1) {
      entity.items[line - 1].vendor = {
        uuid: vendors[0].uuid,
        code: vendors[0].code,
        name: vendors[0].name,
      };
    }
    return vendors;
  }
  getVendorOptions = (line) => {
    let vendorOptions = [];
    this.getVendors(line).forEach(function (e) {
      vendorOptions.push(
        <Select.Option key={JSON.stringify(e)} value={JSON.stringify(e)}>
          {convertCodeName(e)}</Select.Option>
      );
    });
    return vendorOptions;
  }
  getPrice = (line) => {
    const { ntcBill, entity, billConfig } = this.state;
    const record = entity.items[line - 1];
    let price = 0;
    if (!record.article || !record.qpcStr || !record.vendor) {
      price = 0;
    } else {
      ntcBill.items.forEach(function (e) {
        if (e.article.articleUuid === record.article.articleUuid
          && e.vendor.uuid === record.vendor.uuid) {
          if (billConfig.qpcStrFrom === qpcStrFrom.FROMARTICLE.name) {
            price = e.price;
          }
          if (e.qpcStr === record.qpcStr && billConfig.qpcStrFrom === qpcStrFrom.FROMBILL.name) {
            price = e.price;
          }
        }
      });
    }
    return price;
  }
  getCanRtnQty = (line) => {
    const { ntcBill, entity, billConfig } = this.state;
    const record = entity.items[line - 1];
    let canRtnQty = 0;
    if (!record.article || !record.qpcStr || !record.vendor) {
      canRtnQty = 0;
    } else {
      ntcBill.items.forEach(function (e) {
        if (e.article.articleUuid === record.article.articleUuid
          && e.vendor.uuid === record.vendor.uuid)
          if (billConfig.qpcStrFrom === qpcStrFrom.FROMARTICLE.name) {
            canRtnQty = accAdd(canRtnQty, Subtr(e.qty, e.realQty));
          }
        if (e.qpcStr === record.qpcStr && billConfig.qpcStrFrom === qpcStrFrom.FROMBILL.name) {
          canRtnQty = Subtr(e.qty, e.realQty);
        }
      });
    }
    return canRtnQty;
  }
  getShelfLife = (record) => {
    if (!record.article) {
      return undefined;
    }
    const { articles } = this.state;
    const article = articles[record.article.articleUuid];
    if (!article) {
      return undefined;
    }
    return {
      shelfLifeType: article.shelfLifeType,
      shelfLifeDays: article.shelfLifeDays
    };
  }
  getProductionBatch = (record)=>{
    if (!record.article) {
      return undefined;
    }
    const { articles } = this.state;
    const article = articles[record.article.articleUuid];
    if (!article) {
      return undefined;
    }
    return {
      type: article.shelfLifeType,
      manageBatch: article.manageBatch
    };
  }
  handleFieldChange(e, fieldName, line) {
    const { entity } = this.state;
    const target = entity.items[line - 1];
    if (fieldName === 'article') {
      let article = JSON.parse(e);
      if (target.article && target.article.uuid !== article.uuid) {
        target.type = undefined;
        target.targetBinCode = undefined;
        target.targetBinUsage = undefined;
        target.containerBarcode = undefined;
        target.productDate = undefined;
        target.validDate = undefined;
        target.note = undefined;
        target.productionBatch = undefined;
        target.stockBatch = undefined;
        target.price = undefined;
        target.vendor = undefined;
        target.qtyStr = '0';
        target.qty = undefined;
      }
      target.article = {
        articleUuid: article.uuid,
        articleCode: article.code,
        articleName: article.name,
        articleSpec: article.spec
      };
      const qpcStrs = this.getQpcStrs(line);
      if (qpcStrs.length > 0) {
        target.qpcStr = JSON.parse(qpcStrs[0]).qpcStr;
        target.article.munit = JSON.parse(qpcStrs[0]).munit;
      }
      const vendors = this.getVendors(line);
      if (vendors.length > 0) {
        target.vendor = vendors[0];
      }
      let price = this.getPrice(line);
      target.price = price;
      let getCanRtnQty = this.getCanRtnQty(line);
      target.qty = getCanRtnQty;
      target.qtyStr = toQtyStr(getCanRtnQty, target.qpcStr);
    } else if (fieldName === 'qpcStr') {
      const qpcStrMunit = JSON.parse(e);
      target.qpcStr = qpcStrMunit.qpcStr;
      target.article.munit = qpcStrMunit.munit;
      const vendors = this.getVendors(line);
      if (vendors.length > 0) {
        target.vendor = vendors[0];
      }
      let price = this.getPrice(line);
      target.price = price;
      let getCanRtnQty = this.getCanRtnQty(line);
      target.qty = getCanRtnQty;
      target.qtyStr = toQtyStr(getCanRtnQty, target.qpcStr);
    } else if (fieldName === 'vendor') {
      target.vendor = JSON.parse(e);
      let price = this.getPrice(line);
      target.price = price;
      let getCanRtnQty = this.getCanRtnQty(line);
      target.qty = getCanRtnQty;
      target.qtyStr = toQtyStr(getCanRtnQty, target.qpcStr);
    } else if (fieldName === 'productDate') {
      if (e.startOf('day') > moment(new Date()).startOf('day')) {
        message.error('生产日期不能晚于当前日期')
        return;
      }
      const shelfLife = this.getShelfLife(target);
      target.productDate = e.startOf('day');
      target.validDate = moment(e).add(shelfLife.shelfLifeDays, 'days');
      target.productionBatch = moment(target.productDate).format('YYYYMMDD');
    } else if (fieldName === 'validDate') {
      if (e.startOf('day') < moment(new Date()).startOf('day')) {
        message.error('到效期不能早于当前日期')
        return;
      }
      const shelfLife = this.getShelfLife(target);
      target.validDate = e.startOf('day');
      target.productDate = moment(e).add(-shelfLife.shelfLifeDays, 'days');
      target.productionBatch = moment(target.productDate).format('YYYYMMDD');
    } else if (fieldName === 'qtyStr') {
      target.qtyStr = e;
      target.qty = qtyStrToQty(e.toString(), target.qpcStr);
    } else if (fieldName === 'containerBarcode') {
      target.containerBarcode = e;
    } else if (fieldName === 'type') {
      if (Type.DECINV.name === e) {
        target.productDate = undefined;
        target.validDate = undefined;
        target.productionBatch = undefined;
        target.stockBatch = undefined;
        target.targetBinCode = undefined;
        target.targetBinUsage = undefined;
      }
      if (Type.RTNWRH.name !== e && target.type === Type.RTNWRH.name) {
        target.productDate = undefined;
        target.validDate = undefined;
        target.productionBatch = undefined;
        target.stockBatch = undefined;
      }
      if (Type.RTNVENDOR.name === e) {
        target.productDate = moment('8888-12-31', 'YYYY-MM-DD');
        target.validDate = moment('8888-12-31', 'YYYY-MM-DD');
        target.productionBatch = moment(target.productDate).format('YYYYMMDD');
        if( target.vendor && target.vendor.uuid ) {
          let uuid = target.vendor.uuid;
          this.props.dispatch({
            type: 'storeRtn/queryBinAndContainer',
            payload: {
              vendorUuid: uuid,
              dcUuid: loginOrg().uuid
            },
            callback: (response) => {
              if (response && response.success && response.data) {
                target.targetBinCode = response.data.targetBinCode;
                target.targetBinUsage = response.data.targetBinUsage;
                target.containerBarcode = response.data.containerBarcode;
              } else {
                target.targetBinCode = undefined;
                target.targetBinUsage = undefined;
                target.containerBarcode = undefined;
              }
            }
          });
        }
      }
      if (Type.RTNWRH.name === e) {
        target.productionBatch = moment(target.productDate).format('YYYYMMDD');
        if( target.article && (target.article.uuid || target.article.articleUuid) ) {
          let uuid = target.article.uuid || target.article.articleUuid;
          this.props.dispatch({
            type: 'storeRtn/queryBinAndContainerRntWrh',
            payload: {
              articleUuid: uuid,
              dcUuid: loginOrg().uuid
            },
            callback: (response) => {
              if (response && response.success && response.data) {
                target.targetBinCode = response.data.targetBinCode;
                target.targetBinUsage = response.data.targetBinUsage;
                target.containerBarcode = response.data.containerBarcode;
              } else {
                target.targetBinCode = undefined;
                target.targetBinUsage = undefined;
                target.containerBarcode = undefined;
              }
            }
          });
        }
      }
      target.type = e;
      // target.targetBinCode = undefined;
      // target.targetBinUsage = undefined;
    } else if (fieldName === 'productionBatch') {
      target.productionBatch = e.target.value;
    } else if (fieldName === 'targetBinCode') {
      const binCodeUsage = JSON.parse(e);
      target.targetBinCode = binCodeUsage.code;
      target.targetBinUsage = binCodeUsage.usage;
      this.props.dispatch({
        type: 'storeRtn/queryMaxContainerByBinCode',
        payload: {
          binCode: binCodeUsage.code,
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        },
        callback: (response) => {
          if (response && response.success && response.data) {
            target.containerBarcode = response.data.containerBarcode;
          } else {
            target.containerBarcode = undefined;
          }
        }
      });
    }
    this.setState({
      entity: { ...entity },
    })
  }
  drawTable = () => {
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
            <Select
              value={record.article ? '[' + record.article.articleCode + ']' + record.article.articleName : undefined}
              placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
              onChange={e => this.handleFieldChange(e, 'article', record.line)}>
              {this.getArticleOptions(record.line)}
            </Select>
          );
        }
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        dataIndex: 'qpcStr',
        key: 'qpcStr',
        width: itemColWidth.qpcStrEditColWidth,
        render: (text, record) => {
          let qpcStrs = this.getQpcStrs(record.line);
          if (qpcStrs.length === 1) {
            let qpcStrMunit = JSON.parse(qpcStrs[0]);
            return qpcStrMunit.qpcStr + '/' + qpcStrMunit.munit;
          }
          return (
            <Select value={record.qpcStr ? JSON.stringify({
              qpcStr: record.qpcStr,
              munit: record.article.munit
            }) : undefined}
                    placeholder={placeholderChooseLocale(commonLocale.qpcStrLocale)}
                    onChange={e => this.handleFieldChange(e, 'qpcStr', record.line)}>
              {this.getQpcStrOptions(record.line)}
            </Select>
          );
        },
      },
      {
        title: storeRtnLocal.type,
        dataIndex: 'type',
        key: 'type',
        width: itemColWidth.articleEditColWidth,
        render: (text, record) => {
          return (
            <Select className={style.editWrapper}
                    value={record.type}
                    title={placeholderChooseLocale(storeRtnLocal.type)}
                    placeholder={placeholderChooseLocale(storeRtnLocal.type)}
                    onChange={e => this.handleFieldChange(e, 'type', record.line)}>
              {typeOptions}
            </Select>
          );
        }
      }, {
        title: commonLocale.inVendorLocale,
        dataIndex: 'vendor',
        key: 'vendor',
        width: itemColWidth.articleEditColWidth,
        render: (text, record) => {
          if (this.getVendors(record.line).length === 1) {
            return <div title={convertCodeName(this.getVendors(record.line)[0])}
                        className={style.editWrapper} style={{ width: 150 }}>
              {convertCodeName(this.getVendors(record.line)[0])}
            </div>;
          }
          return (
            <Select className={style.editWrapper}
                    value={record.vendor ? convertCodeName(record.vendor) : undefined}
                    placeholder={placeholderChooseLocale(commonLocale.inVendorLocale)}
                    onChange={e => this.handleFieldChange(e, 'vendor', record.line)}>
              {this.getVendorOptions(record.line)}
            </Select>
          );
        }
      },
      {
        title: storeRtnLocal.targetBin,
        dataIndex: 'targetBinCode',
        key: 'targetBinCode',
        width: itemColWidth.binCodeEditColWidth + 80,
        render: (text, record) => {
          if (Type.DECINV.name == record.type) {
            return record.targetBinCode ? record.targetBinCode : <Empty />;
          }
          if (Type.RTNWRH.name == record.type) {
            return <BinSelect
              usages={[binUsage.StorageBin.name, binUsage.PickUpBin.name, binUsage.PickUpStorageBin.name]}
              states={[binState.FREE.name, binState.USING.name]}
              getUsage
              wrhUuid={this.state.entity.wrh ? this.state.entity.wrh.uuid : undefined}
              value={record.targetBinCode ? JSON.stringify({
                code: record.targetBinCode,
                usage: record.targetBinUsage
              }) : undefined}
              placeholder={placeholderChooseLocale(commonLocale.bincodeLocale)}
              onChange={e => this.handleFieldChange(e, 'targetBinCode', record.line)}
            />
          }
          return <BinSelect
            usage={binUsage.VendorRtnBin.name}
            getUsage
            states={[binState.FREE.name, binState.USING.name]}
            wrhUuid={this.state.entity.wrh ? this.state.entity.wrh.uuid : undefined}
            value={record.targetBinCode ? JSON.stringify({
              code: record.targetBinCode,
              usage: record.targetBinUsage
            }) : undefined}
            placeholder={placeholderChooseLocale(commonLocale.bincodeLocale)}
            onChange={e => this.handleFieldChange(e, 'targetBinCode', record.line)}
          />
        },
      },
      {
        title: commonLocale.inContainerBarcodeLocale,
        dataIndex: 'containerBarcode',
        key: 'containerBarcode',
        width: itemColWidth.containerEditColWidth,
        render: (text, record) => {
          if (Type.DECINV.name == record.type) {
            record.containerBarcode = '-';
            return record.containerBarcode;
          }
          if (record.targetBinUsage == binUsage.PickUpBin.name || record.targetBinUsage == binUsage.PickUpStorageBin.name) {
            record.containerBarcode = '-';
            return record.containerBarcode;
          }
          if (record.containerBarcode == '-') {
            record.containerBarcode = undefined;
          }
          return <ContainerSelect
            state={containerState.IDLE.name}
            value={record.containerBarcode}
            onChange={e => this.handleFieldChange(e, 'containerBarcode', record.line)}
            placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)}
          />
        },
      },
      {
        title: commonLocale.inProductDateLocale,
        dataIndex: 'productDate',
        key: 'productDate',
        width: itemColWidth.dateEditColWidth,
        render: (value, record) => {
          const shelfLife = this.getShelfLife(record);
          if (!shelfLife || record.type === Type.RTNVENDOR.name)
            return <span>{record.productDate ?
              moment(record.productDate).format('YYYY-MM-DD') : <Empty />}</span>
          if (shelfLife.shelfLifeType === 'NOCARE') {
            record.productDate = moment('8888-12-31', 'YYYY-MM-DD');
            record.validDate = moment('8888-12-31', 'YYYY-MM-DD');
            if(!record.productionBatch){
              record.productionBatch = moment(record.productDate).format('YYYYMMDD');
            }
            return '8888-12-31';
          } else if (shelfLife.shelfLifeType === 'VALIDDATE') {
            return record.productDate ? moment(record.productDate).format('YYYY-MM-DD') : '-';
          } else {
            return (
              <DatePicker
                value={record.productDate && moment(record.productDate).format('YYYY-MM-DD') !== '8888-12-31'
                  ? moment(record.productDate, 'YYYY-MM-DD') : undefined}
                allowClear={false}
                placeholder={placeholderLocale(commonLocale.productionDateLocale)}
                onChange={(data) => this.handleFieldChange(data, 'productDate', record.line)} />
            );
          }
        },
      },
      {
        title: commonLocale.inValidDateLocale,
        dataIndex: 'validDate',
        key: 'validDate',
        width: itemColWidth.dateEditColWidth,
        render: (value, record) => {
          const shelfLife = this.getShelfLife(record);
          if (!shelfLife || record.type === Type.RTNVENDOR.name)
            return <span>{record.validDate ?
              moment(record.validDate).format('YYYY-MM-DD') : <Empty />}</span>
          if (shelfLife.shelfLifeType === 'NOCARE') {
            record.productDate = moment('8888-12-31', 'YYYY-MM-DD');
            record.validDate = moment('8888-12-31', 'YYYY-MM-DD');
            if(!record.productionBatch){
              record.productionBatch = moment(record.productDate).format('YYYYMMDD');
            }
            return '8888-12-31';
          } else if (shelfLife.shelfLifeType === 'VALIDDATE') {
            return <DatePicker
              value={record.validDate ? moment(record.validDate) : undefined}
              allowClear={false}
              placeholder={placeholderLocale(commonLocale.validDateLocale)}
              onChange={(data) => this.handleFieldChange(data, 'validDate', record.line)} />;
          } else {
            return (
              <span>{record.validDate ?
                moment(record.validDate).format('YYYY-MM-DD')
                : <Empty />}</span>
            );
          }
        }
      },
      {
        title:commonLocale.productionBatchLocale,
        dataIndex:'productionBatch',
        key: 'productionBatch',
        width: itemColWidth.numberEditColWidth+50,
        render: (text, record) => {
          const value = this.getProductionBatch(record);
          if(value&&value.manageBatch==true&&value.type!='NOCARE'){
            return <Input value={record.productionBatch ? record.productionBatch : undefined}
                          onChange={e => this.handleFieldChange(e, 'productionBatch', record.line)}
                          placeholder={placeholderLocale(commonLocale.productionBatchLocale)}
            />
          }else{
            return <span>{record.productionBatch}</span>
          }
        }
      },
      {
        title: commonLocale.inQtyStrLocale,
        dataIndex: 'qtyStr',
        key: 'qtyStr',
        width: itemColWidth.qtyStrEditColWidth,
        render: (text, record) => {
          return (
            <QtyStrInput
              value={record.qtyStr ? record.qtyStr : 0}
              onChange={e => this.handleFieldChange(e, 'qtyStr', record.line)}
              placeholder={placeholderLocale(commonLocale.inQtyStrLocale)}
            />
          );
        }
      },
      {
        title: commonLocale.inQtyLocale,
        key: 'qty',
        width: itemColWidth.qtyStrEditColWidth-50,
        render: (record) => {
          return <span>{record.qty ? record.qty : 0}</span>
        }
      },
      {
        title: commonLocale.inPriceLocale,
        dataIndex: 'price',
        key: 'price',
        width: itemColWidth.priceColWidth,
        render: (text, record) => {
          return <span>{this.getPrice(record.line)}</span>
        }
      },
    ];
    return (
      <ItemEditTable
        title={commonLocale.inArticleLocale}
        columns={columns}
        data={this.state.entity.items}
        handleFieldChange={this.handleFieldChange}
        drawTotalInfo={this.drawTotalInfo}
        drawBatchButton={this.drawBatchButton}
        scroll={{ x: 2400 }} />
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
        {commonLocale.inAllAmountLocale}：{this.fomatFloat(allAmount, 4)}
            </span>
    );
  }
  fomatFloat = (src, pos) => {
    return Math.round(src * Math.pow(10, pos)) / Math.pow(10, pos);
  }
  changeContainerVisible = (selectedRowKeys) => {
    if (!selectedRowKeys || selectedRowKeys.length <= 0) {
      message.warn('请先选择要修改的行！');
      return;
    }
    this.setState({
      containerModalVisible: !this.state.containerModalVisible,
      selectedRowKeys: selectedRowKeys
    })
  }
  handleContainerModalVisible = (selectedRowKeys) => {
    this.setState({
      containerModalVisible: false,
      selectedRowKeys: selectedRowKeys
    })
  }
  handleRefreshContainer = (value) => {
    const { entity } = this.state;
    const lines = this.state.selectedRowKeys;
    Array.isArray(lines) && lines.forEach(function (line) {
      entity.items[line - 1].containerBarcode = value.containerBarcode;
    })
    this.setState({
      entity: { ...entity },
      containerModalVisible: false,
      selectedRowKeys: []
    })
  }
  changeTypeVisible = (selectedRowKeys) => {
    if (!selectedRowKeys || selectedRowKeys.length <= 0) {
      message.warn('请先选择要修改的行！');
      return;
    }
    this.setState({
      typeModalVisible: !this.state.typeModalVisible,
      selectedRowKeys: selectedRowKeys
    })
  }
  handleTypeModalVisible = (selectedRowKeys) => {
    this.setState({
      typeModalVisible: false,
      selectedRowKeys: selectedRowKeys
    })
  }
  handleRefreshType = (value) => {
    const { entity } = this.state;
    const { dispatch } = this.props;
    const lines = this.state.selectedRowKeys;
    const that = this;
    Array.isArray(lines) && lines.forEach(function (line) {
      let type = entity.items[line - 1].type;
      entity.items[line - 1].type = value.type;
      if (Type.RTNVENDOR.name === value.type) {
        entity.items[line - 1].productDate = moment('8888-12-31', 'YYYY-MM-DD');
        entity.items[line - 1].validDate = moment('8888-12-31', 'YYYY-MM-DD');
        entity.items[line - 1].productionBatch = '88881231';
        if( entity.items[line - 1].vendor && entity.items[line - 1].vendor.uuid ) {
          let uuid = entity.items[line - 1].vendor.uuid;
          dispatch({
            type: 'storeRtn/queryBinAndContainer',
            payload: {
              vendorUuid: uuid,
              dcUuid: loginOrg().uuid
            },
            callback: (response) => {
              if (response && response.success && response.data) {
                entity.items[line - 1].targetBinCode = response.data.targetBinCode;
                entity.items[line - 1].targetBinUsage = response.data.targetBinUsage;
                entity.items[line - 1].containerBarcode = response.data.containerBarcode;
              } else {
                entity.items[line-1].targetBinCode = undefined;
                entity.items[line-1].targetBinUsage = undefined;
                entity.items[line-1].containerBarcode = undefined;
              }
              that.setState({
                entity:{...entity}
              })
            }
          });
        }
      }
      if (Type.RTNWRH.name === value.type) {
        if( entity.items[line - 1].article && entity.items[line - 1].article.uuid ||  entity.items[line - 1].article && entity.items[line - 1].article.articleUuid) {
          let uuid = entity.items[line - 1].article.uuid || entity.items[line - 1].article.articleUuid;
          dispatch({
            type: 'storeRtn/queryBinAndContainerRntWrh',
            payload: {
              articleUuid: uuid,
              dcUuid: loginOrg().uuid
            },
            callback: (response) => {
              if (response && response.success && response.data) {
                entity.items[line - 1].targetBinCode = response.data.targetBinCode;
                entity.items[line - 1].targetBinUsage = response.data.targetBinUsage;
                entity.items[line - 1].containerBarcode = response.data.containerBarcode;
              } else {
                entity.items[line-1].targetBinCode = undefined;
                entity.items[line-1].targetBinUsage = undefined;
                entity.items[line-1].containerBarcode = undefined;
              }
              that.setState({
                entity:{...entity}
              })
            }
          });
        }
      }
      if (Type.DECINV.name === value.type) {
        entity.items[line-1].targetBinCode = undefined;
        entity.items[line-1].targetBinUsage = undefined;
        entity.items[line-1].containerBarcode = undefined;
      }
      if (type && Type.RTNVENDOR.name === type && Type.RTNVENDOR.name !== value.type) {
        entity.items[line - 1].productDate = undefined;
        entity.items[line - 1].validDate = undefined;
        entity.items[line - 1].productionBatch = undefined;
      }
      // entity.items[line - 1].targetBinCode = undefined;
      // entity.items[line - 1].targetBinUsage = undefined;
    })
    this.setState({
      entity: { ...entity },
      typeModalVisible: false,
      selectedRowKeys: []
    })
  }
  drawBatchButton = (selectedRowKeys) => {
    return [
      <a onClick={() => this.changeContainerVisible(selectedRowKeys)}>
        {storeRtnLocal.batchRefreshContainer}</a>,
      <Divider type="vertical" />,
      <a onClick={() => this.changeTypeVisible(selectedRowKeys)}>
        {storeRtnLocal.batchRefreshType}</a>,
      <Divider type="vertical" />,
      <a onClick={() => this.changeBinVisible(selectedRowKeys)}>批量设置目标货位</a>,
      <RtnContainerModal
        ModalTitle={'批量修改容器条码'}
        containerModalVisible={this.state.containerModalVisible}
        handleContainerModalVisible={this.handleContainerModalVisible}
        handleRefreshContainer={this.handleRefreshContainer}
      />,
      <RtnTypeModal
        ModalTitle={'批量修改退仓类型'}
        typeModalVisible={this.state.typeModalVisible}
        handleTypeModalVisible={this.handleTypeModalVisible}
        handleRefreshType={this.handleRefreshType}
      />,
      <TargetBinModal
        ModalTitle={'批量设置目标货位'}
        handleRefreshBin={this.handleRefreshBin}
        handleBinModalVisible={this.handleBinModalVisible}
        visible={this.state.pickUpBinModalVisible}
      />
    ];
  }
  changeBinVisible = (selectedRowKeys) => {
    const { entity } = this.state;
    if (!selectedRowKeys || selectedRowKeys.length <= 0) {
      message.warn('请先选择要修改的行！');
      return;
    }
    let articleUuids = [];
    for (let i of selectedRowKeys) {
      let item = entity.items[i - 1];
      if (item.article && (item.type === Type.RTNVENDOR.name || item.type === Type.RTNWRH.name)) {
        articleUuids.push(item.article.articleUuid)
      }
    }
    if (articleUuids.length <= 0) {
      message.warn('勾选的明细必须退仓类型必须是好退或返厂类型');
      return;
    }
    this.setState({
      pickUpBinModalVisible: !this.state.pickUpBinModalVisible,
      selectedRowKeys: selectedRowKeys
    })
  }
  handleBinModalVisible = (selectedRowKeys) => {
    this.setState({
      pickUpBinModalVisible: false,
      selectedRowKeys: selectedRowKeys
    })
  }
  handleRefreshBin = (value) => {
    const { entity } = this.state;
    const lines = this.state.selectedRowKeys;
    Array.isArray(lines) && lines.forEach(function (line) {
      let bin = JSON.parse(value.bin);
      if (binUsage.VendorRtnBin.name === bin.usage &&
        entity.items[line - 1].type === Type.RTNVENDOR.name) {
        entity.items[line - 1].targetBinCode = bin.code;
        entity.items[line - 1].targetBinUsage = bin.usage;
      }
      if ((binUsage.PickUpBin.name === bin.usage || binUsage.PickUpStorageBin.name === bin.usage)
        && entity.items[line - 1].type === Type.RTNWRH.name) {
        entity.items[line - 1].targetBinCode = bin.code;
        entity.items[line - 1].targetBinUsage = bin.usage;
      }
    })
    this.setState({
      entity: { ...entity },
      pickUpBinModalVisible: false,
      selectedRowKeys: []
    })
  }
}
