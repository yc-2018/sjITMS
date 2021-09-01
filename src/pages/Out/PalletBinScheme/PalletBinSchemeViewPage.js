import { connect } from 'dva';
import React, { Fragment } from 'react';
import { Button, Tabs, Tag,message } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { convertCodeName } from '@/utils/utils';
import { commonLocale } from '@/utils/CommonLocale';
import { palletBinSchemeLocale } from './PalletBinSchemeLocale';
import { DockUsage } from '@/pages/Facility/Dock/DockLocale';

const TabPane = Tabs.TabPane;

@connect(({ palletBinScheme, loading }) => ({
    palletBinScheme,
    loading: loading.models.palletBinScheme,
}))
export default class PalletBinSchemeViewPage extends ViewPage {
  constructor(props) {
    super(props);
    this.state = {
      entity: {},
      dockGroupItems: [], // 方案中包含的码头集配置
      dockItems: [], // 方案中包含的码头配置
      fixPalletBinSchemeItems: [], // 方案中包含的门店固定拣货位配置
      entityUuid: props.entityUuid,
      title: '',
      operate:'',
      modalVisible:false,
    }
  }
   componentDidMount() {
     this.refresh();
   }

   componentWillReceiveProps(nextProps) {
     if (nextProps.palletBinScheme.entity) {
      if (nextProps.palletBinScheme.entity.data && nextProps.palletBinScheme.entity.data.dockGroupItems) {
        for (let i = 0; i < nextProps.palletBinScheme.entity.data.dockGroupItems.length; i++) {
          nextProps.palletBinScheme.entity.data.dockGroupItems[i].line = i + 1;
        }
      }

      if (nextProps.palletBinScheme.entity.data&&nextProps.palletBinScheme.entity.data.dockItems) {
        for (let i = 0; i < nextProps.palletBinScheme.entity.data.dockItems.length; i++) {
          nextProps.palletBinScheme.entity.data.dockItems[i].line = i + 1;
        }
      }

      if (nextProps.palletBinScheme.entity.data&&nextProps.palletBinScheme.entity.data.fixPalletBinSchemeItems) {
        for (let i = 0; i < nextProps.palletBinScheme.entity.data.fixPalletBinSchemeItems.length; i++) {
          nextProps.palletBinScheme.entity.data.fixPalletBinSchemeItems[i].line = i + 1;
        }
      }
      let name = '';
      if (nextProps.palletBinScheme.entity.data){
        name = nextProps.palletBinScheme.entity.data.name
      }

      this.setState({
        entity: nextProps.palletBinScheme.entity.data ? nextProps.palletBinScheme.entity.data:{},
        dockGroupItems: nextProps.palletBinScheme.entity.data ? nextProps.palletBinScheme.entity.data.dockGroupItems : [],
        dockItems: nextProps.palletBinScheme.entity.data ? nextProps.palletBinScheme.entity.data.dockItems : [],
        fixPalletBinSchemeItems: nextProps.palletBinScheme.entity.data ? nextProps.palletBinScheme.entity.data.fixPalletBinSchemeItems : [],
        title: palletBinSchemeLocale.title + '：' + name,
        entityUuid: nextProps.palletBinScheme.entity.data?nextProps.palletBinScheme.entity.data.uuid:'',
      });
     }
   }
  /**
  * 刷新
  */
  refresh() {
    const { entityUuid } = this.state;
    this.props.dispatch({
      type: 'palletBinScheme/get',
      payload: {
        uuid:entityUuid
      }
    });
  }
  /**
  * 返回
  */
  onBack = () => {
    this.props.dispatch({
      type: 'palletBinScheme/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }
  /**
  * 编辑
  */
  onEdit = () => {
    this.props.dispatch({
      type: 'palletBinScheme/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entityUuid
      }
    });
  }

  /**
   * 模态框显示/隐藏
   */
  handleModalVisible =(operate)=>{
    if(operate){
      this.setState({
        operate:operate
      });
    }
    this.setState({
      modalVisible:!this.state.modalVisible
    });
  }
  /**
   * 模态框确认操作
   */
  handleOk = () =>{
    const {operate} = this.state;
    if (operate === commonLocale.deleteLocale){
      this.onDelete();
    }
  }
  /**
   * 删除
   */
  onDelete = ()=>{
    const {entity} = this.state
    this.props.dispatch({
      type: 'palletBinScheme/onRemove',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: (response) => {
        if (response && response.success) {
          this.onBack();
          message.success(commonLocale.removeSuccessLocale)
        }
      }
    })
  }
  /**
  * 绘制右上角按钮
  */
  drawActionButtion = () => {
      return (
        <Fragment>
          <Button onClick={this.onBack}>
              {commonLocale.backLocale}
          </Button>
          {
            <Button onClick={()=>this.handleModalVisible(commonLocale.deleteLocale)}
              // disabled={!havePermission(COLLECTBIN_RES.DELETE)}
            >
              {commonLocale.deleteLocale}
            </Button>
          }
          {
            <Button onClick={this.onEdit} type="primary"
              // disabled={!havePermission(COLLECTBIN_RES.EDIT)}
            >
              {commonLocale.editLocale}
            </Button>
          }
        </Fragment>
      );
  }

  convertPickAreas = (val) => {
    let pickAreas = '';
    if (val) {
      for (let item of val) {
        pickAreas = pickAreas + convertCodeName(item.pickArea) + ' ';
      }
    }
    return pickAreas;
  }
  /**
  * 绘制信息详情
  */
  drawPalletBinSchemeBillInfoTab = () => {
    const { entity } = this.state;
    // 概要
    let profileItems = [
      {
        label: commonLocale.codeLocale,
        value: entity.code
      },
      {
        label: commonLocale.nameLocale,
        value: entity.name
      },
      {
        label: palletBinSchemeLocale.palletBinType,
        value: entity.palletBinType?convertCodeName(entity.palletBinType) : undefined,
      },
      {
        label: palletBinSchemeLocale.searchFrom,
        value: entity.startPalletBin,
      },
      {
        label: palletBinSchemeLocale.searchTo,
        value: entity.endPalletBin,
      },
      {
        label: palletBinSchemeLocale.lastPalletBin,
        value: entity.lastPalletBin? entity.lastPalletBin.palletBin? entity.lastPalletBin.palletBin : undefined : undefined,
      },
      {
        label: palletBinSchemeLocale.startFromFirst,
        value: entity.startFromFirst? '是' : '否',
      },
      {
        label: palletBinSchemeLocale.loopSearch,
        value: entity.loopFind? '是' : '否',
      },
      {
        label: palletBinSchemeLocale.pickArea,
        value: entity.pickAreaItems? this.convertPickAreas(entity.pickAreaItems) : ''
      },
    ];

    return (
        <TabPane key="basicInfo" tab={palletBinSchemeLocale.title}>
          <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} />
          <div>
            <ConfirmModal
              visible={this.state.modalVisible}
              operate={this.state.operate}
              object={palletBinSchemeLocale.title+':'+this.state.entity.name}
              onOk={this.handleOk}
              onCancel={this.handleModalVisible}
            />
          </div>
        </TabPane>
    );
  }
  /**
  * 绘制Tab页
  */
  drawTabPanes = () => {
    let tabPanes = [
      this.drawPalletBinSchemeBillInfoTab(),
    ];

    return tabPanes;
  }
}
