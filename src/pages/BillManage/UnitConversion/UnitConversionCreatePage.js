import CreatePage from '@/pages/Component/Page/CreatePage';
import { Form, Input, Select, InputNumber, message, Col } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import VendorSelect from '@/pages/Component/Select/VendorSelect';
import CategorySelect from '@/pages/Component/Select/CategorySelect';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import { loginCompany, getDefOwner } from '@/utils/LoginContext';
import { SOURCE_WAY, MAX_DECIMAL_VALUE, MAX_INTEGER_VALUE } from '@/utils/constants';
import { bool } from 'prop-types';
import { articleLocale } from '@/pages/Basic/Article/ArticleLocale';
import {
  commonLocale,
  notNullLocale,
  tooLongLocale,
  placeholderLocale,
  placeholderChooseLocale
} from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import { orgType } from '@/utils/OrgType';
import { basicState } from '@/utils/BasicState';
import { convertCodeName } from '@/utils/utils';
import { unitConversionLocal } from './UnitConversionLocal';
const Option = Select.Option;

@connect(({ unitConversion, loading }) => ({
  unitConversion,
  loading: loading.models.unitConversion,
}))
@Form.create()

export default class UnitConversionCreatePage extends CreatePage {
 
    constructor(props) {
    super(props);

    this.state = {
      title: '新建单位换算',
      entity: {
        companyUuid: loginCompany().uuid,
      }
    }
  }

  componentDidMount() {
    if(this.props.entityUuid){
      this.refresh();
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.unitConversion.entityUuid&&(this.props.entityUuid != nextProps.unitConversion.entityUuid)){
      this.refresh()
    }
    if (nextProps.unitConversion.entity && this.props.unitConversion.entityUuid && this.props.unitConversion.entity != nextProps.unitConversion.entity) {
      this.setState({
        entity: nextProps.unitConversion.entity,
        title: convertCodeName(nextProps.unitConversion.entity),
      });
    }
   
  }

  refresh = () => {
  
    this.props.dispatch({
      type: 'unitConversion/get',
      payload: {
        uuid: this.props.unitConversion.entityUuid
      }
    })
  }

  onSave = (data) => {
    this.onCreate(data, true);
  }

  onSaveAndCreate = (data) => {
    this.onCreate(data, false);
  }

  onCreate = (data, isGoDetail) => {
    const { form, dispatch } = this.props;
    const { entity } = this.state;
    data['companyUuid'] = loginCompany().uuid;
    if (!data.code) {
      data.code = entity.code;
    }
    let type = 'unitConversion/save';
    if (entity.uuid) {
      type = 'unitConversion/update';
      data['uuid'] = entity.uuid;
      data['version'] = entity.version;
    }
    

    // data['categoryCode'] = JSON.parse(data['category']).code;
    // data['ownerCode'] = JSON.parse(data['owner']).code;
    // if (data['defaultVendor']) {
    //   data['defaultVendorCode'] = JSON.parse(data['defaultVendor']).code;
    // }

    dispatch({
      type: type,
      payload: {
        ...entity,
        ...data
      },
      callback: response => {
        if (response && response.success) {
          let uuid;
          if (data.uuid) {
            message.success(commonLocale.modifySuccessLocale);
            uuid = entity.uuid;
          } else {
            message.success(commonLocale.saveSuccessLocale);
            uuid = response.data;
          }
          // 清空form
          form.resetFields();
          if (isGoDetail) {
            this.onView(uuid);
          }
        }
      },
    });
  }

  onView = (uuid) => {
    this.props.dispatch({
      type: 'unitConversion/showPage',
      payload: {
        showPage: 'query',
        entityUuid: uuid
      }
    });
  }

  onCancel = () => {
    this.props.dispatch({
      type: 'unitConversion/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  onFieldChange=(e,fieldName)=>{
        let {entity} = this.state;
        // if(fieldName != 'code'){
          entity[fieldName] = e;
        // }
      
        this.setState({
            entity:{...entity}
        })
  }

  drawBasicInfoCols = () => {
    const { form } = this.props;
    const { entity } = this.state;
    let codeItem = null;
    if (entity.uuid) {
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
        })(<Input maxLength={30} placeholder={placeholderLocale(commonLocale.codeLocale)} onChange={(e)=>this.onFieldChange(e.target.value,'code')}/>)}
      </CFormItem>;
    }
    let basicInfoCols = [
      codeItem,
      <CFormItem key='name' label={commonLocale.nameLocale}>
        {form.getFieldDecorator('name', {
          initialValue: entity ? entity.name : null,
          rules: [
            { required: true, message: notNullLocale(commonLocale.nameLocale) },
            {
              max: 50,
              message: tooLongLocale(commonLocale.nameLocale, 50),
            },
          ]
        })(<Input maxLength={30} placeholder={placeholderLocale(commonLocale.nameLocale)} onChange={(e)=>this.onFieldChange(e.target.value,'name')}/>)}
      </CFormItem>,
      <CFormItem key='sourceCode' label={unitConversionLocal.createForm_sourceCode}>
        {form.getFieldDecorator('sourceCode', {
          initialValue: entity ? entity.sourceCode : null,
          rules: [
            {
              max: 30,
              message: tooLongLocale(unitConversionLocal.createForm_sourceCode, 30),
            },
          ]
        })(<Select
            placeholder={placeholderChooseLocale(unitConversionLocal.createForm_sourceCode)}
            style={{ width: '100%' }}
            onChange={(e)=>this.onFieldChange(e,'sourceCode')}
          >
            <Option value={'VOLUMN'}>{'体积'}</Option>
            <Option value={'WEIGHT'}>{'重量'}</Option>
          </Select>)}
      </CFormItem>,
      <CFormItem key='targetCode' label={unitConversionLocal.createForm_targetCode}>
        {form.getFieldDecorator('targetCode', {
          initialValue: entity.targetCode ? entity.targetCode  : undefined,
          rules: [
            { required: false, message: notNullLocale(unitConversionLocal.createForm_targetCode) },
          ]
        })(<Select
            placeholder={placeholderChooseLocale(unitConversionLocal.createForm_targetCode)}
            style={{ width: '100%' }}
            onChange={(e)=>this.onFieldChange(e,'targetCode')}
          >
            <Option value={'VOLUMN'}>{'体积'}</Option>
            <Option value={'WEIGHT'}>{'重量'}</Option>
          </Select>)}
      </CFormItem>,
      <CFormItem key='conversionRatio' label={unitConversionLocal.createForm_conversionRate}>
      {form.getFieldDecorator('conversionRatio', {
        initialValue: entity.conversionRatio ? entity.conversionRatio : 0,
      })(
        <InputNumber
          min={0}
          precision={3}
          max={100}
          style={{ width: '100%' }}
          formatter={value => `${value}%`}
          parser={value => value.replace('%', '')}
          placeholder={placeholderLocale(unitConversionLocal.createForm_conversionRate)}
          onChange={(e)=>this.onFieldChange(e,'conversionRatio')}
        />
      )}
    </CFormItem>
    ];
    return basicInfoCols;
  }

  drawFormItems = () => {
    let panels = [
      <FormPanel key="basicInfo" title={unitConversionLocal.panelBasic} cols={this.drawBasicInfoCols()} />
    ];

    return panels;
  }
}
