import React, { PureComponent } from 'react';
import { Form, Input, Modal ,Select} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale,placeholderChooseLocale } from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import { SerialArchLocale,BillSort } from './BillSortLocal';
import { convertCodeName } from '@/utils/utils';
import ArticleSelect from '@/pages/Component/Select/ArticleSelect';
import StoreSelect from '@/pages/Component/Select/StoreSelect';
import SmallSortSelect from '@/pages/Component/Select/SmallSortSelect';
import VehicleTypeSelect from '@/pages/Component/Select/VehicleTypeSelect';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
const FormItem = Form.Item;
@Form.create()

class SmallSortObjectCreateModal extends PureComponent {
    constructor(props){
        super(props)
        this.state={
            data:{}
        }
    }
    okHandle = () => {
        const {
            form,
            selectedSmallSort,
            saveSmallSortObject,
            handleCreateModalVisible,
        } = this.props;
        const type = 'billSort/smallObject'
        form.validateFields((errors, fieldsValue) => {
            if (errors) return;

           if(fieldsValue.smallObjectUuid){
            fieldsValue.smallObjectUuid = JSON.parse(fieldsValue.smallObjectUuid).uuid;
           }
            const data = {
                companyUuid: loginCompany().uuid,
                ...fieldsValue,
            };

            saveSmallSortObject(type,data);
            handleCreateModalVisible();

        });
    };

    onFieldChange=(name,e)=>{
        const {data} = this.state;
       data[name]= e;
    }

    handleCancel = () => {
        const { form, handleCreateModalVisible } = this.props;

        handleCreateModalVisible();
        form.resetFields();
    };

    render() {
        const {
            form,
            createModalVisible,
            handleCreateModalVisible,
            selectedBigSort,
            smallSortUuid
        } = this.props;
        let title = BillSort.addSmallSortObject;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 15 },
        };
        return (
            <Modal
            title={title}
            visible={createModalVisible}
            onOk={this.okHandle}
            onCancel={() => this.handleCancel()}
            destroyOnClose
        >
            <div>
                <Form>
                    <FormItem {...formItemLayout} label={'小类'}>
                        {form.getFieldDecorator('smallSortUuid', {
                            rules: [
                                { required: true, message: notNullLocale('小类') },
                            ],
                            initialValue:smallSortUuid?smallSortUuid:undefined,
                        })(<SmallSortSelect 
                            bigSortUuid={selectedBigSort?selectedBigSort.uuid:undefined} 
                            onChange={(e)=>this.onFieldChange('smallSortUuid',e)}
                            placeholder={placeholderChooseLocale('小类')}
                        single />)}
                    </FormItem>
                   {
                       selectedBigSort.type==='Goods'?<FormItem {...formItemLayout} label={'小类对象'}>
                       {form.getFieldDecorator('smallObjectUuid', {
                           rules: [
                               { required: true, message: notNullLocale('小类对象')},
                           ],
                           initialValue:undefined,
                       })(
                           
                       <ArticleSelect onChange={(e)=>this.onFieldChange('smallObjectUuid',e)} placeholder={placeholderChooseLocale('小类对象')}  single/>
                       )}
                   </FormItem>:null
                   } 
                    {
                      selectedBigSort.type==='Store'?<FormItem {...formItemLayout} label={'小类对象'}>
                       {form.getFieldDecorator('smallObjectUuid', {
                           rules: [
                               { required: true, message: notNullLocale('小类对象')},
                           ],
                           initialValue:undefined,
                       })(
                           
                      <StoreSelect onChange={(e)=>this.onFieldChange('smallObjectUuid',e)} placeholder={placeholderChooseLocale('小类对象')} single/>
                       )}
                   </FormItem>:null
                   } 
                    {
                      selectedBigSort.type==='Model'?<FormItem {...formItemLayout} label={'小类对象'}>
                       {form.getFieldDecorator('smallObjectUuid', {
                           rules: [
                               { required: true, message: notNullLocale('小类对象')},
                           ],
                           initialValue:undefined,
                       })(
                           
                      <VehicleTypeSelect onChange={(e)=>this.onFieldChange('smallObjectUuid',e)} placeholder={placeholderChooseLocale('小类对象')} single/>
                       )}
                   </FormItem>:null
                   } 
                </Form>
            </div>
        </Modal>
        )
    }
};
export default SmallSortObjectCreateModal;
