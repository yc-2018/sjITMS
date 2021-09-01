import { connect } from 'dva';
import moment from 'moment';
import { isArray } from 'util';
import { Form, Select, Input, message, Modal, Col } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale, tooLongLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, getDefOwner } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';
import { sourceWay } from '@/utils/SourceWay';
import { orgType } from '@/utils/OrgType';
import { convertCodeName, formatDate } from '@/utils/utils';
import { codePattern } from '@/utils/PatternContants';
import { qtyStrToQty, add, toQtyStr } from '@/utils/QpcStrUtil';
import { itemColWidth, colWidth } from '@/utils/ColWidth';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { processingSchemeLocal } from './ProcessingSchemeLocal';
import { MAX_DECIMAL_VALUE } from '@/utils/constants';
const { TextArea } = Input;
@connect(({ processingScheme, article, loading }) => ({
  processingScheme,
  article,
  loading: loading.models.processingScheme,
}))
@Form.create()
export default class ProcessingSchemeCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      title: commonLocale.createLocale + processingSchemeLocal.title,
      entity: {
        companyUuid: loginCompany().uuid,
        owner: getDefOwner(),
        rawItems: [],
        endproductItems: []
      },
      processingSchemeRawItems : [],
      processingSchemeEndproductItems : [],
      articles: [],
      articleMap: {},
      qpcStrAndMunitOptions: [],
      qtyStr: '',
      owner: getDefOwner(),
    }
  }
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.processingScheme.entity && this.props.processingScheme.entityUuid) {
      this.setState({
        entity: nextProps.processingScheme.entity,
        title: convertCodeName(nextProps.processingScheme.entity),
        processingSchemeRawItems : nextProps.processingScheme.entity.rawItems,
        processingSchemeEndproductItems : nextProps.processingScheme.entity.endproductItems
      });
    }
    if (nextProps.article.data.list && Array.isArray(nextProps.article.data.list)&&nextProps.article.data.list!=this.props.article.data.list) {
      this.setState({
        articles: nextProps.article.data.list
      });

    }
    if (nextProps.processingScheme.entity && this.props.processingScheme.entity != nextProps.processingScheme.entity) {

      if (nextProps.processingScheme.entityUuid && nextProps.processingScheme.qpcs && nextProps.processingScheme.entity.rawItems && nextProps.processingScheme.entity.endproductItems) {
        nextProps.processingScheme.entity.rawItems.map(e => {
          if (e.article) {
            this.getQpcsByArticleUuid(e.article)
          }
        })
        nextProps.processingScheme.entity.endproductItems.map(e => {
          if (e.article) {
            this.getQpcsByArticleUuid1(e.article)
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
   * 选择货主
   */
  handlechangeOwner = (value) => {
    const { processingSchemeRawItems,processingSchemeEndproductItems,entity } = this.state;
    let originalOwner = this.props.form.getFieldValue('owner');
    if (processingSchemeRawItems.length == 0 && entity.rawItems.length == 0 && processingSchemeEndproductItems.length == 0 && entity.endproductItems.length == 0) {
      entity.owner = JSON.parse(value);
      this.setState({
        owner: JSON.parse(value),
      });
    }else if (processingSchemeRawItems.length > 0 || entity.rawItems.length > 0 || processingSchemeEndproductItems.length>0 || entity.endproductItems.length>0){
      Modal.confirm({
        title: '修改货主会导致商品信息清空，请确认修改？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          entity.rawItems = [];
          entity.endproductItems = [];
          entity.owner = JSON.parse(value);
          this.setState({
            owner: JSON.parse(value),
            processingSchemeRawItems:[],
            processingSchemeEndproductItems:[],
            articles:[],
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
   * 商品选择框搜索功能
   */
  onSearchArticle = (value) => {
    let pageFilter={}
    pageFilter.page = 0;
    pageFilter.pageSize = 10;
    pageFilter.searchKeyValues = {
      ownerUuid: this.state.owner.uuid,
      companyUuid:loginCompany().uuid,
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

    const { articles } = this.state;
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
      type: 'processingScheme/getByUuid',
      payload: this.props.processingScheme.entityUuid
    });
  }
  /**
   * 取消
   */
  onCancel = () => {
    this.props.dispatch({
      type: 'processingScheme/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  /**
   * 保存
   */
  onSave = (data) => {
    let processingScheme = {
      ...this.state.entity,
      ...data,
    };
    if (Array.isArray(this.state.processingSchemeRawItems)) {
      for (let i = 0; i < this.state.processingSchemeRawItems.length; i++) {
        if (!this.state.processingSchemeRawItems[i].article) {
          this.state.processingSchemeRawItems.splice(i, 1);
          if (this.state.processingSchemeRawItems[i] && this.state.processingSchemeRawItems[i].line) {
            this.state.processingSchemeRawItems[i].line = i + 1;
          }
          i = i - 1;
        }
      }
      for (let i = 0; i < this.state.processingSchemeRawItems.length; i++) {
        if (this.state.processingSchemeRawItems[i] && !this.state.processingSchemeRawItems[i].qpcStr) {
          message.error('原料明细第' + this.state.processingSchemeRawItems[i].line + '行包装规格不能为空');
          for (let j = i + 1; j < this.state.processingSchemeRawItems.length; j++) {
            this.state.processingSchemeRawItems[j].line = j + 1;
          }
          return;
        }
        if (this.state.processingSchemeRawItems[i].article && this.state.processingSchemeRawItems[i].qty === 0) {
          message.error('原料明细第' + this.state.processingSchemeRawItems[i].line + '行件数不能为0');
          for (let j = i + 1; j < this.state.processingSchemeRawItems.length; j++) {
            this.state.processingSchemeRawItems[j].line = j + 1;
          }
          return;
        }
      }
    }
    if (this.state.processingSchemeRawItems.length === 0) {
      message.error('原料明细不能为空');
      return;
    }

    if (Array.isArray(this.state.processingSchemeEndproductItems)) {
      for (let i = 0; i < this.state.processingSchemeEndproductItems.length; i++) {
        if (!this.state.processingSchemeEndproductItems[i].article) {
          this.state.processingSchemeEndproductItems.splice(i, 1);
          if (this.state.processingSchemeEndproductItems[i] && this.state.processingSchemeEndproductItems[i].line) {
            this.state.processingSchemeEndproductItems[i].line = i + 1;
          }
          i = i - 1;
        }
      }
      for (let i = 0; i < this.state.processingSchemeEndproductItems.length; i++) {
        if (this.state.processingSchemeRawItems[i] && !this.state.processingSchemeRawItems[i].qpcStr) {
          message.error('成品明细第' + this.state.processingSchemeRawItems[i].line + '行包装规格不能为空');
          for (let j = i + 1; j < this.state.processingSchemeRawItems.length; j++) {
            this.state.processingSchemeRawItems[j].line = j + 1;
          }
          return;
        }
        if (this.state.processingSchemeEndproductItems[i].article && this.state.processingSchemeEndproductItems[i].qty === 0) {
          message.error('成品明细第' + this.state.processingSchemeEndproductItems[i].line + '行件数不能为0');
          for (let j = i + 1; j < this.state.processingSchemeEndproductItems.length; j++) {
            this.state.processingSchemeEndproductItems[j].line = j + 1;
          }
          return;
        }
      }
    }
    if (this.state.processingSchemeEndproductItems.length === 0) {
      message.error('成品明细不能为空');
      return;
    }

    processingScheme.rawItems = this.state.processingSchemeRawItems;
    processingScheme.endproductItems = this.state.processingSchemeEndproductItems;
    processingScheme.dcUuid = loginOrg().uuid;
    processingScheme.owner = JSON.parse(processingScheme.owner);
    if (!processingScheme.uuid) {
      this.props.dispatch({
        type: 'processingScheme/onSave',
        payload: processingScheme,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
          }
        }
      });
    } else {
      this.props.dispatch({
        type: 'processingScheme/onModify',
        payload: processingScheme,
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
    let processingScheme = {
      ...this.state.entity,
      ...data,
    };
    if (Array.isArray(this.state.processingSchemeRawItems)) {
      if(this.state.processingSchemeRawItems.length>1) {
        for (let i = 0; i < this.state.processingSchemeRawItems.length; i++) {
          if (!this.state.processingSchemeRawItems[i].article) {
            this.state.processingSchemeRawItems.splice(i, 1);
            if (this.state.processingSchemeRawItems[i] && this.state.processingSchemeRawItems[i].line) {
              this.state.processingSchemeRawItems[i].line = i + 1;
            }
            i = i - 1;
          }
        }
        for (let i = 0; i < this.state.processingSchemeRawItems.length; i++) {
          if (this.state.processingSchemeRawItems[i] && !this.state.processingSchemeRawItems[i].qpcStr) {
            message.error('原料明细第' + this.state.processingSchemeRawItems[i].line + '行包装规格不能为空');
            for (let j = i + 1; j < this.state.processingSchemeRawItems.length; j++) {
              this.state.processingSchemeRawItems[j].line = j + 1;
            }
            return;
          }
          if (this.state.processingSchemeRawItems[i].article && this.state.processingSchemeRawItems[i].qty === 0) {
            message.error('原料明细第' + this.state.processingSchemeRawItems[i].line + '行件数不能为0');
            for (let j = i + 1; j < this.state.processingSchemeRawItems.length; j++) {
              this.state.processingSchemeRawItems[j].line = j + 1;
            }
            return;
          }
        }
      }
    }
    if (this.state.processingSchemeRawItems.length === 0) {
      message.error('原料明细不能为空');
      return;
    }

    if (Array.isArray(this.state.processingSchemeEndproductItems)) {
      if(this.state.processingSchemeEndproductItems.length>1) {
        for (let i = 0; i < this.state.processingSchemeEndproductItems.length; i++) {
          if (!this.state.processingSchemeEndproductItems[i].article) {
            this.state.processingSchemeEndproductItems.splice(i, 1);
            if (this.state.processingSchemeEndproductItems[i] && this.state.processingSchemeEndproductItems[i].line) {
              this.state.processingSchemeEndproductItems[i].line = i + 1;
            }
            i = i - 1;
          }
        }
        for (let i = 0; i < this.state.processingSchemeEndproductItems.length; i++) {
          if (this.state.processingSchemeRawItems[i] && !this.state.processingSchemeRawItems[i].qpcStr) {
            message.error('成品明细第' + this.state.processingSchemeRawItems[i].line + '行包装规格不能为空');
            for (let j = i + 1; j < this.state.processingSchemeRawItems.length; j++) {
              this.state.processingSchemeRawItems[j].line = j + 1;
            }
            return;
          }
          if (this.state.processingSchemeEndproductItems[i].article && this.state.processingSchemeEndproductItems[i].qty === 0) {
            message.error('成品明细第' + this.state.processingSchemeEndproductItems[i].line + '行件数不能为0');
            for (let j = i + 1; j < this.state.processingSchemeEndproductItems.length; j++) {
              this.state.processingSchemeEndproductItems[j].line = j + 1;
            }
            return;
          }
        }
      }
    }
    if (this.state.processingSchemeEndproductItems.length === 0) {
      message.error('成品明细不能为空');
      return;
    }

    processingScheme.rawItems = this.state.processingSchemeRawItems;
    processingScheme.endproductItems = this.state.processingSchemeEndproductItems;
    processingScheme.dcUuid = loginOrg().uuid;
    processingScheme.owner = JSON.parse(processingScheme.owner);

    this.props.dispatch({
      type: 'processingScheme/onSaveAndCreate',
      payload: processingScheme,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.setState({
            processingSchemeRawItems: [],
            processingSchemeEndproductItems: []
          })
          this.props.form.resetFields();
        }
      }
    });
  }

  /**
   * 查询商品对应的规格计量单位等
   */
  getQpcsByArticleUuid = (article,line) => {
    const { articleMap, } = this.state;
    const raw =  this.state.processingSchemeRawItems[line - 1];
    const endProduct =   this.state.processingSchemeEndproductItems[line - 1];
    const rawQpcty = [];
    const payload = {
      articleUuid: article.uuid
    }
    this.props.dispatch({
      type: 'article/getQpcsByArticleUuid',
      payload: { ...payload },
      callback:response=>{
        if(response&&response.success){
          if (Array.isArray(articleMap[article.uuid])) {
            for (let i = 0; i < articleMap[article.uuid].length; i++) {
              rawQpcty.push(articleMap[article.uuid][i].defaultQpcStr)
              for (let j = 0; j < rawQpcty.length; j++) {
                if(rawQpcty[j] === 'true') {
                    raw.qpcStr = articleMap[article.uuid][i].qpcStr;
                    raw.munit = articleMap[article.uuid][i].munit;
                }
                else {
                    raw.qpcStr = articleMap[article.uuid][0].qpcStr;
                    raw.munit = articleMap[article.uuid][0].munit;
                }
              }
            }

          }
          if (articleMap && articleMap[article.uuid] == undefined && endProduct) {
            endProduct.qpcStr = undefined;
          }
        }
      }
    });
  }
  getQpcsByArticleUuid1 = (article,line) => {
    const { articleMap, } = this.state;
    const raw =  this.state.processingSchemeRawItems[line - 1];
    const endProduct =   this.state.processingSchemeEndproductItems[line - 1];
    const endQpcty = [];
    const payload = {
      articleUuid: article.uuid
    }
    this.props.dispatch({
      type: 'article/getQpcsByArticleUuid',
      payload: { ...payload },
      callback:response=>{
        if(response&&response.success){
          if (Array.isArray(articleMap[article.uuid])) {
            for (let i = 0; i < articleMap[article.uuid].length; i++) {
              endQpcty.push(articleMap[article.uuid][i].defaultQpcStr)
              for (let j = 0; j < endQpcty.length; j++) {
                if(endQpcty[j] === 'true') {
                  endProduct.qpcStr = articleMap[article.uuid][i].qpcStr;
                  endProduct.munit = articleMap[article.uuid][i].munit;
                }
                else {
                  endProduct.qpcStr = articleMap[article.uuid][0].qpcStr;
                  endProduct.munit = articleMap[article.uuid][0].munit;
                }
              }
            }

          }
          if (articleMap && articleMap[article.uuid] == undefined && endProduct) {
            endProduct.qpcStr = undefined;
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
    const { entity, processingSchemeRawItems,articleMap } = this.state;
    const raw =  processingSchemeRawItems[line - 1];
    if (fieldName === 'article') {
      let article = {
        uuid: JSON.parse(e).uuid,
        code: JSON.parse(e).code,
        name: JSON.parse(e).name,
      }
      raw.article = article;
      raw.qtyStr = '0';
      raw.qty = 0;
      this.getQpcsByArticleUuid(JSON.parse(e), line)
    } else if (fieldName === 'qpcStrAndMunit') {
      var Arr = e.split("/");
      var qpcStr = Arr[0];
      var munit = Arr[1];
      raw.qpcStr = qpcStr;
      raw.munit = munit;
      raw.qty = qtyStrToQty(raw.qtyStr, qpcStr);
      raw.qtyStr = toQtyStr(raw.qty,raw.qpcStr);

    } else if (fieldName === 'qtyStr') {
      raw.qtyStr = e;
      raw.qty = qtyStrToQty(e.toString(), raw.qpcStr);
    }

    this.setState({
      processingSchemeRawItems: processingSchemeRawItems.slice()
    });
  }

  handleFieldChange1(e, fieldName, line) {
    const { entity, processingSchemeEndproductItems,articleMap } = this.state;
    const endProduct = processingSchemeEndproductItems[line - 1];
    if (fieldName === 'article') {
      let article = {
        uuid: JSON.parse(e).uuid,
        code: JSON.parse(e).code,
        name: JSON.parse(e).name,
      }
      endProduct.article = article;
      endProduct.qtyStr = '0';
      endProduct.qty = 0;
      this.getQpcsByArticleUuid1(JSON.parse(e), line)
    } else if (fieldName === 'qpcStrAndMunit') {
      var Arr = e.split("/");
      var qpcStr = Arr[0];
      var munit = Arr[1];
      endProduct.qpcStr = qpcStr;
      endProduct.munit = munit;
      endProduct.qty = qtyStrToQty(endProduct.qtyStr, qpcStr);
      endProduct.qtyStr = toQtyStr(endProduct.qty,endProduct.qpcStr);
    } else if (fieldName === 'qtyStr') {
      endProduct.qtyStr = e;
      endProduct.qty = qtyStrToQty(e.toString(), endProduct.qpcStr);
    }

    this.setState({
      processingSchemeEndproductItems: processingSchemeEndproductItems.slice()
    });
  }

  /**
   * 绘制表单
   */
  drawFormItems = () => {
    const { form } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { entity, defOwner } = this.state;
    let basicCols = [
      <CFormItem key="code" label={commonLocale.codeLocale}>
        {form.getFieldDecorator('code', {
          initialValue: entity.code,
          rules: [
            { required: true, message: notNullLocale(commonLocale.codeLocale) },
            {
              pattern: codePattern.pattern,
              message: codePattern.message,
            },
          ]
        })(<Input placeholder={placeholderLocale(commonLocale.codeLocale)} />)}
      </CFormItem>,
      <CFormItem key='name' label={commonLocale.nameLocale}>
        {
          getFieldDecorator('name', {
            initialValue: entity.name,
            rules: [{ required: true, message: notNullLocale(commonLocale.nameLocale) }, {
              max: 100, message: tooLongLocale(commonLocale.nameLocale, 100),
            }],
          })(
            <Input placeholder={placeholderLocale(commonLocale.nameLocale)} />
          )
        }
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
    if (this.state.processingSchemeRawItems) {
      this.state.processingSchemeRawItems.map(item => {
        if (!item.qty) {
          item.qty = 0;
        }
        if (!item.qtyStr) {
          item.qtyStr = 0;
        }
        if (!item.price) {
          item.price = 0;
        }
        allQty = allQty + parseInt(item.qty)
        allQtyStr = add(allQtyStr, item.qtyStr);
      })
    }

    return (
      <span style={{ marginLeft: '10px' }}>
				{commonLocale.inAllQtyStrLocale}：{allQtyStr}  |
        {commonLocale.inAllQtyLocale}：{allQty}
			</span>
    );
  }
  drawTotalInfo1 = () => {
    var allQtyStr = 0;
    var allQty = 0;
    if (this.state.processingSchemeEndproductItems) {
      this.state.processingSchemeEndproductItems.map(item => {
        if (!item.qty) {
          item.qty = 0;
        }
        if (!item.qtyStr) {
          item.qtyStr = 0;
        }
        if (!item.price) {
          item.price = 0;
        }
        allQty = allQty + parseInt(item.qty)
        allQtyStr = add(allQtyStr, item.qtyStr);
      })
    }

    return (
      <span style={{ marginLeft: '10px' }}>
				{commonLocale.inAllQtyStrLocale}：{allQtyStr}  |
        {commonLocale.inAllQtyLocale}：{allQty}
			</span>
    );
  }
  /**
   * 绘制明细表格
   */
  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, vendorArticle, processingSchemeRawItems, processingSchemeEndproductItems } = this.state;
    let rawArticleCols = [
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        width: itemColWidth.articleEditColWidth,
        render: record => {
          return (
            <Select
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
            >
              {
                this.getQpcStrOptions(record.article ? record.article.uuid : null)
              }
            </Select>
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
    let endProductArticleCols = [
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        width: itemColWidth.articleEditColWidth,
        render: record => {
          return (
            <Select
              value={record.article ? `[${record.article.code}]${record.article.name}` : undefined}
              placeholder={placeholderLocale(commonLocale.inArticleLocale)}
              onChange={e => this.handleFieldChange1(e, 'article', record.line)}
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
                      e => this.handleFieldChange1(e, 'qpcStrAndMunit', record.line)
                    }
            >
              {
                this.getQpcStrOptions(record.article ? record.article.uuid : null)
              }
            </Select>
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
              value={record.qtyStr ? record.qtyStr : 0}
              onChange={
                e => this.handleFieldChange1(e, 'qtyStr', record.line)
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
      <div>
        <ItemEditTable
          title={commonLocale.rawArticleLocal}
          columns={rawArticleCols}
          data={processingSchemeRawItems ? processingSchemeRawItems : []}
          drawTotalInfo={this.drawTotalInfo}
        />
        <ItemEditTable
          title={commonLocale.endproductArticleLocal}
          columns={endProductArticleCols}
          data={processingSchemeEndproductItems ? processingSchemeEndproductItems : []}
          drawTotalInfo={this.drawTotalInfo1}
        />
      </div>
    )
  }
}
