import moment from 'moment';
import { connect } from 'dva';
import { loginCompany, loginOrg, loginUser, getDefOwner } from '@/utils/LoginContext';
import { Form, Select, Divider, Input, InputNumber, message, Col, DatePicker, Modal } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { qtyStrToQty, add, toQtyStr, Subtr, accAdd, accMul } from '@/utils/QpcStrUtil';
import { convertCodeName } from '@/utils/utils';
import { containerState } from '@/utils/ContainerState';
import { formatDate } from '@/utils/utils';
import { orgType } from '@/utils/OrgType';
import StoreSelect from '@/pages/Component/Select/StoreSelect';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import ArticleSelect from '@/pages/Component/Select/ArticleSelect';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { STATE } from '@/utils/constants';
import UserSelect from '@/pages/Component/Select/UserSelect';
import CreatePage from './CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import style from '@/pages/Component/Form/ItemEditTable.less';
import { storeRtnLocal } from './StoreRtnBillLocale';
import { Type, ReturnType } from './StoreRtnBillContants';
import RtnContainerModal from './RtnContainerModal';
import RtnTypeModal from './RtnTypeModal';
import TargetBinModal from './TargetBinModal';
import Empty from '@/pages/Component/Form/Empty';
import { billType, qpcStrFrom } from '@/pages/Facility/Config/BillQpcStr/BillQpcStrConfigContans';
import BinSelect from '@/pages/Component/Select/BinSelect';
import { binUsage } from '@/utils/BinUsage';
import { binState } from '@/utils/BinState';
import AlcDtlBatchAdd from './AlcDtlBatchAdd';
import MoveToContainerSelect from './MoveToContainerSelect';
const typeOptions = [];
Object.keys(Type).forEach(function (key) {
  typeOptions.push(<Option value={Type[key].name}
    key={Type[key].name}>
    {Type[key].caption}
  </Option>);
});

