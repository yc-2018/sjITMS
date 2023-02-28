import SiderPage from '@/pages/Component/Page/SiderPage';
import { configLocale } from './ConfigLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { Menu, Icon } from 'antd';
import InterfaceConfig from '@/pages/Facility/Config/InterfaceConfig/InterfaceConfig';
import BillConfig from './BillDailyKnotsConfig/BillConfig';
import DailyKnotsConfig from './BillDailyKnotsConfig/DailyKnotsConfig';
import DispatcherConfig from './DispatcherConfig/DispatcherConfig';
import ShipPlanDispatchConfig from './ShipPlanDispatchConfig/ShipPlanDispatchConfig';
import ReturnDistributionTypeConfig from './ReturnDistributionTypeConfig/ReturnDistributionTypeConfig';
import NoticeConfig from './NoticeConfig/NoticeConfig';
import StockBatchConfig from './StockBatchConfig/StockBatchConfig';
import TimeIntervalConfig from './TimeIntervalConfig/TimeIntervalConfig';
import { roleLocale } from '../Role/RoleLocale';
import siderStyle from '@/pages/Component/Page/inner/SiderPage.less';
import styles from './Config.less';
import QueryBillDateConfig from '@/pages/Facility/Config/QueryBillDateConfig/QueryBillDateConfig';
import PlanConfig from './PlanConfig/PlanConfig';
import DispatchingConfig from './DispatchingConfig/DispatchingConfig';
import DingTaskConfigPage from './DingTaskConfig/DingTaskConfigPage';
const { SubMenu } = Menu;

export default class Config extends SiderPage {
  constructor(props) {
    super(props);

    this.state = {
      // title: configLocale.title,
      openKeys:
        loginOrg().type == 'HEADING'
          ? [configLocale.billDailyKnotsConfig.billConfig.key]
          : [configLocale.interfaceConfig.key],
      selectedKeys:
        loginOrg().type == 'HEADING'
          ? [configLocale.billDailyKnotsConfig.billConfig.key]
          : loginOrg().type == 'DISPATCH_CENTER'
            ? [configLocale.timeIntervalConfig.timeIntervalConfig.key]
            : [configLocale.interfaceConfig.interfaceConfig.key],
      siderStyle: {
        height: '650px',
        overflow: 'auto',
      },
      contentStyle: {
        height: '650px',
        overflow: 'auto',
      },
    };
  }

  onOpenChange = openKeys => {
    this.setState({
      openKeys: openKeys,
    });
  };

  onClickMenu = e => {
    this.setState({
      selectedKeys: new Array(e.key),
    });
  };

