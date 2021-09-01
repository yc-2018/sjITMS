import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Tabs, message, Table, Checkbox } from 'antd';
import ViewPage from './ViewPage';
import { formatMessage } from 'umi/locale';
import NotePanel from '@/pages/Component/Form/NotePanel';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import FormTitle from '@/pages/Component/Form/FormTitle';
import { DOCK_RES } from './DockPermission';
import { addressToStr, convertCodeName } from '@/utils/utils';
import { basicState } from '@/utils/BasicState';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import { dockLocale, DockState, DockUsage } from './DockLocale';
import { spawn } from 'child_process';
import ShowDifferentPage from '../../Out/Wave/ShowDifferentPage';
import DockStateModal from './DockStateModal';
import TagDetailUtil from '@/pages/Component/TagDetailUtil';
const TabPane = Tabs.TabPane;
@connect(({ dock, loading }) => ({
  dock,
  loading: loading.models.dock,
}))
export default class DockViewPage extends ViewPage {
  constructor(props) {
    super(props);
    this.state = {
      entity: {},
      title: '',
      entityUuid: props.entityUuid,
      // entityState: '',
      // disabledChangeState: !havePermission(DOCK_RES.ONLINE),
      modifyModalVisible: false,
      entityCode: props.entityCode
    }
  }
  componentDidMount() {
    this.refresh(this.state.entityCode );
  }
  componentWillReceiveProps(nextProps) {
    const entity = nextProps.dock.entity;
    if (entity  ) {
      this.setState({
        entity: entity,
        title: convertCodeName(entity),
        entityUuid: entity ? entity.uuid : '',
        entityCode: entity ? entity.code : ''
        // entityState: dock ? dock.state : '',
        // realStateCaption: dock ? DockState[dock.state] : '',
        // realChecked: dock ? 'DISENABLED' != dock.state : false,
        // disabledChangeState: dock ? 'USING' === dock.state : false,
      });
    }
    const  nextEntityCode = nextProps.entityCode
    if(nextEntityCode !== this.state.entityCode){
      this.setState({
        entityCode :nextEntityCode
      })
      // this.refresh(nextEntityCode)
    }
  }
  refresh(nextEntityCode) {
    if(!nextEntityCode){
      nextEntityCode = this.state.entityCode
    }
    if(!nextEntityCode) {
      this.props.dispatch({
        type: 'dock/get',
        payload: this.props.dock.entityUuid,
        callback: response => {
          if (response && response.success) {
            this.setState({
              dockState: response.data.state
            });
          }
        }
      });
    }else{
      this.props.dispatch({
        type: 'dock/getByCode',
        payload: {
          entityCode: nextEntityCode
        },
        callback: (response) => {
          if ( !response|| !response.data || !response.data.uuid) {
            message.error("码头不存在")
            this.onBack()
          }
        }
      });
    }

  }
  // onChangeState = () => {
  //     const { dispatch } = this.props;
  //     const { entity } = this.state;
  //     // 禁用
  //     if (entity.state == 'FREE') {
  //         dispatch({
  //             type: 'dock/offline',
  //             payload: entity,
  //             callback: response => {
  //                 if (response && response.success) {
  //                     message.success(commonLocale.offlineSuccessLocale);
  //                     this.refresh();
  //                 }
  //             },
  //         });
  //     } else if (entity.state == 'DISENABLED') {
  //         // 启用
  //         dispatch({
  //             type: 'dock/online',
  //             payload: entity,
  //             callback: response => {
  //                 if (response && response.success) {
  //                     message.success(commonLocale.onlineSuccessLocale);
  //                     this.refresh();
  //                 }
  //             },
  //         });
  //     }
  // };

  tabsChangeCallback = (activeKey) => {
    if (activeKey != "dock")
      return;

    const { entity } = this.state;
    if (!entity.dockCode)
      return;
    this.props.dispatch({
      type: 'dock/getByCode',
      payload: {
        dockCode: entity.dockCode
      }
    });
  }
  onBack = () => {
    this.props.dispatch({
      type: 'dock/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }
  onEdit = () => {
    this.props.dispatch({
      type: 'dock/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entity.uuid
      }
    });
  }

  onBatchProcess = value => {
    const that = this;
    that.onModifyState(value.state);
  }
  onModifyState = (state) => {
    const { entity } = this.state;
    this.setState({
      modifyModalVisible: true
    });
    this.props.dispatch({
      type: 'dock/stateModify',
      payload: {
        state: state,
        uuid: entity.uuid,
        version: entity.version
      },
      callback: response  => {
        if (response && response.success) {
          this.refresh();
          this.setState({
            modifyModalVisible: false
          });
          message.success('修改状态成功');
        }
      }
    });
  }
  onModify = (flag) => {
    this.setState({
      modifyModalVisible: !!flag
    });
  }
  drawActionButtion = () => {
    return (
      <Fragment>
        <Button onClick={this.onBack}>
          {commonLocale.backLocale}
        </Button>
        {this.state.entity && this.state.entity.state === 'DISENABLED' ?
          < Button type="primary" disabled={!havePermission(DOCK_RES.EDIT)} onClick={this.onEdit}>
            {commonLocale.editLocale}
          </Button> : null
        }
        <Button onClick={() => this.onModify(true)}>
          {commonLocale.modifyState}
        </Button>
      </Fragment>
    );
  }
  drawTabPanes = () => {
    let tabPanes = [
      this.drawInfoTab(),
    ];
    return tabPanes;
  }
  drawOthers = ()=>{
    const { modifyModalVisible } = this.state;
    const startParentMethods = {
      handleSave: this.onBatchProcess,
      onModify: this.onModify
    };
    return (
      <div>
        <DockStateModal
          {...startParentMethods}
          modifyModalVisible={modifyModalVisible}
          confirmLoading={this.props.loading}
        />
      </div>
    );
  }
  drawStateTag = () => {
    const { dockState } = this.state;
    if (dockState) {
      return (
        <TagDetailUtil value={dockState} />
      );
    }
  }
  convertUsages = (val) => {
    var usageCaptions = "";
    if (val != {} && val != null) {
      for (let item of val) {
        usageCaptions = usageCaptions + DockUsage[item] + " ";
      }
    }
    return usageCaptions;
  }
  drawInfoTab = () => {
    const { entity } = this.state;
    let basicItems = [{
      label: commonLocale.codeLocale,
      value: entity ? entity.code : ''
    }, {
      label: commonLocale.nameLocale,
      value: entity ? entity.name : ''
    }, {
      label: dockLocale.usages,
      value: entity ? this.convertUsages(entity.usages) : ''
    }, {
      label: dockLocale.dockGroup,
      value: entity ? convertCodeName(entity.dockGroup) : ''
    },
      {
        label: commonLocale.noteLocale,
        value: entity ? entity.note : ''
      }];
    return (
      <TabPane key="basicInfo" tab={dockLocale.title}>
        <ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} />
      </TabPane>
    );
  }
}
