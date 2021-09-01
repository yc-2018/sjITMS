import React, {Component,Fragment} from 'react';
import { Form, Button, Input, message,Radio, Layout } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/components/MyComponent/Page';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import { commonLocale, notNullLocale,tooLongLocale,placeholderLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { STOCKORDER_RES } from '@/pages/Out/StockOrder/StockOrderPermission';
import styles from './StockOrder.less';
import { codePattern_4 } from '@/utils/PatternContants';
import {stockOrderLocale} from '@/pages/Out/StockOrder/StockOrderLocale';
import PriceSet from './PriceSet';
import PriceSetDtl from './PriceSetDtl';
import VehicleDispatchSearchForm from '../VehicleDispatching/VehicleDispatchSearchForm';
import { vehicleDispatchingLocale } from '../VehicleDispatching/VehicleDispatchingLocale';

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

    return ( <PageHeaderWrapper>
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
