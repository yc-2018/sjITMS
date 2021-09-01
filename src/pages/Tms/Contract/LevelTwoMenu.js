import React, {Component,Fragment} from 'react';
import { Form, Button, Input, message,Radio, Layout } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/components/MyComponent/Page';
import { connect } from 'dva';
import TextArea from 'antd/lib/input/TextArea';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { commonLocale, notNullLocale,tooLongLocale,placeholderLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { STOCKORDER_RES } from '@/pages/Out/StockOrder/StockOrderPermission';
import styles from './Contract.less';
import LevelOneMenuCreateForm from './LevelOneMenuCreateForm';
import { codePattern_4 } from '@/utils/PatternContants';
import {stockOrderLocale} from '@/pages/Out/StockOrder/StockOrderLocale';
import PriceSet from './PriceSet';
import PriceSetDtl from './PriceSetDtl';

const FormItem = Form.Item;
const Search = Input.Search;
const RadioGroup = Radio.Group;
const { Content } = Layout;

@connect(({ stockAllocateOrder, loading }) => ({
  stockAllocateOrder,
  loading: loading.models.stockAllocateOrder,
}))
@Form.create()
export default class LevelTwoMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      entity: {},
      operate: '',
      modalVisible: false, //确认删除提示框
      createModalVisible: false, //新增 编辑顺序的modal
      showLevelTwo: true,
    }
  }
  componentDidMount = () => {
    this.getScheme();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.stockAllocateOrder.stockScheme) {
      this.setState({
        entity: nextProps.stockAllocateOrder.stockScheme
      })
    }
    if (this.props.scheme != nextProps.scheme && nextProps.scheme) {
      this.getScheme(nextProps.scheme.uuid);
    }
    if (nextProps.scheme==undefined){
      this.setState({
        entity:{}
      })
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
      type: 'stockAllocateOrder/getScheme',
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
      type: 'stockAllocateOrder/removeScheme',
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

      let type = 'stockAllocateOrder/saveScheme';
      if (entity.uuid) {
        type = 'stockAllocateOrder/modifyScheme';
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
            // TODO:留在当前新增的界面
          }
          this.setState({
            submitting: false,
          })
        },
      });
    });
  }

  /**
   * 获取线路
   */
  onLineRef = (ref)=>{
    this.lineBill=ref;
  }

  /**
   * 获取门店线路
   */
  onStoreLineRef = (ref)=>{
    this.storelineBill=ref;
  }

  /**
   * 刷新线路列表页
   */
  refreshLineBillPage = (showImport, serialArch)=>{
    if(showImport && serialArch) {
      this.setState({
        showImport: showImport,
        serialArch: serialArch
      })
    } else {
      this.lineBill.refresh&&this.lineBill.refresh();
    }

  }

  /**
   * 刷新门店线路列表页
   */
  refreshStoreLineBillPage = (leftList)=>{
    if(leftList) {
      this.setState({
        leftList: leftList
      })
    }
    this.storelineBill.refresh&&this.storelineBill.refresh('', leftList);
  }

  /**
   * 选中左侧一级菜单栏
   */
  priceSetting = () => {
    this.setState({
      showLevelTwo: false
    })
  }

  render() {
    const { stockAllocateOrder: { data }, loading, scheme } = this.props;
    const {entity,createModalVisible, showLevelTwo} = this.state;
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
    return ( showLevelTwo ?
        <div>
          <div style={{marginTop:'-30px'}} className={styles.navigatorPanelWrapper}>
            <span className={styles.title}>{scheme?'['+entity.code+']'+entity.name:''}</span>
          </div>
          <div className={styles.rightContentButton}>
            <Button style={{marginRight:'3%',float:'right'}} onClick={this.priceSetting}>
              {'计价设置'}
            </Button>
          </div>
          <div className={styles.content}>
            <Form {...formItemLayout} onSubmit={this.handleSubmit}>
              <FormItem
                {...formItemLayout}
                label={'名称'}
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
                label={'数据类型'}
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
                label={'计算字段'}
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
                label={'计算方式'}
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
                label={'舍入方式'}
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
                label={'舍入小数点位数'}
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
                label={'保底值'}
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
                label={'使用大类'}
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
                label={'使用单位换算'}
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
                label={'计算维度'}
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
                wrapperCol={{
                  xs: { span: 24, offset: 0 },
                  sm: { span:16, offset: 11 },
                }}
              >
                <Button style={{marginLeft:'-24px'}} loading={this.state.submitting} type="primary" htmlType="submit"
                >{commonLocale.saveLocale}</Button>.
              </FormItem>
            </Form>
          </div>
          <div>
            <LevelOneMenuCreateForm
              {...createParentMethods}
              createModalVisible={createModalVisible}
              confirmLoading={false}
              selectedSchme={scheme}
            />
            <ConfirmModal
              visible={this.state.modalVisible}
              operate={this.state.operate}
              object={stockOrderLocale.scheme+':'+'['+entity.code+']'+entity.name}
              onOk={this.handleOk}
              onCancel={this.handleModalVisible}
            />
          </div>
        </div> : <PageHeaderWrapper>
          <Page>
            <Content>
              <div style={{height:'50px'}}>
                {'按体积'}
              </div>
              <div style={{display:'flex', flexDirection:'row'}}>
                <div style={{flex:1}} className={styles.leftWrapper}>
                  <PriceSet />
                </div>
                <div style={{flex:1}} className={styles.leftWrapper}>
                  <PriceSetDtl />
                </div>
              </div>
            </Content>
          </Page>
        </PageHeaderWrapper>
    )
  }
}
