import React, { PureComponent } from 'react';
import { Form, Modal, Select} from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, notNullLocale } from '@/utils/CommonLocale';
import { dispatcherConfigLocale } from './DispatcherConfigLocale';
import { connect } from 'dva';

const FormItem = Form.Item;

@connect(({ dispatcherconfigModal, loading }) => ({
    dispatcherconfigModal,
    loading: loading.models.dispatcherconfigModal,
}))
@Form.create()
export default class DispatcherConfigCreateModal extends PureComponent {
    okHandle = () => {
        const { form } = this.props;
        const { entity } = this.props;
        form.validateFields((errors,data) => {
           
            entity.volume = data.volume
            entity.weight = data.weight
            const dispatchcenteruuid = JSON.parse(data.dispatchcenteruuid);
            entity.dispatchcenteruuid = dispatchcenteruuid.uuid
            entity.name = dispatchcenteruuid.name
            entity.companyuuid = dispatchcenteruuid.companyUuid
            entity.code = dispatchcenteruuid.code;
            if (errors) return;

            this.props.handleSave();
        });
    };
    state ={
       
    }
    handleCancel = () => {
        const { form, handleCreateModalVisible } = this.props;
        form.resetFields();
        handleCreateModalVisible();
    };

    onDcChange = (value) => {
        const { entity } = this.props;
        if (!entity)
            return;
        entity.dc = JSON.parse(value);
    }
  componentWillReceiveProps(nextProps) {
        this.setState({
            dispatchData: nextProps.dispatcherconfigModal.dispatchData,

        });
      //this.query();
    }
    onDispatcherChange = (value) => {
        const { entity } = this.props;
        if (!entity)
            return;

        entity.dispatcher = JSON.parse(value);
    }
    
    componentDidMount =()=>{
        this.props.dispatch({
            type:"dispatcherconfigModal/getByCompanyUuid",
            payload:this.props.loginCompanyUuid,
        })
    }
   
    render() {
        const {
            form,
            modalVisible,
            entity,
            loading,
        } = this.props;

        const { getFieldDecorator } = form;

        const baseFormItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 7 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };
       
        console.log("state",this.state)
        return (
           
            <Modal
                title={commonLocale.addLocale}
                visible={modalVisible}
                onOk={this.okHandle}
                onCancel={this.handleCancel}
                confirmLoading={loading}
                destroyOnClose
            >
                <Form {...baseFormItemLayout}>
                    {/* <FormItem
                        label={dispatcherConfigLocale.dispatcher}>
                        {getFieldDecorator('dispatcher', {
                            rules: [{ required: true, message: notNullLocale(dispatcherConfigLocale.dispatcher) },
                            ]
                        })(
                            <UserSelect
                                single={true}
                                onChange={this.onDispatcherChange}
                            />
                        )}
                    </FormItem> */}
                    <FormItem
                        label={"调度中心"}>
                        {getFieldDecorator('dispatchcenteruuid', {
                            rules: [{ required: true, message: notNullLocale(dispatcherConfigLocale.dc) },
                            ]
                        })(
                            <Select>
                              {this.state.dispatchData?.map(e=>{
                                return <Select.Option value={JSON.stringify(e)} key={e.uuid}>
                                { '['+e.code+"]"+e.name }
                                </Select.Option>
                              })}  
                            </Select>
                                
                           
                        )}
                    </FormItem>
                    <FormItem
                        label={"体积"}>
                        {getFieldDecorator('volume', {
                            initialValue:0
                        })(
                            <Select>
                                <Select.Option value={0}>
                                    {"否"}
                                </Select.Option>
                                <Select.Option value={1}>
                                        {"是"}
                                    </Select.Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem
                        label={"重量"}>
                        {getFieldDecorator('weight', {
                           initialValue:0
                        })(
                            <Select>
                                <Select.Option value={0}>
                                    {"否"}
                                </Select.Option>
                                <Select.Option value={1}>
                                        {"是"}
                                    </Select.Option>
                            </Select>
                        )}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
};
