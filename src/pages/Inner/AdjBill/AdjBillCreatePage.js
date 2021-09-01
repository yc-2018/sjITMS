import { connect } from 'dva';
import moment from 'moment';
import { Select, Form, Modal, message, Input, Col, Tabs, InputNumber, Button, DatePicker } from 'antd';
import { formatDate } from '@/utils/utils';
import { PRETYPE, MAX_DECIMAL_VALUE } from '@/utils/constants';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { convertCodeName, isEmptyObj, convertArticleDocField } from '@/utils/utils';
import { qtyStrToQty, toQtyStr, add } from '@/utils/QpcStrUtil';
import { binUsage, getUsageCaption } from '@/utils/BinUsage';
import { containerState } from '@/utils/ContainerState';
import { loginUser, loginCompany, loginOrg, getDefOwner } from '@/utils/LoginContext';
import { placeholderChooseLocale, notNullLocale, placeholderLocale, commonLocale } from '@/utils/CommonLocale';
import Empty from '@/pages/Component/Form/Empty';
import IncBinSelect from '@/pages/Inner/Inc/IncBinSelect';
import FormTitle from '@/pages/Component/Form/FormTitle';
import CFormItem from '@/pages/Component/Form/CFormItem';
import FormPanel from '@/pages/Component/Form/FormPanel';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import CreatePage from '@/pages/Component/Page/CreatePage';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import UserSelect from '@/pages/Component/Select/UserSelect';
import BinSelect from '@/pages/Component/Select/BinSelect';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import { articleLocale } from '@/pages/Basic/Article/ArticleLocale';
import ContainerSelect from '@/pages/Component/Select/ContainerSelect';
import PanelItemBatchAdd from '@/pages/Component/Form/PanelItemBatchAdd';
import SearchFormItemBatchAdd from './SearchFormItemBatchAdd';
import IncContainerSelect from '@/pages/Inner/Inc/IncContainerSelect';
import { Type, AdjDirection } from './AdjBillContants';
import { adjBillLocale } from './AdjBillLocale';
import ArticleSelect from './ArticleSelect';
import SourceBillPage from './SourceBillPage';
import { ADJ_RES } from './AdjBillPermission';
const TabPane = Tabs.TabPane;
const adjBillTypes = [];
Object.keys(Type).forEach(function (key) {
  adjBillTypes.push(<Select.Option value={Type[key].name} key={Type[key].name}>{Type[key].caption}</Select.Option>);
});
@connect(({ adjBill, article, storeRtn, vendorHandover, dec, receive, loading }) => ({
  adjBill, article, storeRtn, vendorHandover, dec, receive,
  loading: loading.models.adjBill,
}))
@Form.create()
export default class AdjBillCreatePage extends CreatePage {
  constructor(props) {
    super(props);
    this.state = {
      title: commonLocale.createLocale + adjBillLocale.title,
      isVisible: false,
      batchAddVisible: false,
      noAutoFocus: true,
      entity: {
        adjer: {
          uuid: loginUser().uuid,
          code: loginUser().code,
          name: loginUser().name
        },
        items: []
      },
      sourceBill: {},// 来源单据
      entityItemsForUp: [],
      entityItemsForDown: [],
      auditButton: true,
      auditPermission: ADJ_RES.AUDIT,
      articles: [],// 正向 收货/退仓 的商品
      stocks: [],// 逆向 收货/退仓/退货 的库存
      stockList: [],// 逆向批量 的库存
      pageFilter: {
        searchKeyValues: {
          page: 0,
          pageSize: 10
        }
      }
    }
  }
  componentDidMount() {
    if (this.props.entityUuid) {
      this.props.dispatch({
        type: 'adjBill/get',
        payload: this.props.entityUuid
      });
    }
    this.props.receive.entity = {};
    this.props.vendorHandover.entity = {};
    this.props.storeRtn.entity = {};
  }
  componentWillReceiveProps(nextProps) {
    const { stocks, articles, entity } = this.state;
    if (nextProps.entityUuid && !this.state.entity.uuid && nextProps.adjBill.entity) {
      let upList = [];
      let downList = [];
      let articleUuids = [];
      let upLine = 1;
      let downLine = 1;
      nextProps.adjBill.entity.items.forEach(item => {
        if (item.direction === AdjDirection.UP.name) {
          item.line = upLine;
          upList.push(item);
          upLine++;
        } else if (item.direction === AdjDirection.DOWN.name) {
          item.line = downLine;
          downList.push(item);
          downLine++
        }
        if (articleUuids.indexOf(item.article.articleUuid) == -1) {
          articleUuids.push(item.article.uuid);
        }
      });
      this.setState({
        entity: nextProps.adjBill.entity,
        entityItemsForUp: [...upList],
        entityItemsForDown: [...downList],
        title: adjBillLocale.title + '：' + nextProps.adjBill.entity.billNumber
      });
      // 查询来源单据信息
      let type = '';
      let payload = nextProps.adjBill.entity.sourceBill.billUuid;
      if (nextProps.adjBill.entity.type == Type['RECEIVE'].name) {
        type = 'receive/get';
        payload = {
          uuid: nextProps.adjBill.entity.sourceBill.billUuid
        }
      } else if (nextProps.adjBill.entity.type == Type['STORE_RTN'].name) {
        type = 'storeRtn/get';
      } else if (nextProps.adjBill.entity.type == Type['VENDOR_RTN'].name) {
        type = 'vendorHandover/get';
      }
      this.getSourceBillInfo(type, payload);
      this.queryArticles(articleUuids);
    }
    // 正向 收货-退仓 商品
    if (this.props.article.entity.uuid != nextProps.article.entity.uuid) {
      articles[nextProps.article.entity.uuid] = nextProps.article.entity;
      this.setState({
        articles: articles
      });
    }
    //  编辑->正向 收货-退仓 商品
    if (nextProps.article.articles && nextProps.article.articles.length > 0) {
      nextProps.article.articles.forEach(function (e) {
        articles[e.uuid] = e;
      });
      this.setState({
        articles: articles
      });
    }
    // 逆向 收货-退仓-退货 库存
    if (nextProps.dec.stocks != this.props.dec.stocks) {
      if (Array.isArray(nextProps.dec.stocks) && nextProps.dec.stocks.length > 0) {
        for (let i = nextProps.dec.stocks.length - 1; i >= 0; i--) {
          if (nextProps.dec.stocks[i].qty <= 0 || nextProps.dec.stocks[i].qty == null) {
            nextProps.dec.stocks.remove(nextProps.dec.stocks[i]);
          }
        }
        let hasAdded = false;
        for (let x in stocks) {
          if (stocks[x].article && nextProps.dec.stocks[0].article && stocks[x].article.code === nextProps.dec.stocks[0].article.code) {
            hasAdded = true;
            break;
          }
        }
        if (!hasAdded) {
          this.setState({
            stocks: stocks.concat(nextProps.dec.stocks)
          });
        }
      } else if (nextProps.dec.stocks.length == 0 && this.state.entity.items.length != 0) {
        message.destroy();//防止拉丝显示
        message.warning('库存不足');
      }
    }
    // 监测收货单
    if (nextProps.receive.entity && nextProps.receive.entity.uuid != this.props.receive.entity.uuid && entity.type === Type['RECEIVE'].name) {
      entity.sourceBill = {
        billType: 'ReceiveBill',
        billUuid: nextProps.receive.entity.uuid,
        billNumber: nextProps.receive.entity.billNumber,
      };
      this.setState({
        sourceBill: nextProps.receive.entity,
        entity: { ...entity }
      });
      this.props.form.setFieldsValue({
        sourceBill: nextProps.receive.entity.billNumber
      });
    }
    // 监测退仓单
    if (nextProps.storeRtn.entity && nextProps.storeRtn.entity.uuid != this.props.storeRtn.entity.uuid
      && entity.type === Type['STORE_RTN'].name) {
      entity.sourceBill = {
        billType: 'StoreRtnBill',
        billUuid: nextProps.storeRtn.entity.uuid,
        billNumber: nextProps.storeRtn.entity.billNumber,
      };
      this.setState({
        sourceBill: nextProps.storeRtn.entity,
        entity: { ...entity }
      });
      this.props.form.setFieldsValue({
        sourceBill: nextProps.storeRtn.entity.billNumber
      });
    }
    // 监测供应商交接单
    if (nextProps.vendorHandover.entity && nextProps.vendorHandover.entity.uuid != this.props.vendorHandover.entity.uuid && entity.type === Type['VENDOR_RTN'].name) {
      entity.sourceBill = {
        billType: 'VendorRtnHandoverBill',
        billUuid: nextProps.vendorHandover.entity.uuid,
        billNumber: nextProps.vendorHandover.entity.billNumber,
      };
      (this.state.entity && !this.state.entity.uuid) && nextProps.vendorHandover.entity.stockItems.forEach(item => {
        item.munit = item.article.munit;
        item.spec = item.article.articleSpec;
        item.article = {
          uuid: item.article.articleUuid,
          code: item.article.articleCode,
          name: item.article.articleName,
        }
        item.vendor = nextProps.vendorHandover.entity.vendor ? nextProps.vendorHandover.entity.vendor : {};
        this.setState({
          entityItemsForUp: [...nextProps.vendorHandover.entity.stockItems]
        })
      })
      this.setState({
        sourceBill: nextProps.vendorHandover.entity,
        entity: { ...entity },
      });
      this.props.form.setFieldsValue({
        sourceBill: nextProps.vendorHandover.entity.billNumber
      });
    }
    // 编辑--查询库存
    if (nextProps.adjBill.entity && (
      nextProps.receive.entity.uuid || nextProps.vendorHandover.entity.uuid || nextProps.storeRtn.entity.uuid
    )) {
      const that = this;
      nextProps.adjBill.entity.items && nextProps.adjBill.entity.items.forEach(function (e) {
        if (e.direction === AdjDirection.DOWN.name&&that.state.sourceBill.wrh&&that.state.sourceBill.owner) {
          that.queryStocks(e.article.code, that.state.sourceBill.wrh, that.state.sourceBill.owner);
        }
      });
    }
    if (nextProps.dec.stockList != this.props.dec.stockList) {
      this.setState({
        stockList: nextProps.dec.stockList,
      })
    }
  }
  /**
   * 校验数据
   */
  validData = (data) => {
    const { entity, entityItemsForDown, entityItemsForUp, sourceBill } = this.state;
    for (let i = 0; i < entityItemsForUp.length; i++) {
      if (!entityItemsForUp[i].article) {
        entityItemsForUp.splice(i, 1);
        if (entityItemsForUp[i] && entityItemsForUp[i].line) {
          entityItemsForUp[i].line = i + 1;
        }
        i = i - 1;
      }
    }
    for (let i = 0; i < entityItemsForDown.length; i++) {
      if (!entityItemsForDown[i].article) {
        entityItemsForDown.splice(i, 1);
        if (entityItemsForDown[i] && entityItemsForDown[i].line) {
          entityItemsForDown[i].line = i + 1;
        }
        i = i - 1;
      }
    }
    if (entityItemsForDown.length === 0 && entityItemsForUp.length == 0) {
      message.error(notNullLocale(adjBillLocale.adjBillItems));
      return false;
    }
    for (let i = entityItemsForUp.length - 1; i >= 0; i--) {
      entityItemsForUp[i].direction = AdjDirection.UP.name
      if (!entityItemsForUp[i].article) {
        message.error(`正向修正明细第${entityItemsForUp[i].line}行商品不能为空！`);
        return false;
      }
      if (entityItemsForUp[i]&&entityItemsForUp[i].article && (entityItemsForUp[i].price === undefined||entityItemsForUp[i].price < 0)) {
        message.error(`正向修正明细第${entityItemsForUp[i].line}行单价不能为空或小于0！`);
        return false;
      }
      if (entity.type === Type['VENDOR_RTN'].name) {
        if (!entity.uuid && entityItemsForUp[i].article && !entityItemsForUp[i].productionDate) {
          message.error(`正向修正明细第${entityItemsForUp[i].line}行生产日期不能为空！`);
          return false;
        } else if (entity.uuid && entityItemsForUp[i].article && !entityItemsForUp[i].productDate) {
          message.error(`正向修正明细第${entityItemsForUp[i].line}行生产日期不能为空！`);
          return false;
        } else {
          if (!entity.uuid)
            entityItemsForUp[i].productDate = formatDate(entityItemsForUp[i].productionDate, true);
        }
      } else {
        if (entityItemsForUp[i].article && !entityItemsForUp[i].productDate) {
          message.error(`正向修正明细第${entityItemsForUp[i].line}行生产日期不能为空！`);
          return false;
        } else {
          entityItemsForUp[i].productDate = formatDate(entityItemsForUp[i].productDate, true);
        }
      }
      if (entityItemsForUp[i].article && !entityItemsForUp[i].validDate) {
        message.error(`正向修正明细第${entityItemsForUp[i].line}行到效期不能为空！`);
        return false;
      } else {
        entityItemsForUp[i].validDate = formatDate(entityItemsForUp[i].validDate, true);
      }
      if (entityItemsForUp[i].article && !entityItemsForUp[i].binCode) {
        message.error(`正向修正明细第${entityItemsForUp[i].line}行货位代码不能为空！`);
        return false;
      }
      if (entityItemsForUp[i].article && !entityItemsForUp[i].containerBarcode) {
        message.error(`正向修正明细第${entityItemsForUp[i].line}行容器条码不能为空！`);
        return false;
      }
      if (entityItemsForUp[i].article && (entityItemsForUp[i].qty === 0 || entityItemsForUp[i].qty == undefined)) {
        message.error(`正向修正明细第${entityItemsForUp[i].line}行数量不能为0！`);
        return false;
      }
      if (entityItemsForUp[i].article && !entityItemsForUp[i].reason) {
        message.error(`正向修正明细第${entityItemsForUp[i].line}行修正原因不能为空！`);
        return false;
      }
    }
    for (let i = entityItemsForDown.length - 1; i >= 0; i--) {
      entityItemsForDown[i].direction = AdjDirection.DOWN.name
      if (!entityItemsForDown[i].article) {
        message.error(`逆向修正明细第${entityItemsForDown[i].line}行商品不能为空！`);
        return false;
      }
      if (entityItemsForDown[i].article && (entityItemsForDown[i].price === null || entityItemsForDown[i].price < 0)) {
        message.error(`逆向修正明细第${entityItemsForDown[i].line}行单价不能空或小于0！`);
        return false;
      }
      if (entityItemsForDown[i].article && entityItemsForDown[i].qty <= 0) {
        message.error(`逆向修正明细第${entityItemsForDown[i].line}行数量不能为0！`);
        return false;
      }
      if (entityItemsForDown[i].article && !entityItemsForDown[i].reason) {
        message.error(`逆向修正明细第${entityItemsForDown[i].line}行修正原因不能为空！`);
        return false;
      }
    }
    for (let i = 0; i < entityItemsForUp.length; i++) {
      for (let j = i + 1; j < entityItemsForUp.length; j++) {
        if (entityItemsForUp[i].article.uuid === entityItemsForUp[j].article.uuid &&
          entityItemsForUp[i].binCode === entityItemsForUp[j].binCode &&
          entityItemsForUp[i].containerBarcode === entityItemsForUp[j].containerBarcode &&
          entityItemsForUp[i].qpcStr === entityItemsForUp[j].qpcStr &&
          entityItemsForUp[i].vendor.uuid === entityItemsForUp[j].vendor.uuid &&
          entityItemsForUp[i].price === entityItemsForUp[j].price) {
          message.error(`正向修正单明细第${entityItemsForUp[i].line}行与第${entityItemsForUp[j].line}行重复！`);
          return false;
        }
      }
    }
    for (let i = 0; i < entityItemsForDown.length; i++) {
      for (let j = i + 1; j < entityItemsForDown.length; j++) {
        if (entityItemsForDown[i].article.uuid === entityItemsForDown[j].article.uuid &&
          entityItemsForDown[i].binCode === entityItemsForDown[j].binCode &&
          entityItemsForDown[i].containerBarcode === entityItemsForDown[j].containerBarcode &&
          entityItemsForDown[i].qpcStr === entityItemsForDown[j].qpcStr &&
          entityItemsForDown[i].vendor.uuid === entityItemsForDown[j].vendor.uuid &&
          entityItemsForDown[i].price === entityItemsForDown[j].price &&
          entityItemsForDown[i].productionBatch === entityItemsForDown[j].productionBatch) {
          message.error(`逆向修正单明细第${entityItemsForDown[i].line}行与第${entityItemsForDown[j].line}行重复！`);
          return false;
        }
      }
    }
    // let newData = {...entity};
    entity.items = [...entityItemsForUp, ...entityItemsForDown];
    let newData = { ...entity };
    return newData;
  }
  /**
   * 保存
   */
  onSave = (data) => {
    const newData = this.validData(data);
    if (!newData) {
      return;
    }
    let type = 'adjBill/onSave';
    if (newData.uuid) {
      type = 'adjBill/onModify';
    }
    newData['companyUuid'] = loginCompany().uuid;
    newData['dcUuid'] = loginOrg().uuid;
    newData['note'] = data.note;
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
    newData['note'] = data.note;
    this.props.dispatch({
      type: 'adjBill/onSaveAndCreate',
      payload: newData,
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.setState({
            entity: {
              adjer: {
                uuid: loginUser().uuid,
                code: loginUser().code,
                name: loginUser().name
              },
              items: [],
            },
            stocks: [],
            entityItemsForDown: [],
            entityItemsForUp: [],
            articles: []
          });
          this.props.form.resetFields();
        }
      }
    });
  }
  /**
   * 获取弹出框选择的一条数据
   */
  getSourceBill = (value) => {
    const { entity } = this.state;
    this.setState({
      entityItemsForDown: [],
      entityItemsForUp: [],
    })
    let type = '';
    let payload;
    if (entity.type === Type['RECEIVE'].name) {
      type = 'receive/get';
      payload = {
        uuid: value[0]
      }
    }
    if (entity.type === Type['STORE_RTN'].name) {
      type = 'storeRtn/get';
      payload = value[0];
    }
    if (entity.type === Type['VENDOR_RTN'].name) {
      type = 'vendorHandover/get';
      payload = value[0];
    }
    this.getSourceBillInfo(type, payload);
  }
  getSourceBillInfo = (type, payload) => {
    this.props.dispatch({
      type: type,
      payload: payload
    });
  }
  /**
   * 根据商品选查询库存-- 逆向-收货
   */
  queryStocks = (articleCode, wrh, owner) => {
    const { entity, stocks } = this.state;
    let hasQueryed = false;
    for (let x in stocks) {
      if (stocks[x].article && stocks[x].article.code === articleCode) {
        hasQueryed = true;
        break;
      }
    }
    if (hasQueryed) {
      return;
    }
    this.props.dispatch({
      type: 'dec/queryDecArticles',
      payload: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        articleCodeName: articleCode,
        wrhUuid: wrh ? wrh.uuid : '-',
        ownerUuid: owner ? owner.uuid : '-',
        page: 0,
        pageSize: 1000
      }
    });
  }
  /**
   * 返回至上级
   */
  onCancel = () => {
    this.props.form.resetFields();
    this.props.dispatch({
      type: 'adjBill/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  /**
   * 改变修正类型
   */
  handleChangeAdjType = (value) => {
    const { entity, entityItemsForUp, entityItemsForDown, sourceBill } = this.state;
    // 清空表格数据
    if (entityItemsForUp.length == 0 && entityItemsForDown.length == 0 && sourceBill.uuid == undefined&&entity.sourceBill==undefined) {
      this.state.entity.type = value;
      if (this.state.entity.sourceBill) {
        this.state.entity.sourceBill.billNumber = undefined;
      }
      this.setState({
        entity: { ...this.state.entity },
        sourceBill: {}
      });
      return;
    }
    if (entityItemsForUp.length != 0 || entityItemsForDown.length != 0 || sourceBill.uuid||entity.sourceBill.billNumber) {
      Modal.confirm({
        title: '修改修正类型会导致明细清空，请确认修改？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.state.entity.type = value;
          entityItemsForDown.length = 0;
          entityItemsForUp.length = 0;
          this.state.entity.sourceBill = undefined;
          this.props.form.setFieldsValue({
            type: value,
            sourceBill:''
          });
          this.setState({
            entity: { ...entity },
            entityItemsForUp: [],
            entityItemsForDown: [],
            sourceBill: {}
          });
        },
        onCancel: () => {
          this.props.form.setFieldsValue({
            type: entity.type
          });
          this.setState({
            entity: { ...entity }
          });
        }
      });
    }
  }
  /**
   * 查询一条商品信息
   */
  queryArticle = (articleUuid, line) => {
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
  sourceBillInputOnFocus = () => {
    if (this.state.entity.type) {
      this.setState({
        isVisible: true
      })
    } else {
      message.warning(placeholderChooseLocale(adjBillLocale.type));
    }
  }
  handleAddVisible = () => {
    this.setState({
      isVisible: !this.state.isVisible
    })
  }
  // 逆向相关 -- 开始 --
  /**
   * 设置 逆向收货/退仓的 商品下拉选项
   */
  getArticleOptions = (record) => {
    const { sourceBill, entity } = this.state;
    let articles = [];
    sourceBill.items && sourceBill.items.forEach(e => {
      articles.push(e.article);
    });
    //去重
    var obj = {};
    if (entity.type === Type['RECEIVE'].name) {
      articles = articles.reduce(function (item, next) {
        obj[next.uuid] ? '' : obj[next.uuid] = true && item.push(next);
        return item;
      }, []);
    } else {
      articles = articles.reduce(function (item, next) {
        obj[next.articleUuid] ? '' : obj[next.articleUuid] = true && item.push(next);
        return item;
      }, []);
    }
    const articleOptions = [];
    if (entity.type === Type['RECEIVE'].name) {
      articles.length > 0 && articles.forEach(e => {
        articleOptions.push(
          <Select.Option key={e.uuid} value={JSON.stringify(e)}>{convertCodeName(e)}</Select.Option>
        );
      });
    }
    if (entity.type === Type['STORE_RTN'].name) {
      articles.length > 0 && articles.forEach(e => {
        articleOptions.push(
          <Select.Option key={e.articleUuid} value={JSON.stringify(e)}>{convertArticleDocField(e)}</Select.Option>
        );
      });
    }
    return articleOptions;
  }
  /**
   * 设置 逆向 收货/退仓 供应商的值
   */
  getVendorsForDown = (record) => {
    const { stocks } = this.state;
    let vendors = [];
    if (!record.article) {
      return vendors;
    }
    let vendorUuids = [];
    stocks.forEach(e => {
      if (e.article.uuid === record.article.uuid && e.binCode === record.binCode
        && e.containerBarcode === record.containerBarcode && vendorUuids.indexOf(e.vendor.uuid) < 0) {
        vendorUuids.push(e.vendor.uuid);
        vendors.push(e.vendor);
      }
    });
    return vendors;
  }
  /**
   * 设置 逆向 收货/退仓 供应商的下拉选项
   */
  getVendorOptionsForDown = (record) => {
    let vendorOptions = [];
    let vendors = this.getVendorsForDown(record);
    vendors.forEach(e => {
      vendorOptions.push(
        <Select.Option key={e.uuid} value={JSON.stringify(e)}>
          {convertCodeName(e)}
        </Select.Option>
      );
    });
    return vendorOptions;
  }
  /**
   * 逆向 - 收货/退仓获取的 价格的值
   */
  getPricesForDown = (record) => {
    const { stocks } = this.state;
    let prices = [];
    if (!record.article) {
      return prices;
    }
    let used = [];
    stocks.forEach(function (e) {
      if (e.article.uuid === record.article.uuid && e.binCode === record.binCode &&
        e.containerBarcode === record.containerBarcode && e.vendor.uuid === record.vendor.uuid
        // && e.stockBatch === record.stockBatch
        && e.qpcStr === record.qpcStr && prices.indexOf(e.price) < 0) {
        used.push(e.price);
        prices.push(e.price);
      }
    });
    return prices;
  }
  /**
   * 逆向 - 收货/退仓获取的 价格下拉选项
   */
  getPriceOptionsForDown = (record) => {
    let priceOptions = [];
    this.getPricesForDown(record).forEach(function (e) {
      priceOptions.push(<Select.Option key={e} value={e}>{e}</Select.Option>);
    });
    return priceOptions;
  }
  /**
   * 逆向 收货-退仓 设置规格的值
   */
  getQpcStrsForDown = (record) => {
    const { stocks } = this.state;
    let qpcStrs = [];
    let qpcMunits = [];
    if (!record.article) {
      return qpcMunits;
    }
    stocks.forEach(e => {
      if (e.article.uuid === record.article.uuid && e.binCode === record.binCode &&
        e.containerBarcode === record.containerBarcode && e.vendor.uuid === record.vendor.uuid
        // && e.stockBatch === record.stockBatch
        && qpcStrs.indexOf(e.qpcStr) < 0) {
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
  /**
   * 逆向 收货-退仓 设置规格的下拉选项
   */
  getQpcStrOptionsForDown = (record) => {
    let qpcStrOptions = [];
    let qpcStrs = this.getQpcStrsForDown(record);
    qpcStrs.forEach(e => {
      qpcStrOptions.push(
        <Select.Option key={e.qpcStr} value={JSON.stringify(e)}>
          {e.qpcStr + "/" + e.munit}
        </Select.Option>
      );
    });
    return qpcStrOptions;
  }
  /**
   * 逆向 收货-退仓 批次的值
   */
  getStockBatchs = (record) => {
    const { stocks } = this.state;
    let stockBatchs = [];
    if (!record.article) {
      return stockBatchs;
    }
    let used = [];
    stocks.forEach(function (e) {
      if (e.article.uuid === record.article.uuid && e.binCode === record.binCode &&
        e.containerBarcode === record.containerBarcode && e.vendor.uuid === record.vendor.uuid
        // && e.stockBatch === record.stockBatch
        && e.qpcStr === record.qpcStr
        && e.price === record.price &&
        used.indexOf(e.productionBatch) < 0) {
        used.push(e.productionBatch);
        stockBatchs.push({
          productDate: e.productDate,
          validDate: e.validDate,
          productionBatch: e.productionBatch,
          spec: e.article.spec,
          qty: e.qty
        });
      }
    });
    return stockBatchs;
  }
  /**
   * 逆向 收货-退仓 批次的下拉选项
   */
  getStockBatchOptions = (record) => {
    let stockBatchOptions = [];
    this.getStockBatchs(record).forEach(function (e) {
      stockBatchOptions.push(
        <Select.Option key={e.productionBatch} value={e.productionBatch}>{e.productionBatch}</Select.Option>
      );
    });
    return stockBatchOptions;
  }
  /**
   * 逆向 收货-退仓 货位的值
   */
  getBinCodesForDown = (record) => {
    const { stocks } = this.state;
    let binCodeUsages = [];
    let binCodes = [];
    if (!record.article) {
      return binCodeUsages;
    }
    stocks.forEach(e => {
      if (e.article.uuid === record.article.uuid && binCodes.indexOf(e.binCode) < 0) {
        binCodes.push(e.binCode);
        binCodeUsages.push({
          binCode: e.binCode,
          binUsage: e.binUsage
        });
      }
    });
    return binCodeUsages;
  }
  /**
   * 逆向 收货-退仓 货位的下拉选项
   */
  getBinCodeOptionsForDown = (record) => {
    const binCodes = this.getBinCodesForDown(record);
    const binCodeOptions = [];
    binCodes.forEach(e => {
      binCodeOptions.push(
        <Select.Option key={e.binCode} value={JSON.stringify(e)}>
          {e.binCode+'['+ getUsageCaption(e.binUsage)+']'}
        </Select.Option>
      );
    });
    return binCodeOptions;
  }
  /**
   * 逆向 收货-退仓 容器的值
   */
  getContainerBarcodesForDown = (record) => {
    const { stocks } = this.state;
    let containerBarcodes = [];
    if (!record.article) {
      return containerBarcodes;
    }
    stocks.forEach(e => {
      if (e.article.uuid === record.article.uuid && e.binCode === record.binCode && containerBarcodes.indexOf(e.containerBarcode) < 0) {
        containerBarcodes.push(e.containerBarcode);
      }
    });
    return containerBarcodes;
  }
  /**
   * 逆向 收货-退仓 容器的下拉选项
   */
  getContainerBarcodeOptionsForDown = (record) => {
    let containerBarcodeOptions = [];
    let containerBarcodes = this.getContainerBarcodesForDown(record);
    containerBarcodes.forEach(e => {
      containerBarcodeOptions.push(
        <Select.Option key={e} value={e}>
          {e}
        </Select.Option>
      );
    });
    return containerBarcodeOptions;
  }
  getQtyForDown = (item) => {
    const { stocks } = this.state;
    let qty = 0;
    stocks.forEach(function (e) {
      if (e.article.uuid === item.article.uuid && e.binCode === item.binCode
        && e.containerBarcode === item.containerBarcode && e.vendor.uuid === item.vendor.uuid
        && e.qpcStr === item.qpcStr
        && e.price === item.price && e.productionBatch === item.productionBatch) {
        qty = e.qty;
      }
    });
    return qty;
  }
  /**批量查询条件搜索 */
  onSearch = (data) => {
    const { pageFilter, sourceBill, entity } = this.state;
    if (sourceBill == null || sourceBill == undefined || JSON.stringify(sourceBill) == "{}") {
      message.info("请先选择来源单据");
      return;
    }
    const articleUuidList = [];
    if (entity.type != Type['VENDOR_RTN'].name && (data == undefined || data.articleCodeName == null || data.articleCodeName == undefined)) {
      sourceBill.items.map(item => {
        if (item.article != undefined && entity.type == Type['RECEIVE'].name) {
          articleUuidList.push(
            item.article.uuid
          );
        } else if (item.article != undefined && entity.type == Type['STORE_RTN'].name) {
          articleUuidList.push(
            item.article.articleUuid
          );
        }
      })
    }
    pageFilter.searchKeyValues = {
      page: 0,
      pageSize: pageFilter.searchKeyValues.pageSize,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      wrhUuid: sourceBill.wrh.uuid,
      ownerUuid: sourceBill.owner.uuid,
      articleUuids: articleUuidList,
      ...data
    }
    this.refreshTable();
  }
  /** 批量添加弹出框*/
  handlebatchAddVisible = () => {
    this.setState({
      batchAddVisible: !this.state.batchAddVisible
    })
  }
  /**批量表格变化 */
  tableChange = (pagination, filtersArg, sorter) => {
    const { pageFilter } = this.state;
    pageFilter.searchKeyValues.page = pagination.current - 1;
    pageFilter.searchKeyValues.pageSize = pagination.pageSize;
    this.refreshTable();
  }
  /**刷新 */
  refreshTable = () => {
    this.props.dispatch({
      type: 'dec/queryBatchAddStocks',
      payload: { ...this.state.pageFilter.searchKeyValues }
    });
  };
  /**获取批量增加的集合*/
  getItemList = (value) => {
    const { entityItemsForDown } = this.state;
    var newList = [];
    for (let i = 0; i < value.length; i++) {
      if (entityItemsForDown && entityItemsForDown.find(function (item) {
        return item.article && item.article.uuid === value[i].article.uuid && item.binCode === value[i].binCode &&
          item.containerBarcode === value[i].containerBarcode && item.vendor.uuid === value[i].vendor.uuid &&
          item.productDate === value[i].productDate && item.qpcStr === value[i].qpcStr && item.price === value[i].price
          && item.productionBatch === value[i].productionBatch
      }) === undefined) {
        let temp = { ...value[i] };
        temp.qtyStr = toQtyStr(temp.qty, temp.qpcStr);
        newList.push(temp);
      }
    }
    this.state.line = entityItemsForDown.length + 1;
    newList.map(item => {
      item.line = this.state.line;
      this.state.line++;
    });
    this.setState({
      entityItemsForDown: [...entityItemsForDown, ...newList]
    })
  }
  // 逆向相关 -- 结束 --
  // 正向相关 -- 开始 --
  /**
   * 设置正向收货/退仓修正的供应商 赋值
   */
  getVendors = (record) => {
    if (!record.article) {
      return [];
    }
    const { articles } = this.state;
    const article = articles[record.article.uuid];
    if (!article) {
      return [];
    }
    const vendors = [];
    if (!article.vendors) {
      return vendors;
    }
    let defaultVendor = article.vendors.find(item => item.defaultReceive === true);
    if (defaultVendor) {
      vendors.push(defaultVendor.vendor);
    }
    article.vendors.map(item => {
      if (!defaultVendor || (defaultVendor.uuid != item.uuid)) {
        vendors.push(item.vendor);
      }
    })
    return vendors;
  }
  /**
   * 设置供应商下拉选项
   */
  getVendorOptions = (record) => {
    const vendors = this.getVendors(record);
    const vendorOptions = [];
    vendors.length > 0 && vendors.forEach(e => {
      vendorOptions.push(
        <Select.Option key={e.uuid} value={JSON.stringify(e)}>{convertCodeName(e)}</Select.Option>
      );
    });
    return vendorOptions;
  }
  /**
   * 设置正向 收货修正 价格的值
   */
  getPrice = (record) => {
    if (!record.article || !record.vendor) {
      return undefined;
    }
    const { articles } = this.state;
    const article = articles[record.article.uuid];
    if (!article) {
      return undefined;
    }
    let price = undefined;
    article.vendors.forEach(function (e) {
      if (e.vendor.uuid === record.vendor.uuid) {
        price = e.defaultReceivePrice;
      }
    });
    return price;
  }
  /**
   * 设置 正向 收货 规格的值
   */
  getQpcStrs = (record) => {
    if (!record.article) {
      return [];
    }
    const { articles } = this.state;
    const article = articles[record.article.uuid];
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
  /**
   * 设置 正向 收货 规格的值下拉选项
   */
  getQpcStrOptions = (record) => {
    const qpcStrs = this.getQpcStrs(record);
    const qpcStrOptions = [];
    qpcStrs.forEach(e => {
      qpcStrOptions.push(
        <Select.Option key={e.qpcStr} value={JSON.stringify(e)}>{e.qpcStr + "/" + e.munit}</Select.Option>
      );
    });
    return qpcStrOptions;
  }
  /**
   * 设置生产日期 到校日期相关
   */
  getShelfLife = (record) => {
    if (!record.article) {
      return undefined;
    }
    const { articles } = this.state;
    const article = articles[record.article.uuid];
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
  // 正向相关 -- 结束 --
  /**
   * 正向修正表格改动时
   * @param {*} e
   * @param {*} fieldName
   * @param {*} line
   */
  handleFieldChangeForUp(value, fieldName, line) {
    const { entity, entityItemsForUp, sourceBill } = this.state;
    const target = entityItemsForUp[line - 1];
    if (fieldName === 'article') {
      const article = JSON.parse(value);
      target.article = {
        uuid: article.uuid,
        code: article.code,
        name: article.name
      }
      target.spec = article.spec;
      target.vendor = sourceBill.vendor;
      target.price = undefined;
      // target.stockBatch = undefined;
      target.productDate = undefined;
      target.validDate = undefined;
      target.qpcStr = undefined;
      target.direction = AdjDirection.UP.name
      // this.queryArticle(article.uuid, line);
      this.props.dispatch({
        type: 'article/get',
        payload: {
          uuid: article.uuid
        },
        callback: response => {
          if (response && response.success) {
            if (response.data && response.data.manageBatch!== undefined) {
              target.manageBatch = response.data.manageBatch;
              this.setState({
                entityItemsForUp: [...entityItemsForUp]
              })
            }
          }
        }
      });
    } else if (fieldName === 'binCode') {
      if (entity.type === Type['VENDOR_RTN'].name) {
        target.binCode = value;
      } else {
        const binCodeUsage = JSON.parse(value);
        target.binCode = binCodeUsage.code;
        target.binUsage = binCodeUsage.usage;
        if (binCodeUsage.usage === binUsage.PickUpBin.name || binCodeUsage.usage === binUsage.PickUpStorageBin.name) {
          target.containerBarcode = '-';
        }
      }
    } else if (fieldName === 'containerBarcode') {
      target.containerBarcode = value;
    } else if (fieldName === 'vendor') {
      target.vendor = JSON.parse(value);
      target.price = undefined;
    } else if (fieldName === 'productionBatch') {
      target.productionBatch = value.target.value;
    } else if (fieldName === 'qpcStr') {
      const qpcStrMunit = JSON.parse(value);
      target.qpcStr = qpcStrMunit.qpcStr;
      target.munit = qpcStrMunit.munit;
    } else if (fieldName === 'price') {
      target.price = value;
    } else if (fieldName === 'productDate') {
      const shelfLife = this.getShelfLife(target);
      target.productDate = value.startOf('day');
      target.validDate = moment(value).add(shelfLife.days, 'days');
      target.productionBatch = moment(target.productionBatch).format('YYYYMMDD');
    } else if (fieldName === 'validDate') {
      const shelfLife = this.getShelfLife(target);
      target.validDate = value.startOf('day');
      target.productDate = moment(value).add(-shelfLife.days, 'days');
      target.productionBatch = moment(target.productionBatch).format('YYYYMMDD');
    } else if (fieldName === 'qty') {
      target.qty = value;
    } else if (fieldName === 'reason') {
      target.reason = value;
    }
    this.setState({
      entityItemsForUp: [...entityItemsForUp]
    });
  }
  /**
   * 逆向修正表格改动时
   * @param {*} value
   * @param {*} fieldName
   * @param {*} line
   */
  handleFieldChangeForDown(value, fieldName, line) {
    const { entity, entityItemsForDown, sourceBill } = this.state;
    const target = entityItemsForDown[line - 1];
    if (fieldName === 'article') {
      const article = JSON.parse(value);
      this.queryStocks(article.code, sourceBill.wrh, sourceBill.owner);
      if (entity.type === Type['RECEIVE'].name || entity.type === Type['VENDOR_RTN'].name) {
        target.article = {
          uuid: article.uuid,
          code: article.code,
          name: article.name
        }
      } else if (entity.type === Type['STORE_RTN'].name) {
        target.article = {
          uuid: article.articleUuid,
          code: article.articleCode,
          name: article.articleName
        }
      }
      target.spec = article.spec;
      target.binCode = undefined;
      target.binUsage = undefined;
      target.containerBarcode = undefined;
      target.vendor = undefined;
      target.productDate = undefined;
      target.validDate = undefined;
      target.qpcStr = undefined;
      target.price = undefined;
      target.productionBatch = undefined;
      target.direction = AdjDirection.DOWN.name
    } else if (fieldName === 'vendor') {
      target.vendor = JSON.parse(value);
      const qpcStrs = this.getQpcStrsForDown(target);
      if (qpcStrs.length > 0) {
        target.qpcStr = qpcStrs[0].qpcStr;
        target.munit = qpcStrs[0].munit;
        target.price = qpcStrs[0].price;
      }
      const stockBatchs = this.getStockBatchs(target);
      if (stockBatchs.length > 0) {
        target.productionBatch = stockBatchs[0].productionBatch;
      }
      const qty = this.getQtyForDown(target);
      target.qty = qty;
    } else if (fieldName === 'price') {
      target.price = value;
      const stockBatchs = this.getStockBatchs(target);
      if (stockBatchs.length > 0) {
        target.productionBatch = stockBatchs[0].productionBatch;
      }
      const qty = this.getQtyForDown(target);
      target.qty = qty;
    } else if (fieldName === 'qpcStr') {
      const qpcStrMunit = JSON.parse(value);
      target.qpcStr = qpcStrMunit.qpcStr;
      target.munit = qpcStrMunit.munit;
      target.price = qpcStrMunit.price;
      const stockBatchs = this.getStockBatchs(target);
      if (stockBatchs.length > 0) {
        target.productionBatch = stockBatchs[0].productionBatch;
      }
      target.qty = this.getQtyForDown(target);
    } else if (fieldName === 'productionBatch') {
      target.productionBatch = value;
      const qty = this.getQtyForDown(target);
      target.qty = qty;
    } else if (fieldName === 'binCode') {
      const binCodeUsage = JSON.parse(value);
      target.binCode = binCodeUsage.binCode;
      target.binUsage = binCodeUsage.binUsage;
      const containerBarcodes = this.getContainerBarcodesForDown(target);
      if (containerBarcodes.length > 0) {
        target.containerBarcode = containerBarcodes[0];
      }
      const vendors = this.getVendorsForDown(target);
      if (vendors.length > 0) {
        target.vendor = vendors[0];
      }
      const qpcStrs = this.getQpcStrsForDown(target);
      if (qpcStrs.length > 0) {
        target.qpcStr = qpcStrs[0].qpcStr;
        target.munit = qpcStrs[0].munit;
        target.price = qpcStrs[0].price;
      }
      const stockBatchs = this.getStockBatchs(target);
      if (stockBatchs.length > 0) {
        target.productionBatch = stockBatchs[0].productionBatch;
      }
      const qty = this.getQtyForDown(target);
      target.qty = qty;
    } else if (fieldName === 'containerBarcode') {
      target.containerBarcode = value;
      const vendors = this.getVendorsForDown(target);
      if (vendors.length > 0) {
        target.vendor = vendors[0];
      }
      const qpcStrs = this.getQpcStrsForDown(target);
      if (qpcStrs.length > 0) {
        target.qpcStr = qpcStrs[0].qpcStr;
        target.munit = qpcStrs[0].munit;
        target.price = qpcStrs[0].price;
      }
      const stockBatchs = this.getStockBatchs(target);
      if (stockBatchs.length > 0) {
        target.productionBatch = stockBatchs[0].productionBatch;
      }
      const qty = this.getQtyForDown(target);
      target.qty = qty;
    } else if (fieldName === 'qty') {
      target.qty = value;
    } else if (fieldName === 'reason') {
      target.reason = value;
    }
    this.setState({
      entityItemsForDown: [...entityItemsForDown]
    })
  }
  /**
   * 绘制基本信息
   */
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;
    let cols = [
      <CFormItem label={adjBillLocale.type} key='preType'>
        {getFieldDecorator('type', {
          initialValue: entity.type,
          rules: [
            { required: true, message: notNullLocale(adjBillLocale.type) }
          ],
        })(
          <Select initialValue='' onChange={this.handleChangeAdjType}
                  placeholder={placeholderChooseLocale(adjBillLocale.type)} autoFocus>
            {adjBillTypes}
          </Select>
        )}
      </CFormItem>,
      <CFormItem label={adjBillLocale.adjer} key='adjer'>
        {getFieldDecorator('adjer', {
          initialValue: JSON.stringify(entity.adjer),
          rules: [
            { required: true, message: notNullLocale(adjBillLocale.adjer) }
          ],
        })(
          <UserSelect single={true} />
        )}
      </CFormItem>,
      <CFormItem label={adjBillLocale.sourceBill} key='sourceBill'>
        {getFieldDecorator('sourceBill', {
          initialValue: entity.sourceBill ? entity.sourceBill.billNumber : '',
          rules: [
            { required: true, message: notNullLocale(adjBillLocale.sourceBill) }
          ],
        })(
          <Input placeholder={placeholderLocale(adjBillLocale.sourceBill)}
                 onFocus={this.sourceBillInputOnFocus}
          />
        )}
      </CFormItem>,
    ];
    if (this.state.entity.type === Type['RECEIVE'].name && this.state.sourceBill.wrh) {
      cols.push(
        <CFormItem label={commonLocale.inWrhLocale} key='wrh'>
          {getFieldDecorator('wrh')(
            <Col>{this.state.sourceBill.wrh ? convertCodeName(this.state.sourceBill.wrh) : <Empty />} </Col>
          )}
        </CFormItem>,
        <CFormItem label={commonLocale.inOwnerLocale} key='owner'>
          {getFieldDecorator('owner')(
            <Col>{this.state.sourceBill.owner ? convertCodeName(this.state.sourceBill.owner) : <Empty />}</Col>
          )}
        </CFormItem>,
        <CFormItem label={commonLocale.inVendorLocale} key='vendor'>
          {getFieldDecorator('vendor')(
            <Col>
              {this.state.sourceBill.vendor ? convertCodeName(this.state.sourceBill.vendor) : <Empty />}
            </Col>
          )}
        </CFormItem>,
        <CFormItem label={adjBillLocale.receiver} key='receiver'>
          {getFieldDecorator('receiver')(
            <Col>
              {this.state.sourceBill.receiver ? convertCodeName(this.state.sourceBill.receiver) : <Empty />}
            </Col>
          )}
        </CFormItem>,
      );
    } else if (this.state.entity.type === Type['STORE_RTN'].name && this.state.sourceBill.wrh) {
      cols.push(
        <CFormItem label={commonLocale.inWrhLocale} key='wrh'>
          {getFieldDecorator('wrh')(
            <Col>{this.state.sourceBill.wrh ? convertCodeName(this.state.sourceBill.wrh) : <Empty />} </Col>
          )}
        </CFormItem>,
        <CFormItem label={commonLocale.inOwnerLocale} key='owner'>
          {getFieldDecorator('owner')(
            <Col>{this.state.sourceBill.owner ? convertCodeName(this.state.sourceBill.owner) : <Empty />}</Col>
          )}
        </CFormItem>,
        <CFormItem label={commonLocale.inStoreLocale} key='store'>
          {getFieldDecorator('store')(
            <Col>
              {this.state.sourceBill.store ? convertCodeName(this.state.sourceBill.store) : <Empty />}
            </Col>
          )}
        </CFormItem>,
        <CFormItem label={adjBillLocale.rtner} key='rtner'>
          {getFieldDecorator('rtner')(
            <Col>
              {this.state.sourceBill.rtner ? convertCodeName(this.state.sourceBill.rtner) : <Empty />}
            </Col>
          )}
        </CFormItem>,
      );
    } else if (this.state.entity.type === Type['VENDOR_RTN'].name && this.state.sourceBill.wrh) {
      cols.push(
        <CFormItem label={commonLocale.inWrhLocale} key='wrh'>
          {getFieldDecorator('wrh')(
            <Col>{this.state.sourceBill.wrh ? convertCodeName(this.state.sourceBill.wrh) : <Empty />} </Col>
          )}
        </CFormItem>,
        <CFormItem label={commonLocale.inOwnerLocale} key='owner'>
          {getFieldDecorator('owner')(
            <Col>{this.state.sourceBill.owner ? convertCodeName(this.state.sourceBill.owner) : <Empty />}</Col>
          )}
        </CFormItem>,
        <CFormItem label={commonLocale.inVendorLocale} key='vendor'>
          {getFieldDecorator('vendor')(
            <Col>
              {this.state.sourceBill.vendor ? convertCodeName(this.state.sourceBill.vendor) : <Empty />}
            </Col>
          )}
        </CFormItem>,
        <CFormItem label={adjBillLocale.handover} key='handover'>
          {getFieldDecorator('handover')(
            <Col>
              {this.state.sourceBill.handover ? convertCodeName(this.state.sourceBill.handover) : <Empty />}
            </Col>
          )}
        </CFormItem>,
      );
    }
    return [
      <FormPanel key='basicInfo' noteLabelSpan={4} title={commonLocale.basicInfoLocale} cols={cols} noteCol={this.drawNotePanel()} />,
    ];
  }
  /**
   * 信息统计
   */
  drawTotalInfoForUp = () => {
    let allQty = 0;
    let list = [];
    let allAmount = 0;
    this.state.entityItemsForUp && Array.isArray(this.state.entityItemsForUp) && this.state.entityItemsForUp.map(item => {
      if (item.qty) {
        allQty = allQty + parseFloat(item.qty)
      }
      if (item.article && list.indexOf(item.article.uuid) == -1) {
        list.push(item.article.uuid);
      }
      if (item.price && item.qty) {
        allAmount = allAmount + item.price * item.qty;
      }
    });
    let articleCount = list.length;
    return (
      <span style={{ marginLeft: '10px' }}>
        {commonLocale.inAllQtyLocale}：{allQty}  |
        {commonLocale.inAllArticleCountLocale}：{articleCount}
        |{commonLocale.inAllAmountLocale}：{allAmount}
      </span>
    );
  }
  /**
   * 信息统计
   */
  drawTotalInfoForDown = () => {
    let allQty = 0;
    let list = [];
    let allAmount = 0;
    this.state.entityItemsForDown && this.state.entityItemsForDown.map(item => {
      if (item.qty) {
        allQty = allQty + parseFloat(item.qty)
      }
      if (item.article && list.indexOf(item.article.uuid) == -1) {
        list.push(item.article.uuid);
      }
      if (item.price && item.qty) {
        allAmount = allAmount + item.price * item.qty;
      }
    });
    let articleCount = list.length;
    return (
      <span style={{ marginLeft: '10px' }}>
        {commonLocale.inAllQtyLocale}：{allQty}  |
        {commonLocale.inAllArticleCountLocale}：{articleCount}
        |{commonLocale.inAllAmountLocale}：{allAmount}
      </span>
    );
  }
  /**
   * 绘制批量按钮
   */
  drawBatchButton = () => {
    // 逆向
    return (
      <span>
        <a
          onClick={() => this.handlebatchAddVisible()}
        >批量添加</a>
      </span>
    )
  }
  /**
   * 绘制明细表格
   */
  drawTable = () => {
    const { entity, sourceBill } = this.state;
    // 正向修正列
    let upColumns = [
      {
        title: commonLocale.articleLocale,
        key: 'article',
        width: itemColWidth.articleEditColWidth,
        render: record => {
          if (entity.type === Type['RECEIVE'].name) {
            return (
              <ArticleSelect
                getSpec={true}
                value={record.article ? convertCodeName(record.article) : undefined}
                vendorUuid={sourceBill.vendor ? sourceBill.vendor.uuid : '-'}
                placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
                onChange={e => this.handleFieldChangeForUp(e, 'article', record.line)}
                single
              />
            );
          } else if (entity.type === Type['STORE_RTN'].name) {
            return <ArticleSelect
              getSpec={true}
              value={record.article ? convertCodeName(record.article) : undefined}
              vendorUuid={''}
              placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
              onChange={e => this.handleFieldChangeForUp(e, 'article', record.line)}
              single
            />;
          } else if (entity.type === Type['VENDOR_RTN'].name) {
            return convertCodeName(record.article);
          } else {
            return placeholderChooseLocale(adjBillLocale.type)
          }
        }
      },
      {
        title: commonLocale.inVendorLocale,
        width: colWidth.codeNameColWidth,
        key: 'vendor',
        render: record => {
          if (entity.type === Type['VENDOR_RTN'].name) {
            return sourceBill.vendor ? convertCodeName(sourceBill.vendor) : <Empty />;
          }
          let value = undefined;
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
              onChange={e => this.handleFieldChangeForUp(e, 'vendor', record.line)}
            >
              {this.getVendorOptions(record)}
            </Select>
          );
        }
      },
      {
        title: commonLocale.inPriceLocale,
        key: 'price',
        width: itemColWidth.priceColWidth + 50,
        render: record => {
          if (entity.type === Type['VENDOR_RTN'].name) {
            return record.price ? record.price : <Empty />;
          }
          let value = record.price;
          if (value === undefined) {
            value = this.getPrice(record);
            record.price = value;
          }
          return <InputNumber min={0} style={{ width: '100%' }} value={value} precision={4}
                              max={MAX_DECIMAL_VALUE}
                              placeholder={placeholderLocale(commonLocale.inPriceLocale)}
                              onChange={e => this.handleFieldChangeForUp(e, 'price', record.line)} />
        }
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        key: 'qpcStrAndMunit',
        width: itemColWidth.qpcStrColWidth + 50,
        render: record => {
          if (entity.type === Type['VENDOR_RTN'].name) {
            return record.qpcStr ? record.qpcStr + "/" + record.munit : <Empty />;
          }
          let value = undefined;
          if (record.qpcStr) {
            value = record.qpcStr + "/" + record.munit;
          } else {
            if (this.getQpcStrs(record).length > 0) {
              record.qpcStr = this.getQpcStrs(record)[0].qpcStr;
              record.munit = this.getQpcStrs(record)[0].munit;
              value = JSON.stringify(this.getQpcStrs(record)[0]);
            }
          }
          return (
            <Select value={value}
                    placeholder={placeholderChooseLocale(commonLocale.qpcStrLocale)}
                    onChange={e => this.handleFieldChangeForUp(e, 'qpcStr', record.line)}>
              {this.getQpcStrOptions(record)}
            </Select>
          );
        }
      },
      {
        title: adjBillLocale.spec,
        key: 'spec',
        width: itemColWidth.containerEditColWidth,
        render: record => {
          return (
            <span>{record.spec ? record.spec : <Empty />}</span>
          );
        }
      },
      {
        title: commonLocale.inProductDateLocale,
        key: 'productDate',
        width: itemColWidth.containerEditColWidth,
        render: record => {
          if (entity.type === Type['VENDOR_RTN'].name) {
            if (this.state.entity.uuid) {
              return record.productDate ?
                moment(record.productDate).format("YYYY-MM-DD") : <Empty />;
            } else {
              return record.productionDate ?
                moment(record.productionDate).format("YYYY-MM-DD") : <Empty />;
            }
          }
          const shelfLife = this.getShelfLife(record);
          if (!shelfLife) {
            return <Empty />;
          }
          if (shelfLife.type === 'NOCARE') {
            record.productDate = moment('8888-12-31', 'YYYY-MM-DD');
            record.validDate = moment('8888-12-31', 'YYYY-MM-DD');
            record.productionBatch = moment(record.productDate).format('YYYYMMDD');
          }
          if ('PRODUCTDATE' === shelfLife.type) {
            return <DatePicker
              disabledDate={this.disabledProductDate}
              value={record.productDate ? moment(record.productDate) : null}
              allowClear={false}
              onChange={(data) => this.handleFieldChangeForUp(data, 'productDate', record.line)}
            />;
          } else {
            return (
              <span>{record.productDate ? moment(record.productDate).format('YYYY-MM-DD') : <Empty />}</span>
            );
          }
        }
      },
      {
        title: commonLocale.inValidDateLocale,
        key: 'validDate',
        width: itemColWidth.containerEditColWidth,
        render: record => {
          if (entity.type === Type['VENDOR_RTN'].name) {
            return record.validDate ? moment(record.validDate).format("YYYY-MM-DD") : <Empty />;
          }
          const shelfLife = this.getShelfLife(record);
          if (!shelfLife) {
            return <Empty />;
          }
          if ('VALIDDATE' === shelfLife.type) {
            return <DatePicker
              value={record.validDate ? moment(record.validDate) : null}
              allowClear={false}
              onChange={(data) => this.handleFieldChangeForUp(data, 'validDate', record.line)}
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
        width: itemColWidth.numberEditColWidth,
        render: (value, record) => {
          const shelfLife = this.getShelfLife(record);
          if (!shelfLife) {
            return <Empty />;
          }
          if (shelfLife.type === 'PRODUCTDATE' || shelfLife.type === 'VALIDDATE') {
            return (
              <Input
                disabled={!record.manageBatch}
                value={record && record.productionBatch ? record.productionBatch : null}
                placeholder={placeholderLocale('新批号')}
                onChange={e => this.handleFieldChangeForUp(e, 'productionBatch', record.line)}
              />
            );
          } else {
            return (
              <span>{record && record.productionBatch ? record.productionBatch : <Empty/>}</span>
            );
          }
        }
        // render: record => {
        //   return (
        //     <span>{record.stockBatch ? record.stockBatch : <Empty />}</span>
        //   );
        // }
      },
      {
        title: commonLocale.inBinCodeLocale,
        key: 'binCode',
        width: itemColWidth.binCodeEditColWidth + 50,
        render: record => {
          if (entity.type === Type['VENDOR_RTN'].name) {
            return <BinSelect
              value={record.binCode}
              placeholder={placeholderLocale(commonLocale.inBinCodeLocale)}
              wrhUuid={sourceBill.wrh ? sourceBill.wrh.uuid : undefined}
              onChange={e => this.handleFieldChangeForUp(e, 'binCode', record.line)}
            />
          }
          return (
            <IncBinSelect
              getUsage
              value={record.binCode ? JSON.stringify({
                code: record.binCode,
                usage: record.binUsage
              }) : undefined}
              placeholder={placeholderChooseLocale(commonLocale.bincodeLocale)}
              wrhUuid={sourceBill.wrh ? sourceBill.wrh.uuid : undefined}
              onChange={e => this.handleFieldChangeForUp(e, 'binCode', record.line)}
              showSearch={true}
            />
          );
        }
      },
      {
        title: commonLocale.containerLocale,
        key: 'containerBarcode',
        width: itemColWidth.containerEditColWidth,
        render: record => {
          if (entity.type === Type['VENDOR_RTN'].name) {
            return <ContainerSelect
              state={containerState.IDLE.name}
              value={record.containerBarcode}
              onChange={e => this.handleFieldChangeForUp(e, 'containerBarcode', record.line)}
              placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)}
            />
          }
          if (!record.binUsage)
            return <Empty />;
          if (record.binUsage === binUsage.PickUpBin.name || record.binUsage === binUsage.PickUpStorageBin.name) {
            return <span>{record.containerBarcode}</span>;
          }
          return (
            <IncContainerSelect
              value={record.containerBarcode}
              binCode={record.binCode}
              placeholder={placeholderChooseLocale(commonLocale.containerLocale)}
              onChange={e => this.handleFieldChangeForUp(e, 'containerBarcode', record.line)}
            />
          );
        }
      },
      {
        title: commonLocale.inQtyLocale,
        key: 'qty',
        width: itemColWidth.qtyStrEditColWidth,
        render: record => {
          return <InputNumber min={0} style={{ width: '100%' }} value={record.qty} precision={4}
                              max={MAX_DECIMAL_VALUE}
                              placeholder={placeholderLocale(commonLocale.inQtyLocale)}
                              onChange={e => this.handleFieldChangeForUp(e, 'qty', record.line)} />
        }
      },
      {
        title: adjBillLocale.reason,
        key: 'reason',
        width: itemColWidth.articleEditColWidth,
        render: record => {
          return <PreTypeSelect
            value={record.reason}
            preType={PRETYPE.adjReason}
            placeholder={placeholderChooseLocale(adjBillLocale.reason)}
            onChange={e => this.handleFieldChangeForUp(e, 'reason', record.line)}
          />;
        }
      },
    ];
    // 逆向修正列
    let downColumns = [
      {
        title: commonLocale.articleLocale,
        key: 'article',
        width: itemColWidth.articleEditColWidth,
        render: record => {
          if (entity.type === Type['VENDOR_RTN'].name) {
            return (
              <ArticleSelect
                value={record.article ? convertCodeName(record.article) : undefined}
                vendorUuid={sourceBill.vendor ? sourceBill.vendor.uuid : '-'}
                placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
                onChange={e => this.handleFieldChangeForDown(e, 'article', record.line)}
                single
              />
            );
          }
          return (
            <Select
              value={record.article ? convertCodeName(record.article) : undefined}
              placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
              onChange={e => this.handleFieldChangeForDown(e, 'article', record.line)}
            >
              {this.getArticleOptions(record)}
            </Select>
          );
        }
      },
      {
        title: commonLocale.bincodeLocale,
        key: 'binCode',
        width: itemColWidth.binCodeEditColWidth+30,
        render: record => {
          let value;
          if (record.binCode) {
            value = record.binCode;
          } else {
            if (this.getBinCodesForDown(record).length > 0) {
              record.binCode = this.getBinCodesForDown(record)[0].binCode;
              record.binUsage = this.getBinCodesForDown(record)[0].binUsage;
              value = JSON.stringify(this.getBinCodesForDown(record)[0]);
            }
          }
          return (
            <Select
              value={value}
              placeholder={placeholderChooseLocale(commonLocale.bincodeLocale)}
              onChange={e => this.handleFieldChangeForDown(e, 'binCode', record.line)}
              showSearch={true}
            >
              {this.getBinCodeOptionsForDown(record)}
            </Select>
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
            if (this.getContainerBarcodesForDown(record).length > 0) {
              record.containerBarcode = this.getContainerBarcodesForDown(record)[0];
              value = this.getContainerBarcodesForDown(record)[0];
            }
          }
          return (
            <Select
              value={value}
              placeholder={placeholderChooseLocale(commonLocale.containerLocale)}
              onChange={e => this.handleFieldChangeForDown(e, 'containerBarcode', record.line)}
            >
              {this.getContainerBarcodeOptionsForDown(record)}
            </Select>
          );
        }
      },
      {
        title: commonLocale.inVendorLocale,
        width: colWidth.codeNameColWidth + 50,
        key: 'vendor',
        render: record => {
          let value;
          if (record.vendor) {
            value = convertCodeName(record.vendor);
          } else {
            if (this.getVendorsForDown(record).length > 0) {
              record.vendor = this.getVendorsForDown(record)[0];
              value = JSON.stringify(this.getVendorsForDown(record)[0]);
            }
          }
          return (
            <Select
              value={value}
              placeholder={placeholderChooseLocale(commonLocale.vendorLocale)}
              onChange={e => this.handleFieldChangeForDown(e, 'vendor', record.line)}
            >
              {this.getVendorOptionsForDown(record)}
            </Select>
          );
        }
      },
      {
        title: commonLocale.inProductDateLocale,
        key: 'productDate',
        width: itemColWidth.containerEditColWidth,
        render: record => {
          return (
            <span>{record.productDate ? moment(record.productDate).format('YYYY-MM-DD') : <Empty />}</span>
          );
        }
      },
      {
        title: commonLocale.inValidDateLocale,
        key: 'validDate',
        width: itemColWidth.containerEditColWidth,
        render: record => {
          return (
            <span>{record.validDate ? moment(record.validDate).format('YYYY-MM-DD') : <Empty />}</span>
          );
        }
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        key: 'qpcStrAndMunit',
        width: itemColWidth.qpcStrColWidth + 20,
        render: record => {
          let value;
          if (record.qpcStr) {
            value = record.qpcStr + '/' + record.munit;
          } else {
            if (this.getQpcStrsForDown(record).length > 0) {
              record.qpcStr = this.getQpcStrsForDown(record)[0].qpcStr;
              record.munit = this.getQpcStrsForDown(record)[0].munit;
              record.price = this.getQpcStrsForDown(record)[0].price;
              value = JSON.stringify(this.getQpcStrsForDown(record)[0]);
            }
          }
          return (
            <Select value={value}
                    placeholder={placeholderLocale(commonLocale.qpcStrLocale)}
                    onChange={
                      e => this.handleFieldChangeForDown(e, 'qpcStr', record.line)
                    }>
              {
                this.getQpcStrOptionsForDown(record)
              }
            </Select>
          );
        }
      },
      {
        title: commonLocale.inPriceLocale,
        key: 'price',
        width: itemColWidth.priceColWidth + 50,
        render: record => {
          let value;
          if (record.price == 0 || record.price) {
            value = record.price;
          } else {
            if (this.getPricesForDown(record).length > 0) {
              record.price = this.getPricesForDown(record)[0];
              value = this.getPricesForDown(record)[0];
            }
          }
          return (
            <Select
              value={value}
              placeholder={placeholderChooseLocale(commonLocale.inPriceLocale)}
              onChange={e => this.handleFieldChangeForDown(e, 'price', record.line)}
            >
              {this.getPriceOptionsForDown(record)}
            </Select>
          );
        }
      },
      {
        title: commonLocale.inStockBatchLocale,
        key: 'productionBatch',
        width: itemColWidth.stockBatchColWidth + 80,
        render: record => {
          let value;
          if (record.productionBatch) {
            value = record.productionBatch;
          } else {
            if (this.getStockBatchs(record).length > 0) {
              record.productionBatch = this.getStockBatchs(record)[0].productionBatch;
              record.productDate = this.getStockBatchs(record)[0].productDate;
              record.validDate = this.getStockBatchs(record)[0].validDate;
              record.spec = this.getStockBatchs(record)[0].spec;
              record.qty = this.getStockBatchs(record)[0].qty;
              value = this.getStockBatchs(record)[0].productionBatch;
            }
          }
          return (
            <Select
              value={value}
              placeholder={placeholderChooseLocale(commonLocale.inStockBatchLocale)}
              onChange={e => this.handleFieldChangeForDown(e, 'productionBatch', record.line)}
            >
              {this.getStockBatchOptions(record)}
            </Select>
          );
        }
      },
      {
        title: adjBillLocale.spec,
        key: 'spec',
        width: itemColWidth.containerEditColWidth,
        render: record => {
          return (
            <span>{record.spec ? record.spec : <Empty />}</span>
          );
        }
      },
      {
        title: commonLocale.inQtyLocale,
        key: 'qty',
        width: itemColWidth.qtyStrEditColWidth,
        render: record => {
          return <InputNumber min={0} style={{ width: '100%' }} value={record.qty ? record.qty : 0} precision={4}
                              max={MAX_DECIMAL_VALUE}
                              placeholder={placeholderLocale(commonLocale.inQtyLocale)}
                              onChange={e => this.handleFieldChangeForDown(e, 'qty', record.line)} />
        }
      },
      {
        title: adjBillLocale.reason,
        key: 'reason',
        width: itemColWidth.articleEditColWidth,
        render: record => {
          return <PreTypeSelect
            value={record.reason}
            preType={PRETYPE.adjReason}
            placeholder={placeholderChooseLocale(adjBillLocale.reason)}
            onChange={e => this.handleFieldChangeForDown(e, 'reason', record.line)}
          />;
        }
      },
    ];
    // 批量添加的列
    let batchColumns = [
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        dataIndex: 'article',
        width: colWidth.codeNameColWidth,
        render: (val) => <EllipsisCol colValue={`[${val.code}]${val.name}`} />
      },
      {
        title: commonLocale.inPriceLocale,
        key: 'price',
        dataIndex: 'price',
        width: itemColWidth.priceColWidth,
      },
      {
        title: commonLocale.bincodeLocale,
        key: 'binCode',
        dataIndex: 'binCode',
        width: colWidth.codeColWidth - 100
      },
      {
        title: commonLocale.inBinUsageLocale,
        dataIndex: 'binUsage',
        key: 'binUsage',
        width: colWidth.enumColWidth - 30,
        render: text => text ? getUsageCaption(text) : <Empty />
      },
      {
        title: commonLocale.containerLocale,
        dataIndex: 'containerBarcode',
        key: 'containerBarcode',
        width: itemColWidth.containerEditColWidth - 55,
        render: val => val ? <EllipsisCol colValue={val} /> : <Empty />
      },
      {
        title: commonLocale.vendorLocale,
        key: 'vendor',
        dataIndex: 'vendor',
        render: val => <EllipsisCol colValue={convertCodeName(val)} />,
        width: colWidth.codeNameColWidth,
      },
      {
        title: commonLocale.productionBatchLocale,
        key: 'productionBatch',
        dataIndex: 'productionBatch',
        width: itemColWidth.numberEditColWidth,
      },
      {
        title: commonLocale.productionDateLocale,
        key: 'productDate',
        width: colWidth.dateColWidth-30,
        dataIndex: 'productDate',
        render: val => {
          return (
            <span>{val ? moment(val).format('YYYY-MM-DD') : <Empty />}</span>
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
        title: '规格',
        key: 'qpcStr',
        dataIndex: 'qpcStr',
        width: itemColWidth.qpcStrColWidth - 50,
      },
      {
        title: commonLocale.inQtyLocale,
        key: 'qty',
        dataIndex: 'qty',
        width: itemColWidth.qtyColWidth - 50,
      },
      {
        title: commonLocale.inStockBatchLocale,
        key: 'productionBatch',
        dataIndex: 'productionBatch',
        width: itemColWidth.enumColWidth,
      }
    ];
    return (
      <div >
        <FormTitle title='明细' />
        <Tabs defaultActiveKey="1">
          <TabPane tab={adjBillLocale.up} key="1">
            <ItemEditTable
              columns={upColumns}
              batchAdd={false}
              notNote
              data={this.state.entityItemsForUp}
              drawTotalInfo={this.drawTotalInfoForUp}
            />
          </TabPane>
          <TabPane tab={adjBillLocale.down} key="2">
            <ItemEditTable
              columns={downColumns}
              batchAdd={false}
              notNote
              drawBatchButton={this.drawBatchButton}
              data={this.state.entityItemsForDown}
              drawTotalInfo={this.drawTotalInfoForDown}
            />
          </TabPane>
        </Tabs>
        <PanelItemBatchAdd
          searchPanel={<SearchFormItemBatchAdd refresh={this.onSearch} fieldsValue={''}
                                               type={this.state.entity.type}
                                               wrh={this.state.sourceBill.wrh}
                                               vendor={this.state.sourceBill.vendor}
                                               items={this.state.sourceBill.items}
                                               sourceBill={this.state.entity.sourceBill} />}
          visible={this.state.batchAddVisible}
          columns={batchColumns}
          data={this.state.stockList}
          handlebatchAddVisible={this.handlebatchAddVisible}
          getSeletedItems={this.getItemList}
          width={'90%'}
          onChange={this.tableChange}
        />
        <SourceBillPage
          visible={this.state.isVisible}
          getAdjBillNumberList={this.getSourceBill}
          type={this.state.entity.type}
          handleAddVisible={this.handleAddVisible}
        />
      </div>
    );
  }
}
