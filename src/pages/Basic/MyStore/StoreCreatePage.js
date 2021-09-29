import { connect } from 'dva';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import Address from '@/pages/Component/Form/Address';
import { Form, Select, Input, InputNumber, message, Col } from 'antd';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import { storeLocale } from './StoreLocale';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import { sourceWay } from '@/utils/SourceWay';
import { loginCompany, getDefOwner } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { PRETYPE } from '@/utils/constants';

const { TextArea } = Input;
@connect(({ store, pretype, loading }) => ({
  store,
  pretype,
  loading: loading.models.store,
}))
@Form.create()
export default class StoreCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      operatingTypeNames: '',
      typeNames: '',
      storAreaNames:'',
      title: commonLocale.createLocale + storeLocale.title,
      entity: {
        sourceWay: sourceWay.CREATE.name,
        operatingArea: 0,
        distance: 0,
        companyUuid: loginCompany().uuid,
        owner: getDefOwner()
      }
    }
  }
  componentDidMount() {
    this.refresh();
    this.fetchStoreTypesByCompanyUuid();
    this.fetchStoreOperatingTypesByCompanyUuid();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.store.entity && this.props.store.entityUuid) {
      this.setState({
        entity: nextProps.store.entity,
        title: convertCodeName(nextProps.store.entity)
      });
    }
    const preType = nextProps.pretype;
    if (preType.queryType === PRETYPE['store'] && preType.names) {
      var typeNames = [...preType.names];
      this.setState({
        typeNames: typeNames
      })
    }
    
    if (preType.queryType === PRETYPE['storeOperating'] && preType.names) {
      var operatingTypeNames = [...preType.names];
      this.setState({
        operatingTypeNames: operatingTypeNames
      })
    }
    
  }
  checkDistanceZero = (rule, value, callback) => {
    this.checkZero(value, callback, storeLocale.distancePattern)
  }

  checkOperatingAreaZero = (rule, value, callback) => {
    this.checkZero(value, callback, storeLocale.operatingAreaPattern)
  }

  checkZero = (value, callback, message) => {
    if (!value) {
      callback();
      return;
    }
    if (value >= 0) {
      callback();
      return;
    }
    callback(message);
  }
  /** 
   *  通过企业uuid获取门店类型信息
   */
  fetchStoreTypesByCompanyUuid = () => {
    const {
      dispatch
    } = this.props;
    dispatch({
      type: 'pretype/queryType',
      payload: PRETYPE['store']
    });
  };
  /** 
   *  通过企业uuid获取门店经营类型信息
   */
  fetchStoreOperatingTypesByCompanyUuid = () => {
    const {
      dispatch
    } = this.props;
    dispatch({
      type: 'pretype/queryType',
      payload: PRETYPE['storeOperating']
    });
  };
   
  /**
   * 刷新
   */
  refresh = () => {
    this.props.dispatch({
      type: 'store/getByCompanyUuidAndUuid',
      payload: this.props.store.entityUuid
    });
  }
  /**
   * 取消
   */
  onCancel = () => {
    this.props.dispatch({
      type: 'store/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  arrangeData = (data) => {
    const { entity } = this.state;

    let store = {
      ...this.state.entity,
      ...data
    };
    if (!store.code) {
      store.code = entity.code;
    }

    const ownerUuids = [];
    data.owners.forEach(function (e) {
      ownerUuids.push(JSON.parse(e).uuid);
    });

    store.ownerUuids = ownerUuids;
    return store;
  }

  /**
   * 保存
   */
  onSave = (data) => {
    let store = this.arrangeData(data);

    if (!data.address.country || !data.address.province
      || !data.address.city) {
      message.error("地址不能为空");
    } else if (!data.address.street) {
      message.error("详细地址不能为空");
    } else {
      if (!store.uuid) {
        this.props.dispatch({
          type: 'store/onSave',
          payload: store,
          callback: (response) => {
            if (response && response.success) {
              message.success(commonLocale.saveSuccessLocale);
            }
          }
        });
      } else {
        this.props.dispatch({
          type: 'store/onModify',
          payload: store,
          callback: (response) => {
            if (response && response.success) {
              message.success(commonLocale.modifySuccessLocale);
            }
          }
        });
      }
    }
  }
  /**
   * 保存并新建
   */
  onSaveAndCreate = (data) => {
    let store = this.arrangeData(data);
    
    if (!data.address.country || !data.address.province
      || !data.address.city) {
      message.error("地址不能为空");
    } else if (!data.address.street) {
      message.error("详细地址不能为空");
    } else {
      this.props.dispatch({
        type: 'store/onSaveAndCreate',
        payload: store,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
            this.props.form.resetFields();
          }
        }
      });
    }
  }
  /**
   * 绘制表单
   */
  drawFormItems = () => {
    const { form } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { entity, typeNames, operatingTypeNames } = this.state;
    let typeNamesItems = [];
    if (typeNames) {
      typeNames.map((result) => typeNamesItems.push(<Option key={`${result}`}>{`${result}`}</Option>));
    }

    let operatingTypeNamesItems = [];
    if (operatingTypeNames) {
      operatingTypeNames.map((result) => operatingTypeNamesItems.push(<Option key={`${result}`}>{`${result}`}</Option>));
    }

   

    let ownersInitialValues = [];
    if (entity && entity.owners) {
      entity.owners.map(value => {
        ownersInitialValues.push(JSON.stringify({
          uuid: value.owner.uuid,
          code: value.owner.code,
          name: value.owner.name
        }));
      });
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
    let cols = [
      codeItem,
      <CFormItem key='name' label={commonLocale.nameLocale}>
        {
          getFieldDecorator('name', {
            initialValue: entity.name,
            rules: [{ required: true, message: notNullLocale(commonLocale.nameLocale) }, {
              max: 30, message: tooLongLocale(commonLocale.nameLocale, 30),
            }],
          })(
            <Input placeholder={placeholderLocale(commonLocale.nameLocale)} />
          )
        }
      </CFormItem>,
      <CFormItem key='shortName' label={storeLocale.shortName}>
        {
          getFieldDecorator('shortName', {
            rules: [
              {
                max: 30, message: tooLongLocale(storeLocale.shortName, 30),
              }
            ],
            initialValue: entity.shortName,
          })(<Input placeholder={placeholderLocale(storeLocale.shortName)} />)
        }
      </CFormItem>,
      <CFormItem key='storeType' label={storeLocale.storeType}>
        {
          getFieldDecorator('storeType', {
            rules: [
              { required: true, message: notNullLocale(storeLocale.storeType) },
            ],
            initialValue: entity.storeType,
          })(
            <Select
              showSearch
              placeholder={placeholderChooseLocale(storeLocale.storeType)}
              style={{ width: '100%' }}
            >
              {typeNamesItems}
            </Select >
          )
        }
      </CFormItem>,
      <CFormItem key='owners' label={commonLocale.ownerLocale}>
        {getFieldDecorator('owners', {
          rules: [
            { required: true, message: notNullLocale(commonLocale.ownerLocale) },
          ],
          initialValue: entity ? ownersInitialValues : [],
        })(<OwnerSelect placeholder={placeholderLocale(commonLocale.ownerLocale)} onlyOnline multiple />)}
      </CFormItem>,
      <CFormItem key='operatingType' label={storeLocale.operatingType}>
        {
          getFieldDecorator('operatingType', {
            rules: [
              { required: true, message: notNullLocale(storeLocale.operatingType) }
            ],
            initialValue: entity.operatingType,
          })(
            <Select
              showSearch
              placeholder={placeholderChooseLocale(storeLocale.operatingType)}
              style={{ width: '100%' }}
            >
              {operatingTypeNamesItems}
            </Select>
          )
        }
      </CFormItem>,
      <CFormItem key='contactor' label={commonLocale.contactorLocale}>
        {
          getFieldDecorator('contactor', {
            initialValue: entity.contactor,
            rules: [{ required: true, message: notNullLocale(commonLocale.contactorLocale) }, {
              max: 30, message: tooLongLocale(commonLocale.contactorLocale, 30),
            }],
          })(
            <Input placeholder={placeholderLocale(commonLocale.contactorLocale)} />
          )
        }
      </CFormItem>,
      <CFormItem key='contactPhone' label={commonLocale.contactPhoneLocale}>
        {
          getFieldDecorator('contactPhone', {
            initialValue: entity.contactPhone,
            rules: [{ required: true, message: notNullLocale(commonLocale.contactPhoneLocale) }, {
              max: 30, message: tooLongLocale(commonLocale.contactPhoneLocale, 30),
            }],
          })(
            <Input placeholder={placeholderLocale(commonLocale.contactPhoneLocale)} />
          )
        }
      </CFormItem>,
      <CFormItem key='address' label={commonLocale.addressLocale}>
        {
          getFieldDecorator('address', {
            initialValue: entity.address,
            rules: [
              {
                required: true,
                message: notNullLocale(commonLocale.addressLocale)
              },
            ]
          })(<Address />)
        }
      </CFormItem>,
      <CFormItem key='operatingArea' label={storeLocale.operatingArea}>
        {
          getFieldDecorator('operatingArea', {
            rules: [{ validator: this.checkOperatingAreaZero }],
            initialValue: entity.operatingArea,
          })(
            <InputNumber style={{ width: '100%' }} min={0} max={100000} step={0.1} placeholder={placeholderLocale(storeLocale.operatingArea)} />
          )
        }
      </CFormItem>,

      <CFormItem key='distance' label={storeLocale.distance}>
        {
          getFieldDecorator('distance', {
            rules: [{ validator: this.checkDistanceZero }],
            initialValue: entity.distance,
          })(
            <InputNumber style={{ width: '100%' }} min={0} max={1000} step={0.1} placeholder={placeholderLocale(storeLocale.distance)} />
          )
        }
      </CFormItem>,
      <CFormItem key='zipCode' label={commonLocale.zipCodeLocale}>
        {
          getFieldDecorator('zipCode', {
            initialValue: entity.zipCode,
            rules: [{
              max: 30,
              message: tooLongLocale(commonLocale.zipCodeLocale, 30),
            }],
          })(
            <Input placeholder={placeholderLocale(commonLocale.zipCodeLocale)} />
          )
        }
      </CFormItem>,
      <CFormItem key='homeUrl' label={commonLocale.homeUrlLocale}>
        {
          getFieldDecorator('homeUrl', {
            rules: [
              {
                max: 100,
                message: tooLongLocale(commonLocale.homeUrlLocale, 100),
              },
            ],
            initialValue: entity.homeUrl,
          })(<Input placeholder={placeholderLocale(commonLocale.homeUrlLocale)} />)
        }
      </CFormItem>,
    ];
    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={cols} noteCol={this.drawNotePanel()} noteLabelSpan={4} />
    ];
  }
}
