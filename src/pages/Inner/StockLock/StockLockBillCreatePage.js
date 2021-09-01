import { connect } from 'dva';
import moment from 'moment';
import { Select, Form, message, Modal, DatePicker } from 'antd';
import CreatePage from '@/pages/Component/Page/CreatePage';
import CFormItem from '@/pages/Component/Form/CFormItem';
import FormPanel from '@/pages/Component/Form/FormPanel';
import UserSelect from '@/pages/Component/Select/UserSelect';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import {
  commonLocale, notNullLocale, placeholderChooseLocale,
  placeholderLocale
} from '@/utils/CommonLocale';
import { loginCompany, loginOrg, loginUser, getDefOwner } from '@/utils/LoginContext';
import { stockState } from '@/utils/StockState';
import { toQtyStr, qtyStrToQty, add } from '@/utils/QpcStrUtil';
import { convertCodeName, formatDate } from '@/utils/utils';
import { PRETYPE } from '@/utils/constants';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { binUsage } from '@/utils/BinUsage';
import { binState } from '@/utils/BinState';
import { lockType } from './StockLockContants';
import { stockLockBillLocale } from './StockLockBillLocale';
import StockLockBillSelect from './StockLockBillSelect';
// import StockLockArticleSelect from './StockLockArticleSelect';
import ArticleSelect from '@/pages/Component/Select/ArticleSelect';
import StockLockBatchAddModal from './StockLockBatchAddModal';
import PanelItemBatchAdd from '@/pages/Component/Form/PanelItemBatchAdd';
import Empty from '@/pages/Component/Form/Empty';
import ItemBatchAddModal from './ItemBatchAddModal';
import BinSelect from '@/pages/Component/Select/BinSelect';
import StockLockArticleSelect from './StockLockArticleSelect';
const { RangePicker } = DatePicker;

const typeOptions = [];
Object.keys(lockType).forEach(function (key) {
  typeOptions.push(
    <Select.Option key={lockType[key].name} value={lockType[key].name}>{lockType[key].caption}</Select.Option>
  );
});

