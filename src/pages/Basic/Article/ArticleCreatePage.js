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
import { articleLocale } from './ArticleLocale';
import {
  commonLocale,
  notNullLocale,
  tooLongLocale,
  placeholderLocale,
  placeholderChooseLocale
} from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import { SHELFLIFE_TYPE } from './Constants';
import { orgType } from '@/utils/OrgType';
import { basicState } from '@/utils/BasicState';
import { articleShelflifeType, getShelflifeTypeCaption } from './ArticleShelflifeType';
import { convertCodeName } from '@/utils/utils';
const Option = Select.Option;

@connect(({ article, loading }) => ({
  article,
  loading: loading.models.article,
}))
@Form.create()
export default class ArticleCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      title: articleLocale.createTitle,
      entity: {
        companyUuid: loginCompany().uuid,
        sourceWay: SOURCE_WAY.CREATE,
        owner: getDefOwner(),
        purchasePrice: 0,
        salePrice: 0,
        shelfLifeDays: 0
      },
      selectedOwnerUuid: getDefOwner() ? getDefOwner().uuid : '',
    }
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.article.entity && this.props.article.entityUuid && this.props.article.entity != nextProps.article.entity) {
      this.setState({
        entity: nextProps.article.entity,
        selectedOwnerUuid: nextProps.article.entity.owner ? nextProps.article.entity.owner.uuid : '',
        title: convertCodeName(nextProps.article.entity),
      });
    }
  }

  refresh = () => {
    this.props.dispatch({
      type: 'article/get',
      payload: {
        uuid: this.props.article.entityUuid
      }
    });
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
    let type = 'article/save';
    if (entity.uuid) {
      type = 'article/modify';
      data['uuid'] = entity.uuid;
      data['version'] = entity.version;
    } else {
      data['sourceWay'] = SOURCE_WAY.CREATE;
    }

    data['categoryCode'] = JSON.parse(data['category']).code;
    data['ownerCode'] = JSON.parse(data['owner']).code;
    if (data['defaultVendor']) {
      data['defaultVendorCode'] = JSON.parse(data['defaultVendor']).code;
    }

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
          entity.shelfLifeDays = 0;
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
      type: 'article/showPage',
      payload: {
        showPage: 'view',
        entityUuid: uuid
      }
    });
  }

  onCancel = () => {
    this.props.dispatch({
      type: 'article/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  onShelfLifeDaysChange = value => {
    const { entity } = this.state;
    entity.shelfLifeDays = value;
    this.setState({
      entity: entity
    });
  }

  onShelfLifeTypeChange = value => {
    if (value === articleShelflifeType.NOCARE.name) {
      const { entity } = this.state;
      entity.shelfLifeDays = 0;
      entity.receiveControlDays = 0;
      entity.deliveryControlDays = 0;
      entity.returnControlDays = 0;

      this.setState({
        entity: entity
      });
      this.props.form.setFieldsValue({
        shelfLifeDays: entity.shelfLifeDays,
        receiveControlDays: entity.receiveControlDays,
        deliveryControlDays: entity.deliveryControlDays,
        returnControlDays: entity.returnControlDays
      });
    }
  }

  onOwnerChange = value => {
    if (value) {
      this.state.entity.defaultVendor = undefined;
      this.state.entity.category = undefined;
      this.setState({
        selectedOwnerUuid: JSON.parse(value).uuid,
        entity: { ...this.state.entity }
      })
    }
  }

  drawBasicInfoCols = () => {
    const { form } = this.props;
    const { entity, selectedOwnerUuid } = this.state;
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
        })(<Input placeholder={placeholderLocale(commonLocale.nameLocale)} />)}
      </CFormItem>,
      <CFormItem key='shortName' label={commonLocale.shortNameLocale}>
        {form.getFieldDecorator('shortName', {
          initialValue: entity ? entity.shortName : null,
          rules: [
            {
              max: 30,
              message: tooLongLocale(commonLocale.shortNameLocale, 30),
            },
          ]
        })(<Input placeholder={placeholderLocale(commonLocale.shortNameLocale)} />)}
      </CFormItem>,
      <CFormItem key='owner' label={articleLocale.articleOwner}>
        {form.getFieldDecorator('owner', {
          initialValue: entity ? (entity.owner ? JSON.stringify(entity.owner) : undefined) : null,
          rules: [
            { required: true, message: notNullLocale(articleLocale.articleOwner) },
          ]
        })(<OwnerSelect onlyOnline onChange={this.onOwnerChange} placeholder={placeholderChooseLocale(articleLocale.articleOwner)} />)}
      </CFormItem>,
      <CFormItem key='spec' label={articleLocale.articleSpec}>
        {form.getFieldDecorator('spec', {
          initialValue: entity ? entity.spec : null,
          rules: [
            { required: true, message: notNullLocale(articleLocale.articleSpec) },
            {
              max: 30,
              message: tooLongLocale(articleLocale.articleSpec, 30),
            }
          ]
        })(<Input placeholder={placeholderLocale(articleLocale.articleSpec)} />)}
      </CFormItem>,
      <CFormItem key='category' label={articleLocale.articleCategory}>
        {form.getFieldDecorator('category', {
          initialValue: entity ? (entity.category ? JSON.stringify(entity.category) : undefined) : undefined,
          rules: [
            { required: true, message: notNullLocale(articleLocale.articleCategory) },
          ]
        })(
          <CategorySelect
            ownerUuid={selectedOwnerUuid}
            single
            onlyOnline
            placeholder={placeholderChooseLocale(articleLocale.articleCategory)}
          />
        )}
      </CFormItem>,
      <CFormItem key='barcode' label={articleLocale.articleBarcode}>
        {form.getFieldDecorator('barcode', {
          initialValue: entity ? entity.barcode : null,
          rules: [
            {
              required: true,
              message: notNullLocale(articleLocale.articleBarcode)
            },
            {
              max: 30,
              message: tooLongLocale(articleLocale.articleBarcode, 30),
            }
          ]
        })(<Input placeholder={placeholderLocale(articleLocale.articleBarcode)} />)}
      </CFormItem>,
      <CFormItem key='defaultVendor' label={articleLocale.articleDefaultVendor}>
        {form.getFieldDecorator('defaultVendor', {
          initialValue: entity ? (entity.defaultVendor ? JSON.stringify(entity.defaultVendor) : undefined) : undefined,
          rules: [
            { required: true, message: notNullLocale(articleLocale.articleDefaultVendor) },
          ]
        })(
          <VendorSelect
            ownerUuid={selectedOwnerUuid}
            state={basicState.ONLINE.name}
            single
            placeholder={placeholderLocale(articleLocale.articleDefaultVendor)}
          />
        )}
      </CFormItem>,
      <CFormItem key='purchasePrice' label={articleLocale.articlePurchasePrice}>
        {form.getFieldDecorator('purchasePrice', {
          initialValue: entity ? entity.purchasePrice : null,
        })(
          <InputNumber
            min={0}
            precision={4}
            max={MAX_DECIMAL_VALUE}
            style={{ width: '100%' }}
            placeholder={placeholderLocale(articleLocale.articlePurchasePrice)}
          />
        )}
      </CFormItem>,
      <CFormItem key='salePrice' label={articleLocale.articleSalePrice}>
        {form.getFieldDecorator('salePrice', {
          initialValue: entity ? entity.salePrice : null,
        })(
          <InputNumber
            min={0}
            precision={4}
            max={MAX_DECIMAL_VALUE}
            style={{ width: '100%' }}
            placeholder={placeholderLocale(articleLocale.articleSalePrice)}
          />
        )}
      </CFormItem>,
      <CFormItem key='origin' label={articleLocale.articleOrigin}>
        {form.getFieldDecorator('origin', {
          initialValue: entity ? entity.origin : null,
          rules: [
            {
              max: 100,
              message: tooLongLocale(articleLocale.articleOrigin, 100),
            }
          ]
        })(<Input placeholder={placeholderLocale(articleLocale.articleOrigin)} />)}
      </CFormItem>,
      <CFormItem key='groupName' label={articleLocale.articleGroupName}>
        {form.getFieldDecorator('groupName', {
          initialValue: entity.groupName,
          rules: [
            {
              max: 30,
              message: tooLongLocale(articleLocale.articleGroupName, 30),
            }
          ]
        })(<Input placeholder={placeholderLocale(articleLocale.articleGroupName)} />)}
      </CFormItem>,
      <CFormItem key='manageBatch' label={articleLocale.manageBatch}>
        {form.getFieldDecorator('manageBatch', {
          initialValue: entity.manageBatch ? true : false,
          rules: [
            { required: true, message: notNullLocale(articleLocale.manageBatch) }
          ]
        })( <Select
          placeholder={placeholderChooseLocale(articleLocale.manageBatch)}
          style={{ width: '100%' }}
        >
          <Option value={true}>{'是'}</Option>
          <Option value={false}>{'否'}</Option>
        </Select>)}
      </CFormItem>
    ];

    return basicInfoCols;
  }

  drawShelfLife = () => {
    const { form } = this.props;
    const { shelfLifeEnable, entity } = this.state;

    let shelfLifeCols = [
      <CFormItem key='shelfLifeType' label={articleLocale.articleShelfLifeType}>
        {form.getFieldDecorator('shelfLifeType', {
          initialValue: entity ? entity.shelfLifeType : null,
          rules: [
            {
              required: true,
              message: notNullLocale(articleLocale.articleShelfLifeType)
            }
          ]
        })(
          <Select
            placeholder={placeholderChooseLocale(articleLocale.articleShelfLifeType)}
            onChange={this.onShelfLifeTypeChange}>
            <Select.Option key="PRODUCTDATE" value={articleShelflifeType.PRODUCTDATE.name}>
              {articleShelflifeType.PRODUCTDATE.caption}
            </Select.Option>
            <Select.Option key="VALIDDATE" value={articleShelflifeType.VALIDDATE.name}>
              {articleShelflifeType.VALIDDATE.caption}
            </Select.Option>
            <Select.Option key="NOCARE" value={articleShelflifeType.NOCARE.name}>
              {articleShelflifeType.NOCARE.caption}
            </Select.Option>
          </Select>
        )}
      </CFormItem>,
      this.props.form.getFieldValue('shelfLifeType') !== articleShelflifeType.NOCARE.name && <CFormItem key='shelfLifeDays' label={articleLocale.articleShelfLifeDays}>
        {form.getFieldDecorator('shelfLifeDays', {
          initialValue: entity ? entity.shelfLifeDays : null,
          rules: [
            { required: true, message: notNullLocale(articleLocale.articleShelfLifeDays) }
          ]
        })(
          <InputNumber
            onChange={this.onShelfLifeDaysChange}
            precision={0}
            style={{ width: '100%' }}
            placeholder={placeholderLocale(articleLocale.articleShelfLifeDays)}
            min={0}
            max={MAX_INTEGER_VALUE}
          />
        )}
      </CFormItem>,
      this.props.form.getFieldValue('shelfLifeType') !== articleShelflifeType.NOCARE.name && <CFormItem key='receiveControlDays' label={articleLocale.articleReceiveControlDays}>
        {form.getFieldDecorator('receiveControlDays', {
          initialValue: entity ? entity.receiveControlDays : null,
          rules: [
            { required: true, message: notNullLocale(articleLocale.articleReceiveControlDays) },
          ]
        })(
          <InputNumber
            precision={0}
            style={{ width: '100%' }}
            placeholder={placeholderLocale(articleLocale.articleReceiveControlDays)}
            min={0}
            max={MAX_INTEGER_VALUE}
          />
        )}
      </CFormItem>,
      this.props.form.getFieldValue('shelfLifeType') !== articleShelflifeType.NOCARE.name && <CFormItem key='deliveryControlDays' label={articleLocale.articleDeliveryControlDays}>
        {form.getFieldDecorator('deliveryControlDays', {
          initialValue: entity ? entity.deliveryControlDays : null,
          rules: [
            { required: true, message: notNullLocale(articleLocale.articleDeliveryControlDays) }
          ]
        })(
          <InputNumber
            precision={0}
            style={{ width: '100%' }}
            placeholder={placeholderLocale(articleLocale.articleDeliveryControlDays)}
            min={0}
            max={MAX_INTEGER_VALUE}
          />
        )}
      </CFormItem>,
      this.props.form.getFieldValue('shelfLifeType') !== articleShelflifeType.NOCARE.name && <CFormItem key='returnControlDays' label={articleLocale.articleReturnControlDays}>
        {form.getFieldDecorator('returnControlDays', {
          initialValue: entity ? entity.returnControlDays : null,
          rules: [
            { required: true, message: notNullLocale(articleLocale.articleReturnControlDays) }
          ]
        })(
          <InputNumber
            precision={0}
            style={{ width: '100%' }}
            placeholder={placeholderLocale(articleLocale.articleReturnControlDays)}
            min={0}
            max={MAX_INTEGER_VALUE}
          />
        )}
      </CFormItem>
    ];

    return shelfLifeCols;
  }

  drawFormItems = () => {
    let panels = [
      <FormPanel key="basicInfo" title={articleLocale.panelBasic} cols={this.drawBasicInfoCols()} noteCol={this.drawNotePanel()} noteLabelSpan={4}/>,
      <FormPanel key="shelfLifeInfo" title={articleLocale.panelShelfLife} cols={this.drawShelfLife()} />
    ];

    return panels;
  }
}
