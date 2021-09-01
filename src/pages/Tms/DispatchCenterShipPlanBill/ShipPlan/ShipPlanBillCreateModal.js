import { connect } from 'dva';
import { PureComponent } from "react";
import { Modal, Form, InputNumber, Select, message, Input } from "antd";
import FormPanel from "@/pages/Component/Form/FormPanel";
import CFormItem from "@/pages/Component/Form/CFormItem";
import { vehicleDispatchingLocale } from "./VehicleDispatchingLocale";
import { notNullLocale, placeholderLocale, commonLocale } from "@/utils/CommonLocale";
import { convertCodeName } from "@/utils/utils";
import VehicleSelect from '../Utils/VehicleSelect';
import Empty from '@/pages/Component/Form/Empty';
import { itemColWidth, colWidth } from '@/utils/ColWidth';
import UserSelect from './UserSelect';
import { MemberType, Type, State } from './ShipPlanBillDispatchContants';
import { getActiveKey, loginCompany, loginOrg } from '@/utils/LoginContext';
import ItemEditTable from '../Utils/ItemEditTable';
import UserSearchPage from './UserSearchPage';

@connect(({ vehicleDispatching, shipPlanBillDispatch, loading }) => ({
  vehicleDispatching, shipPlanBillDispatch,
  loading: loading.models.vehicleDispatching,
}))
@Form.create()

/**
 * @param {edit} :布尔值 true：强制允许编辑人员明细，false或不传保留原逻辑
 */

