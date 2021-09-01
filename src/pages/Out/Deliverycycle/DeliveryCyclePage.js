import React, {Component,Fragment} from 'react';
import { Form, Button, Input, message,Radio } from 'antd';
import { connect } from 'dva';
import TextArea from 'antd/lib/input/TextArea';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { codePattern_4 } from '@/utils/PatternContants';
import { commonLocale, notNullLocale,tooLongLocale,placeholderLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { DELIVERYCYCLE_RES } from './DeliverycyclePermission';
import styles from './Deliverycycle.less';
import StoreGroupCreateForm from './StoreGroupCreateForm';
import { deliverycycleLocale } from './DeliverycycleLocale';

const FormItem = Form.Item;
const Search = Input.Search;
const RadioGroup = Radio.Group;

@connect(({ deliverycycle, loading }) => ({
  deliverycycle,
  loading: loading.models.deliverycycle,
}))
@Form.create()
export default class DeliveryCyclePage extends Component {
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
    this.getDeliveryCycle();
  }
  componentDidUpdate(){
    if(document.getElementById('code')!=null&&(document.activeElement.tagName =='BUTTON' || document.activeElement.tagName =='A'||document.activeElement.id == 'code')){
      document.getElementById('code').focus();
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.deliverycycle.entity) {
      this.setState({
        entity: nextProps.deliverycycle.entity
      })
    }
    if (this.props.cycle != nextProps.cycle && nextProps.cycle) {
      this.getDeliveryCycle(nextProps.cycle.uuid);
    }
    if (nextProps.cycle == undefined) {
      this.setState({
        entity:{}
      });
    }
    if (nextProps.cycle == undefined && this.props.cycle != undefined) {
      this.props.form.resetFields();
    }
  }

  /**
   * 查询一条方案的信息
   */
  getDeliveryCycle=(uuid)=>{
    const { dispatch,cycle,form} = this.props;
    form.resetFields();
    let payloadUuid = uuid ? uuid : (cycle?cycle.uuid:null);
    if(payloadUuid){
      dispatch({
        type: 'deliverycycle/getDeliveryCycle',
        payload: {
          uuid: payloadUuid
        }
      });
    }
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
  * 显示波次类型管理界面
  */
  onShowTypeView = () => {
    let { dispatch } = this.props;
    dispatch({
      type: 'deliverycycle/onShowTypeView',
    });
  }

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
      type: 'deliverycycle/onRemove',
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
  handleShowExcelImportPage = (deliveryCycleGroupUuid) => {
    this.props.dispatch({
      type: 'deliverycycle/showPage',
      payload: {
        showPage: 'import',
        importStoreGroupUuid: deliveryCycleGroupUuid,
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

      let type = 'deliverycycle/onSave';
      if (entity.uuid) {
        type = 'deliverycycle/onModify';
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
    const { deliverycycle: { data }, loading } = this.props;
    const {entity,createModalVisible} = this.state
    const { cycle } = this.props
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
      handleSaveGroup: this.props.handleSaveGroup,
      handleCreateModalVisible: this.handleCreateModalVisible,
    };
    return (
      <div>
        <div style={{marginTop:'0px'}} className={styles.navigatorPanelWrapper}>
          <span className={styles.title}>{cycle?'['+entity.code+']'+entity.name:deliverycycleLocale.addDeliverycycle}</span>
          <Button style={{float:'right',marginTop:'1%'}} onClick={this.onShowTypeView}>
            {deliverycycleLocale.deliverycyclePreserveWave}
          </Button>
        </div>
        {cycle?<div className={styles.rightContentButton}>
          <Button style={{marginLeft:'1%',float:'right'}}
            disabled={!havePermission(DELIVERYCYCLE_RES.CREATE)}
            onClick={() => this.handleShowExcelImportPage(cycle?cycle.uuid:null)} >
            {commonLocale.importStore}
          </Button>
          <Button style={{marginLeft:'1%',float:'right'}} type="primary"  
            disabled={!havePermission(DELIVERYCYCLE_RES.CREATE)}
            onClick={() => this.handleCreateModalVisible(true)} >
            {deliverycycleLocale.addStoreGroup}
          </Button>
          <Button style={{float:'right'}}
            onClick={()=>this.handleModalVisible(commonLocale.deleteLocale)}
            disabled={!havePermission(DELIVERYCYCLE_RES.DELETE)}
          >
            {commonLocale.deleteLocale}
          </Button>
        </div>:null}
        <div className={styles.content}>
          <Form {...formItemLayout} onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              label={deliverycycleLocale.cycleCode}
            >
              {
                getFieldDecorator('code', {
                  rules: [{ required: true, message:notNullLocale(commonLocale.codeLocale)}, {
                  },{
                      pattern: codePattern_4.pattern,
                      message: codePattern_4.message,
                  }],
                  initialValue: entity.code,
                })(
                  <Input placeholder={placeholderLocale(commonLocale.codeLocale)}/>
                )
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={deliverycycleLocale.cycleName}
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
                disabled={!havePermission(DELIVERYCYCLE_RES.CREATE)}>{commonLocale.saveLocale}</Button>
            </FormItem>
          </Form>
        </div>
        <div>
          <StoreGroupCreateForm
            {...createParentMethods}
            createModalVisible={createModalVisible}
            confirmLoading={false}
            selectedCycle={cycle}
          />
          <ConfirmModal
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={deliverycycleLocale.deliverycycleTitle+':'+'['+entity.code+']'+entity.name}
            onOk={this.handleOk}
            onCancel={this.handleModalVisible}
          />
        </div>
      </div>
    )
  }
}
