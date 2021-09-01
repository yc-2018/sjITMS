import React, { Component, Fragment } from 'react';
import {
  Form, Button, Input, message, Tabs, InputNumber
} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { binViewPattern } from '@/utils/PatternContants';
import { configLocale } from '../ConfigLocale';
import { commonLocale, notNullLocale } from '@/utils/CommonLocale';
import { timeIntervalConfigLocale } from './TimeIntervalConfigLocale';
import styles from '@/pages/Facility/Config/Config.less';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
const { TabPane } = Tabs;
@connect(({ timeIntervalConfig, loading }) => ({
  timeIntervalConfig,
  loading: loading.models.timeIntervalConfig,
}))
@Form.create()
export default class TimeIntervalConfig extends Component {
  state = {
    submitting: false,
    entity: {},
    keyLog: 0
  }

  componentDidMount = () => {
    this.props.dispatch({
      type: 'timeIntervalConfig/getByCompanyUuid',
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.timeIntervalConfig.data.entity) {
      this.setState({
        entity: nextProps.timeIntervalConfig.data.entity
      })
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { entity } = this.state;

    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      this.setState({
        submitting: true,
      })
      const values = {
        ...fieldsValue,
      };

      this.props.dispatch({
        type: 'timeIntervalConfig/save',
        payload: values,
        callback: response => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
            this.componentDidMount();
          } else {
            message.error(response.message);
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
    const {
      timeIntervalConfig: { data },
      loading,
    } = this.props;

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
          <span className={styles.title}>{configLocale.timeIntervalConfig.timeIntervalConfig.name}</span>
        </div>
        <Tabs defaultActiveKey="1" onChange={this.handleChangeTab}>
          <TabPane tab={commonLocale.congfigLocale} key="1">
            <div>
              <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <Form.Item
                  label={timeIntervalConfigLocale.timeInterval}
                >
                  {getFieldDecorator('timeInterval', {
                    initialValue: data.entity ? data.entity.timeInterval : '',
                    rules: [
                      { required: true, message: notNullLocale(timeIntervalConfigLocale.timeInterval) },
                    ],
                  })(
                    <InputNumber style={{width:'100%'}} min ={0} precision={0} placeholder={timeIntervalConfigLocale.rfbinviewBinFormatAdd} autoFocus/>
                  )}
                </Form.Item>

                <Form.Item
                  wrapperCol={{
                    xs: { span: 24, offset: 0 },
                    sm: { span: 16, offset: 4 },
                  }}
                >
                  <Button loading={this.state.submitting} type="primary" htmlType="submit">{commonLocale.saveLocale}</Button>
                </Form.Item>
              </Form>
            </div>
          </TabPane>
          {/* <TabPane tab={formatMessage({ id: 'company.detail.tab.operateInfo' })} key="2">
            <EntityLogTab entityUuid={`${loginOrg().uuid}RfBinViewConfig`} key={this.state.keyLog} />
          </TabPane> */}
        </Tabs>
      </div>
    )
  }
}