import React, { Component } from 'react';
import { Form, Button, Input, message, Select, InputNumber, Tabs } from 'antd';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, notNullLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { StockAllocateType } from '@/pages/Out/Wave/WaveBillContants';
import StockAllocateSchemeSelect from '@/pages/Component/Select/StockAllocateSchemeSelect';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import styles from '@/pages/Facility/Config/Config.less';
import { stockOutConfigLocale } from './StockOutConfigLocale';
import { formatMessage } from 'umi/locale';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
const { TabPane } = Tabs;
const stockAllocateTypeOption = [];
Object.keys(StockAllocateType).forEach(function (key) {
  stockAllocateTypeOption.push(<Select.Option value={StockAllocateType[key].name} key={StockAllocateType[key].name}>{StockAllocateType[key].caption}</Select.Option>);
});
@connect(({ stockOutConfig }) => ({
  stockOutConfig
}))
@Form.create()
export default class StockOutConfig extends Component {
  state = {
    submitting: false,
    entity: {
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      stockAllocateType: StockAllocateType.INTURN.name
    },
    keyLog: 0
  }
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.stockOutConfig.data.companyUuid) {
      this.setState({
        entity: nextProps.stockOutConfig.data
      });
    }
  }

  refresh() {
    this.props.dispatch({
      type: 'stockOutConfig/getByDcUuid',
      payload: {
        dcUuid: loginOrg().uuid,
      }
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
        ...this.state.entity,
        stockAllocateType: fieldsValue.stockAllocateType,
        stockAllocateScheme: fieldsValue.stockAllocateScheme
      }
      if (data.stockAllocateScheme) {
        data.stockAllocateScheme = JSON.parse(data.stockAllocateScheme);
      }
      this.props.dispatch({
        type: 'stockOutConfig/saveOrUpdate',
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
          <span className={styles.title}>{configLocale.innerConfig.stockoutconfig.name}</span>
        </div>
        <Tabs defaultActiveKey='1' onChange={this.handleChangeTab}>
          <TabPane tab={commonLocale.congfigLocale} key='1'>
            <div>
              <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <Form.Item label={stockOutConfigLocale.stockAllocateType}>
                  {getFieldDecorator('stockAllocateType', {
                    initialValue: entity.stockAllocateType,
                    rules: [{ required: true, message: notNullLocale(stockOutConfigLocale.stockAllocateType) }],
                  })(
                    <Select placeholder={placeholderChooseLocale(stockOutConfigLocale.stockAllocateType)} autoFocus>
                      {stockAllocateTypeOption}
                    </Select>
                  )}
                </Form.Item>
                {this.props.form.getFieldValue('stockAllocateType') !== StockAllocateType.AVG.name &&
                  <Form.Item label={stockOutConfigLocale.stockAllocateScheme}>
                    {getFieldDecorator('stockAllocateScheme', {
                      initialValue: entity.stockAllocateScheme && entity.stockAllocateScheme.uuid ? JSON.stringify(entity.stockAllocateScheme) : undefined,
                      rules: [{ required: true, message: notNullLocale(stockOutConfigLocale.stockAllocateScheme) }],
                    })
                      (
                        <StockAllocateSchemeSelect placeholder={placeholderChooseLocale(stockOutConfigLocale.stockAllocateScheme)} />
                      )
                    }
                  </Form.Item>
                }
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
            <EntityLogTab entityUuid={`${loginOrg().uuid}StockOutConfig`} key={this.state.keyLog} />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
