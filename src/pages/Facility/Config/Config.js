import SiderPage from '@/pages/Component/Page/SiderPage';
import { configLocale } from './ConfigLocale';
import { Menu, Icon } from 'antd';
import { connect } from 'dva';
import BookTimeConfig from './Book/BookTimeConfig';
import ArticleStorage from './ArticleStorage/ArticleStorageConfig';
import BookQtyStrConfig from './Book/BookQtyStrConfig';
import StockTakeConfig from './StockTake/StockTakeConfig';
import BinViewConfig from './BinView/BinViewConfig';
import QueryBillDateConfig from './QueryBillDateConfig/QueryBillDateConfig';
import RefundReceiveConfig from './RefundReceiveConfig/RefundReceiveConfig';
import BinTypeStorage from './BinTypeStorage/BinTypeStorageConfig';
import ContainerTypeBindConfig from './ContainerTypeBind/ContainerTypeBindConfig';
import MoveruleConfig from './Moverule/MoveruleConfig';
import DecincConfig from './Decinc/DecincConfig';
import LockConfig from './Lock/LockConfig';
import CloseConfig from './Close/CloseConfig';
import BindConfig from './BindConfig/BindConfig';
import ValidStockConfig from './ValidStock/ValidStockConfig';
import TPutAwayConfig from './PutAway/TPutAwayConfig';
import CategoryStorageConfig from './CategoryStorageConfig/CategoryStorageConfig'; import PickareaStorageConfig from './PickareaStorage/PickareaStorageConfig';
import PutAwayTransferConfig from './PutAwayTransfer/PutAwayTransferConfig';
import VendorRtnBinConfig from './VendorRtnBinConfig/VendorRtnBinConfig';
import CollectionBinReviewShipConfig from './CollectionBinReviewShipConfig/CollectionBinReviewShipConfig';
import AttachmentConfig from './AttachmentConfig/AttachmentConfig';
import WholeContainerTypeConfig from './WholeContainerTypeConfig/WholeContainerTypeConfig';
import StockOutConfig from './StockOut/StockOutConfig';
import BillDailyKnotsConfig from './BillDailyKnotsConfig/BillDailyKnotsConfig';
import InterfaceConfig from './InterfaceConfig/InterfaceConfig';
import CollectSchemeConfig from './CollectScheme/CollectSchemeConfig';
import PickScopeConfig from './PickScope/PickScopeConfig';
import TaskScopeConfig from './TaskScope/TaskScopeConfig';
import VendorCollectBinConfig from './VendorCollectBinConfig/VendorCollectBinConfig';
import VendorPickerConfig from './VendorPickerConfig/VendorPickerConfig';
import StoreAllocationConfig from './StoreAllocationConfig/StoreAllocationConfig';
import DockGroupConfig from './DockGroup/DockGroupConfig';
import PrinterConfig from './Printer/PrinterConfig';
import BinScopePrinterConfig from './BinScopePrinter/BinScopePrinterConfig';
import BillQpcStrConfig from './BillQpcStr/BillQpcStrConfig';
import PrintLabelConfig from './PrintLabelConfig/PrintLabelConfig';
import AllowVendorRtnConfig from './AllowVendorRtn/AllowVendorRtnConfig';
import CountingBinConfig from './CountingBinConfig/CountingBinConfig';
import OrderMaxUnloadConfig from './OrderMaxUnload/OrderMaxUnloadConfig';
import AlcNtcBillConfig from './AlcNtcBillConfig/AlcNtcBillConfig';
import StoreRtnAuditConfig from './StoreRtnAuditConfig/StoreRtnAuditConfig';
import PackageConfig from './PackageConfig/PackageConfig';
import VirtualArticleConfig from './VirtualArticleConfig/VirtualArticleConfig';
import WaveAlgorithmConfig from './WaveAlgorithmConfig/WaveAlgorithmConfig';
import DockGroupCollectConfig from '@/pages/Facility/Config/DockGroup/DockGroupCollectConfig';
import { loginOrg } from '@/utils/LoginContext';
import { orgType } from '@/utils/OrgType.js';
import siderStyle from '@/pages/Component/Page/inner/SiderPage.less';
import { roleLocale } from '@/pages/Account/Role/RoleLocale';
import React from 'react';