  drawSider = () => {
    const { openKeys, selectedKeys } = this.state;
    return (
      <div>
        <div className={siderStyle.navigatorPanelWrapper}>
          <span className={siderStyle.title}>{configLocale.title}</span>
        </div>
        <Menu
          mode="inline"
          openKeys={openKeys}
          onOpenChange={this.onOpenChange}
          onClick={this.onClickMenu}
          selectedKeys={selectedKeys}
        >
          {/* 海鼎端 */}
          {loginOrg().type === 'HEADING' ? (
            <SubMenu
              key={configLocale.billDailyKnotsConfig.billConfig.key}
              title={
                <span>
                  <Icon type="folder" />
                  <span>{configLocale.billDailyKnotsConfig.billConfig.name}</span>
                </span>
              }
            >
              <Menu.Item key={configLocale.billDailyKnotsConfig.billConfig.key}>
                {configLocale.billDailyKnotsConfig.billConfig.name}
              </Menu.Item>
            </SubMenu>
          ) : null}
          {loginOrg().type === 'HEADING' ? (
            <SubMenu
              key={configLocale.billDailyKnotsConfig.dailyKnotsConfig.key}
              title={
                <span>
                  <Icon type="folder" />
                  <span>{configLocale.billDailyKnotsConfig.dailyKnotsConfig.name}</span>
                </span>
              }
            >
              <Menu.Item key={configLocale.billDailyKnotsConfig.dailyKnotsConfig.key}>
                {configLocale.billDailyKnotsConfig.dailyKnotsConfig.name}
              </Menu.Item>
            </SubMenu>
          ) : null}

          {/* 企业端 */}

          {loginOrg().type === 'COMPANY' ? (
            <SubMenu
              key={configLocale.interfaceConfig.key}
              title={
                <span>
                  <Icon type="folder" />
                  <span>{configLocale.interfaceConfig.name}</span>
                </span>
              }
            >
              <Menu.Item key={configLocale.interfaceConfig.interfaceConfig.key}>
                {configLocale.interfaceConfig.interfaceConfig.name}
              </Menu.Item>
            </SubMenu>
          ) : null}
          {loginOrg().type === 'COMPANY' ? (
            <SubMenu
              key={configLocale.tmsConfig.key}
              title={
                <span>
                  <Icon type="folder" />
                  <span>{configLocale.tmsConfig.name}</span>
                </span>
              }
            >
              <Menu.Item key={configLocale.tmsConfig.dispatcherConfig.key}>
                {configLocale.tmsConfig.dispatcherConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.tmsConfig.shipplandispatchconfig.key}>
                {configLocale.tmsConfig.shipplandispatchconfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.tmsConfig.returndistributiontypeconfig.key}>
                {configLocale.tmsConfig.returndistributiontypeconfig.name}
              </Menu.Item>
              <Menu.Item key={'dispatchConfig'}>{'配送调度配置'}</Menu.Item>
              <Menu.Item key={'pcdpz'}>{'排车单限制'}</Menu.Item>
              <Menu.Item key={'dingTaskPush'}>{'钉钉推送配置'}</Menu.Item>
            </SubMenu>
          ) : null}

          {loginOrg().type === 'COMPANY' ? (
            <SubMenu
              key={configLocale.sccConfig.key}
              title={
                <span>
                  <Icon type="folder" />
                  <span>{configLocale.sccConfig.name}</span>
                </span>
              }
            >
              <Menu.Item key={configLocale.sccConfig.noticeConfig.key}>
                {configLocale.sccConfig.noticeConfig.name}
              </Menu.Item>
            </SubMenu>
          ) : null}
          {loginOrg().type === 'COMPANY' ? (
            <SubMenu
              key={configLocale.stockBatchConfig.key}
              title={
                <span>
                  <Icon type="folder" />
                  <span>{configLocale.stockBatchConfig.name}</span>
                </span>
              }
            >
              <Menu.Item key={configLocale.stockBatchConfig.stockBatchConfig.key}>
                {configLocale.stockBatchConfig.stockBatchConfig.name}
              </Menu.Item>
            </SubMenu>
          ) : null}

          {loginOrg().type === 'DISPATCH_CENTER' ? (
            <SubMenu
              key={configLocale.timeIntervalConfig.key}
              title={
                <span>
                  <Icon type="folder" />
                  <span>{configLocale.timeIntervalConfig.name}</span>
                </span>
              }
            >
              <Menu.Item key={configLocale.timeIntervalConfig.timeIntervalConfig.key}>
                {configLocale.timeIntervalConfig.timeIntervalConfig.name}
              </Menu.Item>
            </SubMenu>
          ) : null}
          {/* 配送中心的单据查询日期配置放到这里，不再显示物流设施里的配置中心 */}
          <SubMenu
            key={configLocale.innerConfig.key}
            title={
              <span>
                <Icon type="folder" />
                <span>{configLocale.innerConfig.name}</span>
              </span>
            }
          >
            <Menu.Item key={configLocale.innerConfig.queryBillDateConfig.key}>
              {configLocale.innerConfig.queryBillDateConfig.name}
            </Menu.Item>
          </SubMenu>
        </Menu>
      </div>
    );
  };

  drawContent = () => {
    const { selectedKeys } = this.state;

    let currentSelectedKey = selectedKeys[0];
    if (currentSelectedKey === configLocale.billDailyKnotsConfig.billConfig.key) {
      return <BillConfig />;
    } else if (currentSelectedKey === configLocale.interfaceConfig.interfaceConfig.key) {
      return <InterfaceConfig />;
    } else if (currentSelectedKey === configLocale.billDailyKnotsConfig.dailyKnotsConfig.key) {
      return <DailyKnotsConfig />;
    } else if (currentSelectedKey === configLocale.tmsConfig.dispatcherConfig.key) {
      return <DispatcherConfig />;
    } else if (currentSelectedKey === configLocale.tmsConfig.shipplandispatchconfig.key) {
      return <ShipPlanDispatchConfig />;
    } else if (currentSelectedKey === configLocale.tmsConfig.returndistributiontypeconfig.key) {
      return <ReturnDistributionTypeConfig />;
    } else if (currentSelectedKey === configLocale.sccConfig.noticeConfig.key) {
      return <NoticeConfig />;
    } else if (currentSelectedKey === configLocale.stockBatchConfig.stockBatchConfig.key) {
      return <StockBatchConfig />;
    } else if (currentSelectedKey === configLocale.timeIntervalConfig.timeIntervalConfig.key) {
      return <TimeIntervalConfig />;
    } else if (currentSelectedKey === configLocale.innerConfig.queryBillDateConfig.key) {
      return <QueryBillDateConfig />;
    } else if (currentSelectedKey === 'dispatchConfig') {
      return <DispatchingConfig />;
    } else if (currentSelectedKey === 'pcdpz') {
      return <PlanConfig />;
    } else if (currentSelectedKey === 'dingTaskPush') {
      return <DingTaskConfigPage />;
    }
  };
}
