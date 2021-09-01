import { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Menu, Input, Pagination, Layout, Form, message,Popconfirm } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import ConfigSiderPage from '@/pages/Component/Page/inner/ConfigSiderPage';
import UserSelect from '@/pages/Component/Select/UserSelect';
import PickareaSelect from '@/pages/Component/Select/PickareaSelect';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { pickScopeConfigLocale } from './PickScopeConfigLocale';
import styles from './pickScopeConfig.less';
import { havePermission } from '@/utils/authority';
import { CONFIG_RES } from '../ConfigPermission';
import {configLocale} from '@/pages/Facility/Config/ConfigLocale';
import PickScopeConfigModal from './PickScopeConfigModal';
import { file } from '@babel/types';
const { Content, Sider } = Layout;
const Search = Input.Search;

@connect(({ pickScopeConfig }) => ({
  pickScopeConfig
}))
@Form.create()
export default class PickScopeConfig extends ConfigSiderPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      submitting: false,
      title: configLocale.taskConfig.pickScopeConfig.name,
      pageFilter: {
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        },
        page: 0,
        pageSize: 20
      },
      data: {
        list: [],
        pagination:{}
      },//分页信息
      visible: false,
      entity: {},
      selectedKeys: [undefined, undefined],//0:代表上一次选中的值，1：代表当前选中的值，区分取消按钮和删除按钮的展示。
      operate: '',
      modalVisible: false,
      logCaption: 'PickScopeConfig'
    };
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    let { data, visible, selectedKeys } = this.state;
    const nextData = nextProps.pickScopeConfig.data;


    if (!this.checkEqualArr(data.list,nextData.list)){
      if (nextData.list.length > 0) {

        this.get(nextData.list[0].picker.uuid);
        selectedKeys[1] = nextData.list[0].picker.uuid;
      } else {
        selectedKeys[1] = undefined;
      }
      this.setState({
        data: nextData,
      })
    }

    if (nextProps.pickScopeConfig&&nextProps.pickScopeConfig.list) {
      let entity = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
      }
      if (nextProps.pickScopeConfig.list.length > 0) {
        entity.picker = nextProps.pickScopeConfig.list[0].picker;
      }
      let pickAreas = nextProps.pickScopeConfig.list.map((val) => {
        let obj = JSON.stringify(val.pickarea);
        return obj;
      })
      entity.pickAreas = pickAreas;
      // console.log(entity,nextProps,'refresh');
      this.setState({
        entity: { ...entity }
      })
    }
  }

  /**
   * 判断两个数组是否相等---依据uuid判断
   */

   checkEqualArr=(pre,next)=>{
     let flag=true;
    if(pre.length != next.length){
      return false
    }else if(pre.length > 0 && next.length > 0){
     flag = !pre.some(e=>{
        return !next.some(item=>item.uuid === e.uuid)
      })
    }
    return flag
   }

  refresh() {
    this.props.dispatch({
      type: 'pickScopeConfig/query',
      payload: this.state.pageFilter
    })
  }

  renderSilderMenu = () => {
    const list = this.state.data.list;
    let pickers = [];
    list.map((item) => {
      pickers.push(
        <Menu.Item key={item.picker.uuid}>
        <div  style={{display:'flex',justifyContent:'space-between'}}
        onMouseEnter={(e)=>this.handleMouseEnterMenu(item.uuid,e)}
        onMouseLeave={(e)=>this.handleMouseLeaveMenu(item.uuid,e)}
        >
        <span style={{width:'80%',overflow:'hidden',textOverflow:'ellipsis'}}>{convertCodeName(item.picker)}</span>
        {
                item.display === 'inline'&&havePermission(CONFIG_RES.PICKSCOPECONFIGEDIT)?
                  <span style = {{float: 'right'}}>
                   <Popconfirm
                      title={`确定删除该拣货员作业配置:${convertCodeName(item.picker)}吗?`}
                      onConfirm={() => this.onRemove()}
                      okText="确定"
                      cancelText="取消"
                    >
                    <a className={styles.menuItemA}
                    >
                      {commonLocale.deleteLocale}
                    </a>
                    </Popconfirm>
                  </span>:null
              }
        </div>
        </Menu.Item>
      )
    });
    return pickers;
  }
   /**
   * 当鼠标浮在目录时调用
   */
  handleMouseEnterMenu =(uuid,e)=>{
    const { list } = this.state.data;
    list.map((item)=>{
      if(item.uuid === uuid){
        item.display ='inline'
      }
    })
    this.setState({
      data:{
        list:[...list]
      }

    })
  }
  /**
   * 当鼠标离开目录时调用
   */
  handleMouseLeaveMenu=(uuid,e)=>{
    const { list } = this.state.data;
    list.map((item)=>{
      if(item.uuid === uuid){
        item.display ='none'
      }
    })
    this.setState({
      list:[...list]
    })
  }

  onQueryChange = (field, value) => {
    const { pageFilter } = this.state;
    if (field === 'pickerCodeName') {
      pageFilter.searchKeyValues.pickerCodeName = value;
    } else if (field === 'pagination') {
      pageFilter.page = value - 1;
    }
    this.refresh();
  }

  selectMenu = (e) => {
    const { selectedKeys } = this.state;
    if (e.key !== selectedKeys[1]) {
      selectedKeys[0] = selectedKeys[1];
      selectedKeys[1] = e.key;
      this.get(e.key);
    }
    this.setState({
      selectedKeys:[...selectedKeys]
    })
  }

  get = (uuid) => {
    this.props.dispatch({
      type: 'pickScopeConfig/getByDcUuidAndPickerUuid',
      payload: {
        dcUuid: loginOrg().uuid,
        pickerUuid: uuid
      }
    })
  }

  /**
   * 模态框显示/隐藏
   */
  handleModalVisible = (operate) => {
    if (operate) {
      this.setState({
        operate: operate
      })
    }
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }


  /**
   * 模态框确认操作
   */
  handleOk = () => {
    const { operate } = this.state;
    if (operate === commonLocale.deleteLocale) {
      this.onRemove();
    }
  }

  drawActionButton = () => {
    return(
      <Button
    className={styles.createBtn}
    type="primary"
    icon="plus"
    onClick={() => this.toCreate()}
    //disabled={!havePermission(CONFIG_RES.PICKSCOPECONFIGEDIT)}
  >
    {commonLocale.createLocale}{pickScopeConfigLocale.picker}
  </Button>
    )
  }

  drawSider() {
    return (
      <div>
        <div className={styles.createBtnWrapper}>
          <Search
            className={styles.createBtn}
            placeholder={pickScopeConfigLocale.picker}
            onSearch={value => this.onQueryChange('pickerCodeName', value)}
          />
        </div>
        <div className={styles.menuWrapper}>
          <Menu
            onSelect={this.selectMenu}
            selectedKeys={[this.state.selectedKeys[1]]}
            mode = 'inline'
            style={{ height: '100%' }}
          >
            {this.renderSilderMenu()}
          </Menu>
        </div>
        <Pagination
          simple
          defaultCurrent={this.state.data.page + 1}
          total={this.state.data.pageCount}
          hideOnSinglePage={true}
          onChange={(page) => this.onQueryChange('pagination', page)}
        />
      </div>
    );
  }

  toCreate = () => {
    const { visible, entity, selectedKeys } = this.state;
    selectedKeys[0] = selectedKeys[1];
    selectedKeys[1] = undefined;
    if (!visible) {
      this.setState({
        visible: true,
        entity: {
          dcUuid: loginOrg().uuid,
          companyUuid: loginCompany().uuid
        },
      })
    }
  }

  onCancle = () => {
    const { selectedKeys, data: { list } } = this.state;
    if (list.length > 0) {
      let key = selectedKeys[0];
      selectedKeys[0] = selectedKeys[1];
      selectedKeys[1] = key;
      this.get(key);
      this.props.form.resetFields();
    } else {
      this.setState({
        visible: false
      })
    }
  }

  onRemove = () => {
    this.props.dispatch({
      type: 'pickScopeConfig/remove',
      payload: {
        dcUuid: loginOrg().uuid,
        pickerUuid: this.state.entity.picker.uuid,
      },
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.removeSuccessLocale);
          this.props.form.resetFields();
          this.refresh();
        }
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }
  handaleModalSave=(fieldsValue)=>{
    const { form, dispatch } = this.props;
    const { entity } = this.state;
    let data ={...entity};
    if(fieldsValue){
      data.picker =JSON.parse(fieldsValue.picker);
      data.pickareaUuids = fieldsValue.pickArea.map(e=>{
        return JSON.parse(e).uuid;
      });
      dispatch({
        type: 'pickScopeConfig/saveOrModify',
        payload: data,
        callback: response => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
            this.refresh();
          }
          // this.setState({
          //   visible:false
          // })
        }
      })
    }
  }

  handleModalVisible=(flag)=>{
    this.setState({
      visible:flag
    })
    // this.setState({
    //   submitting: true,
    // })
  }
  onSave = () => {
    const { form, dispatch } = this.props;
    const { entity,selectedKeys } = this.state;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      this.setState({
        submitting: true,
      })
      const data = { ...entity };
      if (fieldsValue.pickArea.length > 0) {
        let pickareaUuids = [];
        for (let i = 0; i < fieldsValue.pickArea.length; i++) {
          pickareaUuids.push(JSON.parse(fieldsValue.pickArea[i]).uuid);
        }
        data.pickareaUuids = pickareaUuids;
        delete data.pickAreas;
      }
      if (fieldsValue.picker) {
        data.picker = JSON.parse(fieldsValue.picker);
      } else if (data.picker) {
        data.picker = data.picker;
      }
      dispatch({
        type: 'pickScopeConfig/saveOrModify',
        payload: data,
        callback: response => {
          if (response && response.success) {
            this.props.form.resetFields();
            message.success(commonLocale.saveSuccessLocale);
            this.refresh();
            this.get(selectedKeys[1]);
          }
          this.setState({
            submitting: false,
          })
        }
      })
    });
  }

  drawContent() {
    const { entity, visible, submitting } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const tailLayout = {
      wrapperCol: {
        offset: 4,
        span: 16,
      },
    };
    const ModalProps = {
      createModalVisible:visible,
      handleSave:this.handaleModalSave,
      // confirmLoading:submitting,
      entity:entity,
      handleModalVisible:this.handleModalVisible
    }

      return <div style={{paddingTop:'6px'}}>
        <Form {...formItemLayout}>
        {entity&&entity.pickAreas&&<Form.Item label={pickScopeConfigLocale.pickArea} key="pickArea">
            {getFieldDecorator('pickArea', {
              initialValue: entity&&entity.pickAreas ? entity.pickAreas : [],
              rules: [{ required: true, message: notNullLocale(pickScopeConfigLocale.pickArea) }],
            })(
              <PickareaSelect multiple placeholder={placeholderChooseLocale(pickScopeConfigLocale.pickArea)} />
            )}
          </Form.Item>}
          {entity&&entity.pickAreas&&<Form.Item  key="button" {...tailLayout}>
            <Button type='primary' loading={submitting} onClick={() => this.onSave()}
            //disabled={!havePermission(CONFIG_RES.PICKSCOPECONFIGEDIT)}
              >{commonLocale.saveLocale}</Button>
        </Form.Item>}
        </Form>
        <div>
         <PickScopeConfigModal {...ModalProps}/>
         </div>
      </div>

  }
}
