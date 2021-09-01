import React, {PureComponent} from 'react';
import { 
  Form,
  Row, 
  Col,
  Input,
  Icon,
  Button,
  message
} from 'antd';
import { formatMessage } from 'umi/locale';
import styles from './company.less';
import PropTypes from "prop-types";
import { COMPANY_EDIT_TYPE } from "@/utils/constants";
import Address from '@/pages/Component/Form/Address';
const FormItem = Form.Item;

@Form.create()
class CompanyDetailBasicInfo extends PureComponent {

  static propTypes = {
    showBasicInfoForm: PropTypes.bool,
    switchBasicFormView: PropTypes.func,
  }
 
  static defaultProps = {
    showBasicInfoForm: false,
  }

  componentDidUpdate(){
    if(document.getElementById('name')!=null&&(document.activeElement.tagName =='BODY'||document.activeElement.id == 'name')){
      document.getElementById('name').focus();
    }
  }

  handleUpdateBasicInfo = (e) => {
    e.preventDefault();
    const { form, entity, handleModify } = this.props;

    form.validateFields((errors, fieldsValue) => {
      if (errors) return;

      if(fieldsValue.address.country===undefined||fieldsValue.address.province===undefined||fieldsValue.address.city===undefined){
        message.error(formatMessage({ id: 'common.addressSelected' }));
        return;
      }
      if(fieldsValue.address.street===undefined){
        message.error(formatMessage({ id: 'common.addressDetail.notNull' }));
        return;
      }else if(fieldsValue.address.street.length>100){
        message.error(formatMessage({ id: 'common.addressDetail.limitLength' }));
        return;
      }
      entity.address=fieldsValue.address;
      entity.code = fieldsValue.code;
      entity.name = fieldsValue.name;
      entity.adminName = fieldsValue.adminName;
      entity.adminPhone = fieldsValue.adminPhone;

      handleModify(entity, COMPANY_EDIT_TYPE['basic']);
    });
  }

  render() {
    const {
      entity,
      form,
      showBasicInfoForm,
      switchBasicFormView,
      updateBasicInfoLoading,
    } = this.props;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 12 },
      colon: false,
    };

    return (
      <div className={styles.basicInfoWrapper}>
        <div className={styles.content}>
          <div className={styles.titleWrappr}>
            <div className={styles.navTitle}>
              <span>{formatMessage({ id: 'company.detail.basic' })}</span>
            </div>
            <a className={styles.edit} onClick={() => switchBasicFormView(true)}
            style={{ visibility: !showBasicInfoForm ? 'visible' : 'hidden' }}>
              <Icon type="form" />
              <span>{formatMessage({ id: 'company.detail.label.edit' })}</span>
            </a>
          </div>

          <div className={styles.formWrapper}>
            <div className={styles.basicInfoForm} style={{ display: showBasicInfoForm ? 'block' : 'none' }}>
              <form onSubmit={this.handleUpdateBasicInfo}>
                <Row>
                  <Col span={12} >
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.code.name' })}>
                      {form.getFieldDecorator('code', {
                        rules: [
                          {
                            pattern: /^[0-9a-zA-Z]{4}$/,
                            message: formatMessage({ id: 'company.create.form.item.code.validate.message.integrality' }),
                          },
                        ],
                        initialValue: entity ? entity.code : null,
                      })(<div>{entity ? entity.code : null}</div>)}
                    </FormItem>
                  </Col>
                  <Col span={12}  >
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.name.name' })}>
                      {form.getFieldDecorator('name', {
                        rules: [
                          { required: true, message: formatMessage({ id: 'company.create.form.item.name.validate.message.notNull' }) },
                          {
                            max: 30,
                            message: formatMessage({ id: 'company.create.form.item.name.validate.message.limitLength' }),
                          },
                        ],
                        initialValue: entity ? entity.name : null,
                      })(<Input placeholder={formatMessage({ id: 'company.create.form.item.placeholder.name' })}/>)}
                    </FormItem>
                  </Col>
                  <Col span={12} >
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.adminPhone.name' })}>
                      {form.getFieldDecorator('adminPhone', {
                        rules: [
                          { required: true, message: formatMessage({ id: 'company.create.form.item.adminPhone.validate.message.notNull' }) },
                          { pattern: /^1(3|4|5|7|8)\d{9}$/, message: formatMessage({ id: 'company.create.form.item.adminPhone.validate.message.integrality' }) },
                        ],
                        initialValue: entity ? entity.adminPhone : null,
                      })(<Input placeholder={formatMessage({ id: 'company.create.form.item.placeholder.adminPhone' })}/>)}
                    </FormItem>
                  </Col>
                  <Col span={12} >
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.adminName.name' })}>
                      {form.getFieldDecorator('adminName', {
                        rules: [
                          { required: true, message: formatMessage({ id: 'company.create.form.item.adminName.validate.message.notNull' }) },
                          {
                            max: 30,
                            message: formatMessage({ id: 'company.create.form.item.adminName.validate.message.limitLength' }),
                          },
                        ],
                        initialValue: entity ? entity.adminName : null,
                      })(<Input placeholder={formatMessage({ id: 'company.create.form.item.placeholder.adminName' })} />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem 
                      {...formItemLayout} 
                      label={formatMessage({ id: 'common.address' })}
                    >
                      {form.getFieldDecorator('address', {
                        initialValue:entity ? entity.address : null,
                        rules: [
                          { required: true, message: formatMessage({ id: 'common.address.notNull' }) },   
                        ]
                      })(<Address/>)}
                    </FormItem>
                  </Col>
                </Row>

                <Row>
                  <Col span={21} style={{ textAlign: 'right' }}>
                    <Button style={{ marginRight: 10 }} onClick={() => switchBasicFormView(false)}>
                      {formatMessage({ id: 'company.detail.button.cancel' })}
                    </Button>
                    <Button loading={updateBasicInfoLoading} type="primary" htmlType="submit">
                      {formatMessage({ id: 'company.detail.button.confirm' })}
                    </Button>
                  </Col>
                </Row>
              </form>
            </div>
            
            <div className={styles.basicInfoView} style={{ display: !showBasicInfoForm ? 'block' : 'none' }}>
              <Row>
                <Col className={styles.leftSpan} span={2}>{formatMessage({ id: 'company.detail.basic.administratorPhone' })}</Col>
                <Col span={10}>{entity.adminPhone}</Col>
                <Col className={styles.leftSpan} span={2}>{formatMessage({ id: 'company.detail.basic.administratorName' })}</Col>
                <Col span={10}>{entity.adminName}</Col>
              </Row>
              <br/>
              <Row>
                <Col className={styles.leftSpan} span={2}>uuid</Col>
                <Col span={10}>{entity.uuid32}</Col>
                <Col className={styles.leftSpan} span={2}>{formatMessage({ id: 'common.address' })}</Col>
                <Col span={10}>{Object.keys(entity.address).length==0 ? '无':entity.address.country+entity.address.province
                  +entity.address.city+ (entity.address.district ? entity.address.district : '') +entity.address.street}</Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default CompanyDetailBasicInfo
