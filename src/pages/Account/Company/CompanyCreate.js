import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import {
  Card,
  Button,
  message,
  Form,
  Input,
  Divider,
  Row,
  Col,
  DatePicker,
  InputNumber,
  Spin
} from 'antd';
import DescriptionList from '@/components/DescriptionList';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import ConfirmLeave from '@/pages/Component/Page/inner/ConfirmLeave';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import Page from '@/pages/Component/Page/inner/Page';
import Address from '@/pages/Component/Form/Address';
import AuthorizeCom from '@/pages/Component/Authorize/AuthorizeCom';
import moment from 'moment';
import styles from './company.less';
import { confirmLeaveFunc, formatDate } from '@/utils/utils';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';

const { Description } = DescriptionList;
const FormItem = Form.Item;

@connect(({ company, loading }) => ({
  company,
  loading: loading.models.company,
}))
@Form.create()
class CompanyCreate extends Component {
  state = {
    operatorInfo: [],
    currentCompany: {},
    confirmLeaveVisible: false,
    companyAuthorizeData: [],
    checkedKeys: [],
  };

  componentDidMount() {
    // 刷新/退出该页面时执行，但页面卸载时不会执行
    window.onbeforeunload = confirmLeaveFunc;
    this.fetchAuthorizeData();
  }

  componentWillUnmount() {
    window.onbeforeunload = undefined;
  }

