import { connect } from 'dva';
import moment from 'moment';
import { Modal,Form, Select, Input, message } from 'antd';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import BinSelect from '@/pages/Component/Select/BinSelect';
import { commonLocale, tooLongLocale,notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg ,getActiveKey} from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { binUsage } from '@/utils/BinUsage';
import { colWidth,itemColWidth } from '@/utils/ColWidth';
import { collectBinLocale,clearConfirm } from './CollectBinLocale';
import { CollectBinMgrType } from './CollectBinContants';

const mgrTypeOptions = [];
Object.keys(CollectBinMgrType).forEach(function (key) {
  mgrTypeOptions.push(<Select.Option value={CollectBinMgrType[key].name} key={CollectBinMgrType[key].name} >{CollectBinMgrType[key].caption}</Select.Option>);
});

@connect(({ collectBinScheme,dock,dockGroupConfig, loading }) => ({
  collectBinScheme, dock, dockGroupConfig,
  loading: loading.models.collectBinScheme,
}))
@Form.create()
export default class CollectBinCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      noNote:true,
      title: commonLocale.createLocale + collectBinLocale.title,
      entity: {},
      dockGroupConfigList:[],//当前配送中心的码头集配置信息
      dockGroupMap: {}, // 码头集map
      dockGroupforDockMap:{}, //,码头集-码头们map

      dockGroupItems: [], // 方案中包含的码头集配置
      dockItems: [], // 方案中包含的码头配置
      fixCollectBinItems: [], // 方案中包含的门店固定拣货位配置

      mgrType: CollectBinMgrType['NOCARE'].name,
    }
  }
  componentDidMount() {
    this.refresh();
    this.queryByDC();
  }
  
  componentWillReceiveProps(nextProps) {
    let { entity,dockGroupConfigList,dockGroupMap } = this.state;

    if (nextProps.dockGroupConfig.dockGroupConfigList && this.props.dockGroupConfig.dockGroupConfigList != nextProps.dockGroupConfig.dockGroupConfigList){
      
      for (let i = 0; i < nextProps.dockGroupConfig.dockGroupConfigList.length;i++){
        dockGroupMap[nextProps.dockGroupConfig.dockGroupConfigList[i].dockGroup.uuid] = nextProps.dockGroupConfig.dockGroupConfigList[i]
      }

      this.setState({
        dockGroupConfigList: nextProps.dockGroupConfig.dockGroupConfigList,
        dockGroupMap: {
          ...dockGroupMap
        }
      });
    }

    if (nextProps.collectBinScheme.entity.data && this.props.collectBinScheme.entityUuid
      && nextProps.collectBinScheme.entity.data != this.props.collectBinScheme.entity.data) {

      if (nextProps.collectBinScheme.entity.data.dockGroupItems) {
        for (let i = 0; i < nextProps.collectBinScheme.entity.data.dockGroupItems.length; i++) {
          nextProps.collectBinScheme.entity.data.dockGroupItems[i].line = i + 1;
        }
      }
      if (nextProps.collectBinScheme.entity.data.dockItems) {
        for (let i = 0; i < nextProps.collectBinScheme.entity.data.dockItems.length; i++) {
          nextProps.collectBinScheme.entity.data.dockItems[i].line = i + 1;
          this.queryDockByGroupUuid(nextProps.collectBinScheme.entity.data.dockItems[i].dockGroup.uuid)
        }
      }

      if (nextProps.collectBinScheme.entity.data.fixCollectBinItems) {
        for (let i = 0; i < nextProps.collectBinScheme.entity.data.fixCollectBinItems.length; i++) {
          nextProps.collectBinScheme.entity.data.fixCollectBinItems[i].line = i + 1;
        }
      }
      
      this.setState({
        entity: nextProps.collectBinScheme.entity.data,
        dockGroupItems: nextProps.collectBinScheme.entity.data.dockGroupItems ? nextProps.collectBinScheme.entity.data.dockGroupItems : [],
        fixCollectBinItems: nextProps.collectBinScheme.entity.data.fixCollectBinItems ? nextProps.collectBinScheme.entity.data.fixCollectBinItems : [],
        dockItems: nextProps.collectBinScheme.entity.data.dockItems ? nextProps.collectBinScheme.entity.data.dockItems : [],
        title: collectBinLocale.title,
        mgrType: nextProps.collectBinScheme.entity.data?nextProps.collectBinScheme.entity.data.mgrType:''
      });
    }


    if (nextProps.dock.data.dockList){
      const { dockGroupforDockMap } = this.state;
      let docks = [];
      for (let i = 0; i < nextProps.dock.data.dockList.length;i++){
        docks.push(nextProps.dock.data.dockList[i]);
      }
      dockGroupforDockMap[nextProps.dock.data.dockList[0].dockGroup.uuid] = docks;
      this.setState({
        dockGroupforDockMap: {
          ...dockGroupforDockMap
        }
      });
    }
  }

  /**
   * 刷新
   */
  refresh = () => {
    this.props.dispatch({
      type: 'collectBinScheme/get',
      payload: {
        uuid: this.props.collectBinScheme.entityUuid
      }
    });
  }

  /**
   * 查询当前配送中心下的码头集配置信息
   */
  queryByDC = ()=>{
    this.props.dispatch({
      type: 'dockGroupConfig/queryByDc',
      payload:{
        dcUuid:loginOrg().uuid
      }
    })
  }

  /**
   * 根据码头集uuid获取对应码头们信息
   */
  queryDockByGroupUuid = (uuid)=>{
    const { dockGroupforDockMap } = this.state;
    if (dockGroupforDockMap[uuid]) {
      return;
    }
    this.props.dispatch({
      type: 'dock/queryByDockGroup',
      payload: {
        dockGroupUuid: uuid
      }
    });
  }

  /**
  * 取消
  */
  onCancel = () => {
    this.props.dispatch({
      type: 'collectBinScheme/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  /**
   * js 分组 判断是否包含相同行
   * @param {*} array 对象数组
   * @param {*} f 匿名函数 返回对象的某个指定属性的属性值并存放在数组中
   */
  groupBy(array, f) {
    const groups = {};
    array.forEach(function (i) {
      const group = JSON.stringify(f(i));
      groups[group] = groups[group] || [];
      groups[group].push(i);
    });

    return Object.keys(groups).map(function (group) {
      return groups[group];
    });
  }

  /**
   * 校验数据
   */
  checkData =(data)=>{
    const { dockGroupItems,dockItems,fixCollectBinItems} = this.state;
    let items = [];
    let itemsDock = [];
    // 处理数据
    let collectBinScheme = {
      ...this.state.entity,
      ...data,
    }
    let itemsDockGroup = dockGroupItems;

    // 码头集明细
    if (this.state.mgrType === CollectBinMgrType.NOCARE.name) {
      if (dockGroupItems.length <= 0){
        message.error(notNullLocale(collectBinLocale.dockGroupItem));
        return null;
      }

      for (let i = 0; i < itemsDockGroup.length; i++) {
        if (!itemsDockGroup[i].dockGroup) {
          message.error('第' + itemsDockGroup[i].line + '行码头集不能为空');
          return null;
        }
        if (!itemsDockGroup[i].collectBin) {
          message.error('第' + itemsDockGroup[i].line + '行集货位不能为空');
          return null;
        }
        itemsDockGroup[i].companyUuid = loginCompany().uuid;
        itemsDockGroup[i].dcUuid = loginOrg().uuid;
      }

      //校验数据是否有重复
      const sortedDockGroup = this.groupBy(itemsDockGroup, function (item) {
        return [item.dockGroup.uuid,item.collectBin];
      });

      sortedDockGroup.forEach(i=>{
        if(i.length>1){
          let list =[];
          i.forEach(t=>{
            list.push(t.line);
          });
          message.error('第' + JSON.stringify(list) + '行数据相同');
          itemsDockGroup=null;
        }
      });
    }

    // 码头明细
    if (this.state.mgrType === 'CARELESS' && dockItems.length <= 0) {
      message.error(notNullLocale(collectBinLocale.dockItem));
      return null;
    }

    if (this.state.mgrType === 'CARELESS'){
      itemsDock = dockItems;
      for (let i = 0; i < itemsDock.length; i++) {
        if (!itemsDock[i].dockGroup) {
          message.error('第' + itemsDock[i].line + '行码头集不能为空');
          return null;
        }
        if (!itemsDock[i].store) {
          message.error('第' + itemsDock[i].line + '行门店不能为空');
          return null;
        }
        if (!itemsDock[i].dock) {
          message.error('第' + itemsDock[i].line + '行码头不能为空');
          return null;
        }
        if (!itemsDock[i].collectBin){
          message.error('第' + itemsDock[i].line + '行集货位代码不能为空');
          return null;
        }
      }

      //校验数据是否有重复
      const sortedDock = this.groupBy(itemsDock, function (item) {
        return [item.dockGroup.uuid,item.store.uuid,item.dock.uuid,item.collectBin];
      });
      sortedDock.forEach(i=>{
        if(i.length>1){
          let list =[];
          i.map(t=>{
            list.push(t.line);
          });
          message.error('第' + JSON.stringify(list) + '行数据相同');
          itemsDock=null;
        }
      });
    }
    // 门店固定拣货位明细
    if (collectBinScheme.mgrType === 'CAREFUL'){
      items = fixCollectBinItems;
      for (let i = 0; i < items.length; i++) {
        if (!items[i].store) {
          message.error('第' + items[i].line + '行门店不能为空');
          return null;
        }
        if (!items[i].binScope) {
          message.error('第' + items[i].line + '行集货位范围不能为空');
          return null;
        }
      }

      //校验数据是否有重复
      const sortedStore = this.groupBy(items, function (item) {
        return [item.store.uuid,item.binScope];
      });
      sortedStore.forEach(i=>{
        if(i.length>1){
          let list =[];
          i.map(t=>{
            list.push(t.line);
          });
          message.error('第' + JSON.stringify(list) + '行数据相同');
          items=null;
        }
      });
    }
    collectBinScheme = {
      ...collectBinScheme,
      dockGroupItems: itemsDockGroup,
      dockItems: itemsDock,
      fixCollectBinItems: items,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
    };
    return collectBinScheme;
  }
  /**
   * 保存
   */
  onSave = (data) => {
    let collectBinScheme = this.checkData(data);
    if(collectBinScheme ==null){
      return;
    }
    if(collectBinScheme.fixCollectBinItems==null||collectBinScheme.dockGroupItems==null||collectBinScheme.dockItems==null){
      return;
    }
    let type ='';
    if (!this.state.entity.uuid) {
      type = 'collectBinScheme/onSave'
    } else {
      type = 'collectBinScheme/onModify'
    }
    this.props.dispatch({
      type: type,
      payload: collectBinScheme,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
        }
      }
    });
  }
  /**
   * 保存并新建
   */
  onSaveAndCreate = (data) => {
    let collectBinScheme = this.checkData(data);
    if(collectBinScheme ==null){
      return;
    }
    if(collectBinScheme.fixCollectBinItems==null||collectBinScheme.dockGroupItems==null||collectBinScheme.dockItems==null){
      return;
    }
    this.props.dispatch({
      type: 'collectBinScheme/onSaveAndCreate',
      payload: collectBinScheme,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.setState({
            entity: {
              companyUuid: loginCompany().uuid,
              dcUuid: loginOrg().uuid,
            },
            dockGroupItems: [],
            dockItems: [],
            fixCollectBinItems: [],
            dockList: [],
            mgrType: CollectBinMgrType['NOCARE'].name,
          });
          this.props.form.resetFields();
        }
      }
    });
  }

  /**
   * 渲染码头集明细中的码头集选择器下拉选项
   */
  renderGroupOptions(){
    let options = [];
    let existGroupUuidList = [];
    let existGroupList = [];
    const { dockGroupConfigList } = this.state;
    dockGroupConfigList.map(config=>{
      if (existGroupUuidList.indexOf(config.dockGroup.uuid)==-1){
        existGroupUuidList.push(config.dockGroup.uuid);
        existGroupList.push(config.dockGroup);
      }
    });

    existGroupList.map(group=>{
      options.push(<Select.Option key={JSON.stringify(group)} 
          value={JSON.stringify(group)}>
          {convertCodeName(group)}</Select.Option>)
    })

    return options;

  }


  /**
   * 设置码头选择器选项
   */
  getDockOptions = (dockGroupUuid) => {
    let options = [];
    const { dockGroupforDockMap } = this.state;
    if (!dockGroupUuid || !dockGroupforDockMap[dockGroupUuid]) {
      return options;
    }
    dockGroupforDockMap[dockGroupUuid].map(item => {
      let dock = {
        uuid:item.uuid,
        code:item.code,
        name:item.name,
      }
      options.push(<Select.Option
        key={JSON.stringify(dock)}
        value={JSON.stringify(dock)}>{convertCodeName(dock)}</Select.Option>);
    });

    return options;
  }


  /**
   * 集货位管理类型改变时触发
   */
  handleChangeMgrType =(value)=>{
    const { entity,dockGroupItems,dockItems,fixCollectBinItems } = this.state;
    if ((dockGroupItems == undefined || dockGroupItems.length === 0) && (dockItems == undefined || dockItems.length === 0) && (fixCollectBinItems == undefined || fixCollectBinItems.length === 0)) {
        this.setState({
          mgrType: value
        });
        return;
    }

    if (this.state.mgrType != value) {
      Modal.confirm({
        title: clearConfirm(collectBinLocale.mgrType),
        okText: commonLocale.confirmLocale,
        cancelText: commonLocale.cancelLocale,
        onOk: () => {
          if (this.state.dockGroupItems) {
            this.state.dockGroupItems.length = 0;
          }

          if (this.state.dockItems) {
            this.state.dockItems=[];
          }

          if (this.state.fixCollectBinItems) {
            this.state.fixCollectBinItems.length = 0;
          }
          this.props.form.setFieldsValue({
            mgrType: value
          });
          this.setState({
            mgrType: value
          });
          
        },
        onCancel: () => {
          this.props.form.setFieldsValue({
              mgrType: this.state.mgrType
          });
        }
      });
    }else{
      this.setState({
        mgrType: value
      });
    }
  }

  /**
   * 码头集明细表格变化时触发
   */
  handleFieldChangeDockGroup(e, fieldName, line) {
    const { entity, dockGroupItems,dockGroupConfigList } = this.state;
    if (dockGroupItems.length == 0){
      dockGroupItems.push({});
    }
    const target = dockGroupItems[line - 1];
    if (fieldName === 'dockGroup'){
      let dockGroup = JSON.parse(e);
        target.dockGroup = dockGroup;
        if (target.dockGroup != JSON.parse(e)) {
          target.collectBin = undefined;
        }
    }else if(fieldName === 'collectBin'){
      target.collectBin = e;
      for (let i = 0; i < dockGroupItems.length; i++) {
        if (target.dockGroup && dockGroupItems[i].dockGroup && dockGroupItems[i].dockGroup.uuid == target.dockGroup.uuid) {
          dockGroupItems[i].collectBin = e;
        }
      }
    }
    this.setState({
      dockGroupItems: [...dockGroupItems]
    });

  }

  /**
   * 码头明细表格变化时触发
   */
  handleFieldChangeDock(e, fieldName, line) {
     const { entity, dockItems } = this.state;
    if (dockItems.length == 0) {
      dockItems.push({});
    }
    const target = dockItems[line - 1];
    if (fieldName === 'dockGroup') {
      if (target.dockGroup != JSON.parse(e)){
        target.dock = undefined;
        target.collectBin = undefined;
      }

      target.dockGroup = JSON.parse(e);
      // 查询选中的码头集对应的码头们
      this.queryDockByGroupUuid(JSON.parse(e).uuid);
    }else if(fieldName === 'store'){
      target.store = JSON.parse(e);
    } else if(fieldName === 'dock'){
      target.dock = JSON.parse(e);
      for (let i = 0; i < dockItems.length; i++) {
        if (target.dock && dockItems[i].dock && dockItems[i].dock.uuid == target.dock.uuid) {
          target.collectBin = dockItems[i].collectBin;
        }
      }
    } else if (fieldName === 'collectBin'){
      target.collectBin = e;

      for(let i=0;i<dockItems.length;i++){
        if (target.dock && dockItems[i].dock && dockItems[i].dock.uuid == target.dock.uuid) {
          dockItems[i].collectBin = e;
        }
      }
    }

    this.setState({
      dockItems: [...dockItems]
    });
  }

  /**
   * 门店固定集货位明细表格变化时触发
   */
  handleFieldChangeStoreCollect(e, fieldName, line) {
     const { entity, fixCollectBinItems } = this.state;
    if (fixCollectBinItems.length == 0) {
      fixCollectBinItems.push({});
    }
    const target = fixCollectBinItems[line - 1];
    if (fieldName === 'binScope') {
      target.binScope = e.target.value;
    }else if(fieldName === 'store'){
      target.store = JSON.parse(e);
    }

    this.setState({
      fixCollectBinItems: [...fixCollectBinItems]
    });
  }

  /**
   * 绘制表单
   */
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, defOwner } = this.state;
    
    let basicCols = [
      <CFormItem key='code' label={commonLocale.codeLocale}>
        {
          getFieldDecorator('code', {
            initialValue: entity.code,
            rules: [
              { required: true, message: notNullLocale(commonLocale.codeLocale) },
              { max: 30, message: tooLongLocale(commonLocale.codeLocale, 30) }
            ],
          })(
            <Input placeholder={placeholderLocale(commonLocale.codeLocale)} />
          )
        }
      </CFormItem>,
      <CFormItem key='name' label={commonLocale.nameLocale}>
        {
          getFieldDecorator('name', {
            initialValue: entity.name,
            rules: [{ required: true, message: notNullLocale(commonLocale.nameLocale) }, {
              max: 30, message: tooLongLocale(commonLocale.nameLocale, 30),
            }],
          })(
            <Input placeholder={placeholderLocale(commonLocale.nameLocale)} />
          )
        }
      </CFormItem>,
      <CFormItem key='mgrType' label={collectBinLocale.mgrType}>
        {
          getFieldDecorator('mgrType', {
            initialValue: entity.mgrType ? entity.mgrType:CollectBinMgrType['NOCARE'].name,
            rules: [{ required: true, message: notNullLocale(collectBinLocale.mgrType) }],
          })(
            <Select initialValue = {CollectBinMgrType['NOCARE'].name}
              onChange={this.handleChangeMgrType} 
              placeholder={placeholderChooseLocale(collectBinLocale.mgrType)}>
							{mgrTypeOptions}
						</Select>
          )
        }
      </CFormItem>,
      this.state.mgrType === 'CAREFUL'?
        <CFormItem key='startFromFirst' label={collectBinLocale.startFromFirstLable}>
          {
            getFieldDecorator('startFromFirst', {
              initialValue: entity.startFromFirst,
              rules: [{ required: true, message: notNullLocale(collectBinLocale.startFromFirstLable) }],
            })(
              <Select initialValue=' '
                placeholder={placeholderChooseLocale(collectBinLocale.startFromFirstPlaceholder)}>
                <Select.Option value={true}>是</Select.Option>
                <Select.Option value={false}>否</Select.Option>
              </Select>
            )
          }
        </CFormItem>
      :null,
      this.state.mgrType === 'CAREFUL'?
        <CFormItem key='loopFind' label={collectBinLocale.loopFindLable}>
          {
            getFieldDecorator('loopFind', {
              initialValue: entity.loopFind,
              rules: [{ required: true, message: notNullLocale(collectBinLocale.loopFindLable) }],
            })(
              <Select initialValue=' '
                placeholder={placeholderChooseLocale(collectBinLocale.loopFindPlaceholder)}>
                <Select.Option value={true}>是</Select.Option>
                <Select.Option value={false}>否</Select.Option>
              </Select>
            )
          }
        </CFormItem>
      :null,
    ];

    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={basicCols} />,
    ];
  }
  /**
   * 绘制明细表格
   */
  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, careFul,dockGroupItems,dockItems,mgrType } = this.state;
    
    // 码头集明细列表
    let dockGroupItemCols = [
      {
        title: collectBinLocale.dockGroup,
        key: 'dockGroup',
        width: itemColWidth.articleEditColWidth+400,
        render: (text, record) => {
          return <Select 
                    value={record.dockGroup ?convertCodeName(record.dockGroup) : undefined}
                    placeholder={placeholderChooseLocale(collectBinLocale.dockGroup)}
                    onChange = {
                      e => this.handleFieldChangeDockGroup(e, 'dockGroup', record.line)
                    } 
                  >
                    {this.renderGroupOptions()}
                  </Select>
        }
      },
      {
        title: collectBinLocale.collectBin,
        key: 'collectBin',
        width: itemColWidth.binCodeEditColWidth+400,
        render: (text, record) => {
          let binScope =undefined
          if (record.dockGroup && this.state.dockGroupMap[record.dockGroup.uuid]) {
            binScope = this.state.dockGroupMap[record.dockGroup.uuid].collectBinRange;            
          }else{
            return;
          }
          
          return (
              <BinSelect
                usage={binUsage.CollectBin.name}
                value={record.collectBin}
                binScope={binScope}
                onChange={e => this.handleFieldChangeDockGroup(e, 'collectBin', record.line)}
                placeholder="请选择货位"
              />
          );
        }
      }
    ];

    // 码头明细列表
    let dockItemCols =[
      {
        title: collectBinLocale.dockGroup,
        key: 'dockGroup',
        width:itemColWidth.articleEditColWidth,
        render:(record)=>{
          return <Select 
                    value={record.dockGroup ?convertCodeName(record.dockGroup) : undefined}
                    placeholder={placeholderChooseLocale(collectBinLocale.dockGroup)}
                    onChange = {
                      e => this.handleFieldChangeDock(e, 'dockGroup', record.line)
                    } 
                  >
                    {this.renderGroupOptions()}
                  </Select>
        }
      },
      {
        title: commonLocale.inStoreLocale,
        key: 'store',
        width: itemColWidth.articleEditColWidth+100,
        render:(record)=>{
          let store = undefined
          if (this.state.entity.uuid && record.store) {
            store = {
              ...record.store,
              type: 'STORE'
            }
          } else {
            store = undefined
          }
          return <OrgSelect
                    value={JSON.stringify(store)}
                    forItemTable
                    placeholder={placeholderLocale(commonLocale.codeLocale)}
                    upperUuid={loginCompany().uuid}
                    type={'STORE'}
                    single
                    onChange = {
                      e => this.handleFieldChangeDock(e, 'store', record.line)
                    }
                  />
        }
      },
      {
        title: collectBinLocale.dock,
        key: 'dock',
        width: itemColWidth.articleEditColWidth+100,
        render:record=>{
          return <Select value={ record.dock? convertCodeName(record.dock) : undefined}
                    placeholder={placeholderLocale(collectBinLocale.dock)}
                    onChange={
                      e => this.handleFieldChangeDock(e, 'dock', record.line)
                    }
                  >
                    {
                      this.getDockOptions(record.dockGroup ? record.dockGroup.uuid : null)
                    }
                  </Select>
        }
      },
      {
        title: collectBinLocale.collectBin,
        key: 'collectBin',
        width: itemColWidth.binCodeEditColWidth+100,
        render:(record)=>{
          let binScope =undefined
          if (record.dockGroup && this.state.dockGroupMap[record.dockGroup.uuid]) {
            binScope = this.state.dockGroupMap[record.dockGroup.uuid].collectBinRange;            
          }else{
            return;
          }
          
          return (
              <BinSelect
                usage={binUsage.CollectBin.name}
                value={record.collectBin}
                binScope={binScope}
                onChange={e => this.handleFieldChangeDock(e, 'collectBin', record.line)}
                placeholder="请选择货位"
              />
          ); 
        }
      },
    ];

    // 门店固定集货位范围列表
    let storeFixCollectBinCols = [
      {
        title: commonLocale.inStoreLocale,
        key: 'store',
        width: itemColWidth.articleEditColWidth+200,
        render:(record)=>{
          let store=undefined
          if (this.state.entity.uuid && record.store) {
            store = {
              ...record.store,
              type: 'STORE'
            }
          }else{
            store=undefined
          }
          return <OrgSelect
                    value={JSON.stringify(store)}
                    forItemTable
                    placeholder={placeholderLocale(commonLocale.codeLocale)}
                    upperUuid={loginCompany().uuid}
                    type={'STORE'}
                    single
                    onChange = {
                      e => this.handleFieldChangeStoreCollect(e, 'store', record.line)
                    }
                  />
        }
      }, {
        title: collectBinLocale.collectBinScope,
        key: 'binScope',
        width: itemColWidth.binCodeEditColWidth+500,
        render:(record)=>{
          return <Input 
                    value={record.binScope}
                    onChange = {
                      e => this.handleFieldChangeStoreCollect(e, 'binScope', record.line)
                    }
                    placeholder={placeholderLocale(collectBinLocale.collectBinScope)}/>
        }
      },
    ];
    return (
      <div>
        {
          this.state.mgrType === CollectBinMgrType.NOCARE.name ?
          <ItemEditTable
            title = {collectBinLocale.dockGroupItem}
            columns={dockGroupItemCols}
            notNote
            data={this.state.dockGroupItems}
        />:null
        }
        {
          this.state.mgrType === 'CARELESS'?
          <ItemEditTable
            title = {collectBinLocale.dockItem}
            columns={dockItemCols}
            notNote
            data={this.state.dockItems}
          />:null
        }
        {
          this.state.mgrType === 'CAREFUL'?
          <ItemEditTable
            title = {collectBinLocale.storeFixCollectBin}
            columns={storeFixCollectBinCols}
            notNote
            data={this.state.fixCollectBinItems}
          />:null
        }
      </div>
    )
  }
}
