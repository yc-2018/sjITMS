import React, { Component } from 'react';
import { Form, Button, Input, message, Select, InputNumber, Tabs } from 'antd';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, notNullLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { collectSchemeConfigLocale } from './CollectSchemeConfigLocale';
import CollectBinMgrSchemeSelect from '@/pages/Component/Select/CollectBinMgrSchemeSelect';
import styles from '@/pages/Facility/Config/Config.less';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
const TabPane = Tabs.TabPane;
@connect(({ collectSchemeConfig,loading }) => ({
  collectSchemeConfig,
  loading:loading.models.collectSchemeConfig,
}))
@Form.create()
export default class CollectSchemeConfig extends Component {
  state = {
    submitting: false,
    entity: {
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
    },
    tabOneKey:1
  }
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.collectSchemeConfig.data.companyUuid) {
      this.setState({
        entity: nextProps.collectSchemeConfig.data
      });
    }
  }

  refresh() {
    this.props.dispatch({
      type: 'collectSchemeConfig/getByDcUuid',
      payload: {
        dcUuid: loginOrg().uuid,
      }
    });
  }

  handleChangeTab =(key)=>{
    if(key == "2"){
      this.setState({
        tabOneKey:this.state.tabOneKey+1
      })
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, fieldsValue) => {
      if (err) { return; }
      this.setState({
        submitting: true,
      })
      let data = {
        ...this.state.entity,
        ...fieldsValue
      }
      if (data.unifyCollectBinScheme) {
        data.unifyCollectBinScheme = JSON.parse(data.unifyCollectBinScheme);
      }
      if (data.oneStepCollectBinScheme) {
        data.oneStepCollectBinScheme = JSON.parse(data.oneStepCollectBinScheme);
      } else if (data.oneStepCollectBinScheme === '') {
        data.oneStepCollectBinScheme = null;
      }
      if (data.twoStepCollectBinScheme) {
        data.twoStepCollectBinScheme = JSON.parse(data.twoStepCollectBinScheme);
      } else if (data.twoStepCollectBinScheme === '') {
        data.twoStepCollectBinScheme = null;
      }
      this.props.dispatch({
        type: 'collectSchemeConfig/saveOrModify',
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

  render() {
    const { entity, submitting } = this.state;
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
          <span className={styles.title}>{configLocale.outConfig.collectSchemeConfig.name}</span>
        </div>
        <div className={styles.content}>
          <Tabs defaultActiveKey="1" onChange={this.handleChangeTab}>
            <TabPane tab='配置信息' key="1">
              <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <Form.Item label={collectSchemeConfigLocale.unifyCollectBinScheme}>
                  {getFieldDecorator('unifyCollectBinScheme', {
                    initialValue: entity.unifyCollectBinScheme ? JSON.stringify(entity.unifyCollectBinScheme) : undefined,
                  })(
                    <CollectBinMgrSchemeSelect
                      placeholder={placeholderChooseLocale(collectSchemeConfigLocale.unifyCollectBinScheme)} autoFocus
                    />
                  )}
                </Form.Item>
                <Form.Item label={collectSchemeConfigLocale.oneStepCollectBinScheme}>
                  {getFieldDecorator('oneStepCollectBinScheme', {
                    initialValue: entity.oneStepCollectBinScheme ? JSON.stringify(entity.oneStepCollectBinScheme) : ''
                  })
                  (
                    <CollectBinMgrSchemeSelect
                      showUndefined
                      placeholder={placeholderChooseLocale(collectSchemeConfigLocale.oneStepCollectBinScheme)}
                      mgrTypeDisabled='CAREFUL'
                    />
                  )
                  }
                </Form.Item>
                <Form.Item label={collectSchemeConfigLocale.twoStepCollectBinScheme}>
                  {getFieldDecorator('twoStepCollectBinScheme', {
                    initialValue: entity.twoStepCollectBinScheme ? JSON.stringify(entity.twoStepCollectBinScheme) : ''
                  })
                  (
                    <CollectBinMgrSchemeSelect
                      showUndefined
                      placeholder={placeholderChooseLocale(collectSchemeConfigLocale.twoStepCollectBinScheme)}
                      mgrTypeDisabled='CAREFUL'
                    />
                  )
                  }
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

            </TabPane>
            <TabPane tab='操作日志' key="2" >
              <EntityLogTab entityUuid={`${loginOrg().uuid}CollectSchemeConfig`} key={tabOneKey}/>
            </TabPane>
          </Tabs>

        </div>
      </div>
    );
  }
}
