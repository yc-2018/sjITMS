import CreatePage from '@/pages/Component/Page/CreatePage';
import { Form, Input, Select, InputNumber, message, Col,DatePicker } from 'antd';
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
import {BillListLocal} from './BillListLocal';
import moment from 'moment';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
 
@connect(({ billList, loading }) => ({
    billList,
    loading: false
  }))

@Form.create()

export default class BillListCreatePage extends CreatePage {
    constructor(props) {
        super(props);
    
        this.state = {
          title: '新建费用单',
          entity: {
            companyUuid: loginCompany().uuid,
          },

        }
      }
    
      componentDidMount() {
        if(this.props.entityUuid){
          this.refresh();
        }
      }

      componentWillReceiveProps(nextProps) {
        if(nextProps.billList.entityUuid&&(this.props.entityUuid != nextProps.billList.entityUuid)){
          this.refresh()
        }
        if (nextProps.billList.entity && this.props.billList.entityUuid && this.props.billList.entity != nextProps.billList.entity) {
          this.setState({
            entity: nextProps.billList.entity,
            title: convertCodeName(nextProps.billList.entity),
          });
        }
       
      }

      refresh = () => {
  
        // this.props.dispatch({
        //   type: '',
        //   payload: {
        //     uuid: this.props.billList.entityUuid
        //   }
        // })
      }

      drawFormItems = () => {
        let panels = [
          <FormPanel key="basicInfo" title={BillListLocal.panelBasic} cols={this.drawBasicInfoCols()} />
        ];
        return panels;
      }

