import { connect } from 'dva';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { Form, Select, Input, InputNumber, Popconfirm, message, DatePicker, Divider } from 'antd';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import { convertCodeName, formatDate, convertArticleDocField } from '@/utils/utils';
import moment from 'moment';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import { isArray } from 'util';
import { stockTakeBillLocal } from './StockTakeBillLocal';
import { binUsage } from '@/utils/BinUsage';
import { binState } from '@/utils/BinState';
import UserSelect from '@/pages/Component/Select/UserSelect';
import ContainerSelect from './ContainerSelect';
import { STATE, SCHEMA, METHOD } from './StockTakeBillConstants';
import StockTakeBinSelect from './StockTakeBinSelect';
import ArticleSelect from '@/pages/Component/Select/ArticleSelect';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import { qtyStrToQty } from '@/utils/QpcStrUtil';
import Empty from '@/pages/Component/Form/Empty';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
const { TextArea } = Input;

const noCareBinUsages = [binUsage.VendorRtnReceiveTempBin.name, binUsage.VendorRtnBin.name, binUsage.VendorRtnPickUpTempBin.name,
binUsage.VendorRtnCollectTempBin.name, binUsage.VendorRtnCollectBin.name];
@connect(({ stockTakeBill, article, bin, loading }) => ({
  stockTakeBill, article, bin,
  loading: loading.models.stockTakeBill,
}))
@Form.create()
export default class StockTakeBillCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      title: commonLocale.createLocale + stockTakeBillLocal.title,
      entity: {
        taker: {
          uuid: loginUser().uuid,
          code: loginUser().code,
          name: loginUser().name,
        },
        checkItems: [],
      },
      taker: {
        uuid: loginUser().uuid,
        code: loginUser().code,
        name: loginUser().name
      },
      articles: {},
      bins: []
    }
  }
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    const { articles, bins } = this.state;

    const articleUuids = [];
    const bincodes = [];
    if (nextProps.stockTakeBill.entity && this.props.stockTakeBill.entityUuid) {
      this.setState({
        entity: nextProps.stockTakeBill.entity,
        title: '编辑盘点单'
      });

      if (nextProps.stockTakeBill.entity && nextProps.stockTakeBill.entity.checkItems
        && this.props.stockTakeBill.entityUuid && !this.state.entity.uuid) {
        const that = this;
        nextProps.stockTakeBill.entity.checkItems.forEach(function (e) {
          if (articleUuids.indexOf(e.article.articleUuid) == -1) {
            articleUuids.push(e.article.articleUuid);
          }
          if (bincodes.indexOf(e.binCode) == -1) {
            bincodes.push(e.binCode);
          }
        });

        that.queryArticles(articleUuids);
        that.queryBins(bincodes);
      }
    }

    if (nextProps.containers) {

    }
    if (nextProps.article.articles && nextProps.article.articles.length > 0) {
      nextProps.article.articles.forEach(function (e) {
        articles[e.uuid] = e;
      });

      this.setState({
        articles: articles
      });
    }

    if (nextProps.article.entity && nextProps.article.entity.uuid && !articles[nextProps.article.entity.uuid]) {
      articles[nextProps.article.entity.uuid] = nextProps.article.entity;
      this.setState({
        articles: articles
      });

    }

    if (nextProps.bin.binEntity && nextProps.bin.binEntity.uuid && !bins[nextProps.bin.binEntity.code]) {
      bins[nextProps.bin.binEntity.code] = nextProps.bin.binEntity;
      this.setState({
        bins: bins
      });
    }

    if (nextProps.bin.bins && nextProps.bin.bins.length > 0) {
      nextProps.bin.bins.forEach(function (e) {
        bins[e.code] = e;
      })

      this.setState({
        bins: bins
      });
    }
  }

  queryArticles = (articleUuids) => {
    this.props.dispatch({
      type: 'article/queryByUuids',
      payload: articleUuids
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

  queryBins = (bincodes) => {
    const { bins } = this.state;
    this.props.dispatch({
      type: 'bin/queryByBincodes',
      payload: {
        bincodes: bincodes,
        dcUuid: this.props.stockTakeBill.entity.dcUuid
      },
    });
  }

  queryBin = (bincode) => {
    const { bins } = this.state;
    this.props.dispatch({
      type: 'bin/getBinByCode',
      payload: {
        code: bincode,
        dcUuid: this.props.stockTakeBill.entity.dcUuid
      },
    });
  }

  /**
   * 刷新
   */
  refresh = () => {
    if (this.props.entityUuid) {
      this.props.dispatch({
        type: 'stockTakeBill/getForEdit',
        payload: this.props.stockTakeBill.entityUuid
      });
    }
  }
  /**
  * 取消
  */
  onCancel = () => {
    this.props.dispatch({
      type: 'stockTakeBill/showPage',
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

    this.props.dispatch({
      type: 'stockTakeBill/check',
      payload: newData,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.onView(newData.stockTakeBillUuid)
        }
      }
    });

  }

  onView = (uuid) => {
    this.props.dispatch({
      type: 'stockTakeBill/showPage',
      payload: {
        showPage: 'view',
        entityUuid: uuid
      }
    });
  }

  validData = (data) => {
    const { entity } = this.state;

    const newData = {};
    newData.stockTakeBillUuid = entity.uuid;
    newData.version = entity.version;
    newData.taker = JSON.parse(data.taker);
    newData.dcUuid = loginOrg().uuid;
    newData.companyUuid = loginCompany().uuid;
    newData.note = data.note;

    newData.itemInfos = entity.checkItems;

    for (let i = newData.itemInfos.length - 1; i >= 0; i--) {
      const shelfLife = this.getShelfLife(newData.itemInfos[i]);

      if (!newData.itemInfos[i].article) {
        message.error(`第${newData.itemInfos[i].line}行商品不能为空！`);
        return false;
      }

      if (newData.itemInfos[i].article && !newData.itemInfos[i].binCode) {
        message.error(`第${newData.itemInfos[i].line}行货位代码不能为空！`);
        return false;
      }

      if (newData.itemInfos[i].article && !newData.itemInfos[i].containerBarcode) {
        message.error(`第${newData.itemInfos[i].line}行容器条码不能为空！`);
        return false;
      }

      if (newData.itemInfos[i].article && !newData.itemInfos[i].productionDate) {
        message.error(`第${newData.itemInfos[i].line}行生产日期不能为空！`);
        return false;
      }

      const binUsage = this.getBinUsage(newData.itemInfos[i].binCode);
      if (newData.itemInfos[i].article && newData.itemInfos[i].productionDate
        && noCareBinUsages.indexOf(binUsage) === -1
        && moment(newData.itemInfos[i].productionDate).startOf('day') > moment(new Date()).startOf('day')
        && shelfLife && shelfLife.type !== 'NOCARE') {
        message.error(`第${newData.itemInfos[i].line}行生产日期不能晚于当前日期！`);
        return false;
      }

      newData.itemInfos[i].productionDate = formatDate(newData.itemInfos[i].productionDate, true);
      newData.itemInfos[i].validDate = formatDate(newData.itemInfos[i].validDate, true);
    }

    for (let i = 0; i < newData.itemInfos.length; i++) {
      for (let j = i + 1; j < newData.itemInfos.length; j++) {
        if (newData.itemInfos[i].article.articleUuid === newData.itemInfos[j].article.articleUuid &&
          newData.itemInfos[i].binCode === newData.itemInfos[j].binCode &&
          newData.itemInfos[i].containerBarcode === newData.itemInfos[j].containerBarcode &&
          newData.itemInfos[i].qpcStr === newData.itemInfos[j].qpcStr &&
          newData.itemInfos[i].vendor.uuid === newData.itemInfos[j].vendor.uuid
          && newData.itemInfos[i].productionBatch === newData.itemInfos[j].productionBatch) {
          message.error(`第${newData.itemInfos[i].line}行与第${newData.itemInfos[j].line}行重复！`);
          return false;
        }

        if (newData.itemInfos[i].binCode !== newData.itemInfos[j].binCode &&
          newData.itemInfos[i].containerBarcode === newData.itemInfos[j].containerBarcode
          && newData.itemInfos[i].containerBarcode !== '-') {
          message.error(`第${newData.itemInfos[i].line}行与第${newData.itemInfos[j].line}行容器相同，货位不同！`);
          return false;
        }
      }
    }

    return newData;
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

    let price = article.purchasePrice;
    article.qpcs.forEach(function (e) {
      let volume = e.width * e.height * e.length;
      qpcStrs.push({
        qpcStr: e.qpcStr,
        munit: e.munit ? e.munit : '-',
        spec: article.spec,
        qpc: e.paq,
        volume: volume,
        weight: e.weight,
        price: price,
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

  getBinContainers = (binCode, index) => {
    const { entity } = this.state;

    this.props.dispatch({
      type: 'bin/getContainersByBinCode',
      payload: {
        binCode: binCode,
      },
      callback: (response) => {
        if (response && response.success && response.data) {
          if (response.data.stockContainerCnt == 1) {
            entity.checkItems[index - 1].containerBarcode = response.data.containerList[0];
          } else {
            entity.checkItems[index - 1].containerBarcode = ""
          }
        }
        this.setState({ entity: { ...entity } })
      },
    })
  }
  /**
 * 表格变化时
 * @param {*} e 
 * @param {*} fieldName 
 * @param {*} key 
 */
  handleFieldChange(value, field, index) {
    const { entity } = this.state;

    if (field === 'binCode') {
      entity.checkItems[index - 1].binCode = JSON.parse(value).binCode;
      entity.checkItems[index - 1].wrhUuid = JSON.parse(value).wrhUuid;
      this.queryBin(JSON.parse(value).binCode);
      const binUsage = this.getBinUsage(JSON.parse(value).binCode);

      if (binUsage === 'PickUpBin' || binUsage === 'PickUpStorageBin') {
        entity.checkItems[index - 1].containerBarcode = "-";
      } else {
        this.getBinContainers(JSON.parse(value).binCode, index);
      }
    } else if (field === 'containerBarcode') {
      entity.checkItems[index - 1].containerBarcode = value;
    }
    if (field === 'article') {
      const article = JSON.parse(value);
      entity.checkItems[index - 1].article = {
        articleUuid: article.uuid,
        articleCode: article.code,
        articleName: article.name,
        articleSpec: article.spec,
        munit: undefined
      };

      entity.checkItems[index - 1].vendor = undefined;
      entity.checkItems[index - 1].productionBatch = undefined;
      entity.checkItems[index - 1].productionDate = undefined;
      entity.checkItems[index - 1].validDate = undefined;
      entity.checkItems[index - 1].qpcStr = undefined;
      entity.checkItems[index - 1].caseQtyStr = undefined;
      entity.checkItems[index - 1].qty = undefined;

      this.queryArticle(article.uuid);
    } else if (field === 'qpcStr') {
      const qpcStrMunit = JSON.parse(value);
      entity.checkItems[index - 1].qpcStr = qpcStrMunit.qpcStr;
      entity.checkItems[index - 1].article.munit = qpcStrMunit.munit;
      entity.checkItems[index - 1].article.articleSpec = qpcStrMunit.spec;
      entity.checkItems[index - 1].volume = qpcStrMunit.volume;
      entity.checkItems[index - 1].weight = qpcStrMunit.weight;
      entity.checkItems[index - 1].price = qpcStrMunit.price;
      entity.checkItems[index - 1].qpc = qpcStrMunit.qpc;
      if (entity.checkItems[index - 1].caseQtyStr)
        entity.checkItems[index - 1].qty = qtyStrToQty(entity.checkItems[index - 1].caseQtyStr, entity.checkItems[index - 1].qpcStr);
    } else if (field === 'productionDate') {
      const binUsage = this.getBinUsage(entity.checkItems[index - 1].binCode);
      if (noCareBinUsages.indexOf(binUsage) === -1) {
        if (value.startOf('day') > moment(new Date()).startOf('day')) {
          message.error('生产日期不能晚于当前日期')
          return;
        }

        const shelfLife = this.getShelfLife(entity.checkItems[index - 1]);
        entity.checkItems[index - 1].productionDate = value.startOf('day');
        entity.checkItems[index - 1].validDate = moment(value).add(shelfLife.days, 'days');
        entity.checkItems[index - 1].productionBatch = moment(entity.checkItems[index - 1].productionDate).format('YYYYMMDD');
      } else {
        entity.checkItems[index - 1].productionDate = value.startOf('day');
        entity.checkItems[index - 1].validDate = value.startOf('day');
        entity.checkItems[index - 1].productionBatch = '8881231';
      }
    } else if (field === 'validDate') {
      const shelfLife = this.getShelfLife(entity.checkItems[index - 1]);
      entity.checkItems[index - 1].validDate = value.startOf('day');
      entity.checkItems[index - 1].productionDate = moment(value).add(-shelfLife.days, 'days');
      entity.checkItems[index - 1].productionBatch = moment(entity.checkItems[index - 1].productionDate).format('YYYYMMDD');
    }
    else if (field === 'caseQtyStr') {
      entity.checkItems[index - 1].caseQtyStr = value;
      entity.checkItems[index - 1].qty = qtyStrToQty(value, entity.checkItems[index - 1].qpcStr);
    } else if (field === 'vendor') {
      entity.checkItems[index - 1].vendor = JSON.parse(value).vendor;
    } else if (field === 'productionBatch') {
      entity.checkItems[index - 1].productionBatch = value;

    }

    this.setState({
      entity: { ...entity },
    });
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
      type: article.shelfLifeType,
      days: article.shelfLifeDays
    };
  }

  getBinUsage = (binCode) => {
    if (!binCode) {
      return undefined;
    }

    const { bins } = this.state;

    const bin = bins[binCode];
    if (!bin) {
      return undefined;
    }

    return bin.usage;
  }

  disabledStartDate = (current) => {
    return current && (current > moment().add(0, 'days').endOf('day'));
  }

  /**
   * 绘制表单
   */
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, taker } = this.state;

    let basicCols = [
      <CFormItem key='schema' label={stockTakeBillLocal.schema}>
        {
          getFieldDecorator('schema')(
            <span>{entity.takeSchema ? SCHEMA[entity.takeSchema].caption : <Empty />}</span>
          )
        }
      </CFormItem>,
      <CFormItem key='method' label={stockTakeBillLocal.method}>
        {
          getFieldDecorator('method')(
            <span>{entity.method ? METHOD[entity.method].caption : <Empty />}</span>
          )
        }
      </CFormItem>,
      <CFormItem key='stockTakePlan' label={stockTakeBillLocal.stockTakePlan}>
        {
          getFieldDecorator('stockTakePlan')(
            <span>{entity.takePlanBill}</span>
          )
        }
      </CFormItem>,
      <CFormItem key='serialNum' label={stockTakeBillLocal.serialNum}>
        {
          getFieldDecorator('serialNum')(
            <span>{entity.serialNum}</span>
          )
        }
      </CFormItem>,
      <CFormItem key='owner' label={commonLocale.ownerLocale}>
        {
          getFieldDecorator('owner')(
            <span>{convertCodeName(entity.owner)}</span>
          )
        }
      </CFormItem>,
      <CFormItem key='taker' label={stockTakeBillLocal.taker}>
        {
          getFieldDecorator('taker', {
            initialValue: JSON.stringify(entity.taker && entity.taker.uuid ? entity.taker : taker),
            rules: [
              { required: true, message: notNullLocale(stockTakeBillLocal.taker) }
            ],
          })(
            <UserSelect
              autoFocus
              single={true}
            />
          )
        }
      </CFormItem>
    ]

    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={basicCols} />,
    ];
  }

  /**
   * 绘制明细表格
   */
  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, containers } = this.state;
    let articleCols = [
      {
        title: '货位',
        key: 'binCode',
        width: 130,
        render: (text, record) => {
          return (
            <StockTakeBinSelect
              value={record.binCode}
              onChange={e => this.handleFieldChange(e, 'binCode', record.line)}
              placeholder={'选择货位'}
              single
              data={entity.items}
              style={{ width: '100%' }}
            />
          );
        },
      }, {
        title: commonLocale.inContainerBarcodeLocale,
        key: 'containerBarcode',
        width: 180,
        render: (text, record) => {
          const binUsage = this.getBinUsage(record.binCode);
          if (!binUsage || record.uuid)
            return <span>{record.containerBarcode ? record.containerBarcode : '-'}</span>
          if (binUsage === 'PickUpBin' || binUsage === 'PickUpStorageBin') {
            record.containerBarcode = '-'
            return (
              <span>-</span>
            );
          } else {
            return (
              <ContainerSelect
                binCode={record.binCode}
                value={record.containerBarcode}
                //containers={containers}
                onChange={e => this.handleFieldChange(e, 'containerBarcode', record.line)}
                placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)}
              />
            );
          }

        },
      },
      {
        title: '商品',
        key: 'article',
        width: 170,
        render: record => {
          return (
            <ArticleSelect
              value={record.article ? convertArticleDocField(record.article) : undefined}
              ownerUuid={entity.owner ? entity.owner.uuid : '-'}
              placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
              onChange={e => this.handleFieldChange(e, 'article', record.line)}
              showSearch={true}
              single
            />
          );
        }
      }, {
        title: commonLocale.inQpcAndMunitLocale,
        key: 'qpcStr',
        width: itemColWidth.qpcStrEditColWidth,
        render: (text, record) => {
          let value;
          if (record.qpcStr) {
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
                  record.price = e.price;

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
                record.price = this.getQpcStrs(record)[0].price;

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
        }
      }, {
        title: commonLocale.productionDateLocale,
        key: 'productionDate',
        width: 130,
        render: (text, record) => {
          if (record.productionDate){
            if(moment(record.productionDate).format('YYYY-MM-DD') !== '8888-12-31'){
              return <DatePicker
              defaultValue={record.productionDate && moment(record.productionDate).format('YYYY-MM-DD') !== '8888-12-31'
                ? moment(record.productionDate, 'YYYY-MM-DD') : ''}
              allowClear={false}
              disabledDate={this.disabledStartDate}
              onChange={(data) => this.handleFieldChange(data, 'productionDate', record.line)} />;
            }else{
              return <span>{moment(record.productionDate).format('YYYY-MM-DD')}</span>
            }
          }  //如果快照里有值，就不要判断了，直接带出
          // return <span>{moment(record.productionDate).format('YYYY-MM-DD')}</span> 
          const shelfLife = this.getShelfLife(record);
          const binUsage = this.getBinUsage(record.binCode);
          if (!shelfLife)
            return <span>{record.productionDate ? moment(record.productionDate).format('YYYY-MM-DD') : <Empty />}</span>
          if (shelfLife.type === 'NOCARE' || noCareBinUsages.indexOf(binUsage) > 0) {
            record.productionDate = moment('8888-12-31', 'YYYY-MM-DD');
            record.validDate = moment('8888-12-31', 'YYYY-MM-DD');
            record.productionBatch = moment(record.productionDate).format('YYYYMMDD');
          }
          if ('PRODUCTDATE' === shelfLife.type && noCareBinUsages.indexOf(binUsage) === -1) {
            return <DatePicker
              defaultValue={record.productionDate && moment(record.productionDate).format('YYYY-MM-DD') !== '8888-12-31'
                ? moment(record.productionDate, 'YYYY-MM-DD') : ''}
              allowClear={false}
              disabledDate={this.disabledStartDate}
              onChange={(data) => this.handleFieldChange(data, 'productionDate', record.line)} />;
          } else {
            return (
              <span>{record.productionDate ? moment(record.productionDate).format('YYYY-MM-DD') : <Empty />}</span>
            );
          }
        }
      },
      {
        title: commonLocale.validDateLocale,
        key: 'validDate',
        width: 130,
        render: record => {
          const shelfLife = this.getShelfLife(record);
          const binUsage = this.getBinUsage(record.binCode);

          if (!shelfLife || noCareBinUsages.indexOf(record.binUsage) > 0) {
            return <span>{record.validDate ? moment(record.validDate).format('YYYY-MM-DD') : <Empty />}</span>
          }
          if ('VALIDDATE' === shelfLife.type && noCareBinUsages.indexOf(binUsage) === -1) {
            return <DatePicker
              value={record.validDate ? moment(record.validDate) : null}
              allowClear={false}
              onChange={(data) => this.handleFieldChange(data, 'validDate', record.line)} />;
          } else {
            return (
              <span>{record.validDate ? moment(record.validDate).format('YYYY-MM-DD') : <Empty />}</span>
            );
          }
        }
      }, {
        title: commonLocale.caseQtyStrLocale,
        key: 'caseQtyStr',
        width: 180,
        render: (record) => {
          return (
            <QtyStrInput
              value={record.caseQtyStr ? record.caseQtyStr : undefined}
              onChange={
                e => this.handleFieldChange(e, 'caseQtyStr', record.line)
              }
            />
          );
        }
      },
      {
        title: commonLocale.inQtyLocale,
        key: 'qty',
        width: 70,
        render: (text, record) => {
          return <span>{record.qty ? record.qty : 0} </span>
        }
      },
      {
        title: commonLocale.productionBatchLocale,
        key: 'productionBatch',
        width: 110,
        render: record => {
          let manageBatch = undefined;
          if (record.article && this.state.articles[record.article.articleUuid]) {
            manageBatch = this.state.articles[record.article.articleUuid].manageBatch;
          }
          if (manageBatch == true || record.productionBatch) {
            return <Input value={record.productionBatch} placeholder={placeholderLocale(commonLocale.productionBatchLocale)}
              onChange={
                e => this.handleFieldChange(e.target.value, 'productionBatch', record.line)
              }
            />
          } else {
            return (
              <span>{record.productionBatch ? record.productionBatch : <Empty />}</span>
            );
          }
        }
      },
      {
        title: commonLocale.vendorLocale,
        key: 'vendor',
        width: 120,
        render: record => {
          let value;
          if (record.vendor) {
            value = convertCodeName(record.vendor);
          } else {
            if (this.getVendors(record).length > 0) {
              let vendors = this.getVendors(record);
              vendors && vendors.forEach(
                function (e) {
                  if (e.defaultVendor) {
                    value = JSON.stringify(e.vendor);
                    record.vendor = e.vendor;
                  }
                }
              )
              if (!value) {
                record.vendor = this.getVendors(record)[0].vendor;
                value = JSON.stringify(this.getVendors(record)[0].vednor);
              }
            }
          }
          return (
            <Select
              value={value}
              placeholder={placeholderChooseLocale(commonLocale.vendorLocale)}
              onChange={e => this.handleFieldChange(e, 'vendor', record.line)}
            >
              {this.getVendorOptions(record)}
            </Select>
          );
        }
      },

    ];
    return (
      <ItemEditTable
        title='商品信息'
        columns={articleCols}
        data={entity.checkItems?entity.checkItems:[]}
        // scroll={{ x: 2400 }}
      />
    )
  }
}
