import { connect } from 'dva';
import moment from 'moment';
import { isArray, format } from 'util';
import { Form, Select, Input, InputNumber, message, DatePicker, Modal } from 'antd';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import VendorSelect from '@/pages/Component/Select/VendorSelect';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { STATE } from '@/utils/constants';
import { sourceWay } from '@/utils/SourceWay';
import { orgType } from '@/utils/OrgType';
import { loginCompany, loginOrg, getDefOwner } from '@/utils/LoginContext';
import { convertCodeName, formatDate, convertArticleDocField } from '@/utils/utils';
import { qtyStrToQty, add, accAdd, accMul, toQtyStr } from '@/utils/QpcStrUtil';
import { PRETYPE } from '@/utils/constants';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { vendorRtnNtcLocale } from './VendorRtnNtcBillLocale';
import { MAX_DECIMAL_VALUE, INPUT_DATEFORMAT } from '@/utils/constants';
import PanelItemBatchAdd from '@/pages/Component/Form/PanelItemBatchAdd';
import SearchFormItemBatchAdd from './SearchFormItemBatchAdd';
import StockArticleSelect from './StockArticleSelect';
import { binUsage } from '@/utils/BinUsage';
import { stockState } from '@/utils/StockState';
import { SettleUnit } from '@/pages/Inner/MoveBill/MoveBillContants';
import { SETTLE_UNIT } from '@/pages/Basic/Article/Constants';
import { VENDORRTNNTC_RES } from './VendorRtnNtcBillPermission';

