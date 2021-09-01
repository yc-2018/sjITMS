import React, { Fragment } from 'react';
import { Tabs, Button, message } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import ViewPage from '../../Component/Page/ViewPage';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import { havePermission } from '@/utils/authority';
import { WRH_RES } from './WrhPermission';
import { loginOrg, getActiveKey, loginCompany } from '@/utils/LoginContext';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';

const TabPane = Tabs.TabPane;
@connect(({ wrh, loading }) => ({
  wrh,
  loading: loading.models.wrh,
}))
export default class WrhViewDetailNew extends ViewPage {
  constructor(props) {
    super(props);

    this.state = {
      entityUuid: props.entityUuid,
      entityCode: props.entityCode,
      title: `${formatMessage({ id: 'wrh.title' })}`,
      entity: {}
    }
  }

  componentDidMount() {
    this.refresh(this.state.entityCode, this.state.entityUuid);
  }

  refresh = (entityCode, entityUuid) => {
    if (!entityCode && !entityUuid) {
      entityCode = this.state.entityCode;
    }
    // 由于仓位的后端接口是根据仓位代码和dcUuid查询的 所以这里有区别
    if(entityCode && entityCode != this.state.entityCode){
      if(loginCompany().uuid === loginOrg().uuid){
        message.error("该功能在企业端不适用！");
        this.onCancel();
      } else {
        this.props.dispatch({
          type: 'wrh/getByCodeAndDcUuid',
          payload: {
            code: entityCode,
            dcUuid: loginOrg().uuid
          },
          callback: (response) => {
            // 当查询实体结果为空时，给出错误信息，返回列表页
            if (!response || !response.data || !response.data.uuid) {
              message.error("指定的仓位不存在！");
              this.onCancel();
            } else {
              this.setState({
                entityCode: response.data.code,
                entityUuid: response.data.uuid
              });
            }
          }
        });
      }
      return;
    }

    if(entityUuid || this.state.entityUuid){
      this.props.dispatch({
        type: 'wrh/get',
        payload: entityUuid?entityUuid:this.state.entityUuid,
        callback: (response) => {
          // 当查询实体结果为空时，给出错误信息，返回列表页
          if (!response || !response.data || !response.data.uuid) {
            message.error("指定的仓位不存在！");
            this.onCancel();
          } else {
            this.setState({
              entityCode: response.data.code,
              entityUuid: response.data.uuid
            });
          }
        }
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (getActiveKey() != '' && getActiveKey() != this.props.pathname) {
      return;
    }
    const entity=nextProps.wrh.entity;
    if (entity && (entity.code === this.state.entityCode || entity.uuid===this.state.entityUuid)) {
      this.setState({
        title: convertCodeName(entity),
        entityUuid: entity.uuid,
        entityCode: entity.code,
        entity: entity,
        entityState: entity.state,
        disabledChangeState: loginOrg().type === 'COMPANY' ? !havePermission(WRH_RES.ONLINE) : true
      });
    }
    const nextEntityUuid = nextProps.entityUuid;
    const nextEntityCode = nextProps.entityCode;
    // 当本次传入的entityCode与当前状态中的id不一致时，重新查询渲染
    if (nextEntityCode && nextEntityCode !== this.state.entityCode) {
      this.setState({
        entityUuid: nextEntityCode
      });
      this.refresh(nextEntityCode);
    }
  }

  onCancel = () => {
    this.props.dispatch({
      type: 'wrh/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  openCreateFormView = () => {
    this.props.dispatch({
      type: 'wrh/showPage',
      payload: {
        showPage: 'create',
        entity: this.state.entity,
        entityUuid: this.state.entity.uuid
      }
    });
  }

  onChangeState = () => {
    const wrh = this.state.entity;
    if (wrh.state === "ONLINE") {
      this.props.dispatch({
        type: 'wrh/disable',
        payload: wrh,
        callback: response => {
          this.refresh(this.state.entityCode, this.state.entityUuid);
        }
      });
    } else {
      this.props.dispatch({
        type: 'wrh/enable',
        payload: wrh,
        callback: response => {
          this.refresh(this.state.entityCode, this.state.entityUuid);
        }
      });
    }
  }

  drawActionButtion() {
    const { entity } = this.state;

    return (
      <Fragment>
        <Button onClick={this.onCancel}>
          {commonLocale.backLocale}
        </Button>
        {loginOrg().type === 'COMPANY' &&
        <Button disabled={!havePermission(WRH_RES.CREATE)} type="primary" onClick={this.openCreateFormView}>
          {commonLocale.editLocale}
        </Button>}
      </Fragment>
    );
  }

  drawWrhInfo = () => {
    const { entity } = this.state;

    let basicItems = [{
      label: commonLocale.codeLocale,
      value: entity.code
    }, {
      label: commonLocale.nameLocale,
      value: entity.name
    }, {
      label: formatMessage({ id: 'wrh.index.table.column.sourceWrhCode' }),
      value: entity.sourceWrhCode
    }, {
      label: formatMessage({ id: 'wrh.index.table.column.sourceWrhName' }),
      value: entity.sourceWrhName
    }, {
      label: formatMessage({ id: 'wrh.index.table.column.dc' }),
      value: convertCodeName(entity.dc)
    },{
      label: commonLocale.noteLocale,
      value: entity.note
    }];

    return (
      <TabPane key="basicInfo" tab={formatMessage({ id: 'wrh.title' })}>
        <ViewTabPanel withoutTable={true} style={{marginTop:'-25px'}}>
          <ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} />
        </ViewTabPanel>
      </TabPane>
    )
  }

  drawTabPanes() {
    return [this.drawWrhInfo()];
  }
}
