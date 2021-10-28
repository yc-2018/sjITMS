import { connect } from 'dva';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import Address from '@/pages/Component/Form/Address';
import { Form, Select, Input, InputNumber, message, Col } from 'antd';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import { sourceWay } from '@/utils/SourceWay';
import { loginCompany, getDefOwner } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { PRETYPE } from '@/utils/constants';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import {zzLocale} from './ZzLocale'

@connect(({ zztest, pretype,loading }) => ({
    zztest,
    pretype,
    loading: loading.models.zztest,
  }))
@Form.create()
export default class ZzCreate extends CreatePage {

    constructor(props) {
        super(props);

        this.state = {
            operatingTypeNames: '',
            typeNames: '',
            storAreaNames:'',
            title: commonLocale.createLocale + '员工信息',
            noNote:true, //是否渲染Note界面
            entity: {
                sourceWay: sourceWay.CREATE.name,
                operatingArea: 0,
                distance: 0,
                companyUuid: loginCompany().uuid,
                owner: getDefOwner(),
            }    
        }
    }

    componentDidMount() {
        // 编辑时获取信息；获取下拉框的内容
        this.refresh(this.props.zztest.entityUuid);
    }

    /**
     * 查询后刷新数据！！
     * 
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.zztest.entity && this.props.zztest.entityUuid) {
            this.setState({
                entity: nextProps.zztest.entity
            });
        }
       
    }

    /**
      * 刷新
      */
    refresh = (id) => {
        console.log("进来时是否有id",id)
        if(id){
            this.props.dispatch({
                type: 'zztest/getById',
                payload: id
            });
        }
        
    }

    /**
     * 返回按钮事件
     */
    onCancel = (uuid)=>{
        const payload = {
            showPage: 'query'
        }
            if (uuid != '') {
            payload.entityUuid = uuid;
        }
            this.props.dispatch({
            type: 'zztest/showPage',
            payload: {
                ...payload
        }
        });
    }

    /**
      * 保存
      */
    onSave = (data) => {
        
        //let store = this.arrangeData(data);
        let Pdata = {...data,companyUuid: loginCompany().uuid}
       // Pdata.address = Pdata.address.country+Pdata.address.province+Pdata.address.city+Pdata.address.district+Pdata.address.street
        console.log("保存的data内容为",data,'----',Pdata)
        if (!data.address.country || !data.address.province
            || !data.address.city) {
            message.error("地址不能为空");
        } else if (!data.address.street) {
            message.error("详细地址不能为空");
        } else {
            if (!this.props.zztest.entityUuid) {
                this.props.dispatch({
                    type: 'zztest/onSave',
                    payload: Pdata,
                    callback: (response) => {
                        if (response && response.success) {
                            message.success(commonLocale.saveSuccessLocale);
                        }
                    }
                });
            } else {
                console.log("进入了修改")
                Pdata={...Pdata,id:this.props.zztest.entityUuid}
                this.props.dispatch({
                    type: 'zztest/onModify',
                    payload: Pdata,
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
      * 绘制表单
      */
    drawFormItems = () => {
        const { form } = this.props;
        const { getFieldDecorator } = this.props.form;

        const { entity, typeNames, operatingTypeNames } = this.state;


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

        // console.log("code是什么",entity.code)

        
		// 编辑情况下，代码不可修改
        let codeItem = null;
        if (entity.id) {
            codeItem = <CFormItem key="name" label='姓名'>
                    {form.getFieldDecorator('name',{initialValue: entity.name})(
                        <div>
                            <Col>{entity.name ? entity.name : '空'}</Col>
                            <Input type='hidden'/>
                        </div>
                       
                    )}
                </CFormItem>;
        } else {
            codeItem =  <CFormItem key='name' label='姓名'>
            {
                getFieldDecorator('name', {
                    initialValue: entity.name,
                    rules: [ { required: true, message: notNullLocale(commonLocale.nameLocale) }, {
                        max: 30, message: tooLongLocale(commonLocale.nameLocale, 30),
                    },{pattern:'[^x00-xff]|[A-Za-z]{4,12}',message:'请输入正确的姓名'}],
                })(
                    <Input placeholder={placeholderLocale(commonLocale.nameLocale)} />
                )
            }
            </CFormItem>;
        }
        
        // 绘制所有字段
        let cols = [
            codeItem,
            <CFormItem key='age' label={zzLocale.age}>
                {
                    getFieldDecorator('age', {
                        initialValue: entity.age,
                        rules: [{ required: true, message: notNullLocale(zzLocale.age) },{pattern:/^\d+$|^\d+[.]?\d+$/,message:"请输入正确的年龄"} ],  
                        // {
                        //     max: 3, message: tooLongLocale(zzLocale.age, 3),
                        // }
                    })(
                        <Input placeholder={placeholderLocale(zzLocale.age)} />
                    )
                }
            </CFormItem>,
            <CFormItem key='sex' label='性别'>
                {getFieldDecorator('sex', {
                    rules: [
                        { required: true, message: notNullLocale('性别') },
                    ],
                    initialValue: entity.sex ? entity.sex : [],
                })( <PreTypeSelect 
                    preType={PRETYPE.zztest}
                   // orgUuid={loginOrg().type=='DC' || loginOrg().type == 'DISPATCH_CENTER'?loginCompany().uuid:loginOrg().uuid}
                  />)}
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
             <CFormItem key='phone' label='手机号'>
             {
                 getFieldDecorator('phone', {
                     initialValue: entity.phone,
                     rules: [{ required: true, message: notNullLocale('手机号') },
                     {pattern:/^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/, message:'请输入正确的手机号'}], //校验手机号
                 })(
                     <Input placeholder={placeholderLocale(zzLocale.age)} />
                 )
             }
         </CFormItem>
        ];
        
        return [
            <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={cols} noteCol={this.drawNotePanel()} noteLabelSpan={4} />
        ];
    }

  
}
