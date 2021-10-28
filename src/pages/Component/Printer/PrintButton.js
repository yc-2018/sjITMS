import React, { PureComponent } from 'react';
import { Button, message, Menu, Dropdown, Icon } from 'antd';
import configs from '@/utils/config';
import qs from 'qs'
import { connect } from 'dva';
import { loginCompany, loginOrg, loginUser, loginIp } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import { formatMessage } from 'umi/locale';
import FRPrintScript from './FRPrintScript';
@connect(({ template }) => ({
  template
}))
export default class PrintButton extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      permission: props.permission ? props.permission : true,
      moduleId: props.moduleId ? props.moduleId : '',
      // reportlet:'',moduleId:'',
      reportParams: props.reportParams ? props.reportParams : [],
      isPopUp: false,
      //printType: 1, // 打印类型，0为零客户端打印，1为本地打印
      // 以下为零客户端打印的参数，仅当 printType 为 0 时生效
      ieQuietPrint: true,// IE静默打印设置 true为静默，false为不静默
      // 以下为本地打印的参数，仅当 printType 为 1 时生效
      //printerName: 'Microsoft Print to PDF', // 打印机名
      //pageType: 2, // 打印页码类型：0：所有页，1：当前页，2：指定页
      //pageIndex: '1-3', // 页码范围。当 pageType 为 2 时有效
      //copy: 3, // 打印份数
    }
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'template/queryByTypeAndOrgUuid',
      payload: {
        orgUuid: loginCompany().uuid,
        printType: this.props.moduleId,
        userUuid: loginUser().uuid
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.template.menuList && nextProps.template.menuList.length > 0 && nextProps.template.menuList[0].type === this.state.moduleId) {
      this.setState({
        templates: nextProps.template.menuList
      });
    }
  }
  buildReportParams = (item) => {
    let { reportParams } = this.props;
    if (reportParams) {
      reportParams = reportParams.sort(function (a, b) { return a.billNumber && a.billNumber.localeCompare(b.billNumber) });
    }
    let reportTempalteParams = [];
    let billNumbers = "";
    for (let j = 0, len = reportParams.length; j < len; j++) {
      billNumbers = billNumbers + reportParams[j].billNumber;
      if (j < len - 1) {
        billNumbers = billNumbers + "-";
      }
    }
    reportTempalteParams.push({
      reportlet: item,
      userUuid: loginUser().uuid,
      userCode: loginUser().code,
      userName: loginUser().name,
      dcUuid: loginOrg().uuid,
      dcCode: loginOrg().code,
      dcName: loginOrg().name,
      companyUuid: loginCompany().uuid,
      companyCode: loginCompany().code,
      companyName: loginCompany().name,
      ...loginIp(),
      billNumber: billNumbers
    })
    return reportTempalteParams;
  }
  onPrint = (item) => {
    const { isPopUp, printType, ieQuietPrint, printerName, pageType, pageIndex, copy } = this.state;
    let { reportParams } = this.props;
    if (reportParams) {
      reportParams = reportParams.sort(function (a, b) { return a.billNumber.localeCompare(b.billNumber) });
    }
    if (reportParams.length < 1) {
      message.warn(formatMessage({ id: 'iwms.print.tips' }));
      return;
    }
    let reportTempalteParams = this.buildReportParams(item);
    let frConfig = {
      printUrl: configs[API_ENV].RPORTER_SERVER,
      isPopUp: isPopUp,
      data: {
        reportlets: JSON.stringify(reportTempalteParams)
      },
      printType: configs[API_ENV].PRINT_TYPE,
      ieQuietPrint: ieQuietPrint,
      printerName: printerName,
      pageType: pageType,
      pageIndex: pageIndex,
      copy: copy,
    };
    FR.doURLPrint(frConfig);
  }
  buildTemplateMenu = () => {
    let options = [];
    let data = this.state.templates;
    Array.isArray(data) && data.forEach(function (dg) {
      options.push(
        //修改偏移量popupOffset={-1} 让用户更好选中 2021-10-21 by zz
        <Menu.SubMenu title={dg.name} key={dg.name} popupOffset={-1}>  
          <Menu.Item key={"IWMSPRINT" + dg.path}>
            <Icon type="printer" />
          </Menu.Item>
          <Menu.Item key={"IWMSPREVIEW" + dg.path} >
            <Icon type="file-search" />
          </Menu.Item>
        </Menu.SubMenu>
      );
    });
    return options;
  }
  onDefaultPrint = () => {
    let reportTempaltes = this.state.templates;
    if (!reportTempaltes || reportTempaltes.length == 0) {
      message.error("无法获取打印模板")
      return;
    }
    let templateName;
    for (let j = 0, len = reportTempaltes.length; j < len; j++) {
      if (reportTempaltes[j].def)
        templateName = reportTempaltes[j].path;
    }
    if (!templateName) {
      message.error('请设置默认打印模板！');
      return;
    }
    this.onPrint(templateName);
  }
  onMenuClick = (e) => {
    let printArray = e.key.split("IWMSPRINT");
    let previewArray = e.key.split("IWMSPREVIEW");
    if (printArray.length > 1) {
      this.onPrint(printArray[1]);
    }
    if (previewArray.length > 1) {
      let { reportParams } = this.props;
      if (reportParams) {
        reportParams = reportParams.sort(function (a, b) { return a.billNumber.localeCompare(b.billNumber) });
      }
      if (reportParams.length < 1) {
        message.warn(formatMessage({ id: 'iwms.print.tips' }));
        return;
      }

      let billnumberParms = '';
      for (let j = 0, len = reportParams.length; j < len; j++) {
        billnumberParms += reportParams[j].billNumber;
        if (j < len - 1)
          billnumberParms += '-';
      }
      let reportTempalteParams = {
        viewlet: previewArray[1],
        billNumber: billnumberParms,
        userUuid: loginUser().uuid,
        userCode: loginUser().code,
        userName: loginUser().name,
        dcUuid: loginOrg().uuid,
        dcCode: loginOrg().code,
        dcName: loginOrg().name,
        companyUuid: loginCompany().uuid,
        companyCode: loginCompany().code,
        companyName: loginCompany().name,
      }
      window.open(configs[API_ENV].RPORTER_SERVER + '?' + qs.stringify(reportTempalteParams));
    }
  }
  render() {
    const { permission, templates } = this.state;
    const templateMenu =
      (
        <Menu onClick={this.onMenuClick}>
          {this.buildTemplateMenu()}
        </Menu>
      );
    return (
      <Dropdown overlay={templateMenu} disabled={!templates || templates.length == 0}>
        <Button onClick={() => this.onDefaultPrint()} icon="printer">
          {commonLocale.printLocale} <Icon type="down" />
        </Button>
      </Dropdown>
    );
  }
}
