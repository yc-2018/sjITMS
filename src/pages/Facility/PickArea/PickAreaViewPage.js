import { Tabs, Button, message } from 'antd';
import { connect } from 'dva';
import { Fragment } from 'react';
import { formatMessage } from 'umi/locale';
import { convertCodeName } from '@/utils/utils';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import {
  PickType, RplType, PickMethod, WholePickMethod, PickMode,
  RplStep, RplMode, RplMethod, RplMethodExtend, getBasicIfCaption
} from './PickAreaContants';
import { havePermission } from '@/utils/authority';
import { PICKAREA_RES } from './PickAreaPermission';
import { commonLocale } from '@/utils/CommonLocale';
import { pickAreaLocale } from './PickAreaLocale';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';
import { loginOrg } from '@/utils/LoginContext';


const TabPane = Tabs.TabPane;
@connect(({ pickArea, loading }) => ({
  pickArea,
  loading: loading.models.pickArea,
}))
export default class PickAreaViewPage extends ViewPage {
  constructor(props) {
    super(props);

    this.state = {
      title: pickAreaLocale.title,
      entityUuid: props.pickArea.entityUuid,
      entityCode: props.pickArea.entityCode,
      entity: {},
    }
  }

  componentDidMount() {
    this.refresh(this.state.entityCode);
  }

  componentWillReceiveProps(nextProps) {
    const pickArea = nextProps.pickArea.entity;
    // 当新的实体uuid与当前状态中实体一致进行渲染
    if (pickArea) {
      this.setState({
        entity: pickArea,
        title: convertCodeName(pickArea),
        entityUuid: pickArea ? pickArea.uuid : '',
        entityCode: pickArea ? pickArea.code : '',
      });
    }
  }