  /**
   * 获取全部权限信息
   */
  fetchAuthorizeData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'resource/fetch',
      callback: response => {
        this.setState({
          companyAuthorizeData: response.data,
        });
      }
    });
  }

  /**
   * 新增企业
   *
   * @param {Object} value 输入的企业信息
   * @param {Boolean} isGoDetail 是否跳转到详细页面
   * @param {Boolean} isRefreshCreatePage 是否刷新新建企业页面
   * @param {Object} resources 权限的keys
   */
  handleCreate = (value, isGoDetail, isRefreshCreatePage) => {
    const { dispatch, onView, form, } = this.props;
    let type = 'company/saveAndAuthorize';

    if (value.address.country === undefined
      || value.address.province === undefined
      || value.address.city === undefined) {
      message.error(formatMessage({ id: 'common.addressSelected' }));
      return;
    }
    if (value.address.street === undefined) {
      message.error(formatMessage({ id: 'common.addressDetail.notNull' }));
      return;
    } else if (value.address.street.length > 100) {
      message.error(formatMessage({ id: 'common.addressDetail.limitLength' }));
      return;
    }

    if (!value.maxVendorUserCount) {
      value.maxVendorUserCount = value.maxUserCount;
    }
    if (!value.maxCarrierUserCount) {
      value.maxCarrierUserCount = value.maxUserCount;
    }
    if (!value.maxStoreUserCount) {
      value.maxStoreUserCount = value.maxUserCount;
    }
    if (!value.maxDcUserCount) {
      value.maxDcUserCount = value.maxUserCount;
    }
    if (!value.maxCompanyUserCount) {
      value.maxCompanyUserCount = value.maxUserCount;
    }


    dispatch({
      type: type,
      payload: value,
      callback: response => {
        if (response && response.success) {
          message.success(formatMessage({ id: 'company.message.success.create' }));
          this.setState({
            checkedKeys: [],
          });
          // 清空form
          form.resetFields();
          if (isGoDetail) {
            onView(response.data);
          }
        }
      },
    });
  }

  /**
   * 确认创建并跳到详细界面
   */
  handleCreateAndGoDetail = (e) => {
    e.preventDefault();
    const { checkedKeys } = this.state;

    const { form } = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      const data = {
        ...fieldsValue,
        resources:  checkedKeys,
      };
      data.validDate = formatDate(data.validDate);
      this.handleCreate(data, true, false);
    });
  }

  /**
   * 确认创建并刷新创建页面
   */
  handleConfirmAndCreate = (e) => {
    e.preventDefault();

    const { checkedKeys } = this.state;
    const { form, handleCreate } = this.props;

    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      const data = {
        ...fieldsValue,
        resources: checkedKeys,
      };
      data.validDate = formatDate(data.validDate);
      this.handleCreate(data, false, true);
    });
  }

  handleCancel = () => {
    this.setState({
      confirmLeaveVisible: true,
    })
  }

  handleMaxUserCountChange = (value) => {
    const { form } = this.props;

    form.setFieldsValue({
      maxVendorUserCount: value,
      maxCarrierUserCount: value,
      maxStoreUserCount: value,
      maxDcUserCount: value,
      maxCompanyUserCount: value
    });
  }

  /**
   * 离开确认 - 确认回调
   */
  handleLeaveConfirmOk = () => {
    this.props.onCancel();
  }

  /**
   * 离开确认 - 取消回调
   */
  handleLeaveConfirmCancel = () => {
    this.setState({
      confirmLeaveVisible: false,
    })
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

  onAuthorizeCheck = (checkedKeys) => {
    if (Array.isArray(checkedKeys)) {
      this.setState({
        checkedKeys: checkedKeys
      })
    }
  }

  render() {
    const {
      form,
    } = this.props;

    const {
      operatorInfo,
      confirmLeaveVisible,
      companyAuthorizeData,
      checkedKeys,
    } = this.state;

    const comfirmLeaveProps = {
      confirmLeaveVisible: confirmLeaveVisible,
      action: CONFIRM_LEAVE_ACTION['NEW'],
      handleLeaveConfirmOk: this.handleLeaveConfirmOk,
      handleLeaveConfirmCancel: this.handleLeaveConfirmCancel,
    }

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 12 },
      colon: false,
    };

    const inputNumberProps = {
      min: 0,
    };

    const actionBtn = (
      <Fragment>
        <Button onClick={this.handleCancel}>
          {formatMessage({ id: 'company.create.button.cancel' })}
        </Button>
        <Button type="primary" onClick={this.handleCreateAndGoDetail}>
          {formatMessage({ id: 'company.create.button.confirm' })}
        </Button>
        <Button type="primary" onClick={this.handleConfirmAndCreate}>
          {formatMessage({ id: 'company.create.button.confirmCreate' })}
        </Button>
      </Fragment>
    );

    return (
      <PageHeaderWrapper>
        <Spin indicator={LoadingIcon('default')} spinning={this.props.loading}>
          <Page>
            <NavigatorPanel title={formatMessage({ id: 'company.create.title' })} action={actionBtn} />
            <Card className={styles.companyEdit} bordered={false}>
              <Form>
                <div className={styles.editTitle}>
                  <span>{formatMessage({ id: 'company.create.basic' })}</span>
                </div>

                <Row>
                  <Col span={12} >
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.code.name' })}>
                      {form.getFieldDecorator('code', {
                        rules: [
                          { required: true, message: formatMessage({ id: 'company.create.form.item.code.validate.message.notNull' }) },
                          {
                            max: 4,
                            message: formatMessage({ id: 'company.create.form.item.code.validate.message.limitLength' }),
                          },
                          {
                            pattern: /^[0-9a-zA-Z]{4}$/,
                            message: formatMessage({ id: 'company.create.form.item.code.validate.message.integrality' }),
                          },
                        ]
                      })(<Input placeholder={formatMessage({ id: 'company.create.form.item.placeholder.code' })} autoFocus/>)}
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
                        ]
                      })(<Input placeholder={formatMessage({ id: 'company.create.form.item.placeholder.name' })} />)}
                    </FormItem>
                  </Col>
                </Row>

                <Row>
                  <Col span={12} >
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.adminPhone.name' })}>
                      {form.getFieldDecorator('adminPhone', {
                        rules: [
                          { required: true, message: formatMessage({ id: 'company.create.form.item.adminPhone.validate.message.notNull' }) },
                          { pattern: /^1(3|4|5|7|8)\d{9}$/, message: formatMessage({ id: 'company.create.form.item.adminPhone.validate.message.integrality' }) },
                        ]
                      })(<Input placeholder={formatMessage({ id: 'company.create.form.item.placeholder.adminPhone' })} />)}
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
                        ]
                      })(<Input placeholder={formatMessage({ id: 'company.create.form.item.placeholder.adminName' })} />)}
                    </FormItem>
                  </Col>
                </Row>

                <Row>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label={formatMessage({ id: 'common.address' })}
                    >
                      {form.getFieldDecorator('address', {
                        rules: [
                          { required: true, message: formatMessage({ id: 'common.address.notNull' }) },
                        ]
                      })(<Address />)}
                    </FormItem>
                  </Col>
                </Row>
                <div style={{ marginBottom: 32, minWidth: '0%' }}></div>
                <div className={styles.editTitle}>
                  <span>{formatMessage({ id: 'company.create.register' })}</span>
                </div>

                <Row>
                  <Col span={12} >
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.validDate.name' })}>
                      {form.getFieldDecorator('validDate', {
                        rules: [{
                          required: true,
                          message: formatMessage({ id: 'company.create.form.item.validDate.validate.message.notNull' })
                        }]
                      })(
                        <DatePicker
                          disabledDate={this.disabledDate}
                          disabledTime={this.disabledDateTime}
                          style={{ width: '100%' }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12} >
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.maxUserCount.name' })}>
                      {form.getFieldDecorator('maxUserCount', {
                        rules: [{
                          required: true,
                          message: formatMessage({ id: 'company.create.form.item.maxUserCount.validate.message.notNull' })
                        }],
                      })(<InputNumber
                        onChange={this.handleMaxUserCountChange}
                        style={{ width: '100%' }}
                        {...inputNumberProps}
                        placeholder={formatMessage({ id: 'company.create.form.item.placeholder.number' })} />
                      )}
                    </FormItem>
                  </Col>
                </Row>

                <Row>
                  <Col span={12} >
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.maxCompanyUserCount.name' })}>
                      {form.getFieldDecorator('maxCompanyUserCount')(
                        <InputNumber
                          style={{ width: '100%' }}
                          {...inputNumberProps}
                          placeholder={formatMessage({ id: 'company.create.form.item.placeholder.number' })} />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12} >
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.maxDcUserCount.name' })}>
                      {form.getFieldDecorator('maxDcUserCount')(
                        <InputNumber
                          style={{ width: '100%' }}
                          {...inputNumberProps}
                          placeholder={formatMessage({ id: 'company.create.form.item.placeholder.number' })} />
                      )}
                    </FormItem>
                  </Col>
                </Row>

                <Row>
                  <Col span={12} >
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.maxStoreUserCount.name' })}>
                      {form.getFieldDecorator('maxStoreUserCount')(
                        <InputNumber
                          style={{ width: '100%' }}
                          {...inputNumberProps}
                          placeholder={formatMessage({ id: 'company.create.form.item.placeholder.number' })} />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12} >
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.maxCarrierUserCount.name' })}>
                      {form.getFieldDecorator('maxCarrierUserCount')(
                        <InputNumber
                          style={{ width: '100%' }}
                          {...inputNumberProps}
                          placeholder={formatMessage({ id: 'company.create.form.item.placeholder.number' })} />
                      )}
                    </FormItem>
                  </Col>
                </Row>

                <Row>
                  <Col span={12} >
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.maxVendorUserCount.name' })}>
                      {form.getFieldDecorator('maxVendorUserCount')(
                        <InputNumber
                          style={{ width: '100%' }}
                          {...inputNumberProps}
                          placeholder={formatMessage({ id: 'company.create.form.item.placeholder.number' })} />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12} >
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.maxDcCount.name' })}>
                      {form.getFieldDecorator('maxDcCount')(
                        <InputNumber
                          style={{ width: '100%' }}
                          {...inputNumberProps}
                          placeholder={formatMessage({ id: 'company.create.form.item.placeholder.number' })} />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={12} >
                    <FormItem {...formItemLayout} label={formatMessage({ id: 'company.create.form.item.maxDispatchCenterCount.name' })}>
                      {form.getFieldDecorator('maxDispatchCenterCount')(
                        <InputNumber
                          style={{ width: '100%' }}
                          {...inputNumberProps}
                          placeholder={formatMessage({ id: 'company.create.form.item.placeholder.number' })} />
                      )}
                    </FormItem>
                  </Col>
                </Row>

                <div style={{ marginBottom: 32, minWidth: '0%' }}></div>
                <div className={styles.editTitle}>
                  <span>{formatMessage({ id: 'company.create.permission' })}</span>
                </div>

                <div>
                  <AuthorizeCom
                    data={companyAuthorizeData}
                    disabled={false}
                    checkedKeys={checkedKeys}
                    authorize={this.onAuthorizeCheck}
                    style={{height:300,marginBottom:10}}
                  />
                </div>
              </Form>
            </Card>

            <ConfirmLeave {...comfirmLeaveProps} />
          </Page>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default CompanyCreate
