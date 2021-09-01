import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Table, message, Switch, Tabs, Form, Button, Checkbox,  Spin, } from 'antd';
import DescriptionList from '@/components/DescriptionList';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import Page from '@/pages/Component/Page/inner/Page';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import moment from 'moment';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { binUsage } from './ValidStockBinUsage';
import styles from './ValidStockConfig.less';
import stylesConfig from '@/pages/Facility/Config/Config.less';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import { commonLocale } from '@/utils/CommonLocale';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
const { Description } = DescriptionList;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

@connect(({ validStockConfig, loading }) => ({
  validStockConfig,
  loading: loading.models.validStockConfig,
}))
@Form.create()
export default class CompanyDetail extends Component {
  state = {
    checkedBinUsage: ["StorageBin", "PickUpStorageBin", "PickUpBin"],
    keyLog: 0
  };

  componentDidMount() {
    const { currentCompany } = this.state;
    this.fetchBinUsagesByDCUuid();
  }

  /**
   * 获取该配送中心的货位用途
   */
  fetchBinUsagesByDCUuid = () => {
    const { dispatch } = this.props;
    const { checkedBinUsage } = this.state;

    let dcUuid = loginOrg().uuid;
    dispatch({
      type: 'validStockConfig/getBinUsagesByDCUuid',
      payload: dcUuid,
      callback: response => {
        if (response && response.success) {
          let data = response.data;
          if (Array.isArray(data) && data.length > 0) {
            data.map(item => {
              if (checkedBinUsage.indexOf(item) === -1) {
                checkedBinUsage.push(item);
              }
            });
            this.setState({
              checkedBinUsage: checkedBinUsage,
            });
          }
        }
      },
    });
  };

  /**
   * 保存
   */
  save = binUsages => {
    const { dispatch } = this.props;
    const { currentCompany } = this.state;
    const data = {
      binUsageList: binUsages,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
    };

    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'validStockConfig/save',
        payload: data,
        callback: response => {
          if (response && response.success) {
            message.success("修改可用库存成功");
            resolve({ success: true });
            return;
          } else {
            message.error("修改可用库存失败");
            resolve({ success: false });
            return;
          }
        },
      });
    })

  };

  /** 判断货位是否被选中*/
  refreshPermChecked = (key) => {
    let { checkedBinUsage } = this.state;

    if (!checkedBinUsage)
      return false;

    for (let i = 0; i < checkedBinUsage.length; i++) {
      if (checkedBinUsage[i] === key)
        return true;
    }
    return false;
  }

  /** 操作货位被选中或者取消时触发*/
  onChange = (key, e) => {
    let { checkedBinUsage } = this.state;

    if (key !== binUsage.UnifyReceiveStorageBin.name && key !== binUsage.PickTransitBin.name && key !== binUsage.EndProductProcessBin.name) {
      return;
    }

    if (e.target.checked) {
      if (checkedBinUsage.indexOf(key) === -1) {
        checkedBinUsage.push(key);
      }
    } else {
      let index = checkedBinUsage.indexOf(key);
      if (index > -1) {
        checkedBinUsage.splice(index, 1);
      }
    }

    this.save(checkedBinUsage)
      .then(res => {
        if (res.success) {
          this.setState({
            checkedBinUsage: checkedBinUsage
          });
        }
      })
      .catch(e => console.error(e));
  }

  getUsageOptions = () => {
    let options = [];
    let onChange = this.onChange;
    let that = this;
    let refreshPermChecked = this.refreshPermChecked;
    Object.keys(binUsage).forEach(function (key) {
      options.push(
        <div>
          <Checkbox
            onChange={that.onChange.bind(that, binUsage[key].name)}
            key={binUsage[key].name}
            disabled={binUsage[key].disableChecked}
            checked={binUsage[key].disableChecked ? true : refreshPermChecked(binUsage[key].name)}>
            {binUsage[key].caption}
          </Checkbox>
        </div>
      );
    });
    return options;
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
      validStockConfig: { data },
      loading,
      form,
    } = this.props;

    const {
      checkedBinUsage,
    } = this.state;

    return (
      <div>
        <div className={stylesConfig.topWrapper}>
          <span className={stylesConfig.title}>{configLocale.innerConfig.validStockConfig.name}</span>
        </div>
        <Tabs defaultActiveKey="1" onChange={this.handleChangeTab}>
          <TabPane tab={commonLocale.congfigLocale} key="1">
            <Spin indicator={LoadingIcon('default')} tip="处理中..." spinning={loading}>
              <div>
                <div className={styles.validStockConfig}>
                  {this.getUsageOptions()}
                </div>
              </div>
            </Spin>
          </TabPane>
          <TabPane tab={formatMessage({ id: 'company.detail.tab.operateInfo' })} key="2">
            <EntityLogTab entityUuid={`${loginOrg().uuid}ValidStockConfig`} key={this.state.keyLog} />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
