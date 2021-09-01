import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { message, Tabs, Checkbox, Spin } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import Page from '@/pages/Component/Page/inner/Page';
import { configLocale } from '@/pages/Account/Config/ConfigLocale';
import { loginCompany } from '@/utils/LoginContext';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import { commonLocale } from '@/utils/CommonLocale';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import { OrgType } from './NoticeConfigConstants';
import configStyles from '@/pages/Facility/Config/Config.less';
import noticeStyles from './NoticeConfig.less';
const TabPane = Tabs.TabPane;

@connect(({ noticeConfig, loading }) => ({
  noticeConfig,
  loading: loading.models.noticeConfig,
}))
export default class NoticeConfig extends Component {
  state = {
    data: [],
    keyLog: 0
  };

  componentDidMount() {
    const { currentCompany } = this.state;
    this.refresh();
  }

  refresh = () => {
    this.props.dispatch({
      type: 'noticeConfig/query',
      payload: {
        companyUuid: loginCompany().uuid
      }
    });
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.noticeConfig.data
    });
  }

  /**
   * 保存
   */
  save = data => {
    this.props.dispatch({
      type: 'noticeConfig/insert',
      payload: data,
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.modifySuccessLocale);
          this.refresh();
        }
      },
    });
  }

  /** 判断是否被选中*/
  refreshPermChecked = (key) => {
    let { data } = this.state;
    let info = data.find(function (obj) {
      return obj.orgType == key;
    })
    if (info) {
      return info.state;
    }
    return false;
  }

  /** 被选中或者取消时触发*/
  onChange = (key, e) => {
    let data = this.state;
    let newData = [];
    let that = this;
    Object.keys(OrgType).forEach(function (constantKey) {
      let state = OrgType[constantKey].disabled || (e.target.checked && key == constantKey) ||
        (that.refreshPermChecked(constantKey) == true && key != constantKey) ? true : false;
      newData.push({
        companyUuid: loginCompany().uuid,
        orgType: constantKey,
        state: state
      })
    });

    this.save(newData);
  }

  getOptions = () => {
    let options = [];
    let onChange = this.onChange;
    let that = this;
    let refreshPermChecked = this.refreshPermChecked;
    Object.keys(OrgType).forEach(function (key) {
      options.push(
        <div>
          <Checkbox
            onChange={that.onChange.bind(that, key)}
            key={key}
            disabled={OrgType[key].disabled}
            checked={OrgType[key].disabled ? true : refreshPermChecked(key)}
          >
            {OrgType[key].caption}
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
    const { loading } = this.props;
    return (
      <div>
        <div className={configStyles.topWrapper}>
          <span className={configStyles.title}>{configLocale.sccConfig.noticeConfig.name}</span>
        </div>
        <Tabs defaultActiveKey="1" onChange={this.handleChangeTab}>
          <TabPane tab={commonLocale.congfigLocale} key="1">
            <Spin indicator={LoadingIcon('default')} tip="处理中..." spinning={loading}>
              <div>
                <div className={noticeStyles.noticeConfig}>
                  {this.getOptions()}
                </div>
              </div>
            </Spin>
          </TabPane>
          <TabPane tab={formatMessage({ id: 'company.detail.tab.operateInfo' })} key="2">
            <EntityLogTab entityUuid={`${loginCompany().uuid}NoticeConfig`} key={this.state.keyLog} />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
