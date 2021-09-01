import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, Tabs, Modal, message, Select, Input, InputNumber } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import TimeLinePanel from '@/pages/Component/Form/TimeLinePanel';
import CollapsePanel from '@/pages/Component/Form/CollapsePanel';
import Empty from '@/pages/Component/Form/Empty';
import TagUtil from '@/pages/Component/TagUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import {
    commonLocale, notNullLocale, placeholderChooseLocale,
    placeholderLocale
} from '@/utils/CommonLocale';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';

import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { SHIPPLANBILL_RES } from './ShipPlanBillPermission';
import { State, WorkType, ShipPlanType } from './ShipPlanBillContants';
import { shipPlanBillLocale } from './ShipPlanBillLocale';
import ShipPlanBillItemTable from './ShipPlanBillItemTable';
import VehicleSelect from './VehicleSelect';
import SerialArchSelect from '@/pages/Component/Select/SerialArchSelect';
import FromOrgSelect from './FromOrgSelect';
import ToOrgSelect from './ToOrgSelect';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { routerRedux } from 'dva/router';
import { orgType } from '@/utils/OrgType';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';

const TabPane = Tabs.TabPane;
const Option = Select.Option;
@connect(({ shipplanbill, loading }) => ({
    shipplanbill,
    loading: loading.models.shipplanbill,
}))
export default class ShipPlanBillViewPage extends ViewPage {
    constructor(props) {
        super(props);
        this.state = {
            entity: {},
            entityUuid: props.entityUuid,
            billNumber: props.billNumber,
            title: '',
            operate: '',
            modalVisible: false,
            deliveryDispatchItems: []
        }
    }
    componentDidMount() {
      this.refresh(this.state.billNumber, this.state.entityUuid);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.shipplanbill.entity) {
            nextProps.shipplanbill.entity.items = nextProps.shipplanbill.entity.items ? nextProps.shipplanbill.entity.items : [];
            this.setState({
                entity: nextProps.shipplanbill.entity,
                title: shipPlanBillLocale.title + '：' + nextProps.shipplanbill.entity.billNumber,
                entityUuid: nextProps.shipplanbill.entity.uuid,
            });
        }

