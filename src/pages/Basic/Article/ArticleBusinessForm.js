import { Component } from "react";
import { Button, Form, Input, Row, Col, Select, message, Checkbox } from 'antd';
import { connect } from 'dva';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { PRETYPE } from '@/utils/constants';
import { PUTAWAY_BIN, WEIGHT_SORT,MixArticle } from './Constants';
import { articleLocale } from './ArticleLocale';
import {
  commonLocale,
  notNullLocale,
  tooLongLocale,
  placeholderChooseLocale,
  placeholderLocale
} from '@/utils/CommonLocale';
import BinSelect from './BinSelect';

const FormItem = Form.Item;
const Option = Select.Option;

const maxOptions = [];
Object.keys(MixArticle).forEach(function (key) {
  maxOptions.push(<Option title={MixArticle[key].caption} key={MixArticle[key].name} value={MixArticle[key].name}>{MixArticle[key].caption}</Option>);
});

@connect(({ pretype, stock }) => ({
  pretype,
  stock
}))
@Form.create()
export default class ArticleBusinessForm extends Component {

  state = {
    typeNames: [],
    confirmLoading: false,
    showSplitBinCode: false,
    showCaseBinCode: false,
    articleBusiness: this.props.articleBusiness
  }

  componentDidMount() {
    this.fetchUnLoadAdvice();
    this.queryStockSplitBinCode();
    this.queryStocksCaseBinCode();
  }

  fetchUnLoadAdvice = () => {
    this.props.dispatch({
      type: 'pretype/queryType',
      payload: PRETYPE['unLoadAdvice']
    });
  }

  componentWillReceiveProps(nextProps) {
    let preType = nextProps.pretype;
    if (preType) {
      if (preType.queryType === PRETYPE['unLoadAdvice'] && preType.names) {
        let typeNames = [...preType.names];
        this.setState({
          typeNames: typeNames,
        })
      }
    }

    this.setState({
      value: nextProps.value
    });
  }

  buildUnLoadAdviceOptions = () => {
    const { typeNames } = this.state;
    let options = [];

    Array.isArray(typeNames)
      && typeNames.forEach(function (item, index) {
        options.push(
          <Select.Option key={index} value={item}>{item}</Select.Option>
        );
      });
    return options;
  }

  onChange = (e) => {
    const { articleBusiness } = this.props;
    if (e.target.checked) {
      articleBusiness.processe = true
    } else {
      articleBusiness.processe = false
    }
  }

  queryStockSplitBinCode = () => {
    const {
      pickSchema
    } = this.props;
    this.props.dispatch({
      type: 'stock/pageQuery',
      payload: {
        page: 0,
        pageSize: 20,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        binCode: pickSchema ? pickSchema.splitBinCode : ''
      },
      callback: (response) => {
        if (response && response.success) {
          if(response.data.recordCount>0 &&  response.data.records[0].binUsage != 'PickUpStorageBin') {
            this.setState({
              showSplitBinCode: true
            })
          }
        }
      }
    })
  }

  queryStocksCaseBinCode = () => {
    const {
      pickSchema
    } = this.props;
    this.props.dispatch({
      type: 'stock/pageQuery',
      payload: {
        page: 0,
        pageSize: 20,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        binCode: pickSchema ? pickSchema.caseBinCode : ''
      },
      callback: (response) => {
        if (response && response.success) {
          if(response.data.recordCount>0 &&  response.data.records[0].binUsage != 'PickUpStorageBin') {
            this.setState({
              showCaseBinCode: true
            })
          }
        }
      }
    })
  }

  handleAddOrModify = (e) => {
    const {
      form,
      dispatch,
      article,
      refresh,
      switchArticleBusinessView
    } = this.props;
    e.preventDefault();

    form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }

      this.setState({
        confirmLoading: true,
      })

      let taskArr = [this.handleAddOrModifyArticleBussiness(fieldsValue),
      this.handleAddOrModifyPickSchema(fieldsValue)];

