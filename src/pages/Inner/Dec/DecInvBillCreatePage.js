import CreatePage from '@/pages/Component/Page/CreatePage';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import { Select, Form, Modal, message } from 'antd';
import { connect } from 'dva';
import { convertCodeName, isEmptyObj } from '@/utils/utils';
import { placeholderChooseLocale, notNullLocale, placeholderLocale, commonLocale } from '@/utils/CommonLocale';
import { qtyStrToQty, toQtyStr, add } from '@/utils/QpcStrUtil';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import UserSelect from '@/pages/Component/Select/UserSelect';
import CFormItem from '@/pages/Component/Form/CFormItem';
import FormPanel from '@/pages/Component/Form/FormPanel';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import { PRETYPE } from '@/utils/constants';
import { loginUser, loginCompany, loginOrg, getDefOwner } from '@/utils/LoginContext';
import moment from 'moment';
import { binUsage, getUsageCaption } from '@/utils/BinUsage';
import { decLocale, itemNotZero, itemRepeat, clearConfirm, noteTooLong } from './DecInvBillLocale';
import { articleLocale } from '@/pages/Basic/Article/ArticleLocale';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import Empty from '@/pages/Component/Form/Empty';
import PanelItemBatchAdd from '@/pages/Component/Form/PanelItemBatchAdd';
import SearchFormItemBatchAdd from './SearchFormItemBatchAdd';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { decinvSourceBill } from './DecinvSourceBill';
import StockBatchAddModal from './StockBatchAddModal'
import DecBinSelect from './DecBinSelect';
import DecArticleSelect from './DecArticleSelect'

@connect(({ dec, stock, loading }) => ({
  dec,
  stock,
  loading: loading.models.dec,
}))
@Form.create()
export default class DecInvBillCreatePage extends CreatePage {

