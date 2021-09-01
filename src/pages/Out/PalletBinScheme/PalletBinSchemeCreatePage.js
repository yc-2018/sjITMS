import { connect } from 'dva';
import moment from 'moment';
import { Modal,Form, Select, Input, message } from 'antd';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { commonLocale, tooLongLocale,notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg ,getActiveKey} from '@/utils/LoginContext';
import { palletBinSchemeLocale,clearConfirm } from './PalletBinSchemeLocale';
import PalletBinTypeSelect from '@/pages/Component/Select/PalletBinTypeSelect';
import React from 'react';
import PalletBinSelectByType from '@/pages/Component/Select/PalletBinSelectByType';
import PickareaSelect from '@/pages/Component/Select/PickareaSelect';

@connect(({ palletBinScheme, palletBinType, loading }) => ({
  palletBinScheme, palletBinType,
  loading: loading.models.palletBinScheme,
}))
@Form.create()
export default class PalletBinSchemeCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      noNote:true,
      title: commonLocale.createLocale + palletBinSchemeLocale.title,
      entity: {},
      palletBinTypeUuid: '',
    }
  }
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {

    if (nextProps.palletBinScheme.entity.data && this.props.palletBinScheme.entityUuid
      && nextProps.palletBinScheme.entity.data != this.props.palletBinScheme.entity.data) {

      this.setState({
        entity: nextProps.palletBinScheme.entity.data,
        title: palletBinSchemeLocale.title + '：' + nextProps.palletBinScheme.entity.data.code,
      });

      if (nextProps.palletBinScheme.entity.data.palletBinType){
        this.setState({
          palletBinTypeUuid: nextProps.palletBinScheme.entity.data.palletBinType.uuid,
        })
      }
    }

  }

  /**
   * 刷新
   */
  refresh = () => {
    this.props.dispatch({
      type: 'palletBinScheme/get',
      payload: {
        uuid: this.props.palletBinScheme.entityUuid
      }
    });
  }

  /**
  * 取消
  */
  onCancel = () => {
    this.props.dispatch({
      type: 'palletBinScheme/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  /**
   * 校验数据
   */
  checkData =(data)=>{
    // 处理数据
    let palletBinScheme = {
      ...this.state.entity,
      ...data,
    }

    palletBinScheme = {
      ...palletBinScheme,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
    };
    return palletBinScheme;
  }
  /**
   * 保存
   */
  onSave = (data) => {
    let palletBinScheme = this.checkData(data);
    if(palletBinScheme === null){
      return;
    }

    let pickAreas = [];
    if (data.pickAreas) {
      pickAreas = data.pickAreas.map((val) => {
        let obj = JSON.parse(val);
        return obj;
      })
    }
    palletBinScheme.pickAreas = pickAreas;
    palletBinScheme.palletBinType = data.palletBinType? JSON.parse(data.palletBinType) : {};
    let type ='';
    if (!this.state.entity.uuid) {
      type = 'palletBinScheme/onSave'
    } else {
      type = 'palletBinScheme/onModify'
    }
    this.props.dispatch({
      type: type,
      payload: palletBinScheme,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
        }
      }
    });
  }
  /**
   * 保存并新建
   */
  onSaveAndCreate = (data) => {
    let palletBinScheme = this.checkData(data);
    if(palletBinScheme === null){
      return;
    }

    let pickAreas = [];
    if (data.pickAreas) {
      pickAreas = data.pickAreas.map((val) => {
        let obj = JSON.parse(val);
        return obj;
      })
    }
    palletBinScheme.pickAreas = pickAreas;
    palletBinScheme.palletBinType = data.palletBinType? JSON.parse(data.palletBinType) : {};

    this.props.dispatch({
      type: 'palletBinScheme/onSaveAndCreate',
      payload: palletBinScheme,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.setState({
            entity: {
              companyUuid: loginCompany().uuid,
              dcUuid: loginOrg().uuid,
            },
          });
          this.props.form.resetFields();
        }
      }
    });
  }

  palletBinTypeChange = (value) => {
    if (!value)
      return;
    const palletBinType = JSON.parse(value);
    this.setState({
      palletBinTypeUuid: palletBinType.uuid,
    });
  }

  convertPickAreas = (value) => {
    let pickAreasValue = [];
    if (value){
      value.forEach(pickArea => {
        pickAreasValue.push(JSON.stringify(pickArea.pickArea));
      })
    }
    return pickAreasValue.length > 0? pickAreasValue : [];
  }

  /**
   * 绘制表单
   */
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;

    let basicCols = [
      <CFormItem key='code' label={commonLocale.codeLocale}>
        {
          getFieldDecorator('code', {
            initialValue: entity.code,
            rules: [
              { required: true, message: notNullLocale(commonLocale.codeLocale) },
              { max: 30, message: tooLongLocale(commonLocale.codeLocale, 30) }
            ],
          })(
            <Input disabled={entity.uuid ? true : false} placeholder={placeholderLocale(commonLocale.codeLocale)} />
          )
        }
      </CFormItem>,
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
      <CFormItem key='palletBinType' label={palletBinSchemeLocale.palletBinType}>
        {getFieldDecorator('palletBinType', {
          initialValue: entity.palletBinType? JSON.stringify(entity.palletBinType) : undefined,
          rules: [{ required: true, message: palletBinSchemeLocale.palletBinTypeNotNull },
          ],
        })(
          <PalletBinTypeSelect
            placeholder={placeholderChooseLocale(palletBinSchemeLocale.palletBinType)}
            onChange={this.palletBinTypeChange}
          />,
        )}
      </CFormItem>,
      <CFormItem key='startPalletBin' label={palletBinSchemeLocale.searchFrom}>
        {getFieldDecorator('startPalletBin', {
          initialValue: entity.startPalletBin,
          rules: [{ required: true, message: notNullLocale(palletBinSchemeLocale.searchFrom)},
          ],
        })(
          <PalletBinSelectByType
            palletBinTypeUuid={this.state.palletBinTypeUuid} value ={''}
            placeholder={placeholderChooseLocale(palletBinSchemeLocale.searchFrom)}
          />,
        )}
      </CFormItem>,
      <CFormItem key='endPalletBin' label={palletBinSchemeLocale.searchTo}>
        {getFieldDecorator('endPalletBin', {
          initialValue: entity.endPalletBin,
          rules: [{ required: true, message: notNullLocale(palletBinSchemeLocale.searchTo) },
          ],
        })(
          <PalletBinSelectByType
            palletBinTypeUuid={this.state.palletBinTypeUuid} value ={''}
            placeholder={placeholderChooseLocale(palletBinSchemeLocale.searchTo)}
          />,
        )}
      </CFormItem>,
      <CFormItem key='lastPalletBin' label={palletBinSchemeLocale.lastPalletBin}>
        {getFieldDecorator('lastPalletBin', {
          initialValue: entity.lastPalletBin? entity.lastPalletBin.palletBin : '',
        })(
          <PalletBinSelectByType
            disabled={!this.state.entity.uuid}
            palletBinTypeUuid={this.state.palletBinTypeUuid} value ={''}
            placeholder={placeholderChooseLocale(palletBinSchemeLocale.palletBin)}
          />,
        )}
      </CFormItem>,
      <CFormItem key='startFromFirst' label={palletBinSchemeLocale.startFromFirst}>
        {
          getFieldDecorator('startFromFirst', {
            initialValue: entity.startFromFirst,
            rules: [{ required: true, message: notNullLocale(palletBinSchemeLocale.startFromFirst) }],
          })(
            <Select initialValue=' '
                    placeholder={placeholderChooseLocale(palletBinSchemeLocale.startFromFirst)}>
              <Select.Option value={true}>是</Select.Option>
              <Select.Option value={false}>否</Select.Option>
            </Select>
          )
        }
      </CFormItem>,
      <CFormItem key='loopSearch' label={palletBinSchemeLocale.loopSearch}>
        {
          getFieldDecorator('loopFind', {
            initialValue: entity.loopFind,
            rules: [{ required: true, message: notNullLocale(palletBinSchemeLocale.loopSearch) }],
          })(
            <Select initialValue=' '
              placeholder={placeholderChooseLocale(palletBinSchemeLocale.loopSearch)}>
              <Select.Option value={true}>是</Select.Option>
              <Select.Option value={false}>否</Select.Option>
            </Select>
          )
        }
      </CFormItem>,
      <CFormItem key='pickAreas' label='拣货区域'>
        {getFieldDecorator('pickAreas', {
          initialValue: entity.pickAreaItems ? this.convertPickAreas(entity.pickAreaItems) : [],
          rules: [{ required: true, message: '拣货区域不能为空。' },
          ],
        })(
          <PickareaSelect
            multiple={true}
            placeholder={placeholderChooseLocale('拣货区域')}
          />,
        )}
      </CFormItem>,
    ];

    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={basicCols} />,
    ];
  }
  /**
   * 绘制明细表格
   */
  drawTable = () => {

  }
}
