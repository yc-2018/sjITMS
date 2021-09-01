import { connect } from 'dva';
import moment from 'moment';
import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import TextArea from 'antd/lib/input/TextArea';
import { Modal,message, Form,Tabs,Row,Col,Select,DatePicker,InputNumber } from 'antd';
import { convertCodeName,formatDate } from '@/utils/utils';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import Empty from '@/pages/Component/Form/Empty';
import ArticleSelect from '@/pages/Component/Select/ArticleSelect';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import StoreSelect from '@/pages/Component/Select/StoreSelect';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import AttachmentSelect from '@/pages/Component/Select/AttachmentSelect';
import ShipBillSelect from '@/pages/Component/Select/ShipBillSelect';
import { accDiv, Subtr } from '@/utils/QpcStrUtil';
import { attachmentReturnLocale } from './AttachmentReturnLocale';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const FormItem = Form.Item;
@connect(({ attachmentReturn, loading }) => ({
  attachmentReturn,
  loading: loading.models.attachmentReturn,
}))
@Form.create()

export default class AttachmentReturnCreatePage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isCreateVisible: props.isCreateVisible,
      isEdit: props.isEdit,
      modalLoading:false,

      entity: props.reccord,
    }
  }
  componentWillReceiveProps(nextProps){
    if(nextProps.isCreateVisible!=this.props.isCreateVisible){
      this.setState({
        isCreateVisible:nextProps.isCreateVisible,
      })
    }
    if(nextProps.isEdit!=this.props.isEdit){
      this.setState({
        isEdit:nextProps.isEdit,
      })
    }
    if(nextProps.reccord!=this.props.reccord){
      nextProps.reccord.store.type = 'STORE'
      nextProps.reccord.qtyStr = parseInt(nextProps.reccord.qtyStr);
      this.setState({
        entity:nextProps.reccord,
      })
    }
  }

  /**
   * 保存
   */
  handleOk() {
    
    const { form } = this.props;
    const { isEdit,entity } = this.state;
    form.validateFields((err, fieldsValue) => {
        if (err) return;
        let data = {};
        let type = 'attachmentReturn/onSave';
        if(isEdit){
          type = 'attachmentReturn/onModify';
          entity.qtyStr = Subtr(entity.qtyStr,fieldsValue.targtQtyStr);

          data = {
            ...entity
          };
        }else{
          fieldsValue.store = JSON.parse(fieldsValue.store);
          fieldsValue.attachment = JSON.parse(fieldsValue.attachment);
          this.setState({
            modalLoading: true
          });
          data = {
            ...fieldsValue,
            companyUuid:loginCompany().uuid
          };
        }

        this.props.dispatch({
            type: type,
            payload: data,
            callback: (response) => {
                if (response && response.success) {
                    this.setState({
                        isCreateVisible: false,
                        modalLoading: false,
                        entity:undefined
                    });
                    this.props.form.resetFields();
                    message.success(commonLocale.saveSuccessLocale);
                    this.props.refreshTable();
                } else {
                    this.setState({
                        modalLoading: false
                    });
                }
            }
        });
    });
  }

  /**
   * 取消添加
   */
  handleCancel() {
    this.setState({
        isCreateVisible:false,
        entity:undefined
    });
    this.props.form.resetFields();
    this.props.refreshTable();
  }
  
  render(){
    const baseFormItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };

    const { getFieldDecorator } = this.props.form;
    const { entity,isEdit } = this.state;
    return (
      <Modal
        title={entity&&entity.store?'附件归还':'新建附件归还'}
        visible={this.state.isCreateVisible}
        confirmLoading={this.state.modalLoading}
        destroyOnClose={true}
        onOk={()=>this.handleOk()}
        onCancel={()=>this.handleCancel()}
        okText={commonLocale.confirmLocale}
        cancelText={commonLocale.cancelLocale}
      >
        <Form>
            <FormItem 
                {...baseFormItemLayout}
                label={attachmentReturnLocale.shipBillNumber}>
                {getFieldDecorator('shipBillNumber', {
                    initialValue: entity&&entity.shipBillNumber ? entity.shipBillNumber:undefined,
                    rules: [
                        { required: true, message: notNullLocale(attachmentReturnLocale.shipBillNumber) }
                    ],
                })(
                  isEdit? (entity&&entity.shipBillNumber?<span>{entity.shipBillNumber}</span>:<Empty/>):<ShipBillSelect/>
                )}
            </FormItem>
            <FormItem 
                {...baseFormItemLayout}
                label={attachmentReturnLocale.attachment}>
                {getFieldDecorator('attachment', {
                    initialValue: entity &&entity.attachment ?JSON.stringify(entity.attachment) :undefined,
                    rules: [
                        { required: true, message: notNullLocale(attachmentReturnLocale.attachment) }
                    ],
                })(
                  isEdit? 
                  (entity&&entity.attachment?<span>{convertCodeName(entity.attachment)}</span>:<Empty/>):<AttachmentSelect placeholder={placeholderLocale('附件')}/>
                )}
            </FormItem>
            <FormItem 
                {...baseFormItemLayout}
                label={commonLocale.inStoreLocale}>
                {getFieldDecorator('store', {
                    initialValue: entity &&entity.store ? JSON.stringify(entity.store):undefined,
                    rules: [
                        { required: true, message: notNullLocale(commonLocale.inStoreLocale) }
                    ],
                })(
                  isEdit? 
                  (entity&&entity.store?<span>{convertCodeName(entity.store)}</span>:<Empty/>):<OrgSelect
                    showSearch
                    placeholder={placeholderLocale(commonLocale.inStoreLocale)}
                    upperUuid={loginCompany().uuid}
                    type={'STORE'}
                  />
                )}
            </FormItem>
            <FormItem 
                {...baseFormItemLayout}
                label={attachmentReturnLocale.qtyStr}>
                {getFieldDecorator('qtyStr', {
                    initialValue: entity &&entity.qtyStr ? entity.qtyStr:undefined,
                    rules: [
                        { required: true, message: notNullLocale(attachmentReturnLocale.qtyStr) }
                    ],
                })(
                  isEdit? 
                  (entity&&entity.qtyStr&&entity.qtyStr?<span>{entity.qtyStr}</span>:<Empty/>):
                    <InputNumber
                        min={0}
                        precision={0}
                        max={10000}
                        style={{ width: '100%' }} 
                        placeholder={placeholderLocale(attachmentReturnLocale.qtyStr)} 
                    />
                )}
            </FormItem>
            {isEdit?<FormItem 
                {...baseFormItemLayout}
                label={attachmentReturnLocale.returnQtyStr}>
                {getFieldDecorator('targtQtyStr', {
                    initialValue: entity &&entity.targtQtyStr ? entity.targtQtyStr:undefined,
                    rules: [
                        { required: true, message: notNullLocale(attachmentReturnLocale.returnQtyStr) }
                    ],
                })(
                    <InputNumber
                        min={0}
                        precision={0}
                        max={entity&&entity.qtyStr}
                        style={{ width: '100%' }} 
                        placeholder={placeholderLocale(attachmentReturnLocale.returnQtyStr)} 
                    />
                )}
            </FormItem>:null}
        </Form>
    </Modal>
    );
  }
}