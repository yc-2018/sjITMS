import { connect } from 'dva';
import { Form, Input, Select, InputNumber, message, Radio } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import { convertCodeName } from '@/utils/utils';
import { containerTypeLocale } from './ContainerTypeLocale';
import { domainToASCII } from 'url';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';

const RadioGroup = Radio.Group;
const Option = Select.Option;

@connect(({ containerType, loading }) => ({
  containerType,
  loading: loading.models.containerType,
}))
@Form.create()
export default class ContainerTypeCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {//设置初始值
      title: commonLocale.createLocale + containerTypeLocale.title,
      currentView: CONFIRM_LEAVE_ACTION.NEW,
      entity: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      },
      spinning: false,
      index: 0
    }
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.containerType.entity && this.props.containerType.entityUuid && this.state.entity.uuid != nextProps.containerType.entity.uuid) {

      this.setState({
        entity: nextProps.containerType.entity,
        title: convertCodeName(nextProps.containerType.entity)
      });
    }
  }

  refresh = () => {
    let entityUuid = this.props.containerType.entityUuid;
    if (entityUuid) {
      this.setState({
        currentView: CONFIRM_LEAVE_ACTION.EDIT
      })
      this.props.dispatch({
        type: 'containerType/get',
        payload: entityUuid
      });
    }
  }

  formValueToEntity = () => {
    const { entity, index } = this.state;
    const data = this.props.form.getFieldsValue();

    const currentValue = {
      ...entity
    };
    currentValue.code = data.code;
    currentValue.name = data.name;
    currentValue.name = data.name;
    currentValue.barCodePrefix = data.barCodePrefix;
    currentValue.barCodeLength = data.barCodeLength;
    currentValue.barcodeType = data.barcodeType;
    currentValue.shipFlage = data.shipFlage;
    currentValue.collect = data.collect;
    currentValue.recycleType = data.recycleType;
    currentValue.inLength = data.inLength;
    currentValue.inWidth = data.inWidth;
    currentValue.inHeight = data.inHeight;
    currentValue.outLength = data.outLength;
    currentValue.outWidth = data.outWidth;
    currentValue.outHeight = data.outHeight;
    currentValue.weight = data.weight;
    currentValue.bearingWeight = data.bearingWeight;
    currentValue.plotRatio = data.plotRatio;
    currentValue.note = data.note;

    return currentValue;
  }

  onCancel = () => {
    const payload = {
      showPage: 'query'
    }
    this.props.dispatch({
      type: 'containerType/showPage',
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
        })(<Input disabled={entity.uuid ? true : false} placeholder={placeholderLocale(commonLocale.codeLocale)} />)}
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

      <CFormItem key='barCodePrefix' label={containerTypeLocale.barCodePrefix}>
        {getFieldDecorator('barCodePrefix', {
          initialValue: entity.barCodePrefix,
          rules: [
            { required: true, message: notNullLocale(containerTypeLocale.barCodePrefix) },
            {
              pattern: /^[A-Z]{1,2}$/,
              message: containerTypeLocale.barCodePrefixRuleMessage,
            },
          ]
        })(<Input disabled={entity.uuid ? true : false} placeholder={placeholderLocale(containerTypeLocale.barCodePrefix)} />)}
      </CFormItem>,

      <CFormItem key='barcodeType' label={containerTypeLocale.barcodeType}>
        {getFieldDecorator('barcodeType', {
          initialValue: entity.barcodeType ? entity.barcodeType : 'FOREVER',
          rules: [
            { required: true, message: notNullLocale(containerTypeLocale.barcodeType) },
          ]
        })(
          <RadioGroup value={this.state.value}>
            <Radio value={'ONCE'}>一次性</Radio>
            <Radio value={'FOREVER'}>永久</Radio>
          </RadioGroup>
        )
        }
      </CFormItem>,

      <CFormItem key='barCodeLength' label={containerTypeLocale.barCodeLength}>
        {getFieldDecorator('barCodeLength', {
          initialValue: entity.barCodeLength,
          rules: [
            { required: true, message: notNullLocale(containerTypeLocale.barCodeLength) },
          ]
        })(<InputNumber style={{ width: '100%' }} max={10} min={7} placeholder={containerTypeLocale.barCodeLengthRule} />)}
      </CFormItem>,

      <CFormItem key='recycleType' label={containerTypeLocale.recycleType}>
        {getFieldDecorator('recycleType', {
          initialValue: entity.recycleType ? entity.recycleType : 'ByQty',
          rules: [
            { required: true, message: notNullLocale(containerTypeLocale.recycleType) },
          ]
        })(
          <RadioGroup  >
            <Radio value={'ByQty'}>按数量</Radio>
            <Radio value={'ByBarcode'}>按条码</Radio>
          </RadioGroup>
        )
        }
      </CFormItem>,

      <CFormItem key='shipFlage' label={containerTypeLocale.shipFlage}>
        {getFieldDecorator('shipFlage', {
          initialValue: entity.shipFlage
        })(
          <Select placeholder={placeholderChooseLocale(containerTypeLocale.shipFlage)}>
            <Option value={true}>是</Option>
            <Option value={false}>否</Option>
          </Select>
        )
        }
      </CFormItem>,

      <CFormItem key='collect' label={containerTypeLocale.collect}>
      {getFieldDecorator('collect', {
        initialValue: entity.collect
      })(
        <Select placeholder={placeholderChooseLocale(containerTypeLocale.collect)}>
          <Option value={true}>是</Option>
          <Option value={false}>否</Option>
        </Select>
      )
      }
      </CFormItem>
    ];
  }

  drawQpcInfoCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;
    return [
      <CFormItem key='inLength' label={containerTypeLocale.inLength}>
        {getFieldDecorator('inLength', {
          initialValue: entity.inLength,
          rules: [
            { required: true, message: notNullLocale(containerTypeLocale.inLength) },
          ]
        })(<InputNumber style={{ width: '100%' }} min={0} max={999999} placeholder={placeholderLocale(containerTypeLocale.inLength)} />)}
      </CFormItem>,

      <CFormItem key='outLength' label={containerTypeLocale.outLength}>
        {getFieldDecorator('outLength', {
          initialValue: entity.outLength,
          rules: [
            { required: true, message: notNullLocale(containerTypeLocale.outLength) },
          ]
        })(<InputNumber style={{ width: '100%' }} min={0} max={999999} placeholder={placeholderLocale(containerTypeLocale.outLength)} />)}
      </CFormItem>,

      <CFormItem key='inWidth' label={containerTypeLocale.inWidth}>
        {getFieldDecorator('inWidth', {
          initialValue: entity.inWidth,
          rules: [
            { required: true, message: notNullLocale(containerTypeLocale.inWidth) },
          ]
        })(<InputNumber style={{ width: '100%' }} min={0} max={999999} placeholder={placeholderLocale(containerTypeLocale.inWidth)} />)}
      </CFormItem>,

      <CFormItem key='outWidth' label={containerTypeLocale.outWidth}>
        {getFieldDecorator('outWidth', {
          initialValue: entity.outWidth,
          rules: [
            { required: true, message: notNullLocale(containerTypeLocale.outWidth) },
          ]
        })(<InputNumber style={{ width: '100%' }} min={0} max={999999} placeholder={placeholderLocale(containerTypeLocale.outWidth)} />)}
      </CFormItem>,

      <CFormItem key='inHeight' label={containerTypeLocale.inHeight}>
        {getFieldDecorator('inHeight', {
          initialValue: entity.inHeight,
          rules: [
            { required: true, message: notNullLocale(containerTypeLocale.inHeight) },
          ]
        })(<InputNumber style={{ width: '100%' }} min={0} max={999999} placeholder={placeholderLocale(containerTypeLocale.inHeight)} />)}
      </CFormItem>,


      <CFormItem key='outHeight' label={containerTypeLocale.outHeight}>
        {getFieldDecorator('outHeight', {
          initialValue: entity.outHeight,
          rules: [
            { required: true, message: notNullLocale(containerTypeLocale.outHeight) },
          ]
        })(<InputNumber style={{ width: '100%' }} min={0} max={999999} placeholder={placeholderLocale(containerTypeLocale.outHeight)} />)}
      </CFormItem>,

      <CFormItem key='weight' label={containerTypeLocale.weight}>
        {getFieldDecorator('weight', {
          initialValue: entity.weight,
          rules: [
            { required: true, message: notNullLocale(containerTypeLocale.weight) },
          ]
        })(<InputNumber style={{ width: '100%' }} min={0} max={999999999} placeholder={placeholderLocale(containerTypeLocale.weight)} />)}
      </CFormItem>,

      <CFormItem key='bearingWeight' label={containerTypeLocale.bearingWeight}>
        {getFieldDecorator('bearingWeight', {
          initialValue: entity.bearingWeight,
          rules: [
            { required: true, message: notNullLocale(containerTypeLocale.bearingWeight) },
          ]
        })(<InputNumber style={{ width: '100%' }} min={0} max={999999999} placeholder={placeholderLocale(containerTypeLocale.bearingWeight)} />)}
      </CFormItem>,


      <CFormItem key='plotRatio' label={containerTypeLocale.plotRatio}>
        {getFieldDecorator('plotRatio', {
          initialValue: entity.plotRatio,
          rules: [
            { required: true, message: notNullLocale(containerTypeLocale.plotRatio) },
          ]
        })(<InputNumber style={{ width: '100%' }} min={0} max={100} placeholder={placeholderLocale(containerTypeLocale.plotRatio)} />)}
      </CFormItem>,

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

    let type = 'containerType/add';
    if (entity.uuid) {
      type = 'containerType/modify';
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
      type: 'containerType/showPage',
      payload: {
        showPage: 'view',
        entityUuid: uuid
      }
    });
  }

  drawFormItems = () => {

    const { entity } = this.state;
    let panels = [
      <FormPanel key="basicInfo" noteLabelSpan={4} title={commonLocale.basicInfoLocale} cols={this.drawBasicInfoCols()} noteCol={this.drawNotePanel()}/>,
      <FormPanel key="qpcInfo" title={containerTypeLocale.qpcInfoLocale} firstColNarrow={true} cols={this.drawQpcInfoCols()} />
    ];

    return panels;
  }

}
