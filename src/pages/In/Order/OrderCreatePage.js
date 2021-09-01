import { connect } from 'dva';
import moment from 'moment';
import { isArray } from 'util';
import { Form, Select, Input, InputNumber, message, DatePicker,Modal } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale,tooLongLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, getDefOwner } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';
import { sourceWay } from '@/utils/SourceWay';
import { orgType } from '@/utils/OrgType';
import { convertCodeName, formatDate } from '@/utils/utils';
import { qtyStrToQty, add, toQtyStr } from '@/utils/QpcStrUtil';
import { itemColWidth, colWidth } from '@/utils/ColWidth';
import VendorSelect from '@/pages/Component/Select/VendorSelect';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { orderLocale } from './OrderLocale';
import { LogisticMode } from './OrderContants';
import { MAX_DECIMAL_VALUE } from '@/utils/constants';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import { PRETYPE } from '@/utils/constants';
import { ORDER_RES } from './OrderPermission';
const logisticModeOptions = [];
Object.keys(LogisticMode).forEach(function (key) {
  if (key === LogisticMode.UNIFY.name) {
    logisticModeOptions.push(<Select.Option value={LogisticMode[key].name}>{LogisticMode[key].caption}</Select.Option>);
  }
});

@connect(({ order, article, loading }) => ({
  order,
  article,
  loading: loading.models.order,
}))
@Form.create()
export default class OrderCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      title: commonLocale.createLocale + orderLocale.title,
      entity: {
        owner: getDefOwner(),
        logisticMode: LogisticMode.UNIFY.name,
        items: []
      },
      orderBillitems: [],
      articles: [],
      articleMap: {},
      vendorArticleOptions: [],
      qpcStrAndMunitOptions: [],
      auditPermission: ORDER_RES.AUDIT,
      qtyStr: '',
      vendor: {},
      auditButton : true,
      owner: getDefOwner(),
    }
  }
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.order.entity && this.props.order.entityUuid) {
      this.setState({
        entity: nextProps.order.entity,
        orderBillitems: nextProps.order.entity.items,
        title: orderLocale.title + '：' + nextProps.order.entity.billNumber,
      });
      if (JSON.stringify(this.state.vendor) == "{}" && JSON.stringify(nextProps.order.entity) != "{}") {
        this.setState({
          vendor: nextProps.order.entity.vendor
        })
      }
    }
    if (nextProps.article.data.list && Array.isArray(nextProps.article.data.list)&&nextProps.article.data.list!=this.props.article.data.list) {
      this.setState({
        articles: nextProps.article.data.list
      });

    }
    // if (nextProps.order.entity && this.props.order.entity != nextProps.order.entity) {

    //   if (nextProps.order.entityUuid && nextProps.article.qpcs && nextProps.order.entity.items) {
    //     nextProps.order.entity.items.map(e => {
    //       if (e.article) {
    //         this.getQpcsByArticleUuid(e.article)
    //       }
    //     })
    //   }
    // }

    if (nextProps.article.qpcs && Array.isArray(nextProps.article.qpcs)) {
      const { articleMap } = this.state;
      articleMap[nextProps.article.articleUuid] = nextProps.article.qpcs;
      this.setState({
        articleMap: {
          ...articleMap
        }
      });
    }
  }

  /**
   * 选择货主
   */
  handlechangeOwner = (value) => {
    const { orderBillitems,entity } = this.state;
		let originalOwner = this.props.form.getFieldValue('owner');
    if (orderBillitems.length == 0 && entity.items.length == 0) {
      entity.owner = JSON.parse(value);
      this.setState({
        owner: JSON.parse(value),
      });
    }else if (orderBillitems.length > 0 || entity.items.length > 0){
      Modal.confirm({
				title: '修改货主会导致商品信息清空，请确认修改？',
				okText: '确认',
				cancelText: '取消',
				onOk: () => {
          entity.items = [];
          entity.owner = JSON.parse(value);
					this.setState({
            owner: JSON.parse(value),
            orderBillitems:[],
						entity: { ...entity }
					}, () => {
						this.props.form.setFieldsValue({
							owner: value,
						});
					});
				},
				onCancel: () => {
					this.props.form.setFieldsValue({
						owner: originalOwner
					});
				}
			});
    }
  }

  /**
   * 选择供应商时
   */
  handleChangeVendor = (value) => {
    const { orderBillitems,entity } = this.state;
		let originalVendor = this.props.form.getFieldValue('vendor');
    if (orderBillitems.length == 0 && entity.items.length == 0) {
      this.setState({
        vendor: JSON.parse(value),
      });
    }else if (orderBillitems.length > 0 || entity.items.length > 0){
      Modal.confirm({
				title: '修改供应商会导致商品信息清空，请确认修改？',
				okText: '确认',
				cancelText: '取消',
				onOk: () => {
          entity.items = [];
					this.setState({
            vendor: JSON.parse(value),
            orderBillitems:[],
						entity: { ...entity }
					}, () => {
						this.props.form.setFieldsValue({
							vendor: value,
						});
					});
				},
				onCancel: () => {
					this.props.form.setFieldsValue({
						vendor: originalVendor
					});
				}
			});
    }
  }

  /**
   * 商品选择框搜索功能
   */
  onSearchArticle = (value) => {
    let pageFilter={}
    pageFilter.page = 0;
    pageFilter.pageSize = 10;

    if(this.state.vendor.uuid==undefined||this.state.vendor.uuid=='')
      return;

    pageFilter.searchKeyValues = {
      vendorUuid: this.state.vendor.uuid,
      companyUuid:loginCompany().uuid,
      state: 'ONLINE'
    }
    if (value.length!=0) {
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        codeName:value
      }
    }
    this.props.dispatch({
      type: 'article/query',
      payload: {
        ...pageFilter
      }
    });
  }
  /**
   * 展示商品选择
   */
  getArticleOptions = () => {
    let options = [];

    const { articles,vendor } = this.state;
    articles.map(item => {
      let article = {
        uuid: item.uuid,
        code: item.code,
        name: item.name,
      }

        options.push(<Select.Option
          key={JSON.stringify(item)}
          value={JSON.stringify(item)}>{convertCodeName(item)}</Select.Option>);
    });
    return options;
  }

  /**
   * 展示规格选择
   */
  getQpcStrOptions = (articleUuid) => {
    let options = [];
    const { articleMap } = this.state;
    if (!articleUuid || !articleMap[articleUuid]) {
      return options;
    }

    articleMap[articleUuid].map(e => {
      options.push(<Select.Option
        key={e.qpcStr + "/" + e.munit}
        value={e.qpcStr + "/" + e.munit}>
        {e.qpcStr + "/" + e.munit}</Select.Option>);
    });
    return options;
  }

  /**
   * 刷新
   */
  refresh = () => {
    this.props.dispatch({
      type: 'order/get',
      payload: this.props.order.entityUuid
    });
  }
  /**
  * 取消
  */
  onCancel = () => {
    this.props.dispatch({
      type: 'order/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  /**
   * 保存
   */
  onSave = (data) => {
    let order = {
      ...this.state.entity,
      ...data,
    };
    if (Array.isArray(this.state.orderBillitems)) {
      for (let i = 0; i < this.state.orderBillitems.length; i++) {
        if (!this.state.orderBillitems[i].article) {
          this.state.orderBillitems.splice(i, 1);
          if (this.state.orderBillitems[i] && this.state.orderBillitems[i].line) {
            this.state.orderBillitems[i].line = i + 1;
          }
          i = i - 1;
        }
      }
      for (let i = 0; i < this.state.orderBillitems.length; i++) {
        if (this.state.orderBillitems[i].article && this.state.orderBillitems[i].qty === 0) {
          message.error('第' + this.state.orderBillitems[i].line + '行数量不能为0');
          for (let j = i + 1; j < this.state.orderBillitems.length; j++) {
            this.state.orderBillitems[j].line = j + 1;
          }
          return;
        }
      }
    }
    if (this.state.orderBillitems.length === 0) {
      message.error('明细不能为空');
      return;
    }

    // TODO:两条相同明细--库存报错
    // for (let i = 0; i < this.state.orderBillitems.length; i++) {
    //   for (let j = i + 1; j < this.state.orderBillitems.length; j++) {
    //     if (this.state.orderBillitems[i].article.uuid === this.state.orderBillitems[j].article.uuid &&
    //       this.state.orderBillitems[i].qpcStr === this.state.orderBillitems[j].qpcStr &&
    //       this.state.orderBillitems[i].qtyStr === this.state.orderBillitems[j].qtyStr &&
    //       this.state.orderBillitems[i].qty === this.state.orderBillitems[j].qty &&
    //       this.state.orderBillitems[i].price === this.state.orderBillitems[j].price) {
    //       message.error(itemRepeat(this.state.orderBillitems[i].line, this.state.orderBillitems[j].line));
    //       return false;
    //     }
    //   }
    // }

    order.items = this.state.orderBillitems;
    order.companyUuid=loginCompany().uuid,
    order.dcUuid = loginOrg().uuid;
    order.owner = JSON.parse(order.owner);
    order.vendor = JSON.parse(order.vendor);
    order.wrh = JSON.parse(order.wrh);
    order.expireDate = formatDate(order.expireDate, true);
    order.sourceWay = sourceWay.CREATE.name;

    if (!order.uuid) {
      this.props.dispatch({
        type: 'order/onSave',
        payload: order,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
          }
        }
      });
    } else {
      this.props.dispatch({
        type: 'order/modify',
        payload: order,
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
    let order = {
      ...this.state.entity,
      ...data,
    };
    if (Array.isArray(this.state.orderBillitems)) {
      if(this.state.orderBillitems.length>1) {
        for (let i = 0; i < this.state.orderBillitems.length; i++) {
          if (!this.state.orderBillitems[i].article) {
            this.state.orderBillitems.splice(i, 1);
            if (this.state.orderBillitems[i] && this.state.orderBillitems[i].line) {
              this.state.orderBillitems[i].line = i + 1;
            }
            i = i - 1;
          }
        }
        for (let i = 0; i < this.state.orderBillitems.length; i++) {
          if (this.state.orderBillitems[i].article && this.state.orderBillitems[i].qty === 0) {
            message.error('第' + this.state.orderBillitems[i].line + '行数量不能为0');
            for (let j = i + 1; j < this.state.orderBillitems.length; j++) {
              this.state.orderBillitems[j].line = j + 1;
            }
            return;
          }
        }
      }
    }
    if (this.state.orderBillitems.length === 0) {
      message.error('明细不能为空');
      return;
    }

    order.items = this.state.orderBillitems;
    order.companyUuid=loginCompany().uuid,
    order.dcUuid = loginOrg().uuid;
    order.owner = JSON.parse(order.owner);
    order.vendor = JSON.parse(order.vendor);
    order.wrh = JSON.parse(order.wrh);
    order.expireDate = formatDate(order.expireDate);
    order.sourceWay = sourceWay.CREATE.name;

    this.props.dispatch({
      type: 'order/onSaveAndCreate',
      payload: order,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.setState({
            orderBillitems: [],
          })
          this.props.form.resetFields();
        }
      }
    });
  }

  /**
   * 查询商品的进价
   */
  getArticlePurchaseprice =(article,line)=>{
    const { orderBillitems,vendor } = this.state;
    const payload = {
      uuid: article.uuid
    }

    this.props.dispatch({
      type: 'article/get',
      payload: { ...payload },
      callback:response=>{
        if(response&&response.success&&response.data){
          response.data.vendors.map(item=>{
            if(vendor.uuid===item.vendor.uuid){
              orderBillitems[line - 1].price = item.defaultReceivePrice;
            }
          });
        }
      }
    })
  }
  /**
   * 查询商品对应的规格计量单位等
   */
  getQpcsByArticleUuid = (article,line) => {
    const { articleMap, } = this.state;
    const payload = {
      articleUuid: article.uuid
    }
    this.props.dispatch({
      type: 'article/getQpcsByArticleUuid',
      payload: { ...payload },
      callback:response=>{
        if(response&&response.success){
          articleMap[article.uuid]&&articleMap[article.uuid].map(item => {
            if (item.defaultQpcStr && this.state.orderBillitems[line - 1]) {
              this.state.orderBillitems[line - 1].qpcStr = item.qpcStr;
              this.state.orderBillitems[line - 1].munit = item.munit;
            }else if(item.defaultQpcStr==false && this.state.orderBillitems[line - 1]&&this.state.orderBillitems[line - 1].qpcStr==undefined){
              this.state.orderBillitems[line - 1].qpcStr = undefined;
              this.state.orderBillitems[line - 1].munit = undefined;
            }
            // if (this.state.orderBillitems[line - 1]) {
            //   this.state.orderBillitems[line - 1].munit = item.munit;
            // }
          });
          if (articleMap && articleMap[article.uuid] == undefined && this.state.orderBillitems[line - 1]) {
            this.state.orderBillitems[line - 1].qpcStr = undefined;
          }
        }
      }
    });
  }
  /**
 * 表格变化时
 * @param {*} e
 * @param {*} fieldName
 * @param {*} key
 */
  handleFieldChange(e, fieldName, line) {
    const { entity, orderBillitems,articleMap } = this.state;
    if (fieldName === 'article') {
      let article = {
        uuid: JSON.parse(e).uuid,
        code: JSON.parse(e).code,
        name: JSON.parse(e).name,
      }
      orderBillitems[line - 1].article = article;
      orderBillitems[line - 1].qtyStr = '0+0';
      orderBillitems[line - 1].qty = 0;
      this.getQpcsByArticleUuid(JSON.parse(e), line)
      this.getArticlePurchaseprice(JSON.parse(e), line);

    } else if (fieldName === 'qpcStrAndMunit') {
      var Arr = e.split("/");
      var qpcStr = Arr[0];
      var munit = Arr[1];
      orderBillitems[line - 1].qpcStr = qpcStr;
      orderBillitems[line - 1].munit = munit;
      orderBillitems[line - 1].qty = qtyStrToQty(orderBillitems[line - 1].qtyStr, qpcStr);
    } else if (fieldName === 'price') {
      orderBillitems[line - 1].price = e;
    } else if (fieldName === 'qtyStr') {
      orderBillitems[line - 1].qtyStr = e;
      orderBillitems[line - 1].qty = qtyStrToQty(e.toString(), orderBillitems[line - 1].qpcStr);
    }

    this.setState({
      orderBillitems: orderBillitems.slice()
    });
  }

  /**
   * 绘制表单
   */
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, defOwner } = this.state;
    let basicCols = [
      <CFormItem label={orderLocale.type} key='type'>
      {getFieldDecorator('type', {
        initialValue: entity.type,
        rules: [
          { required: true, message: notNullLocale(orderLocale.type) }
        ],
      })(<PreTypeSelect placeholder={placeholderChooseLocale(orderLocale.type)} preType={PRETYPE.orderType} />)}
    </CFormItem>,
      <CFormItem key='owner' label={commonLocale.inOwnerLocale}>
        {
          getFieldDecorator('owner', {
            initialValue: entity ? (entity.owner ? JSON.stringify(entity.owner) : undefined) : null,
            rules: [
              { required: true, message: notNullLocale(commonLocale.inOwnerLocale) }
            ],
          })(
            <OwnerSelect onChange={this.handlechangeOwner} onlyOnline placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} />
          )
        }
      </CFormItem>,
      <CFormItem key='vendor' label={commonLocale.inVendorLocale}>
        {
          getFieldDecorator('vendor', {
            initialValue: entity ? (entity.vendor ? JSON.stringify(entity.vendor) : undefined) : undefined,
            rules: [
              { required: true, message: notNullLocale(commonLocale.inVendorLocale) }
            ],
          })(
            <VendorSelect
              ownerUuid={entity.owner ? entity.owner.uuid : ''}
              state={STATE.ONLINE}
              single
              placeholder={placeholderLocale(commonLocale.inVendorLocale)}
              onChange={this.handleChangeVendor}
            />
          )
        }
      </CFormItem>,
      <CFormItem key='logisticMode' label={commonLocale.inlogisticModeLocale}>
        {
          getFieldDecorator('logisticMode', {
            initialValue: entity.logisticMode,
            rules: [
              { required: true, message: notNullLocale(commonLocale.inlogisticModeLocale) }
            ],
          })(
            <Select initialValue=' ' placeholder={placeholderChooseLocale(commonLocale.inlogisticModeLocale)}>
              {logisticModeOptions}
            </Select>
          )
        }
      </CFormItem>,
      <CFormItem key='wrh' label={commonLocale.inWrhLocale}>
        {
          getFieldDecorator('wrh', {
            initialValue: entity ? (entity.wrh ? JSON.stringify(entity.wrh) : undefined) : undefined,
            rules: [{ required: true, message: notNullLocale(commonLocale.inWrhLocale) }],
          })(
            <WrhSelect placeholder={placeholderLocale(commonLocale.inWrhLocale)} />
          )
        }
      </CFormItem>,
      <CFormItem key='expireDate' label={commonLocale.inValidDateLocale}>
        {
          getFieldDecorator('expireDate', {
            initialValue: entity.expireDate ? moment(entity.expireDate, 'YYYY-MM-DD') : null,
            rules: [
              { required: true, message: notNullLocale(commonLocale.inValidDateLocale) }
            ],
          })(
            <DatePicker style={{ width: '100%' }} />
          )
        }
      </CFormItem>,
      <CFormItem key='pricing' label={orderLocale.isPricing}>
        {
          getFieldDecorator('pricing', {
            initialValue: entity.isPricing ? entity.isPricing : 0,
            rules: [
              { required: true, message: notNullLocale(orderLocale.isPricing) }
            ],
          })(
            <Select>
              <Select.Option value={0} key={0}>{commonLocale.noLocale}</Select.Option>
              <Select.Option value={1} key={1}>{commonLocale.yesLocale}</Select.Option>
            </Select>
          )
        }
      </CFormItem>,
      <CFormItem key='sourceBillNumber' label={orderLocale.sourceBillNumber}>
        {
          getFieldDecorator('sourceBillNumber', {
            initialValue: entity.sourceBillNumber,
            rules: [{
              max: 30, message: tooLongLocale(orderLocale.sourceBillNumber, 30),
            }],
          })(
            <Input placeholder={placeholderLocale(orderLocale.sourceBillNumber)} />
          )
        }
      </CFormItem>,
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
    if (this.state.orderBillitems) {
      this.state.orderBillitems.map(item => {
        if (!item.qty) {
          item.qty = 0;
        }
        if (!item.qtyStr) {
          item.qtyStr = 0;
        }
        if (!item.price) {
          item.price = 0;
        }
        allQty = allQty + parseFloat(item.qty)
        allQtyStr = add(allQtyStr, item.qtyStr);
        allAmount = allAmount + item.price * item.qty
      })
    }

    return (
      <span style={{ marginLeft: '10px' }}>
				{commonLocale.inAllQtyStrLocale}：{allQtyStr}  |
        {commonLocale.inAllQtyLocale}：{allQty}  |
        {commonLocale.inAllAmountLocale}：{allAmount}
			</span>
    );
  }
  /**
   * 绘制明细表格
   */
  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, vendorArticle, orderBillitems } = this.state;
    let articleCols = [
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        width: itemColWidth.articleEditColWidth,
        render: record => {
          return (
            <Select
              id ='article'
              value={record.article ? `[${record.article.code}]${record.article.name}` : undefined}
              placeholder={placeholderLocale(commonLocale.inArticleLocale)}
              onChange={e => this.handleFieldChange(e, 'article', record.line)}
              onSearch={this.onSearchArticle}
              filterOption={false}
              notFoundContent={null}
              showSearch={true}
            >
              {this.getArticleOptions()}
            </Select>
          );
        }
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        key: 'qpcStrAndMunit',
        width: itemColWidth.qpcStrEditColWidth+60,
        render: (text, record) => {
          return (
            <Select value={record.qpcStr && record.munit ? record.qpcStr + '/' + record.munit : undefined}
              placeholder={placeholderLocale(commonLocale.inQpcAndMunitLocale)}
              onChange={
                e => this.handleFieldChange(e, 'qpcStrAndMunit', record.line)
              }
              onFocus ={ () => this.getQpcsByArticleUuid(record.article, record.line)}
            >
              {
                this.getQpcStrOptions(record.article ? record.article.uuid : null)
              }
            </Select>
          );
        }
      },
      {
        title: orderLocale.price,
        key: 'price',
        width: itemColWidth.priceColWidth+50,
        render: (text, record) => {
          return (
            <InputNumber
              id = 'price'
              value={record.price ? record.price : 0}
              min={0}
              precision={4}
              max={MAX_DECIMAL_VALUE}
              onChange={e => this.handleFieldChange(e, 'price', record.line)}
              placeholder={placeholderLocale(orderLocale.price)}
              style={{ width: '100%' }}
            />
          );
        }
      },
      {
        title: commonLocale.inQtyStrLocale,
        key: 'qtyStr',
        width: itemColWidth.qtyStrEditColWidth,
        render: (text, record) => {
          return (
            <QtyStrInput
              id ='qtyStr'
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
        width: itemColWidth.qtyColWidth-50,
        render: (text, record) => {
          return <span>{record.qty ? record.qty : 0}</span>
        }
      },
    ];
    return (
      <ItemEditTable
        title={orderLocale.articleTableTitle}
        columns={articleCols}
        data={orderBillitems ? orderBillitems : []}
        drawTotalInfo={this.drawTotalInfo}
      />
    )
  }
}
