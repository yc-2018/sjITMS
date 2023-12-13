import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Table, message, Switch, Tabs, Form, Button, Spin } from 'antd';
import DescriptionList from '@/components/DescriptionList';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import Page from '@/pages/Component/Page/inner/Page';
import CompanyDetailBasicInfo from './CompanyDetailBasicInfo';
import CompanyDetailUsedInfo from './CompanyDetailUsedInfo';
import ConfirmLeave from '@/pages/Component/Page/inner/ConfirmLeave';
import RouteConfirmLeave from '@/pages/Component/Page/inner/RouteConfirmLeave';
import moment from 'moment';
import styles from './company.less';
import { COMPANY_EDIT_TYPE, CONFIRM_LEAVE_ACTION, SERVICE_CAPTION } from '@/utils/constants';
import { confirmLeaveFunc, formatDate } from '@/utils/utils';
import PageDetail from '@/components/MyComponent/PageDetail';
import OperateInfoTable from '@/components/MyComponent/OperateInfoTable';
import AuthorizeCom from '@/pages/Component/Authorize/AuthorizeCom';
import ErpConfiguration from '../ErpConfig/ErpConfiguration';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';

const { Description } = DescriptionList;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

@connect(({ company, erp, loading }) => ({
  company,
  erp,
  loading: loading.models.company,
}))
@Form.create()
export default class CompanyDetail extends Component {
  state = {
    currentCompany: {},
    showBasicInfoForm: false,
    showUsedInfoForm: false,
    updateBasicInfoLoading: false,
    updateUsedInfoLoading: false,
    confirmLeaveVisible: false,
    companyAuthorizeData: [],
    checkedResources: [],
    erpData: [],
  };

  componentWillMount() {
    let company = this.props.company.data.company;
    if (company != null) {
      this.setState({
        currentCompany: company,
      });
    }
  }

  componentDidMount() {
    this.fetchAuthorizeData();
    this.fetchCompanyResourcesByUuid();
    this.fetchErpByCompanyUuid();
  }

  componentWillReceiveProps(newProps) {
    if (newProps.showEdit) {
      this.setState({
        showBasicInfoForm: true,
        showUsedInfoForm: true,
      });
    }
    if (newProps.company.data.company) {
      this.setState({
        currentCompany: newProps.company.data.company,
      });
    }
    // if (newProps.erp.data.erp) {
    //   this.setState({
    //     erpData: newProps.erp.data.erp
    //   });
    // }
  }

  switchBasicFormView = flag => {
    this.setState({
      showBasicInfoForm: !!flag,
    });
  };

  switchUsedFormView = flag => {
    if (!flag) {
      this.refreshView();
    }
    this.setState({
      showUsedInfoForm: !!flag,
    });
  };

  /**
   * 获取企业的权限
   */
  fetchCompanyResourcesByUuid = () => {
    const { dispatch } = this.props;
    let companyUuid = this.state.currentCompany.uuid;
    dispatch({
      type: 'company/getResourceKeys',
      payload: companyUuid,
      callback: response => {
        if (response && response.success) {
          this.setState({
            checkedResources: response.data,
          });
        }
      },
    });
  };
  /**
   * 获取ERP配置信息
   */
  fetchErpByCompanyUuid = () => {
    const { dispatch } = this.props;
    let companyUuid = this.state.currentCompany.uuid;
    dispatch({
      type: 'erp/get',
      payload: companyUuid,
      callback: response => {
        if (response && response.success) {
          this.setState({
            erpData: response.data,
          });
        }
      },
    });
  };

  /**
   * 授权处理
   */
  handleAuthorize = resources => {
    const { dispatch } = this.props;
    const { currentCompany } = this.state;
    const auth = {
      validDate: formatDate(currentCompany.validDate),
      resources: resources,
      uuid: currentCompany.uuid,
      version: currentCompany.version,
    };
    dispatch({
      type: 'company/authorize',
      payload: auth,
      callback: response => {
        if (response && response.success) {
          message.success(formatMessage({ id: 'common.message.success.authorize' }));
          this.setState({
            checkedResources: resources,
          });
          this.refreshView();
        }
      },
    });
  };

