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
import { loginCompany, getDefOwner, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { PRETYPE } from '@/utils/constants';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import {zzLocale} from '../../Test/Zz/ZzLocale'
import OrgConfigSelect from '@/pages/Component/Select/OrgConfigSelect';
import { basicState } from '@/utils/BasicState';
import { userLocale } from '@/pages/Account/User/UserLocale';
import { getOrgCaption, orgType } from '@/utils/OrgType';
import OwnerConfigSelect from '@/pages/Component/Select/OwnerConfigSelect';

@connect(({ batchNumberConfig, pretype,loading }) => ({
  batchNumberConfig,
    pretype,
    loading: loading.models.batchNumberConfig,
  }))
@Form.create()
export default class BatchNumberConfigCreate extends CreatePage {

    constructor(props) {
        super(props);

        this.state = {
            orgTypes: [],
            operatingTypeNames: '',
            typeNames: '',
            storAreaNames:'',
            title: commonLocale.createLocale + '/修改收货单批次号配置',
            noNote:true, //是否渲染Note界面
          /*  entity: {
                sourceWay: sourceWay.CREATE.name,
                operatingArea: 0,
                distance: 0,
                companyUuid: loginCompany().uuid,
                owner: getDefOwner(),
            }*/
          entity:/*this.props.batchNumberConfig.entity*/{}
        }
    }

    componentDidMount() {
        // 编辑时获取信息；获取下拉框的内容
        this.refresh(this.props.batchNumberConfig.entityUuid);
    }

    /**
     * 查询后刷新数据！！
     *
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.batchNumberConfig.entity && this.props.batchNumberConfig.entityUuid) {
            this.setState({
                entity: nextProps.batchNumberConfig.entity
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
                type: 'batchNumberConfig/getById',
                payload: id
            });
        }

    }

    /**
     * 返回按钮事件
     */
    onCancel = (uuid)=>{
        const payload = {
            showPage: 'query',
            entity:{}
        }
            if (uuid != '') {
            payload.entityUuid = uuid;
        }
            this.props.dispatch({
            type: 'batchNumberConfig/showPage',
            payload: {
                ...payload
        }
        });
        this.setState({entity:{}});
        console.log("this.state ",this.state);
    }

    /**
      * 保存
      */
    onSave = (data) => {

        //let store = this.arrangeData(data);
        let Pdata = {...data,companyUuid: loginCompany().uuid}
       // Pdata.address = Pdata.address.country+Pdata.address.province+Pdata.address.city+Pdata.address.district+Pdata.address.street
        console.log("保存的data内容为",data,'----',Pdata)
       /* if (!data.address.country || !data.address.province
            || !data.address.city) {
            message.error("地址不能为空");
        } else if (!data.address.street) {
            message.error("详细地址不能为空");
        } else {*/
        console.log("进入",this.props.batchNumberConfig.entityUuid);
            if (!this.props.batchNumberConfig.entityUuid) {
              console.log("进入this.props.batchNumberConfig.entityUuid");
                this.props.dispatch({
                    type: 'batchNumberConfig/onSave',
                    payload: Pdata,
                    callback: (response) => {
                         console.log("response",response);
                        if (response && response.data>0) {
                            message.success(commonLocale.saveSuccessLocale);
                        }
                    }
                });
            } else {
                console.log("进入了修改")
                Pdata={...Pdata,id:this.props.zztest.entityUuid}
                this.props.dispatch({
                    type: 'batchNumberConfig/onModify',
                    payload: Pdata,
                    callback: (response) => {
                        if (response && response.success) {
                            message.success(commonLocale.modifySuccessLocale);
                        }
                    }
                });
            }
       /* }*/
    }

    /**
      * 绘制表单
      */
    drawFormItems = () => {
        const { form } = this.props;
        const { getFieldDecorator } = this.props.form;

        const { entity} = this.state;
      const customOptions = [];
      const {orgTypes} = this.state;
      if (orgTypes.indexOf(orgType.company.name) !== -1) {
        customOptions.push({
          key: JSON.stringify({
            uuid: loginOrg().uuid,
            code: loginOrg().code,
            name: loginOrg().name,
            type: loginOrg().type
          }),
          caption: '[' + loginOrg().code + ']' + loginOrg().name + " " + getOrgCaption(loginOrg().type)
        })
      }

      /* let ownersInitialValues = [];
       if (entity && entity.owners) {
           entity.owners.map(value => {
               ownersInitialValues.push(JSON.stringify({
                   uuid: value.owner.uuid,
                   code: value.owner.code,
                   name: value.owner.name
               }));
           });
       }*/

        // console.log("code是什么",entity.code)


		// 编辑情况下，代码不可修改
        let codeItem = null;

       // console.log("entity",entity);
        let entityse = entity[0];

        /*if (entity.id) {
            codeItem = <CFormItem key="companyuuid" label='companyuuid'>
                    {form.getFieldDecorator('companyuuid',{initialValue:"entity.companyuuiddsf" })(//entity.companyuuid
                        <div>
                            <Col>{entity.companyuuid ? entity.companyuuid : '空'}</Col>
                            <Input type='hidden'/>
                        </div>

                    )}
                </CFormItem>;
        } else {

        }*/

        // 绘制所有字段
        let cols = [
          codeItem =  <CFormItem key='companyuuid' label='企业id'>
            {
              getFieldDecorator('companyuuid', {
                initialValue:loginCompany().uuid,
                rules: [ { required: true, message: notNullLocale(commonLocale.nameLocale) }, {
                  max: 30, message: tooLongLocale(commonLocale.nameLocale, 30),
                }],
              })(
                <Input disabled ={true}  placeholder={placeholderLocale(commonLocale.nameLocale)} />
              )
            }
          </CFormItem>,
          <CFormItem key='dcuuid' label="所属组织">
            {
              getFieldDecorator('dcuuid', {
                initialValue: entityse==undefined?"":entityse.dcuuid,
                rules: [{ required: true, message: notNullLocale("组织id不能为空") },/*{pattern:/^\d+$|^\d+[.]?\d+$/,message:"请输入正确的年龄"} */],
                // {
                //     max: 3, message: tooLongLocale(zzLocale.age, 3),
                // }
              })(
                <OrgConfigSelect
                  types={this.state.orgTypes ? this.state.orgTypes : []}
                  upperUuid={loginOrg().uuid}
                  customOptions={customOptions}
                  state={basicState.ONLINE.name}
                  disabled={this.state.disabled}
                  forItemTable={false}
                  placeholder={placeholderChooseLocale(userLocale.userType)}
                />
              )
            }
          </CFormItem>,
          <CFormItem key='ownercode' label='货主'>
            {getFieldDecorator('ownercode', {
              rules: [
                { required: true, message: notNullLocale('ownercode') },
              ],
              initialValue: entityse==undefined?"":entityse.ownercode,
            })(/* <PreTypeSelect
                    preType={PRETYPE.zztest}
                   // orgUuid={loginOrg().type=='DC' || loginOrg().type == 'DISPATCH_CENTER'?loginCompany().uuid:loginOrg().uuid}
                  />*/            <OwnerConfigSelect /*onChange={this.handlechangeOwner}*/ onlyOnline placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} />
            )}
          </CFormItem>,
          <CFormItem key='first' label='前缀'>
            {
              getFieldDecorator('first', {
                initialValue: entityse==undefined?"":entityse.first,
                rules: [/*{ required: true, message: notNullLocale('前缀不能为空') },*/
                  /*{pattern:/^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/, message:'请输入正确的手机号'}*/], //校验手机号
              })(
                <Input placeholder={placeholderLocale("前缀")} />
              )
            }
          </CFormItem>,
          <CFormItem key='middle' label='中间'>
            {
              getFieldDecorator('middle', {
                initialValue: entityse==undefined?"":entityse.middle,
                rules: [
                  /*{pattern:/^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/, message:'请输入正确的手机号'}*/], //校验手机号
              })(
                <Input placeholder={placeholderLocale("中间")} />
              )
            }
          </CFormItem>,

          /*  <CFormItem key='address' label={commonLocale.addressLocale}>
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
            </CFormItem>,*/
             <CFormItem key='behind' label='后缀'>
             {
                 getFieldDecorator('behind', {
                     initialValue: entityse==undefined?"":entityse.behind,
                     rules: [/*{ required: true, message: notNullLocale('后缀不能为空') },*/
                     /*{pattern:/^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/, message:'请输入正确的手机号'}*/], //校验手机号
                 })(
                     <Input placeholder={placeholderLocale("后缀")} />
                 )
             }
         </CFormItem>,
          <CFormItem key='state' label='状态'>
            {
              getFieldDecorator('state', {
                initialValue: entityse==undefined?"":entityse.state,
                rules: [{ required: true, message: notNullLocale('状态不能为空') },
                  /*{pattern:/^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/, message:'请输入正确的手机号'}*/], //校验手机号
              })(
                <Select placeholder={placeholderLocale("状态")}>
                  <Option value="0">禁用</Option>
                  <Option value="1">启用</Option>
                </Select>
              )
            }
          </CFormItem>
        ];

        return [
            <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={cols} noteCol={this.drawNotePanel()} noteLabelSpan={4} />
        ];
    }


}
