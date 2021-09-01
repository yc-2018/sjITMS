import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Tabs, message, Switch, Popconfirm } from 'antd';
import ViewPage from './ViewPage';
import { formatMessage } from 'umi/locale';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import { convertCodeName } from '@/utils/utils';
import { commonLocale } from '@/utils/CommonLocale';
import { VehicleLocale, VehicleState, VehiclePerm } from './VehicleLocale';
import VehicleEmployeeTable from './VehicleEmployeeTable';
import { basicState } from '@/utils/BasicState';
import { loginOrg } from '@/utils/LoginContext';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { orgType } from '@/utils/OrgType';
import { routerRedux } from 'dva/router';

const TabPane = Tabs.TabPane;

@connect(({ vehicle, loading }) => ({
    vehicle,
    loading: loading.models.vehicle,
}))
export default class VehicleViewPage extends ViewPage {

    constructor(props) {
        super(props);

        this.state = {
            entity: {},
            title: '',
            entityUuid: props.vehicle.entityUuid,
            modalVisible: false,
            operate: '',
            entityCode: props.vehicle.entityCode
        }
    }

    componentDidMount() {
      this.refresh(this.state.entityCode);
    }

    componentWillReceiveProps(nextProps) {
        const vehicle = nextProps.vehicle.entity;
        if (vehicle) {
            // if (nextProps.vehicle.uuid !== vehicle.uuid) {
            //     this.refresh();
            // }
            this.setState({
                entity: vehicle,
                title: '[' + vehicle.code + ']' + vehicle.plateNumber,
                entityUuid: nextProps.vehicle.uuid,
                entityState: vehicle ? vehicle.state : '',
                realStateCaption: vehicle.state ? VehicleState[vehicle.state].caption : "",
                realChecked: vehicle.state !== VehicleState.OFFLINE.name,
                disabledChangeState: loginOrg().type === orgType.company.name ? !VehiclePerm.ONLINE  : true,
                entityCode: nextProps.vehicle.code,
            });
        }
    }