@connect(({ stocklock, stock, pretype, loading }) => ({
  stocklock,
  stock,
  pretype,
  loading: loading.models.stocklock,
}))
@Form.create()
export default class StockLockBillCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      title: commonLocale.createLocale + stockLockBillLocale.title,
      stocks: [],
      entity: {
        owner: getDefOwner(),
        type: lockType.LOCK.name,
        locker: {
          uuid: loginUser().uuid,
          code: loginUser().code,
          name: loginUser().name
        },
        items: []
      },
      index: 0,
      auditButton: true,
      addStockDtl: false,
      stockList: {
        list: [],
        pagination: {
          total: 0
        }
      },
      pageFilter: {
        page: 0,
        pageSize: 20,
        searchKeyValues: {
          dcUuid: loginOrg().uuid,
          companyUuid: loginCompany().uuid
        },
      },
      auditPermission:'iwms.inner.lock.audit'
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'stocklock/get',
      payload: {
        uuid: this.props.entityUuid
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const { stocks, entity } = this.state;
    const preType = nextProps.pretype;
    // if (nextProps.stock && nextProps.stock.stocks && nextProps.stock.stocks.length > 0) {
    //   this.setState({
    //     stockList: {
    //       list: nextProps.stock.stocks,
    //     },
    //     stocks: stocks.concat(nextProps.stock.stocks)
    //   })
    // }

    if (nextProps.stocklock.entity && nextProps.stocklock.entity.uuid && !this.state.entity.uuid &&
      nextProps.stocklock.entity != this.props.stocklock.entity) {
      this.setState({
        entity: nextProps.stocklock.entity,
        title: stockLockBillLocale.title + ':' + nextProps.stocklock.entity.billNumber
      });

      if (entity.type === lockType.LOCK.name) {
        const that = this;
        nextProps.stocklock.entity.items.forEach(function (e) {
          that.queryNormalStocks(e.article.uuid, nextProps.stocklock.entity.owner);
        });
      } else {
        this.props.dispatch({
          type: 'stock/query',
          payload: {
            companyUuid: loginCompany().uuid,
            dcUuid: loginOrg().uuid,
            state: stockState.LOCKED.name,
            operateBillType: 'StockLockBill'
          }
        });
      }
    } else {
      this.setState({
        stockList: {
          list: nextProps.stock.stocks,
          pagination: {
            total: nextProps.stock.stocks ? nextProps.stock.stocks.length : 0,
            showTotal: total => `共 ${total} 条`,
          }
        },
        // stocks: stocks.concat(nextProps.stock.stocks)
      })
    }

    if (nextProps.stock.stocks && nextProps.stock.stocks.length>0) {
      if (entity.type === lockType.LOCK.name) {
        let hasAdded = false;
        if(this.props.stock.stocks !=nextProps.stock.stocks && nextProps.stock.stocks.length==0 && (entity.items.length!=0 || this.state.batchAddVisible)){
          message.destroy();//防止拉丝显示
          message.warning('库存不足');
          return ;
        }
        stocks.forEach(function (e) {
          if (e.article.articleUuid === nextProps.stock.stocks[0].article.articleUuid) {
            hasAdded = true;
          }
        });
        if (!hasAdded) {
          this.setState({
            stocks: stocks.concat(nextProps.stock.stocks)
          });
        }
      } else {
        this.setState({
          stocks: nextProps.stock.stocks
        });
      }
    }
    if (nextProps.stocklock.data && nextProps.stocklock.data != this.props.stocklock.data) {
      this.setState({
        stockList: nextProps.stocklock.data,
        pagination: {
          total: nextProps.stock.data ? nextProps.stock.data.length : 0,
          showTotal: total => `共 ${total} 条`,
        }
      })
    }
  }
  /**
   * 取消
   */
  onCancel = () => {
    this.props.dispatch({
      type: 'stocklock/showPage',
      payload: {
        showPage: 'query'
      }
    });
    this.setState({
      stocks: [],
      entity: {}
    })
  }

  mergeItems = (items) => {
    if (Array.isArray(items)) {
      let newItems = [];

      items.forEach(item => {
        if (newItems.length == 0) {
          newItems.push(item);
        } else {
          let found = false;
          for (let temp of newItems) {
            if (temp.article.uuid === item.article.uuid &&
              temp.binCode === item.binCode &&
              temp.containerBarcode === item.containerBarcode &&
              temp.productionBatch === item.productionBatch &&
              temp.qpcStr === item.qpcStr &&
              temp.vendor.uuid === item.vendor.uuid) {
              temp.qtyStr = add(temp.qtyStr, item.qtyStr);
              found = true;
              break;
            }
          }

          if (!found) {
            newItems.push(item);
          }
        }
      });

      return newItems;
    }

    return items;
  }


  onSave = (data) => {
    const newData = this.validData(data);

    if (!newData) {
      return;
    }
    let type = 'stocklock/onSave';
    if (newData.uuid) {
      type = 'stocklock/onModify';
    }
    newData.companyUuid = loginCompany().uuid;
    newData.dcUuid = loginOrg().uuid;
    if (newData.items.length > 0) {
      newData.items.map(item => {
        if (item.article) {
          item.article.uuid = item.article.articleUuid || item.article.uuid
          item.article.code = item.article.articleCode || item.article.code
          item.article.name = item.article.articleName || item.article.name
        }
        item.companyUuid = loginCompany().uuid;
        item.dcUuid = loginOrg().uuid;
        item.productDate = item.productionDate || item.productDate
        item.spec = item.article.articleSpec || item.spec
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

    if (newData.items.length > 0) {
      newData.items.map(item => {
        if (item.article) {
          item.article.uuid = item.article.articleUuid || item.article.uuid
          item.article.code = item.article.articleCode || item.article.code
          item.article.name = item.article.articleName || item.article.name
        }
        item.companyUuid = loginCompany().uuid;
        item.dcUuid = loginOrg().uuid;
        item.productDate = item.productionDate || item.productDate
        item.spec = item.article.articleSpec || item.spec
      })
    }

    this.props.dispatch({
      type: 'stocklock/onSaveAndCreate',
      payload: newData,
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.setState({
            entity: {
              locker: {
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
    let newData = JSON.parse(JSON.stringify(entity));
    if (newData.items.length === 0) {
      message.error(stockLockBillLocale.billItemNotNullMessage);
      return false;
    }

    for (let i = newData.items.length - 1; i >= 0; i--) {
      if(!newData.items[i].binCode){
        message.error(`明细第${i+1}行货位不能为空`);
        return false
      }
      if (newData.items[i].article == undefined) {
        message.error(`明细第${newData.items[i].line}行商品不能为空！`);
        return false;
      }
      if (newData.items[i].article && newData.items[i].qty === 0) {
        message.error(`明细第${newData.items[i].line}行商品数量不能为0！`);
        return false;
      }

        if(!newData.items[i].binUsage){
          message.error(`明细第${i+1}行货位类型不能为空`);
          return false
        }
        if(!newData.items[i].containerBarcode){
          message.error(`明细第${i+1}行容器不能为空`);
          return false
        }
        if(!newData.items[i].vendor){
          message.error(`明细第${i+1}行供应商不能为空`);
          return false
        }
        if(!newData.items[i].productionBatch){
          message.error(`明细第${i+1}行批号不能为空`);
          return false
        }

      if (!newData.items[i].article && data.length) {
        data.splice(i, 1);
      }
    }
    // 处理数据，不统一，太乱，后续无法处理
    if (newData.items.length > 0) {
      newData.items = newData.items.map(item => {
        item.companyUuid = loginCompany().uuid;
        item.dcUuid = loginOrg().uuid;
        if (item.article) {
          item.article.uuid = item.article.articleUuid || item.article.uuid
          item.article.code = item.article.articleCode || item.article.code
          item.article.name = item.article.articleName || item.article.name
        }
        item.productDate = item.productionDate || item.productDate
        item.spec = item.article.articleSpec || item.article.spec || item.spec
        return item
      })
    }

    newData.locker = JSON.parse(data.locker);
    newData.type = data.type;
    newData.reason = data.reason;
    newData.note = data.note;
    if(data.unlockDate){
      newData.unlockDate = formatDate(data.unlockDate, true);
    }
    newData.items = this.mergeItems(newData.items);
    for (let i = 0; i < newData.items.length; i++) {
      if (!newData.items[i].article) {
        newData.items.splice(i, 1);
        if (newData.items[i] && newData.items[i].line) {
          newData.items[i].line = i + 1;
        }
        i = i - 1;
      }
    }



    for (let i = 0; i < newData.items.length; i++) {
      for (let j = i + 1; j < newData.items.length; j++) {
        if (newData.items[i].article.uuid === newData.items[j].article.uuid &&
          newData.items[i].binCode === newData.items[j].binCode &&
          newData.items[i].containerBarcode === newData.items[j].containerBarcode &&
          newData.items[i].stockBatch === newData.items[j].stockBatch &&
          newData.items[i].productionBatch === newData.items[j].productionBatch &&
          newData.items[i].qpcStr === newData.items[j].qpcStr &&
          newData.items[i].vendor.uuid === newData.items[j].vendor.uuid) {
          message.error(`明细第${newData.items[i].line}行与第${newData.items[j].line}行重复！`);
          return false;
        }
        if (newData.items[i].article.articleUuid === newData.items[j].article.uuid &&
          newData.items[i].binCode === newData.items[j].binCode &&
          newData.items[i].containerBarcode === newData.items[j].containerBarcode &&
          newData.items[i].stockBatch === newData.items[j].stockBatch &&
          newData.items[i].productionBatch === newData.items[j].productionBatch &&
          newData.items[i].qpcStr === newData.items[j].qpcStr &&
          newData.items[i].vendor.uuid === newData.items[j].vendor.uuid) {
          message.error(`明细第${newData.items[i].line}行与第${newData.items[j].line}行重复！`);
          return false;
        }

      }
    }
    return newData;
  }

  queryLockedStocks = (owner) => {
    const { entity } = this.state;

    if (!owner) {
      owner = entity.owner;
    }

    if (!owner) {
      return;
    }

    this.props.dispatch({
      type: 'stock/query',
      payload: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        ownerUuid: owner.uuid,
        state: stockState.LOCKED.name,
        operateBillType: 'StockLockBill'
      }
    });
  }

  queryNormalStocks = (articleUuid, owner) => {
    const { entity, stocks } = this.state;

    if (!owner) {
      owner = entity.owner;
    }

    let hasQueryed = false;
    stocks.forEach(function (e) {
      if (e.article.articleUuid === articleUuid) {
        hasQueryed = true;
      }
    });
    if (hasQueryed) {
      return;
    }
    this.props.dispatch({
      type: 'stock/query',
      payload: {
        articleUuid: articleUuid,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        ownerUuid: owner ? owner.uuid : '-',
        state: stockState.NORMAL.name
      }
    });
  }

  tableChange = (pagination, filtersArg, sorter) => {
    const { pageFilter } = this.state;

    pageFilter.page = pagination.current - 1;
    pageFilter.pageSize = pagination.pageSize;

    // 判断是否有过滤信息
    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    if (sorter.columnKey) {
      // 如果有排序字段，则需要将原来的清空
      pageFilter.searchKeyValues.sortFields = {};
      if (sorter.columnKey === 'article') {
        sorter.columnKey = 'articleCode'
      }
      var sortField = `${sorter.columnKey}`;
      var sortType = sorter.order === 'descend' ? true : false;
      pageFilter.searchKeyValues.sortFields[sortField] = sortType;
    }
    this.refreshTable();
  }
  /**搜索*/
  onSearch = (data) => {

    let ownerUuid = undefined;
    if (this.props.form.getFieldValue('owner')) {
      ownerUuid = JSON.parse(this.props.form.getFieldValue('owner')).uuid;
    }
    const { entity, pageFilter } = this.state;
    pageFilter.page = 0;
    if (entity.type === lockType.LOCK.name) {
      pageFilter.searchKeyValues = {
        sortFields: {
          articleCode: true
        },
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        ownerUuid: ownerUuid,
        state: 'NORMAL',
        articleCodeOrNameLike: '',
        ...data

      }

    } else {
      pageFilter.searchKeyValues = {
        sortFields: {
          articleCode: true
        },
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        ownerUuid: ownerUuid,
        operateBillType: 'StockLockBill',
        state: 'LOCKED',
        articleCodeOrNameLike: '',
        ...data
      }
    }
    this.refreshTable();
  }
  refreshTable = () => {
    let obj = {};
    obj = this.state.pageFilter.searchKeyValues
    this.props.dispatch({
      type: 'stock/queryLockStocksWithLock',
      payload: { ...obj }
    });
  };

  /** 批量添加弹出框*/
  handlebatchAddVisible = () => {
    this.setState({
      batchAddVisible: !this.state.batchAddVisible,
      stockList: {
        list: [],
        pagination: {
          total: 0
        }
      },
    })
  }

  /**获取批量增加的集合*/
  getItemList = (value) => {
    const type = this.state.entity.type
    let owner = this.state.entity.owner
    if (value && value.length > 0) {
      let arr = value.concat(this.state.entity.items)
      if (arr && arr.length > 0) {
        arr.forEach((item, index) => {
          item.line = index + 1
        })
      }
      this.setState({
        entity: {
          items: arr,
          type: type,
          owner: owner,
          locker: this.state.entity.locker
        },
        // flag: false
      })
    }
    // this.handlebatchAddVisible()
  }

  /**获取批量增加的集合*/
  getItemListForStock = (value) => {
    const { entity } = this.state;
    var newStocksList = [];
    for(let i =0;i<value.length;i++){
      if (entity.items && entity.items.find(function (item) {
        return item.article && item.article.uuid === value[i].article.articleUuid && item.binCode === value[i].binCode && item.vendor.uuid === value[i].vendor.uuid && item.productionBatch === value[i].productionBatch
          && item.qpcStr === value[i].qpcStr
      }) === undefined) {
        if(value[i].article && value[i].article.articleCode) {
          value[i].article = {
            uuid: value[i].article.articleUuid,
            code: value[i].article.articleCode,
            name: value[i].article.articleName,
            spec: value[i].article.articleSpec,
          }
        }
        newStocksList.push(value[i]);
      }
    }
    entity.items.splice(entity.items.length-1, 1);
    this.state.line =entity.items.length+1;
    newStocksList.map(bill => {
      bill.line = this.state.line;
      this.state.line++;
    });
    entity.items = [...entity.items, ...newStocksList];
    this.handlebatchAddVisibleForStock()
    this.setState({
      entity: { ...entity }
    })
  }

  columns = [
    {
      title: commonLocale.articleLocale,
      key: 'article',
      sorter: true,
      width: itemColWidth.articleEditColWidth,
      render: (record) => {
        return <span>{record.article && record.article.articleCode && record.article.articleCode ? '[' + record.article.articleCode + ']' + record.article.articleName : <Empty />}</span>
      }
    },
    {
      title: commonLocale.bincodeLocale,
      key: 'binCode',
      sorter: true,
      width: itemColWidth.articleEditColWidth,
      render: (record) => {
        return <span>{record.binCode ? record.binCode : <Empty />}</span>
      }
    },
    {
      title: commonLocale.inBinUsageLocale,
      key: 'binUsage',
      width: colWidth.enumColWidth,
      render: (record) => {
        return <span>{record.binUsage ? binUsage[record.binUsage].caption : <Empty />}</span>
      }
    },
    {
      title: commonLocale.containerLocale,
      key: 'containerBarcode',
      sorter: true,
      width: itemColWidth.containerEditColWidth,
      render: (record) => {
        return <span>{record.containerBarcode ? record.containerBarcode : <Empty />}</span>
      }
    },
    {
      title: commonLocale.vendorLocale,
      key: 'vendor',
      width: itemColWidth.articleEditColWidth,
      render: (record) => {
        return <span>{record.vendor ? record.vendor.name : <Empty />}</span>
      }
    },
    {
      title: commonLocale.productionBatchLocale,
      key: 'productionBatch',
      width: itemColWidth.containerEditColWidth,
      render: (record) => {
        return <span>{record.productionBatch}</span>
      }
    },
    {
      title: commonLocale.productionDateLocale,
      key: 'productionDate',
      width: colWidth.dateColWidth,
      render: (record) => {
        return <span>{record.productionDate ? moment(record.productionDate).format('YYYY-MM-DD') : <Empty />}</span>
      }
    },
    {
      title: commonLocale.validDateLocale,
      key: 'validDate',
      width: colWidth.dateColWidth,
      render: (record) => {
        return <span>{record.validDate}</span>
      }
    },
    {
      title: commonLocale.inQpcAndMunitLocale,
      key: 'qpcStr',
      width: itemColWidth.articleEditColWidth,
      render: (record) => {
        if (record.qpcStr && record.munit) {
          return <span>{record.qpcStr + '/' + record.munit}</span>
        } else {
          if (this.getQpcStrs(record).length > 0) {
            record.qpcStr = this.getQpcStrs(record)[0].qpcStr;
            record.munit = this.getQpcStrs(record)[0].munit;
            return <span>{JSON.stringify(this.getQpcStrs(record)[0])}</span>
          }
        }
      },
    },
    {
      title: commonLocale.caseQtyStrLocale,
      key: 'qtyStr',
      width: itemColWidth.qtyStrEditColWidth,
      render: (text, record, index) => {
        if (record.article && !record.qtyStr) {
          record.qtyStr = toQtyStr(record.qty, record.qpcStr);
        }
        return <span>{record.qtyStr ? record.qtyStr : 0}</span>
      }
    },
    {
      title: commonLocale.inQtyLocale,
      key: 'qty',
      width: itemColWidth.qtyColWidth,
      render: (text, record, index) => {
        return <span>{record.qty ? record.qty : 0}</span>
      }
    },
    {
      title: commonLocale.inPriceLocale,
      key: 'price',
      width: itemColWidth.priceColWidth + 50,
      render: (text, record, index) => {
        if (record.price == 0 || record.price) {
          return <span>{record.price}</span>
        } else {
          if (this.getPrices(record).length > 0) {
            record.price = this.getPrices(record)[0];
            return <span>{this.getPrices(record)[0]}</span>
          }
        }
      }
    }
  ];
  onLockBillChange = (value) => {
    const { stocks, entity } = this.state;
    const that = this;
    stocks.forEach(e => {
      if (e.operateBill.billNumber === value) {
        var item = this.findItem(entity.items, e)
        if (!item) {
          entity.items.push({
            line: entity.items.length + 1,
            article: {
              uuid: e.article.articleUuid,
              code: e.article.articleCode,
              name: e.article.articleName
            },
            spec: e.article.articleSpec,
            qpcStr: e.qpcStr,
            munit: e.munit,
            binCode: e.binCode,
            binUsage: e.binUsage,
            containerBarcode: e.containerBarcode,
            productDate: e.productionDate,
            validDate: e.validDate,
            productionBatch: e.productionBatch,
            price: e.price,
            qty: e.qty,
            vendor: e.vendor,
            qtyStr: toQtyStr(e.qty, e.qpcStr)
          });
        }
      }
    });
    this.setState({
      entity: { ...entity }
    });
  }

  findItem = (items, stock) => {
    let result = undefined;
    items.map(item => {
      if (stock.article.articleUuid === item.article.uuid &&
        stock.qpcStr === item.qpcStr &&
        stock.vendor.uuid === item.vendor.uuid &&
        stock.productionBatch === item.productionBatch &&
        stock.binCode === item.binCode &&
        stock.containerBarcode === item.containerBarcode) {
        result = item;
      }
    });
    return result;
  }

  onTypeChange = (value) => {
    const { entity } = this.state;
    if (!entity.type || entity.items.length === 0) {
      entity.type = value;
      if (value === lockType.UNLOCK.name) {
        this.queryLockedStocks();
      }
      return;
    }

    if (entity.type != type) {
      Modal.confirm({
        title: stockLockBillLocale.typeChangeModalMessage,
        okText: commonLocale.confirmLocale,
        cancelText: commonLocale.cancelLocale,
        onOk: () => {
          if (value === lockType.UNLOCK.name) {
            this.queryLockedStocks();
          }
          entity.type = value;
          entity.items = [];
          this.props.form.setFieldsValue({
            type: value
          });
          this.setState({
            entity: { ...entity },
            stocks: []
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

  onOwnerChange = (value) => {
    const { entity } = this.state;
    if (!entity.owner || entity.items.length === 0) {
      entity.owner = JSON.parse(value);
      if (entity.type === lockType.UNLOCK.name) {
        this.queryLockedStocks(JSON.parse(value));
      }
      return;
    }

    if (entity.owner.uuid != JSON.parse(value).uuid) {
      Modal.confirm({
        title: stockLockBillLocale.ownerChangeModalMessage,
        okText: commonLocale.confirmLocale,
        cancelText: commonLocale.cancelLocale,
        onOk: () => {
          if (entity.type === lockType.UNLOCK.name) {
            this.queryLockedStocks(JSON.parse(value));
          }
          entity.owner = JSON.parse(value);
          entity.items = [];
          this.props.form.setFieldsValue({
            owner: value
          });
          this.setState({
            entity: { ...entity },
            stocks: []
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
      console.log('===========')
      console.log(binCodeUsage)
      entity.items[index - 1].binCode = binCodeUsage.binCode ? binCodeUsage.binCode : binCodeUsage.code ? binCodeUsage.code : '';
      entity.items[index - 1].binUsage = binCodeUsage.binUsage ? binCodeUsage.binUsage : binCodeUsage.usage ? binCodeUsage.usage : '';
      this.setState({
        binCode: binCodeUsage.code
      });
      this.handlebatchAddVisibleForStock();
    } else if (field === 'article') {
      const articleSpec = JSON.parse(value);
      entity.items[index - 1].article = {
        uuid: articleSpec.uuid,
        code: articleSpec.code,
        name: articleSpec.name
      };
      entity.items[index - 1].spec = articleSpec.spec;
      entity.items[index - 1].containerBarcode = undefined;
      entity.items[index - 1].vendor = undefined;
      entity.items[index - 1].productionBatch = undefined;
      entity.items[index - 1].productDate = undefined;
      entity.items[index - 1].validDate = undefined;
      entity.items[index - 1].qpcStr = undefined;
      entity.items[index - 1].qtyStr = undefined;
      entity.items[index - 1].price = undefined;
      // this.queryNormalStocks(articleSpec.uuid);
      const containerBarcodes = this.getContainerBarcodes(entity.items[index - 1]);
      if (containerBarcodes.length > 0) {
        entity.items[index - 1].containerBarcode = containerBarcodes[0];
      }
      const vendors = this.getVendors(entity.items[index - 1]);
      if (vendors.length > 0) {
        entity.items[index - 1].vendor = vendors[0];
      }
      const productionBatchs = this.getProductionBatchs(entity.items[index - 1]);
      if (productionBatchs.length > 0) {
        entity.items[index - 1].productionBatch = productionBatchs[0].productionBatch;
        entity.items[index - 1].productDate = productionBatchs[0].productDate;
        entity.items[index - 1].validDate = productionBatchs[0].validDate;
      }
      const qpcStrs = this.getQpcStrs(entity.items[index - 1]);
      if (qpcStrs.length > 0) {
        entity.items[index - 1].qpcStr = qpcStrs[0].qpcStr;
        entity.items[index - 1].munit = qpcStrs[0].munit;
      }
      const qty = this.getQty(entity.items[index - 1]);
      entity.items[index - 1].qty = qty;
      entity.items[index - 1].qtyStr = toQtyStr(qty, entity.items[index - 1].qpcStr);
      const prices = this.getPrices(entity.items[index - 1]);
      if (prices.length > 0) {
        entity.items[index - 1].price = prices[0];
      }
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
      }
      const qpcStrs = this.getQpcStrs(entity.items[index - 1]);
      if (qpcStrs.length > 0) {
        entity.items[index - 1].qpcStr = qpcStrs[0].qpcStr;
        entity.items[index - 1].munit = qpcStrs[0].munit;
      }
      const qty = this.getQty(entity.items[index - 1]);
      entity.items[index - 1].qty = qty;
      entity.items[index - 1].qtyStr = toQtyStr(qty, entity.items[index - 1].qpcStr);
      const prices = this.getPrices(entity.items[index - 1]);
      if (prices.length > 0) {
        entity.items[index - 1].price = prices[0];
      }
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
      }
      const qpcStrs = this.getQpcStrs(entity.items[index - 1]);
      if (qpcStrs.length > 0) {
        entity.items[index - 1].qpcStr = qpcStrs[0].qpcStr;
        entity.items[index - 1].munit = qpcStrs[0].munit;
      }
      const qty = this.getQty(entity.items[index - 1]);
      entity.items[index - 1].qty = qty;
      entity.items[index - 1].qtyStr = toQtyStr(qty, entity.items[index - 1].qpcStr);
      const prices = this.getPrices(entity.items[index - 1]);
      if (prices.length > 0) {
        entity.items[index - 1].price = prices[0];
      }
    } else if (field === 'vendor') {
      entity.items[index - 1].vendor = JSON.parse(value);
      const productionBatchs = this.getProductionBatchs(entity.items[index - 1]);
      if (productionBatchs.length > 0) {
        entity.items[index - 1].productionBatch = productionBatchs[0].productionBatch;
        entity.items[index - 1].productDate = productionBatchs[0].productDate;
        entity.items[index - 1].validDate = productionBatchs[0].validDate;
      }
      const qpcStrs = this.getQpcStrs(entity.items[index - 1]);
      if (qpcStrs.length > 0) {
        entity.items[index - 1].qpcStr = qpcStrs[0].qpcStr;
        entity.items[index - 1].munit = qpcStrs[0].munit;
      }
      const qty = this.getQty(entity.items[index - 1]);
      entity.items[index - 1].qty = qty;
      entity.items[index - 1].qtyStr = toQtyStr(qty, entity.items[index - 1].qpcStr);
      const prices = this.getPrices(entity.items[index - 1]);
      if (prices.length > 0) {
        entity.items[index - 1].price = prices[0];
      }
    } else if (field === 'productionBatch') {
      const product = JSON.parse(value);
      entity.items[index - 1].productionBatch = product.productionBatch;
      entity.items[index - 1].productDate = product.productDate;
      entity.items[index - 1].validDate = product.validDate;
      const qpcStrs = this.getQpcStrs(entity.items[index - 1]);
      if (qpcStrs.length > 0) {
        entity.items[index - 1].qpcStr = qpcStrs[0].qpcStr;
        entity.items[index - 1].munit = qpcStrs[0].munit;
      }
      const qty = this.getQty(entity.items[index - 1]);
      entity.items[index - 1].qty = qty;
      entity.items[index - 1].qtyStr = toQtyStr(qty, entity.items[index - 1].qpcStr);
      const prices = this.getPrices(entity.items[index - 1]);
      if (prices.length > 0) {
        entity.items[index - 1].price = prices[0];
      }
    } else if (field === 'qpcStr') {
      const qpcStrMunit = JSON.parse(value);
      entity.items[index - 1].qpcStr = qpcStrMunit.qpcStr;
      entity.items[index - 1].munit = qpcStrMunit.munit;
      entity.items[index - 1].qty = this.getQty(entity.items[index - 1]);
      entity.items[index - 1].qtyStr = toQtyStr(entity.items[index - 1].qty, qpcStrMunit.qpcStr);
      const prices = this.getPrices(entity.items[index - 1]);
      if (prices.length > 0) {
        entity.items[index - 1].price = prices[0];
      }
    } else if (field === 'qtyStr') {
      entity.items[index - 1].qtyStr = value;
      entity.items[index - 1].qty = qtyStrToQty(value, entity.items[index - 1].qpcStr);
    } else if (field === 'price') {
      entity.items[index - 1].price = value;
    }


    this.setState({
      entity: { ...entity }
    });
  }

  getQty = (item) => {
    const { stocks } = this.state;
    let qty = 0;
    stocks.forEach(function (e) {
      if ((e.article.uuid === item.article.uuid || e.article.articleUuid === item.article.uuid) && e.binCode === item.binCode
        && e.vendor && e.vendor.uuid && item.vendor && item.vendor.uuid && e.vendor.uuid === item.vendor.uuid
        && e.containerBarcode === item.containerBarcode && e.qpcStr === item.qpcStr
        && e.productionBatch === item.productionBatch) {
        qty = item.qty;
      }
    });
    return qty;
  }

  getArticleOptions = () => {
    let articleUuids = [];
    let articleOptions = [];
    const { stocks } = this.state;
    stocks.forEach(e => {
      if (articleUuids.indexOf(e.article.articleUuid) < 0) {
        articleUuids.push(e.article.articleUuid);
        articleOptions.push(
          <Select.Option key={e.article.articleUuid} value={JSON.stringify({
            uuid: e.article.articleUuid,
            code: e.article.articleCode,
            name: e.article.articleName,
            spec: e.article.articleSpec
          })}>{"[" + e.article.articleCode + "]" + e.article.articleName}</Select.Option>
        );
      }
    });
    return articleOptions;
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
    stocks.forEach(e => {
      if (e.article.articleUuid === record.article.uuid && e.binCode === record.binCode
        && e.containerBarcode === record.containerBarcode && vendors.indexOf(e.vendor) < 0) {
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
        <Select.Option key={e && e.uuid ? e.uuid : undefined} value={JSON.stringify(e)}>
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
        e.containerBarcode === record.containerBarcode && e.vendor && e.vendor.uuid && record.vendor && record.vendor.uuid
        && e.vendor.uuid === record.vendor.uuid && ps.indexOf(e.productionBatch) < 0) {
        ps.push(e.productionBatch);
        productionBatchs.push({
          productionBatch: e.productionBatch,
          productDate: e.productionDate,
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
    const { stocks } = this.state;

    let qpcStrs = [];
    let qpcMunits = [];
    if (!record.article) {
      return qpcMunits;
    }
    stocks.forEach(e => {
      if (e.article.articleUuid === record.article.uuid && e.binCode === record.binCode &&
        e.containerBarcode === record.containerBarcode && e.vendor && e.vendor.uuid && record.vendor && record.vendor.uuid && e.vendor.uuid === record.vendor.uuid
        && e.productionBatch === record.productionBatch && qpcStrs.indexOf(e.qpcStr) < 0) {
        qpcStrs.push(e.qpcStr);
        qpcMunits.push({
          qpcStr: e.qpcStr,
          munit: e.munit
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
        e.containerBarcode === record.containerBarcode && e.vendor && e.vendor.uuid && record.vendor && record.vendor.uuid && e.vendor.uuid === record.vendor.uuid
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

  drawBatchButton = () => {
    return (
      <span>
        <a onClick={() => this.handlebatchAddVisible()}>添加</a>
      </span>
    )
  }

  /**
   * 批量添加库存明细弹出框
   */
  handlebatchAddVisibleForStock = () => {
    this.setState({
      addStockDtl: !this.state.addStockDtl
    });
  }

  /**
   * 设置不可选择的日期 今天以前不能选
   */
  disabledStartDate = (current) => {

		return current && current <moment().subtract(1, "days");
	}

  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, defOwner } = this.state;
    let cols = [
      <CFormItem label={stockLockBillLocale.type} key='type'>
        {getFieldDecorator('type', {
          initialValue: entity.type,
          rules: [
            { required: true, message: notNullLocale(stockLockBillLocale.type) }
          ],
        })(<Select onChange={this.onTypeChange} placeholder={placeholderChooseLocale("单据类型")} id='type'>
          {typeOptions}
        </Select>)}
      </CFormItem>,
      <CFormItem key='reason' label={stockLockBillLocale.reason}>
        {
          getFieldDecorator('reason', {
            rules: [
              { required: true, message: notNullLocale(stockLockBillLocale.reason) },
            ],
            initialValue: entity.reason,
          })(
            <PreTypeSelect
              placeholder={stockLockBillLocale.reason}
              preType={PRETYPE.stockLockBillReason} />
          )
        }
      </CFormItem>,
      <CFormItem label={commonLocale.inOwnerLocale} key='owner'>
        {getFieldDecorator('owner', {
          initialValue: entity.owner ? JSON.stringify(entity.owner) : undefined,
          rules: [
            { required: true, message: notNullLocale(commonLocale.inOwnerLocale) }
          ],
        })(<OwnerSelect onlyOnline placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} onChange={this.onOwnerChange} />)}
      </CFormItem>,
      <CFormItem label={stockLockBillLocale.locker} key='locker'>
        {getFieldDecorator('locker', {
          initialValue: JSON.stringify(entity.locker),
          rules: [
            { required: true, message: notNullLocale(stockLockBillLocale.locker) }
          ],
        })(<UserSelect single={true} />)}
      </CFormItem>
    ];
    if(entity.type === lockType.LOCK.name){
      cols.push(
      <CFormItem key='unlockDate' label={"自动解锁时间"}>
      {
        getFieldDecorator('unlockDate', {
          initialValue: entity.unlockDate ? moment(entity.unlockDate, 'YYYY-MM-DD') : null,
        })(
          <DatePicker style={{ width: '100%' }} disabledDate={this.disabledStartDate} />
        )
      }
    </CFormItem>
      );
    }
    if (entity.type === lockType.UNLOCK.name) {
      cols.push(
        <CFormItem label={stockLockBillLocale.lockBill} key='lockBill'>
          {getFieldDecorator('lockBill', {
            initialValue: undefined,
          })(<StockLockBillSelect
            onChange={this.onLockBillChange}
            placeholder={placeholderChooseLocale(stockLockBillLocale.lockBill)}
            ownerUuid={entity.owner ? entity.owner.uuid : undefined} />)}
        </CFormItem>
      );
    }
    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={cols} noteCol={this.drawNotePanel()} noteNotOneCol noteLabelSpan={4} />
    ];
  }

  drawTable = () => {
    const { entity , addStockDtl, binCode} = this.state;

    let columns = [
      {
        title: commonLocale.bincodeLocale,
        key: 'binCode',
        width: itemColWidth.binCodeEditColWidth,
        render: record => {
          return (
            <BinSelect
              getUsage
              value={record.binCode ? JSON.stringify({
                code: record.binCode,
                usage: record.binUsage
              }) : undefined}
              wrhUuid={entity.wrh ? entity.wrh.uuid : undefined}
              states={entity.type === lockType.LOCK.name ? [binState.USING.name] : [binState.LOCKED.name]}
              placeholder={placeholderChooseLocale(commonLocale.bincodeLocale)}
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
          if (entity.type === lockType.LOCK.name) {
            if (!record.article) {
              let obj = {}
              obj.uuid = ''
              obj.code = ''
              obj.name = ''
              obj.spec = ''
              return (
                <StockLockArticleSelect
                  value={undefined}
                  ownerUuid={entity.owner ? entity.owner.uuid : undefined}
                  placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
                  onChange={e => this.onFieldChange(e, 'article', record.line)}
                  showSearch={true}
                  binCode={record.binCode ? record.binCode : ''}
                  line={record.line}
                />
              );
            } else {
              let obj = {}
              obj.uuid = record.article.articleUuid || record.article.uuid
              obj.code = record.article.articleCode || record.article.code
              obj.name = record.article.articleName || record.article.name
              obj.spec = record.article.articleSpec || record.spec
              return (
                <StockLockArticleSelect
                  value={record.article ? convertCodeName(obj) : undefined}
                  ownerUuid={entity.owner ? entity.owner.uuid : undefined}
                  placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
                  onChange={e => this.onFieldChange(e, 'article', record.line)}
                  showSearch={true}
                  binCode={record.binCode ? record.binCode : ''}
                  line={record.line}
                />
              );
            }

          } else {
            if (!record.article) {
              let obj = {}
              obj.uuid = ''
              obj.code = ''
              obj.name = ''
              obj.spec = ''
              return (
                <Select
                  value={undefined}
                  placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
                  onChange={e => this.onFieldChange(e, 'article', record.line)}>
                  {this.getArticleOptions()}
                </Select>
              );
            } else {
              let obj = {}
              obj.uuid = record.article.articleUuid || record.article.uuid
              obj.code = record.article.articleCode || record.article.code
              obj.name = record.article.articleName || record.article.name
              obj.spec = record.article.articleSpec || record.spec
              return (
                <Select
                  value={record.article ? JSON.stringify({
                    ...obj
                  }) : undefined}
                  placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
                  onChange={e => this.onFieldChange(e, 'article', record.line)}>
                  {this.getArticleOptions()}
                </Select>
              );
            }
          }
        }
      },
      {
        title: commonLocale.inBinUsageLocale,
        key: 'binUsage',
        width: colWidth.enumColWidth,
        render: record => {
          return (
            <span>{record.binUsage ? binUsage[record.binUsage].caption : '空'}</span>
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
        width: itemColWidth.articleEditColWidth,
        render: record => {
          let value;
          if (record.productionBatch) {
            value = record.productionBatch;
          } else {
            if (this.getProductionBatchs(record).length > 0) {
              record.productionBatch = this.getProductionBatchs(record)[0].productionBatch;
              record.productDate = this.getProductionBatchs(record)[0].productDate;
              record.validDate = this.getProductionBatchs(record)[0].validDate;
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
        key: 'productionDate',
        width: colWidth.dateColWidth,
        render: record => {
          let value;
          if (record.productionDate) {
            value = record.productionDate;
          } else {
            if (this.getProductionBatchs(record).length > 0) {
              value = this.getProductionBatchs(record)[0].productDate;
            }
          }
          return (
            <span>{value ? moment(value).format('YYYY-MM-DD') : '空'}</span>
          );
        }
      },
      {
        title: commonLocale.validDateLocale,
        key: 'validDate',
        width: colWidth.dateColWidth,
        render: record => {
          return (
            <span>{record.validDate ? moment(record.validDate).format('YYYY-MM-DD') : '空'}</span>
          );
        }
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        key: 'qpcStr',
        width: itemColWidth.qpcStrEditColWidth,
        render: (record) => {
          let value;
          if (record.qpcStr && record.munit) {
            value = record.qpcStr + '/' + record.munit;
          } else {
            if (this.getQpcStrs(record).length > 0) {
              record.qpcStr = this.getQpcStrs(record)[0].qpcStr;
              record.munit = this.getQpcStrs(record)[0].munit;
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
      },
      {
        title: commonLocale.caseQtyStrLocale,
        key: 'qtyStr',
        width: itemColWidth.qtyStrEditColWidth,
        render: (record) => {
          let value;
          if (record.article && !record.qtyStr) {
            record.qtyStr = toQtyStr(record.qty, record.qpcStr);
          }
          return (
            <QtyStrInput
              value={record.qtyStr ? record.qtyStr : null}
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
        width: itemColWidth.qtyColWidth,
        render: (record) => {
          return <span>{record.qty ? record.qty : 0}</span>
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
            if (this.getPrices(record).length > 0) {
              record.price = this.getPrices(record)[0];
              value = this.getPrices(record)[0];
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
    ];
    return (
      <div>
        <ItemEditTable
          title={stockLockBillLocale.articleInfo}
          columns={columns}
          // scroll={{ x: 2500 }}
          data={ this.state.entity.items }
          drawTotalInfo={this.drawTotalInfo}
          notNote
          drawBatchButton={this.drawBatchButton}
        />
        <PanelItemBatchAdd
          searchPanel={<StockLockBatchAddModal refresh={this.onSearch} fieldsValue={''} />}
          visible={this.state.batchAddVisible}
          columns={this.columns}
          data={this.state.stockList}
          handlebatchAddVisible={this.handlebatchAddVisible}
          getSeletedItems={this.getItemList}
          onChange={this.tableChange}
        />
        <ItemBatchAddModal
          visible = {addStockDtl}
          binCode = {binCode}
          ownerUuid = {entity.owner && entity.owner.uuid ? entity.owner.uuid : ''}
          state = { entity.type === 'UNLOCK' ? 'LOCKED' : 'NORMAL' }
          getItemList = {this.getItemListForStock}
          handleCancel = {this.handlebatchAddVisibleForStock}
        />
      </div>
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
}