  /**
   * 获取全部权限信息
   */
  fetchAuthorizeData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'resource/fetch',
      callback: response => {
        this.setState({
          companyAuthorizeData: response.data,
        });
      },
    });
  };

  /**
   * 检测当前页面是否有内容正在更新
   */
  checkUpdatingContent = () => {
    const { showBasicInfoForm, showUsedInfoForm } = this.state;
    if (showBasicInfoForm || showUsedInfoForm) {
      return true;
    }

    return false;
  };

  handleUpdateBasicInfoLoading = flag => {
    this.setState({
      updateBasicInfoLoading: !!flag,
    });
  };

  handleUpdateUsedInfoLoading = flag => {
    this.setState({
      updateUsedInfoLoading: !!flag,
    });
  };

  /**
   * 启用或者禁用处理
   */
  handleEnableOrDisable = record => {
    const { dispatch } = this.props;

    // 禁用
    if (record.enable) {
      dispatch({
        type: 'company/disable',
        payload: record,
        callback: response => {
          if (response && response.success) {
            message.success(formatMessage({ id: 'company.message.success.disable' }));
            this.refreshView();
          } else {
            message.error(response.message);
          }
        },
      });
    } else {
      // 启用
      dispatch({
        type: 'company/enable',
        payload: record,
        callback: response => {
          if (response && response.success) {
            message.success(formatMessage({ id: 'company.message.success.enbale' }));
            this.refreshView();
          } else {
            message.error(response.message);
          }
        },
      });
    }
  };

  refreshView = () => {
    const { dispatch } = this.props;
    let { currentCompany } = this.state;
    this.setState({
      showBasicInfoForm: false,
      showUsedInfoForm: false,
    });
    dispatch({
      type: 'company/get',
      payload: currentCompany.uuid,
    });
  };

  /**
   * 更新企业信息
   *
   * @param {Object} value 输入的企业信息
   * @param {String} type 更新类型
   */
  handleModify = (value, type) => {
    const { dispatch, form } = this.props;

    if (type === COMPANY_EDIT_TYPE['basic']) {
      this.handleUpdateBasicInfoLoading(true);
    }

    if (type === COMPANY_EDIT_TYPE['used']) {
      this.handleUpdateUsedInfoLoading(true);
    }

    if (!value.maxVendorUserCount) {
      value.maxVendorUserCount = value.maxUserCount;
    }
    if (!value.maxCarrierUserCount) {
      value.maxCarrierUserCount = value.maxUserCount;
    }
    if (!value.maxStoreUserCount) {
      value.maxStoreUserCount = value.maxUserCount;
    }
    if (!value.maxDcUserCount) {
      value.maxDcUserCount = value.maxUserCount;
    }
    if (!value.maxCompanyUserCount) {
      value.maxCompanyUserCount = value.maxUserCount;
    }

    dispatch({
      type: 'company/modify',
      payload: value,
      callback: response => {
        if (response && response.success) {
          if (type === COMPANY_EDIT_TYPE['basic']) {
            message.success(formatMessage({ id: 'company.message.success.update' }));
          }
          if (type === COMPANY_EDIT_TYPE['used']) {
            message.success(formatMessage({ id: 'company.message.success.usedInfo' }));
          }
          this.refreshView();
        } else {
        }

        if (type === COMPANY_EDIT_TYPE['basic']) {
          this.handleUpdateBasicInfoLoading(false);
        }

        if (type === COMPANY_EDIT_TYPE['used']) {
          this.handleUpdateUsedInfoLoading(false);
        }
      },
    });
  };

  /**
   * 离开确认 - 确认回调
   */
  handleLeaveConfirmOk = () => {
    this.props.onCancel();
  };

  /**
   * 离开确认 - 取消回调
   */
  handleLeaveConfirmCancel = () => {
    this.setState({
      confirmLeaveVisible: false,
    });
  };

  /**
   * 取消处理
   */
  handleCancel = () => {
    if (this.checkUpdatingContent()) {
      this.setState({
        confirmLeaveVisible: true,
      });
    } else {
      this.props.onCancel();
    }
  };

  renderConfirmLeave = comfirmLeaveProps => {
    return (
      <div>
        <ConfirmLeave {...comfirmLeaveProps} />
        <RouteConfirmLeave />
      </div>
    );
  };

  render() {
    const {
      company: { data },
      loading,
      form,
    } = this.props;

    const {
      operatorData,
      showBasicInfoForm,
      showUsedInfoForm,
      updateBasicInfoLoading,
      updateUsedInfoLoading,
      confirmLeaveVisible,
      companyAuthorizeData,
      checkedResources,
      erpData,
    } = this.state;

    let entity = data.company;

    let title = '[' + entity.code + ']' + entity.name;

    const companyDetailBasicInfoProps = {
      entity: entity,
      showBasicInfoForm: showBasicInfoForm,
      switchBasicFormView: this.switchBasicFormView,
      handleModify: this.handleModify,
      updateBasicInfoLoading: updateBasicInfoLoading,
    };

    const companyDetailUsedInfoProps = {
      entity: entity,
      showUsedInfoForm: showUsedInfoForm,
      switchUsedFormView: this.switchUsedFormView,
      handleModify: this.handleModify,
      updateUsedInfoLoading: updateUsedInfoLoading,
    };

    const comfirmLeaveProps = {
      confirmLeaveVisible: confirmLeaveVisible,
      action: CONFIRM_LEAVE_ACTION['NEW'],
      handleLeaveConfirmOk: this.handleLeaveConfirmOk,
      handleLeaveConfirmCancel: this.handleLeaveConfirmCancel,
    };

    const actionBtn = (
      <Fragment>
        <Button onClick={this.handleCancel}>{formatMessage({ id: 'common.button.back' })}</Button>
      </Fragment>
    );

    const pageDetailProps = {
      title: title,
      enable: entity.enable,
      entity: entity,
      handleEnableOrDisable: this.handleEnableOrDisable,
      action: actionBtn,
    };

    return (
      <PageHeaderWrapper>
        <PageDetail {...pageDetailProps}>
          <div className={styles.detailContent}>
            <Tabs className={styles.tabsWrapper} defaultActiveKey="1">
              <TabPane tab={formatMessage({ id: 'company.detail.tab.comapnyInfo' })} key="1">
                <CompanyDetailBasicInfo {...companyDetailBasicInfoProps} />
                <CompanyDetailUsedInfo {...companyDetailUsedInfoProps} />
              </TabPane>
              <TabPane tab={formatMessage({ id: 'company.detail.tab.erpConfiguration' })} key="2">
                <Spin indicator={LoadingIcon('default')} tip="处理中..." spinning={loading}>
                  <ErpConfiguration data={this.state.erpData} dispatch={this.props.dispatch} />
                </Spin>
              </TabPane>
              <TabPane tab={formatMessage({ id: 'company.detail.tab.permissionInfo' })} key="3">
                <Spin indicator={LoadingIcon('default')} tip="处理中..." spinning={loading}>
                  <AuthorizeCom
                    data={companyAuthorizeData}
                    disabled={false}
                    checkedKeys={checkedResources}
                    authorize={this.handleAuthorize}
                  />
                </Spin>
              </TabPane>
              <TabPane tab={formatMessage({ id: 'company.detail.tab.operateInfo' })} key="4">
                <OperateInfoTable entity={entity} serviceCaption={SERVICE_CAPTION['company']} />
              </TabPane>
            </Tabs>
          </div>
        </PageDetail>

        {this.checkUpdatingContent() && this.renderConfirmLeave(comfirmLeaveProps)}
      </PageHeaderWrapper>
    );
  }
}