const { SubMenu } = Menu;

@connect(({ dcConfig, loading }) => ({
  dcConfig,
  loading: loading.models.dcConfig,
}))
export default class Config extends SiderPage {

  constructor(props) {
    super(props);

    this.state = {
      // title: configLocale.title,
      openKeys: this.props.dcConfig.openKeys,
      selectedKeys: this.props.dcConfig.selectedKeys,
      contentStyle: {
        marginTop: 0,
      },
    }
  }

  componentWillUnmount() {
    this.props.dcConfig.openKeys = [];
    this.props.dcConfig.selectedKeys = [];
  }

  componentWillMount(){
    if(this.state.openKeys==undefined){
      this.setState({
        openKeys:[configLocale.innerConfig.key]
      })
    }
    if(this.state.selectedKeys==undefined){
      this.setState({
        selectedKeys:[configLocale.innerConfig.queryBillDateConfig.key]
      })
    }
  }
  componentWillReceiveProps(nextProps){
    if(nextProps.dcConfig.openKeys&&nextProps.dcConfig.openKeys!=this.props.dcConfig.openKeys){
      this.setState({
        openKeys:[...nextProps.dcConfig.openKeys]
      });
    }

    if(nextProps.dcConfig.selectedKeys&&nextProps.dcConfig.selectedKeys!=this.props.dcConfig.selectedKeys){
      this.setState({
        selectedKeys:[...nextProps.dcConfig.selectedKeys]
      });
    }
  }

  onOpenChange = (openKeys) => {
    this.props.dispatch({
      type: 'dcConfig/chooseMenu',
      payload: {
        openKeys: openKeys,
        selectedKeys:this.props.dcConfig.selectedKeys
      }
    });
  }

  onClickMenu = (e) => {
    this.props.dispatch({
      type: 'dcConfig/chooseMenu',
      payload: {
        openKeys: this.props.dcConfig.openKeys,
        selectedKeys:new Array(e.key)
      }
    });
  }

