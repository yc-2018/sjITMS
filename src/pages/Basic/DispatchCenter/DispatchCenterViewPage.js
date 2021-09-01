import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Tabs, message } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import { convertCodeName } from '@/utils/utils';
import { basicState } from '@/utils/BasicState';
import { havePermission } from '@/utils/authority';
import { DISPATCHCENTER_RES } from './DispatchCenterPermission';
import { commonLocale } from '@/utils/CommonLocale';
import { dispatchCenterLocale } from './DispatchCenterLocale';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import Empty from '@/pages/Component/Form/Empty';
const TabPane = Tabs.TabPane;

@connect(({ dispatchCenter, loading }) => ({
    dispatchCenter,
    loading: loading.models.dispatchCenter,
}))
export default class DispatchCenterViewPage extends ViewPage {

    constructor(props) {
        super(props);

        this.state = {
            entity: {},
            entityUuid: props.dispatchCenter.entityUuid,
            entityCode: props.dispatchCenter.entityCode,
            title: '',
            disabledChangeState: !havePermission(DISPATCHCENTER_RES.ONLINE)

        }
    }

    componentDidMount() {
        this.refresh(this.state.entityCode, this.state.entityUuid);
    }

    componentWillReceiveProps(nextProps) {
      const entity = nextProps.dispatchCenter.entity;
      if (entity && (entity.code === this.state.entityCode || entity.uuid === this.state.entityUuid)) {
        this.setState({
          entity: entity,
          title: convertCodeName(entity),
          entityState: entity.state,
          entityUuid: entity.uuid,
          entityCode: entity.code,
        });
      }
      // const nextEntityUuid = nextProps.entityUuid;
      const nextEntityCode = nextProps.entityCode;
      if (nextEntityCode && nextEntityCode !== this.state.entityCode) {
        this.setState({
          entityCode: nextEntityCode
        });
        this.refresh(nextEntityCode);
      }

      const nextEntityUuid = nextProps.entityUuid;
      if (nextEntityUuid && nextEntityUuid !== this.state.entityUuid) {
        this.setState({
          entityUuid: nextEntityUuid
        });
        this.refresh(undefined, nextEntityUuid);
      }
    }

    refresh(entityCode, entityUuid) {
      if (!entityCode && !entityUuid) {
        entityCode = this.state.entityCode;
      }

      if (entityCode) {
        this.props.dispatch({
          type: 'dispatchCenter/getbycode',
          payload: {
            code: entityCode
          },
          callback: (response) => {
            // 当查询实体结果为空时，给出错误信息，返回列表页
            if (!response || !response.data || !response.data.uuid) {
              message.error("指定的调度中心不存在！");
              this.onBack();
            } else {
              this.setState({
                entityCode: response.data.code
              });
            }
          }
        });
        return;
      }

      if (entityUuid) {
        this.props.dispatch({
          type: 'dispatchCenter/get',
          payload: {
            uuid: entityUuid
          },
          callback: (response) => {
            // 当查询实体结果为空时，给出错误信息，返回列表页
            if (!response || !response.data || !response.data.uuid) {
              message.error("指定的调度中心不存在！");
              this.onBack();
            } else {
              this.setState({
                entityCode: response.data.code
              });
            }
          }
        });
      }
  }

    onBack = () => {
        this.props.dispatch({
            type: 'dispatchCenter/showPage',
            payload: {
                showPage: 'query'
            }
        });
    }

    onEdit = () => {
        this.props.dispatch({
            type: 'dispatchCenter/showPage',
            payload: {
                showPage: 'create',
                entityUuid: this.state.entityUuid
            }
        });
    }

    onChangeState = () => {
        const { entity } = this.state;
        if (entity.state === basicState.ONLINE.name) {
            this.props.dispatch({
                type: 'dispatchCenter/offline',
                payload: {
                    uuid: entity.uuid,
                    version: entity.version
                },
                callback: (response) => {
                    if (response && response.success) {
                        this.refresh();
                        message.success(commonLocale.offlineSuccessLocale);
                    }
                }
            });
        } else {
            this.props.dispatch({
                type: 'dispatchCenter/online',
                payload: {
                    uuid: entity.uuid,
                    version: entity.version
                },
                callback: (response) => {
                    if (response && response.success) {
                        this.refresh();
                        message.success(commonLocale.onlineSuccessLocale);
                    }
                }
            });
        }
    }

    drawActionButtion = () => {
        return (
            <Fragment>
                <Button onClick={this.onBack}>
                    {commonLocale.backLocale}
                </Button>
                <Button type="primary" 
                    disabled={!havePermission(DISPATCHCENTER_RES.CREATE)} 
                onClick={this.onEdit}>
                    {commonLocale.editLocale}
                </Button>
            </Fragment>
        );
    }

    drawTabPanes = () => {
        let tabPanes = [
            this.drawBasicInfo(),
        ];

        return tabPanes;
    }

    drawBasicInfo = () => {
        const { entity } = this.state;

        let basicItems = [{
            label: commonLocale.codeLocale,
            value: entity.code
        }, {
            label: commonLocale.nameLocale,
            value: entity.name
        }, {
            label: commonLocale.contactorLocale,
            value: entity.contacter
        }, {
            label: commonLocale.contactPhoneLocale,
            value: entity.contactNumber
        }];

        let dcsValue = [];
        entity.dcs&&entity.dcs.forEach(info=>{
            dcsValue.push(convertCodeName(info.dc));
        })

        basicItems.push({
            label: commonLocale.inDCLocale,
            value:entity && entity.dcs ? <EllipsisCol colValue={dcsValue.join('、')} /> : <Empty/>,
        },
        {
            label: commonLocale.noteLocale,
            value: entity.note
        })
        return (
            <TabPane key="basicInfo" tab={dispatchCenterLocale.title}>
                <ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} />
            </TabPane>
        );
    }
}