      Promise.all(taskArr)
        .then(data => {
          let count = 0;
          let result;
          data.map(item => {
            if (item.success) {
              count++;
              result = item;
            }
          })

          if (count == 2) {
            message.success(result.message);
            switchArticleBusinessView(false);
            refresh();
          }

          this.setState({
            confirmLoading: false,
          })
        })
        .catch(e => console.log(e));
    });

  }

  handleAddOrModifyArticleBussiness = (fieldsValue) => {
    const {
      form,
      dispatch,
      article,
    } = this.props;

    const { articleBusiness } = this.state;

    let params = {
      ...fieldsValue,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      articleCode: article.code,
    }
    let type = 'articleBusiness/add';
    if (articleBusiness.uuid) {
      type = 'articleBusiness/modify';
      params['uuid'] = articleBusiness.uuid;
    }
    let that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: type,
        payload: params,
        callback: response => {
          if (response && response.success) {
            if (type === 'articleBusiness/add') {
              articleBusiness.uuid = response.data;
              that.setState({
                articleBusiness: articleBusiness
              })
              resolve({
                success: true,
                message: commonLocale.saveSuccessLocale
              });
              return;
            } else if (type === 'articleBusiness/modify') {
              resolve({
                success: true,
                message: commonLocale.modifySuccessLocale
              });
              return;
            }
          } else {
            resolve({
              success: false,
              message: response.message
            });
            return;
          }

        }
      })
    })
  }

  handleAddOrModifyPickSchema = (fieldsValue) => {
    const {
      pickSchema,
      form,
      dispatch,
      article,
    } = this.props;

    let params = {
      ...pickSchema,
      ...fieldsValue,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      article: {
        code: article.code,
        name: article.name,
        uuid: article.uuid
      },
      defaultQpcStr: this.getArticleDefaultQpcStr()
    }

    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'pickSchema/add',
        payload: params,
        callback: response => {
          if (response && response.success) {
            resolve({
              success: true,
              message: commonLocale.saveSuccessLocale
            });
            return;
          } else {
            resolve({
              success: false,
              message: response.message
            });
            return;
          }
        }
      })
    })
  }

  getArticleDefaultQpcStr = () => {
    const {
      article,
    } = this.props;

    let qpcs = article.qpcs;
    let defaultQpcStr = '1*1*1';
    if (qpcs) {
      for (let x in qpcs) {
        if (qpcs[x].defaultQpcStr) {
          defaultQpcStr = qpcs[x].qpcStr;
          break;
        }
      }
    }

    return defaultQpcStr;
  }
  getPickQpcStrOptions = ()=>{
    const { article} = this.props;
    let list = [];
    let options = [];
    article.barcodes&&Array.isArray(article.barcodes)&&article.barcodes.forEach(info=>{
      if(list.indexOf(info.qpcStr)==-1){
        list.push(info.qpcStr);
      }
    })
    list.forEach(item=>{
      options.push(
        <Select.Option value={item} key={item}>{item}</Select.Option>
      )
    })
    return options;
  }

  render() {
    const { pickSchema, form, switchArticleBusinessView } = this.props;
    const { articleBusiness } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 12 },
      colon: false,
    };
    let codeCaseItem = null;
    let codeSplitItem = null;
    if (pickSchema && pickSchema.caseBinCode && this.state.showCaseBinCode) {
      codeCaseItem = <CFormItem key="caseBinCode" label={articleLocale.pickSchemaCaseBin}>
        {form.getFieldDecorator('caseBinCode')(
          <Col>{pickSchema.caseBinCode ? pickSchema.caseBinCode : '空'}</Col>
        )}
      </CFormItem>;
    } else {
      codeCaseItem = <CFormItem key='caseBinCode' label={articleLocale.pickSchemaCaseBin}>
        {form.getFieldDecorator('caseBinCode', {
          initialValue: pickSchema ? pickSchema.caseBinCode : undefined,
        })(  <BinSelect
          style={{ width: '100%' }}
          placeholder={placeholderLocale(articleLocale.pickSchemaCaseBin)}
          initBinCodes={pickSchema ? [pickSchema.caseBinCode, pickSchema.caseBinCode] : undefined}
        />)}
      </CFormItem>
    }
    if (pickSchema && pickSchema.splitBinCode && this.state.showSplitBinCode) {
      codeSplitItem = <CFormItem key="splitBinCode" label={articleLocale.pickSchemaSplitBin}>
        {form.getFieldDecorator('splitBinCode')(
          <Col>{pickSchema.splitBinCode ? pickSchema.splitBinCode : '空'}</Col>
        )}
      </CFormItem>;
    } else {
      codeSplitItem = <CFormItem key='splitBinCode' label={articleLocale.pickSchemaSplitBin}>
        {form.getFieldDecorator('splitBinCode', {
          initialValue: pickSchema ? pickSchema.splitBinCode : undefined,
        })(  <BinSelect
          style={{ width: '100%' }}
          placeholder={placeholderLocale(articleLocale.pickSchemaSplitBin)}
          initBinCodes={pickSchema ? [pickSchema.splitBinCode, pickSchema.splitBinCode] : undefined}
        />)}
      </CFormItem>
    }
    let cols = [
      <CFormItem key='putawayBin' label={articleLocale.articleBusinessPutawayBin}>
        {form.getFieldDecorator('putawayBin', {
          initialValue: articleBusiness.uuid ? articleBusiness.putawayBin : 'FIRSTPICKUP',
          rules: [
            { required: true, message: notNullLocale(articleLocale.articleBusinessPutawayBin) },
          ]
        })( <Select
          placeholder={placeholderChooseLocale(articleLocale.articleBusinessPutawayBin)}
          style={{ width: '100%' }}
        >
          <Option value='PICKUPBIN'>{PUTAWAY_BIN['PICKUPBIN']}</Option>
          <Option value='STORAGEBIN'>{PUTAWAY_BIN['STORAGEBIN']}</Option>
          <Option value='FIRSTPICKUP'>{PUTAWAY_BIN['FIRSTPICKUP']}</Option>
        </Select>)}
      </CFormItem>,
      <CFormItem key='unLoadAdvice' label={articleLocale.articleBusinessUnLoadAdvice}>
        {form.getFieldDecorator('unLoadAdvice', {
            initialValue: articleBusiness.uuid ? articleBusiness.unLoadAdvice : undefined,
          })(  <Select
            allowClear
            placeholder={placeholderChooseLocale(articleLocale.articleBusinessUnLoadAdvice)}
            style={{ width: '100%' }}
          >
            {this.buildUnLoadAdviceOptions()}
          </Select>)}
      </CFormItem>,
      codeCaseItem,
      codeSplitItem,
      <CFormItem label={articleLocale.articleBusinessProcess}>
        {form.getFieldDecorator('processe', {
          initialValue: articleBusiness.processe ? true : false
        })(
          <Checkbox onChange={this.onChange} checked={ articleBusiness.processe } />
        )}
      </CFormItem>,
      <CFormItem key='weightSort' label={articleLocale.articleBusinessWeightSort}>
        {form.getFieldDecorator('weightSort', {
          initialValue: articleBusiness.uuid ? articleBusiness.weightSort : 'NORMAL',
          rules: [
            { required: true, message: notNullLocale(articleLocale.articleBusinessWeightSort) },
          ]
        })( <Select
          placeholder={placeholderChooseLocale(articleLocale.articleBusinessWeightSort)}
          style={{ width: '100%' }}
        >
          <Option value='NORMAL'>{WEIGHT_SORT['NORMAL']}</Option>
          <Option value='LIGHT'>{WEIGHT_SORT['LIGHT']}</Option>
          <Option value='HEAVY'>{WEIGHT_SORT['HEAVY']}</Option>
        </Select>)}
      </CFormItem>,
      <CFormItem key='pickBin' label={articleLocale.setPickBin}>
        {form.getFieldDecorator('pickBin', {
          initialValue: articleBusiness.pickBin ? true : false,
          rules: [
            { required: true, message: notNullLocale(articleLocale.setPickBin) },
          ]
        })( <Select
          placeholder={placeholderChooseLocale(articleLocale.setPickBin)}
          style={{ width: '100%' }}
        >
          <Option value={true}>{'是'}</Option>
          <Option value={false}>{'否'}</Option>
        </Select>)}
      </CFormItem>,
      <CFormItem key='newArticle' label={articleLocale.newArticle}>
        {form.getFieldDecorator('newArticle', {
          initialValue: articleBusiness.newArticle ? true : false,
          rules: [
            { required: true, message: notNullLocale(articleLocale.newArticle) },
          ]
        })( <Select
          placeholder={placeholderChooseLocale(articleLocale.newArticle)}
          style={{ width: '100%' }}
        >
          <Option value={true}>{'是'}</Option>
          <Option value={false}>{'否'}</Option>
        </Select>)}
      </CFormItem>,
      <CFormItem key='pickQpcStr' label={articleLocale.pickQpcStr}>
        {form.getFieldDecorator('pickQpcStr', {
          initialValue: articleBusiness.pickQpcStr ? articleBusiness.pickQpcStr : undefined,
        })( <Select
          placeholder={placeholderChooseLocale(articleLocale.pickQpcStr)}
          style={{ width: '100%' }}
          allowClear
        >
          {this.getPickQpcStrOptions()}
        </Select>)}
      </CFormItem>,
      <CFormItem key='mixArticle' label={articleLocale.mixArticle}>
        {form.getFieldDecorator('mixArticle', {
          initialValue: articleBusiness.mixArticle ? articleBusiness.mixArticle : 'NOMIX',
        })( <Select
          placeholder={placeholderChooseLocale(articleLocale.mixArticle)}
          style={{ width: '100%' }}
          allowClear
        >
          {maxOptions}
        </Select>)}
      </CFormItem>,
      <br/>,
      <Row>
        <Col span={21} style={{ textAlign: 'right' }}>
          <Button style={{ marginRight: 10 }} onClick={() => switchArticleBusinessView(false)}>
            {commonLocale.cancelLocale}
          </Button>
          <Button loading={this.state.confirmLoading} type="primary" htmlType="submit" onClick={this.handleAddOrModify}>
            {commonLocale.confirmLocale}
          </Button>
        </Col>
      </Row>
    ];
    return [
      <FormPanel cols={cols}/>
    ];
  }
}
