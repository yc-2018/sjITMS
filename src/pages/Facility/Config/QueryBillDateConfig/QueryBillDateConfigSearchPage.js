import {
  Form, Button, message, Tabs
} from 'antd';
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import PreTypeSelect from './PreTypeSelect';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { binViewPattern } from '@/utils/PatternContants';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import { commonLocale, notNullLocale } from '@/utils/CommonLocale';
import styles from '@/pages/Facility/Config/Config.less';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import { PRETYPE } from '@/utils/constants';
const { TabPane } = Tabs;
@connect(({ queryBillDateConfig, loading }) => ({
  queryBillDateConfig,
  loading: loading.models.queryBillDateConfig,
}))
@Form.create()
export default class QueryBillDateConfigSearchPage extends Component{
  state = {
    title: '查询单据日期配置',
    submitting: false,
    entity: {},
    keyLog: 0
  }

  componentDidMount = () => {
    this.props.dispatch({
      type: 'queryBillDateConfig/getByCompanyUuidAndDcUuid',
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.queryBillDateConfig.data.entity) {
      this.setState({
        entity: nextProps.queryBillDateConfig.data.entity
      })
    }
  }

  onShowUnloadAdviceView = () => {
    this.props.dispatch({
      type: 'queryBillDateConfig/showPage',
      payload: {
        showPage: 'dateLimit'
      }
    });
  }

  drawActionButton = () => {
    return (
      <Fragment>
        <div>
          <Button onClick={this.onShowUnloadAdviceView}>
            {'管理查询天数范围'}
          </Button>
        </div>
      </Fragment>
    );
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
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
      };

      this.props.dispatch({
        type: 'queryBillDateConfig/save',
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
      loading,
    } = this.props;
    const { entity } = this.state;

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
          <span className={styles.title}>{'查询单据日期配置'}</span>
          <div className={styles.action}>
            {this.drawActionButton && this.drawActionButton()}
          </div>
        </div>
        <Tabs defaultActiveKey="1" onChange={this.handleChangeTab}>
          <TabPane tab={commonLocale.congfigLocale} key="1">
            <div>
              <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <Form.Item
                  label={"默认查询天数"}
                >
                  {getFieldDecorator('days', {
                    initialValue: entity.days ? entity.days : 0,
                    rules: [{ required: true, message: notNullLocale("默认查询天数") },]
                  })(

                    <PreTypeSelect
                      preType={PRETYPE.dateLimit}
                      orgUuid={loginOrg().uuid}
                    />
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
            <EntityLogTab entityUuid={`${loginOrg().uuid}BillFilterDaysConfig`} key={this.state.keyLog} />
          </TabPane>
        </Tabs>
      </div>
    )
  }
}
