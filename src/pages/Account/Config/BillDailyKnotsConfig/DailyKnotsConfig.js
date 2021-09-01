import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Form, TimePicker, Button, Input, message, InputNumber, Tabs
} from 'antd';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import styles from '../Config.less';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import { commonLocale, placeholderLocale, placeholderChooseLocale, notNullLocale, } from '@/utils/CommonLocale';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import { formatMessage } from 'umi/locale';
import { bookConfigLocale } from './DailyKnotsConfigLocal';
import { billDailyLocal } from './BillConfigLocal';

const { TabPane } = Tabs;

const format = 'HH:mm';

@connect(({ dailyKnotConfig }) => ({
  dailyKnotConfig
}))
@Form.create()
export default class DailyKnotsConfig extends Component {
  state = {
    submitting: false,
    keyLog: 0,
    form: {
      time: '',
      uuid: ''
    }
  }

  componentDidMount = () => {
    this.props.dispatch({
      type: 'dailyKnotConfig/get',
      callback: response => {
        if (response && response.success) {
          this.setState({
            form: {
              time: response.data.time,
              uuid: response.data.uuid
            }
          })
        } else {
          message.error(response.message);
        }
      }
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { entity } = this.state;
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }

      let time1 = fieldsValue['time'];

      this.setState({
        submitting: true,
      })

      const values = {
        ...fieldsValue,
        time: time1.format('HH:mm'),
        uuid:this.state.form.uuid ? this.state.form.uuid : ''
      };

      this.props.dispatch({
        type: 'dailyKnotConfig/modify',
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
      dailyKnotConfig: { data },
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
          <span className={styles.title}>{billDailyLocal.dailyConfigFormat}</span>
        </div>
        <Tabs defaultActiveKey='1' onChange={this.handleChangeTab}>
          <TabPane tab={commonLocale.congfigLocale} key='1'>
            <div>
              <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <Form.Item label={billDailyLocal.dailyFormat} style={{ marginBottom: '0px' }}>
                  <Form.Item style={{ display: 'inline-block' }}>
                    {getFieldDecorator('time', {
                      initialValue: moment(this.state.form.time, format),
                      rules: [{ required: true, message: notNullLocale(bookConfigLocale.bookTimeStartTime) }],
                    })(
                      <TimePicker placeholder={placeholderChooseLocale(bookConfigLocale.bookTimeStartTime)} format={format} />
                    )}
                  </Form.Item>
                </Form.Item>
                <Form.Item
                  wrapperCol={{
                    xs: { span: 24, offset: 0 },
                    sm: { span: 16, offset: 4 },
                  }}
                >
                  <Button loading={this.state.submitting} type="primary" htmlType="submit">
                    {commonLocale.saveLocale}
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </TabPane>
          <TabPane tab={formatMessage({ id: 'company.detail.tab.operateInfo' })} key='2'>
            <EntityLogTab entityUuid={`DailyKnotConfig`} key={this.state.keyLog} />
          </TabPane>
        </Tabs>
      </div>
    )
  }
}
