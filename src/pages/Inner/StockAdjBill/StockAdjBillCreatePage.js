import { connect } from 'dva';
import moment from 'moment';
import { Select, Form, message, Modal, DatePicker, InputNumber, Input } from 'antd';
import CreatePage from '@/pages/Component/Page/CreatePage';
import CFormItem from '@/pages/Component/Form/CFormItem';
import FormPanel from '@/pages/Component/Form/FormPanel';
import UserSelect from '@/pages/Component/Select/UserSelect';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import {
  commonLocale, notNullLocale, placeholderChooseLocale,
  placeholderLocale
} from '@/utils/CommonLocale';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import { stockState } from '@/utils/StockState';
import { binUsage, getUsageCaption } from '@/utils/BinUsage';
import { toQtyStr, qtyStrToQty, add } from '@/utils/QpcStrUtil';
import { convertCodeName, convertDate, formatDate, convertDateToTime } from '@/utils/utils';
import { PRETYPE } from '@/utils/constants';
import { stockAdjBillLocale } from './StockAdjBillLocale';
import StockAdjArticleSelect from './StockAdjArticleSelect';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import Empty from '@/pages/Component/Form/Empty';
import { AdjType, getAdjTypeCaption, QpcStrAdjType, getQpcStrAdjTypeCaption, VendorAdjType, getVendorAdjTypeCaption, ProductionBatchAdjType, getProductionBatchAdjTypeCaption } from './StockAdjBillContants';
import PanelItemBatchAdd from '@/pages/Component/Form/PanelItemBatchAdd';
import SearchFormItemBatchAdd from '@/pages/Inner/Dec/SearchFormItemBatchAdd';
import { SHELFLIFE_TYPE } from '@/pages/Basic/Article/Constants';
import ItemBatchAddModal from './ItemBatchAddModal';
import IncBinSelect from '../Inc/IncBinSelect';
const Option = Select.Option;
const typeOptions = [];
Object.keys(AdjType).forEach(function (key) {
  typeOptions.push(<Option key={AdjType[key].name} value={AdjType[key].name}>{AdjType[key].caption}</Option>);
});
const qpcStrAdjTypeOptions = [];
Object.keys(QpcStrAdjType).forEach(function (key) {
  qpcStrAdjTypeOptions.push(<Option key={QpcStrAdjType[key].name} value={QpcStrAdjType[key].name}>{QpcStrAdjType[key].caption}</Option>);
});
const vendorAdjTypeOptions = [];
Object.keys(VendorAdjType).forEach(function (key) {
  vendorAdjTypeOptions.push(<Option key={VendorAdjType[key].name} value={VendorAdjType[key].name}>{VendorAdjType[key].caption}</Option>);
});
const productionBatchAdjTypeOptions = [];
Object.keys(ProductionBatchAdjType).forEach(function (key) {
  productionBatchAdjTypeOptions.push(<Option key={ProductionBatchAdjType[key].name} value={ProductionBatchAdjType[key].name}>{ProductionBatchAdjType[key].caption}</Option>);
});
const DEFAULTDATE = '8888-12-31';
const NOCARE = 'NOCARE';
const PRODUCTDATE = 'PRODUCTDATE';
const VALIDDATE = 'VALIDDATE';
@connect(({ stockadj, stock, pretype, article, loading }) => ({
  stockadj,
  stock,
  pretype,
  article,
  loading: loading.models.stockadj,
}))
@Form.create()
export default class StockAdjBillCreatePage extends CreatePage {
  constructor(props) {
    super(props);
    this.state = {
      title: commonLocale.createLocale + stockAdjBillLocale.title,
      currentView: CONFIRM_LEAVE_ACTION.NEW,
      auditButton: true,
      stockLineMap: new Map(),
      entity: {
        adjer: {
          uuid: loginUser().uuid,
          code: loginUser().code,
          name: loginUser().name
        },
        billItems: []
      },
      //批量添加
      batchAddVisible: false,
      addStockDtl: false,
      stockList: [],
      pageFilter: {
        searchKeyValues: {
          page: 0,
          pageSize: 20,
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        }
      },
      articleMap: new Map(),
      adjBinUsages: [],
      auditPermission:'iwms.inner.stockAdjBill.audit'
    }
  }
  componentDidMount() {
    this.clearStocks();
    this.getAdjBinUsages();
    if (this.props.stockadj.entityUuid) {
      this.setState({
        currentView: CONFIRM_LEAVE_ACTION.EDIT
      })
      this.props.dispatch({
        type: 'stockadj/get',
        payload: { uuid: this.props.stockadj.entityUuid },
        // callback: response => {
        //   if (response && response.success && response.data) {
        //     if(response.data.billItems) {
        //       this.setState({
        //         entity: {billItems: response.data.billItems}
        //       })
        //     }
        //   }
        // }
      });
    }
  }
  getAdjBinUsages() {
    this.props.dispatch({
      type: 'stockadj/getBinUsagesByConfigType',
      payload: 'STOCKADJ'
    });
  }
  componentWillReceiveProps(nextProps) {
    const { stocks, entity } = this.state;
    const preType = nextProps.pretype;
    if (nextProps.entityUuid && !this.state.entity.uuid && nextProps.stockadj.entity) {
      this.setState({
        entity: nextProps.stockadj.entity,
        title: stockAdjBillLocale.title + ':' + nextProps.stockadj.entity.billNumber
      });
      const that = this;
      nextProps.stockadj.entity.billItems && nextProps.stockadj.entity.billItems.forEach(function (e) {
        that.getArticle(e.article.articleUuid);
        that.queryStocks(e.binCode, e.article.articleUuid, nextProps.stockadj.entity.wrh, nextProps.stockadj.entity.owner, e.line);
      });
    }
    if (nextProps.stock.data != this.props.stock.data) {
      this.setState({
        stockList: nextProps.stock.data
      });
    }
    if (nextProps.stock.stockLineMap) {
      this.setState({
        stockLineMap: nextProps.stock.stockLineMap
      });
    }
    if (nextProps.article.entity && nextProps.article.entity.uuid) {
      let articleMap = this.state.articleMap ? this.state.articleMap : new Map();
      this.setState({
        articleMap: articleMap.set(nextProps.article.entity.uuid, nextProps.article.entity)
      });
    }
    if (nextProps.stockadj.data && nextProps.stockadj.data.adjBinUsages) {
      this.setState({
        adjBinUsages: nextProps.stockadj.data.adjBinUsages
      });
    }
  }
  /**
   * 取消
   */
  onCancel = () => {
    this.props.dispatch({
      type: 'stockadj/showPage',
      payload: {
        showPage: 'query'
      }
    });
    this.setState({
      stocks: [],
      stocksList: [],
      entity: {}
    })
  }
  clearStocks = () => {
    this.props.dispatch({
      type: 'stock/clearStocks'
    });
  }
  onSave = (data) => {
    const newData = this.validData(data);
    if (!newData) {
      return;
    }
    let type = 'stockadj/onSave';
    if (newData.uuid) {
      type = 'stockadj/onModify';
    }
    newData.companyUuid = loginCompany().uuid;
    newData.dcUuid = loginOrg().uuid;
    if (newData.billItems.length > 0) {
      newData.billItems.map(item => {
        item.companyUuid = loginCompany().uuid;
        item.dcUuid = loginOrg().uuid;
      })
    }
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
    newData.companyUuid = loginCompany().uuid;
    newData.dcUuid = loginOrg().uuid;
    if (newData.billItems.length > 0) {
      newData.billItems.map(item => {
        item.companyUuid = loginCompany().uuid;
        item.dcUuid = loginOrg().uuid;
      })
    }
    this.props.dispatch({
      type: 'stockadj/onSaveAndAudit',
      payload: newData,
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.saveAndAuditSuccess);
        }
      }
    });
  }
  validData = (data) => {
    const { entity } = this.state;
    const newData = { ...entity };
    newData.adjer = JSON.parse(data.adjer);
    newData.reason = data.reason;
    newData.note = data.note;
    if (newData.billItems.length === 0) {
      message.error(notNullLocale(commonLocale.itemsLineLocale));
      return false;
    }
    for (let i = newData.billItems.length - 1; i >= 0; i--) {
      if (!newData.billItems[i].article) {
        message.error(`明细第${newData.billItems[i].line}行不能为空！`);
        return false;
      }
      if (AdjType.PRODUCTIONBATCH.name === entity.adjType) {
        let shelfLifeType = this.getArticleShelfLifeType(newData.billItems[i].article.articleUuid);
        if (NOCARE === shelfLifeType) {
          message.error(`明细第${newData.billItems[i].line}行商品不管理生产日期不能进行批号调整！`);
          return false;
        }
        if (PRODUCTDATE === shelfLifeType) {
          if (!newData.billItems[i].newProductionDate) {
            message.error(`明细第${newData.billItems[i].line}行新生产日期不能为空！`);
            return false;
          }
        }
        if (VALIDDATE === shelfLifeType) {
          if (!newData.billItems[i].newValidDate) {
            message.error(`明细第${newData.billItems[i].line}行新到效期不能为空！`);
            return false;
          }
        }
        newData.billItems[i].newProductionDate = formatDate(entity.billItems[i].newProductionDate, true);
        newData.billItems[i].newValidDate = formatDate(entity.billItems[i].newValidDate, true);
      }
      if (AdjType.VENDOR.name === entity.adjType) {
        if (!newData.billItems[i].newVendor) {
          message.error(`明细第${newData.billItems[i].line}行新供应商不能为空！`);
          return false;
        }
        if (newData.billItems[i].vendor.uuid === newData.billItems[i].newVendor.uuid) {
          message.error(`明细第${newData.billItems[i].line}行新供应商不能与原供应商一致！`);
          return false;
        }
      }
      if (newData.billItems[i].adjQty === 0) {
        message.error(`明细第${newData.billItems[i].line}行数量不能为0！`);
        return false;
      }
    }
    // for (let i = 0; i < newData.billItems.length; i++) {
    //   for (let j = i + 1; j < newData.billItems.length; j++) {
    //     if (newData.billItems[i].article.articleUuid === newData.billItems[j].article.articleUuid &&
    //       newData.billItems[i].binCode === newData.billItems[j].binCode &&
    //       newData.billItems[i].containerBarcode === newData.billItems[j].containerBarcode &&
    //       newData.billItems[i].productionBatch === newData.billItems[j].productionBatch &&
    //       newData.billItems[i].qpcStr === newData.billItems[j].qpcStr &&
    //       newData.billItems[i].vendor.uuid === newData.billItems[j].vendor.uuid) {
    //       message.error(`明细第${newData.billItems[i].line}行与第${newData.billItems[j].line}行重复！`);
    //       return false;
    //     }
    //   }
    // }
    return newData;
  }
  queryStocks = (binCode, articleUuid, wrh, owner, line) => {
    const { entity, stocks } = this.state;
    if (!wrh) {
      wrh = entity.wrh;
    }
    if (!owner) {
      owner = entity.owner;
    }
    if (!owner.uuid || !wrh.uuid) {
      return;
    }
    this.props.dispatch({
      type: 'stock/query',
      payload: {
        articleUuid: articleUuid,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        ownerUuid: owner.uuid,
        binCode: binCode,
        wrhUuid: wrh.uuid,
        state: "NORMAL",
        binUsages: this.state.adjBinUsages,
        line: line
      }
    });
  }
  onFormChange = (value, field) => {
    const { entity } = this.state;
    if (field === 'adjType') {
      entity.adjType = value;
    } else if (field === 'qpcStrAdjType') {
      entity.qpcStrAdjType = value;
    } else if (field === 'vendorAdjType') {
      entity.vendorAdjType = value;
    } else if (field === 'productionBatchAdjType') {
      entity.productionBatchAdjType = value;
    }
    this.setState({
      entity: { ...entity }
    });
  }
  onWrhChange = (value) => {
    const { entity } = this.state;
    if (!entity.wrh || entity.billItems.length === 0) {
      entity.wrh = JSON.parse(value);
      return;
    }
    if (entity.wrh.uuid != JSON.parse(value).uuid) {
      Modal.confirm({
        title: stockAdjBillLocale.wrhChangeModalMessage,
        okText: commonLocale.confirmLocale,
        cancelText: commonLocale.cancelLocale,
        onOk: () => {
          entity.wrh = JSON.parse(value);
          entity.billItems = [];
          this.props.form.setFieldsValue({
            wrh: value
          });
          this.clearStocks();
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
  onOwnerChange = (value) => {
    const { entity } = this.state;
    if (!entity.owner || entity.billItems.length === 0) {
      entity.owner = JSON.parse(value);
      return;
    }
    if (entity.owner.uuid != JSON.parse(value).uuid) {
      Modal.confirm({
        title: stockAdjBillLocale.ownerChangeModalMessage,
        okText: commonLocale.confirmLocale,
        cancelText: commonLocale.cancelLocale,
        onOk: () => {
          entity.owner = JSON.parse(value);
          entity.billItems = [];
          this.props.form.setFieldsValue({
            owner: value
          });
          this.clearStocks();
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
  onFieldChange = (value, field, index) => {
    const { entity } = this.state;
    if (field === 'binCode') {
      const binCodeUsage = JSON.parse(value);
      entity.billItems[index - 1].binCode = binCodeUsage.binCode;
      entity.billItems[index - 1].binUsage = binCodeUsage.binUsage;
      this.setState({
        binCode: binCodeUsage.code
      });
      this.handlebatchAddVisibleForStock();
    } else if (field === 'article') {
      const article = JSON.parse(value);
      entity.billItems[index - 1].manageBatch = undefined;
      this.props.dispatch({
        type: 'article/get',
        payload: {
          uuid: article.articleUuid
        },
        callback: response => {
          if (response && response.success) {
            if (response.data && response.data.manageBatch !== undefined)
              entity.billItems[index - 1].manageBatch = response.data;
            this.setState({
              entity: { ...entity }
            })
          }
        }
      });
      entity.billItems[index - 1].article = {
        articleUuid: article.articleUuid,
        articleCode: article.articleCode,
        articleName: article.articleName,
        articleSpec: article.articleSpec
      };
      entity.billItems[index - 1].containerBarcode = undefined;
      entity.billItems[index - 1].vendor = undefined;
      entity.billItems[index - 1].stock = undefined;
      entity.billItems[index - 1].productionDate = undefined;
      entity.billItems[index - 1].qpcStr = undefined;
      entity.billItems[index - 1].qtyStr = '0+0';
      entity.billItems[index - 1].qty = 0;
      entity.billItems[index - 1].adjQtyStr = '0+0';
      entity.billItems[index - 1].adjQty = 0;
      entity.billItems[index - 1].article.munit = undefined;
      entity.billItems[index - 1].shelfLifeType = undefined;
      const containerBarcodes = this.getContainerBarcodes(entity.billItems[index - 1]);
      if (containerBarcodes.length > 0) {
        entity.billItems[index - 1].containerBarcode = containerBarcodes[0];
      }
      const vendors = this.getVendors(entity.billItems[index - 1]);
      if (vendors.length > 0) {
        entity.billItems[index - 1].vendor = vendors[0];
      }
      const productionBatchs = this.getProductionBatchs(entity.billItems[index - 1]);
      if (productionBatchs.length > 0) {
        entity.billItems[index - 1].productionBatch = productionBatchs[0].productionBatch;
        entity.billItems[index - 1].productionDate = productionBatchs[0].productionDate;
        entity.billItems[index - 1].validDate = productionBatchs[0].validDate;
      }
      const qpcStrs = this.getQpcStrs(entity.billItems[index - 1]);
      const qtys = this.getStockQty(entity.billItems[index - 1]);
      if (qpcStrs.length > 0) {
        entity.billItems[index - 1].qpcStr = qpcStrs[0].qpcStr;
        entity.billItems[index - 1].article.munit = qpcStrs[0].munit;
        entity.billItems[index - 1].qpc = qpcStrs[0].qpc;
      }
      if (qtys.length > 0) {
        entity.billItems[index - 1].qty = qtys[0];

        entity.billItems[index - 1].qtyStr = toQtyStr(qtys[0], entity.billItems[index - 1].qpcStr);
        entity.billItems[index - 1].adjQty = qtys[0];
        entity.billItems[index - 1].adjQtyStr = toQtyStr(qtys[0], entity.billItems[index - 1].qpcStr);
      }
    } else if (field === 'containerBarcode') {
      entity.billItems[index - 1].containerBarcode = value;
      const vendors = this.getVendors(entity.billItems[index - 1]);
      if (vendors.length > 0) {
        entity.billItems[index - 1].vendor = vendors[0];
      }
      const productionBatchs = this.getProductionBatchs(entity.billItems[index - 1]);
      if (productionBatchs.length > 0) {
        entity.billItems[index - 1].productionBatch = productionBatchs[0].productionBatch;
        entity.billItems[index - 1].productionDate = productionBatchs[0].productionDate;
        entity.billItems[index - 1].validDate = productionBatchs[0].validDate;
      }
      const qpcStrs = this.getQpcStrs(entity.billItems[index - 1]);
      if (qpcStrs.length > 0) {
        entity.billItems[index - 1].qpcStr = qpcStrs[0].qpcStr;
        entity.billItems[index - 1].article.munit = qpcStrs[0].munit;
        entity.billItems[index - 1].qpc = qpcStrs[0].qpc;
      }
      entity.billItems[index - 1].qtyStr = toQtyStr(entity.billItems[index - 1].qty, entity.billItems[index - 1].qpcStr);
    } else if (field === 'vendor') {
      entity.billItems[index - 1].vendor = JSON.parse(value);
      const stocks = this.getProductionBatchs(entity.billItems[index - 1]);
      if (stocks.length > 0) {
        entity.billItems[index - 1].productionBatch = stocks[0].productionBatch;
        entity.billItems[index - 1].productionDate = stocks[0].productionDate;
        entity.billItems[index - 1].validDate = stocks[0].validDate;
      }
      const qpcStrs = this.getQpcStrs(entity.billItems[index - 1]);
      if (qpcStrs.length > 0) {
        entity.billItems[index - 1].qpcStr = qpcStrs[0].qpcStr;
        entity.billItems[index - 1].article.munit = qpcStrs[0].munit;
        entity.billItems[index - 1].qpc = qpcStrs[0].qpc;
      }
      entity.billItems[index - 1].qtyStr = toQtyStr(entity.billItems[index - 1].qty, entity.billItems[index - 1].qpcStr);
    } else if (field === 'productionBatch') {
      const product = JSON.parse(value);
      entity.billItems[index - 1].productionBatch = product.productionBatch;
      entity.billItems[index - 1].productionDate = product.productionDate;
      entity.billItems[index - 1].validDate = product.validDate;
      const qpcStrs = this.getQpcStrs(entity.billItems[index - 1]);
      if (qpcStrs.length > 0) {
        entity.billItems[index - 1].qpcStr = qpcStrs[0].qpcStr;
        entity.billItems[index - 1].article.munit = qpcStrs[0].munit;
        entity.billItems[index - 1].qpc = qpcStrs[0].qpc;
      }
      entity.billItems[index - 1].qtyStr = toQtyStr(entity.billItems[index - 1].qty, entity.billItems[index - 1].qpcStr);
    } else if (field === 'qpcStr') {
      const qpcStrMunit = JSON.parse(value);
      entity.billItems[index - 1].qpcStr = qpcStrMunit.qpcStr;
      entity.billItems[index - 1].article.munit = qpcStrMunit.munit;
      entity.billItems[index - 1].qtyStr = toQtyStr(entity.billItems[index - 1].qty, entity.billItems[index - 1].qpcStr);
      entity.billItems[index - 1].qty = qtyStrToQty(value.toString(), entity.billItems[index - 1].qpcStr);
      entity.billItems[index - 1].adjQtyStr = toQtyStr(entity.billItems[index - 1].qty, entity.billItems[index - 1].qpcStr);
      entity.billItems[index - 1].adjQty = qtyStrToQty(value.toString(), entity.billItems[index - 1].qpcStr);
    } else if (field === 'adjQtyStr') {
      entity.billItems[index - 1].adjQtyStr = value;
      entity.billItems[index - 1].adjQty = qtyStrToQty(value.toString(), entity.billItems[index - 1].qpcStr);
      var allQty = 0;
      var arr = [];
      var temp = entity.billItems[index - 1].uuid;
      for (let i = 0; i < entity.billItems.length; i++) {
        if (entity.billItems[i].uuid === temp) {
          arr.push(entity.billItems[i])
        }
      }
      arr.map(item => {
        if (!item.qty) {
          item.qty = 0;
        }
        if (!item.qtyStr) {
          item.qtyStr = 0;
        }
        allQty = allQty + parseFloat(item.adjQty);
      })
      if (allQty > entity.billItems[index - 1].qty) {
        entity.billItems[index - 1].adjQtyStr = '0+0';
        entity.billItems[index - 1].adjQty = 0;
        message.error('调整数量大于库存数量');
        return false;
      }
    } else if (field === 'newProductionDate' && value) {
      let article = this.state.articleMap.get(entity.billItems[index - 1].article.articleUuid);
      const newProductionDate = value.startOf('day');
      const newValidDate = moment(value).add(article.shelfLifeDays, 'days');
      entity.billItems[index - 1].newProductionDate = newProductionDate;
      entity.billItems[index - 1].newValidDate = newValidDate;
      entity.billItems[index - 1].newProductionBatch = moment(newProductionDate).format('YYYYMMDD')
    } else if (field === 'newValidDate' && value) {
      let article = this.state.articleMap.get(entity.billItems[index - 1].article.articleUuid);
      const newValidDate = value.startOf('day');
      const newProductionDate = moment(value).add(-article.shelfLifeDays, 'days');
      entity.billItems[index - 1].newProductionDate = newProductionDate;
      entity.billItems[index - 1].newValidDate = newValidDate;
      entity.billItems[index - 1].newProductionBatch = moment(newProductionDate).format('YYYYMMDD')
    } else if (field === 'newVendor' && value) {
      let newVendor = JSON.parse(value);
      entity.billItems[index - 1].newVendor = newVendor;
    } else if (field === 'newProductionBatch' && value) {
      entity.billItems[index - 1].newProductionBatch = value.target.value;
    }
    this.setState({
      entity: { ...entity }
    });
  }
  getBinCodes = (record) => {
    const { stockLineMap } = this.state;
    let binCodeUsages = [];
    let binCodes = [];
    let stocks = stockLineMap.get(record.line);
    if (!record.article || !record.line || !stocks) {
      return binCodeUsages;
    }
    stocks.forEach(e => {
      if (e.article.articleUuid === record.article.articleUuid && binCodes.indexOf(e.binCode) < 0) {
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
    const { stockLineMap } = this.state;
    let containerBarcodes = [];
    let stocks = stockLineMap.get(record.line);
    if (!record.article || !record.line || !stocks) {
      return containerBarcodes;
    }
    stocks.forEach(e => {
      if (e.article.articleUuid === record.article.articleUuid && e.binCode === record.binCode && containerBarcodes.indexOf(e.containerBarcode) < 0) {
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
    const { stockLineMap } = this.state;
    let vendors = [];
    let stocks = stockLineMap.get(record.line);
    if (!record.article || !record.line || !stocks) {
      return vendors;
    }
    let vendorUuids = [];
    stocks.forEach(e => {
      if (e.article.articleUuid === record.article.articleUuid && e.binCode === record.binCode
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
    const { stockLineMap } = this.state;
    let stocks = stockLineMap.get(record.line);
    let productionBatchs = [];
    if (!record.article || !record.line || !stocks) {
      return productionBatchs;
    }
    let ps = [];
    stocks.forEach(e => {
      if (e.article.articleUuid === record.article.articleUuid && e.binCode === record.binCode &&
        e.containerBarcode === record.containerBarcode &&
        e.vendor.uuid === record.vendor.uuid && ps.indexOf(e.productionBatch) < 0) {
        ps.push(e.productionBatch);
        productionBatchs.push({
          productionBatch: e.productionBatch,
          productionDate: e.productionDate,
          validDate: e.validDate
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
    const { stockLineMap } = this.state;
    let stocks = stockLineMap.get(record.line);
    let qpcStrs = [];
    let qpcMunits = [];
    if (!record.article || !record.line || !stocks) {
      return qpcMunits;
    }
    stocks.forEach(e => {
      if (e.article.articleUuid === record.article.articleUuid && e.binCode === record.binCode &&
        e.containerBarcode === record.containerBarcode && e.vendor.uuid === record.vendor.uuid
        && e.productionBatch === record.productionBatch
        && e.stock === record.stock && qpcStrs.indexOf(e.qpcStr) < 0) {
        qpcStrs.push(e.qpcStr);
        qpcMunits.push({
          qpcStr: e.qpcStr,
          munit: e.munit,
          qpc: e.qpc
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
  disabledProductDate(current) {
    return current > moment().endOf('day');
  }
  disabledValidDate(current) {
    return current && current < moment().add(-1, 'days').endOf('day');
  }
  getArticle(articleUuid) {
    const { articleMap } = this.state;
    if (!articleUuid)
      return;
    if (articleMap && articleMap.size > 0 && articleMap.get(articleUuid))
      return;
    this.props.dispatch({
      type: 'article/get',
      payload: {
        uuid: articleUuid
      },
      callback: response => {
        if (response && response.success) {
          if (response.data && response.data.manageBatch !== undefined) {
            this.setState({
              selectData: response.data.manageBatch
            })
          }
        }
      }
    });
  }
  getNewVendors(articleUuid) {
    if (!articleUuid)
      return;
    const { articleMap } = this.state;
    let newVendors = [];
    let article = articleMap.get(articleUuid);
    if (!article)
      return newVendors;
    article.vendors && article.vendors.forEach(function (articleVendor) {
      newVendors.push(articleVendor.vendor);
    });
    return newVendors;
  }
  getNewVendorOptions(articleUuid) {
    if (!articleUuid)
      return;
    let newVendorOptions = [];
    let newVendors = this.getNewVendors(articleUuid);
    if (!newVendors)
      return newVendorOptions;
    newVendors.forEach(e => {
      newVendorOptions.push(
        <Select.Option key={e.uuid} value={JSON.stringify(e)}>
          {convertCodeName(e)}
        </Select.Option>
      );
    });
    return newVendorOptions;
  }
  getArticleShelfLifeType(articleUuid) {
    const { articleMap } = this.state;
    let article = articleMap.get(articleUuid);
    if (!article)
      return NOCARE;
    return article.shelfLifeType;
  }
  getStockQty = (record) => {
    const { stockLineMap } = this.state;
    let stocks = stockLineMap.get(record.line);
    let qtys = [];
    if (!record.article || !record.line || !stocks) {
      return qtys;
    }
    stocks.forEach(e => {
      if (e.article.articleUuid === record.article.articleUuid && e.binCode === record.binCode &&
        e.containerBarcode === record.containerBarcode && e.vendor.uuid === record.vendor.uuid
        && e.productionBatch === record.productionBatch
        && e.stock === record.stock) {
        qtys.push(e.qty);
      }
    });
    return qtys;
  }
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;
    let cols = [
      <CFormItem label={stockAdjBillLocale.adjType} key='adjType'>
        {getFieldDecorator('adjType', {
          initialValue: entity.adjType,
          rules: [
            { required: true, message: notNullLocale(stockAdjBillLocale.adjType) }
          ],
        })(
          <Select placeholder={placeholderChooseLocale(stockAdjBillLocale.adjType)}
            onChange={e => this.onFormChange(e, 'adjType')}>
            {typeOptions}
          </Select>)}
      </CFormItem>,
      <CFormItem label={stockAdjBillLocale.adjer} key='adjer'>
        {getFieldDecorator('adjer', {
          initialValue: JSON.stringify(entity.adjer),
          rules: [
            { required: true, message: notNullLocale(stockAdjBillLocale.adjer) }
          ],
        })(<UserSelect autoFocus single={true} />)}
      </CFormItem>,
      <CFormItem key='reason' label={stockAdjBillLocale.reason}>
        {
          getFieldDecorator('reason', {
            rules: [
              { required: true, message: notNullLocale(stockAdjBillLocale.reason) },
            ],
            initialValue: entity.reason,
          })(
            <PreTypeSelect
              placeholder={placeholderChooseLocale(stockAdjBillLocale.reason)}
              preType={PRETYPE.stockAdjReason} />
          )
        }
      </CFormItem>,
      <CFormItem label={commonLocale.inWrhLocale} key='wrh'>
        {getFieldDecorator('wrh', {
          initialValue: entity.wrh ? JSON.stringify(entity.wrh) : undefined,
          rules: [
            { required: true, message: notNullLocale(commonLocale.inWrhLocale) }
          ],
        })(<WrhSelect onlyOnline placeholder={placeholderChooseLocale(commonLocale.inWrhLocale)} onChange={this.onWrhChange} />)}
      </CFormItem>,
      <CFormItem label={commonLocale.inOwnerLocale} key='owner'>
        {getFieldDecorator('owner', {
          initialValue: entity.owner ? JSON.stringify(entity.owner) : undefined,
          rules: [
            { required: true, message: notNullLocale(commonLocale.inOwnerLocale) }
          ],
        })(<OwnerSelect onlyOnline placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} onChange={this.onOwnerChange} />)}
      </CFormItem>
    ];
    if (entity.adjType && AdjType.STOCKBATCHMERGE.name === entity.adjType) {
      cols.push(
        <CFormItem label={stockAdjBillLocale.qpcStrAdjType} key='qpcStrAdjType'>
          {getFieldDecorator('qpcStrAdjType', {
            initialValue: entity.qpcStrAdjType,
            rules: [
              { required: true, message: notNullLocale(stockAdjBillLocale.qpcStrAdjType) }
            ],
          })(
            <Select placeholder={placeholderChooseLocale(stockAdjBillLocale.qpcStrAdjType)}
              onChange={e => this.onFormChange(e, 'qpcStrAdjType')}>
              {qpcStrAdjTypeOptions}
            </Select>)}
        </CFormItem>,
      );
      cols.push(
        <CFormItem label={stockAdjBillLocale.vendorAdjType} key='vendorAdjType'>
          {getFieldDecorator('vendorAdjType', {
            initialValue: entity.vendorAdjType,
            rules: [
              { required: true, message: notNullLocale(stockAdjBillLocale.vendorAdjType) }
            ],
          })(
            <Select placeholder={placeholderChooseLocale(stockAdjBillLocale.vendorAdjType)}
              onChange={e => this.onFormChange(e, 'vendorAdjType')}>
              {vendorAdjTypeOptions}
            </Select>)}
        </CFormItem>
      );
      cols.push(
        <CFormItem label={stockAdjBillLocale.productionBatchAdjType} key='productionBatchAdjType'>
          {getFieldDecorator('productionBatchAdjType', {
            initialValue: entity.productionBatchAdjType,
            rules: [
              { required: true, message: notNullLocale(stockAdjBillLocale.productionBatchAdjType) }
            ],
          })(
            <Select placeholder={placeholderChooseLocale(stockAdjBillLocale.productionBatchAdjType)}
              onChange={e => this.onFormChange(e, 'productionBatchAdjType')}>
              {productionBatchAdjTypeOptions}
            </Select>)}
        </CFormItem>
      );
    }
    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={cols} noteCol={this.drawNotePanel()} noteNotOneCol noteLabelSpan={4} />
    ];
  }
  /**
   * 绘制按钮
   */
  drawBatchButton = () => {
    return (
      <span>
        <a onClick={() => this.handlebatchAddVisible()}>批量添加</a>
      </span>
    )
  }
  tableChange = (pagination, filtersArg, sorter) => {
    const { pageFilter } = this.state;
    pageFilter.searchKeyValues.page = pagination.current - 1;
    pageFilter.searchKeyValues.pageSize = pagination.pageSize;
    this.setState({
      pageFilter: pageFilter
    })
    this.refreshTable();
  }
  /**搜索*/
  onSearch = (data) => {
    const { entity, stocks } = this.state;
    let wrhUuid = entity.wrh ? entity.wrh.uuid : undefined;
    let ownerUuid = entity.owner ? entity.owner.uuid : undefined;
    if (!ownerUuid || !wrhUuid) {
      return;
    }
    if (data) {
      data.articleCodeOrNameLike = data.articleCodeName;
    }
    const { pageFilter } = this.state;
    pageFilter.searchKeyValues = {
      ...pageFilter.searchKeyValues,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      state: stockState.NORMAL.name,
      binUsages: this.state.adjBinUsages,
      wrhUuid: wrhUuid,
      ownerUuid: ownerUuid,
      ...data
    }
    this.refreshTable();
  }
  refreshTable = () => {
    this.props.dispatch({
      type: 'stock/pageQuery',
      payload: { ...this.state.pageFilter.searchKeyValues }
    });
  };
  /**获取批量增加的集合*/
  getItemList = (value) => {
    const { entity } = this.state;
    var newList = [];
    for (let i = 0; i < value.length; i++) {
      if (entity.billItems && entity.billItems.find(function (item) {
        return item.article && item.article.articleUuid === value[i].article.articleUuid && item.binCode === value[i].binCode &&
          item.containerBarcode === value[i].containerBarcode && item.vendor.uuid === value[i].vendor.uuid &&
          item.stock === value[i].stock
          && item.qpcStr === value[i].qpcStr && item.manageBatch === value[i].manageBatch
      }) === undefined) {
        let temp = { ...value[i] };
        this.getArticle(temp.article.articleUuid);
        newList.push(temp);
      }
    }
    this.state.line = entity.billItems.length + 1;
    newList.map(item => {
      item.line = this.state.line;
      this.state.line++;
    });
    entity.billItems = [...entity.billItems, ...newList];
    this.setState({
      entity: { ...entity }
    })
  }
  /** 批量添加弹出框*/
  handlebatchAddVisible = () => {
    this.setState({
      batchAddVisible: !this.state.batchAddVisible
    })
  }
  /**获取批量增加的集合*/
  getItemListForStock = (value) => {
    const { entity } = this.state;
    if (value) {
      for (let i = 0; i < value.length; i++) {
        let qty = 0
        for (let j = 0; j < entity.billItems.length; j++) {
          if (value[i].uuid === entity.billItems[j].uuid) {
            qty += entity.billItems[j].adjQty
          }
        }
        value[i].adjQty = value[i].qty - qty
        value[i].adjQtyStr = toQtyStr(value[i].adjQty, value[i].qpcStr);
      }
      let arr = [...entity.billItems, ...value];
      // 去除空数组
      let newArr = [];
      arr.forEach((item, index) => {
        if (item.binCode) {
          item.line = index;
          this.getArticle(item.article.articleUuid);
          newArr.push(item)
        }
      })
      newArr.forEach((item, index) => {
        item.line = index + 1;
      })
      entity.billItems = newArr
    }

    this.handlebatchAddVisibleForStock();
    this.setState({
      entity: { ...entity }
    })
  }
  /**
   * 批量添加库存明细弹出框
   */
  handlebatchAddVisibleForStock = () => {
    this.setState({
      addStockDtl: !this.state.addStockDtl
    });
  }
  drawTable = () => {
    const { entity, addStockDtl, binCode } = this.state;
    let columns = [
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
            <IncBinSelect
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
        width: itemColWidth.articleEditColWidth,
        render: record => {
          return (
            <StockAdjArticleSelect
              value={record.article ? JSON.stringify({
                articleUuid: record.article.articleUuid,
                articleCode: record.article.articleCode,
                articleName: record.article.articleName,
                articleSpec: record.article.articleSpec
              }) : undefined}
              ownerUuid={entity.owner ? entity.owner.uuid : undefined}
              wrhUuid={entity.wrh ? entity.wrh.uuid : undefined}
              binCode={binCode ? binCode : undefined}
              placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
              onChange={e => this.onFieldChange(e, 'article', record.line)}
              showSearch={true}
              line={record.line}
              adjBinUsages={this.state.adjBinUsages}
            />
          );
        }
      },
      {
        title: commonLocale.inBinUsageLocale,
        key: 'binUsage',
        width: colWidth.enumColWidth,
        render: (record) => record && record.binUsage ? <EllipsisCol colValue={getUsageCaption(record.binUsage)} /> : <Empty />
      },
      {
        title: commonLocale.containerLocale,
        key: 'containerBarcode',
        width: itemColWidth.containerEditColWidth,
        render: record => {
          return (
            <Select
              value={record.containerBarcode}
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
        title: commonLocale.inProductionBatchLocale,
        key: 'productionBatch',
        width: itemColWidth.dateEditColWidth,
        render: record => {
          let value;
          if (record.productionBatch) {
            value = record.productionBatch;
          } else {
            if (this.getProductionBatchs(record).length > 0) {
              record.productionBatch = this.getProductionBatchs(record)[0].productionBatch;
              record.productionDate = this.getProductionBatchs(record)[0].productionDate;
              record.validDate = this.getProductionBatchs(record)[0].validDate;
              value = JSON.stringify(this.getProductionBatchs(record)[0]);
            }
          }
          return (
            <Select
              value={value}
              placeholder={placeholderChooseLocale(commonLocale.stockLocale)}
              onChange={e => this.onFieldChange(e, 'productionBatch', record.line)}
            >
              {this.getProductionBatchOptions(record)}
            </Select>
          );
        }
      },
      {
        title: commonLocale.productionDateLocale,
        key: 'productionDate',
        width: itemColWidth.dateEditColWidth + 20,
        render: record => {
          return (
            <span>{record.productionDate ? convertDate(record.productionDate) : <Empty />}</span>
          );
        }
      },
      {
        title: commonLocale.validDateLocale,
        key: 'validDate',
        width: itemColWidth.dateEditColWidth,
        render: record => {
          return (
            <span>{record.validDate ? convertDate(record.validDate) : <Empty />}</span>
          );
        }
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        key: 'qpcStr',
        render: (record) => {
          let value;
          if (record.qpcStr && record.article) {
            value = record.qpcStr + "/" + record.article.munit;
          } else {
            if (this.getQpcStrs(record).length > 0) {
              record.qpcStr = this.getQpcStrs(record)[0].qpcStr;
              record.article.munit = this.getQpcStrs(record)[0].munit;
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
        title: commonLocale.caseQtyStrLocale,
        key: 'qtyStr',
        width: itemColWidth.qtyStrColWidth,
        render: (record) => {
          if (record.article && record.binCode && !record.qtyStr && record.qty) {
            record.qtyStr = toQtyStr(record.qty, record.qpcStr);
          }
          return (
            <span>{record.qtyStr ? record.qtyStr : '0+0'}</span>
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
      {
        title: stockAdjBillLocale.adjQtyStr,
        key: 'adjQtyStr',
        width: itemColWidth.qtyStrColWidth,
        render: (record) => {
          if (record.article && record.binCode && !record.qtyStr && record.qty) {
            record.adjQtyStr = toQtyStr(record.adjQty, record.qpcStr);
          }
          return (
            <QtyStrInput
              value={record.adjQtyStr ? record.adjQtyStr : record.qtyStr ? record.qtyStr : '0+0'}
              onChange={
                e => this.onFieldChange(e, 'adjQtyStr', record.line)
              }
            />
          );
        }
      },
      {
        title: stockAdjBillLocale.adjQty,
        key: 'adjQty',
        width: itemColWidth.qtyColWidth - 50,
        render: (record) => {
          return <span>{record.adjQty ? record.adjQty : record.qty ? record.qty : 0}</span>
        }
      }
    ];
    if (AdjType.PRODUCTIONBATCH.name === entity.adjType) {
      columns.push(
        {
          title: stockAdjBillLocale.newProductionDate,
          dataIndex: 'newProductionDate',
          key: 'newProductionDate',
          width: itemColWidth.dateEditColWidth,
          render: (value, record) => {
            let shelfLifeType = this.getArticleShelfLifeType(record.article ? record.article.articleUuid : null);
            if (PRODUCTDATE === shelfLifeType) {
              return (
                <DatePicker
                  disabledDate={this.disabledProductDate}
                  value={value ? moment(value) : null} allowClear={false}
                  onChange={(e) => this.onFieldChange(e, 'newProductionDate', record.line)} />
              );
            } else if (NOCARE === shelfLifeType) {
              return (<span>{DEFAULTDATE}</span>);
            } else {
              return (
                <span>{record.newProductionDate ? convertDate(record.newProductionDate) : <Empty />}</span>
              );
            }
          }
        }
      );
      columns.push(
        {
          title: stockAdjBillLocale.newValidDate,
          dataIndex: 'newValidDate',
          key: 'newValidDate',
          width: itemColWidth.dateEditColWidth,
          render: (value, record) => {
            let shelfLifeType = this.getArticleShelfLifeType(record.article ? record.article.articleUuid : null);
            if (VALIDDATE === shelfLifeType) {
              return (
                <DatePicker
                  disabledDate={this.disabledValidDate}
                  value={value ? moment(value) : null} allowClear={false}
                  onChange={(e) => this.onFieldChange(e, 'newValidDate', record.line)} />
              );
            } else if (NOCARE === shelfLifeType) {
              return (<span>{DEFAULTDATE}</span>);
            } else {
              return (
                <span>{record.newValidDate ? convertDate(record.newValidDate) : <Empty />}</span>
              );
            }
          }
        }
      );
      columns.push(
        {
          title: '新批号',
          dataIndex: 'newProductionBatch',
          key: 'newProductionBatch',
          width: itemColWidth.dateEditColWidth,
          render: (value, record) => {
            let shelfLifeType = this.getArticleShelfLifeType(record.article ? record.article.articleUuid : null);
            if (PRODUCTDATE === shelfLifeType || VALIDDATE === shelfLifeType) {
              return (
                <Input
                  disabled={!record.manageBatch}
                  value={record && record.newProductionBatch ? record.newProductionBatch : null}
                  placeholder={placeholderLocale('新批号')}
                  onChange={e => this.onFieldChange(e, 'newProductionBatch', record.line)}
                />
              );
            } else {
              return (
                <span>{record && record.newProductionBatch ? record.newProductionBatch : DEFAULTDATE}</span>
              );
            }
          }
        }
      );
    } else if (AdjType.VENDOR.name === entity.adjType) {
      columns.push(
        {
          title: stockAdjBillLocale.newVendor,
          key: 'newVendor',
          width: itemColWidth.articleEditColWidth,
          render: record => {
            let value;
            if (record.vendor) {
              value = convertCodeName(record.newVendor);
            } else {
              if (this.state.newVendors) {
                record.vendor = this.state.newVendors[0];
                value = JSON.stringify(record.vendor);
              }
            }
            return (
              <Select
                value={value}
                placeholder={placeholderChooseLocale(stockAdjBillLocale.newVendor)}
                onFocus={() => this.getNewVendors(record.article ? record.article.articleUuid : null)}
                onChange={e => this.onFieldChange(e, 'newVendor', record.line)}
              >
                {this.getNewVendorOptions(record.article ? record.article.articleUuid : null)}
              </Select>
            );
          }
        }
      );
    }
    let batchQueryResultColumns = [
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        dataIndex: 'article',
        width: colWidth.codeNameColWidth,
        render: (val) => <EllipsisCol colValue={`[${val.articleCode}]${val.articleName}`} />
      },
      {
        title: commonLocale.bincodeLocale,
        key: 'binCode',
        dataIndex: 'binCode',
        width: colWidth.codeColWidth
      },
      {
        title: commonLocale.inBinUsageLocale,
        key: 'binUsage',
        dataIndex: 'binUsage',
        width: colWidth.codeColWidth,
        render: (text) => text ? <EllipsisCol colValue={getUsageCaption(text)} /> : <Empty />
      },
      {
        title: commonLocale.containerLocale,
        dataIndex: 'containerBarcode',
        key: 'containerBarcode',
        width: itemColWidth.containerEditColWidth,
      },
      {
        title: commonLocale.vendorLocale,
        key: 'vendor',
        dataIndex: 'vendor',
        render: val => <EllipsisCol colValue={convertCodeName(val)} />,
        width: colWidth.codeNameColWidth,
      },
      {
        title: commonLocale.inProductionBatchLocale,
        key: 'productionBatch',
        dataIndex: 'productionBatch',
        width: itemColWidth.numberEditColWidth + 40,
        render: (text) => text ? <EllipsisCol colValue={text} /> : <Empty />
      },
      {
        title: commonLocale.productionDateLocale,
        key: 'productionDate',
        width: colWidth.dateColWidth,
        dataIndex: 'productionDate',
        render: val => {
          return (
            <span>{val ? convertDate(val) : <Empty />}</span>
          );
        }
      },
      {
        title: commonLocale.qpcStrLocale,
        key: 'qpcStr',
        dataIndex: 'qpcStr',
        width: itemColWidth.qpcStrColWidth,
      }
    ];
    return (
      <div>
        <ItemEditTable
          title={commonLocale.inArticleInfoLocale}
          columns={columns}
          data={this.state.entity.billItems ? this.state.entity.billItems : []}
          drawBatchButton={this.drawBatchButton}
          drawTotalInfo={this.drawTotalInfo}
        />
        <PanelItemBatchAdd
          searchPanel={<SearchFormItemBatchAdd refresh={this.onSearch} fieldsValue={''} />}
          visible={this.state.batchAddVisible}
          columns={batchQueryResultColumns}
          data={this.state.stockList}
          handlebatchAddVisible={this.handlebatchAddVisible}
          getSeletedItems={this.getItemList}
          onChange={this.tableChange}
          width={'90%'}
        />
        <ItemBatchAddModal
          visible={addStockDtl}
          binCode={binCode}
          ownerUuid={entity.owner && entity.owner.uuid ? entity.owner.uuid : ''}
          wrhUuid={entity.wrh && entity.wrh.uuid ? entity.wrh.uuid : ''}
          getItemList={this.getItemListForStock}
          handleCancel={this.handlebatchAddVisibleForStock}
        />
      </div>
    )
  }
}