  /**
   * 刷新
   */
  refresh = (entityCode) => {
    if(!entityCode){
      entityCode = this.state.entityCode
    }
    if( !entityCode){
      this.props.dispatch({
        type: 'pickArea/get',
        payload: this.props.pickArea.entityUuid,
        callback:(response)=>{
          if(!response || !response.data ||!response.data.uuid){
            message.error("指定的拣货分区不存在！");
            this.onCancel()
          }else{
            this.setState({
               entityCode: response.data.code
            })
          }
        }
      },
        );
    }else {
      this.props.dispatch({
        type:'pickArea/getByCodeAndDCUuid',
        payload:{
          code: entityCode,
          dcUuid: loginOrg().uuid
        },
        callback:(response)=>{
          if(!response || !response.data ||!response.data.uuid){
            message.error("指定的拣货分区不存在！");
            this.onCancel()
          }else{
            this.setState({
              entityCode: response.data.code
            })
          }
        }
      })
    }
  }
  /**
   * 返回至查询界面
   */
  onCancel = () => {
    this.props.dispatch({
      type: 'pickArea/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }

  /**
   * 编辑
   */
  onEditBasicInfo = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'pickArea/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.props.pickArea.entity.uuid,
      }
    });
  }
  /**
   * 绘制基本信息详情Tab
   */
  drawPickAreaInfoTab = () => {
    const { entity } = this.state;
    let basicItems = [{
      label: commonLocale.codeLocale,
      value: entity.code,
      key: 'code'
    }, {
      label: commonLocale.nameLocale,
      value: entity.name,
      key: 'name'
    }, {
      label: pickAreaLocale.binScope,
      value: entity.binScope,
      key: 'binScope'
    }, {
      label: pickAreaLocale.wholeContainer,
      value: getBasicIfCaption(entity.wholeContainer),
      key: 'wholeContainer'
    },
      {
        label: commonLocale.noteLocale,
        value: entity ? entity.note : ''
      }
    ];
    if (entity.wholeContainer) {
      basicItems.push(
        {
          label: pickAreaLocale.wholePickMethod,
          value: entity.wholePickMethod ? WholePickMethod[entity.wholePickMethod].caption : '',
          key: 'wholePickMethod'
        }, {
        label: pickAreaLocale.basicDirectCollect,
        value: getBasicIfCaption(entity.directCollect),
        key: 'basicDirectCollect'
      }
      );
    }
    if (!entity.directCollect) {
      basicItems.push(
        {
          label: pickAreaLocale.basicUnifyCollectTempBin,
          value: entity.unifyCollectTempBin,
          key: 'basicUnifyCollectTempBin'
        }
      )
    }
    let rplItems = [
      {
        label: pickAreaLocale.rplMode,
        value: entity.rplConfig ? (entity.rplConfig.rplMode ? RplMode[entity.rplConfig.rplMode].caption : '') : '',
      }, {
        label: pickAreaLocale.rplStep,
        value: entity.rplConfig ? (entity.rplConfig.rplStep ? RplStep[entity.rplConfig.rplStep].caption : '') : '',
      }, {
        label: pickAreaLocale.rplType,
        value: entity.rplConfig ? (entity.rplConfig.rplType ? RplType[entity.rplConfig.rplType].caption : '') : '',
      }, {
        label: pickAreaLocale.rplMethod,
        value: entity.rplConfig ? (entity.rplConfig.rplMethod ? RplMethod[entity.rplConfig.rplMethod].caption : '') : '',
      }, {
        label: pickAreaLocale.rplMethodExtend,
        value: entity.rplConfig ? (entity.rplConfig.rplMethodExtend ? RplMethodExtend[entity.rplConfig.rplMethodExtend].caption : '') : '',
      }, {
        label: pickAreaLocale.t,
        value: entity.rplConfig ? (entity.rplConfig.t) : '',
      },
    ]
    if (entity.rplConfig && entity.rplConfig.rplMethod == RplMethod.ENOUGHOUT.name) {
      rplItems.splice(4, 2)
    }
    if (entity.rplConfig && entity.rplConfig.rplStep != RplStep.ONESTEP.name) {
      rplItems.splice(3, 0, {
        label: pickAreaLocale.rplTempBin,
        value: entity.rplConfig ? (entity.rplConfig.rplTempBin) : ''
      });
    }

    return (
      <TabPane key="basicInfo" tab={commonLocale.basicInfoLocale}>
          <ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} />
          <ViewPanel items={rplItems} title={pickAreaLocale.rplConfigTitle} />
      </TabPane>
    );
  }

  /**
   * 绘制指定库存配置Tab
   */
  drawTargetStockConfigTab = () => {
    const item = this.state.entity.targetStockConfig;
    let cols = [
      {
        label: pickAreaLocale.pickMode,
        value: item.pickMode ? PickMode[item.pickMode].caption : '',
      },
      {
        label: '是否补货',
        value: item.rpl ? '是' : '否',
      },
      {
        label: pickAreaLocale.pickMethod,
        value: item.pickMethod ? PickMethod[item.pickMethod].caption : '',
      }, {
        label: pickAreaLocale.directCollect,
        value: getBasicIfCaption(item.directCollect)
      }, {
        label: pickAreaLocale.maxVolume,
        value: item.maxVolume
      }, {
        label: pickAreaLocale.lastVolumeRate,
        value: item.lastVolumeRate
      }, {
        label: pickAreaLocale.maxArticleCount,
        value: item.maxArticleCount
      }, {
        label: pickAreaLocale.maxStoreCount,
        value: item.maxStoreCount
      }
    ];

    if (item.pickMethod === PickMethod.RF.name) {
      cols.splice(cols.length, 0, {
        label: pickAreaLocale.pickTempBin,
        value: item.pickTempBin
      })
    }

    if (!item.directCollect) {
      cols.splice(cols.length, 0, {
        label: pickAreaLocale.unifyCollectTempBin,
        value: item.unifyCollectTempBin
      })
    }
    if(item.pickMode === PickMode.SOW.name){
      cols.splice(cols.length, 0, {
        label: pickAreaLocale.allocateTransferBin,
        value: item.allocateTransferBin
      });
      cols.splice(2, 0, {
        label: '集合'+pickAreaLocale.pickMethod,
        value: item.crossPickMethod ? PickMethod[item.crossPickMethod].caption : '',
      })
    }
    return (
      <TabPane key="targetStockConfigInfo" tab={pickAreaLocale.targetStockConfigTitle}>
        <ViewPanel items={cols} title={pickAreaLocale.targetStockConfigTitle}/>
      </TabPane>
    );
  }
  /**
   * 动态展示config信息
   */
  drawConfigItem = (item) => {
    let cols = [
      {
        label: pickAreaLocale.pickMethod,
        value: item.pickMethod ? PickMethod[item.pickMethod].caption : '',
      }, {
        label: pickAreaLocale.pickMode,
        value: item.pickMode ? PickMode[item.pickMode].caption : '',
      }, {
        label: pickAreaLocale.directCollect,
        value: getBasicIfCaption(item.directCollect)
      }, {
        label: pickAreaLocale.maxVolume,
        value: item.maxVolume
      }, {
        label: pickAreaLocale.lastVolumeRate,
        value: item.lastVolumeRate
      }, {
        label: pickAreaLocale.maxArticleCount,
        value: item.maxArticleCount
      }, {
        label: pickAreaLocale.maxStoreCount,
        value: item.maxStoreCount
      }
    ];
    if (item.pickMethod === PickMethod.RFID.name) {
      cols.splice(2, 0, {
        label: pickAreaLocale.containerType,
        value: item.containerType ? convertCodeName(item.containerType) : '',
      })
    }
    if (item.pickMethod === PickMethod.RF.name) {
      cols.splice(2, 0, {
        label: pickAreaLocale.pickTempBin,
        value: item.pickTempBin
      })
    }

    if (!item.directCollect) {
      cols.splice(4, 0, {
        label: pickAreaLocale.unifyCollectTempBin,
        value: item.unifyCollectTempBin
      })
    }
    if(item.pickMode === PickMode.SOW.name){
      cols.splice(cols.length, 0, {
        label: pickAreaLocale.allocateTransferBin,
        value: item.allocateTransferBin
      })
    }
    return cols;
  }
  /**
   * 绘制配置信息页
   */
  drawConfigInfoTab = () => {
    let panels = [];
    if (this.state.entity.pickConfigs) {
      //整件在前 拆零在后
      let queuePickConfigs = [];
      this.state.entity.pickConfigs.map(item => {
        if (item.pickType === PickType.CASE.name) {
          queuePickConfigs[0] = item;
        } else if (item.pickType === PickType.SPLIT.name) {
          queuePickConfigs[1] = item;
        } else if (item.pickType === PickType.CASEANDSPLIT.name) {
          queuePickConfigs[0] = item;
        }
      })
      queuePickConfigs.map(item => {
        panels.push(
          <ViewPanel key={item.uuid} items={this.drawConfigItem(item)} title={PickType[item.pickType].caption + pickAreaLocale.pickTypeTitle} />
        );
      });
    }
    return (
      <TabPane key="configInfo" tab={pickAreaLocale.configTitle}>
        {panels}
      </TabPane>
    );
  }
  /**
   * 绘制右上角按钮
   */
  drawActionButtion = () => {
    return (
      <Fragment>
        <Button onClick={this.onCancel}>
          {commonLocale.backLocale}
        </Button>
        <Button type="primary" onClick={this.onEditBasicInfo}>
          {commonLocale.editLocale}
        </Button>
      </Fragment>
    );
  }
  /**
   * 绘制tab界面
   */
  drawTabPanes = () => {
    let tabPanes = [
      this.drawPickAreaInfoTab(),//基本信息
      this.drawConfigInfoTab(),//配置
    ];
    if(this.state.entity.targetStockConfig !== undefined){
      tabPanes.splice(1, 0, this.drawTargetStockConfigTab());
    }

    return tabPanes;
  }
}
