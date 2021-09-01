import CreatePage from '@/pages/Component/Page/CreatePage';
import ItemEditTable from './ItemEditTable';
import { Select, Form, Modal, message, InputNumber } from 'antd';
import { connect } from 'dva';
import { convertCodeName, isEmptyObj } from '@/utils/utils';
import { placeholderChooseLocale, notNullLocale, placeholderLocale, commonLocale } from '@/utils/CommonLocale';
import { qtyStrToQty, toQtyStr, add } from '@/utils/QpcStrUtil';
import ArticleSelect from '@/pages/Component/Select/ArticleSelect';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import UserSelect from '@/pages/Component/Select/UserSelect';
import CFormItem from '@/pages/Component/Form/CFormItem';
import FormPanel from '@/pages/Component/Form/FormPanel';
import { PRETYPE } from '@/utils/constants';
import { loginUser, loginCompany, loginOrg, getDefOwner } from '@/utils/LoginContext';
import moment from 'moment';
import { binUsage, getUsageCaption } from '@/utils/BinUsage';
import { decLocale, itemNotZero, itemRepeat, clearConfirm, noteTooLong } from './DecInvBillLocale';
import { articleLocale } from '@/pages/Basic/Article/ArticleLocale';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import Empty from '@/pages/Component/Form/Empty';
import { decinvSourceBill } from './DecinvSourceBill';