export default class ShipPlanBillCreateModal extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      visible: props.visible,
      addUserVisible: false,
      entityUuid: props.entityUuid,
      noShipGroup: props.noShipGroup,
      entity: {
        memberDetails: [],
        companyUuid: loginCompany().uuid,
        dispatchCenterUuid: loginOrg().uuid,
      },
      selectedRows: [],
      defSerialArch: {}
    }
  }

  componentDidMount() {
    this.refresh();
    this.getSerialArch();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible != undefined && this.props.visible != nextProps.visible) {
      this.setState({
        visible: nextProps.visible
      }, () => {
        if (nextProps.visible == true) {
          this.refresh(nextProps.entityUuid);
          this.getSerialArch();
        }
      })
    }

    if (nextProps.entityUuid && this.props.entityUuid != nextProps.entityUuid) {
      this.setState({
        entityUuid: nextProps.entityUuid
      }, () => {
        this.refresh(nextProps.entityUuid)
      })
    }

    if (nextProps.entityUuid == undefined && nextProps.entityUuid != this.props.entityUuid) {
      this.setState({
        entity: {
          memberDetails: []
        },
      })
    }
  }

  getSerialArch = () => {
    this.props.dispatch({
      type: 'dispatchSerialArch/getSerialArch',
      callback: response => {
        if (response && response.success) {
          this.setState({
            defSerialArch: response.data
          })
        }
      }
    })
  }

  refresh = (uuid) => {
    this.props.dispatch({
      type: 'shipPlanBillDispatch/getForCreate',
      payload: uuid ? uuid : this.props.entityUuid,
      callback: response => {
        if (response && response.success && response.data) {
          if (!response.data.memberDetails) {
            response.data.memberDetails = [];
          }
          this.setState({
            entity: response.data
          })
        }
      }
    });
  }

  onOk = (e) => {
    e.preventDefault();
    const { form } = this.props;
    const { entity, defSerialArch, noShipGroup } = this.state;
    if (!defSerialArch) {
      message.error('请先设置线路！');
      return;
    }
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      const data = {
        ...fieldsValue
      };
      if (data.serialArch) {
        data.serialArch = JSON.parse(data.serialArch)
      }
      if (data.vehicle) {
        data.vehicle = JSON.parse(data.vehicle)
      }

      let vehicleDispatching = {
        ...this.state.entity,
        ...data,
        shipGroupCode: noShipGroup,
        serialArch: {
          uuid: defSerialArch.uuid,
          code: defSerialArch.code,
          name: defSerialArch.name,
        },
        companyUuid: loginCompany().uuid,
        dispatchCenterUuid: loginOrg().uuid,
      };

      vehicleDispatching.fType = Type.Normal.name
      if (!vehicleDispatching.orderDetails) {
        vehicleDispatching.orderDetails = [];
      }


      if (!vehicleDispatching.memberDetails || vehicleDispatching.memberDetails.length === 0) {
        message.error('人员明细不能为空！');
        return;
      }

      for (let i = 0; i < vehicleDispatching.memberDetails.length; i++) {
        if (!vehicleDispatching.memberDetails[i].member) {
          message.error('第' + (i + 1) + '行人员不能为空');
          return;
        }
        if (!vehicleDispatching.memberDetails[i].memberType) {
          message.error('第' + (i + 1) + '行职能不能为空');
          return;
        }
      }
      let hasDriver = false;
      for (let i = 0; i < vehicleDispatching.memberDetails.length; i++) {
        if (vehicleDispatching.memberDetails[i].memberType === MemberType.DRIVER.name) {
          hasDriver = true;
          break;
        }
      }
      let hasStevedore = false;
      for (let i = 0; i < vehicleDispatching.memberDetails.length; i++) {
        if (vehicleDispatching.memberDetails[i].memberType === MemberType.STEVEDORE.name) {
          hasStevedore = true;
          break;
        }
      }

      if (hasDriver == false) {
        message.error('必须设置驾驶员');
        return;
      }
      if (hasStevedore == false) {
        message.error('必须设置装卸员');
        return;
      }

      let driverCount = 0;
      for (let i = 0; i < vehicleDispatching.memberDetails.length; i++) {
        if (vehicleDispatching.memberDetails[i].memberType === MemberType.DRIVER.name) {
          driverCount++;
        }
      }
      if (driverCount > 1) {
        message.error('驾驶员只能有一个');
        return;
      }


      for (let i = 0; i < vehicleDispatching.memberDetails.length; i++) {
        for (let j = i + 1; j < vehicleDispatching.memberDetails.length; j++) {
          if (vehicleDispatching.memberDetails[i].member.uuid === vehicleDispatching.memberDetails[j].member.uuid &&
            vehicleDispatching.memberDetails[i].memberType === vehicleDispatching.memberDetails[j].memberType) {
            message.error('第' + (i + 1) + '行与第' + (j + 1) + '行内容重复！');
            return;
          }
        }
      }


      let type = '';
      if (vehicleDispatching.uuid) {
        type = 'vehicleDispatching/onModifyShipPlan'
      } else {
        type = 'vehicleDispatching/onSaveShipPlan'
      }
      this.props.dispatch({
        type: type,
        payload: vehicleDispatching,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
            this.setState({
              visible: false,
              entity: {
                memberDetails: []
              },
              selectedRows: [],
            })
            if (!vehicleDispatching.uuid) {
              vehicleDispatching.uuid = response.data
            }
            this.props.onCancelModal();
            this.props.form.resetFields();
            if (this.props.onView) {
              this.props.onView(vehicleDispatching);
            }

          }
        }
      });
    });
  }

  onCancelModal = () => {
    this.setState({
      visible: false,
      entity: {
        memberDetails: []
      },
      selectedRows: [],
    });
    this.props.form.resetFields();
    this.props.onCancelModal();
  }

  onVehicleChange = (vehicleUcn, vehicleTypeUcn, carrierUcn, employees) => {
    const { entity } = this.state;
    entity.memberDetails.length = 0;
    let vehicle = JSON.parse(vehicleUcn);
    if (!entity.vehicle || (entity.vehicle.uuid != vehicleUcn.uuid)) {
      entity.vehicle = vehicle;
      entity.vehicleType = vehicleTypeUcn;
      entity.carrier = carrierUcn;
    }
    employees && employees.forEach((employe, index) => {
      entity.memberDetails && entity.memberDetails.push({
        line: index + 1,
        member: {
          uuid: employe.empUuid,
          code: employe.empCode,
          name: employe.empName,
        },
        memberType: employe.workType,
        isVehicle: true
      })
    })
    this.setState({
      entity: entity
    });
  }

  /**
   * 表格变化时
   * @param {*} e
   * @param {*} fieldName
   * @param {*} key
   */
  handleFieldChange(e, fieldName, line) {
    const { entity } = this.state;
    if (fieldName === 'member') {
      let member = {
        uuid: JSON.parse(e).uuid,
        code: JSON.parse(e).code,
        name: JSON.parse(e).name,
      }
      entity.memberDetails[line - 1].member = member;

    } else if (fieldName === 'memberType') {
      entity.memberDetails[line - 1].memberType = e;
    }
    this.setState({
      entity: { ...entity }
    });
  }

  getSelectedRows = (selectedRows) => {
    this.setState({
      selectedRows: selectedRows
    })
  }

  handlebatchAddVisible = (flag) => {
    this.setState({
      addUserVisible: flag
    })
  }

  onOKAddUser = () => {
    const { entity } = this.state;
    let list = this.userRef.getSelectRow();
    if (list && list.length == 0) {
      message.warning('请先选择行');
      return;
    }
    list.forEach((item, index) => {
      entity.memberDetails && entity.memberDetails.push({
        line: entity.memberDetails.length + 1,
        member: {
          uuid: item.userUuid,
          code: item.userCode,
          name: item.userName,
        },
        memberType: item.userPro,
      })
    })
    this.setState({
      entity: entity,
      addUserVisible: false
    }, () => {
      this.userRef.resetSelectRows()
    });
  }

  drawNotePanel = () => {
    const { form } = this.props;
    return <CFormItem key='note' label={commonLocale.noteLocale}>
      {
        form.getFieldDecorator('note', {
          initialValue: this.state.entity.note,
          rules: [
            {
              max: 255,
              message: '备注最大长度为255',
            },
          ],
        })(
          <Input.TextArea value={this.state.entity.note} placeholder='请输入备注'/>,
        )
      }
    </CFormItem>;
  };

  renderFormItem = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, defSerialArch } = this.state;
    let basicCols = [
      <CFormItem label={vehicleDispatchingLocale.serialArch} key='serialArch'>
        {getFieldDecorator('serialArch', {
          initialValue: entity.serialArch ? JSON.stringify(entity.serialArch) : undefined,
        })(
          <p>{defSerialArch ? defSerialArch.name : '请先设置线路'}</p>
        )}
      </CFormItem>,
      <CFormItem label={vehicleDispatchingLocale.vehicle} key='vehicle'>
        {getFieldDecorator('vehicle', {
          initialValue: entity.vehicle ? JSON.stringify(entity.vehicle) : undefined,
          rules: [
            { required: true, message: notNullLocale(vehicleDispatchingLocale.vehicle) }
          ],
        })(
          entity.stat && entity.stat == State.Approved.name ? <span>{entity.vehicle ? convertCodeName(entity.vehicle) : ''}</span> :
            <VehicleSelect
              extra={entity.vehicle}
              onChange={this.onVehicleChange}
              placeholder={vehicleDispatchingLocale.vehicle}
            />
        )}
      </CFormItem>,
      <CFormItem label={vehicleDispatchingLocale.vehicleType} key='vehicleType'>
        {getFieldDecorator('vehicleType', {
          initialValue: entity.vehicleType ? entity.vehicleType : undefined,
        })(
          entity.vehicleType ? <p>{convertCodeName(entity.vehicleType)}</p> : <Empty />
        )}
      </CFormItem>,
      <CFormItem label={vehicleDispatchingLocale.carrier} key='carrier'>
        {getFieldDecorator('carrier', {
          initialValue: entity.carrier ? entity.carrier : undefined,
        })(
          entity.carrier ? <p>{convertCodeName(entity.carrier)}</p> : <Empty />
        )}
      </CFormItem>,
      <CFormItem label={vehicleDispatchingLocale.order} key='order'>
        {getFieldDecorator('order', {
          initialValue: entity.order ? entity.order : 1,
        })(
          <InputNumber precision={0} style={{ width: '100%' }} min={1} placeholder={placeholderLocale(vehicleDispatchingLocale.order)} />
        )}
      </CFormItem>,
    ];

    let userCols = [
      {
        title: commonLocale.lineLocal,
        key: 'line',
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: vehicleDispatchingLocale.member,
        dataIndex: 'newScroll',
        width: colWidth.codeNameColWidth,
        render: (val, record) => {
          return record.isVehicle && !this.props.edit ? <p>{convertCodeName(val)}</p> : (
            entity.stat && entity.stat == State.Approved.name && !this.props.edit ? <p>{convertCodeName(val)}</p> : <UserSelect
              key={'newScroll' + record.line}
              value={record && record.member ? JSON.stringify(record.member) : undefined}
              single={true}
              onChange={e => this.handleFieldChange(e, 'member', record.line)}
              placeholder={placeholderLocale('人员')}
            />
          );
        }
      },
      {
        title: vehicleDispatchingLocale.memberType,
        dataIndex: 'memberType',
        width: colWidth.enumColWidth,
        render: (val, record) => {
          return record.isVehicle && !this.props.edit ? <p>{MemberType[val].caption}</p> : (
            entity.stat && entity.stat == State.Approved.name && !this.props.edit ? <p>{MemberType[val].caption}</p> : <Select
              style={{ width: '100%' }}
              value={record && record.memberType ? record.memberType : undefined}
              onChange={e => this.handleFieldChange(e, 'memberType', record.line)}
              placeholder={placeholderLocale(vehicleDispatchingLocale.memberType)}

            >
              <Select.Option value={MemberType.DRIVER.name}>{MemberType.DRIVER.caption}</Select.Option>
              <Select.Option value={MemberType.STEVEDORE.name}>{MemberType.STEVEDORE.caption}</Select.Option>
              <Select.Option value={MemberType.DEPUTYDRIVER.name}>{MemberType.DEPUTYDRIVER.caption}</Select.Option>
              <Select.Option value={MemberType.DELIVERYMAN.name}>{MemberType.DELIVERYMAN.caption}</Select.Option>
            </Select>
          )
        }
      },
    ];
    return <div>
      <FormPanel cols={basicCols} noteLabelSpan={4} noteCol={this.drawNotePanel()}/>
      <div style={{ paddingLeft: '2%', paddingRight: '2%' }}>
        <ItemEditTable
          title={vehicleDispatchingLocale.memberDetails}
          columns={userCols}
          notNote={true}
          batchAdd
          noAddandDelete={false}
          noRowSelection={false}
          data={this.state.entity.memberDetails ? this.state.entity.memberDetails : []}
          getSelectedRows={this.getSelectedRows}
          handlebatchAddVisible={() => this.handlebatchAddVisible(true)}
        />
      </div>

    </div>
  }

  render() {
    const { visible, entity, addUserVisible } = this.state;
    return (
      <div>
        <Modal
          visible={visible}
          title={entity.uuid ? entity.billNumber : '新建排车单'}
          width='70%'
          onCancel={this.onCancelModal}
          onOk={this.onOk}
        >
          {this.renderFormItem()}
        </Modal>
        <Modal
          visible={addUserVisible}
          width='50%'
          onCancel={() => this.handlebatchAddVisible(false)}
          onOk={this.onOKAddUser}
        >
          <UserSearchPage
            onRef={(ref) => { this.userRef = ref; }}
          />
        </Modal>
      </div>
    )
  }
}
