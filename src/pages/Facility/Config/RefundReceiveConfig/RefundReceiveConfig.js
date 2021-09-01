import React, { Component } from 'react';
import { Form, Button, Input, message, Select, InputNumber, Tabs } from 'antd';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, notNullLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { receiveTypeContants } from './VerifyTypeContants';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import styles from '@/pages/Facility/Config/Config.less';
import { receiveViewLocale } from './RefundReceiveConfigLocal';
import { formatMessage } from 'umi/locale';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
const { TabPane } = Tabs;
const refundReceiveTypeOption = [];
Object.keys(receiveTypeContants).forEach(function (key) {
  refundReceiveTypeOption.push(<Select.Option value={receiveTypeContants[key].name} key={receiveTypeContants[key].name}>{receiveTypeContants[key].caption}</Select.Option>);
});
@connect(({ refundReceiveConfig }) => ({
  refundReceiveConfig
}))
@Form.create()
export default class RefundReceiveConfig extends Component {
  state = {
    submitting: false,
    entity: {
      verifyType: receiveTypeContants.ALLOW.name
    },
    keyLog: 0
  }
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.refundReceiveConfig.data) {
      this.setState({
        entity: nextProps.refundReceiveConfig.data
      });
    }
  }

  refresh() {
    this.props.dispatch({
      type: 'refundReceiveConfig/get'
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, fieldsValue) => {
      if (err) { return; }
      this.setState({
        submitting: true,
      })
      let data = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        verifyType: fieldsValue.verifyType
      }
      this.props.dispatch({
        type: 'refundReceiveConfig/saveOrUpdate',
        payload: data,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
            this.refresh();
          }
          this.setState({
            submitting: false,
          })
        }
      })
    });
  }
  /**
   * 切换tab页
   */
  handleChangeTab = (key) => {
    if (key == "2") {
      this.setState({
        keyLog: this.state.keyLog + 1
      })
    }
  }
  render() {
    const { entity, submitting } = this.state;

    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
    };
    return (
      <div>
        <div className={styles.topWrapper}>
          <span className={styles.title}>{configLocale.innerConfig.receiveConfig.name}</span>
        </div>
        <Tabs defaultActiveKey='1' onChange={this.handleChangeTab}>
          <TabPane tab={commonLocale.congfigLocale} key='1'>
            <div>
              <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <Form.Item label={receiveViewLocale.refundReceived}>
                  {getFieldDecorator('verifyType', {
                    initialValue: entity.verifyType,
                    rules: [{ required: true, message: notNullLocale(receiveViewLocale.refundReceived) }],
                  })(
                    <Select placeholder={placeholderChooseLocale(receiveViewLocale.refundReceived)} autoFocus>
                      {refundReceiveTypeOption}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item
                  wrapperCol={{
                    xs: { span: 24, offset: 0 },
                    sm: { span: 16, offset: 4 },
                  }}
                >
                  <Button loading={submitting} type="primary" htmlType="submit">{commonLocale.saveLocale}</Button>
                </Form.Item>
              </Form>
            </div>
          </TabPane>
          <TabPane tab={formatMessage({ id: 'company.detail.tab.operateInfo' })} key='2'>
            <EntityLogTab entityUuid={`${loginOrg().uuid}ReceiveVerifyConfig`} key={this.state.keyLog} />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
