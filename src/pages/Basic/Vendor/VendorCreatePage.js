import { connect } from 'dva';
import CreatePage from '@/pages/Component/Page/CreatePage';
import { loginCompany, getDefOwner } from '@/utils/LoginContext';
import Address from '@/pages/Component/Form/Address';
import { Form, Select, Input, message, Col } from 'antd';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { sourceWay } from '@/utils/SourceWay';
import { ARV_TYPE } from './Constants';
import {
  commonLocale,
  notNullLocale,
  tooLongLocale,
  placeholderLocale,
  placeholderChooseLocale
} from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { vendorLocale } from './VendorLocale';
import { codePattern } from '@/utils/PatternContants';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import { PRETYPE } from '@/utils/constants';

@connect(({ vendor, pretype, loading }) => ({
  vendor,
  pretype,
  loading: loading.models.vendor,
}))
@Form.create()
export default class VendorCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      unLoaderNames: '',
      title: commonLocale.createLocale + vendorLocale.title,
      entity: {
        companyUuid: loginCompany().uuid,
        sourceWay: sourceWay.CREATE.name,
        owner: getDefOwner(),
      },
      spinning: false,
    }
  }

  componentDidMount() {
    this.refresh();
    this.fetchvendorUnLoaderByCompanyUuid();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.vendor.entity && this.props.vendor.entityUuid) {
      this.setState({
        entity: nextProps.vendor.entity,
        title: convertCodeName(nextProps.vendor.entity)
      });
    }
    const preType = nextProps.pretype;
    if (preType.queryType === PRETYPE['vendorUnLoader'] && preType.names) {
      var unLoaderNames = [...preType.names];
      this.setState({
        unLoaderNames: unLoaderNames
      })
    }
  }

  /**
   * 刷新
   */
  refresh = () => {
    if (this.props.vendor.entityUuid) {
      this.props.dispatch({
        type: 'vendor/get',
        payload: this.props.vendor.entityUuid
      });
    }
  }
  /** 
   *  通过企业uuid获取门店类型信息
   */
  fetchvendorUnLoaderByCompanyUuid = () => {
    const {
      dispatch
    } = this.props;
    dispatch({
      type: 'pretype/queryType',
      payload: PRETYPE['vendorUnLoader']
    });
  };

  onSave = (value) => {
    const { entity } = this.state;
    let data = {
      ...this.state.entity,
      ...value
    };
    if (!data.code) {
      data.code = entity.code;
    }
    data.ownerCode = JSON.parse(data.owner).code;
    delete data['owner'];
    if (!data.address.country || !data.address.province) {
      message.error("地址不能为空");
    } else if (!data.address.street) {
      message.error("详细地址不能为空");
    } else {
      if (!data.uuid) {
        this.props.dispatch({
          type: 'vendor/onSave',
          payload: data,
          callback: (response) => {
            if (response && response.success) {
              message.success(commonLocale.saveSuccessLocale);
            }
          }
        });
      } else {
        this.props.dispatch({
          type: 'vendor/onModify',
          payload: data,
          callback: (response) => {
            if (response && response.success) {
              message.success(commonLocale.modifySuccessLocale);
            }
          }
        });
      }
    }

  }

  onSaveAndCreate = (value) => {
    const { entity } = this.state;
    let data = {
      ...this.state.entity,
      ...value
    };
    if (!data.code) {
      data.code = entity.code;
    }
    data.ownerCode = JSON.parse(data.owner).code;
    delete data['owner'];
    if (!data.address.country || !data.address.province) {
      message.error("地址不能为空");
    } else if (!data.address.street) {
      message.error("详细地址不能为空");
    } else {
      this.props.dispatch({
        type: 'vendor/onSaveAndCreate',
        payload: data,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
            this.props.form.resetFields();
          }
        }
      });
    }
  }

  onCancel = () => {
    this.props.dispatch({
      type: 'vendor/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  drawFormItems = () => {
    return (
      <FormPanel key="basicInfo" noteLabelSpan={4} title={commonLocale.basicInfoLocale} cols={this.drawBasicInfoCols()} noteCol={this.drawNotePanel()} />
    );
  }

  drawBasicInfoCols = () => {
    const { form } = this.props;
    const { entity, defOwner, unLoaderNames } = this.state;
    let unLoaderNamesItems = [];
    if (unLoaderNames) {
      unLoaderNames.map((result) => unLoaderNamesItems.push(<Option key={`${result}`}>{`${result}`}</Option>));
    }

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
              pattern: codePattern.pattern,
              message: codePattern.message,
            },
          ]
        })(<Input placeholder={placeholderLocale(commonLocale.codeLocale)} />)}
      </CFormItem>;
    }
    let basicInfoCols = [];
    basicInfoCols.push(
      codeItem
    );
    basicInfoCols.push(
      <CFormItem key='name' label={commonLocale.nameLocale}>
        {form.getFieldDecorator('name', {
          rules: [
            { required: true, message: notNullLocale(commonLocale.nameLocale) },
            {
              max: 30,
              message: tooLongLocale(commonLocale.nameLocale, 30),
            },
          ],
          initialValue: entity.name,
        })(<Input placeholder={placeholderLocale(commonLocale.nameLocale)} />)}
      </CFormItem>
    );
    basicInfoCols.push(
      <CFormItem key='shortName' label={commonLocale.shortNameLocale}>
        {form.getFieldDecorator('shortName', {
          rules: [{
            max: 30, message: tooLongLocale(commonLocale.shortNameLocale, 30),
          }],
          initialValue: entity.shortName,
        })(<Input placeholder={placeholderLocale(commonLocale.shortNameLocale)} />)}
      </CFormItem>
    );
    basicInfoCols.push(
      <CFormItem key='owner' label={vendorLocale.owner}>
        {form.getFieldDecorator('owner', {
          rules: [{ required: true, message: notNullLocale(vendorLocale.owner) }],
          initialValue: entity.owner ? JSON.stringify(entity.owner) : undefined,
        })(<OwnerSelect onlyOnline placeholder={placeholderChooseLocale(vendorLocale.title)} />)}
      </CFormItem>
    );
    basicInfoCols.push(
      <CFormItem key='contactor' label={commonLocale.contactorLocale}>
        {form.getFieldDecorator('contactor', {
          rules: [{ required: true, message: notNullLocale(commonLocale.contactorLocale) }, {
            max: 30, message: tooLongLocale(commonLocale.contactorLocale, 30),
          }],
          initialValue: entity.contactor,
        })(<Input placeholder={placeholderLocale(commonLocale.contactorLocale)} />)}
      </CFormItem>
    );
    basicInfoCols.push(
      <CFormItem key='contactPhone' label={commonLocale.contactPhoneLocale}>
        {form.getFieldDecorator('contactPhone', {
          rules: [
            { required: true, message: notNullLocale(commonLocale.contactPhoneLocale) },
            { max: 30, message: tooLongLocale(commonLocale.contactorLocale, 30) },
          ],
          initialValue: entity.contactPhone,
        })(<Input placeholder={placeholderLocale(commonLocale.contactPhoneLocale)} />)}
      </CFormItem>
    );
    basicInfoCols.push(
      <CFormItem key='address' label={commonLocale.addressLocale}>
        {form.getFieldDecorator('address', {
          initialValue: entity.address,
          rules: [
            { required: true, message: notNullLocale(commonLocale.addressLocale) },
          ]
        })(<Address />)}
      </CFormItem>
    );

    basicInfoCols.push(
      <CFormItem key='zipCode' label={commonLocale.zipCodeLocale}>
        {form.getFieldDecorator('zipCode', {
          rules: [
            { pattern: vendorLocale.zipCodePattern, message: vendorLocale.zipCodePatternMessage },
          ],
          initialValue: entity.zipCode,
        })(<Input placeholder={placeholderLocale(commonLocale.zipCodeLocale)} />)}
      </CFormItem>
    );

    basicInfoCols.push(
      <CFormItem key='unLoader' label={vendorLocale.unLoader}>
        {
          form.getFieldDecorator('unLoader', {
            rules: [
              { required: true, message: notNullLocale(vendorLocale.unLoader) },
            ],
            initialValue: entity.unLoader,
          })(
            <Select
              showSearch
              placeholder={placeholderChooseLocale(vendorLocale.unLoader)}
              style={{ width: '100%' }}
            >
              {unLoaderNamesItems}
            </Select >
          )
        }
      </CFormItem>
    );

    basicInfoCols.push(
      <CFormItem key='arvType' label={vendorLocale.arvType}>
        {form.getFieldDecorator('arvType', {
          initialValue: entity.arvType,
          rules: [
            { required: true, message: notNullLocale(vendorLocale.arvType) },
          ]
        })( <Select
          placeholder={placeholderChooseLocale(vendorLocale.arvType)}
          style={{ width: '100%' }}
        >
          <Option value='VENDOR'>{ARV_TYPE['VENDOR']}</Option>
          <Option value='SELF'>{ARV_TYPE['SELF']}</Option>
        </Select>)}
      </CFormItem>,
    );

    basicInfoCols.push(
      <CFormItem key='homeUrl' label={commonLocale.homeUrlLocale}>
        {form.getFieldDecorator('homeUrl', {
          initialValue: entity.homeUrl,
          rules: [
            {
              max: 30,
              message: tooLongLocale(commonLocale.homeUrlLocale, 30),
            },
          ],
        })(<Input placeholder={placeholderLocale(commonLocale.homeUrlLocale)} />)}
      </CFormItem>
    );

    basicInfoCols.push(
      <CFormItem key='custom1' label={commonLocale.custom1Locale}>
        {form.getFieldDecorator('custom1', {
          initialValue: entity.custom1,
          rules: [
            {
              max: 30,
              message: tooLongLocale(commonLocale.custom1Locale, 30),
            },
          ],
        })(<Input placeholder={placeholderLocale(commonLocale.custom1Locale)} />)}
      </CFormItem>
    );
    return basicInfoCols;
  }
}