      drawBasicInfoCols = () => {
        const { form } = this.props;
        const { entity } = this.state;
        const format = 'YYYY-MM-DD HH:mm:ss';
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
              <CFormItem key='dc' label={BillListLocal.createForm_dcUuid}>
              {form.getFieldDecorator('dc', {
                initialValue: entity.dc ? JSON.stringify(entity.dc)  : undefined,
                rules: [
                  { required: false, message: notNullLocale(BillListLocal.createForm_dcUuid) },
                ]
              })(<OrgSelect
                  placeholder={placeholderChooseLocale(BillListLocal.createForm_dcUuid)}
                  type={orgType['dc'].name}
                  onChange={(e)=>this.onFieldChange(e,'dc')}
                />
               )}
            </CFormItem>,
            <CFormItem key='dispatchCenter' label={BillListLocal.createForm_dispatchCenterUuid}>
            {form.getFieldDecorator('dispatchCenter', {
              initialValue: entity.dispatchCenter ? JSON.stringify(entity.dispatchCenter)  : undefined,
              rules: [
                { required: false, message: notNullLocale(BillListLocal.createForm_dispatchCenterUuid) },
              ]
            })(<OrgSelect
                placeholder={placeholderChooseLocale(BillListLocal.createForm_dispatchCenterUuid)}
                type={orgType['dispatchCenter'].name}
                onChange={(e)=>this.onFieldChange(e,'dispatchCenter')}
              />
             )}
          </CFormItem>,
          <CFormItem key='costContract' label={BillListLocal.createForm_costContract}>
            {form.getFieldDecorator('costContract', {
              initialValue: entity ? JSON.stringify(entity.costContract) : null,
              rules: [
                {
                  max: 30,
                  message: tooLongLocale(BillListLocal.createForm_costContract, 30),
                },
              ]
            })(<Select
                placeholder={placeholderChooseLocale(BillListLocal.createForm_costContract)}
                style={{ width: '100%' }}
                onChange={(e)=>this.onFieldChange(e,'costContract')}
              >
              </Select>)}
          </CFormItem>,
          <CFormItem key='costConfig' label={BillListLocal.createForm_costConfig}>
            {form.getFieldDecorator('costConfig', {
              initialValue: entity.costConfig ? JSON.stringify(entity.costConfig)  : undefined,
              rules: [
                { required: false, message: notNullLocale(BillListLocal.createForm_costConfig) },
              ]
            })(<Select
                placeholder={placeholderChooseLocale(BillListLocal.createForm_costConfig)}
                style={{ width: '100%' }}
                onChange={(e)=>this.onFieldChange(e,'costConfig')}
              >
              </Select>)}
          </CFormItem>,
          <CFormItem key='startTime' label={BillListLocal.createForm_startTime}>
          {form.getFieldDecorator('startTime', {
            initialValue: entity.startTime ? moment(entity.startTime,format) : undefined,
          })(
            <DatePicker showTime={{format:"HH:mm:ss"}} format={format}  style={{ width: '100%' }} 
            disabledDate={this.disabledDateFront}
            onChange={(e)=>this.onFieldChange(e,'startTime')}
            />
          )}
        </CFormItem>,
         <CFormItem key='endTime' label={BillListLocal.createForm_endTime}>
         {form.getFieldDecorator('endTime', {
           initialValue: entity.endTime ? moment(entity.endTime,format) : undefined,
         })(
           <DatePicker showTime={{format:"HH:mm:ss"}} format={format}  style={{ width: '100%' }} 
           disabledDate={this.disabledDateBack}
           onChange={(e)=>this.onFieldChange(e,'endTime')}
           />
         )}
       </CFormItem>,
       <CFormItem key='totalQtyStr' label={BillListLocal.createForm_totalQtyStr}>
       {form.getFieldDecorator('totalQtyStr', {
         initialValue: entity.totalQtyStr ?entity.totalQtyStr : undefined,
       })(
         <InputNumber 
         parser={(value)=>  Number(value)}
         formatter={(value)=> value = value + ''}
         precision={0}
         max={1000000000000}
         min={0}
         placeholder={placeholderLocale(BillListLocal.createForm_totalQtyStr)}  
         style={{ width: '100%' }} 
         onChange={(e)=>this.onFieldChange(e,'totalQtyStr')}
         />
       )}
     </CFormItem>,
     <CFormItem key='totalQty' label={BillListLocal.createForm_totalQty}>
     {form.getFieldDecorator('totalQty', {
       initialValue: entity.totalQty ? entity.totalQty : undefined,
     })(
       <InputNumber precision={4}
       max={1000000000000}
       min={0} placeholder={placeholderLocale(BillListLocal.createForm_totalQty)}  
       style={{ width: '100%' }}
       onChange={(e)=>this.onFieldChange(e,'totalQty')} />
     )}
   </CFormItem>,
    <CFormItem key='totalAmount' label={BillListLocal.createForm_totalAmount}>
    {form.getFieldDecorator('totalAmount', {
      initialValue: entity.totalAmount ? entity.totalAmount : undefined,
    })(
      <InputNumber 
      precision={4}
      max={1000000000000}
      placeholder={placeholderLocale(BillListLocal.createForm_totalAmount)}  
      style={{ width: '100%' }}
      onChange={(e)=>this.onFieldChange(e,'totalAmount')}
       />
    )}
  </CFormItem>,
   <CFormItem key='totalRealAmount' label={BillListLocal.createForm_totalRealAmount}>
   {form.getFieldDecorator('totalRealAmount', {
     initialValue: entity.totalRealAmount ? entity.totalRealAmount : undefined,
   })(
     <InputNumber 
     precision={4}
     max={1000000000000}
     placeholder={placeholderLocale(BillListLocal.createForm_totalRealAmount)}  
     style={{ width: '100%' }}
     onChange={(e)=>this.onFieldChange(e,'totalRealAmount')} />
   )}
 </CFormItem>,
        ];
        return basicInfoCols;
      }
      disabledDateFront = (date) => {
        let maxDate = moment().endOf('day');
        let endTime = this.props.form.getFieldValue('endTime');
       if(endTime){
        maxDate = endTime
       }
       return date&&date > maxDate;
      }

      disabledDateBack = (date) => {
        let maxDate = moment().endOf('day');
        let minDate = null
        let startTime = this.props.form.getFieldValue('startTime');
       if(startTime){
        minDate = startTime
       }
       return date&&(date < minDate || date > maxDate);
      }

      onFieldChange = (value,key) => {
        let {entity} = this.state;
        if(key === 'dc' || key === 'dispatchCenter' || key === 'costContract' || key === 'costConfig'){
          entity[key] = JSON.parse(value);
        }else if( key === 'startTime' || key === 'endTime'){
          entity[key] = value.format('YYYY-MM-DD HH:mm:ss');
        }else{ 
          entity[key] = value;
        }
        this.setState({
          entity:{...entity}
        })
      }

      onCancel = () => {
        this.props.dispatch({
          type: 'billList/showPage',
          payload: {
            showPage: 'query'
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
        let type = 'billList/cost';
        if (entity.uuid) {
          type = 'billList/modify';
          data['uuid'] = entity.uuid;
          data['version'] = entity.version;
        }
        
    
    
        dispatch({
          type: type,
          payload: {
            ...data,
            ...entity,
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
     
}

  