const { TextArea } = Input;
@connect(({ vendorRtnNtc, article, articleBusiness, stock, loading }) => ({
  vendorRtnNtc,
  article,
  articleBusiness,
  stock,
  loading: loading.models.vendorRtnNtc,
}))
@Form.create()
export default class VendorRtnNtcBillCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      title: commonLocale.createLocale + vendorRtnNtcLocale.title,
      entity: {
        owner: getDefOwner(),
        items: []
      },
      articles: [],
      auditButton: true,
      auditPermission: VENDORRTNNTC_RES.AUDIT,
      stockArticleInfos: [],
      batchAddVisible: false,
      pageFilter: {
        page: 0,
        pageSize: 20,
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid,
          state: stockState.NORMAL.name,
          binUsages: [binUsage.VendorRtnBin.name],
        }
      },
      articleSettleUnits: [],
      stockList:{
        list:[]
      }
    }
  }
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    const { articles, stockArticleInfos, articleSettleUnits } = this.state;

    if (nextProps.vendorRtnNtc.entity && this.props.vendorRtnNtc.entityUuid) {
      this.setState({
        entity: nextProps.vendorRtnNtc.entity,
        title: vendorRtnNtcLocale.title + '：' + nextProps.vendorRtnNtc.entity.billNumber,
      });

      if (nextProps.vendorRtnNtc.entity && nextProps.vendorRtnNtc.entity.items
        && this.props.vendorRtnNtc.entityUuid && !this.state.entity.uuid) {
        const that = this;
        nextProps.vendorRtnNtc.entity.items.forEach(function (e) {
          that.queryArticle(e.article.articleUuid);
          that.getArticleBusiness(e.article.articleUuid);
        });
      }
    }

    if (nextProps.article.entity && nextProps.article.entity.uuid
      && !articles[nextProps.article.entity.uuid]) {
      articles[nextProps.article.entity.uuid] = nextProps.article.entity;
      this.setState({
        articles: articles
      });
    }

    if (nextProps.articleBusiness.entity && nextProps.articleBusiness.entity.article
      && !articleSettleUnits[nextProps.articleBusiness.entity.article.uuid]) {
      articleSettleUnits[nextProps.articleBusiness.entity.article.uuid] = nextProps.articleBusiness.entity.settleUnit;
      this.setState({
        articleSettleUnits: articleSettleUnits
      })
    }

    if (nextProps.stock.stocks) {
      let articleQpcStrs = [];
      let articleInfos = [];

      if (nextProps.stock.stocks) {
        for (let i = nextProps.stock.stocks.length - 1; i >= 0; i--) {
          let e = nextProps.stock.stocks[i];
          if (e.article) {
            if (!articleSettleUnits[e.article.articleUuid])
              this.getArticleBusiness(e.article.articleUuid);
            let articleInfo = articleInfos[e.article.articleUuid + e.qpcStr];
            if (!articleInfo && articleQpcStrs.indexOf(e.article.articleUuid + e.qpcStr) === -1) {
              articleInfo = {
                article: {
                  articleUuid: e.article.articleUuid,
                  articleCode: e.article.articleCode,
                  articleName: e.article.articleName,
                  articleSpec: e.article.articleSpec,
                  munit: e.article.munit,
                },
                qpcStr: e.qpcStr,
                qty: e.qty,
                qtyStr: e.caseQtyStr
              }

              articleInfos[e.article.articleUuid + e.qpcStr] = articleInfo;
              articleQpcStrs.push(e.article.articleUuid + e.qpcStr)
            } else {
              articleInfo.qty = accAdd(articleInfo.qty, e.qty);
              articleInfo.qtyStr = SettleUnit.QTY.name == articleSettleUnits[e.article.articleUuid]
                ? toQtyStr(articleInfo.qty, articleInfo.qpcStr) : accAdd(articleInfo.qtyStr, e.caseQtyStr);
            }
          }
        }
      }

      let articleTotalInfos = [];
      articleQpcStrs && articleQpcStrs.forEach(function (e) {
        if (articleInfos && articleInfos[e]) {
          articleTotalInfos.push(articleInfos[e]);
        }
      });

      this.setState({
        stockArticleInfos: {
          list: articleTotalInfos,
          pagination: {
            total: articleTotalInfos.length,
            pageSize: nextProps.stock.data.pagination.pageSize,
            current: nextProps.stock.data.pagination.current,
            showTotal: total => `共 ${total} 条`,
          },
        }
      })
    }
  }

  queryArticle = (articleUuid) => {
    this.props.dispatch({
      type: 'article/get',
      payload: {
        uuid: articleUuid
      }
    });
  }

  queryStocks = () => {
    const { stockList } = this.state;
    this.props.dispatch({
      type: 'stock/pageQuery',
      payload: {
        ...this.state.pageFilter.searchKeyValues
      },
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
  }

  getArticleBusiness = (articleUuid) => {
    if (!articleUuid)
      return;

    this.props.dispatch({
      type: 'articleBusiness/getByDcUuidAndArticleUuid',
      payload: {
        articleUuid: articleUuid
      },
    });
  }

  /**
   * 刷新
   */
  refresh = () => {
    if (this.props.vendorRtnNtc.entityUuid)
      this.props.dispatch({
        type: 'vendorRtnNtc/get',
        payload: this.props.vendorRtnNtc.entityUuid
      });
  }
  /**
   * 取消
   */
  onCancel = () => {
    if (!this.props.vendorRtnNtc.entityUuid) {
      this.props.dispatch({
        type: 'vendorRtnNtc/showPage',
        payload: {
          showPage: this.props.billNumber ? 'view' : 'query',
          billNumber: this.props.billNumber,
        }
      });
    } else {
      this.props.dispatch({
        type: 'vendorRtnNtc/showPage',
        payload: {
          showPage: 'view',
          entityUuid: this.props.vendorRtnNtc.entityUuid
        }
      });
    }
  }

  getQpcStrs = (record) => {
    if (!record.article) {
      return [];
    }

    const { articles } = this.state;
    const article = articles[record.article.articleUuid];

    if (!article) {
      return [];
    }

    const qpcStrs = [];
    if (!article.qpcs) {
      return qpcStrs;
    }

    article.qpcs.forEach(function (e) {
      let volume = e.width * e.height * e.length;
      qpcStrs.push({
        qpcStr: e.qpcStr,
        munit: e.munit ? e.munit : '-',
        spec: article.spec,
        qpc: e.paq,
        volume: volume,
        weight: e.weight,
        defaultQpcStr: e.defaultQpcStr
      });
    });
    return qpcStrs;
  }

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

  getVendors = (record) => {
    if (!record.article) {
      return [];
    }

    const { articles } = this.state;
    const article = articles[record.article.articleUuid];
    if (!article) {
      return [];
    }

    const vendors = [];
    if (!article.vendors) {
      return vendors;
    }
    article.vendors.forEach(function (e) {
      vendors.push({
        vendor: e.vendor,
        price: e.defaultReturnPrice,
        defaultVendor: e.vendor.uuid === article.defaultVendor.uuid
      });
    });

    return vendors;
  }

  getVendorOptions = (record) => {
    const vendors = this.getVendors(record);

    const vendorOptions = [];
    vendors.forEach(e => {
      vendorOptions.push(
        <Select.Option key={e.vendor.uuid} value={JSON.stringify(e)}>
          {convertCodeName(e.vendor)}</Select.Option>
      );
    });
    return vendorOptions;
  }

  /**
   * 保存
   */
  onSave = (data) => {
    const { entity, items } = this.state;

    let bill = {
      ...entity,
      ...data,
    };
    bill.companyUuid = loginCompany().uuid;
    bill.dcUuid = loginOrg().uuid;
    bill.owner = JSON.parse(bill.owner);
    bill.wrh = JSON.parse(bill.wrh);
    bill.vendor = JSON.parse(bill.vendor);
    bill.sourceWay = sourceWay.CREATE.name;

    if (this.validate(bill) === false)
      return;

    bill.expireDate = formatDate(bill.expireDate);
    if (!bill.uuid) {
      this.props.dispatch({
        type: 'vendorRtnNtc/save',
        payload: bill,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
          }
        }
      });
    } else {
      this.props.dispatch({
        type: 'vendorRtnNtc/modify',
        payload: bill,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.modifySuccessLocale);
          }
        }
      });
    }
  }

  /**
   * 保存并新建
   */
  onSaveAndCreate = (data) => {
    let bill = {
      ...this.state.entity,
      ...data,
    };
    bill.companyUuid = loginCompany().uuid;
    bill.dcUuid = loginOrg().uuid;
    bill.owner = JSON.parse(bill.owner);
    bill.vendor = JSON.parse(bill.vendor);
    bill.wrh = JSON.parse(bill.wrh);
    bill.sourceWay = sourceWay.CREATE.name;

    if (this.validate(bill) === false)
      return;

    bill.expireDate = formatDate(bill.expireDate);
    this.props.dispatch({
      type: 'vendorRtnNtc/onSaveAndApprove',
      payload: bill,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.saveAndAuditSuccess);
        }
      }
    });
  }

  validate = (entity) => {
    const { articleSettleUnits } = this.state;
    if (entity.items.length === 0) {
      message.error('通知单明细不能为空');
      return false;
    }

    if (entity.expireDate && (entity.expireDate).startOf('day') < moment(new Date()).startOf('day')) {
      message.error(`通知单到效期不能早于当前日期`);
      return false;
    }

    for (let i = entity.items.length - 1; i >= 0; i--) {
      if (!entity.items[i].article) {
        message.error(`第${entity.items[i].line}行商品不能为空！`);
        return false;
      }

      let settleUnit = articleSettleUnits[entity.items[i].article.articleUuid];
      if (SettleUnit.QTY.name === settleUnit && entity.items[i].article && entity.items[i].qty <= 0) {
        message.error(`第${entity.items[i].line}行数量不能小于等于0！`);
        return false;
      }

      if (SettleUnit.WEIGHT.name === settleUnit && entity.items[i].article && entity.items[i].qty <= 0
        && entity.items[i].qtyStr <= 0) {
        message.error(`第${entity.items[i].line}行数量、件数不能同事小于等于0！`);
        return false;
      }

      let qpcStrs = this.getQpcStrs(entity.items[i]);
      qpcStrs && qpcStrs.forEach(function (e) {
        if (e.qpcStr === entity.items[i].qpcStr) {
          entity.items[i].article.munit = e.munit;
          entity.items[i].article.articleSpec = e.spec;
          entity.items[i].qpc = e.qpc;
          entity.items[i].weight = e.weight;
          entity.items[i].volume = e.volume;
        }
      })
      entity.items[i].settleUnit = articleSettleUnits[entity.items[i].article.articleUuid];
    }

    return true;
  }

  handlechangeOwner = (value) => {
    const { entity } = this.state;
    let originalOwner = this.props.form.getFieldValue('owner');
    if (entity.owner && entity.owner !== JSON.parse(value) && entity.items.length > 0) {
      Modal.confirm({
        title: '修改货主会清空其他信息，请确认修改？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.props.form.resetFields();
          entity.owner = JSON.parse(value);
          entity.wrh = undefined;
          entity.vendor = undefined;
          entity.expireDate = undefined;
          entity.items = [];

          this.setState({
            entity: entity,
            items: []
          });
        },
        onCancel: () => {
          this.props.form.setFieldsValue({
            owner: originalOwner,
          });
        },
      });
    } else {
      entity.owner = JSON.parse(value);
      this.setState({
        entity: entity
      })
    }
  }

  handleChangeWrh = (value) => {
    const { entity } = this.state;
    if (!value)
      return;
    entity.wrh = JSON.parse(value);
    this.setState({
      entity: entity
    })
  }

  handlechangeVendor = (value) => {
    const { entity } = this.state;

    if (entity.vendor && entity.vendor !== JSON.parse(value)) {
      Modal.confirm({
        title: '修改供应商会清空明细信息，请确认修改？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          entity.vendor = JSON.parse(value);
          entity.items = [];

          this.setState({
            entity: entity,
            items: []
          });
        },
      });
    } else {
      entity.vendor = JSON.parse(value);
      this.setState({
        entity: entity
      })
    }
  }
  /**
   * 表格变化时
   * @param {*} e
   * @param {*} fieldName
   * @param {*} key
   */
  handleFieldChange(e, fieldName, line) {
    const { entity, articleSettleUnits } = this.state;
    if (fieldName === 'article') {
      let article = {
        articleUuid: JSON.parse(e).uuid,
        articleCode: JSON.parse(e).code,
        articleName: JSON.parse(e).name,
        articleSpec: JSON.parse(e).spec,
      }
      const { entity } = this.state;
      entity.items[line - 1].article = article;
      entity.items[line - 1].price = undefined;
      entity.items[line - 1].qtyStr = '0';
      entity.items[line - 1].qty = undefined;
      entity.items[line - 1].note = undefined;
      this.queryArticle(article.articleUuid);
      if (!articleSettleUnits[article.articleUuid])
        this.getArticleBusiness(article.articleUuid);
    } else if (fieldName === 'qpcStr') {
      const qpcStrMunit = JSON.parse(e);
      entity.items[line - 1].qpcStr = qpcStrMunit.qpcStr;
      entity.items[line - 1].article.munit = qpcStrMunit.munit;
      entity.items[line - 1].article.articleSpec = qpcStrMunit.spec;
      entity.items[line - 1].volume = qpcStrMunit.volume;
      entity.items[line - 1].weight = qpcStrMunit.weight;
      entity.items[line - 1].qpc = qpcStrMunit.qpc;

      if (SettleUnit.QTY.name === articleSettleUnits[entity.items[line - 1].article.articleUuid]
        && entity.items[line - 1].qtyStr) {
        entity.items[line - 1].qty = qtyStrToQty(entity.items[line - 1].qtyStr, entity.items[line - 1].qpcStr);
      }
    } else if (fieldName === 'price') {
      entity.items[line - 1].price = e;
    } else if (fieldName === 'qtyStr') {
      entity.items[line - 1].qtyStr = e;
      entity.items[line - 1].qty = entity.items[line - 1].qty = qtyStrToQty(e.toString(), entity.items[line - 1].qpcStr);
    } else if (fieldName === 'qty') {
      entity.items[line - 1].qty = e;
    }

    this.setState({
      entity: { ...entity }
    });
  }

  /**
   * 绘制表单
   */
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, defOwner } = this.state;

    // if (entity && entity.vendor) {
    //   entity.vendor['type'] = orgType.vendor.name;
    // }
    let basicCols = [
      <CFormItem key='owner' label={commonLocale.inOwnerLocale}>
        {
          getFieldDecorator('owner', {
            initialValue: entity && entity.owner ? JSON.stringify(entity.owner) : undefined,
            rules: [
              { required: true, message: notNullLocale(commonLocale.inOwnerLocale) }
            ],
          })(
            <OwnerSelect
              onChange={this.handlechangeOwner}
              placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} />
          )
        }
      </CFormItem>,
      <CFormItem key='wrh' label={commonLocale.inWrhLocale}>
        {
          getFieldDecorator('wrh', {
            initialValue: entity && entity.wrh ? JSON.stringify(entity.wrh) : undefined,
            rules: [{ required: true, message: notNullLocale(commonLocale.inWrhLocale) }],
          })(
            <WrhSelect
              onChange={this.handleChangeWrh}
              placeholder={placeholderLocale(commonLocale.inWrhLocale)} />
          )
        }
      </CFormItem>,


      <CFormItem key='vendor' label={commonLocale.inVendorLocale}>
        {
          getFieldDecorator('vendor', {
            initialValue: entity && entity.vendor ?
              JSON.stringify(entity.vendor) : undefined,
            rules: [
              { required: true, message: notNullLocale(commonLocale.inVendorLocale) }
            ],
          })(
            <VendorSelect
              onChange={this.handlechangeVendor}
              ownerUuid={entity.owner && entity.owner.uuid ? entity.owner.uuid : undefined}
              state={STATE.ONLINE}
              single
              placeholder={placeholderChooseLocale(commonLocale.inVendorLocale)}
            />
          )
        }
      </CFormItem>,
      <CFormItem key='expireDate' label={vendorRtnNtcLocale.expireDate}>
        {
          getFieldDecorator('expireDate', {
            initialValue: entity.expireDate ? moment(entity.expireDate, 'YYYY-MM-DD') : null,
            rules: [
              { required: true, message: notNullLocale(vendorRtnNtcLocale.expireDate) }
            ],
          })(
            <DatePicker style={{ width: '100%' }} format={INPUT_DATEFORMAT}/>
          )
        }
      </CFormItem>
    ];

    return [
      <FormPanel key='basicInfo' noteLabelSpan={4} title={commonLocale.basicInfoLocale} cols={basicCols} noteCol={this.drawNotePanel()}/>,
    ];
  }
  /**
   * 绘制总数量
   */
  drawTotalInfo = () => {
    var allQtyStr = 0;
    var allQty = 0;
    var allAmount = this.state.entity.amount ? this.state.entity.amount : 0;
    var articles = [];
    if (this.state.entity.items) {
      this.state.entity.items.map(item => {
        if (!item.qty) {
          item.qty = 0;
        }
        if (!item.qtyStr) {
          item.qtyStr = 0;
        }
        if (!item.price) {
          item.price = 0;
        }
        allQty = accAdd(allQty, item.qty);
        allQtyStr = add(allQtyStr, item.qtyStr)

        allAmount = accAdd(allAmount, accMul(item.price, item.qty));
      })
    }

    return (
      <span style={{ marginLeft: '10px' }}>
                {commonLocale.inAllQtyStrLocale + ':' + allQtyStr} |
        {commonLocale.inAllQtyLocale + ':' + allQty} |
        {commonLocale.inAllAmountLocale + ':' + allAmount}
            </span >
    );
  }

  /**
   * 绘制明细表格
   */
  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, articleSettleUnits } = this.state;
    let articleCols = [
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        width: itemColWidth.articleEditColWidth,
        render: record => {
          return (
            <StockArticleSelect
              value={record.article ? `[${record.article.articleCode}]${record.article.articleName}` : undefined}
              ownerUuid={entity.owner ? entity.owner.uuid : undefined}
              vendorUuid={entity.vendor ? entity.vendor.uuid : undefined}
              wrhUuid={entity.wrh ? entity.wrh.uuid : undefined}
              placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
              onChange={e => this.handleFieldChange(e, 'article', record.line)}
              onlyOnline={true}
              showSearch={true}
              getSpec={true}
              single
            />
          );
        }
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        key: 'qpcStrAndMunit',
        width: itemColWidth.qpcStrEditColWidth,
        render: (text, record) => {
          let value;
          if (record.qpcStr && record.article.munit) {
            value = record.qpcStr + "/" + record.article.munit;
          } else {
            if (this.getQpcStrs(record).length > 0) {
              let qpcStrs = this.getQpcStrs(record);
              qpcStrs && qpcStrs.forEach(function (e) {
                if (e.defaultQpcStr) {
                  record.qpcStr = e.qpcStr;
                  record.article.munit = e.munit;
                  record.article.articleSpec = e.spec;
                  record.qpc = e.qpc;
                  record.weight = e.weight;
                  record.volume = e.volume;

                  value = JSON.stringify(e);
                }
              })
              if (!value) {
                record.qpcStr = this.getQpcStrs(record)[0].qpcStr;
                record.article.munit = this.getQpcStrs(record)[0].munit;
                record.article.articleSpec = this.getQpcStrs(record)[0].spec;
                record.qpc = this.getQpcStrs(record)[0].qpc;
                record.weight = this.getQpcStrs(record)[0].weight;
                record.volume = this.getQpcStrs(record)[0].volume;

                value = JSON.stringify(this.getQpcStrs(record)[0]);
              }
            }
          }
          return (
            <Select
              value={value}
              placeholder={placeholderLocale(commonLocale.qpcStrLocale)}
              onChange={e => this.handleFieldChange(e, 'qpcStr', record.line)}>
              {this.getQpcStrOptions(record)}
            </Select>
          );
        },
      },
      {
        title: commonLocale.inPriceLocale,
        dataIndex: 'price',
        key: 'price',
        width: itemColWidth.priceColWidth,
        render: (text, record) => {
          return (
            <InputNumber
              value={record.price ? record.price : 0}
              min={0}
              precision={4}
              max={100000}
              onChange={e => this.handleFieldChange(e, 'price', record.line)}
              placeholder={placeholderLocale(commonLocale.inPriceLocale)}
            />
          );
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
        dataIndex: 'qty',
        key: 'qty',
        width: itemColWidth.qtyColWidth,
        render: (text, record) => {
          return <span>{record.qty ? record.qty : 0}</span>
        }
      },
    ];

    let batchQueryResultColumns = [
      {
        title: commonLocale.articleLocale,
        key: 'article',
        dataIndex: 'article',
        width: itemColWidth.articleColWidth,
        render: (text, record) => { return convertArticleDocField(record.article) }
      }, {
        title: commonLocale.qpcStrLocale,
        key: 'qpcStr',
        dataIndex: 'qpcStr',
        width: itemColWidth.qpcStrColWidth,
      },
      {
        title: commonLocale.inQtyStrLocale,
        key: 'qtyStr',
        dataIndex: 'qtyStr',
        width: itemColWidth.qtyStrColWidth
      },
      {
        title: commonLocale.inQtyLocale,
        key: 'qty',
        dataIndex: 'qty',
        width: itemColWidth.qtyColWidth
      }
    ]
    return (
      <div>
        <ItemEditTable
          title='商品明细'
          columns={articleCols}
          data={entity.items ? entity.items : []}
          drawTotalInfo={this.drawTotalInfo}
          drawBatchButton={this.drawBatchButton}
        />
        <PanelItemBatchAdd
          searchPanel={<SearchFormItemBatchAdd refresh={this.onSearch} fieldsValue={''} />}
          visible={this.state.batchAddVisible}
          columns={batchQueryResultColumns}
          data={this.state.stockList}
          handlebatchAddVisible={this.handlebatchAddVisible}
          getSeletedItems={this.getItemList}
          onChange={this.tableChange}
          width={'50%'}
          comId={'vendorRtenNtc.create.batchTable'}
        />
      </div>
    )
  }


  /**搜索*/
  onSearch = (data) => {
    const { pageFilter, entity } = this.state;

    let ownerUuid = entity.owner ? entity.owner.uuid : undefined;
    let vendorUuid = entity.vendor ? entity.vendor.uuid : undefined;
    let wrhUuid = entity.wrh ? entity.wrh.uuid : undefined;

    if (!ownerUuid || !vendorUuid || !wrhUuid) {
      return;
    }

    if (data) {
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        page: 0,
        pageSize: 20,
        ownerUuid: ownerUuid,
        vendorUuid: vendorUuid,
        wrhUuid: wrhUuid,
        binUsages: [binUsage.VendorRtnBin.name],
        state: stockState.NORMAL.name,
        ...data
      }
    } else {
      pageFilter.searchKeyValues = {
        page: 0,
        pageSize: 20,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        ownerUuid: ownerUuid,
        vendorUuid: vendorUuid,
        wrhUuid: wrhUuid,
        binUsages: [binUsage.VendorRtnBin.name],
        state: stockState.NORMAL.name,
      }
    }
    this.setState({
      stockList:{
        list:[]
      }
    });
    this.queryStocks();
  }

  tableChange = (pagination, filtersArg, sorter) => {
    const { stockArticleInfos } = this.state;

    stockArticleInfos.pagination.current = pagination.current + 1
    this.setState({
      stockArticleInfos: stockArticleInfos
    })
  }

  /**获取批量增加的集合*/
  getItemList = (value) => {
    const { entity, articleSettleUnits } = this.state;

    var newList = [];
    let line = entity.items.length;
    for (let i = 0; i < value.length; i++) {
      if (entity.items && entity.items.find(function (item) {
        return item.article && item.article.articleUuid === value[i].articleSpec
      }) === undefined) {
        entity.items[line] = {
          article: {
            articleUuid: value[i].article.articleUuid,
            articleCode: value[i].article.articleCode,
            articleName: value[i].article.articleName,
            articleSpec: value[i].article.articleSpec,
            munit: value[i].article.munit
          },
          qpcStr: value[i].qpcStr,
          price: undefined,
          qty: value[i].qty,
          qtyStr: SettleUnit.QTY === articleSettleUnits[value[i].article.articleUuid] ?
            toQtyStr(value[i].qty, value[i].qpcStr) : value[i].qtyStr,
          note: undefined,
          line: line + 1
        }

        this.queryArticle(value[i].article.articleUuid);

        let qpcStrs = this.getQpcStrs(entity.items[line]);
        qpcStrs && qpcStrs.forEach(function (e) {
          if (e.qpcStr === value[i].qpcStr) {
            entity.items[line].qpcStr = e.qpcStr;
            entity.items[line].article.munit = e.munit;
            entity.items[line].article.articleSpec = e.spec;
            entity.items[line].qpc = e.qpc;
            entity.items[line].weight = e.weight;
            entity.items[line].volume = e.volume;
          }
        })


        line++;
      }
    }

    this.setState({
      entity: { ...entity }
    })
  }

  drawBatchButton = () => {
    return (
      <span>
                <a onClick={() => this.handlebatchAddVisible()}>批量添加</a>
            </span>
    )
  }

  handlebatchAddVisible = () => {
    this.setState({
      stockList: [],
      batchAddVisible: !this.state.batchAddVisible
    })
  }
}
