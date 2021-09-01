import { connect } from 'dva';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { Form, Input, message, Col } from 'antd';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { dispatchCenterLocale } from './DispatchCenterLocale';
import { sourceWay } from '@/utils/SourceWay';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { codePattern_4 } from '@/utils/PatternContants';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { orgType } from '@/utils/OrgType';
import { basicState } from '@/utils/BasicState';
@connect(({ dispatchCenter, loading }) => ({
  dispatchCenter,
  loading: loading.models.dispatchCenter,
}))
@Form.create()
export default class DispatchCenterCreatePage extends CreatePage {

  constructor(props) {
    super(props);

    this.state = {
      title: commonLocale.createLocale + dispatchCenterLocale.title,
      entity: {
        sourceWay: sourceWay.CREATE.name,
        companyUuid: loginCompany().uuid,
      },
      dcList:[]

    }
  }

  componentDidMount() {
    if(this.props.dispatchCenter.entityUuid)
      this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dispatchCenter.entity && this.props.dispatchCenter.entityUuid) {

      let list = [];

      nextProps.dispatchCenter.entity.dcs&&nextProps.dispatchCenter.entity.dcs.forEach(info=>{

        list.push(JSON.stringify({
          uuid:info.dc.uuid,
          code:info.dc.code,
          name:info.dc.name,
          type:"DC"
        }));
      })
      this.setState({
        entity: nextProps.dispatchCenter.entity,
        title: convertCodeName(nextProps.dispatchCenter.entity),
        dcList:list,
      });
    }
  }

  refresh = () => {
    this.props.dispatch({
      type: 'dispatchCenter/get',
      payload: {
        uuid: this.props.dispatchCenter.entityUuid
      }
    });
  }

  onCancel = () => {
    this.props.dispatch({
      type: 'dispatchCenter/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  /**
   * 校验数据
   */
  checkData = (data)=>{
    const { entity,dcList } = this.state;
    let dispatchCenter = {
      ...this.state.entity,
      ...data
    };
    let list = [];
    dispatchCenter.dcs.forEach(dc=>{
      let newDc = {
        uuid:JSON.parse(dc).uuid,
        code:JSON.parse(dc).code,
        name:JSON.parse(dc).name,
      }
      list.push({
        dc:newDc
      })
    });
    dispatchCenter.dcs = list;
    if(dispatchCenter.state == undefined){
      dispatchCenter.state = 'ONLINE';
    }
    return dispatchCenter;
  }


  /**
   * 保存
   */
  onSave = (data) => {
   
    let dispatchCenter  = this.checkData(data);

      if (!dispatchCenter.uuid) {
        this.props.dispatch({
          type: 'dispatchCenter/onSave',
          payload: dispatchCenter,
          callback: (response) => {
            if (response && response.success) {
              message.success(commonLocale.saveSuccessLocale);
            }
          }
        });
      } else {
        dispatchCenter.code = this.state.entity.code
        this.props.dispatch({
          type: 'dispatchCenter/onModify',
          payload: dispatchCenter,
          callback: (response) => {
            if (response && response.success) {
              message.success(commonLocale.modifySuccessLocale);
            }
          }
        });
      }
  }

  onSaveAndCreate = (data) => {
    let dispatchCenter  = this.checkData(data);
    
    this.props.dispatch({
      type: 'dispatchCenter/onSaveAndCreate',
      payload: dispatchCenter,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.props.form.resetFields();
        }
      }
    });
  }

  drawFormItems = () => {
    const { form } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { entity,dcList } = this.state;
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
      <CFormItem label={commonLocale.contactorLocale} key='contacter'>
        {getFieldDecorator('contacter', {
          initialValue: entity.contacter,
          rules: [
            { required: true, message: notNullLocale(commonLocale.contactorLocale) },
            {
              max: 30,
              message: tooLongLocale(commonLocale.contactorLocale, 30),
            },
          ],
        })(<Input placeholder={placeholderLocale(commonLocale.contactorLocale)} />)}
      </CFormItem>,
      <CFormItem label={commonLocale.contactPhoneLocale} key='contactNumber'>
        {getFieldDecorator('contactNumber', {
          initialValue: entity.contactNumber,
          rules: [
            { required: true, message: notNullLocale(commonLocale.contactPhoneLocale) },
            { max: 30, message: tooLongLocale(commonLocale.contactorLocale, 30) }
          ],
        })(<Input placeholder={placeholderLocale(commonLocale.contactPhoneLocale)} />)}
      </CFormItem>,
      <CFormItem label={commonLocale.inDCLocale} key='dcs'>
        {
          getFieldDecorator('dcs', {
            rules: [
              { required: true, message: notNullLocale(commonLocale.inDCLocale) },
            ],
            initialValue: entity.dcs ? dcList : [],
          })(
            <OrgSelect
              mode="multiple"
              upperUuid={loginOrg().uuid}
              state={basicState.ONLINE.name}
              forItemTable={false}
              type={orgType.dc.name}
              placeholder={placeholderLocale(commonLocale.inDCLocale)}
            />
          )
        }
    </CFormItem>,
    ];
    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={cols} noteCol={this.drawNotePanel()} noteLabelSpan={4}/>
    ];
  }
}
