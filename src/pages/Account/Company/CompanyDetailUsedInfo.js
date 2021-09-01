import React, { PureComponent } from 'react';
import {
  Form,
  Row,
  Col,
  Icon,
  Progress,
  DatePicker,
  InputNumber,
  Button,
} from 'antd';
import { formatMessage } from 'umi/locale';
import moment from 'moment';
import styles from './company.less';
import PropTypes from "prop-types";
import { COMPANY_EDIT_TYPE } from "@/utils/constants";
import { formatDate } from '@/utils/utils';

const progressColor = {
  more: '#FF7F5B',
  less: '#3B77E3',
}

const FormItem = Form.Item;

@Form.create()
class CompanyDetailUsedInfo extends PureComponent {

  static propTypes = {
    showUsedInfoForm: PropTypes.bool,
    switchUsedFormView: PropTypes.func,
  }

  static defaultProps = {
    showUsedInfoForm: false,
  }

  calculateProgressColor = (used, total) => {
    if (used / total > 0.8) {
      return true;
    }

    return false;
  }

  handleUpdateUsedInfo = (e) => {
    e.preventDefault();
    const { form, entity, handleModify } = this.props;

    form.validateFields((errors, fieldsValue) => {
      if (errors) return;

      entity.validDate = formatDate(fieldsValue.validDate, true);
      entity.maxVendorUserCount = fieldsValue.maxVendorUserCount;
      entity.maxCarrierUserCount = fieldsValue.maxCarrierUserCount;
      entity.maxStoreUserCount = fieldsValue.maxStoreUserCount;
      entity.maxDcUserCount = fieldsValue.maxDcUserCount;
      entity.maxCompanyUserCount = fieldsValue.maxCompanyUserCount;
      entity.maxDcCount = fieldsValue.maxDcCount;
      entity.maxUserCount = fieldsValue.maxUserCount;
      entity.maxDispatchCenterCount=fieldsValue.maxDispatchCenterCount;
      
      handleModify(entity, COMPANY_EDIT_TYPE['used']);
    });
  }

  disabledDate = (current) => {
    // Can not select days before today and today
    return current && current < moment().endOf('day');
  }

  disabledDateTime = () => {
    return {
      disabledHours: () => range(0, 24).splice(4, 20),
      disabledMinutes: () => range(30, 60),
      disabledSeconds: () => [55, 56],
    };
  }