@connect(({ dec, loading }) => ({
  dec,
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
      auditButton : true,
      batchAddVisible: false,
      stockList: [],//批量添加查询后的分页数据
      pageFilter: {
        searchKeyValues: {
          page: 0,
          pageSize: 10
        }
      },
      auditPermission:'iwms.inner.dec.audit'
    }
  }

  componentDidMount() {
   this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    const { stocks } = this.state;
    if (this.props.entityUuid && nextProps.dec.entity && nextProps.dec.entity.uuid === this.props.entityUuid) {

      this.setState({
        entity: nextProps.dec.entity,
        title: decLocale.title + '：' + nextProps.dec.entity.billNumber
      });

      const that = this;
      nextProps.dec.entity.items && nextProps.dec.entity.items.forEach(function (e) {
        that.queryStocks(e.article.code, nextProps.dec.entity.wrh, nextProps.dec.entity.owner);
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

  refresh = () => {
    this.props.dispatch({
      type: 'dec/get',
      payload: {
        uuid: this.props.entityUuid
      }
    });
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
    for(let x in stocks){
      if(stocks[x].article && stocks[x].article.code===articleCode){
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

  onFieldChange = (value, field, line) => {
    const { entity } = this.state;
    if (field === 'price') {
      entity.items[line - 1].price = value;
    }
    this.setState({
      entity: { ...entity }
    })
  }

  getQty = (item) => {
    const { stocks } = this.state;
    let qty = 0;
    stocks.forEach(function (e) {
      if (e.article.uuid === item.article.uuid && e.binCode === item.binCode
        && e.containerBarcode === item.containerBarcode && e.vendor.uuid === item.vendor.uuid
        && e.productionBatch === item.productionBatch && e.qpcStr === item.qpcStr
        && e.price === item.price && e.sourceBill.billUuid === item.sourceBill.billUuid && e.stockBatch === item.stockBatch) {
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
        })(<PreTypeSelect disabled={true} placeholder={placeholderChooseLocale(decLocale.type)} preType={PRETYPE.decinvType} />)}
      </CFormItem>,
      <CFormItem label={commonLocale.inWrhLocale} key='wrh'>
        {getFieldDecorator('wrh', {
          initialValue: entity.wrh ? JSON.stringify(entity.wrh) : undefined,
          rules: [
            { required: true, message: notNullLocale(commonLocale.inWrhLocale) }
          ],
        })(<WrhSelect disabled={true} placeholder={placeholderChooseLocale(commonLocale.inWrhLocale)} onChange={this.onWrhChange} />)}
      </CFormItem>,
      <CFormItem label={commonLocale.inOwnerLocale} key='owner'>
        {getFieldDecorator('owner', {
          initialValue: entity.owner ? JSON.stringify(entity.owner) : undefined,
          rules: [
            { required: true, message: notNullLocale(commonLocale.inOwnerLocale) }
          ],
        })(<OwnerSelect disabled={true} onlyOnline placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} onChange={this.onOwnerChange} />)}
      </CFormItem>,
      <CFormItem label={decLocale.decer} key='decer'>
        {getFieldDecorator('decer', {
          initialValue: JSON.stringify(entity.decer),
          rules: [
            { required: true, message: notNullLocale(decLocale.decer) }
          ],
        })(<UserSelect disabled single={true} />)}
      </CFormItem>,
      <CFormItem key="uploadDate" label={commonLocale.inUploadDateLocale}>
        {getFieldDecorator('uploadDate')(
          <span>{entity.uploadDate ? moment(entity.uploadDate).format('YYYY-MM-DD') : '空'}</span>
        )}
      </CFormItem>
    ];
    let cols1 = [
      <CFormItem key="totalQtyStr" label={commonLocale.inAllQtyStrLocale}>
        {getFieldDecorator('totalQtyStr')(
          <span>{entity.totalQtyStr ? entity.totalQtyStr : '空'}</span>
        )}
      </CFormItem>,
      <CFormItem key="totalRealQtyStr" label={commonLocale.inAllRealQtyStrLocale}>
        {getFieldDecorator('totalRealQtyStr')(
          <span>{entity.totalRealQtyStr ? entity.totalRealQtyStr : '空'}</span>
        )}
      </CFormItem>,
      <CFormItem key="totalArticleCount" label={commonLocale.inAllArticleCountLocale}>
        {getFieldDecorator('totalArticleCount')(
          <span>{entity.totalArticleCount ? entity.totalArticleCount : '空'}</span>
        )}
      </CFormItem>,
      <CFormItem key="totalRealArticleCount" label={commonLocale.inAllRealArticleCountLocale}>
        {getFieldDecorator('totalRealArticleCount')(
          <span>{entity.totalRealArticleCount ? entity.totalRealArticleCount : '空'}</span>
        )}
      </CFormItem>,
      <CFormItem key="totalAmount" label={commonLocale.inAllAmountLocale}>
        {getFieldDecorator('totalAmount')(
          <span>{entity.totalAmount ? entity.totalAmount : '空'}</span>
        )}
      </CFormItem>,
      <CFormItem key="totalRealAmount" label={commonLocale.inAllRealAmountLocale}>
        {getFieldDecorator('totalRealAmount')(
          <span>{entity.totalRealAmount ? entity.totalRealAmount : '空'}</span>
        )}
      </CFormItem>,
      <CFormItem key="totalVolume" label={commonLocale.inAllVolumeLocale}>
        {getFieldDecorator('totalVolume')(
          <span>{entity.totalVolume ? entity.totalVolume : '空'}</span>
        )}
      </CFormItem>,
      <CFormItem key="totalRealVolume" label={commonLocale.inAllRealVolumeLocale}>
        {getFieldDecorator('totalRealVolume')(
          <span>{entity.totalRealVolume ? entity.totalRealVolume : '空'}</span>
        )}
      </CFormItem>,
      <CFormItem key="totalWeight" label={commonLocale.inAllWeightLocale}>
        {getFieldDecorator('totalWeight')(
          <span>{entity.totalWeight ? entity.totalWeight : '空'}</span>
        )}
      </CFormItem>,
      <CFormItem key="totalRealWeight" label={commonLocale.inAllRealWeightLocale}>
        {getFieldDecorator('totalRealWeight')(
          <span>{entity.totalRealWeight ? entity.totalRealWeight : '空'}</span>
        )}
      </CFormItem>
    ];
    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={cols} />,
      <FormPanel key='bussinessInfo' title={commonLocale.bussinessLocale} cols={cols1} />
    ];
  }

  drawTable = () => {
    const { entity } = this.state;

    let columns = [
      {
        title: commonLocale.articleLocale,
        key: 'article',
        width: itemColWidth.articleEditColWidth,
        render: record => {
          return (
            <ArticleSelect
              getSpec={true}
              value={record.article ? convertCodeName(record.article) : undefined}
              ownerUuid={entity.owner ? entity.owner.uuid : '-'}
              placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
              onChange={e => this.onFieldChange(e, 'article', record.line)}
              single
              disabled
            />
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
                    disabled={true}
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
              disabled={true}
              placeholder={placeholderChooseLocale(commonLocale.bincodeLocale)}
              onChange={e => this.onFieldChange(e, 'binCode', record.line)}
              showSearch={true}
            >
              {this.getBinCodeOptions(record)}
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
            if (this.getContainerBarcodes(record).length > 0) {
              record.containerBarcode = this.getContainerBarcodes(record)[0];
              value = this.getContainerBarcodes(record)[0];
            }
          }
          return (
            <Select
              value={value}
              disabled={true}
              placeholder={placeholderChooseLocale(commonLocale.containerLocale)}
              onChange={e => this.onFieldChange(e, 'containerBarcode', record.line)}
            >
              {this.getContainerBarcodeOptions(record)}
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
              disabled={true}
              placeholder={placeholderChooseLocale(commonLocale.productionBatchLocale)}
              onChange={e => this.onFieldChange(e, 'productionBatch', record.line)}
            >
              {this.getProductionBatchOptions(record)}
            </Select>
          );
        }
      },
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
              disabled={true}
              placeholder={placeholderChooseLocale(commonLocale.inStockBatchLocale)}
              onChange={e => this.onFieldChange(e, 'stockBatch', record.line)}
            >
              {this.getStockBatchOptions(record)}
            </Select>
          );
        }
      },
      {
        title: decLocale.qtyStr,
        key: 'qtyStr',
        width: itemColWidth.qtyStrColWidth,
        render: (record) => {
          return (
            <span>{record.qtyStr ? record.qtyStr : 0}</span>
          );
        }
      },
      {
        title: decLocale.qty,
        key: 'qty',
        width: itemColWidth.qtyColWidth - 50,
        render: (record) => {
          return <span>{record.qty ? record.qty : 0}</span>
        }
      },
      {
        title: commonLocale.inAllRealQtyStrLocale,
        key: 'realQtyStr',
        width: itemColWidth.qtyStrColWidth,
        render: record => {
          return (
            <span>{record.realQtyStr ? record.realQtyStr : 0}</span>
          );
        }
      },
      {
        title: commonLocale.inAllRealQtyLocale,
        key: 'realQty',
        width: itemColWidth.qtyColWidth,
        render: record => {
          return (
            <span>{record.realQty ? record.realQtyStr : 0}</span>
          );
        }
      },
      {
        title: commonLocale.inPriceLocale,
        key: 'price',
        width: itemColWidth.priceColWidth,
        render: record => {
          return (<InputNumber
            id = 'price'
            value={record.price ? record.price : 0}
            min={0}
            disabled={ entity.version !== 1}
            onChange={e => this.onFieldChange(e, 'price', record.line)}
            placeholder={'请输入价格'}
            style={{ width: '100%' }}
          />)
        }
      }];
    return (
      <div>
        <ItemEditTable
          title={commonLocale.inArticleLocale}
          columns={columns}
          scroll={{ x: 2400 }}
          data={this.state.entity.items ? this.state.entity.items : []}
          drawBatchButton={this.drawBatchButton}
          drawTotalInfo={this.drawTotalInfo}
        />
      </div>
    )
  }

  refreshTable = () => {
    this.props.dispatch({
      type: 'dec/queryBatchAddStocks',
      payload: { ...this.state.pageFilter.searchKeyValues }
    });
  };
}
