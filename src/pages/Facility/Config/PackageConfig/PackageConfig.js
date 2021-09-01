import React, { Component, Fragment } from 'react';
import {
  Form, Button, Input, message, Tabs, Select
} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { binViewPattern } from '@/utils/PatternContants';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import { commonLocale, notNullLocale, placeholderLocale,placeholderChooseLocale } from '@/utils/CommonLocale';
import { packageConfigLocale } from './PackageConfigLocale';
import styles from '@/pages/Facility/Config/Config.less';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import ContainerTypeSelect from '@/pages/Component/Select/ContainerTypeSelect';
import { billType } from './PackageConfigContants';
import BinSelect from '@/pages/Component/Select/BinSelect';
import { binUsage, getUsageCaption } from '@/utils/BinUsage';
import { binState, getStateCaption } from '@/utils/BinState';
import StoreSelect from '@/pages/Component/Select/StoreSelect';
import { STATE } from '@/utils/constants';
import { containerTypeLocale } from '../../ContainerType/ContainerTypeLocale';
const { TabPane } = Tabs;

@connect(({ packageConfig, loading }) => ({
  packageConfig,
  loading: loading.models.packageConfig,
}))
@Form.create()
export default class PackageConfig extends Component {
  state = {
    submitting: false,
    entity: {},
    keyLog: 0
  }

  componentDidMount = () => {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
  }
  refresh = () => {
    this.props.dispatch({
      type: 'packageConfig/get',
      payload: {
        dcUuid: loginOrg().uuid
      },
      callback: response => {
        if (response && response.success) {
          this.setState({
            entity: response.data ? response.data : null
          })
        }
      }
    });
  };

