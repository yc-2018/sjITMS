import { connect } from 'dva';
import { Form, Input, Select, InputNumber, message, Radio } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import DockGroupSelect from '@/pages/Component/Select/DockGroupSelect';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import { convertCodeName } from '@/utils/utils';
import { dockLocale } from './DockLocale';
import { domainToASCII } from 'url';
import { formatMessage } from 'umi/locale';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
const RadioGroup = Radio.Group;
const Option = Select.Option;
@connect(({ dock, loading }) => ({
  dock,
  loading: loading.models.dock,
}))
@Form.create()
export default class DockCreatePage extends CreatePage {
  constructor(props) {
    super(props);
    this.state = {//设置初始值
      title: commonLocale.createLocale + dockLocale.title,
      currentView: CONFIRM_LEAVE_ACTION.NEW,
      entity: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      },
      spinning: false,
      index: 0,
      changeDockGroup: false,
      ucnDockGroup: {}
    }
  }
  componentDidMount() {
    this.refresh();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.dock.data.entity && this.props.dock.entityUuid) {
      this.setState({
        entity: nextProps.dock.data.entity,
        title: convertCodeName(nextProps.dock.data.entity)
      });
    }
  }
  refresh = () => {
    let entityUuid = this.props.dock.entityUuid;
    if (entityUuid) {
      this.setState({
        currentView: CONFIRM_LEAVE_ACTION.EDIT
      })
      this.props.dispatch({
        type: 'dock/get',
        payload: entityUuid,
        callback: (response) => {
          if (response && response.success && response.data) {
           this.setState({
             entity:{ ...response.data },
             title: convertCodeName(response.data)
           })
          }
        },
      });
    }
  }
  dockGroupChange = (ucnValue) => {
    this.setState({
      ucnDockGroup: ucnValue,
      changeDockGroup: true
    })
  }
  formValueToEntity = () => {
    const { entity, index, changeDockGroup, ucnDockGroup } = this.state;
    const data = this.props.form.getFieldsValue();
    const currentValue = {
      ...entity
    };
    currentValue.code = data.code;
    currentValue.name = data.name;
    currentValue.note = data.note;
    currentValue.usages = data.usages;
    currentValue.dockGroup = changeDockGroup ? (ucnDockGroup ? JSON.parse(ucnDockGroup) : null) : entity.dockGroup
    return currentValue;
  }
  onCancel = () => {
    const payload = {
      showPage: 'query'
    }
    this.props.dispatch({
      type: 'dock/showPage',
      payload: {
        ...payload
      }
    });
  }
  drawBasicInfoCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;
    return [
      <CFormItem key='code' label={commonLocale.codeLocale}>
        {getFieldDecorator('code', {
          initialValue: entity.code,
          rules: [
            { required: true, message: notNullLocale(commonLocale.codeLocale) },
            {
              pattern: codePattern.pattern,
              message: codePattern.message,
            },
          ]
        })(<Input disabled={entity.code ? true : false} placeholder={placeholderLocale(commonLocale.codeLocale)} />)}
      </CFormItem>,
      <CFormItem key='name' label={commonLocale.nameLocale}>
        {getFieldDecorator('name', {
          initialValue: entity.name,
          rules: [
            { required: true, message: notNullLocale(commonLocale.nameLocale) },
            {
              max: 30,
              message: tooLongLocale(commonLocale.nameLocale, 30),
            },
          ]
        })(<Input placeholder={placeholderLocale(commonLocale.nameLocale)} />)}
      </CFormItem>,
      <CFormItem key='usages' label={dockLocale.usages}>
        {getFieldDecorator('usages', {
          initialValue: entity.usages
        })(
          <Select mode="multiple" placeholder={placeholderChooseLocale(dockLocale.usages)}>
            <Option value="RECEIPT">{formatMessage({ id: 'dock.usage.receipt' })}</Option>
            <Option value="DELIVERY">{formatMessage({ id: 'dock.usage.delivery' })}</Option>
            <Option value="RETURNED">{formatMessage({ id: 'dock.usage.returned' })}</Option>
          </Select>
        )
        }
      </CFormItem>,
      <CFormItem key='dockGroup' label={dockLocale.dockGroup}>
        {getFieldDecorator('dockGroup', {
          initialValue: entity && entity.dockGroup ? convertCodeName(entity.dockGroup) : undefined,
        })(
          <DockGroupSelect
            placeholder={placeholderChooseLocale(dockLocale.dockGroup)}
            allowClear={true}
            onChange={this.dockGroupChange} />
        )
        }
      </CFormItem>
    ];
  }
  onSave = (data) => {
    this.onCreate(data, true)
  }
  onSaveAndCreate = (data) => {
    this.onCreate(data, false);
  }
  onCreate = (data, isGoDetail) => {
    const { entity } = this.state;
    const { form, dispatch } = this.props;
    let type = 'dock/add';
    if (entity.uuid) {
      type = 'dock/modify';
    }
    dispatch({
      type: type,
      payload: this.formValueToEntity(),
      callback: (response) => {
        if (response && response.success) {
          let uuid;
          if (entity.uuid) {
            message.success(commonLocale.modifySuccessLocale);
            uuid = entity.uuid;
          } else {
            message.success(commonLocale.saveSuccessLocale);
            uuid = response.data;
          }
          this.setState({
            entity: {
              companyUuid: loginCompany().uuid,
              dcUuid: loginOrg().uuid
            },
            index: 0
          });
          this.props.form.resetFields();
          if (isGoDetail) {
            this.onView(uuid);
          }
        }
      },
    });
  }
  onView = (uuid) => {
    this.props.dispatch({
      type: 'dock/showPage',
      payload: {
        showPage: 'view',
        entityUuid: uuid
      }
    });
  }
  drawFormItems = () => {
    const { entity } = this.state;
    let panels = [
      <FormPanel key="basicInfo" title={commonLocale.basicInfoLocale} noteLabelSpan={4} cols={this.drawBasicInfoCols()} noteCol={this.drawNotePanel()}/>,
    ];
    return panels;
  }
}
