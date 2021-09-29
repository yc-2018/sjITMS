import { Component } from "react";
import moment from 'moment';
import { Button, Form, Row, Col, Select, message, DatePicker, InputNumber, Input } from 'antd';
import { connect } from 'dva';
import FormPanel from '@/pages/Component/Form/FormPanel';
import { commonLocale,placeholderChooseLocale,placeholderLocale } from '@/utils/CommonLocale';
import { formatDate } from "@/utils/utils";
import { storeLocale } from './StoreLocale';
import { allowReceiveDayPattern } from "@/utils/PatternContants";
import { accDiv, accMul } from "@/utils/QpcStrUtil";

const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ store }) => ({
  store,
}))
@Form.create()
export default class StoreDCBusinessForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      confirmLoading: false,
      storeInfo: this.props.storeInfo,
      allowReceiveType:undefined,
    }
    let type = undefined;

    if(this.props.storeInfo.allowReceiveDay&&this.props.storeInfo.allowReceiveDay>1){
      type = 'day'
    }else if(this.props.storeInfo.allowReceiveDay&&!(this.props.storeInfo.allowReceiveDay>1)){
      type = 'ratio'
    }
    this.state.allowReceiveType =type;
    
  }
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

      let day = 0;
     
      if(fieldsValue.allowReceiveDay){
        // if(typeof(fieldsValue.allowReceiveDay) =='number'){
        if(fieldsValue.allowReceiveType =="day"){
          day = parseInt(fieldsValue.allowReceiveDay);
        }else if(fieldsValue.allowReceiveDay.indexOf('/')!=-1){
          let list = fieldsValue.allowReceiveDay.split('/');
          let value = Number(accDiv(list[0],list[1]).toFixed(2));
          
          if(value>1){
            message.error('货品允收期不能大于1');
            return;
          }else if(value){
            day = value
          }

        }else if(fieldsValue.allowReceiveDay.indexOf('%')!=-1){
          let list = fieldsValue.allowReceiveDay.split('%');
          if(list[0]>100){
            message.error('货品允收期不能大于100%');
            return;
          }
          let value = Number(accDiv(list[0],100).toFixed(2));
          day = value;
        }
      }
      this.setState({
        confirmLoading: true,
      })
      let data = {
        uuid: storeInfo.uuid,
        version: storeInfo.version,
        allowreceiveDay: day
      }
      this.props.dispatch({
        type: 'store/modifyAllowReceiveDay',
        payload: data,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.modifySuccessLocale);
            this.props.switchStoreDCBusinessView(false);
            this.props.refresh();
          }
          this.setState({
            confirmLoading: false,
          })
        }
      });
    
    });
  }
  onChange = (value)=>{
    this.setState({
      allowReceiveType:value
    });
    this.props.form.setFieldsValue({
      allowReceiveDay:undefined
    })
  }
  render() {
    const { pickSchema, form, switchStoreDCBusinessView } = this.props;
    const { storeInfo,allowReceiveType } = this.state;
    const formItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 7 },
      colon: false,
    };
    let type = undefined;
    if(storeInfo.allowReceiveDay&&storeInfo.allowReceiveDay>1){
      type = 'day'
    }else if(storeInfo.allowReceiveDay&&(storeInfo.allowReceiveDay<1||storeInfo.allowReceiveDay==1)){
      type = 'ratio'
    }

    let cols = [
      <Form.Item key='allowReceiveDay' label={'货品允收期'} {...formItemLayout}>
        <Form.Item style={{ display: 'inline-block' ,width:'30%'}}>
          {form.getFieldDecorator('allowReceiveType', {
            initialValue:type
          })( 
              <Select onChange={this.onChange} style={{width:'100%'}} placeholder={'请先选择类型'} allowClear>
                <Select.Option key="day" value={'day'}>按天数</Select.Option>
                <Select.Option key="ratio" value={'ratio'}>按比例</Select.Option>
              </Select>
            
          )}
        </Form.Item>
        {
          allowReceiveType=='day'?<Form.Item style={{ display: 'inline-block',width:'70%' }}>
          {form.getFieldDecorator('allowReceiveDay', {
            initialValue: storeInfo.allowReceiveDay ? storeInfo.allowReceiveDay : undefined,
            rules: [
              {
                pattern: allowReceiveDayPattern.patternNum,
                message: allowReceiveDayPattern.messageNum
              },
            ]
          })( 
            // <InputNumber style={{width:'100%'}} min={2} precision={0} placeholder={'请输入大于1的天数'}/>
            <Input style={{width:'100%'}} placeholder={'请输入大于1,小于7位的天数'}/>
            
          )}
          </Form.Item>:null
        }
        {
          allowReceiveType=='ratio'?<Form.Item style={{ display: 'inline-block',width:'70%'}}>
          {form.getFieldDecorator('allowReceiveDay', {
            initialValue: storeInfo.allowReceiveDay ? accMul(storeInfo.allowReceiveDay,100)+'%' : undefined,
            rules: [
              {
                pattern: allowReceiveDayPattern.pattern,
                message: allowReceiveDayPattern.message
              },
            ]
          })( 
            <Input  style={{ width: '100%' }}  placeholder={placeholderLocale('不大于1的N/M和N%格式')}/>
            
          )}
          </Form.Item>:null
        }
      </Form.Item>,
      <br/>,
      <Row key='operaateDC'>
        <Col span={21} style={{ textAlign: 'right' }}>
          <Button key="cancleDC" style={{ marginRight: 10 }} onClick={() => switchStoreDCBusinessView(false)}>
            {commonLocale.cancelLocale}
          </Button>
          <Button key="submitDC" loading={this.state.confirmLoading} type="primary" htmlType="submit" onClick={this.handleAddOrModify}>
            {commonLocale.confirmLocale}
          </Button>
        </Col>
      </Row>
    ];
    return [
      <FormPanel  key="dcInfo" cols={cols}/>
    ];
  }
}
