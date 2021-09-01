import React, { Component, Fragment } from 'react';
import {
  Form, Button, Input, message, Tabs, InputNumber
} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { billPattern } from '@/utils/PatternContants';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import { commonLocale, notNullLocale } from '@/utils/CommonLocale';
import { billDailyLocal } from './BillConfigLocal';
import styles from '@/pages/Facility/Config/Config.less';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
const TabPane = Tabs.TabPane;
@connect(({ billConfig, loading }) => ({
  billConfig,
  loading: loading.models.billConfig,
}))
@Form.create()
export default class BillConfig extends Component {
  state = {
    submitting: false,
    entity: {},
    tabOneKey:1,
    form: {
      line: '',
      uuid: ''
    },
  }

  componentDidMount = () => {
    this.props.dispatch({
      type: 'billConfig/get',
      callback: response => {
        if (response && response.success) {
          // message.success(commonLocale.saveSuccessLocale);
          // 在这里可以取得到line
          this.setState({
            form: {
              line: response.data.line,
              uuid: response.data.uuid
            }
          })
        } else {
          message.error(response.message);
        }
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.billConfig.data) {
      this.setState({
        entity: nextProps.billConfig.entity
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
        uuid: this.state.form.uuid ? this.state.form.uuid : ''
      };

      this.props.dispatch({
        type: 'billConfig/modify',
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
        tabOneKey: this.state.tabOneKey + 1
      })
    }
  }
  render() {
    const {
      billConfig: { data },
      loading,
    } = this.props;

    const { getFieldDecorator } = this.props.form;
    const { tabOneKey } = this.state;
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
          <span className={styles.title}>{billDailyLocal.billConfigFormat}</span>
        </div>
        <Tabs defaultActiveKey="1" onChange={this.handleChangeTab}>
          <TabPane tab={commonLocale.congfigLocale} key="1">
            <div>
              <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <Form.Item
                  label={billDailyLocal.billFormat}
                >
                  {getFieldDecorator('line', {
                    initialValue: this.state.form.line,
                    rules: [
                      { required: true, message: notNullLocale(billDailyLocal.billFormat) },
                      {
                        pattern: billPattern.pattern,
                        message: billPattern.message,
                      }
                    ],
                  })(
                    <InputNumber />
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
          <TabPane tab={formatMessage({ id: 'company.detail.tab.operateInfo' })} key="2">
            <EntityLogTab entityUuid={`BillConfig`} key={tabOneKey} />
          </TabPane>
        </Tabs>
      </div>
    )
  }
}