  drawSider = () => {
    const { openKeys, selectedKeys } = this.state;
    return (
      loginOrg().type == orgType.dispatchCenter.name ? <div>
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
            <SubMenu key={configLocale.innerConfig.key} title={<span><Icon type="folder" /><span>{configLocale.innerConfig.name}</span></span>}>
              <Menu.Item key={configLocale.innerConfig.queryBillDateConfig.key}>
                {configLocale.innerConfig.queryBillDateConfig.name}
              </Menu.Item>
            </SubMenu>
          </Menu>
        </div> :
        <div style={{height: 'calc(100vh - 170px)', overflowY: 'scroll',overflowX:'hidden'}}>
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
            <SubMenu key={configLocale.innerConfig.key} title={<span><Icon type="folder" /><span>{configLocale.innerConfig.name}</span></span>}>
              <Menu.Item key={configLocale.innerConfig.queryBillDateConfig.key}>
                {configLocale.innerConfig.queryBillDateConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.innerConfig.binViewConfig.key}>
                {configLocale.innerConfig.binViewConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.innerConfig.receiveConfig.key}>
                {configLocale.innerConfig.receiveConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.innerConfig.validStockConfig.key}>
                {configLocale.innerConfig.validStockConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.innerConfig.stockoutconfig.key}>
                {configLocale.innerConfig.stockoutconfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.innerConfig.moveConfig.key}>
                {configLocale.innerConfig.moveConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.innerConfig.decIncConfig.key}>
                {configLocale.innerConfig.decIncConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.innerConfig.lockConfig.key}>
                {configLocale.innerConfig.lockConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.innerConfig.closeConfig.key}>
                {configLocale.innerConfig.closeConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.innerConfig.containerTypeBearConfig.key}>
                {configLocale.innerConfig.containerTypeBearConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.innerConfig.bindConfig.key}>
                {configLocale.innerConfig.bindConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.innerConfig.billQpcstrCongig.key}>
                {configLocale.innerConfig.billQpcstrCongig.name}
              </Menu.Item>
            </SubMenu>

            <SubMenu key={configLocale.bookConfig.key} title={<span><Icon type="folder" /><span>{configLocale.bookConfig.name}</span></span>}>
              <Menu.Item key={configLocale.bookConfig.bookTimeConfig.key}>
                {configLocale.bookConfig.bookTimeConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.bookConfig.bookQtyStrConfig.key}>
                {configLocale.bookConfig.bookQtyStrConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.bookConfig.orderMaxUnloadConfig.key}>
                {configLocale.bookConfig.orderMaxUnloadConfig.name}
              </Menu.Item>
            </SubMenu>

            <SubMenu key={configLocale.putawayConfig.key} title={<span><Icon type="folder" /><span>{configLocale.putawayConfig.name}</span></span>}>
              <Menu.Item key={configLocale.putawayConfig.t_putawayConfig.key}>
                {configLocale.putawayConfig.t_putawayConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.putawayConfig.binTypeStorageConfig.key}>
                {configLocale.putawayConfig.binTypeStorageConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.putawayConfig.articleStroageConfig.key}>
                {configLocale.putawayConfig.articleStroageConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.putawayConfig.categoryStorageConfig.key}>
                {configLocale.putawayConfig.categoryStorageConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.putawayConfig.pickareaStorageConfig.key}>
                {configLocale.putawayConfig.pickareaStorageConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.putawayConfig.putAwayTransferConfig.key}>
                {configLocale.putawayConfig.putAwayTransferConfig.name}
              </Menu.Item>
            </SubMenu>

            <SubMenu key={configLocale.taskConfig.key} title={<span><Icon type="folder" /><span>{configLocale.taskConfig.name}</span></span>}>
              <Menu.Item key={configLocale.taskConfig.taskScopeConfig.key}>
                {configLocale.taskConfig.taskScopeConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.taskConfig.pickScopeConfig.key}>
                {configLocale.taskConfig.pickScopeConfig.name}
              </Menu.Item>
            </SubMenu>

            <SubMenu key={configLocale.rtnConfig.key} title={<span><Icon type="folder" />
            <span>{configLocale.rtnConfig.name}</span></span>}>
              <Menu.Item key={configLocale.rtnConfig.vendorRtnBinConfig.key}>
                {configLocale.rtnConfig.vendorRtnBinConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.rtnConfig.vendorCollectBinConfig.key}>
                {configLocale.rtnConfig.vendorCollectBinConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.rtnConfig.vendorPickerConfig.key}>
                {configLocale.rtnConfig.vendorPickerConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.rtnConfig.allowVendorRtnConfig.key}>
                {configLocale.rtnConfig.allowVendorRtnConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.rtnConfig.countingBinConfig.key}>
                {configLocale.rtnConfig.countingBinConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.rtnConfig.storeRtnAuditConfig.key}>
                {configLocale.rtnConfig.storeRtnAuditConfig.name}
              </Menu.Item>
            </SubMenu>

            <SubMenu key={configLocale.outConfig.key} title={<span><Icon type="folder" /><span>{configLocale.outConfig.name}</span></span>}>

              <Menu.Item key={configLocale.outConfig.alcNtcBillConfig.key}>
                {configLocale.outConfig.alcNtcBillConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.outConfig.collectionBinReviewShipConfig.key}>
                {configLocale.outConfig.collectionBinReviewShipConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.outConfig.attachmentConfig.key}>
                {configLocale.outConfig.attachmentConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.outConfig.wholeContainerTypeConfig.key}>
                {configLocale.outConfig.wholeContainerTypeConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.outConfig.collectSchemeConfig.key}>
                {configLocale.outConfig.collectSchemeConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.outConfig.storeAllocationConfig.key}>
                {configLocale.outConfig.storeAllocationConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.outConfig.dockGroupConfig.key}>
                {configLocale.outConfig.dockGroupConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.outConfig.printerConfig.key}>
                {configLocale.outConfig.printerConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.outConfig.binScopePrinterConfig.key}>
                {configLocale.outConfig.binScopePrinterConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.outConfig.printLabelConfig.key}>
                {configLocale.outConfig.printLabelConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.outConfig.waveAlgorithmConfig.key}>
                {configLocale.outConfig.waveAlgorithmConfig.name}
              </Menu.Item>
            </SubMenu>

            <SubMenu key={configLocale.dailyKnotsConfig.key} title={<span><Icon type="folder" /><span>{configLocale.dailyKnotsConfig.name}</span></span>}>
              <Menu.Item key={configLocale.dailyKnotsConfig.billDailyKnotsConfig.key}>
                {configLocale.dailyKnotsConfig.billDailyKnotsConfig.name}
              </Menu.Item>
            </SubMenu>

            <SubMenu key={configLocale.interfaceConfig.key} title={<span><Icon type="folder" /><span>{configLocale.interfaceConfig.name}</span></span>}>
              <Menu.Item key={configLocale.interfaceConfig.interfaceConfig.key}>
                {configLocale.interfaceConfig.interfaceConfig.name}
              </Menu.Item>
            </SubMenu>

            <SubMenu key={configLocale.packageInOutConfig.key} title={<span><Icon type="folder" /><span>{configLocale.packageInOutConfig.name}</span></span>}>
              <Menu.Item key={configLocale.packageInOutConfig.packageConfig.key}>
                {configLocale.packageInOutConfig.packageConfig.name}
              </Menu.Item>
              <Menu.Item key={configLocale.packageInOutConfig.virtualArticleConfig.key}>
                {configLocale.packageInOutConfig.virtualArticleConfig.name}
              </Menu.Item>
            </SubMenu>
          </Menu>
        </div>
    );
  }