const returnTypeOptions = [];
Object.keys(ReturnType).forEach(function (key){
    returnTypeOptions.push(<Option value={ReturnType[key].name}
        key={ReturnType[key].name}>
            {ReturnType[key].caption}
        </Option>)
});
@connect(({ storeRtn, storeRtnNtc, article, billQpcStrConfig, pickSchema, loading }) => ({
  storeRtn, storeRtnNtc, article, billQpcStrConfig, pickSchema,
  loading: loading.models.storeRtn,
}))
@Form.create()
export default class NoNtcStoreRtnBillCreatePage extends CreatePage {
  constructor(props) {
    super(props);
    this.state = {
      title: commonLocale.createLocale + storeRtnLocal.noTitle,
      entityUuid: props.entityUuid,
      entity: {
        owner: getDefOwner(),
        rtner: {
          uuid: loginUser().uuid,
          code: loginUser().code,
          name: loginUser().name
        },
        items: []
      },
      rtner: {
        uuid: loginUser().uuid,
        code: loginUser().code,
        name: loginUser().name
      },
      items: [],
      line: 1,
      articles: [],
      auditButton: true,
      selectedRowKeys: [],
      containerModalVisible: false,
      alcModalVisible: false,
      typeModalVisible: false,
      pickUpBinModalVisible: false,
      batchAdd: false,
      billConfig: {},
      schemaList: []
    }
  }
  componentDidMount() {
    this.refresh();
    this.queryBillQpcStrConfig();
  }
  componentWillReceiveProps(nextProps) {
    const { articles } = this.state;
    if (this.state.entityUuid && nextProps.storeRtn.entity.uuid === this.state.entityUuid
      && !nextProps.storeRtnNtc.entity.uuid) {
      this.setState({
        entity: nextProps.storeRtn.entity,
        title: storeRtnLocal.title + "：" + nextProps.storeRtn.entity.billNumber,
      });
    }
    if (nextProps.article.entity && nextProps.article.entity.uuid
      && !articles[nextProps.article.entity.uuid]) {
      articles[nextProps.article.entity.uuid] = nextProps.article.entity;
      this.setState({
        articles: articles
      });
    }
    if (nextProps.billQpcStrConfig.entity && nextProps.billQpcStrConfig.entity.uuid) {
      this.setState({
        billConfig: nextProps.billQpcStrConfig.entity
      });
    }
    if (nextProps.pickSchema.schemaList && nextProps.pickSchema.schemaList != this.props.pickSchema.schemaList) {
      this.setState({
        schemaList: [...nextProps.pickSchema.schemaList]
      })
    }
  }
  queryBillQpcStrConfig = () => {
    this.props.dispatch({
      type: 'billQpcStrConfig/getByBillType',
      payload: {
        dcUuid: loginOrg().uuid,
        billType: 'RTNBILL'
      }
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
  queryArticles = () => {
    this.props.dispatch({
      type: 'article/query',
      payload: {
        ...this.state.pageFilter
      }
    });
  }
  /**
   * 刷新
   */
  refresh = () => {
    if (this.state.entityUuid) {
      this.props.dispatch({
        type: 'storeRtn/get',
        payload: this.state.entityUuid,
        callback: (response) => {
          if (response && response.success && response.data && response.data.items) {
            this.setState({
              items: response.data.items
            })
          }
        }
      });
    }
  }
  /**
   * 取消
   */
  onCancel = () => {
    this.props.form.resetFields();
    if (!this.props.storeRtn.entityUuid) {
      this.props.dispatch({
        type: 'storeRtn/showPage',
        payload: {
          showPage: 'query',
        }
      });
    } else {
      this.props.dispatch({
        type: 'storeRtn/showPage',
        payload: {
          showPage: 'view',
          entityUuid: this.props.storeRtn.entityUuid,
        }
      });
    }
  };
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
      shelfLifeType: article.shelfLifeType,
      shelfLifeDays: article.shelfLifeDays
    };
  }
  getProductionBatch = (record) => {
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
      manageBatch: article.manageBatch
    };
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
    bill.items = items;
    bill.companyUuid = loginCompany().uuid;
    bill.dcUuid = loginOrg().uuid;
    bill.owner = JSON.parse(bill.owner);
    bill.wrh = JSON.parse(bill.wrh);
    bill.store = JSON.parse(bill.store)
    bill.rtner = JSON.parse(data.rtner);
    bill.returnType = data.returnType;
    if (this.validate(bill) === false)
      return;
    if (!bill.uuid) {
      this.props.dispatch({
        type: 'storeRtn/save',
        payload: bill,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
          }
        }
      });
    } else {
      this.props.dispatch({
        type: 'storeRtn/modify',
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
    bill.items = this.state.items;
    bill.companyUuid = loginCompany().uuid;
    bill.dcUuid = loginOrg().uuid;
    bill.owner = JSON.parse(bill.owner);
    bill.store = JSON.parse(bill.store);
    bill.wrh = JSON.parse(bill.wrh);
    bill.rtner = JSON.parse(data.rtner);
    if (this.validate(bill) === false)
      return;
    this.props.dispatch({
      type: 'storeRtn/onSaveAndAudit',
      payload: bill,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.saveAndAuditSuccess);
        }
      }
    });
  }
  validate = (entity) => {
    if (entity.items.length === 0) {
      message.error('退仓明细不能为空');
      return false;
    }
    for (let i = entity.items.length - 1; i >= 0; i--) {
      const shelfLife = this.getShelfLife(entity.items[i]);
      if (!entity.items[i].article) {
        message.error(`第${entity.items[i].line}行商品不能为空！`);
        return false;
      }
      if (entity.items[i].article && !entity.items[i].vendor) {
        message.error(`第${entity.items[i].line}行供应商不能为空！`);
        return false;
      }

      if (entity.items[i].article && !entity.items[i].productionBatch) {
        message.error(`第${entity.items[i].line}行批号不能为空！`);
        return false;
      }
      if (entity.items[i].article && entity.items[i].type === 0) {
        message.error(`第${entity.items[i].line}行退仓类型不能为空！`);
        return false;
      }
      if (entity.items[i].article && entity.items[i].qty === 0) {
        message.error(`第${entity.items[i].line}行退仓数量不能为0！`);
        return false;
      }
      // if (entity.items[i].article && !(Type.RTNWRH.name == entity.items[i].type &&
      //   (binUsage.PickUpBin.name == entity.items[i].targetBinUsage || binUsage.PickUpStorageBin.name == entity.items[i].targetBinUsage))
      //   && !entity.items[i].containerBarcode) {
      //   message.error(`第${entity.items[i].line}行容器条码不能为空！`);
      //   return false;
      // }
      if (entity.items[i].article && !entity.items[i].productDate) {
        message.error(`第${entity.items[i].line}行生产日期不能为空！`);
        return false;
      }
      if (entity.items[i].article && entity.items[i].productDate
        && moment(entity.items[i].productDate).startOf('day') > moment(new Date()).startOf('day')
        && Type.RTNWRH.name === entity.items[i].type
        && shelfLife && shelfLife.shelfLifeType !== 'NOCARE') {
        message.error(`第${entity.items[i].line}行生产日期不能晚于当前日期！`);
        return false;
      }
      if (entity.items[i].article && !entity.items[i].validDate) {
        message.error(`第${entity.items[i].line}行到效期不能为空！`);
        return false;
      }
      if (entity.items[i].article && entity.items[i].validDate
        && moment(entity.items[i].validDate).startOf('day') < moment(new Date()).startOf('day')
        && Type.RTNWRH.name === entity.items[i].type
        && shelfLife && shelfLife.shelfLifeType !== 'NOCARE') {
        message.error(`第${entity.items[i].line}行到效期不能早于当前日期！`);
        return false;
      }
      entity.items[i].productDate = formatDate(entity.items[i].productDate, true);
      entity.items[i].validDate = formatDate(entity.items[i].validDate, true);
    }
    return true;
  }
  handlechangeOwner = (value) => {
    const { entity } = this.state;
    if (entity.owner && entity.owner !== JSON.parse(value)) {
      Modal.confirm({
        title: '修改货主会清空其他信息，请确认修改？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.props.form.resetFields();
          entity.owner = JSON.parse(value);
          entity.wrh = undefined;
          entity.store = undefined;
          entity.sourceBillNumber = undefined;
          entity.reason = undefined;
          entity.items = [];
          this.setState({
            entity: entity,
            items: []
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
  onChangeWrh = (value) => {
    const { entity } = this.state;
    if (value) {
      entity.wrh = JSON.parse(value)
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
    const { entity, items } = this.state;
    const target = items[line - 1];
    if (fieldName === 'article') {
      let article = {
        articleUuid: JSON.parse(e).uuid,
        articleCode: JSON.parse(e).code,
        articleName: JSON.parse(e).name,
        articleSpec: JSON.parse(e).spec,
      }
      target.type = undefined;
      target.targetBinCode = undefined;
      target.targetBinUsage = undefined;
      target.containerBarcode = undefined;
      target.productDate = undefined;
      target.validDate = undefined;
      target.note = undefined;
      target.productionBatch = undefined;
      target.stockBatch = undefined;
      target.price = undefined;
      target.vendor = undefined;
      target.qtyStr = '0';
      target.qty = undefined;
      target.article = article;
      this.queryArticle(article.articleUuid);
    } else if (fieldName === 'qpcStr') {
      const qpcStrMunit = JSON.parse(e);
      target.qpcStr = qpcStrMunit.qpcStr;
      target.article.munit = qpcStrMunit.munit;
      target.article.articleSpec = qpcStrMunit.spec;
      target.volume = qpcStrMunit.volume;
      target.weight = qpcStrMunit.weight;
      target.qpc = qpcStrMunit.qpc;
      if (target.qtyStr)
        target.qty = qtyStrToQty(target.qtyStr, target.qpcStr);
    } else if (fieldName === 'type') {
      if (Type.DECINV.name === e) {
        target.productDate = undefined;
        target.validDate = undefined;
        target.productionBatch = undefined;
        target.stockBatch = undefined;
        target.targetBinCode = undefined;
        target.targetBinUsage = undefined;
      }
      if (Type.RTNVENDOR.name === e) {
        target.productDate = moment('8888-12-31', 'YYYY-MM-DD');
        target.validDate = moment('8888-12-31', 'YYYY-MM-DD');
        target.productionBatch = moment(target.productDate).format('YYYYMMDD');
        if (target.vendor && target.vendor.uuid) {
          let uuid = target.vendor.uuid;
          this.props.dispatch({
            type: 'storeRtn/queryBinAndContainer',
            payload: {
              vendorUuid: uuid,
              dcUuid: loginOrg().uuid
            },
            callback: (response) => {
              if (response && response.success && response.data) {
                target.targetBinCode = response.data.targetBinCode;
                target.targetBinUsage = response.data.targetBinUsage;
                target.containerBarcode = response.data.containerBarcode;
              } else {
                target.targetBinCode = undefined;
                target.targetBinUsage = undefined;
                target.containerBarcode = undefined;
              }
            }
          });
        }
      }
      if (Type.RTNWRH.name === e) {
        target.productDate = undefined;
        target.validDate = undefined;
        target.productionBatch = undefined;
        target.stockBatch = undefined;
        if (target.article && (target.article.uuid || target.article.articleUuid)) {
          let uuid = target.article.uuid || target.article.articleUuid;
          this.props.dispatch({
            type: 'storeRtn/queryBinAndContainerRntWrh',
            payload: {
              articleUuid: uuid,
              dcUuid: loginOrg().uuid
            },
            callback: (response) => {
              if (response && response.success && response.data) {
                target.targetBinCode = response.data.targetBinCode;
                target.targetBinUsage = response.data.targetBinUsage;
                target.containerBarcode = response.data.containerBarcode;
              } else {
                target.targetBinCode = undefined;
                target.targetBinUsage = undefined;
                target.containerBarcode = undefined;
              }
            }
          });
        }
      }
      target.type = e;
      // target.targetBinCode = undefined;
      // target.targetBinUsage = undefined;
    } else if (fieldName === 'vendor') {
      target.vendor = JSON.parse(e).vendor;
      target.price = JSON.parse(e).price;
    } else if (fieldName === 'containerBarcode') {
      const toContainer = JSON.parse(e);
      target.containerBarcode = toContainer.barcode;
    } else if (fieldName === 'productDate') {
      if (e.startOf('day') > moment(new Date()).startOf('day')) {
        message.error('生产日期不能晚于当前日期')
        return;
      }
      const shelfLife = this.getShelfLife(target);
      target.productDate = e.startOf('day');
      target.validDate = moment(e).add(shelfLife.shelfLifeDays, 'days');
      target.productionBatch = moment(target.productDate).format('YYYYMMDD');
    } else if (fieldName === 'validDate') {
      if (e.startOf('day') < moment(new Date()).startOf('day')) {
        message.error('到效期不能早于当前日期')
        return;
      }
      const shelfLife = this.getShelfLife(target);
      target.validDate = e.startOf('day');
      target.productDate = moment(e).add(-shelfLife.shelfLifeDays, 'days');
      target.productionBatch = moment(target.productDate).format('YYYYMMDD');
    } else if (fieldName === 'price') {
      target.price = e;
    } else if (fieldName === 'qtyStr') {
      target.qtyStr = e;
      target.qty = qtyStrToQty(e.toString(), target.qpcStr);
    } else if (fieldName === 'productionBatch') {
      target.productionBatch = e.target.value;
    } else if (fieldName === 'targetBinCode') {
      const binCodeUsage = JSON.parse(e);
      target.targetBinCode = binCodeUsage.code;
      target.targetBinUsage = binCodeUsage.usage;
      this.props.dispatch({
        type: 'storeRtn/queryMaxContainerByBinCode',
        payload: {
          binCode: binCodeUsage.code,
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        },
        callback: (response) => {
          if (response && response.success && response.data) {
            target.containerBarcode = response.data;
          } else {
            target.containerBarcode = undefined;
          }
        }
      });
    }
    this.setState({
      items: items.slice()
    });
  }
  /**
   * 绘制表单
   */
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;
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
              onlyOnline
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
            <WrhSelect placeholder={placeholderLocale(commonLocale.inWrhLocale)}
              onChange={this.onChangeWrh}
            />
          )
        }
      </CFormItem>,
      <CFormItem key='store' label={commonLocale.inStoreLocale}>
        {
          getFieldDecorator('store', {
            initialValue: entity && entity.store ? JSON.stringify(entity.store) : undefined,
            rules: [
              { required: true, message: notNullLocale(commonLocale.inStoreLocale) }
            ],
          })(
            <StoreSelect
              ownerUuid={entity.owner && entity.owner.uuid ? entity.owner.uuid : undefined}
              state={STATE.ONLINE}
              single
              placeholder={placeholderChooseLocale(commonLocale.inStoreLocale)}
            />
          )
        }
      </CFormItem>,
      <CFormItem label={storeRtnLocal.rtner} key='rtner'>
        {getFieldDecorator('rtner', {
          initialValue: JSON.stringify(entity.rtner ? entity.rtner : rtner),
          rules: [
            {
              required: true,
              message: notNullLocale(storeRtnLocal.rtner)
            }
          ],
        })(<UserSelect autoFocus single={true} />)}
      </CFormItem>,
      <CFormItem label={'单据类型'} key='returnType'>
        {getFieldDecorator('returnType', {
          initialValue: entity.returnType ? entity.returnType : ReturnType.RETURNSTORE.name
        })(<Select value={entity.returnType ? entity.returnType : ReturnType.RETURNSTORE.name}>
          {returnTypeOptions}
        </Select>)}
      </CFormItem>
    ];
    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={basicCols} />,
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
    if (this.state.items) {
      this.state.items.map(item => {
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
  fomatFloat = (src, pos) => {
    return Math.round(src * Math.pow(10, pos)) / Math.pow(10, pos);
  }
  changeContainerVisible = (selectedRowKeys) => {
    if (!selectedRowKeys || selectedRowKeys.length <= 0) {
      message.warn('请先选择要修改的行！');
      return;
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
    const { items } = this.state;
    const lines = this.state.selectedRowKeys;
    Array.isArray(lines) && lines.forEach(function (line) {
      items[line - 1].containerBarcode = value.containerBarcode;
    })
    this.setState({
      // entity: { ...entity },
      containerModalVisible: false,
      selectedRowKeys: []
    })
  }
  changeTypeVisible = (selectedRowKeys) => {
    if (!selectedRowKeys || selectedRowKeys.length <= 0) {
      message.warn('请先选择要修改的行！');
      return;
    }
    this.setState({
      typeModalVisible: !this.state.typeModalVisible,
      selectedRowKeys: selectedRowKeys
    })
  }
  handleTypeModalVisible = (selectedRowKeys) => {
    this.setState({
      typeModalVisible: false,
      selectedRowKeys: selectedRowKeys
    })
  }
  handleRefreshType = (value) => {
    const { items } = this.state;
    const { dispatch } = this.props;
    const lines = this.state.selectedRowKeys;
    const that = this;
    Array.isArray(lines) && lines.forEach(function (line) {
      let type = items[line - 1].type;
      items[line - 1].type = value.type;
      if (Type.RTNVENDOR.name === value.type) {
        items[line - 1].productDate = moment('8888-12-31', 'YYYY-MM-DD');
        items[line - 1].validDate = moment('8888-12-31', 'YYYY-MM-DD');
        items[line - 1].productionBatch = '88881231';
        if (items[line - 1].vendor && items[line - 1].vendor.uuid) {
          let uuid = items[line - 1].vendor.uuid;
          dispatch({
            type: 'storeRtn/queryBinAndContainer',
            payload: {
              vendorUuid: uuid,
              dcUuid: loginOrg().uuid
            },
            callback: (response) => {
              if (response && response.success && response.data) {
                items[line - 1].targetBinCode = response.data.targetBinCode;
                items[line - 1].targetBinUsage = response.data.targetBinUsage;
                items[line - 1].containerBarcode = response.data.containerBarcode;
              } else {
                items[line - 1].targetBinCode = undefined;
                items[line - 1].targetBinUsage = undefined;
                items[line - 1].containerBarcode = undefined;
              }
              that.setState({
                items: [...items]
              })
            }
          });
        }
      }
      if (Type.RTNWRH.name === value.type) {
        if (items[line - 1].article && items[line - 1].article.uuid || items[line - 1].article && items[line - 1].article.articleUuid) {
          let uuid = items[line - 1].article.uuid || items[line - 1].article.articleUuid;
          dispatch({
            type: 'storeRtn/queryBinAndContainerRntWrh',
            payload: {
              articleUuid: uuid,
              dcUuid: loginOrg().uuid
            },
            callback: (response) => {
              if (response && response.success && response.data) {
                items[line - 1].targetBinCode = response.data.targetBinCode;
                items[line - 1].targetBinUsage = response.data.targetBinUsage;
                items[line - 1].containerBarcode = response.data.containerBarcode;
              } else {
                items[line - 1].targetBinCode = undefined;
                items[line - 1].targetBinUsage = undefined;
                items[line - 1].containerBarcode = undefined;
              }
              that.setState({
                items: [...items]
              })
            }
          });
        }
      }
      if (Type.DECINV.name === value.type) {
        items[line - 1].targetBinCode = undefined;
        items[line - 1].targetBinUsage = undefined;
        items[line - 1].containerBarcode = undefined;
      }
      if (type && Type.RTNVENDOR.name === type && Type.RTNVENDOR.name !== value.type) {
        items[line - 1].productDate = undefined;
        items[line - 1].validDate = undefined;
        items[line - 1].productionBatch = undefined;
      }
      // items[line - 1].targetBinCode = undefined;
      // items[line - 1].targetBinUsage = undefined;
    })
    this.setState({
      // items: { ...items },
      typeModalVisible: false,
      selectedRowKeys: []
    })
  }
  changeAlcAddVisible = () => {
    this.setState({
      alcModalVisible: !this.state.alcModalVisible
    })
  }
  handleAlcModalVisible = () => {
    this.setState({
      alcModalVisible: false
    })
  }
  handleRefreshAlc = (value, dataUp, dataDown) => {
    const { entity } = this.state;
    let newAlcRtnList = [];
    let itemsList = [];
    let list = dataDown;
    if (list && dataUp) {
      entity.owner = dataUp.owner;
      // entity.wrh = dataUp.wrh;
      entity.store = dataUp.store;
      for (let i = 0; i < list.length; i++) {
        if (this.state.items && this.state.items.find(function (item) {
          return item.article === list[i].article;
        }) === undefined) {
          newAlcRtnList.push(list[i]);
        }
      }
      this.state.line = this.state.items.length + 1;
      newAlcRtnList.map(item => {
        itemsList.push(item);
        item.line = this.state.line;
        this.state.line++;
      });
      this.setState({
        itemsList: itemsList,
        batchAdd: true
      });
      this.state.items = [...this.state.items, ...newAlcRtnList];
    } else {
      message.warn('没有符合要求的退仓单');
    }
    this.handleAlcModalVisible()
  }
  changeBinVisible = (selectedRowKeys) => {
    const { items } = this.state;
    if (!selectedRowKeys || selectedRowKeys.length <= 0) {
      message.warn('请先选择要修改的行！');
      return;
    }
    let articleUuids = [];
    for (let i of selectedRowKeys) {
      let item = items[i - 1];
      if (item.article && (item.type === Type.RTNVENDOR.name || item.type === Type.RTNWRH.name)) {
        articleUuids.push(item.article.articleUuid)
      }
    }
    if (articleUuids.length <= 0) {
      message.warn('勾选的明细必须退仓类型必须是好退或返厂类型');
      return;
    }
    this.setState({
      pickUpBinModalVisible: !this.state.pickUpBinModalVisible,
      selectedRowKeys: selectedRowKeys
    })
  }
  handleBinModalVisible = (selectedRowKeys) => {
    this.setState({
      pickUpBinModalVisible: false,
      selectedRowKeys: selectedRowKeys
    })
  }
  handleRefreshBin = (value) => {
    const { items } = this.state;
    const lines = this.state.selectedRowKeys;
    Array.isArray(lines) && lines.forEach(function (line) {
      let bin = JSON.parse(value.bin);
      if (binUsage.VendorRtnBin.name === bin.usage &&
        items[line - 1].type === Type.RTNVENDOR.name) {
        items[line - 1].targetBinCode = bin.code;
        items[line - 1].targetBinUsage = bin.usage;
      }
      if ((binUsage.PickUpBin.name === bin.usage || binUsage.PickUpStorageBin.name === bin.usage)
        && items[line - 1].type === Type.RTNWRH.name) {
        items[line - 1].targetBinCode = bin.code;
        items[line - 1].targetBinUsage = bin.usage;
      }
    })
    this.setState({
      // entity: { ...entity },
      pickUpBinModalVisible: false,
      selectedRowKeys: []
    })
  }
  /**
   * 绘制明细表格
   */
  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, items, batchAdd } = this.state;
    let articleCols = [
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        width: 410,
        render: record => {
          return (
            <ArticleSelect
              value={record.article ? `[${record.article.articleCode}]${record.article.articleName}` : undefined}
              ownerUuid={entity.owner ? entity.owner.uuid : '-'}
              placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
              onChange={e => this.handleFieldChange(e, 'article', record.line)}
              onlyOnline={true}
              showSearch={true}
              single
            />
          );
        }
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        key: 'qpcStr',
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
        title: storeRtnLocal.type,
        dataIndex: 'type',
        key: 'type',
        width: itemColWidth.articleEditColWidth,
        render: (text, record) => {
          return (
            <Select className={style.editWrapper}
              value={record.type}
              title={placeholderChooseLocale(storeRtnLocal.type)}
              placeholder={placeholderChooseLocale(storeRtnLocal.type)}
              onChange={e => this.handleFieldChange(e, 'type', record.line)}>
              {typeOptions}
            </Select>
          );
        }
      },
      {
        title: commonLocale.vendorLocale,
        dataIndex: 'vendor',
        key: 'vendor',
        width: itemColWidth.articleEditColWidth,
        render: (text, record) => {
          let value;
          if (record.vendor) {
            value = convertCodeName(record.vendor);
          } else {
            if (this.getVendors(record).length > 0) {
              let vendors = this.getVendors(record);
              vendors && vendors.forEach(
                function (e) {
                  if (e.defaultVendor) {
                    value = convertCodeName(e.vendor);
                    record.vendor = e.vendor;
                    record.price = e.price;
                  }
                }
              )
              if (!value) {
                record.vendor = this.getVendors(record)[0].vendor;
                record.price = this.getVendors(record)[0].price;
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
      {
        title: storeRtnLocal.targetBin,
        dataIndex: 'targetBinCode',
        key: 'targetBinCode',
        width: itemColWidth.binCodeEditColWidth + 80,
        render: (text, record) => {
          if (Type.DECINV.name == record.type) {
            return record.targetBinCode ? record.targetBinCode : <Empty />;
          }
          if (Type.RTNWRH.name == record.type) {
            return <BinSelect
              usages={[binUsage.StorageBin.name, binUsage.PickUpBin.name, binUsage.PickUpStorageBin.name]}
              states={[binState.FREE.name, binState.USING.name]}
              getUsage
              wrhUuid={this.state.entity.wrh ? this.state.entity.wrh.uuid : undefined}
              value={record.targetBinCode ? JSON.stringify({
                code: record.targetBinCode,
                usage: record.targetBinUsage
              }) : undefined}
              placeholder={placeholderChooseLocale(commonLocale.bincodeLocale)}
              onChange={e => this.handleFieldChange(e, 'targetBinCode', record.line)}
            />
          }
          return <BinSelect
            usage={binUsage.VendorRtnBin.name}
            getUsage
            states={[binState.FREE.name, binState.USING.name]}
            wrhUuid={this.state.entity.wrh ? this.state.entity.wrh.uuid : undefined}
            value={record.targetBinCode ? JSON.stringify({
              code: record.targetBinCode,
              usage: record.targetBinUsage
            }) : undefined}
            placeholder={placeholderChooseLocale(commonLocale.bincodeLocale)}
            onChange={e => this.handleFieldChange(e, 'targetBinCode', record.line)}
          />
        },
      },
      {
        title: commonLocale.inContainerBarcodeLocale,
        dataIndex: 'containerBarcode',
        key: 'containerBarcode',
        width: itemColWidth.containerEditColWidth,
        render: (text, record) => {
          if (Type.DECINV.name == record.type) {
            record.containerBarcode = '-';
            return record.containerBarcode;
          }
          if (record.targetBinUsage == binUsage.PickUpBin.name || record.targetBinUsage == binUsage.PickUpStorageBin.name) {
            record.containerBarcode = '-';
            return record.containerBarcode;
          }
          if (record.containerBarcode == '-') {
            record.containerBarcode = undefined;
          }
          return <MoveToContainerSelect
            value={record.containerBarcode ? record.containerBarcode : undefined}
            placeholder={placeholderChooseLocale(commonLocale.containerLocale)}
            onChange={e => this.handleFieldChange(e, 'containerBarcode', record.line)}
            binCode={record.targetBinCode ? record.targetBinCode : undefined}
            showSearch={true}
          />
        },
      },
      {
        title: commonLocale.inProductDateLocale,
        dataIndex: 'productDate',
        key: 'productDate',
        width: itemColWidth.dateEditColWidth,
        render: (value, record) => {
          const shelfLife = this.getShelfLife(record);
          if (!shelfLife || record.type === Type.RTNVENDOR.name)
            return <span>{record.productDate ?
              moment(record.productDate).format('YYYY-MM-DD') : <Empty />}</span>
          if (shelfLife.shelfLifeType === 'NOCARE') {
            record.productDate = moment('8888-12-31', 'YYYY-MM-DD');
            record.validDate = moment('8888-12-31', 'YYYY-MM-DD');
            if (!record.productionBatch) {
              record.productionBatch = moment(record.productDate).format('YYYYMMDD');
            }
            return '8888-12-31';
          } else if (shelfLife.shelfLifeType === 'VALIDDATE') {
            return record.productDate ? moment(record.productDate).format('YYYY-MM-DD') : '-';
          } else {
            return (
              <DatePicker
                value={record.productDate && moment(record.productDate).format('YYYY-MM-DD') !== '8888-12-31'
                  ? moment(record.productDate, 'YYYY-MM-DD') : undefined}
                allowClear={false}
                placeholder={placeholderLocale(commonLocale.productionDateLocale)}
                onChange={(data) => this.handleFieldChange(data, 'productDate', record.line)} />
            );
          }
        },
      },
      {
        title: commonLocale.inValidDateLocale,
        dataIndex: 'validDate',
        key: 'validDate',
        width: itemColWidth.dateEditColWidth,
        render: (value, record) => {
          const shelfLife = this.getShelfLife(record);
          if (!shelfLife || record.type === Type.RTNVENDOR.name)
            return <span>{record.validDate ?
              moment(record.validDate).format('YYYY-MM-DD') : <Empty />}</span>
          if (shelfLife.shelfLifeType === 'NOCARE') {
            record.productDate = moment('8888-12-31', 'YYYY-MM-DD');
            record.validDate = moment('8888-12-31', 'YYYY-MM-DD');
            if (!record.productionBatch) {
              record.productionBatch = moment(record.productDate).format('YYYYMMDD');
            }
            return '8888-12-31';
          } else if (shelfLife.shelfLifeType === 'VALIDDATE') {
            return <DatePicker
              value={record.validDate ? moment(record.validDate) : undefined}
              allowClear={false}
              placeholder={placeholderLocale(commonLocale.validDateLocale)}
              onChange={(data) => this.handleFieldChange(data, 'validDate', record.line)} />;
          } else {
            return (
              <span>{record.validDate ?
                moment(record.validDate).format('YYYY-MM-DD')
                : <Empty />}</span>
            );
          }
        }
      },
      {
        title: commonLocale.productionBatchLocale,
        dataIndex: 'productionBatch',
        key: 'productionBatch',
        width: itemColWidth.numberEditColWidth + 50,
        render: (text, record) => {
          const value = this.getProductionBatch(record);
          if (value && value.manageBatch == true && value.type != 'NOCARE') {
            return <Input value={record.productionBatch ? record.productionBatch : undefined}
              onChange={e => this.handleFieldChange(e, 'productionBatch', record.line)}
              placeholder={placeholderLocale(commonLocale.productionBatchLocale)}
            />
          } else {
            return <span>{record.productionBatch}</span>
          }
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
      {
        title: commonLocale.inPriceLocale,
        dataIndex: 'price',
        key: 'price',
        width: itemColWidth.numberEditColWidth,
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
    ];
    let batchQueryResultColumns = [
      {
        title: commonLocale.codeLocale,
        key: 'code',
        dataIndex: 'code',
        width: colWidth.codeColWidth,
      }, {
        title: commonLocale.nameLocale,
        key: 'name',
        dataIndex: 'name',
        width: colWidth.codeColWidth,
      },
    ]
    return (
      <div>
        <ItemEditTable
          title={commonLocale.inArticleLocale}
          columns={articleCols}
          scroll={{ x: 2400 }}
          data={items ? items : []}
          drawTotalInfo={this.drawTotalInfo}
          drawBatchButton={this.drawBatchButton}
        />
      </div>
    )
  }
  drawBatchButton = (selectedRowKeys) => {
    return [
      <a onClick={() => this.changeContainerVisible(selectedRowKeys)}>
        {storeRtnLocal.batchRefreshContainer}</a>,
      <Divider type="vertical" />,
      <a onClick={() => this.changeTypeVisible(selectedRowKeys)}>
        {storeRtnLocal.batchRefreshType}</a>,
      <Divider type="vertical" />,
      <a onClick={() => this.changeBinVisible(selectedRowKeys)}>批量设置目标货位</a>,
      <Divider type="vertical" />,
      <RtnContainerModal
        ModalTitle={'批量修改容器条码'}
        containerModalVisible={this.state.containerModalVisible}
        handleContainerModalVisible={this.handleContainerModalVisible}
        handleRefreshContainer={this.handleRefreshContainer}
      />,
      <RtnTypeModal
        ModalTitle={'批量修改退仓类型'}
        typeModalVisible={this.state.typeModalVisible}
        handleTypeModalVisible={this.handleTypeModalVisible}
        handleRefreshType={this.handleRefreshType}
      />,
      <TargetBinModal
        ModalTitle={'批量设置目标货位'}
        handleRefreshBin={this.handleRefreshBin}
        handleBinModalVisible={this.handleBinModalVisible}
        visible={this.state.pickUpBinModalVisible}
      />,
      <AlcDtlBatchAdd
        ModalTitle={'批量添加退仓单明细'}
        alcModalVisible={this.state.alcModalVisible}
        handleAlcModalVisible={this.handleAlcModalVisible}
        handleRefreshAlc={this.handleRefreshAlc}
      />
    ];
  }
}
