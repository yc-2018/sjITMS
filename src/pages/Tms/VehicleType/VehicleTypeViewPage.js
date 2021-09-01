import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Tabs, message, Popconfirm } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import { formatMessage } from 'umi/locale';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import { VehicleUsage, VehicleTypeLocale, VehicleTypePrem, CarType } from './VehicleTypeLocale';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { loginOrg } from '@/utils/LoginContext';

const TabPane = Tabs.TabPane;

@connect(({ vehicleType, loading }) => ({
    vehicleType,
    loading: loading.models.vehicleType,
}))
export default class VehicleTypeViewPage extends ViewPage {

    constructor(props) {
        super(props);

        this.state = {
            entity: {},
            title: '',
            entityUuid: '',
            modalVisible: false,
            operate: '',
            entityCode: props.vehicleType.entityCode
        }
    }

    componentDidMount() {
        this.refresh(this.state.entityCode);
    }

    componentWillReceiveProps(nextProps) {
        const vehicleType = nextProps.vehicleType.entity;

        if (vehicleType) {
            // if (vehicleType.uuid !== nextProps.vehicleType.uuid) {
            //     this.refresh();
            // }

            this.setState({
                entity: vehicleType,
                title: convertCodeName(vehicleType),
                entityUuid: vehicleType.uuid,
                entityCode: vehicleType.code,
            });
        }
    }

    refresh(entityCode) {
      if(!entityCode){
        entityCode = this.state.entityCode
      }
      if(entityCode){
        this.props.dispatch({
          type: 'vehicleType/getByCode',
          payload: entityCode,
          callback:(response)=>{
            if(!response || !response.data || !response.data.uuid){
              message.error("指定车型不存在。")
              this.onCancel()
            }else{
              this.setState({
                entityCode : response.data.code
              })
            }
          }

        });
      }else {
        this.props.dispatch({
          type: 'vehicleType/getByUuid',
          payload: this.props.vehicleType.uuid
        });
      }
    }

    onBack = () => {
        this.props.dispatch({
            type: 'vehicleType/showPage',
            payload: {
                showPage: 'query',
                entity: {},
                uuid: '',
              fromView: true
            }
        });
    }
    onRemove = () => {
        this.props.dispatch({
            type: 'vehicleType/remove',
            payload: {
                uuid: this.state.entity.uuid,
                version: this.state.entity.version
            },
            callback: response => {
                if (response && response.success) {
                    message.success(VehicleTypeLocale.title + "已删除");
                } else {
                    message.error(response.message);
                }
            }
        });
    }

    onEdit = () => {
        this.props.dispatch({
            type: 'vehicleType/showPage',
            payload: {
                showPage: 'create',
                uuid: this.state.entity.uuid
            }
        });
    }

    /**
     * 模态框显示/隐藏
     */
    handleModalVisible = (operate) => {
        if (operate) {
            this.setState({
                operate: operate
            })
        }
        this.setState({
            modalVisible: !this.state.modalVisible
        });
    }
    /**
     * 模态框确认操作
     */
    handleOk = () => {
        const { operate } = this.state;
        if (operate === commonLocale.deleteLocale) {
            this.onRemove();
        }
    }

    drawActionButtion = () => {
        return (
            <Fragment>
                <Button onClick={this.onBack}>
                    {commonLocale.backLocale}
                </Button>
                {loginOrg().type === 'COMPANY' &&
                    <Button disabled={!VehicleTypePrem.REMOVE} onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}>
                        {commonLocale.deleteLocale}
                    </Button>
                }
                {loginOrg().type === 'COMPANY' &&
                    <Button onClick={this.onEdit} disabled={!VehicleTypePrem.EDIT}>
                        {commonLocale.editLocale}
                    </Button>
                }
            </Fragment>
        );
    }

    drawTabPanes = () => {
        let tabPanes = [
            this.drawInfoTab(),
        ];

        return tabPanes;
    }

    drawInfoTab = () => {
        const { entity } = this.state;

        let basicItems =
            [{
                label: commonLocale.codeLocale,
                value: entity ? entity.code : ''
            }, {
                label: commonLocale.nameLocale,
                value: entity ? entity.name : ''
            }, {
                label: VehicleTypeLocale.usage,
                value: entity && entity.usage ? VehicleUsage[entity.usage] : ''
            }, {
                label: VehicleTypeLocale.carType,
                value: entity && entity.carType ? CarType[entity.carType] : ''
            },
            {
                label: commonLocale.noteLocale,
                value: entity ? entity.note : ''
            }];
        let scopeItems =
            [{
                label: VehicleTypeLocale.length,
                value: entity ? entity.length/100 : ''
            }, {
                label: VehicleTypeLocale.width,
                value: entity ? entity.width/100 : ''
            }, {
                label: VehicleTypeLocale.height,
                value: entity ? entity.height/100 : ''
            },
            {
                label: VehicleTypeLocale.bearWeight,
                value: entity ? entity.bearWeight : ''
            },
            {
                label: VehicleTypeLocale.bearVolumeRate,
                value: entity ? entity.bearVolumeRate : ''
            }];

        return (
            <TabPane key="basicInfo" tab={VehicleTypeLocale.title}>
                <ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} />
                <ViewPanel items={scopeItems} title={VehicleTypeLocale.extendInfo} />
                <div>
                    <ConfirmModal
                        visible={this.state.modalVisible}
                        operate={this.state.operate}
                        object={VehicleTypeLocale.title + ':' + this.state.entity.code}
                        onOk={this.handleOk}
                        onCancel={this.handleModalVisible}
                    />
                </div>
            </TabPane>
        );
    }

  /**
   * 跳转至列表页面
   */
  onCancel = () => {
    this.props.dispatch({
      type: 'vehicleType/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }
}