        if (nextProps.shipplanbill.toOrgData && nextProps.shipplanbill.toOrgData.list) {
            this.setState({
                deliveryDispatchItems: nextProps.shipplanbill.toOrgData.list
            });
        }
    }
    /**
    * 刷新
    */
    refresh(billNumber, uuid) {
      const {entityUuid} = this.state;
      if (!billNumber && !uuid) {
        billNumber = this.state.billNumber;
      }
      if (billNumber) {
        this.props.dispatch({
          type: 'shipplanbill/getByBillNumber',
          payload: {
            billNumber: billNumber,
            dcUuid: loginOrg().uuid
          },
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的排车单' + billNumber + '不存在！');
              this.onBack();
            } else {
              this.setState({
                billNumber: res.data.billNumber,
              });
            }
          }
        });
        return;
      }
      if (uuid) {
        this.props.dispatch({
          type: 'shipplanbill/get',
          payload: uuid,
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的排车单' + billNumber + '不存在！');
              this.onBack();
            } else {
              this.setState({
                billNumber: res.data.billNumber,
              });
            }
          }
        });
      }else{
        this.props.dispatch({
          type: 'shipplanbill/get',
          payload: entityUuid,
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的排车单' + billNumber + '不存在！');
              this.onBack();
            } else {
              this.setState({
                billNumber: res.data.billNumber,
              });
            }
          }
        });
      }
    }
    /**
    * 返回
    */
    onBack = () => {
        this.props.dispatch({
            type: 'shipplanbill/showPage',
            payload: {
                showPage: 'query',
              fromView: true
            }
        });
    }

  /**
   * 点击上一单
   */
  previousBill = () => {
    const { entity } = this.state;
    if (entity.uuid){
      this.props.dispatch({
        type: 'shipplanbill/previousBill',
        payload: entity.billNumber
      });
    }
  }
  /**
   * 点击下一单
   */
  nextBill = () => {
    const { entity } = this.state;
    if (entity.uuid){
      this.props.dispatch({
        type: 'shipplanbill/nextBill',
        payload: entity.billNumber
      });
    }
  }
    /**
    * 编辑
    */
    onEdit = () => {
        this.props.dispatch({
            type: 'shipplanbill/showPage',
            payload: {
                showPage: 'create',
                entityUuid: this.state.entityUuid
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
            this.onDelete();
        } else if (operate === commonLocale.approveLocale) {
            this.onApprove();
        } else if (operate === commonLocale.abortLocale) {
            this.onAbort();
        }
    }

    onShip = () => {
        const { entity } = this.state
        this.props.dispatch(routerRedux.push({
            pathname: '/tms/shipbill',
            shipPlanBillNumber: entity.billNumber
        }));
    }

    /**
     * 删除
     */
    onDelete = () => {
        const { entity } = this.state
        this.props.dispatch({
            type: 'shipplanbill/onRemove',
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
     * 批准
     */
    onApprove = () => {
        const { entity } = this.state
        this.props.dispatch({
            type: 'shipplanbill/onApprove',
            payload: {
                uuid: entity.uuid,
                version: entity.version
            },
            callback: response => {
                if (response && response.success) {
                    this.refresh();
                    message.success(commonLocale.approveSuccessLocale)
                }
            }
        })
        this.setState({
            modalVisible: !this.state.modalVisible
        });
    }
    /**
 * 作废
 */
    onAbort = () => {
        const { entity } = this.state
        this.props.dispatch({
            type: 'shipplanbill/onAbort',
            payload: {
                uuid: entity.uuid,
                version: entity.version
            },
            callback: response => {
                if (response && response.success) {
                    this.refresh();
                    message.success(commonLocale.abortSuccessLocale)
                }
            }
        })
        this.setState({
            modalVisible: !this.state.modalVisible
        });
    }

    listToStr = (list) => {
        let listStr = '';
        Array.isArray(list) && list.forEach(function (data, index) {
            listStr = listStr + convertCodeName(data);
            if (index < list.length - 1) {
                listStr = listStr + '、';
            }
        });
        return listStr;
    }

    /**
     * 绘制订单状态tag
     */
    drawStateTag = () => {
        if (this.state.entity.state) {
            return (
                <TagUtil value={this.state.entity.state} />
            );
        }
    }
    /**
    * 绘制右上角按钮
    */
    drawActionButtion = () => {
        if (this.state.entity.state) {
            return (
                <Fragment>
                  <Button onClick={this.onBack}>
                    {commonLocale.backLocale}
                  </Button>
                  <PrintButton
                    reportParams={[{ 'billNumber': this.state.entity ? this.state.entity.billNumber : null }]}
                    moduleId={PrintTemplateType.SHIPPLANBILL.name} />
                  {
                        (orgType.carrier.name != loginOrg().type &&
                            State[this.state.entity.state].name == 'SAVED') &&!this.state.entity.state.sourceBillNumber&&
                        < Button disabled={!havePermission(SHIPPLANBILL_RES.DELETE)} onClick={() => this.handleModalVisible(commonLocale.deleteLocale)} >
                            {commonLocale.deleteLocale}
                        </Button>
                    }
                  {
                        (orgType.carrier.name != loginOrg().type &&
                            State[this.state.entity.state].name == 'SAVED') &&!this.state.entity.state.sourceBillNumber&&
                        <Button disabled={!havePermission(SHIPPLANBILL_RES.EDIT)} onClick={this.onEdit} >
                            {commonLocale.editLocale}
                        </Button>

                    }
                  {
                        (orgType.carrier.name != loginOrg().type &&
                            State[this.state.entity.state].name == 'SAVED') &&!this.state.entity.state.sourceBillNumber&&
                        <Button disabled={!havePermission(SHIPPLANBILL_RES.APPROVE)} type='primary' onClick={() => this.handleModalVisible(commonLocale.approveLocale)}>
                            {commonLocale.approveLocale}
                        </Button>
                    }
                  {
                        (orgType.carrier.name != loginOrg().type && State[this.state.entity.state].name == 'APPROVED') &&!this.state.entity.state.sourceBillNumber&&
                        <Button disabled={true} type='primary' onClick={() => this.handleModalVisible(commonLocale.abortLocale)}>
                            {commonLocale.abortLocale}
                        </Button>
                    }
                  {
                        (orgType.carrier.name != loginOrg().type &&
                            State[this.state.entity.state].name == 'APPROVED') &&!this.state.entity.state.sourceBillNumber&&
                        <Button disabled={!havePermission(SHIPPLANBILL_RES.SHIP)} type='primary' onClick={() => this.onShip()}>
                            {shipPlanBillLocale.ship}
                        </Button>
                    }

                </Fragment >
            );
        }
    }

    onFieldChange = (value, field, index) => {
        const { entity } = this.state;

        if (field === 'shipOrder') {
            entity.items[index - 1].shipOrder = value;
        } else if (field === 'shipPlanType') {
            entity.items[index - 1].shipPlanType = value;
        } else if (field === 'fromOrg') {
            const fromOrg = JSON.parse(value);
            entity.items[index - 1].fromOrg = { uuid: fromOrg.uuid, code: fromOrg.code, name: fromOrg.name };
            entity.items[index - 1].fromOrgType = fromOrg.type;

            const toOrgs = this.getToOrgs(entity.items[index - 1]);
            if (toOrgs && toOrgs.length > 0) {
                entity.items[index - 1].toOrg = toOrgs[0];
                entity.items[index - 1].toOrgType = toOrgs[0].type;
                this.refreshSerialArchLineAndDockGroup(entity.items[index - 1]);
            }
        } else if (field === 'toOrg') {
            const toOrg = JSON.parse(value);
            entity.items[index - 1].toOrg = toOrg;
            entity.items[index - 1].toOrgType = toOrg.type;
            this.refreshSerialArchLineAndDockGroup(entity.items[index - 1]);
        }

        this.setState({
            entity: { ...entity }
        });
    }

    getShipPlanTypeOptions = () => {
        const options = [];
        options.push(
            Object.keys(ShipPlanType).forEach(function (key) {
                options.push(<Option key={ShipPlanType[key].name} value={ShipPlanType[key].name}>{ShipPlanType[key].caption}</Option>);
            }));
        return options;
    }

    getFromOrgType = (shipPlanType) => {
        if (ShipPlanType.DELIVERY.name == shipPlanType || ShipPlanType.TRANSPORT.name == shipPlanType)
            return 'DC';
        else
            return 'STORE';
    }


    getToOrgType = (shipPlanType) => {
        if (ShipPlanType.DELIVERY.name == shipPlanType || ShipPlanType.TRANSFER.name == shipPlanType)
            return 'STORE';
        else
            return 'DC';
    }

    getToOrgs = (record) => {
        const { deliveryDispatchItems } = this.state;

        let toOrgs = [];
        if (!deliveryDispatchItems || !record.shipPlanType || !record.fromOrg)
            return toOrgs;

        deliveryDispatchItems.forEach(e => {
            if (e.type == record.shipPlanType && e.fromOrg.uuid == record.fromOrg.uuid) {
                let toOrg = {
                    uuid: e.toOrg.uuid,
                    code: e.toOrg.code,
                    name: e.toOrg.name,
                    type: e.toOrgType
                }
                toOrgs.push(toOrg);
            }
        });
        return toOrgs;
    }

    getToOrgOptions = (record) => {
        let toOrgOptions = [];
        let toOrgs = this.getToOrgs(record);
        if (!toOrgs || toOrgs.length <= 0)
            return toOrgOptions;

        toOrgs.forEach(e => {
            toOrgOptions.push(
                <Select.Option key={e.uuid} value={JSON.stringify(e)}>
                    {convertCodeName(e)}
                </Select.Option>
            );
        });
        return toOrgOptions;
    }

    refreshSerialArchLineAndDockGroup = (record) => {
        const { deliveryDispatchItems } = this.state;

        if (!deliveryDispatchItems)
            return;

        if (!record || !record.fromOrg || !record.toOrg)
            return;

        deliveryDispatchItems.forEach(e => {
            if (e.type == record.shipPlanType && e.fromOrg.uuid == record.fromOrg.uuid
                && e.toOrg.uuid == record.toOrg.uuid) {
                record.serialArchLine = e.serialArchLine;
                record.dockGroupStr = e.dockerGroupStr;
                record.amount = e.staticProfile.amount;
                record.weight = e.staticProfile.weight;
                record.volume = e.staticProfile.volume;
                record.qtyStr = e.staticProfile.qtyStr;
            }
        });
    }

    validItems = (items) => {
        if (items.length === 0) {
            message.error(notNullLocale(commonLocale.itemsLineLocale));
            return false;
        }

        for (let i = items.length - 1; i >= 0; i--) {
            if (!items[i].shipPlanType) {
                message.error(`明细第${items[i].line}行任务类型不能为空！`);
                return false;
            }

            if (!items[i].fromOrg) {
                message.error(`明细第${items[i].line}行来源不能为空！`);
                return false;
            }

            if (!items[i].toOrg) {
                message.error(`明细第${items[i].line}行目标不能为空！`);
                return false;
            }

        }

        for (let i = 0; i < items.length; i++) {
            for (let j = i + 1; j < items.length; j++) {
                if (items[i].shipPlanType === items[j].shipPlanType &&
                    items[i].fromOrg.uuid === items[j].fromOrg.uuid &&
                    items[i].toOrg.uuid === items[j].toOrg.uuid) {
                    message.error(`明细第${items[i].line}行与第${items[j].line}行重复！`);
                    return false;
                }
            }
        }

        return items;
    }

    onRefreshItems = (items) => {
        const { entity } = this.state;
        entity.items = items;

        this.props.dispatch({
            type: 'shipplanbill/onModifyBillItem',
            payload: entity,
            callback: response => {
                if (response && response.success) {
                    message.success("刷新任务成功");
                }
                this.refresh();
            }
        });
    }

    getDot = (state) => {
        if (state === State.SAVED.name || state === State.APPROVED.name || state === State.ABORTED.name) { return 0; }
        if (state === State.SHIPPROGRESS.name) { return 1; }
        if (state === State.FINISHED.name) { return 2; }
    }


    /**
    * 绘制信息详情
    */
    drawBillInfoTab = () => {
        const { entity } = this.state;

        let profileItems = [
            {
                label: '来源单号',
                value: entity.sourceBillNumber ? entity.sourceBillNumber : <Empty />
            },
            {
                label: shipPlanBillLocale.vehicle,
                value: <a onClick={this.onViewVehicle.bind(true, entity.vehicle ? entity.vehicle.uuid : undefined)}>
                    {convertCodeName(entity.vehicle)}</a>
            },
            {
                label: shipPlanBillLocale.vehicleType,
                value: entity.vehicleType ? convertCodeName(entity.vehicleType) : <Empty />
            },
            {
                label: shipPlanBillLocale.vehicleBearWeight,
                value: entity.vehicleBearWeight ? entity.vehicleBearWeight : <Empty />
            },
            {
                label: shipPlanBillLocale.vehicleVolume,
                value: entity.vehicleVolume ? entity.vehicleVolume : <Empty />
            },
            {
                label: shipPlanBillLocale.serialArch,
                value: entity.serialArch ? convertCodeName(entity.serialArch) : <Empty />
            },
            {
                label: shipPlanBillLocale.carrier,
                value: <a onClick={this.onViewCarrier.bind(true, entity.carrier ? entity.carrier.uuid : undefined)}>
                    {convertCodeName(entity.carrier)}</a>
            },
        ];

        let drivers = [];
        let stevedores = [];
        if (entity.employees) {
            entity.employees.forEach(function (employee) {
                if (WorkType.DRIVER.name == employee.vehicleEmployeeType)
                    drivers.push(employee.vehicleEmployee);
                else
                    stevedores.push(employee.vehicleEmployee);
            });
        }

        profileItems.push(
            {
                label: shipPlanBillLocale.driver,
                value: drivers.length > 0 ? this.listToStr(drivers) : <Empty />
            },
            {
                label: shipPlanBillLocale.stevedore,
                value: stevedores.length > 0 ? this.listToStr(stevedores) : <Empty />
            }
            ,
            {
                label: commonLocale.noteLocale,
                value: entity.note
            }
        );

        let columns = [
            {
                title: shipPlanBillLocale.shipOrder,
                key: 'shipOrder',
                width: 70,
                render: record => {
                    return (
                        <span>{record.shipOrder ? record.shipOrder : <Empty />}</span>
                    );
                }
            },
            {
                title: shipPlanBillLocale.shipPlanType,
                key: 'shipPlanType',
                dataIndex: 'shipPlanType',
                width: itemColWidth.priceColWidth,
                render: (text, record) => {
                    if (record.uuid)
                        return ShipPlanType[record.shipPlanType].caption;
                    else {
                        return (
                            <Select
                                style={{ width: '100%' }}
                                value={record.shipPlanType}
                                placeholder={placeholderLocale(shipPlanBillLocale.shipPlanType)}
                                onChange={e => this.onFieldChange(e, 'shipPlanType', record.line)}>
                                {
                                    this.getShipPlanTypeOptions()
                                }
                            </Select>
                        );
                    }
                }
            },
            {
                title: shipPlanBillLocale.fromOrg,
                key: 'fromOrg',
                dataIndex: 'fromOrg',
                width: itemColWidth.articleEditColWidth,
                render: (text, record) => {
                    if (record.uuid)
                        return loginOrg().type === 'DC' ? convertCodeName(record.fromOrg) : <a onClick={this.onViewDC.bind(true, record.fromOrg ? record.fromOrg.uuid : undefined)}
                        >{convertCodeName(record.fromOrg)}</a>;
                    else {
                        let value = undefined;
                        if (record.fromOrg) {
                            let orgInfo = {};
                            orgInfo.uuid = record.fromOrg.uuid;
                            orgInfo.code = record.fromOrg.code;
                            orgInfo.name = record.fromOrg.name;
                            orgInfo.type = this.getFromOrgType(record.shipPlanType);
                            value = JSON.stringify(orgInfo);
                        }
                        return (
                            <FromOrgSelect
                                value={value}
                                single
                                serialArchUuid={entity.serialArch ? entity.serialArch.uuid : null}
                                type={this.getFromOrgType(record.shipPlanType)}
                                onChange={e => this.onFieldChange(e, 'fromOrg', record.line)}
                            />
                        );
                    }
                }
            },
            {
                title: shipPlanBillLocale.toOrg,
                key: 'toOrg',
                dataIndex: 'toOrg',
                width: itemColWidth.articleEditColWidth,
                render: (text, record) => {
                    if (record.uuid)
                        // return <a onClick={this.onViewStore.bind(true, record.toOrg ? record.toOrg.uuid : undefined)}>
                        //     {convertCodeName(record.toOrg)}</a>;
                        return <span>{convertCodeName(record.toOrg)}</span>;
                    else {
                        let value = undefined;
                        if (record.toOrg) {
                            let orgInfo = {};
                            orgInfo.uuid = record.toOrg.uuid;
                            orgInfo.code = record.toOrg.code;
                            orgInfo.name = record.toOrg.name;
                            orgInfo.type = this.getToOrgType(record.shipPlanType);
                            value = JSON.stringify(orgInfo);
                        }
                        return (
                            <ToOrgSelect
                                value={value}
                                single
                                serialArchUuid={entity.serialArch ? entity.serialArch.uuid : null}
                                fromOrgUuid={record.fromOrg ? record.fromOrg.uuid : null}
                                type={this.getToOrgType(record.shipPlanType)}
                                onChange={e => this.onFieldChange(e, 'toOrg', record.line)}
                            />
                        );
                    }
                }
            },
            {
                title: shipPlanBillLocale.serialArchLine,
                key: 'serialArchLine',
                width: colWidth.codeNameColWidth,
                render: record => {
                    return (
                        <span>{record.serialArchLine ? convertCodeName(record.serialArchLine) : <Empty />}</span>
                    );
                }
            },
            {
                title: shipPlanBillLocale.dockGroupStr,
                dataIndex: 'dockGroupStr',
                width: colWidth.codeNameColWidth,
                render: text => text ? <EllipsisCol colValue={text} /> : <Empty />
            },
            {
                title: commonLocale.noteLocale,
                dataIndex: 'note',
                render: text => text ? <EllipsisCol colValue={text} /> : <Empty />,
                width: itemColWidth.noteEditColWidth
            }
        ]


        let isRemove = (orgType.carrier.name != loginOrg().type) && entity.state === State.SAVED.name;
        let isAdd = (orgType.carrier.name != loginOrg().type) && (entity.state != State.ABORTED.name
            && entity.state != State.FINISHED.name);

        return (
            <TabPane key="basicInfo" tab={commonLocale.billInfoLocale}>
              <ViewTabPanel style={{marginTop: '-22px'}}>
              <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()}/>
                <ViewPanel title={shipPlanBillLocale.billItems}>
                    <ShipPlanBillItemTable
                        columns={columns}
                        validItems={this.validItems}
                        onRefreshItems={this.onRefreshItems}
                        isRemove={isRemove}
                        isAdd={isAdd}
                    />
                </ViewPanel>
                <div>
                    <ConfirmModal
                        visible={this.state.modalVisible}
                        operate={this.state.operate}
                        object={shipPlanBillLocale.title + ':' + this.state.entity.billNumber}
                        onOk={this.handleOk}
                        onCancel={this.handleModalVisible}
                    />
                </div>
              </ViewTabPanel>
            </TabPane>
        );
    }

    /**
    * 绘制Tab页
    */
    drawTabPanes = () => {
        let tabPanes = [
            this.drawBillInfoTab(),
        ];
        return tabPanes;
    }

  darwProcess = () => {
    return <a onClick={() => this.viewProcessView()}>流程进度</a>;
  };

  viewProcessView = () => {
    this.setState({
      showProcessView: !this.state.showProcessView
    });
  };

  drawOthers = () =>{
    const others = [];
    if(this.state.showProcessView){
      const  entity  = this.state.entity;
      let statisticProfile = entity.tmsStatisticProfile;
      const data = [{
        title:'开始排车时间',
        subTitle:entity.createInfo.time,
        current: entity.state !== '',
        description:[
          {
            label: commonLocale.inAllAmountLocale,
            value: statisticProfile.amount
          },
          {
            label: commonLocale.inTmsAllWeightLocale,
            value: Number(statisticProfile.weight / 1000).toFixed(4)
          },
          {
            label: commonLocale.inAllVolumeLocale,
            value: statisticProfile.volume
          }
        ]
      },{
        title:'开始装车时间',
        subTitle:entity.beginShipTime,
        current: entity.state == State.SHIPPROGRESS.name,
        description: []
      },
        {
          title:'完成装车时间',
          subTitle:entity.finishShipTime,
          current: entity.state == State.FINISHED.name,
          description: []
        },
      ];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
