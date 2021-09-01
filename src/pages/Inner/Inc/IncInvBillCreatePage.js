import CreatePage from '@/pages/Component/Page/CreatePage';
import { Form, Modal, Select, DatePicker, InputNumber, message, Input } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { formatDate } from '@/utils/utils';
import { commonLocale, notNullLocale, placeholderChooseLocale, placeholderLocale } from '@/utils/CommonLocale';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import FormPanel from '@/pages/Component/Form/FormPanel';
import UserSelect from '@/pages/Component/Select/UserSelect';
import CFormItem from '@/pages/Component/Form/CFormItem';
import ArticleSelect from './ArticleSelect';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import IncBinSelect from './IncBinSelect';
import IncContainerSelect from './IncContainerSelect';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import { loginUser, loginCompany, loginOrg, getDefOwner } from '@/utils/LoginContext';
import { PRETYPE } from '@/utils/constants';
import { SHELFLIFE_TYPE } from '@/pages/Basic/Article/Constants';
import { binUsage } from '@/utils/BinUsage';
import { convertCodeName } from '@/utils/utils';
import { qtyStrToQty, toQtyStr, add } from '@/utils/QpcStrUtil';
import { incLocale } from './IncInvBillLocale';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import Empty from '@/pages/Component/Form/Empty';
import { MAX_DECIMAL_VALUE } from '@/utils/constants';
import ItemBatchAddModal from './ItemBatchAddModal';
@connect(({ inc, article, stock, pickSchema, loading }) => ({
  inc,
  article,
  stock,
  pickSchema,
  loading: loading.models.inc,
}))
@Form.create()
export default class IncInvBillCreatePage extends CreatePage {
  constructor(props) {
    super(props);
    this.state = {
      title: commonLocale.createLocale + incLocale.title,
      entity: {
        incer: {
          uuid: loginUser().uuid,
          code: loginUser().code,
          name: loginUser().name
        },
        owner: getDefOwner() ? getDefOwner() : undefined,
        items: []
      },
      auditButton : true,
      addStockDtl: false,
      articles: {},
      line:0,
      auditPermission:'iwms.inner.inc.audit',
    }
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'inc/get',
      payload: {
        uuid: this.props.entityUuid
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    const { articles } = this.state;
    const articleUuids = [];
    if (nextProps.entityUuid && !this.state.entity.uuid && nextProps.inc.entity.items) {
      nextProps.inc.entity.items.forEach(function (e) {
        if (articleUuids.indexOf(e.article.articleUuid) == -1) {
          articleUuids.push(e.article.uuid);
        }
      });

      this.setState({
        entity: nextProps.inc.entity,
        title: incLocale.title + "：" + nextProps.inc.entity.billNumber
      });
      this.queryArticles(articleUuids);
    }
    if (nextProps.article.articles && nextProps.article.articles.length > 0) {
      nextProps.article.articles.forEach(function (e) {
        articles[e.uuid] = e;
      });
      this.setState({
        articles: articles
      });
    }
    if (nextProps.article.entity.uuid) {
      articles[nextProps.article.entity.uuid] = nextProps.article.entity;
      this.setState({
        articles: articles
      });
    }
  }
  handleCancel = () => {
    this.props.dispatch({
      type: 'inc/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  onSave = (data) => {
    const newData = this.validData(data);
    if (!newData) {
      return;
    }
    let type = 'inc/onSave';
    if (newData.uuid) {
      type = 'inc/onModify';
    }
    this.props.dispatch({
      type: type,
      payload: newData,
      callback: response => {
        if (response && response.success) {
          message.success('溢余单保存成功');
        }
      }
    });
  }
  onSaveAndCreate = (data) => {
    const newData = this.validData(data);
    if (!newData) {
      return;
    }
    this.props.dispatch({
      type: 'inc/onSaveAndCreate',
      payload: newData,
      callback: response => {
        if (response && response.success) {
          message.success('溢余单保存成功');
          this.setState({
            entity: {
              incer: {
                uuid: loginUser().uuid,
                code: loginUser().code,
                name: loginUser().name
              },
              items: [],
            }
          });
          this.props.form.resetFields();
        }
      }
    });
  }
  validData = (data) => {
    const { entity, articles } = this.state;
    const newData = { ...entity };
    newData.incer = JSON.parse(data.incer);
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
      message.error('溢余单明细不能为空！');
      return false;
    }
    for (let i = newData.items.length - 1; i >= 0; i--) {
      if (!newData.items[i].article) {
        message.error(`溢余单明细第${newData.items[i].line}行商品不能为空！`);
        return false;
      }
      if (!newData.items[i].productionBatch) {
        message.error(`溢余单明细第${newData.items[i].line}行批号不能为空！`);
        return false;
      }

      if (newData.items[i].article && !newData.items[i].vendor) {
        message.error(`溢余单明细第${newData.items[i].line}行供应商不能为空！`);
        return false;
      }
      if (newData.items[i].article && newData.items[i].price === null) {
        message.error(`溢余单明细第${newData.items[i].line}行单价不能为空！`);
        return false;
      }
      if (newData.items[i].article && !newData.items[i].binCode) {
        message.error(`溢余单明细第${newData.items[i].line}行货位代码不能为空！`);
        return false;
      }
      if (newData.items[i].article && !newData.items[i].containerBarcode) {
        message.error(`溢余单明细第${newData.items[i].line}行容器条码不能为空！`);
        return false;
      }
      if (newData.items[i].article && !newData.items[i].productDate) {
        message.error(`溢余单明细第${newData.items[i].line}行生产日期不能为空！`);
        return false;
      } else {
        newData.items[i].productDate = formatDate(newData.items[i].productDate, true);
      }
      if (newData.items[i].article && !newData.items[i].validDate) {
        message.error(`溢余单明细第${newData.items[i].line}行到效期不能为空！`);
        return false;
      } else {
        newData.items[i].validDate = formatDate(newData.items[i].validDate, true);
      }
      if (newData.items[i].article && newData.items[i].qty === 0) {
        message.error(`溢余单明细第${newData.items[i].line}行溢余数量不能为0！`);
        return false;
      }
      if (newData.items[i].article && newData.items[i].note && newData.items[i].note.length > 255) {
        message.error(`溢余单明细第${newData.items[i].line}行备注长度最大为255！`);
        return false;
      }
      newData.items[i].spec = newData.items[i].spec ? newData.items[i].spec : articles && articles[newData.items[i].article.uuid] && articles[newData.items[i].article.uuid].spec ? articles[newData.items[i].article.uuid].spec : '';
    }
    for (let i = 0; i < newData.items.length; i++) {
      for (let j = i + 1; j < newData.items.length; j++) {
        if (newData.items[i].article.uuid === newData.items[j].article.uuid &&
          newData.items[i].binCode === newData.items[j].binCode &&
          newData.items[i].containerBarcode === newData.items[j].containerBarcode &&
          newData.items[i].productionBatch === newData.items[j].productionBatch &&
          newData.items[i].qpcStr === newData.items[j].qpcStr &&
          newData.items[i].vendor.uuid === newData.items[j].vendor.uuid &&
          newData.items[i].price === newData.items[j].price) {
          message.error(`溢余单明细第${newData.items[i].line}行与第${newData.items[j].line}行重复！`);
          return false;
        }
      }
    }
    newData.companyUuid = loginCompany().uuid;
    newData.dcUuid = loginOrg().uuid;
    return newData;
  }
  onOwnerChange = (value) => {
    const { entity } = this.state;
    if (!entity.owner || entity.items.length === 0) {
      entity.owner = JSON.parse(value);
      return;
    }
    if (entity.owner.uuid != JSON.parse(value).uuid) {
      Modal.confirm({
        title: '修改货主会导致明细清空，请确认修改？',
        okText: '确认',
        cancelText: '取消',
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
        title: '修改仓位会导致明细货位和容器清空，请确认修改？',
        okText: '确认',
        cancelText: '取消',
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
  /**
   * 批量添加库存明细弹出框
   */
  handlebatchAddVisible = () => {
    this.setState({
      addStockDtl: !this.state.addStockDtl
    });
  }
  /**获取批量增加的集合*/
  getItemList = (value) => {
    const { entity,line } = this.state;
    var newStocksList = [];
    let index =line?line-1:entity.items.length-1;
    for(let i =0;i<value.length;i++){
      if (entity.items && entity.items.find(function (item) {
        return item.article && item.article.uuid === value[i].article.articleUuid && item.binCode === value[i].binCode &&
          item.containerBarcode === value[i].containerBarcode && item.vendor.uuid === value[i].vendor.uuid &&
          item.stock === value[i].stock
          && item.qpcStr === value[i].qpcStr  && item.manageBatch === value[i].manageBatch
      }) === undefined) {
        if(value[i].article && value[i].article.articleCode) {
          value[i].spec = value[i].article.articleSpec;
          value[i].article = {
            uuid: value[i].article.articleUuid,
            code: value[i].article.articleCode,
            name: value[i].article.articleName
          };
          this.queryArticle(value[i].article.uuid);
          value[i].productDate = value[i].productionDate;
        }
        newStocksList.push(value[i]);
      }
    }

    // this.state.line = entity.items.length;
    newStocksList.map(bill => {
      bill.line = this.state.line;
      bill.qty = 0;
      this.state.line++;
    });
    entity.items.splice(index, 1,...newStocksList);
    entity.items.forEach((item,id)=>{
      item.line=id+1;
    })
    // entity.items = [...entity.items, ...newStocksList];
    this.handlebatchAddVisible();
    this.setState({
      entity: { ...entity }
    })
  }
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, defOwner } = this.state;
    let cols = [
      <CFormItem label='溢余类型' key='preType'>
        {getFieldDecorator('type', {
          initialValue: entity.type,
          rules: [
            { required: true, message: notNullLocale("溢余类型") }
          ],
        })(<PreTypeSelect placeholder={placeholderChooseLocale("溢余类型")} preType={PRETYPE.incInvType} />)}
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
          initialValue: JSON.stringify(entity.owner),
          rules: [
            { required: true, message: notNullLocale(commonLocale.inOwnerLocale) }
          ],
        })(<OwnerSelect onlyOnline placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} onChange={this.onOwnerChange} />)}
      </CFormItem>,
      <CFormItem label='溢余员' key='incer'>
        {getFieldDecorator('incer', {
          initialValue: JSON.stringify(entity.incer),
          rules: [
            { required: true, message: notNullLocale("溢余员") }
          ],
        })(<UserSelect single={true} />)}
      </CFormItem>,
    ];
    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={cols} noteCol={this.drawNotePanel()}  noteLabelSpan={4} />
    ];
  }
  onFieldChange = (value, field, index) => {
    const { entity } = this.state;
    this.setState({
      line: index
    });
    if (field === 'article') {
      const article = JSON.parse(value);
      entity.items[index - 1].article = {
        uuid: article.uuid,
        code: article.code,
        name: article.name
      }
      entity.items[index - 1].spec = undefined;
      entity.items[index - 1].vendor = undefined;
      entity.items[index - 1].price = undefined;
      entity.items[index - 1].productionBatch = undefined;
      entity.items[index - 1].productDate = undefined;
      entity.items[index - 1].validDate = undefined;
      entity.items[index - 1].qpcStr = undefined;
      this.queryArticle(article.uuid);
    } else if (field === 'binCode') {
      const binCodeUsage = JSON.parse(value);
      if(entity.items[index - 1].binCode&&entity.items[index - 1].binCode != binCodeUsage.code){
        entity.items[index - 1].spec = undefined;
        entity.items[index - 1].vendor = undefined;
        entity.items[index - 1].price = undefined;
        entity.items[index - 1].productionBatch = undefined;
        entity.items[index - 1].productDate = undefined;
        entity.items[index - 1].validDate = undefined;
        entity.items[index - 1].qpcStr = undefined;
        entity.items[index - 1].article = undefined;
        }
      entity.items[index - 1].binCode = binCodeUsage.code;
      entity.items[index - 1].binUsage = binCodeUsage.usage;
      
      if (binCodeUsage.usage === binUsage.PickUpBin.name || binCodeUsage.usage === binUsage.PickUpStorageBin.name) {
        entity.items[index - 1].containerBarcode = '-';
      }
      
      this.setState({
        binCode: binCodeUsage.code
      })
      this.props.dispatch({
        type: 'stock/query',
        payload: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid,
          binCode: binCodeUsage.code,
          ownerCode: entity.owner.code,
          state: 'NORMAL'
        },
        callback: response => {
          if (response && response.success && response.data && response.data.length > 0) {
            this.handlebatchAddVisible();
          } else {
            this.props.dispatch({
              type: 'pickSchema/query',
              payload: {
                page: 0,
                pageSize: 10,
                searchKeyValues: {
                  companyUuid: loginCompany().uuid,
                  dcUuid: loginOrg().uuid,
                  binCode: binCodeUsage.code
                }
              },
              callback: response => {
                if (response && response.success && response.data && response.data.records) {
                  if( response.data.records.length > 0 ) {
                    let data = response.data.records[0];
                    entity.items[index - 1].article = {
                      uuid: data.article.uuid,
                      code: data.article.code,
                      name: data.article.name
                    }
                    this.queryArticle(data.article.uuid);
                  }
                  this.setState({
                    entity: { ...entity }
                  })
                }
              }
            });
          }
        }
      });

    } else if (field === 'containerBarcode') {
      entity.items[index - 1].containerBarcode = value;
    } else if (field === 'vendor') {
      entity.items[index - 1].vendor = JSON.parse(value);
      entity.items[index - 1].price = undefined;
    } else if (field === 'price') {
      entity.items[index - 1].price = value;
    } else if (field === 'productDate') {
      const shelfLife = this.getShelfLife(entity.items[index - 1]);
      entity.items[index - 1].productDate = value.startOf('day');
      entity.items[index - 1].validDate = moment(value).add(shelfLife.days, 'days');
      entity.items[index - 1].productionBatch = moment(entity.items[index - 1].productDate).format('YYYYMMDD');
    } else if (field === 'validDate') {
      const shelfLife = this.getShelfLife(entity.items[index - 1]);
      entity.items[index - 1].validDate = value.startOf('day');
      entity.items[index - 1].productDate = moment(value).add(-shelfLife.days, 'days');
      entity.items[index - 1].productionBatch = moment(entity.items[index - 1].productDate).format('YYYYMMDD');
    } else if (field === 'qpcStr') {
      const qpcStrMunit = JSON.parse(value);
      entity.items[index - 1].qpcStr = qpcStrMunit.qpcStr;
      entity.items[index - 1].munit = qpcStrMunit.munit;
      entity.items[index - 1].qty = qtyStrToQty(entity.items[index - 1].qtyStr, qpcStrMunit.qpcStr);
    } else if (field === 'qtyStr') {
      entity.items[index - 1].qtyStr = value;
      entity.items[index - 1].qty = qtyStrToQty(value, entity.items[index - 1].qpcStr);
    } else if (field === 'productionBatch'){
      entity.items[index - 1].productionBatch = value.target.value;
    }
    this.setState({
      entity: { ...entity }
    });
  }
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
    let defaultVendor=article.vendors.find(item => item.defaultReceive === true);
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
  getVendorOptions = (record) => {
    const vendors = this.getVendors(record);
    const vendorOptions = [];
    vendors.length>0 && vendors.forEach(e => {
      vendorOptions.push(
        <Select.Option key={e.uuid} value={JSON.stringify(e)}>{convertCodeName(e)}</Select.Option>
      );
    });
    return vendorOptions;
  }
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
  getProductionBatch = (record)=>{
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
      manageBatch: article.manageBatch
    };
  }
  disabledProductDate(current) {
    return current > moment().endOf('day');
  }
  disabledValidDate(current) {
    return current && current < moment().add(-1, 'days').endOf('day');
  }
  drawTable = () => {
    const { entity, addStockDtl, binCode, isContainsBin } = this.state;

    let columns = [
      {
        title: commonLocale.bincodeLocale,
        key: 'binCode',
        fixed: 'left',
        width: colWidth.codeColWidth,
        render: record => {
          return (
            <IncBinSelect
              value={record.binCode}
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
            <ArticleSelect
              value={record.article ? convertCodeName(record.article) : undefined}
              ownerCode={entity.owner ? entity.owner.code : '-'}
              ownerUuid={entity.owner ? entity.owner.uuid : '-'}
              placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
              onChange={e => this.onFieldChange(e, 'article', record.line)}
              showSearch={true}
              binCode={binCode}
              isContainsBin={isContainsBin}
              single
            />
          );
        }
      },
      {
        title: '货位用途',
        key: 'binUsage',
        width: colWidth.enumColWidth,
        render: record => {
          return (
            <span>{record.binUsage ? binUsage[record.binUsage].caption : <Empty />}</span>
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
        title: commonLocale.inPriceLocale,
        key: 'price',
        width: itemColWidth.priceColWidth + 50,
        render: record => {
          let value = record.price;
          if (value === undefined) {
            value = this.getPrice(record);
            record.price = value;
          }
          return <InputNumber min={0} style={{ width: '100%' }} value={value} precision={4}
                              max={MAX_DECIMAL_VALUE}
                              placeholder={placeholderLocale(commonLocale.inPriceLocale)}
                              onChange={e => this.onFieldChange(e, 'price', record.line)} />
        }
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        key: 'qpcStr',
        width: itemColWidth.qpcStrEditColWidth,
        render: (record) => {
          let value = undefined;
          if (record.qpcStr) {
            value = record.qpcStr + "/" + record.munit;
          } else {
            if (this.getQpcStrs(record).length > 0) {
              record.qpcStr = this.getQpcStrs(record)[0].qpcStr;
              record.munit = this.getQpcStrs(record)[0].munit;
              if(record.qtyStr){
                record.qty = qtyStrToQty(record.qtyStr, record.qpcStr);
              }
              value = JSON.stringify(this.getQpcStrs(record)[0]);
            }
          }
          return (
            <Select value={value}
                    placeholder={placeholderChooseLocale(commonLocale.qpcStrLocale)}
                    onChange={e => this.onFieldChange(e, 'qpcStr', record.line)}>
              {this.getQpcStrOptions(record)}
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
            if(!record.productionBatch)
              record.productionBatch = moment(record.productDate).format('YYYY-MM-DD');
          }
          if ('PRODUCTDATE' === shelfLife.type) {
            return <DatePicker
              disabledDate={this.disabledProductDate}
              value={record.productDate ? moment(record.productDate) : null}
              allowClear={false}
              onChange={(data) => this.onFieldChange(data, 'productDate', record.line)}
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
              onChange={(data) => this.onFieldChange(data, 'validDate', record.line)}
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
        title: commonLocale.productionBatchLocale,
        key: 'productionBatch',
        width: itemColWidth.numberEditColWidth+50,
        render: record => {
          const value = this.getProductionBatch(record);
          if(value&&value.manageBatch==true&&value.type!='NOCARE'){
            return <Input value={record.productionBatch ? record.productionBatch : undefined}
                          onChange={e => this.onFieldChange(e, 'productionBatch', record.line)}
                          placeholder={placeholderLocale(commonLocale.productionBatchLocale)}
            />
          }else{
            return <span>{record.productionBatch ? record.productionBatch : <Empty />}</span>
          }
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
            <IncContainerSelect
              value={record.containerBarcode}
              binCode={record.binCode}
              placeholder={placeholderChooseLocale(commonLocale.containerLocale)}
              onChange={e => this.onFieldChange(e, 'containerBarcode', record.line)}
            />
          );
        }
      },
      {
        title: commonLocale.caseQtyStrLocale,
        key: 'qtyStr',
        width: itemColWidth.qtyStrEditColWidth,
        render: (record) => {
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
        width: itemColWidth.qtyColWidth,
        render: (record) => {
          record.qty = record.qty ? record.qty : 0;
          return <span>{record.qty}</span>
        }
      },
    ];
    return (
      <div>
        <ItemEditTable
          title='商品信息'
          columns={columns}
          // scroll={{ x: 2500 }}
          data={entity.items}
          drawTotalInfo={this.drawTotalInfo}
        />
        <ItemBatchAddModal
          visible = {addStockDtl}
          binCode = {binCode}
          getItemList = {this.getItemList}
          handleCancel = {this.handlebatchAddVisible}
        />
      </div>
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
      if (item.price && item.qty) {
        allAmount = allAmount + item.price * item.qty;
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
}