  handlechangeWrh = (value) => {
    const { entity } = this.state;
    if(entity) {
      entity.wrh = JSON.parse(value);
    }
    this.setState({
      entity: entity
    })
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
      });
      let type = '';
      let values = null;
      if( entity && entity.uuid ) {
        type = 'packageConfig/modify';
        values = {
          dimension: fieldsValue.dimension,
          wrh: JSON.parse(fieldsValue.wrh),
          store: JSON.parse(fieldsValue.store),
          collectBinCode: JSON.parse(fieldsValue.collectBinCode).code,
          containerType: JSON.parse(fieldsValue.containerType),
          mixedLoadCollectBin: fieldsValue.mixedLoadCollectBin,
          mixedLoadReceiveContainer: fieldsValue.mixedLoadReceiveContainer,
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid,
          uuid: entity.uuid
        };
      }  else {
        type = 'packageConfig/save';
        values = {
          dimension: fieldsValue.dimension,
          wrh: JSON.parse(fieldsValue.wrh),
          store: JSON.parse(fieldsValue.store),
          mixedLoadCollectBin: fieldsValue.mixedLoadCollectBin,
          mixedLoadReceiveContainer: fieldsValue.mixedLoadReceiveContainer,
          collectBinCode: JSON.parse(fieldsValue.collectBinCode).code,
          containerType: JSON.parse(fieldsValue.containerType),
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        };
      }
      this.props.dispatch({
        type: type,
        payload: values,
        callback: response => {
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
    const {
      entity
    } = this.state;

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
    const dimensionOptions = [];
    Object.keys(billType).forEach(function (key) {
      dimensionOptions.push(<Option value={billType[key].name} key={billType[key].name}>{billType[key].caption}</Option>);
    });
    return (
      <div>
        <div className={styles.topWrapper}>
          <span className={styles.title}>{packageConfigLocale.title}</span>
        </div>
        <Tabs defaultActiveKey="1" onChange={this.handleChangeTab}>
          <TabPane tab={commonLocale.congfigLocale} key="1">
            <div>
              <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <Form.Item
                  label={packageConfigLocale.wrh}
                >
                  {getFieldDecorator('wrh', {
                    initialValue: entity && entity.wrh ? JSON.stringify(entity.wrh) : undefined,
                    rules: [
                      { required: true, message: notNullLocale(packageConfigLocale.wrh) }
                    ],
                  })(
                    <WrhSelect
                      onChange={this.handlechangeWrh}
                      placeholder={placeholderLocale(commonLocale.inWrhLocale)} />
                  )}
                </Form.Item>
                <Form.Item
                  label={packageConfigLocale.dimension}
                >
                  {getFieldDecorator('dimension', {
                    initialValue: entity && entity.dimension ? entity.dimension : '',
                    rules: [
                      { required: true, message: notNullLocale(packageConfigLocale.dimension) }
                    ],
                  })(
                    <Select placeholder={packageConfigLocale.dimension}>
                      {dimensionOptions}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item
                  label={packageConfigLocale.containerType}
                >
                  {getFieldDecorator('containerType', {
                    initialValue: entity && entity.containerType ? JSON.stringify(entity.containerType) : undefined,
                    rules: [
                      { required: true, message: notNullLocale(packageConfigLocale.containerType) }
                    ],
                  })(
                    <ContainerTypeSelect single={true} />
                  )}
                </Form.Item>
                <Form.Item
                  label={packageConfigLocale.collectBinCode}
                >
                  {getFieldDecorator('collectBinCode', {
                    initialValue: entity && entity.collectBinCode ? JSON.stringify({
                      code: entity.collectBinCode,
                      usage: binUsage.CollectBin.name
                    }) : undefined,
                    rules: [
                      { required: true, message: notNullLocale(packageConfigLocale.collectBinCode) }
                    ],
                  })(
                    <BinSelect
                      placeholder={placeholderChooseLocale(packageConfigLocale.collectBinCode)}
                      states = {[binState.FREE.name]}
                      usages={[binUsage.CollectBin.name]}
                      disabled={false}
                      multiple={false}
                      getUsage
                      wrhUuid={entity && entity.wrh && entity.wrh.uuid ? entity.wrh.uuid : undefined}
                    />
                  )}
                </Form.Item>
                <Form.Item
                  label={'门店'}
                >
                  {getFieldDecorator('store', {
                    initialValue: entity && entity.store && entity.store.uuid ? JSON.stringify(entity.store) : undefined,
                    rules: [
                      { required: true, message: notNullLocale('门店') }
                    ],
                  })(
                    <StoreSelect
                      state={STATE.ONLINE}
                      placeholder={placeholderLocale(commonLocale.inStoreLocale + commonLocale.codeLocale)}
                      single
                    />
                  )}
                </Form.Item>
                <Form.Item
                  label={'集货位混载'}
                >
                  {getFieldDecorator('mixedLoadCollectBin', {
                    initialValue: entity && entity.mixedLoadCollectBin ? entity.mixedLoadCollectBin : false,
                    rules: [
                      { required: true, message: notNullLocale('是否允许混载') }
                    ],
                  })(
                    <Select placeholder={placeholderChooseLocale('是否允许混载')}>
                      <Option value={true}>是</Option>
                      <Option value={false}>否</Option>
                    </Select>
                  )}
                </Form.Item>

                <Form.Item
                  label={'收货容器混载'}
                >
                  {getFieldDecorator('mixedLoadReceiveContainer', {
                    initialValue: entity && entity.mixedLoadReceiveContainer ? entity.mixedLoadReceiveContainer : false,
                    rules: [
                      { required: true, message: notNullLocale('是否允许混载') }
                    ],
                  })(
                    <Select placeholder={placeholderChooseLocale('是否允许混载')}>
                      <Option value={true}>是</Option>
                      <Option value={false}>否</Option>
                    </Select>
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
            <EntityLogTab entityUuid={`${loginOrg().uuid}PackageConfig`} key={this.state.keyLog} />
          </TabPane>
        </Tabs>
      </div>
    )
  }
}
