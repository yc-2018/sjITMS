import { Component, Fragment } from 'react';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { Button, Menu, Input, Pagination, Form, message, Table, Checkbox, Icon,Popconfirm } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { binScopePattern } from '@/utils/PatternContants';
import ConfigSiderPage from '@/pages/Component/Page/inner/ConfigSiderPage';
import UserSelect from '@/pages/Component/Select/UserSelect';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { TaskType } from './TaskScopeConfigContants';
import { taskScopeConfigLocale } from './TaskScopeConfigLocale';
import styles from './taskScopeConfig.less';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { havePermission } from '@/utils/authority';
import { CONFIG_RES } from '../ConfigPermission';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import TaskScopeConfigModal from './TaskScopeConfigModal';
import StandardTable from '@/components/StandardTable';
const Search = Input.Search;
@connect(({ taskScopeConfig, loading }) => ({
  taskScopeConfig,
  loading: loading.models.taskScopeConfig,
}))
@Form.create()
export default class TaskScopeConfig extends ConfigSiderPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      submitting: false,
      title: configLocale.taskConfig.taskScopeConfig.name,
      pageFilter: {
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        },
        page: 0,
        pageSize: 20
      },
      data: {
        list: []
      },//分页信息
      visible: false,
      entity: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        taskConfigs: [],
      },
      selectedKeys: [undefined, undefined],//0:代表上一次选中的值，1：代表当前选中的值，区分取消按钮和删除按钮的展示。
      operate: '',
      modalVisible: false,
      logCaption: 'TaskScopeConfig',
      createEntity:{
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        taskConfigs: [],
      }
    };
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    let { data, visible, selectedKeys, entity } = this.state;
    const nextData = nextProps.taskScopeConfig.data;
    if (nextData.list.length != data.list.length) {
      if (nextData.list.length > 0 ) {
        this.get(nextData.list[0].tasker.uuid);
        selectedKeys[1] = nextData.list[0].tasker.uuid;
      }else{
        selectedKeys[1] = undefined;
      }
      this.setState({
        data: nextData,
        selectedKeys
      })
    }
    if (nextProps.taskScopeConfig.list !== this.props.taskScopeConfig.list) {
      if (nextProps.taskScopeConfig.list.length > 0) {
        entity.tasker = nextProps.taskScopeConfig.list[0].tasker;
      }
        entity.taskConfigs=[];
        nextProps.taskScopeConfig.list.map((val, index) => {
          entity.taskConfigs.push({
            priority: val.priority,
            binRange: val.binRange,
            taskType: val.taskType,
            orderNo: index + 1,
          })
        })
        // console.log(entity);
        this.setState({
          entity: { ...entity }
        })


    }
  }
  existsOrAdd = (entity) => {
    // const { entity } = this.state;
    let newOrderNo = entity.taskConfigs.length;
    let willAddConfigs = [];

    if (length === Object.keys(TaskType).length) {
      return willAddConfigs;
    }

    Object.keys(TaskType).forEach(function (key) {
      let index = entity.taskConfigs.findIndex(function (value) {
        return value.taskType === key;
      })
      if (index < 0) {
        newOrderNo++;
        willAddConfigs.push(
          {
            taskType: key,
            orderNo: newOrderNo
          }
        );
      }
    });
    return willAddConfigs;
  }
  refresh() {
    this.props.dispatch({
      type: 'taskScopeConfig/query',
      payload: this.state.pageFilter
    })
  }
  renderSilderMenu = () => {
    const list = this.state.data.list;
    let taskers = [];
    list.map((item) => {
      taskers.push(
        <Menu.Item
          key={item.tasker.uuid}

          // onTitleClick={()=>this.clickMenuTitle(item)}
        >{<div style={{display:'flex',justifyContent:'space-between'}}  onMouseEnter={(e)=>this.handleMouseEnterMenu(item.tasker.uuid,e)}
        onMouseLeave={(e)=>this.handleMouseLeaveMenu(item.tasker.uuid,e)}>
        <span style={{width:'80%',overflow:'hidden',textOverflow:'ellipsis'}}>{convertCodeName(item.tasker)}</span>
        {
          item.display === 'inline'&&havePermission(CONFIG_RES.TASKSCOPECONFIGEDIT)?
            <span style = {{float: 'right'}}>
               <Popconfirm
                title="确认要删除该数据？"
                onConfirm={() => this.onRemove(item.tasker.uuid)}
                okText="确认"
                cancelText="取消"
                >
              <a className={styles.menuItemA}
                // onClick={() => this.onRemove()}
              >
                {commonLocale.deleteLocale}
              </a>
              </Popconfirm>
            </span>:null
        }
        </div>}</Menu.Item>
      )
    });
    return taskers;
  }

  clickMenuTitle=(item)=>{
    let { selectedKeys } = this.state;
    selectedKeys = item.tasker;
    // this.reset();
    this.get(item.tasker.uuid);
    this.setState({
      selectedKeys
    })
  }

    /**
   * 当鼠标浮在目录时调用
   */
  handleMouseEnterMenu =(uuid,e)=>{
    const {data:{list}} = this.state;
    list.map((item)=>{
      if(item.tasker.uuid === uuid){
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
    const {data:{list}} = this.state;
    list.map((item)=>{
      if(item.tasker.uuid === uuid){
        item.display ='none'
      }
    })
    this.setState({
      data:{
        list:[...list]
      }
    })
  }



  onQueryChange = (field, value) => {
    const { pageFilter } = this.state;
    if (field === 'taskerCodeName') {
      pageFilter.searchKeyValues.taskerCodeName = value;
    } else if (field === 'pagination') {
      pageFilter.page = value - 1;
    }
    this.reset();
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
      type: 'taskScopeConfig/getByTaskerUuidAndDcUuid',
      payload: {
        dcUuid: loginOrg().uuid,
        taskerUuid: uuid
      }
    })
  }


  drawSider() {
    return (
      <div>
        <div className={styles.createBtnWrapper}>

          <Search
            className={styles.createBtn}
            placeholder={placeholderLocale(taskScopeConfigLocale.taskerCodeAndName)}
            onSearch={value => this.onQueryChange('taskerCodeName', value)}
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

  drawActionButton=()=>{
    return (
      <Button
      className={styles.createBtn}
      type="primary"
      icon="plus"
      onClick={() => this.toCreate()}
      //disabled={!havePermission(CONFIG_RES.TASKSCOPECONFIGEDIT)}
    >
      {commonLocale.createLocale}{taskScopeConfigLocale.tasker}
    </Button>
    )
  }

  toCreate = () => {
    let { visible, selectedKeys,createEntity } = this.state;
    createEntity.taskConfigs = [...this.existsOrAdd(createEntity)];
    let data = createEntity.taskConfigs;
    data.forEach(item =>{
      item.binRange = ''
    });
    createEntity.taskConfigs = data;
    this.setState({
      visible:true,
      createEntity:{...createEntity}
    })
  }

  onCancle = () => {
    let { createEntity, data: { list } } = this.state;
    let data = createEntity.taskConfigs;
    data.forEach(item =>{
      item.binRange = ''
    });
    createEntity.taskConfigs = data;
    if(createEntity.tasker){
      delete createEntity.tasker;
    }
    this.props.form.resetFields();
      this.setState({
        visible: false,
        createEntity
      })
  }

  onRemove = (uuid) => {
    this.props.dispatch({
      type: 'taskScopeConfig/remove',
      payload: {
        dcUuid: loginOrg().uuid,
        taskerUuid: uuid ? uuid : this.state.entity.tasker.uuid,
      },
      callback: response => {
        if (response && response.success) {
          this.reset();
          message.success(commonLocale.removeSuccessLocale);
          this.refresh();
        }
      }
    });
    // this.setState({
    //   modalVisible: !this.state.modalVisible
    // });
  }
  reset = () => {
    this.props.form.resetFields();
    this.setState({
      entity: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        taskConfigs: [],
      },
    })
  }
  /**
   * 校验表格数据
   */
  checkData=(data)=>{
    let priority = 0;
    let arr = [];
    for (let i = 0; i < data.taskConfigs.length; i++) {
      if (data.taskConfigs[i].binRange) {
        if (!binScopePattern.pattern.test(data.taskConfigs[i].binRange)) {
          message.error('第' + (i + 1) + '行货位范围不' + binScopePattern.message);
          this.setState({
            submitting: false,
          })
          return false;
        }
        priority++;
        arr.push({
          priority: priority,
          binRange: data.taskConfigs[i].binRange,
          taskType: data.taskConfigs[i].taskType,
        })
      }
    }
    if (arr.length === 0) {
      message.error(taskScopeConfigLocale.binRangeNotAllNull);
      this.setState({
        submitting: false,
      })
      return;
    }
    return arr
  }

  handleModalSave=(fieldsValue)=>{
    const { form, dispatch } = this.props;
    const { createEntity } = this.state;
    if (fieldsValue.tasker) {
      createEntity.tasker = JSON.parse(fieldsValue.tasker);
    }
    createEntity.taskConfigs = fieldsValue.taskConfigs;
    this.setState({
      submitting: true,
    })
   let arr = this.checkData(createEntity);
   if(arr.length === 0)  return;
   let creation = {
      dcUuid: createEntity.dcUuid,
      companyUuid: createEntity.companyUuid,
      tasker: createEntity.tasker,
      taskConfigs: arr
    }
    dispatch({
      type: 'taskScopeConfig/saveOrModify',
      payload: creation,
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.refresh();
          this.onCancle();
        }
        this.setState({
          submitting: false,
        })
      }
    })

  }
  onSave = () => {
    const { form, dispatch } = this.props;
    const { entity } = this.state;
      this.setState({
        submitting: true,
      })
      const data = { ...entity };
      // if (fieldsValue.tasker) {
      //   data.tasker = JSON.parse(fieldsValue.tasker);
      // } else if (data.tasker) {
      //   data.tasker = data.tasker;
      // }
      let priority = 0;
      let arr = [];
      for (let i = 0; i < data.taskConfigs.length; i++) {
        if (data.taskConfigs[i].binRange) {
          if (!binScopePattern.pattern.test(data.taskConfigs[i].binRange)) {
            message.error('第' + (i + 1) + '行货位范围不' + binScopePattern.message);
            this.setState({
              submitting: false,
            })
            return false;
          }
          priority++;
          arr.push({
            priority: priority,
            binRange: data.taskConfigs[i].binRange,
            taskType: data.taskConfigs[i].taskType,
          })
        }
      }
      if (arr.length === 0) {
        message.error(taskScopeConfigLocale.binRangeNotAllNull);
        this.setState({
          submitting: false,
        })
        return;
      }
      let creation = {
        dcUuid: data.dcUuid,
        companyUuid: data.companyUuid,
        tasker: data.tasker,
        taskConfigs: arr
      }
      dispatch({
        type: 'taskScopeConfig/saveOrModify',
        payload: creation,
        callback: response => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
            this.refresh();
          }
          this.setState({
            submitting: false,
          })
        }
      })

  }

  up = (record) => {
    if (!record.priority) {
      message.error(taskScopeConfigLocale.priorityValidate);
      return;
    } else if (record.orderNo === 1) {
      message.error(taskScopeConfigLocale.priorityAlreadyFirst);
      return;
    }
    const { entity } = this.state;
    this.props.dispatch({
      type: 'taskScopeConfig/up',
      payload: {
        taskerUuid: entity.tasker.uuid,
        dcUuid: loginOrg().uuid,
        taskType: record.taskType
      },
      callback: response => {
        if (response && response.success) {
          this.reset();
          message.success(taskScopeConfigLocale.upSuccess);
          this.get(entity.tasker.uuid);
        }
      }
    })
  }
  onChange = (e, orderNo, field) => {

    const { entity } = this.state;
    if (field === 'binRange') {
      const { value } = e.target;
      let config = entity.taskConfigs.find(item => item.orderNo === orderNo);
      // if (value && !binScopePattern.pattern.test(value)) {
      //   message.error(binScopePattern.message);
      //   // config.binRange = undefined;
      // } else {
      config.binRange = value;
    }
    this.setState({
      entity: { ...entity }
    })
  }

  columns = [
    {
      title: taskScopeConfigLocale.orderNo,
      dataIndex: 'orderNo',
      key: 'orderNo',
      align: 'center',
      width: itemColWidth.lineColWidth + 50
    },
    {
      title: taskScopeConfigLocale.taskType,
      dataIndex: 'taskType',
      key: 'taskType',
      width: colWidth.enumColWidth,
      render: (val) => {
        return TaskType[val].caption
      }
    },
    {
      title: taskScopeConfigLocale.binRange,
      dataIndex: 'binRange',
      key: 'binRange',
      width: colWidth.sourceBillNumberColWidth,
      render: (val, record) => {
        return <Input onChange={(e) => this.onChange(e, record.orderNo, 'binRange')} defaultValue={val} value={val} style={{width:'80%'}} />
      }
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: record => (
        <IPopconfirm onConfirm={() => this.up(record)}
          operate={'上移'}
          //disabled={!havePermission(CONFIG_RES.TASKSCOPECONFIGEDIT)}
          object={taskScopeConfigLocale.title}>
          <a >
            <Icon type="arrow-up" />
          </a>
        </IPopconfirm>
      )
    }
  ];

  drawContent() {
    const { entity, visible, submitting ,createEntity} = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 10 },
      },
    };
    let dataSource = this.state.entity.taskConfigs;

    const tableLoading = {
      spinning: this.props.loading,
      indicator: LoadingIcon('default')
    }
    // console.log(createEntity,visible)
    const createColumns=this.columns.slice(0,3);
    const ModalConfigProps={
      columns:createColumns,
      createModalVisible:visible,
      tableLoading,
      onCancle:this.onCancle,
      handleSave:this.handleModalSave,
      entity:createEntity
    }
      return <div>

        {entity && entity.tasker &&<div style={{ paddingTop:'10px',paddingRight:'24px'}}>
        <StandardTable unShowRow loading={tableLoading} rowKey={record => record.orderNo} dataSource={dataSource} columns={this.columns} noPagination comId={'config.edit.table'} />
        <div style={{ paddingTop:'10px',float:'right' }}>
          <Button type='primary' loading={submitting} onClick={() => this.onSave()}>
            {commonLocale.saveLocale}
          </Button>
        </div>
        </div>}
        <TaskScopeConfigModal  {...ModalConfigProps} />
      </div>
    }

}


