import React, {Component,Fragment} from 'react';
import { Form, Button, Input, message,Radio } from 'antd';
import { connect } from 'dva';
import TextArea from 'antd/lib/input/TextArea';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { commonLocale, notNullLocale,tooLongLocale,placeholderLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { codePattern_4 } from '@/utils/PatternContants';
import styles from './PickOrder.less';
import { PICKORDER_RES } from './PickOrderPermission';
import PickOrderCreateForm from './PickOrderCreateForm';
import { pickOrderLocale } from './PickOrderLocale';

const FormItem = Form.Item;
const Search = Input.Search;
const RadioGroup = Radio.Group;

@connect(({ storepickorder, loading }) => ({
  storepickorder,
  loading: loading.models.storepickorder,
}))
@Form.create()
export default class PickOrderScheme extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      entity: {},
      operate: '',
      modalVisible: false, //确认删除提示框
      createModalVisible: false, //新增 编辑顺序的modal
    }
  }
  componentDidMount = () => {
    this.getScheme();
  }
  componentDidUpdate(){
    if(document.getElementById('code')!=null&&(document.activeElement.tagName =='BUTTON' || document.activeElement.tagName =='A'||document.activeElement.id == 'code')){
      document.getElementById('code').focus();
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.storepickorder.schemeEntity) {
      this.setState({
        entity: nextProps.storepickorder.schemeEntity
      })
    }
    if (this.props.scheme != nextProps.scheme && nextProps.scheme) {
      this.getScheme(nextProps.scheme.uuid);
    }
    if (nextProps.scheme == undefined) {
      this.setState({
        entity:{}
      });
    }
    if (nextProps.scheme == undefined && this.props.scheme != undefined) {
      this.props.form.resetFields();
    }
  }

  /**
   * 查询一条方案的信息
   */
  getScheme=(uuid)=>{
    const { dispatch,scheme,form} = this.props;
    form.resetFields();
    dispatch({
      type: 'storepickorder/getScheme',
      payload: {
        uuid: uuid ? uuid : (scheme?scheme.uuid:null)
      },
    });
  }

  /**
   * 新增拣货顺序的弹窗显示控制
   */
  handleCreateModalVisible = (flag) => {
    this.setState({
      createModalVisible: !!flag,
    });
  };

  /**
  * 模态框显示/隐藏
  */
  handleModalVisible =(operate)=>{
    if(operate){
      this.setState({
        operate:operate
      })
    }
    this.setState({
      modalVisible:!this.state.modalVisible
    });
  }
  /**
  * 模态框确认操作
  */
  handleOk = () =>{
    const {operate,entity} = this.state;
    if (operate === commonLocale.deleteLocale){
      this.handleRemove(entity);
    }
  }

  /**
   * 删除
   */
  handleRemove = (entity) =>{
    const { dispatch } = this.props;
    dispatch({
      type: 'storepickorder/onRemove',
      payload: {
        uuid:entity.uuid,
        version:entity.version
      },
      callback: response => {
        if (response&&response.success) {
          message.success(formatMessage({ id: 'common.message.success.delete' }));
          this.props.reFreshSider();
        }
      },
    });
    this.setState({
      modalVisible:!this.state.modalVisible
    })
  }

  // --- 批量导入相关 ---
  handleShowExcelImportPage = (schemeUuid) => {
    this.props.dispatch({
      type: 'storepickorder/showPage',
      payload: {
        showPage: 'import',
        importAllocateOrderUuid: schemeUuid,
      }
    });
  }

  /**
   * 保存
   */
  handleSubmit = (e) => {
    e.preventDefault();
    
    const { form,dispatch } = this.props;
    const { entity } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      this.setState({
        submitting: true,
      })

      let type = 'storepickorder/onSave';
      if (entity.uuid) {
        type = 'storepickorder/onModify';
        fieldsValue.uuid = entity.uuid
      }
      const values = {
        ...fieldsValue,
        companyUuid: loginCompany().uuid,
        dcUuid:loginOrg().uuid,
        version: entity.version
      };
      dispatch({
        type: type,
        payload: { ...values },
        callback: (response) => {
          if (response && response.success) {
            message.success(formatMessage({ id: 'common.message.success.operate' }));
            form.resetFields();
            this.props.reFreshSider();
          }
          this.setState({
            submitting: false,
          })
        },
      });
    });
  }

  render() {
    const { storepickorder: { data }, loading } = this.props;
    const {entity,createModalVisible} = this.state
    const { scheme } = this.props
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
    };

    const createParentMethods = {
      handleSaveOrder: this.props.handleSaveOrder,
      handleCreateModalVisible: this.handleCreateModalVisible,
    };
    return (
      <div>
        <div style={{marginTop:'0px'}} className={styles.navigatorPanelWrapper}>
          <span className={styles.title}>{scheme?'['+entity.code+']'+entity.name:pickOrderLocale.addScheme}</span>
        </div>
        {scheme?<div className={styles.rightContentButton}>
          <Button disabled={!havePermission(PICKORDER_RES.CREATE)}
            style={{marginLeft:'1%',float:'right'}}
            onClick={() => this.handleShowExcelImportPage(scheme ? scheme.uuid : null)}>
            {commonLocale.importStore}
          </Button>
          <Button style={{marginLeft:'1%',float:'right'}} type="primary"  
            onClick={() => this.handleCreateModalVisible(true)}
            disabled={!havePermission(PICKORDER_RES.CREATE)}
          >
            {pickOrderLocale.addStoreGroup}
          </Button>
          <Button style={{float:'right'}}
            onClick={()=>this.handleModalVisible(commonLocale.deleteLocale)}
            disabled={!havePermission(PICKORDER_RES.DELETE)}
          >
            {commonLocale.deleteLocale}
          </Button>
        </div>:null}
        <div className={styles.content}>
          <Form {...formItemLayout} onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              label={pickOrderLocale.schemeCode}
            >
              {
                getFieldDecorator('code', {
                  rules: [{ required: true, message:notNullLocale(commonLocale.codeLocale)},
                    {
                      pattern: codePattern_4.pattern,
                      message: codePattern_4.message
                    }],
                  initialValue: entity.code,
                })(
                  <Input placeholder={placeholderLocale(commonLocale.codeLocale)}/>
                )
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={pickOrderLocale.schemeName}
            >
              {
                getFieldDecorator('name', {
                  rules: [{ required: true, message:notNullLocale(commonLocale.nameLocale)}, {
                  max: 30, message: tooLongLocale(commonLocale.nameLocale,30),
                  }],
                  initialValue: entity.name,
                })(
                  <Input placeholder={placeholderLocale(commonLocale.nameLocale)}/>
                )
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={commonLocale.noteLocale}
            >
              {
                getFieldDecorator('note', {
                  rules: [ {
                  max: 255, message: tooLongLocale(commonLocale.noteLocale,255),
                  }],
                  initialValue: entity.note,
                })(
                  <TextArea placeholder={placeholderLocale(commonLocale.noteLocale)}/>
                )
              }
            </FormItem>
            <FormItem
              wrapperCol={{
                xs: { span: 24, offset: 0 },
                sm: { span:16, offset: 11 },
              }}
            >
              <Button style={{marginLeft:'-24px'}} loading={this.state.submitting} type="primary" htmlType="submit"
                disabled={!havePermission(PICKORDER_RES.CREATE)}>{commonLocale.saveLocale}</Button>
            </FormItem>
          </Form>
        </div>
        <div>
          <PickOrderCreateForm
            {...createParentMethods}
            createModalVisible={createModalVisible}
            confirmLoading={false}
            selectedSchme={scheme}
          />
          <ConfirmModal
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={pickOrderLocale.scheme+':'+'['+entity.code+']'+entity.name}
            onOk={this.handleOk}
            onCancel={this.handleModalVisible}
          />
        </div>
      </div>
    )
  }
}
