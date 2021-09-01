import { connect } from 'dva';
import moment from 'moment';
import { isArray } from 'util';
import { Form, Select, Input, InputNumber, message, Checkbox,Modal } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale,tooLongLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, getDefOwner } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';
import { sourceWay } from '@/utils/SourceWay';
import { orgType } from '@/utils/OrgType';
import { convertCodeName, formatDate } from '@/utils/utils';
import { qtyStrToQty, add, toQtyStr } from '@/utils/QpcStrUtil';
import { itemColWidth, colWidth } from '@/utils/ColWidth';
import ItemEditTable from './ItemEditTable';
import CreatePage from './CreatePage';
import { orderLocale,itemRepeat } from '@/pages/In/Order/OrderLocale';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import { MAX_DECIMAL_VALUE } from '@/utils/constants';
import ContainerSelect from '@/pages/Component/Select/ContainerSelect';
import { PRETYPE } from '@/utils/constants';
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
export default class PriceSet extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
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
      qtyStr: '',
      vendor: {},
      auditButton : true,
      owner: getDefOwner(),
    }
  }
  componentDidMount() {
    this.props.onRef && this.props.onRef(this);
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
    if (nextProps.order.entity && this.props.order.entity != nextProps.order.entity) {

      if (nextProps.order.entityUuid && nextProps.article.qpcs && nextProps.order.entity.items) {
        nextProps.order.entity.items.map(e => {
          if (e.article) {
            this.getQpcsByArticleUuid(e.article)
          }
        })
      }
    }

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
   * 绘制明细表格
   */
  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, vendorArticle, orderBillitems } = this.state;
    let articleCols = [
      {
        title: '分类',
        key: 'article',
        width: 100,
        render: record => {
          return (
            <Select style={{marginTop:'5px', marginBottom:'5px'}}
            />
          );
        }
      },
      {
        title: '其他',
        width: 50,
        render: (text, record) => {
          return (
            <Checkbox style={{marginTop:'5px', marginBottom:'5px'}} checked={record.others ? record.others : false}/>
          )
        },
      },
      {
        title: '计价方式',
        key: 'type',
        width: 100,
        render: (text, record) => {
          return (
            <ContainerSelect style={{marginTop:'5px', marginBottom:'5px'}}
              value={record.containerBarcode}
              onChange={e => this.handleFieldChange(e, 'containerBarcode', record.line)}
              placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)}
            />
          )
        },
      }
    ];
    return (
      <ItemEditTable
        noLine
        notNote
        noSelection
        columns={articleCols}
        data={orderBillitems ? orderBillitems : []}
      />
    )
  }
}