  drawContent = () => {
    const { selectedKeys } = this.state;

    let currentSelectedKey = selectedKeys[0];
    if (currentSelectedKey === configLocale.innerConfig.queryBillDateConfig.key){
      return <QueryBillDateConfig />;
    } else if (currentSelectedKey === configLocale.bookConfig.bookTimeConfig.key) {
      return <BookTimeConfig />;
    } else if (currentSelectedKey === configLocale.bookConfig.bookQtyStrConfig.key) {
      return <BookQtyStrConfig />;
    } else if (currentSelectedKey === configLocale.bookConfig.orderMaxUnloadConfig.key) {
      return <OrderMaxUnloadConfig />;
    } else if (currentSelectedKey === configLocale.innerConfig.takeConfig.key) {
      return <StockTakeConfig />;
    } else if (currentSelectedKey === configLocale.innerConfig.binViewConfig.key) {
      return <BinViewConfig />;
    } else if (currentSelectedKey === configLocale.putawayConfig.binTypeStorageConfig.key) {
      return <BinTypeStorage />;
    } else if (currentSelectedKey === configLocale.innerConfig.containerTypeBearConfig.key) {
      return <ContainerTypeBindConfig />;
    } else if (currentSelectedKey === configLocale.putawayConfig.t_putawayConfig.key) {
      return <TPutAwayConfig />;
    } else if (currentSelectedKey === configLocale.innerConfig.moveConfig.key) {
      return <MoveruleConfig />;
    } else if (currentSelectedKey === configLocale.innerConfig.decIncConfig.key) {
      return <DecincConfig />;
    } else if (currentSelectedKey === configLocale.innerConfig.lockConfig.key) {
      return <LockConfig />;
    } else if (currentSelectedKey === configLocale.innerConfig.closeConfig.key) {
      return <CloseConfig />;
    } else if (currentSelectedKey === configLocale.innerConfig.receiveConfig.key) {
      return <RefundReceiveConfig />;
    } else if (currentSelectedKey === configLocale.putawayConfig.articleStroageConfig.key) {
      return <ArticleStorage />;
    } else if (currentSelectedKey === configLocale.putawayConfig.categoryStorageConfig.key) {
      return <CategoryStorageConfig />;
    } else if (currentSelectedKey === configLocale.putawayConfig.pickareaStorageConfig.key) {
      return <PickareaStorageConfig />;
    } else if (currentSelectedKey === configLocale.innerConfig.bindConfig.key) {
      return <BindConfig />;
    } else if (currentSelectedKey === configLocale.putawayConfig.putAwayTransferConfig.key) {
      return <PutAwayTransferConfig />;
    } else if (currentSelectedKey === configLocale.innerConfig.validStockConfig.key) {
      return <ValidStockConfig />;
    } else if (currentSelectedKey === configLocale.rtnConfig.vendorRtnBinConfig.key) {
      return <VendorRtnBinConfig />;
    } else if (currentSelectedKey === configLocale.rtnConfig.vendorCollectBinConfig.key) {
      return <VendorCollectBinConfig />;
    } else if (currentSelectedKey === configLocale.rtnConfig.vendorPickerConfig.key) {
      return <VendorPickerConfig />;
    } else if (currentSelectedKey === configLocale.rtnConfig.countingBinConfig.key) {
      return <CountingBinConfig />;
    } else if (currentSelectedKey === configLocale.rtnConfig.storeRtnAuditConfig.key) {
      return <StoreRtnAuditConfig />;
    } else if (currentSelectedKey === configLocale.outConfig.collectionBinReviewShipConfig.key) {
      return <CollectionBinReviewShipConfig />;
    } else if (currentSelectedKey === configLocale.outConfig.attachmentConfig.key) {
      return <AttachmentConfig />;
    } else if (currentSelectedKey === configLocale.outConfig.wholeContainerTypeConfig.key) {
      return <WholeContainerTypeConfig />;
    } else if (currentSelectedKey === configLocale.innerConfig.stockoutconfig.key) {
      return <StockOutConfig />;
    } else if (currentSelectedKey === configLocale.dailyKnotsConfig.billDailyKnotsConfig.key) {
      return <BillDailyKnotsConfig />;
    } else if (currentSelectedKey === configLocale.interfaceConfig.interfaceConfig.key) {
      return <InterfaceConfig />
    } else if (currentSelectedKey === configLocale.outConfig.collectSchemeConfig.key) {
      return <CollectSchemeConfig />;
    } else if (currentSelectedKey === configLocale.taskConfig.taskScopeConfig.key) {
      return <TaskScopeConfig />;
    } else if (currentSelectedKey === configLocale.taskConfig.pickScopeConfig.key) {
      return <PickScopeConfig />;
    } else if (currentSelectedKey === configLocale.outConfig.storeAllocationConfig.key) {
      return <StoreAllocationConfig />;
    } else if (currentSelectedKey === configLocale.outConfig.dockGroupConfig.key) {
      return <DockGroupConfig />;
    } else if (currentSelectedKey === 'dockGroupCollectConfig') {
      return <DockGroupCollectConfig />;
    } else if (currentSelectedKey === configLocale.outConfig.printerConfig.key) {
      return <PrinterConfig />;
    } else if (currentSelectedKey === configLocale.outConfig.binScopePrinterConfig.key) {
      return <BinScopePrinterConfig />;
    }else if (currentSelectedKey === configLocale.outConfig.printLabelConfig.key) {
      return <PrintLabelConfig />;
    } else if (currentSelectedKey === configLocale.outConfig.waveAlgorithmConfig.key) {
      return <WaveAlgorithmConfig />;
    }else if (currentSelectedKey === configLocale.innerConfig.billQpcstrCongig.key) {
      return <BillQpcStrConfig />;
    } else if (currentSelectedKey === configLocale.rtnConfig.allowVendorRtnConfig.key) {
      return <AllowVendorRtnConfig />;
    } else if(currentSelectedKey === configLocale.outConfig.alcNtcBillConfig.key){
      return <AlcNtcBillConfig />;

    } else if(currentSelectedKey === configLocale.packageInOutConfig.packageConfig.key){
      return <PackageConfig />;

    } else if(currentSelectedKey === configLocale.packageInOutConfig.virtualArticleConfig.key){
      return <VirtualArticleConfig />;

    }
  }
}
