import { connect } from 'dva';
import moment from 'moment';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { Modal, Form, Select, Input, InputNumber, message, DatePicker, Col, Tabs } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, getDefOwner } from '@/utils/LoginContext';
import { convertCodeName, formatDate } from '@/utils/utils';
import { qtyStrToQty, toQtyStr, add } from '@/utils/QpcStrUtil';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { binUsage, getUsageCaption } from '@/utils/BinUsage';
import { MAX_DECIMAL_VALUE } from '@/utils/constants';
import { isArray } from 'util';
import { containerState } from '@/utils/ContainerState'
import Empty from '@/pages/Component/Form/Empty';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import ArticleSelect from '@/pages/Component/Select/ArticleSelect';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import BinSelect from '@/pages/Component/Select/BinSelect';
import ContainerSelect from '@/pages/Component/Select/ContainerSelect';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import { processBillLocale, clearConfirm, itemNotZero, noteTooLong, itemNotLessZero, itemRepeat, realQtyTooBig } from './ProcessBillLocale';
import ProcessArticleSelect from './ProcessArticleSelect';
import ProcessEndArticleSelect from './ProcessEndArticleSelect';
import ProcessContainerSelect from './ProcessContainerSelect';
import ProcessSchemeSelect from './ProcessSchemeSelect';
import { ProcessBillState, Type, SourceBill } from './ProcessBillContants';
import PanelItemBatchAdd from '@/pages/Component/Form/PanelItemBatchAdd';
import SearchFormItemBatchAdd from './SearchFormItemBatchAdd';
const { TextArea } = Input;
@connect(({ process, processingScheme, article, loading }) => ({
  process, article, processingScheme,
  loading: loading.models.process,
}))
@Form.create()
export default class ProcessBillCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      title: commonLocale.createLocale + processBillLocale.title,
      entity: { // 加工单
        companyUuid: loginCompany().uuid,
        owner: getDefOwner(),
      },

      rawItems: [],
      endItems: [],
      stocks: [],
      line: 1,
      endArticles: [],
      ownerDisabled: false,
      pageFilter: {},
      batchAddVisible: false,//批量添加面板是否可见
      stockList: [],//批量添加搜索得到的数据源
      auditButton: true,
      scheme: {},
      auditPermission:'iwms.inner.processBill.audit'
    }
  }
  componentDidMount() {
    this.props.processingScheme.entity = {};
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    const { stocks, endArticles } = this.state;
    if (nextProps.entityUuid && !this.state.entity.uuid) {
      let raws = [];
      let rawLine = 1;
      let ends = [];
      let endLine = 1;
      const endArticleUuids = [];
      const that = this;

      nextProps.process.entity.items && nextProps.process.entity.items.forEach(function (e) {
        that.queryStocks(e.article.code, nextProps.process.entity.wrh, nextProps.process.entity.owner);
        if (endArticleUuids.indexOf(e.article.uuid) == -1) {
          endArticleUuids.push(e.article.uuid);
        }
        if (e.type === Type.RAW.name) {
          e.line = rawLine;
          raws.push(e);
          rawLine++;
        } else if (e.type === Type.ENDPRODUCT.name) {
          e.line = endLine;
          ends.push(e);
          endLine++;
        }
      });

      this.queryArticles(endArticleUuids);

      this.setState({
        entity: nextProps.process.entity,
        title: processBillLocale.title + '：' + nextProps.process.entity.billNumber,
        endItems: [...ends],
        rawItems: [...raws],
        ownerDisabled: nextProps.process.entity.processScheme ? true : false
      });
    }
    if (nextProps.process.stocks != this.props.process.stocks) {
      if (Array.isArray(nextProps.process.stocks) && nextProps.process.stocks.length > 0) {
        if (this.props.process.stocks != nextProps.process.stocks) {
          this.setState({
            stocks: nextProps.process.stocks
          });
        }
      }
    }

    if (nextProps.article.articles && nextProps.article.articles.length > 0) {
      nextProps.article.articles.forEach(function (e) {
        endArticles[e.uuid] = e;
      });

      this.setState({
        endArticles: endArticles
      });
    }

    if (nextProps.article.entity && nextProps.article.entity.uuid && !endArticles[nextProps.article.entity.uuid]) {
      endArticles[nextProps.article.entity.uuid] = nextProps.article.entity;
      this.setState({
        endArticles: endArticles
      });
    }
    if (nextProps.process.stockList != this.props.process.stockList) {
      this.setState({
        stockList: nextProps.process.stockList,
      })
    }
    this.setState({
      scheme: nextProps.processingScheme.entity
    })
    let nextScheme = nextProps.processingScheme.entity;
    if (nextScheme.uuid != this.props.processingScheme.entity.uuid) {
      for (let i = 0; i < nextScheme.endproductItems.length; i++) {
        this.queryEndArticle(nextScheme.endproductItems[i].article.uuid, nextScheme.endproductItems[i].line);
        this.state.endItems.push({
          line: nextScheme.endproductItems[i].line,
          article: nextScheme.endproductItems[i].article,
          spec: nextScheme.endproductItems[i].spec,
        });
      }
    }
  }

  /**
   * 刷新
   */
  refresh = () => {
    this.props.dispatch({
      type: 'process/get',
      payload: {
        uuid: this.props.process.entityUuid
      }
    });
  }

  /**
   * 查询库存
   */
  queryStocks = (articleCode, wrh, owner) => {
    const { entity, stocks } = this.state;
    if (!owner) {
      owner = entity.owner;
    }
    if (!wrh) {
      wrh = entity.wrh;
    }
    if (!wrh || !owner) {
      return;
    }
    let hasQueryed = false;
    stocks.forEach(function (e) {
      if (e.article.articleCode === articleCode) {
        hasQueryed = true;
      }
    });
    if (hasQueryed) {
      return;
    }
    this.props.dispatch({
      type: 'process/queryProcessArticles',
      payload: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        articleCodeName: articleCode,
        ownerUuid: owner.uuid,
        wrhUuid: wrh.uuid,
        schemeUuid: '',
        raw: false
      }
    });
  }

  /**
   * 查询成品的商品
   */
  queryEndArticle = (articleUuid, line) => {
    this.props.dispatch({
      type: 'article/get',
      payload: {
        uuid: articleUuid
      }
    });
  }

  /**
   * 根据成品商品uuidlist查询商品
   */
  queryArticles = (articleUuids) => {
    this.props.dispatch({
      type: 'article/queryByUuids',
      payload: articleUuids
    });
  }

  /**
  * 取消
  */
  onCancel = () => {
    this.props.dispatch({
      type: 'process/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  /**
   * 保存
   */
  onSave = (data) => {
    const newData = this.validData(data);
    if (!newData) {
      return;
    }
    let type = 'process/onSave';
    if (newData.uuid) {
      type = 'process/onModify';
    }
    newData['companyUuid'] = loginCompany().uuid;
    newData['dcUuid'] = loginOrg().uuid;

    this.props.dispatch({
      type: type,
      payload: newData,
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
        }
      }
    });
  }
  /**
   * 保存并新建
   */
  onSaveAndCreate = (data) => {
    const newData = this.validData(data);
    if (!newData) {
      return;
    }
    newData['companyUuid'] = loginCompany().uuid;
    newData['dcUuid'] = loginOrg().uuid;

    this.props.dispatch({
      type: 'process/onSaveAndCreate',
      payload: newData,
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.setState({
            entity: {
              rawItems: [],
              endItems: [],
              items: [],
            },
            stocks: []
          });
          this.props.form.resetFields();
        }
      }
    });
  }

  /**
   * 校验数据
   */
  validData = (data) => {
    const { entity, rawItems, endItems } = this.state;

    const newData = { ...entity };
    newData.note = data.note;
    rawItems.forEach(raw => {
      raw.type = Type.RAW.name
    });
    endItems.forEach(end => {
      end.type = Type.ENDPRODUCT.name
      if (end.productDate) {
        end.productDate = formatDate(end.productDate, true);
      }
      if (end.validDate) {
        end.validDate = formatDate(end.validDate, true);
      }
    });

    newData.rawItems = [...rawItems];
    newData.endItems = [...endItems];

    // 校验原料
    for (let i = 0; i < rawItems.length; i++) {
      if (!rawItems[i].article) {
        rawItems.splice(i, 1);
        if (rawItems[i] && rawItems[i].line) {
          rawItems[i].line = i + 1;
        }
        i = i - 1;
      }
    }

    newData.rawItems = [...rawItems];
    newData.endItems = [...endItems];

    if (rawItems.length === 0) {
      message.error(notNullLocale(processBillLocale.rawInfoList));
      return false;
    }

    for (let i = rawItems.length - 1; i >= 0; i--) {
      if (!rawItems[i].article) {
        message.error(notNullLocale(commonLocale.articleLocale))
        return false;
      }
      if (rawItems[i].article && rawItems[i].qty <= 0) {
        message.error(itemNotZero(rawItems[i].line, commonLocale.inQtyLocale));
        return false;
      }
      if (rawItems[i].note && rawItems[i].note.length > 255) {
        message.error(noteTooLong(rawItems[i].line));
        return false;
      }
    }
    for (let i = 0; i < rawItems.length; i++) {
      for (let j = i + 1; j < rawItems.length; j++) {
        if (rawItems[i].article.uuid === rawItems[j].article.uuid &&
          rawItems[i].binCode === rawItems[j].binCode &&
          rawItems[i].containerBarcode === rawItems[j].containerBarcode &&
          rawItems[i].productionBatch === rawItems[j].productionBatch &&
          rawItems[i].qpcStr === rawItems[j].qpcStr &&
          rawItems[i].vendor.uuid === rawItems[j].vendor.uuid) {
          message.error(itemRepeat(rawItems[i].line, rawItems[j].line));
          return false;
        }
      }
    }

    //校验成品

    for (let i = 0; i < endItems.length; i++) {
      if (!endItems[i].article) {
        endItems.splice(i, 1);
        if (endItems[i] && endItems[i].line) {
          endItems[i].line = i + 1;
        }
        i = i - 1;
      }
    }
    newData.rawItems = [...rawItems];
    newData.endItems = [...endItems];

    if (endItems.length === 0) {
      message.error(notNullLocale(processBillLocale.endInfoList));
      return false;
    }

    for (let i = endItems.length - 1; i >= 0; i--) {
      if (!endItems[i].article) {
        message.error(notNullLocale(articleLocale.title))
        return false;
      }
      if (endItems[i].note && endItems[i].note.length > 255) {
        message.error(noteTooLong(endItems[i].line));
        return false;
      }

      if (!endItems[i].article) {
        message.error(`加工单成品明细第${endItems[i].line}行商品不能为空！`);
        return false;
      }
      if (endItems[i].article && !endItems[i].vendor) {
        message.error(`加工单成品明细第${endItems[i].line}行供应商不能为空！`);
        return false;
      }

      if (endItems[i].article && !endItems[i].productDate) {
        message.error(`加工单成品明细第${endItems[i].line}行生产日期不能为空！`);
        return false;
      } else {
        endItems[i].productDate = formatDate(endItems[i].productDate, true);
      }

      if (endItems[i].article && !endItems[i].validDate) {
        message.error(`加工单成品明细第${endItems[i].line}行到效期不能为空！`);
        return false;
      } else {
        endItems[i].validDate = formatDate(endItems[i].validDate, true);
      }

      if (endItems[i].article && endItems[i].price === null) {
        message.error(`加工单成品明细第${endItems[i].line}行单价不能为空！`);
        return false;
      }
      if (endItems[i].article && !endItems[i].binCode) {
        message.error(`加工单成品明细第${endItems[i].line}行货位代码不能为空！`);
        return false;
      }

      if (endItems[i].article && !endItems[i].containerBarcode) {
        message.error(`加工单成品明细第${endItems[i].line}行容器条码不能为空！`);
        return false;
      }

      if (endItems[i].article && endItems[i].qty === 0) {
        message.error(`加工成品单明细第${endItems[i].line}行数量不能为0！`);
        return false;
      }
    }

    for (let i = 0; i < endItems.length; i++) {
      for (let j = i + 1; j < endItems.length; j++) {
        if (endItems[i].article.uuid === endItems[j].article.uuid &&
          endItems[i].binCode === endItems[j].binCode &&
          endItems[i].containerBarcode === endItems[j].containerBarcode &&
          endItems[i].productionBatch === endItems[j].productionBatch &&
          endItems[i].qpcStr === endItems[j].qpcStr &&
          endItems[i].vendor.uuid === endItems[j].vendor.uuid) {
          message.error(itemRepeat(endItems[i].line, endItems[j].line));
          return false;
        }
      }
    }

    return newData;
  }

  // ---构建选择器-- 开始 原料---

  getQty = (item) => {
    const { stocks } = this.state;

    let qty = 0;
    stocks.forEach(function (e) {
      if (e.article.articleUuid === item.article.uuid && e.binCode === item.binCode
        && e.containerBarcode === item.containerBarcode && e.vendor.uuid === item.vendor.uuid && e.price === item.price
        && e.productionBatch === item.productionBatch && e.qpcStr === item.qpcStr && e.stockBatch === item.stockBatch) {
        qty = e.qty;
      }
    });
    return qty;
  }

  getBinCodes = (record) => {
    const { stocks } = this.state;

    let binCodeUsages = [];
    let binCodes = [];
    if (!record.article) {
      return binCodeUsages;
    }
    stocks.forEach(e => {
      if (e.article.articleUuid === record.article.uuid && binCodes.indexOf(e.binCode) < 0) {
        binCodes.push(e.binCode);
        binCodeUsages.push({
          binCode: e.binCode,
          binUsage: e.binUsage
        });
      }
    });
    return binCodeUsages;
  }

  getBinCodeOptions = (record) => {
    const binCodes = this.getBinCodes(record);
    const binCodeOptions = [];
    binCodes.forEach(e => {
      binCodeOptions.push(
        <Select.Option key={e.binCode} value={JSON.stringify(e)}>
          {e.binCode}
        </Select.Option>
      );
    });
    return binCodeOptions;
  }

  getContainerBarcodes = (record) => {
    const { stocks } = this.state;

    let containerBarcodes = [];
    if (!record.article) {
      return containerBarcodes;
    }
    stocks.forEach(e => {
      if (e.article.articleUuid === record.article.uuid && e.binCode === record.binCode && containerBarcodes.indexOf(e.containerBarcode) < 0) {
        containerBarcodes.push(e.containerBarcode);
      }
    });
    return containerBarcodes;
  }

  getContainerBarcodeOptions = (record) => {
    let containerBarcodeOptions = [];
    let containerBarcodes = this.getContainerBarcodes(record);
    containerBarcodes.forEach(e => {
      containerBarcodeOptions.push(
        <Select.Option key={e} value={e}>
          {e}
        </Select.Option>
      );
    });
    return containerBarcodeOptions;
  }

  getVendors = (record) => {
    const { stocks } = this.state;

    let vendors = [];
    if (!record.article) {
      return vendors;
    }
    let vendorUuids = [];
    stocks.forEach(e => {
      if (e.article.articleUuid === record.article.uuid && e.binCode === record.binCode
        && e.containerBarcode === record.containerBarcode && vendorUuids.indexOf(e.vendor.uuid) < 0) {
        vendorUuids.push(e.vendor.uuid);
        vendors.push(e.vendor);
      }
    });
    return vendors;
  }

  getVendorOptions = (record) => {
    let vendorOptions = [];
    let vendors = this.getVendors(record);
    vendors.forEach(e => {
      vendorOptions.push(
        <Select.Option key={e.uuid} value={JSON.stringify(e)}>
          {convertCodeName(e)}
        </Select.Option>
      );
    });
    return vendorOptions;
  }

  getProductionBatchs = (record) => {
    const { stocks } = this.state;

    let productionBatchs = [];
    if (!record.article) {
      return productionBatchs;
    }
    let ps = [];
    stocks.forEach(e => {
      if (e.article.articleUuid === record.article.uuid && e.binCode === record.binCode &&
        e.containerBarcode === record.containerBarcode &&
        e.vendor.uuid === record.vendor.uuid && ps.indexOf(e.productionBatch) < 0) {
        ps.push(e.productionBatch);
        productionBatchs.push({
          productionBatch: e.productionBatch,
          productDate: e.productionDate,
          validDate: e.validDate,
          weight: e.weight,
          volume: e.volume
        });
      }
    });
    return productionBatchs;
  }

  getProductionBatchOptions = (record) => {
    let productionBatchOptions = [];
    let productionBatchs = this.getProductionBatchs(record);
    productionBatchs.forEach(e => {
      productionBatchOptions.push(
        <Select.Option key={e.productionBatch} value={JSON.stringify(e)}>
          {e.productionBatch}
        </Select.Option>
      );
    });
    return productionBatchOptions;
  }

  getQpcStrs = (record) => {
    const { stocks } = this.state;

    let qpcStrs = [];
    let qpcMunits = [];
    if (!record.article) {
      return qpcMunits;
    }
    stocks.forEach(e => {
      if (e.article.articleUuid === record.article.uuid && e.binCode === record.binCode &&
        e.containerBarcode === record.containerBarcode && e.vendor.uuid === record.vendor.uuid
        && e.productionBatch === record.productionBatch && qpcStrs.indexOf(e.qpcStr) < 0) {
        qpcStrs.push(e.qpcStr);
        qpcMunits.push({
          qpcStr: e.qpcStr,
          munit: e.munit,
          price: e.price,
        });
      }
    });
    return qpcMunits;
  }

  getQpcStrOptions = (record) => {
    let qpcStrOptions = [];
    let qpcStrs = this.getQpcStrs(record);
    qpcStrs.forEach(e => {
      qpcStrOptions.push(
        <Select.Option key={e.qpcStr} value={JSON.stringify(e)}>
          {e.qpcStr + "/" + e.munit}
        </Select.Option>
      );
    });
    return qpcStrOptions;
  }

  getPrices = (record) => {
    const { stocks } = this.state;
    let prices = [];
    if (!record.article) {
      return prices;
    }
    let used = [];
    stocks.forEach(function (e) {
      if (e.article.articleUuid === record.article.uuid && e.binCode === record.binCode &&
        e.containerBarcode === record.containerBarcode && e.vendor.uuid === record.vendor.uuid
        && e.productionBatch === record.productionBatch && e.qpcStr === record.qpcStr && prices.indexOf(e.price) < 0) {
        used.push(e.price);
        prices.push(e.price);
      }
    });
    return prices;
  }
  getPriceOptions = (record) => {
    let priceOptions = [];
    this.getPrices(record).forEach(function (e) {
      priceOptions.push(<Select.Option key={e} value={e}>{e}</Select.Option>);
    });
    return priceOptions;
  }

  getSourceBills = (record) => {
    const { stocks } = this.state;
    let sourceBills = [];
    if (!record.article) {
      return sourceBills;
    }
    let used = [];
    if (stocks.length === 0 && record.sourceBill) {
      sourceBills.push(JSON.stringify(record.sourceBill));
    } else {

      stocks.forEach(function (e) {

        if (e.article.articleUuid === record.article.uuid && e.binCode === record.binCode &&
          e.containerBarcode === record.containerBarcode && e.vendor.uuid === record.vendor.uuid
          && e.productionBatch === record.productionBatch && e.qpcStr === record.qpcStr
          && e.price === record.price && used.indexOf(e.sourceBill.billUuid) < 0) {
          used.push(e.sourceBill.billUuid);
          sourceBills.push(JSON.stringify(e.sourceBill));
        }
      });
    }
    return sourceBills;
  }
  getSourceBillOptions = (record) => {
    let sourceBillOptions = [];
    this.getSourceBills(record).forEach(function (e) {
      sourceBillOptions.push(
        <Select.Option key={e} value={e}>
          {`[${JSON.parse(e).billNumber}]${SourceBill[JSON.parse(e).billType]}`}
        </Select.Option>
      );
    });
    return sourceBillOptions;
  }
  getStockBatchs = (record) => {
    const { stocks } = this.state;
    let stockBatchs = [];
    if (!record.article) {
      return stockBatchs;
    }
    let used = [];
    stocks.forEach(function (e) {
      if (e.article.articleUuid === record.article.uuid && e.binCode === record.binCode &&
        e.containerBarcode === record.containerBarcode && e.vendor.uuid === record.vendor.uuid
        && e.productionBatch === record.productionBatch && e.qpcStr === record.qpcStr
        && e.price === record.price && e.sourceBill.billUuid === record.sourceBill.billUuid &&
        used.indexOf(e.stockBatch) < 0) {
        used.push(e.stockBatch);
        stockBatchs.push(e.stockBatch);
      }
    });

    return stockBatchs;
  }
  getStockBatchOptions = (record) => {
    let stockBatchOptions = [];
    this.getStockBatchs(record).forEach(function (e) {
      stockBatchOptions.push(
        <Select.Option key={e} value={e}>{e}</Select.Option>
      );
    });
    return stockBatchOptions;
  }
  // ---构建选择器-- 结束 原料---

  // ---构建选择器-- 开始 成品---
  getEndQty = (item) => {
    const { endArticles } = this.state;
    let qty = 0;
    endArticles.forEach(function (e) {
      if (e.article.articleUuid === item.article.uuid && e.binCode === item.binCode
        && e.containerBarcode === item.containerBarcode && e.vendor.uuid === item.vendor.uuid && e.price === item.price
        && e.productionBatch === item.productionBatch && e.qpcStr === item.qpcStr && e.stockBatch === item.stockBatch) {
        qty = e.qty;
      }
    });
    return qty;
  }

  getEndVendors = (record) => {
    if (!record.article) {
      return [];
    }

    const { endArticles } = this.state;
    const article = endArticles[record.article.uuid];
    if (!article) {
      return [];
    }
    const vendors = [];
    if (!article.vendors) {
      return vendors;
    }

    article.vendors.map(item => {
      if (item.defaultReceive) {
        vendors.push(item.vendor);
      }
    })
    article.vendors.map(item => {
      if (!item.defaultReceive) {
        vendors.push(item.vendor);
      }
    })
    return vendors;
  }

  getEndVendorOptions = (record) => {
    const vendors = this.getEndVendors(record);
    const vendorOptions = [];
    vendors.forEach(e => {
      vendorOptions.push(
        <Select.Option key={e.uuid} value={JSON.stringify(e)}>{convertCodeName(e)}</Select.Option>
      );
    });
    return vendorOptions;
  }

  getEndQpcStrs = (record) => {
    if (!record.article) {
      return [];
    }

    const { endArticles } = this.state;
    const article = endArticles[record.article.uuid];
    if (!article) {
      return [];
    }

    const qpcStrs = [];
    if (!article.qpcs) {
      return qpcStrs;
    }
    let defaultQpcStr = article.qpcs.find(item => item.defaultQpcStr === true);
    if (defaultQpcStr) {
      qpcStrs.push({
        qpcStr: defaultQpcStr.qpcStr,
        munit: defaultQpcStr.munit
      });
    }
    article.qpcs.forEach(function (e) {
      if (!defaultQpcStr || (defaultQpcStr.uuid != e.uuid)) {
        qpcStrs.push({
          qpcStr: e.qpcStr,
          munit: e.munit
        });
      }
    });
    return qpcStrs;
  }

  getEndQpcStrOptions = (record) => {
    const qpcStrs = this.getEndQpcStrs(record);

    const qpcStrOptions = [];
    qpcStrs.forEach(e => {
      qpcStrOptions.push(
        <Select.Option key={e.qpcStr} value={JSON.stringify(e)}>{e.qpcStr + "/" + e.munit}</Select.Option>
      );
    });
    return qpcStrOptions;
  }
  getEndPrice = (record) => {
    if (!record.article || !record.vendor) {
      return undefined;
    }

    const { endArticles } = this.state;
    const article = endArticles[record.article.uuid];
    if (!article) {
      return undefined;
    }
    let price = undefined;
    // article.vendors.forEach(function (e) {
    //     if (e.vendor.uuid === record.vendor.uuid) {
    //         price = e.defaultReceivePrice;
    //     }
    // });
    price = article.purchasePrice;
    return price;
  }

  getShelfLife = (record) => {
    if (!record.article) {
      return undefined;
    }

    const { endArticles } = this.state;
    const article = endArticles[record.article.uuid];
    if (!article) {
      return undefined;
    }

    return {
      type: article.shelfLifeType,
      days: article.shelfLifeDays
    };
  }

  disabledProductDate(current) {
    return current > moment().endOf('day');
  }

  disabledValidDate(current) {
    return current && current < moment().add(-1, 'days').endOf('day');
  }

  // ---构建选择器-- 结束 成品---

  /**
 * 表格变化时
 * @param {*} e 
 * @param {*} fieldName 
 * @param {*} key 
 */
  handleFieldChange(e, fieldName, type, line) {
    const { entity, rawItems, endItems } = this.state;
    if (fieldName === 'article') {
      const articleSpec = JSON.parse(e);
      this.state[`${type}Items`][line - 1].article = {
        uuid: articleSpec.uuid,
        code: articleSpec.code,
        name: articleSpec.name
      }
      this.state[`${type}Items`][line - 1].spec = articleSpec.spec;;
      this.state[`${type}Items`][line - 1].binCode = undefined;
      this.state[`${type}Items`][line - 1].binUsage = undefined;
      this.state[`${type}Items`][line - 1].containerBarcode = undefined;
      this.state[`${type}Items`][line - 1].vendor = undefined;
      this.state[`${type}Items`][line - 1].productionBatch = undefined;
      this.state[`${type}Items`][line - 1].productDate = undefined;
      this.state[`${type}Items`][line - 1].validDate = undefined;
      this.state[`${type}Items`][line - 1].qpcStr = undefined;
      this.state[`${type}Items`][line - 1].price = undefined;
      this.state[`${type}Items`][line - 1].qtyStr = undefined;
      this.state[`${type}Items`][line - 1].binCode = undefined;
      this.state[`${type}Items`][line - 1].sourceBill = undefined;
      this.state[`${type}Items`][line - 1].stockBatch = undefined;
      if (type === 'end') {
        this.queryEndArticle(articleSpec.uuid, line);
      }
    } else if (fieldName === 'binCode') {
      if (type == 'end') {
        const binCodeUsage = JSON.parse(e);

        if (this.state[`${type}Items`][line - 1].binCode && binCodeUsage.code != this.state[`${type}Items`][line - 1].binCode) {
          this.state[`${type}Items`][line - 1].containerBarcode = undefined;
        }

        this.state[`${type}Items`][line - 1].binCode = binCodeUsage.code;
        this.state[`${type}Items`][line - 1].binUsage = binCodeUsage.usage;
        if (this.props.process.containers) {
          this.props.process.containers.length = 0;
        }

      } else if (type == 'raw') {
        const binCodeUsage = JSON.parse(e);
        this.state[`${type}Items`][line - 1].binCode = binCodeUsage.binCode;
        this.state[`${type}Items`][line - 1].binUsage = binCodeUsage.binUsage;
        const containerBarcodes = this.getContainerBarcodes(this.state[`${type}Items`][line - 1]);
        if (containerBarcodes.length > 0) {
          this.state[`${type}Items`][line - 1].containerBarcode = containerBarcodes[0];
        }

        const vendors = this.getVendors(this.state[`${type}Items`][line - 1]);

        if (vendors.length > 0) {
          this.state[`${type}Items`][line - 1].vendor = vendors[0];
        }

        const productionBatchs = this.getProductionBatchs(this.state[`${type}Items`][line - 1]);
        if (productionBatchs.length > 0) {
          this.state[`${type}Items`][line - 1].productionBatch = productionBatchs[0].productionBatch;
          this.state[`${type}Items`][line - 1].productDate = productionBatchs[0].productDate;
          this.state[`${type}Items`][line - 1].validDate = productionBatchs[0].validDate;
        }

        const qpcStrs = this.getQpcStrs(this.state[`${type}Items`][line - 1]);

        if (qpcStrs.length > 0) {
          this.state[`${type}Items`][line - 1].qpcStr = qpcStrs[0].qpcStr;
          this.state[`${type}Items`][line - 1].munit = qpcStrs[0].munit;
          this.state[`${type}Items`][line - 1].price = qpcStrs[0].price;
        }

        const sourceBills = this.getSourceBills(this.state[`${type}Items`][line - 1]);
        if (sourceBills.length > 0) {
          this.state[`${type}Items`][line - 1].sourceBill = JSON.parse(sourceBills[0]);
        }

        const stockBatchs = this.getStockBatchs(this.state[`${type}Items`][line - 1]);
        if (stockBatchs.length > 0) {
          this.state[`${type}Items`][line - 1].stockBatch = stockBatchs[0];
        }

        const qty = this.getQty(this.state[`${type}Items`][line - 1]);

        this.state[`${type}Items`][line - 1].qty = qty;
        this.state[`${type}Items`][line - 1].qtyStr = toQtyStr(qty, this.state[`${type}Items`][line - 1].qpcStr);
      }
    } else if (fieldName === 'containerBarcode') {
      this.state[`${type}Items`][line - 1].containerBarcode = e;
      if (type === 'raw') {
        let vendors = this.getVendors(this.state[`${type}Items`][line - 1]);

        if (vendors.length > 0) {
          this.state[`${type}Items`][line - 1].vendor = vendors[0];
        }

        const productionBatchs = this.getProductionBatchs(this.state[`${type}Items`][line - 1]);
        if (productionBatchs.length > 0) {
          this.state[`${type}Items`][line - 1].productionBatch = productionBatchs[0].productionBatch;
          this.state[`${type}Items`][line - 1].productDate = productionBatchs[0].productDate;
          this.state[`${type}Items`][line - 1].validDate = productionBatchs[0].validDate;
          this.state[`${type}Items`][line - 1].weight = productionBatchs[0].weight;
          this.state[`${type}Items`][line - 1].volume = productionBatchs[0].volume;
        }
        const qpcStrs = this.getQpcStrs(this.state[`${type}Items`][line - 1]);
        if (qpcStrs.length > 0) {
          this.state[`${type}Items`][line - 1].qpcStr = qpcStrs[0].qpcStr;
          this.state[`${type}Items`][line - 1].munit = qpcStrs[0].munit;
          this.state[`${type}Items`][line - 1].price = qpcStrs[0].price;
        }

        const sourceBills = this.getSourceBills(this.state[`${type}Items`][line - 1]);
        if (sourceBills.length > 0) {
          this.state[`${type}Items`][line - 1].sourceBill = JSON.parse(sourceBills[0]);
        }

        const stockBatchs = this.getStockBatchs(this.state[`${type}Items`][line - 1]);
        if (stockBatchs.length > 0) {
          this.state[`${type}Items`][line - 1].stockBatch = stockBatchs[0];
        }

        const qty = this.getQty(this.state[`${type}Items`][line - 1]);

        this.state[`${type}Items`][line - 1].qty = qty;
        this.state[`${type}Items`][line - 1].qtyStr = toQtyStr(qty, this.state[`${type}Items`][line - 1].qpcStr);
      }
    } else if (fieldName === 'vendor') {
      this.state[`${type}Items`][line - 1].vendor = JSON.parse(e);
      const productionBatchs = this.getProductionBatchs(this.state[`${type}Items`][line - 1]);
      if (productionBatchs.length > 0) {
        this.state[`${type}Items`][line - 1].productionBatch = productionBatchs[0].productionBatch;
        this.state[`${type}Items`][line - 1].productDate = productionBatchs[0].productDate;
        this.state[`${type}Items`][line - 1].validDate = productionBatchs[0].validDate;
        this.state[`${type}Items`][line - 1].weight = productionBatchs[0].weight;
        this.state[`${type}Items`][line - 1].volume = productionBatchs[0].volume;
      }

      let qpcStrs = [];
      if (type === 'end') {
        qpcStrs = this.getEndQpcStrs(this.state[`${type}Items`][line - 1]);
      } else if (type === 'raw') {
        qpcStrs = this.getQpcStrs(this.state[`${type}Items`][line - 1]);
      }
      if (qpcStrs.length > 0) {
        this.state[`${type}Items`][line - 1].qpcStr = qpcStrs[0].qpcStr;
        this.state[`${type}Items`][line - 1].munit = qpcStrs[0].munit;
        this.state[`${type}Items`][line - 1].price = qpcStrs[0].price;
      }

      let qty = 0;
      if (type === 'end') {
        qty = this.getEndQty(this.state[`${type}Items`][line - 1]);
      } else if (type === 'raw') {
        qty = this.getQty(this.state[`${type}Items`][line - 1]);
      }

      if (type == 'raw') {
        const sourceBills = this.getSourceBills(this.state[`${type}Items`][line - 1]);
        if (sourceBills.length > 0) {
          this.state[`${type}Items`][line - 1].sourceBill = JSON.parse(sourceBills[0]);
        }
        const stockBatchs = this.getStockBatchs(this.state[`${type}Items`][line - 1]);
        if (stockBatchs.length > 0) {
          this.state[`${type}Items`][line - 1].stockBatch = stockBatchs[0];
        }
      }

      this.state[`${type}Items`][line - 1].qty = qty;
      this.state[`${type}Items`][line - 1].qtyStr = toQtyStr(qty, this.state[`${type}Items`][line - 1].qpcStr);
    } else if (fieldName === 'productionBatch') {
      const product = JSON.parse(e);
      this.state[`${type}Items`][line - 1].productionBatch = product.productionBatch;
      this.state[`${type}Items`][line - 1].productDate = product.productDate;
      this.state[`${type}Items`][line - 1].validDate = product.validDate;
      this.state[`${type}Items`][line - 1].weight = product.weight;
      this.state[`${type}Items`][line - 1].volume = product.volume;
      const qpcStrs = this.getQpcStrs(this.state[`${type}Items`][line - 1]);
      if (qpcStrs.length > 0) {
        this.state[`${type}Items`][line - 1].qpcStr = qpcStrs[0].qpcStr;
        this.state[`${type}Items`][line - 1].munit = qpcStrs[0].munit;
        this.state[`${type}Items`][line - 1].price = qpcStrs[0].price;
      }

      const qty = this.getQty(this.state[`${type}Items`][line - 1]);

      this.state[`${type}Items`][line - 1].qty = qty;
      this.state[`${type}Items`][line - 1].qtyStr = toQtyStr(qty, this.state[`${type}Items`][line - 1].qpcStr);

      const sourceBills = this.getSourceBills(this.state[`${type}Items`][line - 1]);
      if (sourceBills.length > 0) {
        this.state[`${type}Items`][line - 1].sourceBill = JSON.parse(sourceBills[0]);
      }
      const stockBatchs = this.getStockBatchs(this.state[`${type}Items`][line - 1]);
      if (stockBatchs.length > 0) {
        this.state[`${type}Items`][line - 1].stockBatch = stockBatchs[0];
      }
    } else if (fieldName === 'qpcStr') {
      const qpcStrMunit = JSON.parse(e);

      let qty = 0;
      if (type === 'end') {
        qty = this.getEndQty(this.state[`${type}Items`][line - 1]);
        if (this.state[`${type}Items`][line - 1].qpcStr && qpcStrMunit.qpcStr != this.state[`${type}Items`][line - 1].qpcStr) {
          this.state[`${type}Items`][line - 1].containerBarcode = undefined;
          if (this.props.process.containers) {
            this.props.process.containers.length = 0;
          }
        }
      } else if (type === 'raw') {
        qty = this.getQty(this.state[`${type}Items`][line - 1]);

        const sourceBills = this.getSourceBills(this.state[`${type}Items`][line - 1]);
        if (sourceBills.length > 0) {
          this.state[`${type}Items`][line - 1].sourceBill = JSON.parse(sourceBills[0]);
        }
        const stockBatchs = this.getStockBatchs(this.state[`${type}Items`][line - 1]);
        if (stockBatchs.length > 0) {
          this.state[`${type}Items`][line - 1].stockBatch = stockBatchs[0];
        }
      }


      this.state[`${type}Items`][line - 1].qpcStr = qpcStrMunit.qpcStr;
      this.state[`${type}Items`][line - 1].munit = qpcStrMunit.munit;
      this.state[`${type}Items`][line - 1].price = qpcStrMunit.price;

      this.state[`${type}Items`][line - 1].qty = qty;
      this.state[`${type}Items`][line - 1].qtyStr = toQtyStr(this.state[`${type}Items`][line - 1].qty, qpcStrMunit.qpcStr);
    } else if (fieldName === 'qtyStr') {
      this.state[`${type}Items`][line - 1].qtyStr = e;
      this.state[`${type}Items`][line - 1].qty = qtyStrToQty(e, this.state[`${type}Items`][line - 1].qpcStr);
    } else if (fieldName === 'price') {
      this.state[`${type}Items`][line - 1].price = e;

      let qty = 0;
      if (type === 'end') {
        qty = this.getEndQty(this.state[`${type}Items`][line - 1]);
      } else if (type === 'raw') {
        qty = this.getQty(this.state[`${type}Items`][line - 1]);

        const sourceBills = this.getSourceBills(this.state[`${type}Items`][line - 1]);
        if (sourceBills.length > 0) {
          this.state[`${type}Items`][line - 1].sourceBill = JSON.parse(sourceBills[0]);
        }
        const stockBatchs = this.getStockBatchs(this.state[`${type}Items`][line - 1]);
        if (stockBatchs.length > 0) {
          this.state[`${type}Items`][line - 1].stockBatch = stockBatchs[0];
        }
      }

      this.state[`${type}Items`][line - 1].qty = qty;
      this.state[`${type}Items`][line - 1].qtyStr = toQtyStr(qty, this.state[`${type}Items`][line - 1].qpcStr);
    } else if (fieldName === 'productDate') {
      const shelfLife = this.getShelfLife(this.state[`${type}Items`][line - 1]);

      if (this.state[`${type}Items`][line - 1].productionBatch && moment(e.startOf('day')).format('YYYYMMDD') != this.state[`${type}Items`][line - 1].productionBatch) {
        this.state[`${type}Items`][line - 1].containerBarcode = undefined;
        if (this.props.process.containers) {
          this.props.process.containers.length = 0;
        }
      }

      this.state[`${type}Items`][line - 1].productDate = e.startOf('day');
      this.state[`${type}Items`][line - 1].validDate = moment(e).add(shelfLife.days, 'days');
      this.state[`${type}Items`][line - 1].productionBatch = moment(this.state[`${type}Items`][line - 1].productDate).format('YYYYMMDD');

    } else if (fieldName === 'validDate') {
      if (this.state[`${type}Items`][line - 1].productionBatch && moment(e.startOf('day')).format('YYYYMMDD') != this.state[`${type}Items`][line - 1].productionBatch) {
        this.state[`${type}Items`][line - 1].containerBarcode = undefined;
        if (this.props.process.containers) {
          this.props.process.containers.length = 0;
        }
      }
      const shelfLife = this.getShelfLife(this.state[`${type}Items`][line - 1]);
      this.state[`${type}Items`][line - 1].validDate = e.startOf('day');
      this.state[`${type}Items`][line - 1].productDate = moment(e).add(-shelfLife.days, 'days');
      this.state[`${type}Items`][line - 1].productionBatch = moment(this.state[`${type}Items`][line - 1].productDate).format('YYYYMMDD');
    } else if (field === 'sourceBill') {
      this.state[`${type}Items`][line - 1].sourceBill = JSON.parse(value);
      const stockBatchs = this.getStockBatchs(this.state[`${type}Items`][line - 1]);
      if (stockBatchs.length > 0) {
        this.state[`${type}Items`][line - 1].stockBatch = stockBatchs[0];
      }
      const qty = this.getQty(this.state[`${type}Items`][line - 1]);
      this.state[`${type}Items`][line - 1].qty = qty;
      this.state[`${type}Items`][line - 1].qtyStr = toQtyStr(qty, this.state[`${type}Items`][line - 1].qpcStr);
    } else if (field === 'stockBatch') {
      this.state[`${type}Items`][line - 1].stockBatch = value;
      const qty = this.getQty(this.state[`${type}Items`][line - 1]);
      this.state[`${type}Items`][line - 1].qty = qty;
      this.state[`${type}Items`][line - 1].qtyStr = toQtyStr(qty, this.state[`${type}Items`][line - 1].qpcStr);
    }

    this.setState({
      rawItems: [...this.state.rawItems],
      endItems: [...this.state.endItems],
    });
  }

  /**
   * 当加工方案改变时调用
   */
  onProcessSchemeChange = (value, owner) => {
    const { entity, rawItems, endItems, processingSchemeList } = this.state;
    if ((rawItems.length === 0 && endItems.length === 0)) {
      entity.processScheme = JSON.parse(value);
      entity.owner = { ...owner };
      this.setState({
        ownerDisabled: true,
        entity: { ...entity }
      });
      this.props.form.setFieldsValue({
        owner: JSON.stringify(owner)
      });
      this.getSchemeByUuid(JSON.parse(value).uuid);
    }

    if ((entity.processScheme && entity.processScheme.uuid != JSON.parse(value).uuid) || entity.processScheme == undefined) {
      Modal.confirm({
        title: clearConfirm(commonLocale.ownerLocale),
        okText: commonLocale.confirmLocale,
        cancelText: commonLocale.cancelLocale,
        onOk: () => {
          entity.processScheme = JSON.parse(value);
          entity.items = [];
          entity.owner = owner;
          this.props.form.setFieldsValue({
            processScheme: value,
            owner: JSON.stringify(owner)
          });
          this.setState({
            entity: { ...entity },
            ownerDisabled: entity.owner ? true : false,
            rawItems: [],
            endItems: []
          });
          this.getSchemeByUuid(JSON.parse(value).uuid);
        },
        onCancel: () => {
          this.props.form.setFieldsValue({
            processScheme: JSON.stringify(entity.processScheme)
          });
          this.setState({
            entity: { ...entity },
            rawItems: [...this.state.rawItems],
            endItems: [...this.state.endItems],
          });
        }
      });
    }
  }
  getSchemeByUuid = (uuid) => {
    this.props.dispatch({
      type: 'processingScheme/getByUuid',
      payload: uuid
    });
  }
  /**
   * 当货主改变时调用
   */
  onOwnerChange = (value) => {
    const { entity, rawItems, endItems } = this.state;
    if (!entity.owner || (rawItems.length === 0 && endItems.length === 0)) {
      entity.owner = JSON.parse(value);
    }

    if (entity.owner.uuid != JSON.parse(value).uuid) {
      Modal.confirm({
        title: clearConfirm(commonLocale.ownerLocale),
        okText: commonLocale.confirmLocale,
        cancelText: commonLocale.cancelLocale,
        onOk: () => {
          entity.owner = JSON.parse(value);
          entity.items = [];
          this.props.form.setFieldsValue({
            owner: value
          });
          this.setState({
            entity: { ...entity },
            rawItems: [],
            endItems: []
          });
        },
        onCancel: () => {
          this.props.form.setFieldsValue({
            owner: JSON.stringify(entity.owner)
          });
          this.setState({
            entity: { ...entity },
            rawItems: [...this.state.rawItems],
            endItems: [...this.state.endItems],
          });
        }
      });
    }
  }

  /**
   * 仓位改变时调用
   */
  onWrhChange = (value) => {
    const { entity, rawItems, endItems } = this.state;
    if (!entity.wrh || (rawItems.length === 0 && endItems.length === 0)) {
      entity.wrh = JSON.parse(value);
    }

    if (entity.wrh.uuid != JSON.parse(value).uuid) {
      Modal.confirm({
        title: clearConfirm(commonLocale.inWrhLocale),
        okText: commonLocale.confirmLocale,
        cancelText: commonLocale.cancelLocale,
        onOk: () => {
          entity.wrh = JSON.parse(value);
          entity.items = [];
          this.props.form.setFieldsValue({
            wrh: value
          });
          this.setState({
            entity: { ...entity },
            rawItems: [],
            endItems: [],
          });
        },
        onCancel: () => {
          this.props.form.setFieldsValue({
            wrh: JSON.stringify(entity.wrh)
          });
          this.setState({
            entity: { ...entity },
            rawItems: [...this.state.rawItems],
            endItems: [...this.state.endItems],
          });
        }
      });
    }
  }

  /**
   * 绘制表单
   */
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, defOwner, defCollectBinMgrScheme } = this.state;
    let basicCols = [
      <CFormItem key='processScheme' label={processBillLocale.processScheme} key='processSchemeSelect'>
        {
          getFieldDecorator('processScheme', {
            initialValue: entity.processScheme ? JSON.stringify(entity.processScheme) : undefined,

          })(
            <ProcessSchemeSelect
              onlyOnline
              placeholder={placeholderChooseLocale(processBillLocale.processScheme)}
              onChange={this.onProcessSchemeChange} />
          )
        }
      </CFormItem>,
      this.state.ownerDisabled ?
        <CFormItem label={commonLocale.inOwnerLocale} key='owner'>
          {getFieldDecorator('owner')(
            <Col>{convertCodeName(entity.owner)}</Col>
          )}
        </CFormItem>
        :
        <CFormItem label={commonLocale.inOwnerLocale} key='owner'>
          {getFieldDecorator('owner', {
            initialValue: entity.owner ? JSON.stringify(entity.owner) : undefined,
            rules: [
              { required: true, message: notNullLocale(commonLocale.inOwnerLocale) }
            ],
          })(<OwnerSelect disabled={this.state.ownerDisabled}
            onlyOnline
            placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)}
            onChange={this.onOwnerChange} />)}
        </CFormItem>,
      <CFormItem label={commonLocale.inWrhLocale} key='wrh'>
        {getFieldDecorator('wrh', {
          initialValue: entity.wrh ? JSON.stringify(entity.wrh) : undefined,
          rules: [
            { required: true, message: notNullLocale(commonLocale.inWrhLocale) }
          ],
        })(<WrhSelect placeholder={placeholderChooseLocale(commonLocale.inWrhLocale)} onChange={this.onWrhChange} />)}
      </CFormItem>,
    ];

    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={basicCols} noteCol={this.drawNotePanel()} noteLabelSpan={4} />,
    ];
  }
  /**
   * 绘制原料总数量
   */
  drawRawTotalInfo = () => {
    let allQtyStr = '0';
    let allQty = 0;
    let allAmount = '';
    this.state.rawItems && this.state.rawItems.map(item => {
      if (item.qty) {
        allQty = allQty + parseFloat(item.qty)
      }
      if (item.qtyStr) {
        allQtyStr = add(allQtyStr, item.qtyStr);
      }
      if (item.price && item.qty) {
        allAmount = (item.price * item.qty).toFixed(4);
      }
    })

    return (
      <span style={{ marginLeft: '10px' }}>
        {commonLocale.inAllQtyStrLocale}：{allQtyStr}  |
            {commonLocale.inAllQtyLocale}：{allQty}  |
            {commonLocale.inAllAmountLocale}：{allAmount}
      </span>
    );
  }
  /**
   * 绘制成品总数量
   */
  drawEndTotalInfo = () => {
    let allQtyStr = '0';
    let allQty = 0;
    let allAmount = '';

    this.state.endItems && this.state.endItems.map(item => {
      if (item.qty) {
        allQty = allQty + parseFloat(item.qty)
      }
      if (item.qtyStr) {
        allQtyStr = add(allQtyStr, item.qtyStr);
      }
      if (item.price && item.qty) {
        allAmount = (item.price * item.qty).toFixed(4);
      }
    })
    return (
      <span style={{ marginLeft: '10px' }}>
        {commonLocale.inAllQtyStrLocale}：{allQtyStr}  |
            {commonLocale.inAllQtyLocale}：{allQty}  |
            {commonLocale.inAllAmountLocale}：{allAmount}
      </span>
    );
  }

  /**
   * 绘制货位选项
   */
  getBinCodeOptions = (record) => {
    const binCodes = this.getBinCodes(record);
    const binCodeOptions = [];
    binCodes.forEach(e => {
      binCodeOptions.push(
        <Select.Option key={e.binCode} value={JSON.stringify(e)}>
          {e.binCode}
        </Select.Option>
      );
    });
    return binCodeOptions;
  }
  /**
   * 绘制明细表格
   */
  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, vendorArticle } = this.state;
    let rawCols = [
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        width: itemColWidth.articleEditColWidth,
        render: record => {
          return (
            <ProcessArticleSelect
              value={record.article ? JSON.stringify({ ...record.article, spec: record.spec }) : undefined}
              wrhUuid={entity.wrh ? entity.wrh.uuid : undefined}
              ownerUuid={entity.owner ? entity.owner.uuid : undefined}
              schemeUuid={entity.processScheme ? entity.processScheme.uuid : ''}
              placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
              onChange={e => this.handleFieldChange(e, 'article', 'raw', record.line)}
              showSearch={true}
            />
          );
        }
      },
      {
        title: commonLocale.bincodeLocale,
        key: 'binCode',
        width: itemColWidth.binCodeEditColWidth,
        render: record => {
          let value;
          if (record.binCode) {
            value = record.binCode;
          } else {
            if (this.getBinCodes(record).length > 0) {
              record.binCode = this.getBinCodes(record)[0].binCode;
              record.binUsage = this.getBinCodes(record)[0].binUsage;
              value = JSON.stringify(this.getBinCodes(record)[0]);
            }
          }
          return (
            <Select
              value={value}
              placeholder={placeholderChooseLocale(commonLocale.bincodeLocale)}
              onChange={e => this.handleFieldChange(e, 'binCode', 'raw', record.line)}
              showSearch={true}
            >
              {this.getBinCodeOptions(record)}
            </Select>
          );
        }
      },
      {
        title: commonLocale.inBinUsageLocale,
        key: 'binUsage',
        width: colWidth.enumColWidth,
        render: record => {
          return (
            <span>{record.binUsage ? getUsageCaption(record.binUsage) : <Empty />}</span>
          );
        }
      },
      {
        title: commonLocale.containerLocale,
        key: 'containerBarcode',
        width: itemColWidth.containerEditColWidth,
        render: record => {
          let value;
          if (record.containerBarcode) {
            value = record.containerBarcode;
          } else {
            if (this.getContainerBarcodes(record).length > 0) {
              record.containerBarcode = this.getContainerBarcodes(record)[0];
              value = this.getContainerBarcodes(record)[0];
            }
          }
          return (
            <Select
              value={value}
              placeholder={placeholderChooseLocale(commonLocale.containerLocale)}
              onChange={e => this.handleFieldChange(e, 'containerBarcode', 'raw', record.line)}
            >
              {this.getContainerBarcodeOptions(record)}
            </Select>
          );
        }
      },
      {
        title: commonLocale.vendorLocale,
        key: 'vendor',
        width: itemColWidth.articleEditColWidth,
        render: record => {
          let value;
          if (record.vendor) {
            value = convertCodeName(record.vendor);
          } else {
            if (this.getVendors(record).length > 0) {
              record.vendor = this.getVendors(record)[0];
              value = JSON.stringify(this.getVendors(record)[0]);
            }
          }
          return (
            <Select
              value={value}
              placeholder={placeholderChooseLocale(commonLocale.vendorLocale)}
              onChange={e => this.handleFieldChange(e, 'vendor', 'raw', record.line)}
            >
              {this.getVendorOptions(record)}
            </Select>
          );
        }
      },
      {
        title: commonLocale.productionBatchLocale,
        key: 'productionBatch',
        width: itemColWidth.numberEditColWidth + 50,
        render: record => {
          let value;
          if (record.productionBatch) {
            value = record.productionBatch;
          } else {
            if (this.getProductionBatchs(record).length > 0) {
              record.productionBatch = this.getProductionBatchs(record)[0].productionBatch;
              record.productDate = this.getProductionBatchs(record)[0].productDate;
              record.validDate = this.getProductionBatchs(record)[0].validDate;
              record.weight = this.getProductionBatchs(record)[0].weight;
              record.volume = this.getProductionBatchs(record)[0].volume;
              value = JSON.stringify(this.getProductionBatchs(record)[0]);
            }
          }
          return (
            <Select
              value={value}
              placeholder={placeholderChooseLocale(commonLocale.productionBatchLocale)}
              onChange={e => this.handleFieldChange(e, 'productionBatch', 'raw', record.line)}
            >
              {this.getProductionBatchOptions(record)}
            </Select>
          );
        }
      },
      {
        title: commonLocale.productionDateLocale,
        key: 'productDate',
        width: colWidth.dateColWidth - 30,
        render: record => {
          return (
            <span>{record.productDate ? moment(record.productDate).format('YYYY-MM-DD') : <Empty />}</span>
          );
        }
      },
      {
        title: commonLocale.validDateLocale,
        key: 'validDate',
        width: colWidth.dateColWidth - 30,
        render: record => {
          return (
            <span>{record.validDate ? moment(record.validDate).format('YYYY-MM-DD') : <Empty />}</span>
          );
        }
      },
      {
        title: commonLocale.inPriceLocale,
        key: 'price',
        width: itemColWidth.priceColWidth + 60,
        render: record => {
          let value;
          if (record.price == 0 || record.price) {
            value = record.price;
          } else {
            if (this.getPrices(record).length > 0) {
              record.price = this.getPrices(record)[0];
              value = this.getPrices(record)[0];
            }
          }
          return (
            <Select
              value={value}
              placeholder={placeholderChooseLocale(commonLocale.inPriceLocale)}
              onChange={e => this.handleFieldChange(e, 'price', 'raw', record.line)}
            >
              {this.getPriceOptions(record)}
            </Select>
          );
        }
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        key: 'qpcStr',
        render: (record) => {
          let value;
          if (record.qpcStr) {
            value = record.qpcStr + '/' + record.munit;
          } else {
            if (this.getQpcStrs(record).length > 0) {
              record.qpcStr = this.getQpcStrs(record)[0].qpcStr;
              record.munit = this.getQpcStrs(record)[0].munit;
              record.price = this.getQpcStrs(record)[0].price;
              value = JSON.stringify(this.getQpcStrs(record)[0]);
            }
          }
          return (
            <Select value={value}
              placeholder={placeholderLocale(commonLocale.qpcStrLocale)}
              onChange={
                e => this.handleFieldChange(e, 'qpcStr', 'raw', record.line)
              }>
              {
                this.getQpcStrOptions(record)
              }
            </Select>
          );
        },
        width: itemColWidth.qpcStrEditColWidth
      },
      {
        title: processBillLocale.spec,
        key: 'spec',
        width: itemColWidth.qpcStrColWidth - 30,
        render: record => {
          if (!record.sourceBill && this.getSourceBills(record).length > 0) {
            record.sourceBill = JSON.parse(this.getSourceBills(record)[0]);
          }
          if (!record.stockBatch && this.getStockBatchs(record).length > 0) {
            record.stockBatch = this.getStockBatchs(record)[0];
          }
          return record.spec ? record.spec : <Empty />
        }
      },
      {
        title: commonLocale.caseQtyStrLocale,
        key: 'qtyStr',
        width: itemColWidth.qtyStrColWidth,
        render: (record) => {
          if (record.article && record.binCode && !record.qtyStr && record.qtyStr !== 0) {
            record.qty = this.getQty(record);
            record.qtyStr = toQtyStr(record.qty, record.qpcStr);
          }
          return (
            <QtyStrInput
              value={record.qtyStr ? record.qtyStr : undefined}
              onChange={
                e => this.handleFieldChange(e, 'qtyStr', 'raw', record.line)
              }
            />
          );
        }
      },
      {
        title: commonLocale.inQtyLocale,
        key: 'qty',
        width: itemColWidth.qtyColWidth - 50,
        render: (record) => {
          return <span>{record.qty ? record.qty : 0}</span>
        }
      },
    ];

    let endCols = [
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        width: itemColWidth.articleEditColWidth,
        render: record => {
          if (this.state.ownerDisabled && this.state.scheme.uuid == JSON.parse(this.props.form.getFieldValue('processScheme')).uuid) {
            let article = record.article && this.state.scheme.endproductItems.find(function (item) {
              return item.article.uuid == record.article.uuid
            });
            if (article) {
              record.spec = article.spec;
              record.munit = article.munit;
              record.qpcStr = article.qpcStr;
            }
          }
          return (
            <ProcessEndArticleSelect
              value={record.article ? JSON.stringify({ ...record.article, spec: record.spec }) : undefined}
              ownerUuid={entity.owner ? entity.owner.uuid : undefined}
              wrhUuid={entity.wrh ? entity.wrh.uuid : undefined}
              schemeUuid={entity.processScheme ? entity.processScheme.uuid : ''}
              placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
              onChange={e => this.handleFieldChange(e, 'article', 'end', record.line)}
              showSearch={true}
            />
          );
        }
      },
      {
        title: commonLocale.vendorLocale,
        key: 'vendor',
        width: itemColWidth.articleEditColWidth,
        render: record => {
          let value = undefined;
          if (record.vendor) {
            value = convertCodeName(record.vendor);
          } else {
            if (this.getEndVendors(record).length > 0) {
              record.vendor = this.getEndVendors(record)[0];
              value = JSON.stringify(this.getVendors(record)[0]);
            }
          }
          return (
            <Select
              value={value}
              placeholder={placeholderChooseLocale(commonLocale.vendorLocale)}
              onChange={e => this.handleFieldChange(e, 'vendor', 'end', record.line)}
            >
              {this.getEndVendorOptions(record)}
            </Select>
          );
        }
      },
      {
        title: processBillLocale.spec,
        key: 'spec',
        width: itemColWidth.qpcStrColWidth,
        render: record => {
          return record.spec ? record.spec : <Empty />
        }
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        key: 'qpcStr',
        width: itemColWidth.qpcStrEditColWidth,
        render: (record) => {
          if (this.state.ownerDisabled) {
            return record.qpcStr ? record.qpcStr + '/' + record.munit : <Empty />;
          }
          let value;
          if (record.qpcStr) {
            value = record.qpcStr + '/' + record.munit;
          } else {
            if (this.getEndQpcStrs(record).length > 0) {
              record.qpcStr = this.getEndQpcStrs(record)[0].qpcStr;
              record.munit = this.getEndQpcStrs(record)[0].munit;
              record.price = this.getEndQpcStrs(record)[0].price;
              value = JSON.stringify(this.getEndQpcStrs(record)[0]);
            }
          }
          return (
            <Select value={value}
              placeholder={placeholderLocale(commonLocale.qpcStrLocale)}
              onChange={
                e => this.handleFieldChange(e, 'qpcStr', 'end', record.line)
              }>
              {
                this.getEndQpcStrOptions(record)
              }
            </Select>
          );
        },
      },
      {
        title: commonLocale.productionDateLocale,
        key: 'productDate',
        width: itemColWidth.dateEditColWidth,
        render: record => {
          const shelfLife = this.getShelfLife(record);
          if (!shelfLife) {
            return <Empty />;
          }
          if (shelfLife.type === 'NOCARE') {
            record.productDate = moment('8888-12-31', 'YYYY-MM-DD');
            record.validDate = moment('8888-12-31', 'YYYY-MM-DD');
            record.productionBatch = moment(record.productDate).format('YYYY-MM-DD');
          }
          if ('PRODUCTDATE' === shelfLife.type) {
            return <DatePicker
              disabledDate={this.disabledProductDate}
              value={record.productDate ? moment(record.productDate) : null}
              allowClear={false}
              onChange={(data) => this.handleFieldChange(data, 'productDate', 'end', record.line)}
            />;
          } else {
            return (
              <span>{record.productDate ? moment(record.productDate).format('YYYY-MM-DD') : <Empty />}</span>
            );
          }
        }
      },
      {
        title: commonLocale.validDateLocale,
        key: 'validDate',
        width: itemColWidth.dateEditColWidth,
        render: record => {
          const shelfLife = this.getShelfLife(record);
          if (!shelfLife) {
            return <Empty />;
          }
          if ('VALIDDATE' === shelfLife.type) {
            return <DatePicker
              value={record.validDate ? moment(record.validDate) : null}
              allowClear={false}
              onChange={(data) => this.handleFieldChange(data, 'validDate', 'end', record.line)}
              disabledDate={this.disabledValidDate}
            />;
          } else {
            return (
              <span>{record.validDate ? moment(record.validDate).format('YYYY-MM-DD') : <Empty />}</span>
            );
          }
        }
      },
      {
        title: commonLocale.inProductionBatchLocale,
        key: 'productionBatch',
        render: record => {
          return record.productionBatch ? record.productionBatch : <Empty />
        }
      },
      {
        title: commonLocale.bincodeLocale,
        key: 'binCode',
        width: colWidth.codeColWidth,
        render: record => {
          return (
            <BinSelect
              getUsage
              value={record.binCode ? JSON.stringify({
                code: record.binCode,
                usage: record.binUsage
              }) : undefined}
              usage={binUsage.EndProductProcessBin.name}
              wrhUuid={entity.wrh ? entity.wrh.uuid : undefined}
              placeholder={placeholderLocale(commonLocale.inBinCodeLocale)}
              onChange={e => this.handleFieldChange(e, 'binCode', 'end', record.line)}
            />
          );
        }
      },
      {
        title: commonLocale.containerLocale,
        key: 'containerBarcode',
        width: colWidth.enumColWidth,
        render: record => {
          if (!record.binUsage)
            return <Empty />;
          if (record.binUsage === binUsage.PickUpBin.name || record.binUsage === binUsage.PickUpStorageBin.name) {
            return <span>{record.containerBarcode}</span>;
          }
          return (
            <ProcessContainerSelect
              value={record.containerBarcode}
              articleUuid={record.article ? record.article.uuid : ''}
              binCode={record.binCode ? record.binCode : ''}
              qpcStr={record.qpcStr ? record.qpcStr : ''}
              productionBatch={record.productionBatch ? record.productionBatch : ''}
              placeholder={placeholderChooseLocale(commonLocale.containerLocale)}
              onChange={e => this.handleFieldChange(e, 'containerBarcode', 'end', record.line)}
            />
          );
        }
      },
      {
        title: commonLocale.inPriceLocale,
        key: 'price',
        width: itemColWidth.priceColWidth + 50,
        render: record => {
          let value = record.price;
          if (value === undefined) {
            value = this.getEndPrice(record);
            record.price = value;
          }
          return <InputNumber min={0} style={{ width: '100%' }} value={value} precision={4}
            max={MAX_DECIMAL_VALUE}
            placeholder={placeholderLocale(commonLocale.inPriceLocale)}
            onChange={e => this.handleFieldChange(e, 'price', 'end', record.line)} />
        }
      },
      {
        title: commonLocale.inQtyStrLocale,
        key: 'qtyStr',
        width: itemColWidth.qtyStrEditColWidth,
        render: (text, record) => {
          return (
            <QtyStrInput
              value={record.qtyStr ? record.qtyStr : 0}
              onChange={
                e => this.handleFieldChange(e, 'qtyStr', 'end', record.line)
              }
              placeholder={placeholderLocale(commonLocale.inQtyStrLocale)}
            />
          );
        }
      },
      {
        title: commonLocale.inQtyLocale,
        dataIndex: 'qty',
        key: 'qty',
        render: (text, record) => {
          record.qty = record.qty ? record.qty : 0;
          return <span>{record.qty ? record.qty : 0}</span>
        }
      },
    ];
    return (
      <div>
        <Tabs>
          <Tabs.TabPane tab={processBillLocale.rawInfoList} key='0'>
            <ItemEditTable
              // title = {processBillLocale.rawInfoList}
              columns={rawCols}
              data={this.state.rawItems}
              // scroll={{ x: 2400 }}
              drawTotalInfo={this.drawRawTotalInfo}
              drawBatchButton={this.drawBatchButton}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab={processBillLocale.endInfoList} key="1">
            <ItemEditTable
              // title = {processBillLocale.endInfoList}
              columns={endCols}
              // scroll={{ x: 2800 }}
              data={this.state.endItems}
              drawTotalInfo={this.drawEndTotalInfo}
            />
          </Tabs.TabPane>
        </Tabs>

        <PanelItemBatchAdd
          searchPanel={<SearchFormItemBatchAdd refresh={this.onSearch} fieldsValue={''} />}
          visible={this.state.batchAddVisible}
          columns={this.columns}
          data={{ list: this.state.stockList }}
          handlebatchAddVisible={this.handlebatchAddVisible}
          getSeletedItems={this.getItemList}
          noPagination={true}
          width={'85%'}
        />

      </div>
    )
  }
  /**
   * 绘制按钮
   */
  drawBatchButton = () => {
    return (
      <span>
        <a onClick={() => this.handlebatchAddVisible()}>添加</a>
      </span>
    )
  }
  /**搜索*/
  onSearch = (data) => {
    let wrhUuid = undefined;
    let ownerUuid = undefined;
    let schemeUuid = '';
    if (this.props.form.getFieldValue('wrh')) {
      wrhUuid = JSON.parse(this.props.form.getFieldValue('wrh')).uuid;
    }
    if (this.props.form.getFieldValue('owner')) {
      ownerUuid = JSON.parse(this.props.form.getFieldValue('owner')).uuid;
    }
    if (this.props.form.getFieldValue('processScheme')) {
      schemeUuid = JSON.parse(this.props.form.getFieldValue('processScheme')).uuid;
    }
    if (!wrhUuid || !ownerUuid) {
      return;
    }
    const { pageFilter } = this.state;
    pageFilter.searchKeyValues = {
      wrhUuid: wrhUuid,
      ownerUuid: ownerUuid,
      schemeUuid: schemeUuid,
      articleCode: data && data.articleCode ? data.articleCode : ''
    }
    this.refreshTable();
  }
  refreshTable = () => {
    this.props.dispatch({
      type: 'process/queryBatchAddStocks',
      payload: { ...this.state.pageFilter.searchKeyValues }
    });
  };
  /** 批量添加弹出框*/
  handlebatchAddVisible = () => {
    this.setState({
      batchAddVisible: !this.state.batchAddVisible
    })
  }

  /**获取批量增加的集合*/
  getItemList = (value) => {
    let { rawItems } = this.state;
    var newList = [];
    for (let i = 0; i < value.length; i++) {
      if (rawItems && rawItems.find(function (item) {
        return item.article && item.article.uuid === value[i].article.articleUuid && item.binCode === value[i].binCode
          && item.binUsage === value[i].binUsage && item.containerBarcode === value[i].containerBarcode
          && item.vendor.uuid === value[i].vendor.uuid && item.productionBatch === value[i].productionBatch
          && item.productDate === value[i].productionDate && item.validDate === value[i].validDate && item.price === value[i].price
          && item.qpcStr === value[i].qpcStr && item.munit === value[i].article.munit && item.spec === value[i].article.articleSpec
      }) === undefined) {
        let temp = { ...value[i] };
        temp.spec = temp.article.articleSpec;
        temp.munit = temp.article.munit;
        temp.article = {
          uuid: temp.article.articleUuid,
          code: temp.article.articleCode,
          name: temp.article.articleName
        },
          temp.qtyStr = toQtyStr(temp.qty, temp.qpcStr),
          temp.productDate = temp.productionDate;
        newList.push({ ...temp });
      }
    }
    this.state.line = rawItems.length + 1;
    newList.map(item => {
      item.line = this.state.line;
      this.state.line++;
    });
    rawItems = [...rawItems, ...newList];
    this.setState({
      rawItems: rawItems
    })
  }
  columns = [
    {
      title: commonLocale.inArticleLocale,
      key: 'article',
      dataIndex: 'article',
      width: colWidth.codeNameColWidth - 10,
      render: (val) => <EllipsisCol colValue={`[${val.articleCode}]${val.articleName}`} />
    },
    {
      title: commonLocale.bincodeLocale,
      key: 'binCode',
      dataIndex: 'binCode',
      width: itemColWidth.codeNameColWidth,
    },
    {
      title: commonLocale.inBinUsageLocale,
      key: 'binUsage',
      width: colWidth.enumColWidth - 10,
      render: record => {
        return (
          <span>{record.binUsage ? getUsageCaption(record.binUsage) : <Empty />}</span>
        );
      }
    },
    {
      title: commonLocale.containerLocale,
      key: 'containerBarcode',
      width: itemColWidth.codeColWidth - 10,
      dataIndex: 'containerBarcode',
    },
    {
      title: commonLocale.vendorLocale,
      key: 'vendor',
      width: itemColWidth.codeNameColWidth,
      dataIndex: 'vendor',
      render: val => {
        return (
          <EllipsisCol colValue={convertCodeName(val)} />
        );
      }
    },
    {
      title: commonLocale.productionBatchLocale,
      key: 'productionBatch',
      dataIndex: 'productionBatch',
      width: itemColWidth.stockBatchColWidth - 100,
    },
    {
      title: commonLocale.productionDateLocale,
      key: 'productionDate',
      width: colWidth.dateColWidth - 50,
      dataIndex: 'productionDate',
      render: val => {
        return (
          <span>{val ? moment(val).format('YYYY-MM-DD') : <Empty />}</span>
        );
      }
    },
    {
      title: commonLocale.inPriceLocale,
      key: 'price',
      width: itemColWidth.priceColWidth - 30,
      dataIndex: 'price'
    },
    {
      title: commonLocale.inQpcAndMunitLocale,
      key: 'qpcStr',
      width: itemColWidth.qpcStrColWidth,
      render: (record) => {
        return (
          <span>{record.qpcStr ? record.qpcStr + '/' + record.munit : <Empty />}</span>
        );
      }
    },
    {
      title: processBillLocale.spec,
      key: 'spec',
      width: itemColWidth.qpcStrColWidth - 45,
      render: record => {
        return record.article ? record.article.articleSpec : <Empty />
      }
    },
    {
      title: commonLocale.caseQtyStrLocale,
      key: 'qtyStr',
      width: itemColWidth.qtyStrColWidth - 60,
      render: (record) => {
        return toQtyStr(record.qty, record.qpcStr);
      }
    },
    {
      title: commonLocale.inQtyLocale,
      key: 'qty',
      width: itemColWidth.qtyColWidth - 60,
      render: (record) => {
        return <span>{record.qty ? record.qty : 0}</span>
      }
    },
  ]
}