  constructor(props) {
    super(props);

    this.state = {
      title: commonLocale.createLocale + decLocale.title,
      stocks: [],//单个添加时查询出的库存信息
      entity: {
        decer: {
          uuid: loginUser().uuid,
          code: loginUser().code,
          name: loginUser().name
        },
        owner: getDefOwner(),
        items: []
      },
      auditButton: true,
      batchAddVisible: false,
      addStockDtl: false,
      stockLineMap: new Map(),
      stockList: {
        list: []
      },//批量添加查询后的分页数据
      pageFilter: {
        searchKeyValues: {
          page: 0,
          pageSize: 20
        }
      },
      auditPermission: 'iwms.inner.dec.audit'
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'dec/get',
      payload: {
        uuid: this.props.entityUuid
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const { stocks } = this.state;
    if (nextProps.entityUuid && !this.state.entity.uuid) {
      this.setState({
        entity: nextProps.dec.entity,
        title: decLocale.title + '：' + nextProps.dec.entity.billNumber
      });

      /*const that = this;
      nextProps.dec.entity.items && nextProps.dec.entity.items.forEach(function (e) {
        that.queryStocks(e.article.code, nextProps.dec.entity.wrh, nextProps.dec.entity.owner);
      });*/
    }

    if (nextProps.stock.stockLineMap) {
      this.setState({
        stockLineMap: nextProps.stock.stockLineMap
      });
    }

    if (nextProps.dec.stocks != this.props.dec.stocks) {
      if (Array.isArray(nextProps.dec.stocks) && nextProps.dec.stocks.length > 0) {
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
      }
      // else if(nextProps.dec.stocks.length==0 && this.state.entity.items.length!=0){
      //   message.destroy();//防止拉丝显示
      //   message.warning('库存不足');
      // }
    }
    if (nextProps.dec.stockList != this.props.dec.stockList) {
      this.setState({
        stockList: nextProps.dec.stockList,
      })
    }
  }

  onCancel = () => {
    this.props.form.resetFields();
    this.props.dispatch({
      type: 'dec/showPage',
      payload: {
        showPage: 'query'
      }
    });
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

  /**
     * 信息统计
     */
  drawTotalInfo = () => {
    let allQtyStr = '0';
    let allQty = 0;
    let list = [];
    let allAmount = 0;
    this.state.entity.items && this.state.entity.items.map(item => {
      if (item.qty) {
        allQty = allQty + parseFloat(item.qty)
      }
      if (item.qtyStr) {
        allQtyStr = add(allQtyStr, item.qtyStr);
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
        {commonLocale.inAllQtyStrLocale}：{allQtyStr}  |
              {commonLocale.inAllArticleCountLocale}：{articleCount}
        |{commonLocale.inAllAmountLocale}：{allAmount}
      </span>
    );
  }

  onSave = (data) => {
    const newData = this.validData(data);
    if (!newData) {
      return;
    }

    let type = 'dec/onSave';
    if (newData.uuid) {
      type = 'dec/onModify';
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

  onSaveAndCreate = (data) => {
    const newData = this.validData(data);
    if (!newData) {
      return;
    }
    newData['companyUuid'] = loginCompany().uuid;
    newData['dcUuid'] = loginOrg().uuid;

    this.props.dispatch({
      type: 'dec/onSaveAndCreate',
      payload: newData,
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.setState({
            entity: {
              decer: {
                uuid: loginUser().uuid,
                code: loginUser().code,
                name: loginUser().name
              },
              items: [],
            },
            stocks: []
          });
          this.props.form.resetFields();
        }
      }
    });
  }

  validData = (data) => {
    const { entity } = this.state;

    const newData = { ...entity };
    newData.decer = JSON.parse(data.decer);
    newData.type = data.type;
    newData.note = data.note;

    for (let i = 0; i < newData.items.length; i++) {
      if (!newData.items[i].article) {
        newData.items.splice(i, 1);
        if (newData.items[i] && newData.items[i].line) {
          newData.items[i].line = i + 1;
        }
        i = i - 1;
      }
    }

    if (newData.items.length === 0) {
      message.error(notNullLocale(decLocale.decItems));
      return false;
    }

    for (let i = newData.items.length - 1; i >= 0; i--) {
      if (!newData.items[i].article) {
        message.error(notNullLocale(articleLocale.title))
        return false;
      }

      if (newData.items[i].article && newData.items[i].qty <= 0) {
        message.error(itemNotZero(newData.items[i].line, decLocale.qty));
        return false;
      }

      if (newData.items[i].note && newData.items[i].note.length > 255) {
        message.error(noteTooLong(newData.items[i].line));
        return false;
      }
    }

    for (let i = 0; i < newData.items.length; i++) {
      for (let j = i + 1; j < newData.items.length; j++) {
        if (newData.items[i].article.uuid === newData.items[j].article.uuid &&
          newData.items[i].binCode === newData.items[j].binCode &&
          newData.items[i].containerBarcode === newData.items[j].containerBarcode &&
          newData.items[i].productionBatch === newData.items[j].productionBatch &&
          newData.items[i].qpcStr === newData.items[j].qpcStr &&
          newData.items[i].vendor.uuid === newData.items[j].vendor.uuid &&
          newData.items[i].price === newData.items[j].price && newData.items[i].stockBatch === newData.items[j].stockBatch) {
          message.error(itemRepeat(newData.items[i].line, newData.items[j].line));
          return false;
        }
      }
    }

    return newData;
  }

  queryStocks = (articleCode, wrh, owner) => {
    const { entity, stocks } = this.state;
    if (!wrh) {
      wrh = entity.wrh;
    }

    if (!owner) {
      owner = entity.owner;
    }

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

  onOwnerChange = (value) => {
    const { entity } = this.state;
    if (!entity.owner || entity.items.length === 0) {
      entity.owner = JSON.parse(value);
      return;
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
            entity: { ...entity }
          });
        },
        onCancel: () => {
          this.props.form.setFieldsValue({
            owner: JSON.stringify(entity.owner)
          });
          this.setState({
            entity: { ...entity }
          });
        }
      });
    }
  }

  onWrhChange = (value) => {
    const { entity } = this.state;
    if (!entity.wrh || entity.items.length === 0) {
      entity.wrh = JSON.parse(value);
      return;
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
            entity: { ...entity }
          });
        },
        onCancel: () => {
          this.props.form.setFieldsValue({
            wrh: JSON.stringify(entity.wrh)
          });
          this.setState({
            entity: { ...entity }
          });
        }
      });
    }
  }

  onFieldChange = (value, field, index) => {
    const { entity, stocks } = this.state;
    if (field === 'binCode') {
      const binCodeUsage = JSON.parse(value);
      entity.items[index - 1].binCode = binCodeUsage.binCode;
      entity.items[index - 1].binUsage = binCodeUsage.binUsage;
      this.setState({
        binCode: binCodeUsage.code,
        wrh: entity.wrh,
        owner: entity.owner
      });
      this.handlebatchAddVisibleForStock();
    } else if (field === 'article') {
      const articleSpec = JSON.parse(value);
      this.queryStocks(articleSpec.code, entity.wrh, entity.owner);
      entity.items[index - 1].article = {
        uuid: articleSpec.uuid,
        code: articleSpec.code,
        name: articleSpec.name
      }
      entity.items[index - 1].spec = articleSpec.spec;
      entity.items[index - 1].containerBarcode = undefined;
      entity.items[index - 1].vendor = undefined;
      entity.items[index - 1].productionBatch = undefined;
      entity.items[index - 1].productDate = undefined;
      entity.items[index - 1].validDate = undefined;
      entity.items[index - 1].qpcStr = undefined;
      entity.items[index - 1].qtyStr = undefined;
      entity.items[index - 1].price = undefined;
      entity.items[index - 1].weight = undefined;
      entity.items[index - 1].volume = undefined;
      entity.items[index - 1].price = undefined;
      entity.items[index - 1].sourceBill = undefined;
      entity.items[index - 1].stockBatch = undefined;
      // const containerBarcodes = this.getContainerBarcodes(entity.items[index - 1]);
      // if (containerBarcodes.length > 0) {
      //   entity.items[index - 1].containerBarcode = containerBarcodes[0];
      // }
      // const vendors = this.getVendors(entity.items[index - 1]);
      // if (vendors.length > 0) {
      //   entity.items[index - 1].vendor = vendors[0];
      // }
      // const productionBatchs = this.getProductionBatchs(entity.items[index - 1]);
      // if (productionBatchs.length > 0) {
      //   entity.items[index - 1].productionBatch = productionBatchs[0].productionBatch;
      //   entity.items[index - 1].productDate = productionBatchs[0].productDate;
      //   entity.items[index - 1].validDate = productionBatchs[0].validDate;
      //   entity.items[index - 1].weight = productionBatchs[0].weight;
      //   entity.items[index - 1].volume = productionBatchs[0].volume;
      // }
      // const qpcStrs = this.getQpcStrs(entity.items[index - 1]);
      // if (qpcStrs.length > 0) {
      //   entity.items[index - 1].qpcStr = qpcStrs[0].qpcStr;
      //   entity.items[index - 1].munit = qpcStrs[0].munit;
      //   entity.items[index - 1].price = qpcStrs[0].price;
      // }
      // const sourceBills = this.getSourceBills(entity.items[index - 1]);
      // if (sourceBills.length > 0) {
      //   entity.items[index - 1].sourceBill = JSON.parse(sourceBills[0]);
      // }
      // const stockBatchs = this.getStockBatchs(entity.items[index - 1]);
      // if (stockBatchs.length > 0) {
      //   entity.items[index - 1].stockBatch = stockBatchs[0];
      // }
      // const qty = this.getQty(entity.items[index - 1]);
      // entity.items[index - 1].qty = qty;
      // entity.items[index - 1].qtyStr = toQtyStr(qty, entity.items[index - 1].qpcStr);
    } else if (field === 'containerBarcode') {
      entity.items[index - 1].containerBarcode = value;
      const vendors = this.getVendors(entity.items[index - 1]);
      if (vendors.length > 0) {
        entity.items[index - 1].vendor = vendors[0];
      }
      const productionBatchs = this.getProductionBatchs(entity.items[index - 1]);
      if (productionBatchs.length > 0) {
        entity.items[index - 1].productionBatch = productionBatchs[0].productionBatch;
        entity.items[index - 1].productDate = productionBatchs[0].productDate;
        entity.items[index - 1].validDate = productionBatchs[0].validDate;
        entity.items[index - 1].weight = productionBatchs[0].weight;
        entity.items[index - 1].volume = productionBatchs[0].volume;
      }
      const qpcStrs = this.getQpcStrs(entity.items[index - 1]);
      if (qpcStrs.length > 0) {
        entity.items[index - 1].qpcStr = qpcStrs[0].qpcStr;
        entity.items[index - 1].munit = qpcStrs[0].munit;
        entity.items[index - 1].price = qpcStrs[0].price;
      }
      const sourceBills = this.getSourceBills(entity.items[index - 1]);
      if (sourceBills.length > 0) {
        entity.items[index - 1].sourceBill = JSON.parse(sourceBills[0]);
      }
      const stockBatchs = this.getStockBatchs(entity.items[index - 1]);
      if (stockBatchs.length > 0) {
        entity.items[index - 1].stockBatch = stockBatchs[0];
      }
      const qty = this.getQty(entity.items[index - 1]);
      entity.items[index - 1].qty = qty;
      entity.items[index - 1].qtyStr = toQtyStr(qty, entity.items[index - 1].qpcStr);
    } else if (field === 'vendor') {
      entity.items[index - 1].vendor = JSON.parse(value);
      const productionBatchs = this.getProductionBatchs(entity.items[index - 1]);
      if (productionBatchs.length > 0) {
        entity.items[index - 1].productionBatch = productionBatchs[0].productionBatch;
        entity.items[index - 1].productDate = productionBatchs[0].productDate;
        entity.items[index - 1].validDate = productionBatchs[0].validDate;
        entity.items[index - 1].weight = productionBatchs[0].weight;
        entity.items[index - 1].volume = productionBatchs[0].volume;
      }
      const qpcStrs = this.getQpcStrs(entity.items[index - 1]);
      if (qpcStrs.length > 0) {
        entity.items[index - 1].qpcStr = qpcStrs[0].qpcStr;
        entity.items[index - 1].munit = qpcStrs[0].munit;
        entity.items[index - 1].price = qpcStrs[0].price;
      }
      const sourceBills = this.getSourceBills(entity.items[index - 1]);
      if (sourceBills.length > 0) {
        entity.items[index - 1].sourceBill = JSON.parse(sourceBills[0]);
      }
      const stockBatchs = this.getStockBatchs(entity.items[index - 1]);
      if (stockBatchs.length > 0) {
        entity.items[index - 1].stockBatch = stockBatchs[0];
      }
      const qty = this.getQty(entity.items[index - 1]);
      entity.items[index - 1].qty = qty;
      entity.items[index - 1].qtyStr = toQtyStr(qty, entity.items[index - 1].qpcStr);
    } else if (field === 'productionBatch') {
      const product = JSON.parse(value);
      entity.items[index - 1].productionBatch = product.productionBatch;
      entity.items[index - 1].productDate = product.productDate;
      entity.items[index - 1].validDate = product.validDate;
      entity.items[index - 1].weight = product.weight;
      entity.items[index - 1].volume = product.volume;
      const qpcStrs = this.getQpcStrs(entity.items[index - 1]);
      if (qpcStrs.length > 0) {
        entity.items[index - 1].qpcStr = qpcStrs[0].qpcStr;
        entity.items[index - 1].munit = qpcStrs[0].munit;
        entity.items[index - 1].price = qpcStrs[0].price;
      }
      const sourceBills = this.getSourceBills(entity.items[index - 1]);
      if (sourceBills.length > 0) {
        entity.items[index - 1].sourceBill = JSON.parse(sourceBills[0]);
      }
      const stockBatchs = this.getStockBatchs(entity.items[index - 1]);
      if (stockBatchs.length > 0) {
        entity.items[index - 1].stockBatch = stockBatchs[0];
      }
      const qty = this.getQty(entity.items[index - 1]);
      entity.items[index - 1].qty = qty;
      entity.items[index - 1].qtyStr = toQtyStr(qty, entity.items[index - 1].qpcStr);
    } else if (field === 'qpcStr') {
      const qpcStrMunit = JSON.parse(value);
      entity.items[index - 1].qpcStr = qpcStrMunit.qpcStr;
      entity.items[index - 1].munit = qpcStrMunit.munit;
      entity.items[index - 1].price = qpcStrMunit.price;
      const sourceBills = this.getSourceBills(entity.items[index - 1]);
      if (sourceBills.length > 0) {
        entity.items[index - 1].sourceBill = JSON.parse(sourceBills[0]);
      }
      const stockBatchs = this.getStockBatchs(entity.items[index - 1]);
      if (stockBatchs.length > 0) {
        entity.items[index - 1].stockBatch = stockBatchs[0];
      }
      entity.items[index - 1].qty = this.getQty(entity.items[index - 1]);
      entity.items[index - 1].qtyStr = toQtyStr(entity.items[index - 1].qty, qpcStrMunit.qpcStr);
    } else if (field === 'qtyStr') {
      entity.items[index - 1].qtyStr = value;
      entity.items[index - 1].qty = qtyStrToQty(value, entity.items[index - 1].qpcStr);
    } else if (field === 'price') {
      entity.items[index - 1].price = value;
      const sourceBills = this.getSourceBills(entity.items[index - 1]);
      if (sourceBills.length > 0) {
        entity.items[index - 1].sourceBill = JSON.parse(sourceBills[0]);
      }
      const stockBatchs = this.getStockBatchs(entity.items[index - 1]);
      if (stockBatchs.length > 0) {
        entity.items[index - 1].stockBatch = stockBatchs[0];
      }
      const qty = this.getQty(entity.items[index - 1]);
      entity.items[index - 1].qty = qty;
      entity.items[index - 1].qtyStr = toQtyStr(qty, entity.items[index - 1].qpcStr);
    } else if (field === 'sourceBill') {
      entity.items[index - 1].sourceBill = JSON.parse(value);
      const stockBatchs = this.getStockBatchs(entity.items[index - 1]);
      if (stockBatchs.length > 0) {
        entity.items[index - 1].stockBatch = stockBatchs[0];
      }
      const qty = this.getQty(entity.items[index - 1]);
      entity.items[index - 1].qty = qty;
      entity.items[index - 1].qtyStr = toQtyStr(qty, entity.items[index - 1].qpcStr);
    } else if (field === 'stockBatch') {
      entity.items[index - 1].stockBatch = value;
      const qty = this.getQty(entity.items[index - 1]);
      entity.items[index - 1].qty = qty;
      entity.items[index - 1].qtyStr = toQtyStr(qty, entity.items[index - 1].qpcStr);
    }

    this.setState({
      entity: { ...entity }
    });
  }

  getQty = (item) => {
    const { stocks } = this.state;
    let qty = 0;
    // 根据 stocks 过滤出 qty 的值
    stocks.forEach(function (e) {
      if (e.article.uuid === item.article.uuid && e.binCode === item.binCode
        && e.containerBarcode === item.containerBarcode && e.vendor.uuid === item.vendor.uuid
        && e.productionBatch === item.productionBatch && e.qpcStr === item.qpcStr
        && e.price === item.price && e.stockBatch === item.stockBatch) {
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

  getContainerBarcodes = (record) => {
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
      if (e.article.uuid === record.article.uuid && e.binCode === record.binCode
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
      if (e.article.uuid === record.article.uuid && e.binCode === record.binCode &&
        e.containerBarcode === record.containerBarcode &&
        e.vendor.uuid === record.vendor.uuid && ps.indexOf(e.productionBatch) < 0) {
        ps.push(e.productionBatch);
        productionBatchs.push({
          productionBatch: e.productionBatch,
          productDate: e.productDate,
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
      if (e.article.uuid === record.article.uuid && e.binCode === record.binCode &&
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
      if (e.article.uuid === record.article.uuid && e.binCode === record.binCode &&
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
        if (e.article.uuid === record.article.uuid && e.binCode === record.binCode &&
          e.containerBarcode === record.containerBarcode && e.vendor.uuid === record.vendor.uuid
          && e.productionBatch === record.productionBatch && e.qpcStr === record.qpcStr
          && e.price === record.price && e.stockBatch === record.stockBatch && used.indexOf(e.sourceBill.billUuid) < 0) {
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
          {`[${JSON.parse(e).billNumber}]${decinvSourceBill[JSON.parse(e).billType]}`}
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
      if (e.article.uuid === record.article.uuid && e.binCode === record.binCode &&
        e.containerBarcode === record.containerBarcode && e.vendor.uuid === record.vendor.uuid
        && e.productionBatch === record.productionBatch && e.qpcStr === record.qpcStr
        && e.price === record.price &&
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

  /**
   * 批量添加库存明细弹出框
   */
  handlebatchAddVisibleForStock = () => {
    this.setState({
      addStockDtl: !this.state.addStockDtl
    });
  }

  /**获取批量增加的集合*/
  getItemListForStock = (value) => {
    const { entity } = this.state;
    var newStocksList = [];
    for (let i = 0; i < value.length; i++) {
      if (entity.items && entity.items.find(function (item) {
        return item.article && item.article.uuid === value[i].article.uuid && item.binCode === value[i].binCode &&
          item.containerBarcode === value[i].containerBarcode && item.vendor.uuid === value[i].vendor.uuid &&
          item.stock === value[i].stock
          && item.qpcStr === value[i].qpcStr && item.manageBatch === value[i].manageBatch
      }) === undefined) {
        let temp = { ...value[i] };
        temp.qtyStr = toQtyStr(temp.qty, temp.qpcStr);
        newStocksList.push(temp);
      }
    }
    entity.items.splice(entity.items.length - 1, 1);
    this.state.line = entity.items.length + 1;
    newStocksList.map(bill => {
      bill.line = this.state.line;
      this.state.line++;
    });
    entity.items = [...entity.items, ...newStocksList];

    this.handlebatchAddVisibleForStock();
    this.setState({
      entity: { ...entity }
    })
  }

  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, defOwner } = this.state;
    let cols = [
      <CFormItem label={decLocale.type} key='preType'>
        {getFieldDecorator('type', {
          initialValue: entity.type,
          rules: [
            { required: true, message: notNullLocale(decLocale.type) }
          ],
        })(<PreTypeSelect placeholder={placeholderChooseLocale(decLocale.type)} preType={PRETYPE.decinvType} />)}
      </CFormItem>,
      <CFormItem label={commonLocale.inWrhLocale} key='wrh'>
        {getFieldDecorator('wrh', {
          initialValue: entity.wrh ? JSON.stringify(entity.wrh) : undefined,
          rules: [
            { required: true, message: notNullLocale(commonLocale.inWrhLocale) }
          ],
        })(<WrhSelect placeholder={placeholderChooseLocale(commonLocale.inWrhLocale)} onChange={this.onWrhChange} />)}
      </CFormItem>,
      <CFormItem label={commonLocale.inOwnerLocale} key='owner'>
        {getFieldDecorator('owner', {
          initialValue: entity.owner ? JSON.stringify(entity.owner) : undefined,
          rules: [
            { required: true, message: notNullLocale(commonLocale.inOwnerLocale) }
          ],
        })(<OwnerSelect onlyOnline placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} onChange={this.onOwnerChange} />)}
      </CFormItem>,
      <CFormItem label={decLocale.decer} key='decer'>
        {getFieldDecorator('decer', {
          initialValue: JSON.stringify(entity.decer),
          rules: [
            { required: true, message: notNullLocale(decLocale.decer) }
          ],
        })(<UserSelect single={true} />)}
      </CFormItem>,
    ];
    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={cols} noteCol={this.drawNotePanel()} noteLabelSpan={4} />
    ];
  }

  drawTable = () => {
    const { entity, addStockDtl, binCode, wrh, owner } = this.state;

    let columns = [
      {
        title: commonLocale.bincodeLocale,
        key: 'binCode',
        fixed: 'left',
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
            <DecBinSelect
              value={value}
              placeholder={placeholderChooseLocale(commonLocale.bincodeLocale)}
              wrhUuid={entity.wrh ? entity.wrh.uuid : undefined}
              onChange={e => this.onFieldChange(e, 'binCode', record.line)}
              showSearch={true}
            />
          );
        }
      },
      {
        title: commonLocale.articleLocale,
        key: 'article',
        fixed: 'left',
        width: itemColWidth.articleEditColWidth,
        render: record => {
          return (
            <DecArticleSelect
              value={record.article ? '[' + record.article.code + ']' + record.article.name : undefined}
              wrhUuid={entity.wrh ? entity.wrh.uuid : '-'}
              ownerUuid={entity.owner ? entity.owner.uuid : '-'}
              placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
              onChange={e => this.onFieldChange(e, 'article', record.line)}
              showSearch={true}
              binCode={record.binCode ? record.binCode : ''}
              line={record.line}
            />
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
              onChange={e => this.onFieldChange(e, 'containerBarcode', record.line)}
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
              onChange={e => this.onFieldChange(e, 'vendor', record.line)}
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
              onChange={e => this.onFieldChange(e, 'productionBatch', record.line)}
            >
              {this.getProductionBatchOptions(record)}
            </Select>
          );
        }
      },
      {
        title: commonLocale.productionDateLocale,
        key: 'productDate',
        width: colWidth.dateColWidth,
        render: record => {
          return (
            <span>{record.productDate ? moment(record.productDate).format('YYYY-MM-DD') : <Empty />}</span>
          );
        }
      },
      {
        title: commonLocale.validDateLocale,
        key: 'validDate',
        width: colWidth.dateColWidth,
        render: record => {
          return (
            <span>{record.validDate ? moment(record.validDate).format('YYYY-MM-DD') : <Empty />}</span>
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
                e => this.onFieldChange(e, 'qpcStr', record.line)
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
          if (!record.sourceBill) {
            if (this.getSourceBills(record).length > 0) {
              record.sourceBill = JSON.parse(this.getSourceBills(record)[0]);
            }
          }
          return (
            <Select
              value={value}
              placeholder={placeholderChooseLocale(commonLocale.inPriceLocale)}
              onChange={e => this.onFieldChange(e, 'price', record.line)}
            >
              {this.getPriceOptions(record)}
            </Select>
          );
        }
      },
      // {
      //   title: commonLocale.inSourceBillLocale,
      //   key: 'sourceBill',
      //   width: colWidth.enumColWidth + 110,
      //   render: record => {
      //     let value;
      //     if (record.sourceBill) {
      //       value = JSON.stringify(record.sourceBill);
      //     } else {
      //       if (this.getSourceBills(record).length > 0) {
      //         record.sourceBill = JSON.parse(this.getSourceBills(record)[0]);
      //         value = this.getSourceBills(record)[0];
      //       }
      //     }
      //     return (
      //       <Select
      //         value={value}
      //         placeholder={placeholderChooseLocale(commonLocale.inSourceBillLocale)}
      //         onChange={e => this.onFieldChange(e, 'sourceBill', record.line)}
      //       >
      //         {this.getSourceBillOptions(record)}
      //       </Select>
      //     );
      //   }
      // },
      {
        title: commonLocale.inStockBatchLocale,
        key: 'stockBatch',
        width: colWidth.enumColWidth + 50,
        render: record => {
          let value;
          if (record.stockBatch) {
            value = record.stockBatch;
          } else {
            if (this.getStockBatchs(record).length > 0) {
              record.stockBatch = this.getStockBatchs(record)[0];
              value = this.getStockBatchs(record)[0];
            }
          }
          return (
            <Select
              value={value}
              placeholder={placeholderChooseLocale(commonLocale.inStockBatchLocale)}
              onChange={e => this.onFieldChange(e, 'stockBatch', record.line)}
            >
              {this.getStockBatchOptions(record)}
            </Select>
          );
        }
      },
      {
        title: commonLocale.caseQtyStrLocale,
        key: 'qtyStr',
        width: itemColWidth.qtyStrColWidth,
        render: (record) => {
          let value;
          if (record.article && record.binCode && !record.qtyStr && record.qtyStr !== 0) {
            record.qty = this.getQty(record);
            record.qtyStr = toQtyStr(record.qty, record.qpcStr);
          }
          return (
            <QtyStrInput
              value={record.qtyStr ? record.qtyStr : undefined}
              onChange={
                e => this.onFieldChange(e, 'qtyStr', record.line)
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

    return (
      <div>
        <ItemEditTable
          title={commonLocale.inArticleLocale}
          columns={columns}
          data={this.state.entity.items ? this.state.entity.items : []}
          drawBatchButton={this.drawBatchButton}
          drawTotalInfo={this.drawTotalInfo}
        />
        <PanelItemBatchAdd
          searchPanel={<SearchFormItemBatchAdd refresh={this.onSearch} fieldsValue={''} />}
          visible={this.state.batchAddVisible}
          loading={this.props.loading}
          columns={this.columns}
          data={this.state.stockList}
          handlebatchAddVisible={this.handlebatchAddVisible}
          getSeletedItems={this.getItemList}
          width={'90%'}
          onChange={this.tableChange}
        />
        <StockBatchAddModal
          visible={addStockDtl}
          binCode={binCode}
          wrh={wrh}
          owner={owner}
          getItemList={this.getItemListForStock}
          handleCancel={this.handlebatchAddVisibleForStock}
        />
      </div>
    )
  }
  tableChange = (pagination, filtersArg, sorter) => {
    const { pageFilter } = this.state;
    pageFilter.searchKeyValues.page = pagination.current - 1;
    pageFilter.searchKeyValues.pageSize = pagination.pageSize;
    this.refreshTable();
  }
  /**搜索*/
  onSearch = (data) => {
    let wrhUuid = undefined;
    let ownerUuid = undefined;
    if (this.props.form.getFieldValue('wrh')) {
      wrhUuid = JSON.parse(this.props.form.getFieldValue('wrh')).uuid;
    }
    if (this.props.form.getFieldValue('owner')) {
      ownerUuid = JSON.parse(this.props.form.getFieldValue('owner')).uuid;
    }

    if (!wrhUuid || !ownerUuid) {
      return;
    }
    const { pageFilter } = this.state;
    pageFilter.searchKeyValues = {
      page: 0,
      pageSize: pageFilter.searchKeyValues.pageSize,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      wrhUuid: wrhUuid,
      ownerUuid: ownerUuid,
      ...data
    }
    this.refreshTable();
  }
  refreshTable = () => {
    this.props.dispatch({
      type: 'dec/queryBatchAddStocks',
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
    const { entity } = this.state;
    var newList = [];
    for (let i = 0; i < value.length; i++) {
      if (entity.items && entity.items.find(function (item) {
        return item.article && item.article.uuid === value[i].article.uuid && item.binCode === value[i].binCode &&
          item.containerBarcode === value[i].containerBarcode && item.vendor.uuid === value[i].vendor.uuid &&
          item.productionBatch === value[i].productionBatch && item.qpcStr === value[i].qpcStr && item.price === value[i].price
          && item.stockBatch === value[i].stockBatch && item.sourceBill.billNumber === value[i].sourceBill.billNumber
      }) === undefined) {
        let temp = { ...value[i] };
        temp.qtyStr = toQtyStr(temp.qty, temp.qpcStr);
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
      width: itemColWidth.containerEditColWidth - 50,
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
      width: itemColWidth.numberEditColWidth - 40,
    },
    {
      title: commonLocale.productionDateLocale,
      key: 'productDate',
      width: colWidth.dateColWidth - 60,
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
      width: colWidth.dateColWidth - 60,
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
    // {
    //   title: commonLocale.inSourceBillLocale,
    //   key: 'sourceBill',
    //   dataIndex: 'sourceBill',
    //   width: colWidth.codeNameColWidth,
    //   render: val => val && !isEmptyObj(val) ? <EllipsisCol colValue={`[${val.billNumber}]${decinvSourceBill[val.billType]}`} /> : <Empty />
    // },
    {
      title: commonLocale.inStockBatchLocale,
      key: 'stockBatch',
      dataIndex: 'stockBatch',
      width: colWidth.codeNameColWidth,
      render: val => <EllipsisCol colValue={val} />
    }
  ]
}