    refresh(entityCode) {
      if(!entityCode){
        entityCode = this.state.entityCode
      }
      if(entityCode){
        this.props.dispatch({
          type: 'vehicle/getByCode',
          payload: entityCode,
          callback:(response)=>{
            if(!response || !response.data || !response.data.uuid){
              message.error("指定车辆不存在。")
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
          type: 'vehicle/getByUuid',
          payload: this.props.vehicle.uuid

        });
      }
    }

    onBack = () => {
        this.props.dispatch({
            type: 'vehicle/showPage',
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
            type: 'vehicle/delete',
            payload: {
                uuid: this.state.entity.uuid,
                version: this.state.entity.version
            },
            callback: response => {
                if (response && response.success) {
                    message.success(VehicleLocale.title + "已删除");
                    this.props.dispatch({
                        type: 'vehicle/showPage',
                        payload: {
                            showPage: 'query'
                        }
                    });
                } else {
                    message.error(response.message);
                }
            }
        });
    }

    onEdit = () => {
        this.props.dispatch({
            type: 'vehicle/showPage',
            payload: {
                showPage: 'create',
                uuid: this.state.entity.uuid
            }
        });
    }

    onChangeState = () => {
        let type = '';
        if (this.state.entity.state === VehicleState.OFFLINE.name)
            type = 'vehicle/online';
        else if(this.state.entity.state === VehicleState.FREE.name)
            type = 'vehicle/offline';
        this.props.dispatch({
            type: type,
            payload: {
                uuid: this.state.entity.uuid,
                version: this.state.entity.version,
            },
            callback: response => {
                this.props.dispatch({
                    type: 'vehicle/getByUuid',
                    payload: this.state.entity.uuid
                })
            }
        })
    }

    onViewCarrier = (carrierUuid) => {
        this.props.dispatch(routerRedux.push({
            pathname: '/tms/carrier',
            payload: {
                showPage: 'view',
                entityUuid: carrierUuid
            }
        }));
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
        const { entity } = this.state;
        if (loginOrg().type === orgType.company.name) {
            return (
                <Fragment>
                    <Button onClick={this.onBack} >
                        {commonLocale.backLocale}
                    </Button>
                    {
                        (entity.state === VehicleState.OFFLINE.name)&&
                        <Button disabled={!(VehiclePerm.REMOVE && entity.state === VehicleState.OFFLINE.name)}
                            onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}>
                            {commonLocale.deleteLocale}
                        </Button>
                    }
                    {
                        (entity.state === VehicleState.OFFLINE.name) &&
                        <Button onClick={this.onEdit} disabled={!(VehiclePerm.REMOVE && entity.state === VehicleState.OFFLINE.name)}>
                            {commonLocale.editLocale}
                        </Button>
                    }
                </Fragment >
            );
        }

        if(loginOrg().type === orgType.dispatchCenter.name){
            return (
                <Fragment>
                    <Button onClick={this.onBack} >
                        {commonLocale.backLocale}
                    </Button>
                    {
                        (entity.state === VehicleState.OFFLINE.name) &&
                        <Button onClick={this.onEdit} disabled={!(VehiclePerm.REMOVE && entity.state === VehicleState.OFFLINE.name)}>
                            {commonLocale.editLocale}
                        </Button>
                    }
                </Fragment >
            );
        }
        return (
            <Fragment>
                <Button onClick={this.onBack} >
                    {commonLocale.backLocale}
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

    onViewVehicleType = (vehicleTypeUuid) => {
        this.props.dispatch(routerRedux.push({
            pathname: '/tms/vehicleType',
            payload: {
                showPage: 'view',
                uuid: vehicleTypeUuid
            }
        }))
    }

    drawInfoTab = () => {
        const { entity } = this.state;
        var dis = '';
        if(entity.vehicleDispatchCenters != undefined){
            entity.vehicleDispatchCenters.forEach(function(e){
                dis = dis+e.dispatchCenter.name+'['+e.dispatchCenter.code+']、';
            });
        }
        dis =  dis.substring(0, dis.length-1);
        let basicItems =
            [{
                label: commonLocale.codeLocale,
                value: entity ? entity.code : ''
            }, {
                label: VehicleLocale.plateNo,
                value: entity ? entity.plateNumber : ''
            }, {
                label: VehicleLocale.vehicleType,
                value: <a onClick={this.onViewVehicleType.bind(true, entity.vehicleType ? entity.vehicleType.uuid : undefined)}>
                    {convertCodeName(entity.vehicleType)}</a>
            }, {
                label: VehicleLocale.carrier,
                value: <a onClick={this.onViewCarrier.bind(true, entity.carrier ? entity.carrier.uuid : undefined)}>
                    {convertCodeName(entity.carrier)}</a>
            },{
                label: VehicleLocale.dispatchCenters,
                value: dis
            },{
                label: VehicleLocale.brand,
                value: entity ? entity.brand : ''
            },{
                label: VehicleLocale.etc,
                value: entity ? entity.etc : ''
            },{
                label: VehicleLocale.mailNumber,
                value: entity ? entity.mailNumber : ''
            },
            {
                label: commonLocale.noteLocale,
                value: entity ? entity.note : ''
            }
            ];

        let extendItems = [{
            label: VehicleLocale.mileage,
            value: entity && entity.mileage ? entity.mileage : ''
        },
        {
            label: VehicleLocale.oilConsumption,
            value: entity && entity.oilConsumption ? entity.oilConsumption : ''
        },
        {
            label: 'gps',
            value: entity && entity.gps ? '是' : '否'
        },
        {
            label: VehicleLocale.tailPlate,
            value: entity && entity.tailPlate ? '是' : '否'
        },]
        // const empTableProps = {
        //     data: entity.employees
        // }

        return (
            <TabPane key="basicInfo" tab={VehicleLocale.title}>
                <ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} />
                <ViewPanel items={extendItems} title={VehicleLocale.extendInfo} />
                {loginOrg().type !== orgType.company.name && <VehicleEmployeeTable />}
                <div>
                    <ConfirmModal
                        visible={this.state.modalVisible}
                        operate={this.state.operate}
                        object={VehicleLocale.title + ':' + this.state.entity.code}
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
      type: 'vehicle/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }
}
