import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Form, TimePicker, Button, Input, message, InputNumber, Tabs
} from 'antd';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import styles from '@/pages/Facility/Config/Config.less';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import { commonLocale, placeholderLocale, placeholderChooseLocale, notNullLocale, } from '@/utils/CommonLocale';
import { bookConfigLocale } from './BookConfigLocale';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import { formatMessage } from 'umi/locale';
const { TabPane } = Tabs;

const format = 'HH:mm';

@connect(({ bookConfig }) => ({
  bookConfig
}))
@Form.create()
export default class BookTimeConfig extends Component {
  state = {
    submitting: false,
    keyLog: 0
  }

  componentDidMount = () => {
    this.props.dispatch({
      type: 'bookConfig/getByCompanyUuidAndDcUuid',
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const {
      bookConfig: { data },
      loading,
    } = this.props;
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }

      let startTime = fieldsValue['startTime'];
      let endTime = fieldsValue['endTime'];
      if (endTime.isBefore(startTime)) {
        return;
      }

      this.setState({
        submitting: true,
      })

      const values = {
        ...fieldsValue,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        startTime: startTime.format('HH:mm'),
        endTime: endTime.format('HH:mm'),
        version: data.version,
      };

      this.props.dispatch({
        type: 'bookConfig/saveOrUpdate',
        payload: values,
        callback: response => {
          if (response && response.success) {
            message.success(commonLocale.modifySuccessLocale);
            this.props.dispatch({
              type: 'bookConfig/getByCompanyUuidAndDcUuid',
            });
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
      bookConfig: { data },
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
          <span className={styles.title}>{configLocale.bookConfig.bookTimeConfig.name}</span>
        </div>
        <Tabs defaultActiveKey='1' onChange={this.handleChangeTab}>
          <TabPane tab={commonLocale.congfigLocale} key='1'>
            <div>
              <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <Form.Item
                  label={bookConfigLocale.bookTimePreDays}
                >
                  {getFieldDecorator('preDays', {
                    initialValue: data.preDays ? data.preDays : 0,
                    rules: [{ required: true, message: notNullLocale(bookConfigLocale.bookTimePreDays) },]
                  })(
                    <InputNumber min={0} style={{ width: 200 }} autoFocus/>
                  )}
                </Form.Item>
                <Form.Item label={bookConfigLocale.bookTimeTime} style={{ marginBottom: '0px' }}>
                  <Form.Item style={{ display: 'inline-block' }}>
                    {getFieldDecorator('startTime', {
                      initialValue: moment(data.startTime, format),
                      rules: [{ required: true, message: notNullLocale(bookConfigLocale.bookTimeStartTime) }],
                    })(
                      <TimePicker placeholder={placeholderChooseLocale(bookConfigLocale.bookTimeStartTime)} format={format} />
                    )}
                  </Form.Item>
                  &nbsp; &nbsp; - &nbsp; &nbsp;
                  <Form.Item style={{ display: 'inline-block' }}>
                    {getFieldDecorator('endTime', {
                      initialValue: moment(data.endTime, format),
                      rules: [{ required: true, message: notNullLocale(bookConfigLocale.bookTimeEndTime) }],
                    })(
                      <TimePicker placeholder={placeholderChooseLocale(bookConfigLocale.bookTimeEndTime)} format={format} />
                    )}
                  </Form.Item>
                </Form.Item>
                <Form.Item
                  label={bookConfigLocale.bookTimeTimeRange}
                >
                  {getFieldDecorator('timeRange', {
                    initialValue: data.timeRange,
                    rules: [{ required: true, message: notNullLocale(bookConfigLocale.bookTimeTimeRange) }],
                  })(
                    <InputNumber min={1} style={{ width: 200 }} />
                  )}
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
            <EntityLogTab entityUuid={`${loginOrg().uuid}BookConfig`} key={this.state.keyLog} />
          </TabPane>
        </Tabs>
      </div>
    )
  }
}