  render() {
    const {
      entity,
      form,
      showUsedInfoForm,
      switchUsedFormView,
      updateUsedInfoLoading,
    } = this.props;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 12 },
      colon: false,
    };

    const progressProps = {
      size: "small",
      status: "active",
      showInfo: false
    }

    const inputNumberProps = {
      min: 0,
    };

    return (
      <div className={styles.usedInfoWrapper}>
        <div className={styles.content}>
          <div className={styles.titleWrappr}>
            <div className={styles.navTitle}>
              <span>{formatMessage({ id: 'company.detail.used' })}</span>
            </div>
            <a className={styles.edit} onClick={() => switchUsedFormView(true)}
              style={{ visibility: !showUsedInfoForm ? 'visible' : 'hidden' }}>
              <Icon type="form" />
              <span>{formatMessage({ id: 'company.detail.label.edit' })}</span>
            </a>
          </div>

          <div className={styles.formWrapper}>
            <div className={styles.usedInfoForm} style={{ display: showUsedInfoForm ? 'block' : 'none' }}>
              <form onSubmit={this.handleUpdateUsedInfo}>
                <Row>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.validDate.name' })}>
                      {form.getFieldDecorator('validDate', {
                        rules: [{ required: true, message: formatMessage({ id: 'company.create.form.item.validDate.validate.message.notNull' }) }],
                        initialValue: entity.validDate ? moment(entity.validDate, 'YYYY-MM-DD') : null,
                      })(
                        <DatePicker
                          disabledDate={this.disabledDate}
                          disabledTime={this.disabledDateTime}
                          style={{ width: '100%' }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.maxUserCount.name' })}>
                      {form.getFieldDecorator('maxUserCount', {
                        rules: [{ required: true, message: formatMessage({ id: 'company.create.form.item.maxUserCount.validate.message.notNull' }) }],
                        initialValue: entity ? entity.maxUserCount : null,
                      })(
                        <InputNumber
                          style={{ width: '100%' }}
                          {...inputNumberProps}
                          placeholder={formatMessage({ id: 'company.create.form.item.placeholder.number' })} />
                      )}
                    </FormItem>
                  </Col>
                </Row>

                <Row>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.maxCompanyUserCount.name' })}>
                      {form.getFieldDecorator('maxCompanyUserCount', {
                        initialValue: entity ? entity.maxCompanyUserCount : null,
                      })(
                        <InputNumber
                          style={{ width: '100%' }}
                          {...inputNumberProps}
                          placeholder={formatMessage({ id: 'company.create.form.item.placeholder.number' })} />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.maxDcUserCount.name' })}>
                      {form.getFieldDecorator('maxDcUserCount', {
                        initialValue: entity ? entity.maxDcUserCount : null,
                      })(
                        <InputNumber
                          style={{ width: '100%' }}
                          {...inputNumberProps}
                          placeholder={formatMessage({ id: 'company.create.form.item.placeholder.number' })} />
                      )}
                    </FormItem>
                  </Col>
                </Row>

                <Row>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.maxStoreUserCount.name' })}>
                      {form.getFieldDecorator('maxStoreUserCount', {
                        initialValue: entity ? entity.maxStoreUserCount : null,
                      })(
                        <InputNumber
                          style={{ width: '100%' }}
                          {...inputNumberProps}
                          placeholder={formatMessage({ id: 'company.create.form.item.placeholder.number' })} />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.maxCarrierUserCount.name' })}>
                      {form.getFieldDecorator('maxCarrierUserCount', {
                        initialValue: entity ? entity.maxCarrierUserCount : null,
                      })(
                        <InputNumber
                          style={{ width: '100%' }}
                          {...inputNumberProps}
                          placeholder={formatMessage({ id: 'company.create.form.item.placeholder.number' })} />
                      )}
                    </FormItem>
                  </Col>
                </Row>

                <Row>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.maxVendorUserCount.name' })}>
                      {form.getFieldDecorator('maxVendorUserCount', {
                        initialValue: entity ? entity.maxVendorUserCount : null,
                      })(
                        <InputNumber
                          style={{ width: '100%' }}
                          {...inputNumberProps}
                          placeholder={formatMessage({ id: 'company.create.form.item.placeholder.number' })} />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.maxDcCount.name' })}>
                      {form.getFieldDecorator('maxDcCount', {
                        initialValue: entity ? entity.maxDcCount : null,
                      })(
                        <InputNumber
                          style={{ width: '100%' }}
                          {...inputNumberProps}
                          placeholder={formatMessage({ id: 'company.create.form.item.placeholder.number' })} />
                      )}
                    </FormItem>
                  </Col>
                </Row>

                <Row>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.maxDispatchCenterCount.name' })}>
                      {form.getFieldDecorator('maxDispatchCenterCount',{
                        initialValue:entity?entity.maxDispatchCenterCount:null,
                      })(
                        <InputNumber
                          style={{ width: '100%' }}
                          {...inputNumberProps}
                          placeholder={formatMessage({ id: 'company.create.form.item.placeholder.number' })} />
                      )}
                    </FormItem>
                  </Col>
                </Row>

                <Row>
                  <Col span={21} style={{ textAlign: 'right' }}>
                    <Button style={{ marginRight: 10 }} onClick={() => switchUsedFormView(false)}>
                      {formatMessage({ id: 'company.detail.button.cancel' })}
                    </Button>
                    <Button loading={updateUsedInfoLoading} type="primary" htmlType="submit">
                      {formatMessage({ id: 'company.detail.button.confirm' })}
                    </Button>
                  </Col>
                </Row>
              </form>
            </div>

            <div className={styles.usedInfoView} style={{ display: !showUsedInfoForm ? 'block' : 'none' }}>
              <Row>
                <Col className={styles.leftSpan} span={2}>{formatMessage({ id: 'company.detail.used.validDate' })}</Col>
                <Col span={10}>
                  {moment(entity.validDate).format('YYYY-MM-DD')}
                </Col>

                <Col className={styles.leftSpan} span={2}>{formatMessage({ id: 'company.detail.used.User' })}</Col>
                <Col span={10}>
                  <Progress
                    percent={(entity.usedUserCount / entity.maxUserCount) * 100}
                    {...progressProps}
                    style={{ width: '40%' }}
                    strokeColor={this.calculateProgressColor(entity.usedUserCount, entity.maxUserCount)
                      ? progressColor['more'] : progressColor['less']} />
                  <span className={styles.progressSpan}>{entity.usedUserCount}/{entity.maxUserCount}</span>
                </Col>
              </Row>
              <br />
              <Row>
                <Col className={styles.leftSpan} span={2}>{formatMessage({ id: 'company.detail.used.CompanyUser' })}</Col>
                <Col span={10}>
                  <Progress
                    percent={(entity.companyUsedUserCount / entity.maxCompanyUserCount) * 100}
                    {...progressProps}
                    style={{ width: '40%' }}
                    strokeColor={this.calculateProgressColor(entity.companyUsedUserCount, entity.maxCompanyUserCount)
                      ? progressColor['more'] : progressColor['less']} />
                  <span className={styles.progressSpan}>{entity.companyUsedUserCount}/{entity.maxCompanyUserCount}</span>
                </Col>

                <Col className={styles.leftSpan} span={2}>{formatMessage({ id: 'company.detail.used.DcUser' })}</Col>
                <Col span={10}>
                  <Progress
                    percent={(entity.dcUsedUserCount / entity.maxDcUserCount) * 100}
                    {...progressProps}
                    style={{ width: '40%' }}
                    strokeColor={this.calculateProgressColor(entity.dcUsedUserCount, entity.maxDcUserCount)
                      ? progressColor['more'] : progressColor['less']} />
                  <span className={styles.progressSpan}>{entity.dcUsedUserCount}/{entity.maxDcUserCount}</span>
                </Col>

              </Row>
              <br />

              <Row>
                <Col className={styles.leftSpan} span={2}>{formatMessage({ id: 'company.detail.used.StoreUser' })}</Col>
                <Col span={10}>
                  <Progress
                    percent={(entity.storeUsedUserCount / entity.maxStoreUserCount) * 100}
                    {...progressProps}
                    style={{ width: '40%' }}
                    strokeColor={this.calculateProgressColor(entity.storeUsedUserCount, entity.maxStoreUserCount)
                      ? progressColor['more'] : progressColor['less']} />
                  <span className={styles.progressSpan}>{entity.storeUsedUserCount}/{entity.maxStoreUserCount}</span>
                </Col>

                <Col className={styles.leftSpan} span={2}>{formatMessage({ id: 'company.detail.used.CarrierUser' })}</Col>
                <Col span={10}>
                  <Progress
                    percent={(entity.carrierUsedUserCount / entity.maxCarrierUserCount) * 100}
                    {...progressProps}
                    style={{ width: '40%' }}
                    strokeColor={this.calculateProgressColor(entity.carrierUsedUserCount, entity.maxCarrierUserCount)
                      ? progressColor['more'] : progressColor['less']} />
                  <span className={styles.progressSpan}>{entity.carrierUsedUserCount}/{entity.maxCarrierUserCount}</span>
                </Col>
              </Row>
              <br />

              <Row>
                <Col className={styles.leftSpan} span={2}>{formatMessage({ id: 'company.detail.used.VendorUser' })}</Col>
                <Col span={10}>
                  <Progress
                    percent={(entity.vendorUsedUserCount / entity.maxVendorUserCount) * 100}
                    {...progressProps}
                    style={{ width: '40%' }}
                    strokeColor={this.calculateProgressColor(entity.vendorUsedUserCount, entity.maxVendorUserCount)
                      ? progressColor['more'] : progressColor['less']} />
                  <span className={styles.progressSpan}>{entity.vendorUsedUserCount}/{entity.maxVendorUserCount}</span>
                </Col>

                <Col className={styles.leftSpan} span={2}>{formatMessage({ id: 'company.detail.used.DcCount' })}</Col>
                <Col span={10}>
                  <Progress
                    percent={(entity.usedDcCount / entity.maxDcCount) * 100}
                    {...progressProps}
                    style={{ width: '40%' }}
                    strokeColor={this.calculateProgressColor(entity.usedDcCount, entity.maxDcCount)
                      ? progressColor['more'] : progressColor['less']} />
                  <span className={styles.progressSpan}>{entity.usedDcCount}/{entity.maxDcCount}</span>
                </Col>
              </Row>
              <br />
              
              <Row>
              <Col className={styles.leftSpan} span={2}>{formatMessage({ id: 'company.detail.used.DispatchCenterCount' })}</Col>
                <Col span={10}>
                  <Progress
                    percent={(entity.usedDispatchCenterCount ) / (entity.maxDispatchCenterCount ) * 100}
                    {...progressProps}
                    style={{ width: '40%' }}
                    strokeColor={this.calculateProgressColor(entity.usedDispatchCenterCount, entity.maxDispatchCenterCount)
                      ? progressColor['more'] : progressColor['less']} />
                  <span className={styles.progressSpan}>{entity.usedDispatchCenterCount}/{entity.maxDispatchCenterCount}</span>
                </Col>
              </Row>

            </div>
          </div>
        </div>

      </div>
    );
  }
}

export default CompanyDetailUsedInfo
