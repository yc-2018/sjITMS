import { PureComponent } from "react";
import { connect } from 'dva';
import { Modal, Form, Col, Input } from "antd";
import { SerialArchLocale } from '@/pages/Tms/DispatchCenterSerialArch/SerialArchLocale';
import { commonLocale } from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import { loginCompany } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
@connect(({ dispatchSerialArch, loading }) => ({
  dispatchSerialArch,
  loading: loading.models.dispatchSerialArch
}))
@Form.create()
export default class LineCreateModal extends PureComponent{
  constructor(props){
    super(props)
    this.state={
      title: commonLocale.createLocale,
      visible : props.visible,
      targetRow:{}
    }
  }
  componentDidMount(){
    this.getSerialArch();
  }
  componentWillReceiveProps(nextProps){
    if(nextProps.visible!=undefined&&nextProps.visible!=this.props.visible){
      this.setState({
        visible:nextProps.visible
      })
      this.props.form.resetFields();
    }
  }
  getSerialArch = ()=>{
    this.props.dispatch({
      type :'dispatchSerialArch/getSerialArch',
      callback:response=>{
        if(response&&response.success){
          this.setState({
            defSerialArch:response.data
          })
        }
      }
    })
  }
  onCancel = ()=>{
    this.props.form.resetFields();
    this.props.onCancelModal();
  }
  onOk = () => {
    const {
      form,
      handleSaveLine
    } = this.props;
    const { defSerialArch, visible } = this.state;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      fieldsValue.serialArch = {
        uuid: defSerialArch.uuid,
        code: defSerialArch.code,
        name: defSerialArch.name
      }
      const data = {
        ...fieldsValue,
      };
      handleSaveLine(data);
      this.setState({
        visible: false
      })
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const { visible, defSerialArch } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 12 },
      colon: false
    };
    return <Modal
      title={SerialArchLocale.serialArchLine}
      visible={visible}
      onOk={this.onOk}
      onCancel={this.onCancel}
    >
      <Form>
        <Col>
          <Form.Item label={commonLocale.codeLocale + "："} {...formItemLayout}>
            {
              getFieldDecorator('code', {
                initialValue: '',
                rules: [
                  {
                    required: true
                  }, {
                    pattern: codePattern.pattern,
                    message: codePattern.message
                  }]
              })(
                <Input />
              )
            }</Form.Item>
        </Col>
        <Col>
          <Form.Item label={commonLocale.nameLocale + "："} {...formItemLayout}>
            {
              getFieldDecorator('name', {
                initialValue:'',
                rules: [
                  {
                    required: true
                  }, {
                    max: 30,
                    message: '最大长度为30'
                  }]
              })(
                <Input />
              )
            }</Form.Item>
        </Col>
        <Col>
          <Form.Item label={SerialArchLocale.serialArchTitle + "："} {...formItemLayout}>
            <span>{defSerialArch ? convertCodeName(defSerialArch) : ''}</span>
          </Form.Item>
        </Col>
      </Form>
    </Modal>
  }
}
