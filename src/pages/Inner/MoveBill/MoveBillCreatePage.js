import { connect } from 'dva';
import moment from 'moment';
import { Select, Form, message, Modal } from 'antd';
import CreatePage from '@/pages/Component/Page/CreatePage';
import CFormItem from '@/pages/Component/Form/CFormItem';
import FormPanel from '@/pages/Component/Form/FormPanel';
import UserSelect from '@/pages/Component/Select/UserSelect';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
// import ItemEditTable from './ItemEditTable';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import PreTypeSelect from './PreTypeSelect';
import {
  commonLocale, notNullLocale, placeholderChooseLocale,
  placeholderLocale
} from '@/utils/CommonLocale';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import { stockState } from '@/utils/StockState';
import { binUsage, getUsageCaption } from '@/utils/BinUsage';
import { binState, getStateCaption } from '@/utils/BinState';
import { toQtyStr, qtyStrToQty, add, accAdd, accMul } from '@/utils/QpcStrUtil';
import { convertCodeName, convertDate } from '@/utils/utils';
import { PRETYPE } from '@/utils/constants';
import { lockType } from './MoveBillContants';
import { moveBillLocale } from './MoveBillLocale';
import MoveArticleSelect from './MoveArticleSelect';
import MoveFromContainerSelect from './MoveFromContainerSelect';
import MoveToBinSelect from './MoveToBinSelect';
import MoveToContainerSelect from './MoveToContainerSelect';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import Empty from '@/pages/Component/Form/Empty';
import PanelItemBatchAdd from '@/pages/Component/Form/PanelItemBatchAdd';
import SearchFormItemBatchAdd from './SearchFormItemBatchAdd';
import ItemBatchAddModal from './ItemBatchAddModal';
import IncBinSelect from '../Inc/IncBinSelect';
import TargetContainerModal from './TargetContainerModal';
import TargetBinModal from './TargetBinModal';
import { Type } from '../../Rtn/StoreRtn/StoreRtnBillContants';
@connect(({ movebill, pickSchema, stock, pretype, moveruleConfig, loading }) => ({
  movebill,
  pickSchema,
  stock,
  moveruleConfig,
  pretype,
  loading: loading.models.movebill,
}))
@Form.create()
export default class MoveBillCreatePage extends CreatePage {
  constructor(props) {
    super(props);
    this.state = {
      title: commonLocale.createLocale + moveBillLocale.title,
      currentView: CONFIRM_LEAVE_ACTION.NEW,
      auditButton: true,
      stockLineMap: new Map(),
      toBinUsages: [],
      entity: {
        mover: {
          uuid: loginUser().uuid,
          code: loginUser().code,
          name: loginUser().name
        },
        billItems: []  //在明细行中增加stock属性，用来拼货品和容器的下拉框，每次库存有改变时更新这个值
      },
      //批量添加
      batchAddVisible: false,
      addStockDtl: false,
      containerModalVisible: false,
      BinModalVisible: false,
      stockList: {
        list:[]
      },
      theOnlyStock: undefined,
      schemaList: [],
      pageFilter: {
        searchKeyValues: {
          page: 0,
          pageSize:20,
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        }
      },
      auditPermission:"iwms.inner.moveBill.audit"
    }
  }
  componentDidMount() {
    this.clearStocks();
    if (this.props.movebill.entityUuid) {
      this.setState({
        currentView: CONFIRM_LEAVE_ACTION.EDIT
      })
      this.props.dispatch({
        type: 'movebill/get',
        payload: this.props.movebill.entityUuid
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    const { stocks, entity, toBinUsages } = this.state;
    const preType = nextProps.pretype;
    if (nextProps.movebill.entity.uuid && !this.state.entity.uuid &&
      nextProps.movebill.entity != this.props.movebill.entity) {
      this.setState({
        entity: nextProps.movebill.entity,
        title: moveBillLocale.title + ':' + nextProps.movebill.entity.billNumber
      });
    }
    if (nextProps.stock.stockLineMap) {
      this.setState({
        stockLineMap: nextProps.stock.stockLineMap
      });
    }
    if (nextProps.moveruleConfig.toBinUsages) {
      this.setState({
        toBinUsages: nextProps.moveruleConfig.toBinUsages
      });
    }
    if (nextProps.pickSchema.schemaList && nextProps.pickSchema.schemaList != this.props.pickSchema.schemaList) {
      this.setState({
        schemaList: [...nextProps.pickSchema.schemaList]
      })
    }
  }
  /**
   * 取消
   */
  onCancel = () => {
    this.props.dispatch({
      type: 'movebill/showPage',
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
    let type = 'movebill/onSave';
    if (newData.uuid) {
      type = 'movebill/onModify';
    }
    newData.companyUuid = loginCompany().uuid;
    newData.dcUuid = loginOrg().uuid;
    if (newData.billItems.length > 0) {
      newData.billItems.map(item => {
        item.companyUuid = loginCompany().uuid;
        item.dcUuid = loginOrg().uuid;
        delete item.stocks;
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
        delete item.stocks;
      })
    }
    delete newData.stocks;
    this.props.dispatch({
      type: 'movebill/onSaveAndAudit',
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
    newData.mover = JSON.parse(data.mover);
    newData.type = data.type;
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
      if (newData.type != '点数移库' && newData.billItems[i].article && newData.billItems[i].qty === 0) {
        message.error(`明细第${newData.billItems[i].line}行移库数量不能为0！`);
        return false;
      }
      if (newData.billItems[i].article && !newData.billItems[i].toBinCode) {
        message.error(`明细第${newData.billItems[i].line}行移库目标货位不能为空！`);
        return false;
      }
      if (newData.billItems[i].article && !newData.billItems[i].toContainerBarcode) {
        message.error(`明细第${newData.billItems[i].line}行移库目标容器不能为空！`);
        return false;
      }
    }
    for (let i = 0; i < newData.billItems.length; i++) {
      for (let j = i + 1; j < newData.billItems.length; j++) {
        if (newData.billItems[i].article.articleUuid === newData.billItems[j].article.articleUuid &&
          newData.billItems[i].fromBinCode === newData.billItems[j].fromBinCode &&
          newData.billItems[i].fromContainerBarcode === newData.billItems[j].fromContainerBarcode &&
          newData.billItems[i].toBinCode === newData.billItems[j].toBinCode &&
          newData.billItems[i].toContainerBarcode === newData.billItems[j].toContainerBarcode &&
          newData.billItems[i].productionBatch === newData.billItems[j].productionBatch &&
          newData.billItems[i].qpcStr === newData.billItems[j].qpcStr &&
          newData.billItems[i].vendor.uuid === newData.billItems[j].vendor.uuid &&
          newData.billItems[i].newProductionDate === newData.billItems[j].newProductionDate &&
          newData.billItems[i].newProductionBatch === newData.billItems[j].newProductionBatch &&
          newData.billItems[i].newValidDate === newData.billItems[j].newValidDate
        ) {
          message.error(`明细第${newData.billItems[i].line}行与第${newData.billItems[j].line}行重复！`);
          return false;
        }
      }
    }
    return newData;
  }
  handleStocksChanged = (stocks, trigger, line, callback) => {
    let { entity } = this.state;
    entity.billItems[line - 1].stocks = stocks;
    //只有一笔库存时，取出来并显示
    if (stocks && stocks.length == 1) {
      this.getTheOnlyStock(stocks, line);
    } else if (!stocks || !Array.isArray(stocks) || stocks.length == 0) {
      if (callback)  
        callback();  //没库存时新增行
    }else{
      //多行明细时
      if (trigger == "binCode"){
        this.setState({
          binCode: entity.billItems[line - 1].fromBinCode,
          entity: entity,      
        });     
        this.handlebatchAddVisibleForStock();  //显示批量选择页
      }else{
        this.setState({
          entity: entity,
        })
      }  
    }
  }
  queryStocks = (binCode, articleUuid, fromContainerBarcode, ownerUuid, wrhUuid, line, callback, trigger) => {
    const { entity } = this.state;
    if (!ownerUuid && entity.owner) {
      ownerUuid = entity.owner.uuid;
    }
    if (!wrhUuid && entity.fromWrh) {
      wrhUuid = entity.fromWrh.uuid;
    }
    if (!ownerUuid || !wrhUuid) {
      return;
    }

    this.props.dispatch({
      type: 'stock/queryGroupedStock',
      payload: {
        articleUuid: articleUuid,
        containerBarcode: fromContainerBarcode,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        state: stockState.NORMAL.name,
        ownerUuid: ownerUuid,
        binCode: binCode,
        wrhUuid: wrhUuid,
        line: line
      }, callback: (response) => {
        if (response && response.success) {
          this.handleStocksChanged(response.data, trigger, line, callback);          
        }
      }
    });
  }
  //取出唯一一笔库存
  getTheOnlyStock = (stocks, line) => {
    const { entity } = this.state;
    let theOnlyStock = stocks[0];
    //给当前行赋值
    entity.billItems[line - 1] = theOnlyStock;
    entity.billItems[line - 1].line = line;
    entity.billItems[line - 1].fromBinCode = theOnlyStock.binCode;
    entity.billItems[line - 1].fromContainerBarcode = theOnlyStock.containerBarcode;
    entity.billItems[line - 1].fromBinUsage = theOnlyStock.binUsage;
    entity.billItems[line - 1].stocks = stocks;
    this.setState({
      entity: { ...entity }
    })
  }
  onFromWrhChange = (value) => {
    const { entity } = this.state;
    if (!entity.fromWrh || entity.billItems.length === 0) {
      entity.fromWrh = JSON.parse(value);
      return;
    }
    if (entity.fromWrh.uuid != JSON.parse(value).uuid) {
      Modal.confirm({
        title: moveBillLocale.fromWrhChangeModalMessage,
        okText: commonLocale.confirmLocale,
        cancelText: commonLocale.cancelLocale,
        onOk: () => {
          entity.fromWrh = JSON.parse(value);
          entity.billItems = [];
          this.props.form.setFieldsValue({
            fromWrh: value
          });
          this.clearStocks();
          this.setState({
            entity: { ...entity },
            stockLineMap: new Map()
          });
        },
        onCancel: () => {
          this.props.form.setFieldsValue({
            fromWrh: JSON.stringify(entity.fromWrh)
          });
          this.setState({
            entity: { ...entity }
          });
        }
      });
    }
  }
  onToWrhChange = (value) => {
    const { entity } = this.state;
    if (!entity.toWrh || entity.billItems.length === 0) {
      entity.toWrh = JSON.parse(value);
      return;
    }
    if (entity.toWrh.uuid != JSON.parse(value).uuid) {
      Modal.confirm({
        title: moveBillLocale.toWrhChangeModalMessage,
        okText: commonLocale.confirmLocale,
        cancelText: commonLocale.cancelLocale,
        onOk: () => {
          entity.toWrh = JSON.parse(value);
          entity.billItems = [];
          this.props.form.setFieldsValue({
            toWrh: value
          });
          this.clearStocks();
          this.setState({
            entity: { ...entity }
          });
        },
        onCancel: () => {
          this.props.form.setFieldsValue({
            fromWrh: JSON.stringify(entity.fromWrh)
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
        title: moveBillLocale.ownerChangeModalMessage,
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
            entity: { ...entity },
            stockLineMap: new Map()
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
  onToBinCodeFocus = (fromBinUsage) => {
    this.getMoveRuleToBins(fromBinUsage);
  }
  onFieldChange = (value, field, index) => {
    const { entity, stockLineMap } = this.state;
    // let stocks = stockLineMap.get(index);
    let stocks = entity.billItems[index - 1].stocks;

    if (field === 'fromBinCode') {
      const binCodeUsage = JSON.parse(value);
      entity.billItems[index - 1].fromBinCode = binCodeUsage.code;
      entity.billItems[index - 1].fromBinUsage = binCodeUsage.usage;
      entity.billItems[index - 1].article = undefined;
      entity.billItems[index - 1].fromContainerBarcode = undefined;
      entity.billItems[index - 1].stocks = undefined;
      //查一下货位上的库存，如果只有一条明细，就不用弹批量导入的页面了
      this.queryStocks(binCodeUsage.code, undefined, undefined, undefined, undefined, index,
        () => {          
          entity.billItems[index - 1].article = undefined;
          entity.billItems[index - 1].fromContainerBarcode = undefined;
          entity.billItems[index - 1].vendor = undefined;
          entity.billItems[index - 1].productionBatch = undefined;
          entity.billItems[index - 1].productionDate = undefined;
          entity.billItems[index - 1].validDate = undefined;
          entity.billItems[index - 1].qpcStr = undefined;
          entity.billItems[index - 1].qtyStr = '0+0';
          entity.billItems[index - 1].qty = 0;
          entity.billItems[index - 1].qpc = undefined;
          entity.billItems[index - 1].toContainerBarcode = undefined;
          entity.billItems[index - 1].toBinCode = undefined;
          entity.billItems[index - 1].toBinUsage = undefined;
        }, "binCode");
    } else if (field === 'article') {
      if (JSON.stringify(entity.billItems[index - 1].article) == value)
        return;
      const article = JSON.parse(value);     
      entity.billItems[index - 1].article = article;
      entity.billItems[index - 1].stocks = undefined;
      //查一下库存，如果只有一笔库存，直接带出，如果不是，新增空白行(callback的内容)
      this.queryStocks(entity.billItems[index - 1].fromBinCode ? entity.billItems[index - 1].fromBinCode : undefined,
        article.articleUuid,
        entity.billItems[index - 1].fromContainerBarcode ? entity.billItems[index - 1].fromContainerBarcode : undefined,
        undefined, undefined, index,
        () => {
          entity.billItems[index - 1].fromContainerBarcode = entity.billItems[index - 1].fromContainerBarcode ? entity.billItems[index - 1].fromContainerBarcode : undefined;
          entity.billItems[index - 1].vendor = undefined;
          entity.billItems[index - 1].productionBatch = undefined;
          entity.billItems[index - 1].productionDate = undefined;
          entity.billItems[index - 1].validDate = undefined;
          entity.billItems[index - 1].qpcStr = undefined;
          entity.billItems[index - 1].qtyStr = '0+0';
          entity.billItems[index - 1].qty = 0;
          entity.billItems[index - 1].qpc = undefined;
          entity.billItems[index - 1].toContainerBarcode = undefined;
          entity.billItems[index - 1].toBinCode = undefined;
          entity.billItems[index - 1].toBinUsage = undefined;
        }, "article");
    } else if (field === 'fromContainerBarcode') {
      if (entity.billItems[index - 1].fromContainerBarcode == value)
        return;
      entity.billItems[index - 1].fromContainerBarcode = value;
      entity.billItems[index - 1].stocks = undefined;
      //查库存，如果只有一笔库存，直接带出，如果不是，新增空白行(callback的内容)
      this.queryStocks(entity.billItems[index - 1].fromBinCode ? entity.billItems[index - 1].fromBinCode : undefined,
        entity.billItems[index - 1].article ? entity.billItems[index - 1].article.articleUuid : undefined
        , value, undefined, undefined, index,
        () => {
          entity.billItems[index - 1].article = entity.billItems[index - 1].article? entity.billItems[index - 1].article : undefined;
          entity.billItems[index - 1].vendor = undefined;
          entity.billItems[index - 1].productionBatch = undefined;
          entity.billItems[index - 1].productionDate = undefined;
          entity.billItems[index - 1].validDate = undefined;
          entity.billItems[index - 1].qpcStr = undefined;
          entity.billItems[index - 1].qtyStr = '0+0';
          entity.billItems[index - 1].qty = 0;
          entity.billItems[index - 1].qpc = undefined;
          entity.billItems[index - 1].toContainerBarcode = undefined;
          entity.billItems[index - 1].toBinCode = undefined;
          entity.billItems[index - 1].toBinUsage = undefined;
        }, "container"
      );
    } else if (field === 'productionBatch') {
      const product = stocks[JSON.parse(value).index];
      entity.billItems[index - 1].productionBatch = product.productionBatch;
      entity.billItems[index - 1].productionDate = product.productionDate;
      entity.billItems[index - 1].validDate = product.validDate;
      entity.billItems[index - 1].qpcStr = product.qpcStr;
      entity.billItems[index - 1].article = product.article;
      entity.billItems[index - 1].qpc = product.qpc;
      entity.billItems[index - 1].price = product.price;
      entity.billItems[index - 1].weight = product.weight;
      entity.billItems[index - 1].volume = product.volume;
      entity.billItems[index - 1].qty = product.qty;
      entity.billItems[index - 1].qtyStr = toQtyStr(product.qty, product.qpcStr);
      entity.billItems[index - 1].fromBinUsage = product.binUsage;
      entity.billItems[index - 1].vendor = product.vendor;
    } else if (field === 'qtyStr') {

      entity.billItems[index - 1].qtyStr = value;
      entity.billItems[index - 1].qty = qtyStrToQty(value, entity.billItems[index - 1].qpcStr);
    } else if (field === 'toBinCode') {
      const toBinCodeUsage = JSON.parse(value);
      entity.billItems[index - 1].toBinCode = toBinCodeUsage.code;
      entity.billItems[index - 1].toBinUsage = toBinCodeUsage.usage;
      if (binUsage.PickUpBin.name === toBinCodeUsage.usage
        || binUsage.PickUpStorageBin.name === toBinCodeUsage.usage) {
        entity.billItems[index - 1].toContainerBarcode = '-';
      }
    } else if (field === 'toContainerBarcode') {
      const toContainer = JSON.parse(value);
      entity.billItems[index - 1].toContainerBarcode = toContainer.barcode;
    }
    this.setState({
      entity: { ...entity },
    });
  }

  getBinCodes = (record) => {
    let binCodeUsages = [];
    if (!record || !record.line || !record.article) {
      return binCodeUsages;
    }
    const { stockLineMap } = this.state;
    let stockDate = stockLineMap.get(record.line);
    let stocks = stockDate ? stockDate : [];
    if (!stocks) {
      return binCodeUsages;
    }
    let binCodes = [];
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
    Array.isArray(stocks) && stocks.forEach(e => {
      containerBarcodes.push(e.containerBarcode);
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

  getProductionBatchs = (record) => {
    let productionBatchs = [];
    if (!record || !record.line) {
      return productionBatchs;
    }
    const { stockLineMap } = this.state;
    // let stockDate = stockLineMap.get(record.line);
    let stockDate = record.stocks;
    let stocks = stockDate ? stockDate : [];
    if (!stocks) {
      return productionBatchs;
    }

    let i = 0;
    Array.isArray(stocks) && stocks.forEach(e => {
      productionBatchs.push({
        productionBatch: e.productionBatch,
        productionDate: e.productionDate,
        validDate: e.validDate,
        index: i,
      });
      i++;
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

  getMoveRuleToBins = (fromBinUsage) => {
    this.props.dispatch({
      type: 'moveruleConfig/getByDCUuidAndFromBinUsage',
      payload: fromBinUsage
    });
  }
  /** 批量设置拣货位 */
  handlebatchSetBin = (selectedRowKeys) => {
    if (Array.isArray(selectedRowKeys) && selectedRowKeys.length === 0) {
      message.warn('请勾选，再进行批量操作');
      return;
    }

    let articleUuids = [];
    for (let i of selectedRowKeys) {
      let article = this.state.entity.billItems[i - 1].article;
      articleUuids.push(article.articleUuid);
    }
    this.props.dispatch({
      type: 'pickSchema/queryByArticles',
      payload: {
        articleUuids: articleUuids
      },
      callback: (response) => {
        if (response && response.success) {
          // 增加批量设置明细商品拣货位功能，如商品同时维护可整件和拆零拣货位，拣货位填充商品拆零拣货位；
          for (let i of this.state.schemaList) {
            for (let t of this.state.entity.billItems) {
              if (t.article.articleUuid === i.articleUuid) {
                if (i.caseBinCode && i.splitBinCode) {
                  t.toBinCode = i.splitBinCode;
                  t.toBinUsage = i.splitBinUsage;
                  t.toContainerBarcode = '-';
                } else if (i.caseBinCode) {
                  t.toBinCode = i.caseBinCode;
                  t.toBinUsage = i.caseBinUsage;
                  t.toContainerBarcode = '-';

                } else if (i.splitBinCode) {
                  t.toBinCode = i.splitBinCode;
                  t.toBinUsage = i.splitBinUsage;
                  t.toContainerBarcode = '-';
                }
              }
            }
          }
          this.setState({
            entity: { ...this.state.entity }
          })
        }
      }
    });

    this.setState({
      selectedRowKeys: selectedRowKeys,
    })
  }

  changeContainerVisible = (selectedRowKeys) => {
    const { entity } = this.state;
    const lines = selectedRowKeys;
    if (!selectedRowKeys || selectedRowKeys.length <= 0) {
      message.warn('请先选择要修改的行！');
      return;
    }
    if (lines.length > 1) {
      for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
          if (entity.billItems[i].toBinCode !== entity.billItems[j].toBinCode) {
            message.warn('目标货位不同，不能批量设置同一个目标容器');
            return;
          }
        }

      }
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
      if (!entity.billItems[line - 1].toBinCode) {
        message.warn('请先设置目标货位');
        return;
      }
      entity.billItems[line - 1].toContainerBarcode = value.containerBarcode && JSON.parse(value.containerBarcode).barcode ? JSON.parse(value.containerBarcode).barcode : undefined;
    })

    this.setState({
      entity: { ...entity },
      containerModalVisible: false,
      selectedRowKeys: []
    })
  }

  changeBinVisible = (selectedRowKeys) => {
    if (!selectedRowKeys || selectedRowKeys.length <= 0) {
      message.warn('请先选择要修改的行！');
      return;
    }
    this.setState({
      BinModalVisible: !this.state.BinModalVisible,
      selectedRowKeys: selectedRowKeys
    })
  }

  handleBinModalVisible = (selectedRowKeys) => {
    this.setState({
      BinModalVisible: false,
      selectedRowKeys: selectedRowKeys
    })
  }

  handleRefreshBin = (value) => {
    const { entity } = this.state;
    const lines = this.state.selectedRowKeys;

    Array.isArray(lines) && lines.forEach(function (line) {
      let bin = JSON.parse(value.bin);
      entity.billItems[line - 1].toBinCode = bin.code;
      entity.billItems[line - 1].toBinUsage = bin.usage;
    });

    this.setState({
      entity: { ...entity },
      BinModalVisible: false,
      selectedRowKeys: []
    })
  }


  /**获取批量增加的集合*/
  getItemListForStock = (value) => {
    const { entity } = this.state;
    var newStocksList = [];
    for (let i = 0; i < value.length; i++) {
      if (entity.billItems && entity.billItems.find(function (item) {
        return item.article && item.article.articleUuid === value[i].article.articleUuid && item.fromBinCode === value[i].binCode &&
          item.fromContainerBarcode === value[i].containerBarcode && item.vendor && item.vendor.uuid === value[i].vendor.uuid &&
          item.productionBatch === value[i].productionBatch
          && item.qpcStr === value[i].qpcStr
      }) === undefined) {
        newStocksList.push(value[i]);
      }
    }
    entity.billItems.splice(entity.billItems.length - 1, 1);
    this.state.line = entity.billItems.length + 1;
    newStocksList.map(bill => {
      bill.line = this.state.line;
      bill.fromBinCode = bill.binCode;
      bill.fromBinUsage = bill.binUsage;
      bill.fromContainerBarcode = bill.containerBarcode;
      bill.qtyStr = toQtyStr(bill.qty, bill.qpcStr);
      this.state.line++;
    });
    entity.billItems = [...entity.billItems, ...newStocksList];
    this.handlebatchAddVisibleForStock()
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
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;
    let cols = [
      <CFormItem key='moveType' label={moveBillLocale.moveType}>
        {
          getFieldDecorator('type', {
            rules: [
              { required: true, message: notNullLocale(moveBillLocale.moveType) },
            ],
            initialValue: entity.type,
          })(
            <PreTypeSelect
              disabled={entity.type && entity.type === '点数移库' ? true : false}
              placeholder={moveBillLocale.moveType}
              preType={PRETYPE.moveType} />
          )
        }
      </CFormItem>,
      <CFormItem label={moveBillLocale.mover} key='mover'>
        {getFieldDecorator('mover', {
          initialValue: JSON.stringify(entity.mover),
          rules: [
            { required: true, message: notNullLocale(moveBillLocale.mover) }
          ],
        })(<UserSelect single={true} />)}
      </CFormItem>,
      <CFormItem label={moveBillLocale.fromWrh} key='fromWrh'>
        {getFieldDecorator('fromWrh', {
          initialValue: entity.fromWrh ? JSON.stringify(entity.fromWrh) : undefined,
          rules: [
            { required: true, message: notNullLocale(moveBillLocale.fromWrh) }
          ],
        })(<WrhSelect onlyOnline placeholder={placeholderChooseLocale(moveBillLocale.fromWrh)} onChange={this.onFromWrhChange} />)}
      </CFormItem>,
      <CFormItem label={moveBillLocale.toWrh} key='toWrh'>
        {getFieldDecorator('toWrh', {
          initialValue: entity.toWrh ? JSON.stringify(entity.toWrh) : undefined,
          rules: [
            { required: true, message: notNullLocale(moveBillLocale.toWrh) }
          ],
        })(<WrhSelect onlyOnline placeholder={placeholderChooseLocale(moveBillLocale.toWrh)} onChange={this.onToWrhChange} />)}
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
   
    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={cols} noteCol={this.drawNotePanel()} noteNotOneCol noteLabelSpan={4}/>
    ];
  }
  /**
   * 绘制按钮
   */
  drawBatchButton = (selectedRowKeys) => {
    const { entity } = this.state;
    return (
      <div style={{ display: 'inline' }}>
        {
          entity.type != '点数移库' ? <span>
            <a onClick={() => this.handlebatchAddVisible()}>添加</a>
          </span> : null
        }
        &emsp;
        <span>
          <a onClick={() => this.handlebatchSetBin(selectedRowKeys)}>设置拣货位</a>
        </span>
        &emsp;
        <span>
          <a onClick={() => this.changeBinVisible(selectedRowKeys)}>设置目标货位</a>
        </span>
        &emsp;
        <span>
          <a onClick={() => this.changeContainerVisible(selectedRowKeys)}>设置目标容器</a>
        </span>
        <TargetContainerModal
          ModalTitle={'设置目标容器'}
          entity={entity && entity.billItems && entity.billItems[0] ? entity.billItems[0] : []}
          containerModalVisible={this.state.containerModalVisible}
          handleContainerModalVisible={this.handleContainerModalVisible}
          handleRefreshContainer={this.handleRefreshContainer}
        />
        <TargetBinModal
          ModalTitle={'设置目标货位'}
          entity={entity}
          handleRefreshBin={this.handleRefreshBin}
          handleBinModalVisible={this.handleBinModalVisible}
          visible={this.state.BinModalVisible}
        />
      </div>
    );
  }
  /**
   * 绘制总数量
   */
  drawTotalInfo = () => {
    var allQtyStr = 0;
    var allQty = 0;
    // var allVolume = 0;
    // var allWeight = 0;
    var allAmount = 0;
    if (this.state.entity.billItems) {
      this.state.entity.billItems.map(item => {
        if (!item.qty) {
          item.qty = 0;
        }
        // if (!item.qtyStr) {
        //     item.qtyStr = 0;
        // }
        if (!item.price) {
          item.price = 0;
        }
        if (!item.weight) {
          item.weight = 0;
        }
        if (!item.volume) {
          item.volume = 0;
        }
        allQty = accAdd(allQty, item.qty);
        var itemQtyStr = item.qtyStr ? item.qtyStr : "0";
        allQtyStr = add(allQtyStr, itemQtyStr);
        if (item.qty > 0) {
          allAmount = accAdd(allAmount, accMul(item.price, item.qty));
        }
      });
    }
    return (
      <span style={{ marginLeft: '10px' }}>
        {commonLocale.inAllQtyStrLocale + ':' + allQtyStr}  |
        {commonLocale.inAllQtyLocale + ':' + allQty}  |
        {commonLocale.inAllAmountLocale + ':' + allAmount.toFixed(4)}
      </span>
    );
  }
  /**搜索*/
  onSearch = (data) => {
    const { entity } = this.state;
    let wrhUuid = entity.fromWrh ? entity.fromWrh.uuid : undefined;
    let ownerUuid = entity.owner ? entity.owner.uuid : undefined;
    if (!ownerUuid || !wrhUuid) {
      message.error('未选择货主或来源仓位')
      return;
    }
    if (data) {
      data.articleCodeOrNameLike = data.articleCodeName;
    }
    const { pageFilter } = this.state;
    pageFilter.searchKeyValues = {
      ...pageFilter.searchKeyValues,
      page: 0,
      state: stockState.NORMAL.name,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      wrhUuid: wrhUuid,
      ownerUuid: ownerUuid,
      ...data
    }
    this.refreshTable();
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
  refreshTable = () => {
    let { stockList } = this.state;
    this.props.dispatch({
      type: 'stock/pageQuery',
      payload: { ...this.state.pageFilter.searchKeyValues },
      callback: (response) => {
        if (response && response.success) {
          stockList.pagination = {
            total: response.data.paging.recordCount,
            pageSize: response.data.paging.pageSize,
            current: response.data.page + 1,
            showTotal: total => `共 ${total} 条`,
          },
          stockList.list = response.data.records;
          this.setState({stockList: stockList})
          
        }
      }
    });
  };
  /**获取批量增加的集合*/
  getItemList = (value) => {
    const { entity } = this.state;
    var newList = [];
    for (let i = 0; i < value.length; i++) {
      if (entity.billItems && entity.billItems.find(function (item) {
        return item.article && item.article.articleUuid === value[i].article.articleUuid && item.fromBinCode === value[i].binCode &&
          item.fromContainerBarcode === value[i].containerBarcode && item.vendor.uuid === value[i].vendor.uuid &&
          item.productionBatch === value[i].productionBatch
          && item.qpcStr === value[i].qpcStr
      }) === undefined) {
        let temp = { ...value[i] };
        temp.qtyStr = toQtyStr(temp.qty, temp.qpcStr);
        newList.push(temp);
      }
    }
    this.state.line = entity.billItems.length + 1;
    newList.map(item => {
      item.fromBinCode = item.binCode;
      item.fromBinUsage = item.binUsage;
      item.fromContainerBarcode = item.containerBarcode;
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
    this.props.form.validateFields((err,fieldsValue)=>{
      if(err) return 
      this.setState({
        batchAddVisible: !this.state.batchAddVisible
      })
    })
  }
  drawTable = () => {
    const { entity, addStockDtl, binCode, articleUuid, fromContainerBarcode, stockLineMap } = this.state;
  
    let columns = [
      {
        title: moveBillLocale.fromBin,
        key: 'fromBinCode',
        fixed: 'left',
        width: 120,
        render: record => {
          let value;
          if (record.fromBinCode) {
            value = record.fromBinCode;
          } else {
            if (this.getBinCodes(record).length > 0) {
              record.fromBinCode = this.getBinCodes(record)[0].binCode;
              record.fromBinUsage = this.getBinCodes(record)[0].binUsage;
              value = JSON.stringify(this.getBinCodes(record)[0]);
            }
          }
          return (
            <IncBinSelect
              value={value}
              placeholder={placeholderChooseLocale(moveBillLocale.fromBin)}
              wrhUuid={entity.fromWrh ? entity.fromWrh.uuid : undefined}
              onChange={e => this.onFieldChange(e, 'fromBinCode', record.line)}
              showSearch={true}
            />
          );
        }
      },
      {
        title: commonLocale.articleLocale,
        key: 'article',
        fixed: 'left',
        width: 180,
        render: record => {
          return (
            <MoveArticleSelect
              value={record.article ? '[' + record.article.articleCode + ']' + record.article.articleName : undefined}
              containerBarcode={record.containerBarcode ? record.containerBarcode : undefined}
              stocks={record.stocks}
              ownerUuid={entity.owner ? entity.owner.uuid : undefined}
              wrhUuid={entity.fromWrh ? entity.fromWrh.uuid : undefined}
              placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
              onChange={e => this.onFieldChange(e, 'article', record.line)}
              showSearch={true}
              binCode={record.fromBinCode ? record.fromBinCode : ''}
              line={record.line}
            />
          );
        }
      },
      {
        title: moveBillLocale.fromBinUsage,
        key: 'fromBinUsage',
        width: 120,
        render: record => {
          return (
            <span>&nbsp;&nbsp;{record.fromBinUsage ? getUsageCaption(record.fromBinUsage) : <Empty />}</span>
          );
        }
      },
      {
        title: moveBillLocale.fromContainer,
        key: 'fromContainer',
        // width: itemColWidth.containerEditColWidth,
        width: 150,
        render: record => {
          return (
            <MoveFromContainerSelect
              value={record.fromContainerBarcode ? record.fromContainerBarcode : undefined}
              article={record.article ? record.article.articleUuid : undefined}
              binCode={record.fromBinCode ? record.fromBinCode : ''}
              stocks={record.stocks}
              ownerUuid={entity.owner ? entity.owner.uuid : undefined}
              wrhUuid={entity.fromWrh ? entity.fromWrh.uuid : undefined}
              placeholder={placeholderChooseLocale(moveBillLocale.fromContainer)}
              onChange={e => this.onFieldChange(e, 'fromContainerBarcode', record.line)}
            />
          );
        }
      },
      {
        title: commonLocale.productionDateLocale,
        key: 'productionDate',
        // width: itemColWidth.dateEditColWidth,
        width: 90,
        render: record => {
          return (
            <span>&nbsp;&nbsp;{record.productionDate ? moment(record.productionDate).format('YYYY-MM-DD') : <Empty />}</span>
          );
        }
      },
      {
        title: commonLocale.productionBatchLocale,
        key: 'productionBatch',
        width: 130,
        render: record => {
          let value;
          if (record.productionBatch) {
            value = record.productionBatch;
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
        title: commonLocale.validDateLocale,
        key: 'validDate',
        // width: itemColWidth.dateEditColWidth,
        width: 90,
        render: record => {
          return (
            <span>&nbsp;&nbsp;{record.validDate ? moment(record.validDate).format('YYYY-MM-DD') : <Empty />}</span>
          );
        }
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        key: 'qpcStr',
        width: itemColWidth.qpcStrEditColWidth,
        render: (val,record) => {
          return <span>&nbsp;&nbsp;{record.qpcStr ? record.qpcStr.concat("/").concat(record.article && record.article.articleSpec? record.article.articleSpec : " ") : ""}</span>
        },
      },
      {
        title: commonLocale.caseQtyStrLocale,
        key: 'qtyStr',
        width: 180,
        render: (record) => {
          let value;
          if (record.article && record.qpcStr) {
            record.qtyStr = toQtyStr(record.qty, record.qpcStr);
          }
          return (
            <QtyStrInput
              value={record.qtyStr ? record.qtyStr : ""}
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
        // width: itemColWidth.qtyColWidth,
        width: 70,
        render: (record) => {
          return <span>&nbsp;&nbsp;{record.qty ? record.qty : 0}</span>
        }
      },
      {
        title: moveBillLocale.toBin,
        key: 'toBinCode',
        // width: itemColWidth.articleEditColWidth,
        width: 120,
        render: (text, record) => {
          return (
            <MoveToBinSelect
              value={record.toBinCode ? record.toBinCode : undefined}
              ownerUuid={entity.owner ? entity.owner.uuid : undefined}
              wrhUuid={entity.toWrh ? entity.toWrh.uuid : undefined}
              states={[binState.FREE.name, binState.USING.name]}
              placeholder={placeholderChooseLocale(commonLocale.bincodeLocale)}
              onChange={e => this.onFieldChange(e, 'toBinCode', record.line)}
              onFocus={() => this.onToBinCodeFocus(record.fromBinUsage)}
              showSearch={true}
            />
          );
        }
      },
      {
        title: moveBillLocale.toContainer,
        key: 'toContainerBarcode',
        // width: itemColWidth.containerEditColWidth,
        width: 150,
        render: record => {
          if (binUsage.PickUpBin.name === record.toBinUsage
            || binUsage.PickUpStorageBin.name === record.toBinUsage) {
            return <span>{'-'}</span>
          } else {
            return (
              <MoveToContainerSelect
                value={record.toContainerBarcode ? record.toContainerBarcode : undefined}
                placeholder={placeholderChooseLocale(commonLocale.containerLocale)}
                onChange={e => this.onFieldChange(e, 'toContainerBarcode', record.line)}
                binCode={record.toBinCode ? record.toBinCode : undefined}
                fromContainerBarcode={record.fromContainerBarcode ? record.fromContainerBarcode : undefined}
                showSearch={true}
              />
            );
          }
        }
      },
      {
        title: commonLocale.vendorLocale,
        key: 'vendor',
        width: 200,
        render: record => {
          return <span>&nbsp;&nbsp;{record.vendor ? convertCodeName(record.vendor) : undefined}</span>
        }
      },
     
    ];
    if (entity.type && entity.type === '点数移库') {
      columns.push({
        title: '新生产日期',
        dataIndex: 'newProductionDate',
        key: 'newProductionDate',
        width: itemColWidth.dateEditColWidth,
        render: (value, record) => {
          return (
            <span>{record.newProductionDate ? convertDate(record.newProductionDate) : <Empty />}</span>
          );
        }
      });
      columns.push({
        title: '新批号',
        dataIndex: 'newProductionBatch',
        key: 'newProductionBatch',
        width: itemColWidth.dateEditColWidth,
        render: (value, record) => {
          return (
            <span>{record.newProductionBatch ? record.newProductionBatch : <Empty />}</span>
          );
        }
      });
      columns.push({
        title: '新到效日期',
        dataIndex: 'newValidDate',
        key: 'newValidDate',
        width: itemColWidth.dateEditColWidth,
        render: (value, record) => {
          return (
            <span>{record.newValidDate ? convertDate(record.newValidDate) : <Empty />}</span>
          );
        }
      })
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
        dataIndex: 'binUsage',
        key: 'binUsage',
        width: colWidth.enumColWidth,
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
        title: commonLocale.productionBatchLocale,
        key: 'productionBatch',
        dataIndex: 'productionBatch',
        width: itemColWidth.numberEditColWidth,
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
        title: commonLocale.validDateLocale,
        dataIndex: 'validDate',
        width: colWidth.dateColWidth,
        render: val => {
          return (
            <span>{val ? convertDate(val) : <Empty />}</span>
          );
        }
      },
      {
        title: '规格',
        key: 'qpcStr',
        dataIndex: 'qpcStr',
        width: itemColWidth.qpcStrColWidth,
      },
      {
        title: commonLocale.caseQtyStrLocale,
        key: 'qtyStr',
        width: itemColWidth.qtyStrEditColWidth,
        render: (record) => {
          if (record.article && record.qpcStr && !record.qtyStr && record.qtyStr !== 0) {
            record.qtyStr = toQtyStr(record.qty && record.qty > 0 ? record.qty : 0, record.qpcStr);
          }
          return (
            <span>{record.qtyStr ? record.qtyStr : <Empty />}</span>
          );
        }
      },
      {
        title: commonLocale.inQtyLocale,
        key: 'qty',
        dataIndex: 'qty',
        width: itemColWidth.qtyColWidth,
      },
      {
        title: commonLocale.stateLocale,
        dataIndex: 'state',
        width: colWidth.enumColWidth,
        render: val => {
          return (
            <span>{val ? stockState[val].caption : <Empty />}</span>
          );
        }
      },
    ];
  
    return (
      entity.type && entity.type === '点数移库' ?
        <div>
          <ItemEditTable
            title={commonLocale.inArticleInfoLocale}
            columns={columns}
            noAddandDelete
            // scroll={{ x: 2800 }}
            data={this.state.entity.billItems}
            drawBatchButton={this.drawBatchButton}
            drawTotalInfo={this.drawTotalInfo}
           
          />
          <ItemBatchAddModal
            visible={addStockDtl}
            binCode={binCode}
            articleUuid={articleUuid}
            container={fromContainerBarcode}
            ownerUuid={entity.owner && entity.owner.uuid ? entity.owner.uuid : ''}
            wrhUuid={entity.fromWrh && entity.fromWrh.uuid ? entity.fromWrh.uuid : ''}
            getItemList={this.getItemListForStock}
            handleCancel={this.handlebatchAddVisibleForStock}
          />
        </div> :
        <div>
          <ItemEditTable
            title={commonLocale.inArticleInfoLocale}
            columns={columns}
            // scroll={{ x: 2800 }}
            data={this.state.entity.billItems}
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
            articleUuid={articleUuid}
            container={fromContainerBarcode}
            ownerUuid={entity.owner && entity.owner.uuid ? entity.owner.uuid : ''}
            wrhUuid={entity.fromWrh && entity.fromWrh.uuid ? entity.fromWrh.uuid : ''}
            getItemList={this.getItemListForStock}
            handleCancel={this.handlebatchAddVisibleForStock}
          />
        </div>
    )
  }
}
