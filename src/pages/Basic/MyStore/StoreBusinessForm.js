import { Component } from "react";
import moment from 'moment';
import { Button, Form, Row, Col, Select, message, DatePicker, InputNumber } from 'antd';
import { connect } from 'dva';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { ArrivalType,SignIn } from './StoreContants';
import { commonLocale,placeholderChooseLocale,placeholderLocale } from '@/utils/CommonLocale';
import { formatDate } from "@/utils/utils";
import { storeLocale } from './StoreLocale';
import { PRETYPE } from '@/utils/constants';

const FormItem = Form.Item;
const Option = Select.Option;

const signInOptions = [];
Object.keys(SignIn).forEach(function (key) {
  signInOptions.push(<Option value={SignIn[key].name} key={SignIn[key].name}>{SignIn[key].caption}</Option>);
});
const typeOptions = [];
Object.keys(ArrivalType).forEach(function (key) {
  typeOptions.push(<Option value={ArrivalType[key].name} key={ArrivalType[key].name}>{ArrivalType[key].caption}</Option>);
});

@connect(({ store,pretype }) => ({
  store,pretype
}))
@Form.create()
export default class StoreBusinessForm extends Component {

  state = {
    confirmLoading: false,
    storeBusiness: this.props.storeBusiness,
    storeInfo: this.props.storeInfo,
    storAreaNames:'',
  }
componentDidMount(){
  this.fetchStoreAreaByUuid();
}
  componentWillReceiveProps(nextProps){
    const preType = nextProps.pretype;
    if (preType.queryType === PRETYPE['storeArea'] && preType.names) {
      var storAreaNames = [...preType.names];
      this.setState({
        storAreaNames: storAreaNames
      })
    }
  }
   /** 
   *  通过调度uuid获取门店区域信息
   */
  fetchStoreAreaByUuid = () => {
    const {
      dispatch
    } = this.props;
    dispatch({
      type: 'pretype/queryType',
      payload: PRETYPE['storeArea']
    });
  };
  /**
   * 保存
   */
  handleAddOrModify = (e) => {
    const {
      form,
      dispatch,
      storeInfo,
    } = this.props;
    const { storeBusiness } = this.state
    e.preventDefault();

    form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }

      this.setState({
        confirmLoading: true,
      })

      if(fieldsValue.receiveTime)
        fieldsValue.receiveTime = formatDate(fieldsValue.receiveTime);

      let params = {
        store:{
          uuid:storeInfo.uuid,
          code:storeInfo.code,
          name:storeInfo.name
        },
        ...fieldsValue,
      }

      let type = 'store/saveStoreTms';
      if (storeBusiness&&storeBusiness.uuid) {
        type = 'store/modifyStoreTms';
        params['uuid'] = storeBusiness.uuid;
      }

      this.props.dispatch({
        type :type,
        payload:params,
        callback:response=>{
          if(response&&response.success){
            message.success(commonLocale.saveSuccessLocale)
            this.props.switchStoreBusinessView(false);
            this.props.refresh();
          }
          this.setState({
            confirmLoading: false,
          })
        }
      });
    
    });
  }
  render() {
    const { pickSchema, form, switchStoreBusinessView } = this.props;
    const { storeBusiness ,storAreaNames} = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 12 },
      colon: false,
    };
    
    let storeAreaNamesItems = [];
    if (storAreaNames) {
      storAreaNames.map((result) => storeAreaNamesItems.push(<Option key={`${result}`}>{`${result}`}</Option>));
    }
    let cols = [
      <CFormItem key='arrivalType' label={storeLocale.arrivalType}>
        {form.getFieldDecorator('arrivalType', {
          initialValue: storeBusiness&&storeBusiness.arrivalType ? storeBusiness.arrivalType : undefined,
        })( 
        <Select
          placeholder={placeholderChooseLocale(storeLocale.arrivalType)}
          style={{ width: '100%' }}
        >
         {typeOptions}
        </Select>)}
      </CFormItem>,
      <CFormItem key='signIn' label={storeLocale.signIn}>
        {form.getFieldDecorator('signIn', {
          initialValue: storeBusiness&&storeBusiness.signIn ? storeBusiness.signIn : undefined,
        })( 
        <Select
          placeholder={placeholderChooseLocale(storeLocale.signIn)}
          style={{ width: '100%' }}
        >
          {signInOptions}
        </Select>)}
      </CFormItem>,
      <CFormItem key='receiveTime' label={storeLocale.receiveTime}>
        {form.getFieldDecorator('receiveTime', {
          initialValue: storeBusiness&&storeBusiness.receiveTime ?moment(storeBusiness.receiveTime, 'YYYY-MM-DD') :undefined,
        })( 
          <DatePicker
            placeholder={placeholderChooseLocale(storeLocale.receiveTime)}
            style={{ width: '100%' }}
            allowClear={false}
          />
        )}
      </CFormItem>,
      <CFormItem key='parkingFee' label={storeLocale.parkingFee}>
        {form.getFieldDecorator('parkingFee', {
          initialValue: storeBusiness&&storeBusiness.parkingFee ? storeBusiness.parkingFee : undefined,
        })( 
          <InputNumber style={{ width: '100%' }} precision={2} min={0} placeholder={placeholderLocale(storeLocale.parkingFee)}/>
        )}
      </CFormItem>,
      <CFormItem key='area' label={storeLocale.area} >
      {form.getFieldDecorator('area', {
        initialValue: storeBusiness&&storeBusiness.area ? storeBusiness.area : undefined,
      })( 
        <Select
        placeholder={placeholderChooseLocale(storeLocale.area)}
        style={{ width: '100%' }}
      >
      {storeAreaNamesItems}
      </Select>
      )}
    </CFormItem>,
    // <CFormItem key='whitespace' label={''} ></CFormItem>,
      <Row key='operaate'>
        <Col span={21} style={{ textAlign: 'right' }}>
          <Button key="cancle" style={{ marginRight: 10 }} onClick={() => switchStoreBusinessView(false)}>
            {commonLocale.cancelLocale}
          </Button>
          <Button key="submit" loading={this.state.confirmLoading} type="primary" htmlType="submit" onClick={this.handleAddOrModify}>
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
