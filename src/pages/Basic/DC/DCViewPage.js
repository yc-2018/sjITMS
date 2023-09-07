import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Tabs, message } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import { formatMessage } from 'umi/locale';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import { addressToStr, convertCodeName } from '@/utils/utils';
import { basicState } from '@/utils/BasicState';
import { havePermission } from '@/utils/authority';
import { DC_RES } from './DCPermission';
import { commonLocale } from '@/utils/CommonLocale';
import { dCLocale } from './DCLocale';
const TabPane = Tabs.TabPane;

@connect(({ dc, loading }) => ({
    dc,
    loading: loading.models.dc,
}))
export default class DCViewPage extends ViewPage {

    constructor(props) {
        super(props);

        this.state = {
            entity: {},
            entityUuid: props.dc.entityUuid,
            entityCode: props.dc.entityCode,
            title: '',
            disabledChangeState: !havePermission(DC_RES.ONLINE)
        }
    }

    componentDidMount() {
        this.refresh(this.state.entityCode, this.state.entityUuid);
    }

    componentWillReceiveProps(nextProps) {
      const entity = nextProps.dc.entity;
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
          type: 'dc/getByCodeAndCompanyUuid',
          payload: {
            entityCode: entityCode
          },
          callback: (response) => {
            // 当查询实体结果为空时，给出错误信息，返回列表页
            if (!response || !response.data || !response.data.uuid) {
              message.error("指定的配送中心不存在！");
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
        type: 'dc/get',
        payload: {
          uuid: entityUuid
        },
        callback: (response) => {
          // 当查询实体结果为空时，给出错误信息，返回列表页
          if (!response || !response.data || !response.data.uuid) {
            message.error("指定的配送中心不存在！");
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
            type: 'dc/showPage',
            payload: {
                showPage: 'query'
            }
        });
    }

    onEdit = () => {
        this.props.dispatch({
            type: 'dc/showPage',
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
                type: 'dc/offline',
                payload: {
                    uuid: entity.uuid,
                    version: entity.version
                },
                callback: (response) => {
                    if (response && response.success) {
                        this.refresh(this.state.entityCode, this.state.entityUuid);
                        message.success(commonLocale.offlineSuccessLocale);
                    }
                }
            });
        } else {
            this.props.dispatch({
                type: 'dc/online',
                payload: {
                    uuid: entity.uuid,
                    version: entity.version
                },
                callback: (response) => {
                    if (response && response.success) {
                        this.refresh(this.state.entityCode, this.state.entityUuid);
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
                <Button type="primary" disabled={!havePermission(DC_RES.CREATE)} onClick={this.onEdit}>
                    {commonLocale.editLocale}
                </Button>
            </Fragment>
        );
    }

    drawTabPanes = () => {
        let tabPanes = [
            this.drawDcInfoTab(),
        ];

        return tabPanes;
    }

    drawDcInfoTab = () => {
        const { entity } = this.state;

        let basicItems = [{
            label: commonLocale.codeLocale,
            value: entity.code
        }, {
            label: commonLocale.nameLocale,
            value: entity.name
        }, {
            label: dCLocale.sourceCode,
            value: entity.sourceCode
        }, {
            label: commonLocale.shortNameLocale,
            value: entity.shortName
        }, {
            label: commonLocale.contactorLocale,
            value: entity.contactor
        }, {
            label: commonLocale.contactPhoneLocale,
            value: entity.contactPhone
        }, {
            label: commonLocale.addressLocale,
            value: addressToStr(entity.address)
        }, {
            label: dCLocale.useWMSLocale,
            value: entity.useWMS ? dCLocale.yes : dCLocale.no
        }, {
            label: commonLocale.operateAreaLocale + '(㎡)',
            value: entity.operatingArea
        }, {
            label: commonLocale.zipCodeLocale,
            value: entity.zipCode
        }, {
            label: commonLocale.homeUrlLocale,
            value: entity.homeUrl
        }, {
            label: commonLocale.noteLocale,
            value: entity.note
        }];
        
        return (
            <TabPane key="basicInfo" tab={dCLocale.title}>
                <ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} />
            </TabPane>
        );
    }
}
