import { connect } from 'dva';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import Address from '@/pages/Component/Form/Address';
import { Form, Select, Input, InputNumber, message, Col } from 'antd';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { dCLocale } from './DCLocale';
import { sourceWay } from '@/utils/SourceWay';
import { loginCompany } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { codePattern_4 } from '@/utils/PatternContants';
import { MAX_DECIMAL_VALUE } from '@/utils/constants';

@connect(({ dc, loading }) => ({
  dc,
  loading: loading.models.dc,
}))
@Form.create()
export default class DCCreatePage extends CreatePage {

  constructor(props) {
    super(props);

    this.state = {
      title: commonLocale.createLocale + dCLocale.title,
      entity: {
        useWMS: true,
        sourceWay: sourceWay.CREATE.name,
        operatingArea: 0,
        companyUuid: loginCompany().uuid
      }
    }
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dc.entity && this.props.dc.entityUuid) {
      this.setState({
        entity: nextProps.dc.entity,
        title: convertCodeName(nextProps.dc.entity)
      });
    }
  }

  refresh = () => {
    this.props.dispatch({
      type: 'dc/get',
      payload: {
        uuid: this.props.dc.entityUuid
      }
    });
  }

  onCancel = () => {
    this.props.dispatch({
      type: 'dc/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  onSave = (data) => {
    const { entity } = this.state;
    let dc = {
      ...this.state.entity,
      ...data
    };
    if (!dc.code) {
      dc.code = entity.code;
    }

    if (!dc.sourceCode) {
      dc.sourceCode = dc.code;
    }

    if (!dc.address.country || !dc.address.province) {
      message.error("地址不能为空");
    } else if (!dc.address.street) {
      message.error("详细地址不能为空");
    } else {
      if (!dc.uuid) {
        this.props.dispatch({
          type: 'dc/onSave',
          payload: dc,
          callback: (response) => {
            if (response && response.success) {
              message.success(commonLocale.saveSuccessLocale);
            }
          }
        });
      } else {
        this.props.dispatch({
          type: 'dc/onModify',
          payload: dc,
          callback: (response) => {
            if (response && response.success) {
              message.success(commonLocale.modifySuccessLocale);
            }
          }
        });
      }
    }

  }

  onSaveAndCreate = (data) => {
    const { entity } = this.state;
    let dc = {
      ...this.state.entity,
      ...data
    };
    if (!dc.code) {
      dc.code = entity.code;
    }

    if (!dc.sourceCode) {
      dc.sourceCode = dc.code;
    }

    if (!dc.address.country || !dc.address.province) {
      message.error("地址不能为空");
    } else if (!dc.address.street) {
      message.error("详细地址不能为空");
    } else {
      this.props.dispatch({
        type: 'dc/onSaveAndCreate',
        payload: dc,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
            this.props.form.resetFields();
          }
        }
      });
    }
  }

  drawFormItems = () => {
    const { form } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;
    let codeItem = null;
    if (entity.code) {
      codeItem = <CFormItem key="code" label={commonLocale.codeLocale}>
        {form.getFieldDecorator('code')(
          <Col>{entity.code ? entity.code : '空'}</Col>
        )}
      </CFormItem>;
    } else {
      codeItem = <CFormItem key="code" label={commonLocale.codeLocale}>
        {form.getFieldDecorator('code', {
          initialValue: entity.code,
          rules: [
            { required: true, message: notNullLocale(commonLocale.codeLocale) },
            {
              pattern: codePattern_4.pattern,
              message: codePattern_4.message,
            },
          ]
        })(<Input placeholder={placeholderLocale(commonLocale.codeLocale)} />)}
      </CFormItem>;
    }
    let cols = [
      codeItem,
      <CFormItem label={commonLocale.nameLocale} key='name'>
        {getFieldDecorator('name', {
          initialValue: entity.name,
          rules: [
            { required: true, message: notNullLocale(commonLocale.nameLocale) },
            {
              max: 30,
              message: tooLongLocale(commonLocale.nameLocale, 30),
            },
          ],
        })(<Input placeholder={placeholderLocale(commonLocale.nameLocale)} />)}
      </CFormItem>,
      <CFormItem label={dCLocale.sourceCode} key='sourceCode'>
        {getFieldDecorator('sourceCode', {
          initialValue: entity.sourceCode,
          rules: [
            {
              max: 30,
              message: tooLongLocale(dCLocale.sourceCode, 30),
            },
          ],
        })(<Input placeholder={placeholderLocale(dCLocale.sourceCode)} />)}
      </CFormItem>,
      <CFormItem label={commonLocale.shortNameLocale} key='shortName'>
        {getFieldDecorator('shortName', {
          initialValue: entity.shortName,
          rules: [
            {
              max: 30,
              message: tooLongLocale(commonLocale.shortNameLocale, 30),
            },
          ],
        })(<Input placeholder={placeholderLocale(commonLocale.shortNameLocale)} />)}
      </CFormItem>,
      <CFormItem label={commonLocale.contactorLocale} key='contactor'>
        {getFieldDecorator('contactor', {
          initialValue: entity.contactor,
          rules: [
            { required: true, message: notNullLocale(commonLocale.contactorLocale) },
            {
              max: 30,
              message: tooLongLocale(commonLocale.contactorLocale, 30),
            },
          ],
        })(<Input placeholder={placeholderLocale(commonLocale.contactorLocale)} />)}
      </CFormItem>,
      <CFormItem label={commonLocale.contactPhoneLocale} key='contactPhone'>
        {getFieldDecorator('contactPhone', {
          initialValue: entity.contactPhone,
          rules: [
            { required: true, message: notNullLocale(commonLocale.contactPhoneLocale) },
            { max: 30, message: tooLongLocale(commonLocale.contactorLocale, 30) }
          ],
        })(<Input placeholder={placeholderLocale(commonLocale.contactPhoneLocale)} />)}
      </CFormItem>,
      <CFormItem label={commonLocale.addressLocale} key='address'>
        {getFieldDecorator('address', {
          initialValue: entity.address,
          rules: [
            { required: true, message: notNullLocale(commonLocale.addressLocale) },
          ]
        })(<Address />)}
      </CFormItem>,
      <CFormItem label={dCLocale.useWMSLocale} key='useWMS'>
        {getFieldDecorator('useWMS', {
          initialValue: entity.useWMS + '',
          rules: [
            { required: true },
          ],
        })(
          <Select>
            <Select.Option value="true" key="true">{dCLocale.yes}</Select.Option>
            <Select.Option value="false" key="false">{dCLocale.no}</Select.Option>
          </Select>
        )}
      </CFormItem>,
      <CFormItem label={commonLocale.operateAreaLocale + '(㎡)'} key='operatingArea'>
        {getFieldDecorator('operatingArea', {
          initialValue: entity.operatingArea,
        })(<InputNumber
          min={0}
          precision={4}
          max={MAX_DECIMAL_VALUE}
          style={{ width: '100%' }} placeholder={placeholderLocale(commonLocale.operateAreaLocale)} />)}
      </CFormItem>,
      <CFormItem label={commonLocale.zipCodeLocale} key='zipCode'>
        {getFieldDecorator('zipCode', {
          initialValue: entity.zipCode,
          rules: [
            { pattern: dCLocale.zipCodePattern, message: dCLocale.zipCodePatternMessage },
          ],
        })(<Input placeholder={placeholderLocale(commonLocale.zipCodeLocale)} />)}
      </CFormItem>,
      <CFormItem label={commonLocale.homeUrlLocale} key='homeUrl'>
        {getFieldDecorator('homeUrl', {
          initialValue: entity.homeUrl,
          rules: [
            {
              max: 30,
              message: tooLongLocale(commonLocale.homeUrlLocale, 30),
            },
          ],
        })(<Input placeholder={placeholderLocale(commonLocale.homeUrlLocale)} />)}
      </CFormItem>
    ];
    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={cols} noteCol={this.drawNotePanel()} noteLabelSpan={4}/>
    ];
  }
}
