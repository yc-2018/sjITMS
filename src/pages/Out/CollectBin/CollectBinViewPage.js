import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, Tabs, Tag,message } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { convertCodeName } from '@/utils/utils';
import { itemColWidth,colWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { loginCompany, loginOrg,getActiveKey } from '@/utils/LoginContext';
import { LogisticMode,CollectBinMgrType } from './CollectBinContants';
import { COLLECTBIN_RES } from './CollectBinPermission';
import { collectBinLocale } from './CollectBinLocale';

const TabPane = Tabs.TabPane;

@connect(({ collectBinScheme, loading }) => ({
    collectBinScheme,
    loading: loading.models.collectBinScheme,
}))
export default class CollectBinViewPage extends ViewPage {
  constructor(props) {
    super(props);
    this.state = {
      entity: {},
      dockGroupItems: [], // 方案中包含的码头集配置
      dockItems: [], // 方案中包含的码头配置
      fixCollectBinItems: [], // 方案中包含的门店固定拣货位配置
      entityUuid: props.entityUuid,
      title: '',
      operate:'',
      modalVisible:false,
    }
  }
   componentDidMount() {
     this.refresh();
   }

   componentWillReceiveProps(nextProps) {
     if (nextProps.collectBinScheme.entity) {
      if (nextProps.collectBinScheme.entity.data && nextProps.collectBinScheme.entity.data.dockGroupItems) {
        for (let i = 0; i < nextProps.collectBinScheme.entity.data.dockGroupItems.length; i++) {
          nextProps.collectBinScheme.entity.data.dockGroupItems[i].line = i + 1;
        }
      }

      if (nextProps.collectBinScheme.entity.data&&nextProps.collectBinScheme.entity.data.dockItems) {
        for (let i = 0; i < nextProps.collectBinScheme.entity.data.dockItems.length; i++) {
          nextProps.collectBinScheme.entity.data.dockItems[i].line = i + 1;
        }
      }

      if (nextProps.collectBinScheme.entity.data&&nextProps.collectBinScheme.entity.data.fixCollectBinItems) {
        for (let i = 0; i < nextProps.collectBinScheme.entity.data.fixCollectBinItems.length; i++) {
          nextProps.collectBinScheme.entity.data.fixCollectBinItems[i].line = i + 1;
        }
      }
      let name = '';
      if (nextProps.collectBinScheme.entity.data){
        name = nextProps.collectBinScheme.entity.data.name
      }

      this.setState({
        entity: nextProps.collectBinScheme.entity.data ? nextProps.collectBinScheme.entity.data:{},
        dockGroupItems: nextProps.collectBinScheme.entity.data ? nextProps.collectBinScheme.entity.data.dockGroupItems : [],
        dockItems: nextProps.collectBinScheme.entity.data ? nextProps.collectBinScheme.entity.data.dockItems : [],
        fixCollectBinItems: nextProps.collectBinScheme.entity.data ? nextProps.collectBinScheme.entity.data.fixCollectBinItems : [],
        title: collectBinLocale.title + '：' + name,
        entityUuid: nextProps.collectBinScheme.entity.data?nextProps.collectBinScheme.entity.data.uuid:'',
      });
     }
   }
  /**
  * 刷新
  */
  refresh() {
    const { entityUuid } = this.state;
    this.props.dispatch({
      type: 'collectBinScheme/get',
      payload: {
        uuid:entityUuid
      }
    });
  }
  /**
  * 返回
  */
  onBack = () => {
    this.props.dispatch({
      type: 'collectBinScheme/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }
  /**
  * 编辑
  */
  onEdit = () => {
    this.props.dispatch({
      type: 'collectBinScheme/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entityUuid
      }
    });
  }

  /**
   * 模态框显示/隐藏
   */
  handleModalVisible =(operate)=>{
    if(operate){
      this.setState({
        operate:operate
      });
    }
    this.setState({
      modalVisible:!this.state.modalVisible
    });
  }
  /**
   * 模态框确认操作
   */
  handleOk = () =>{
    const {operate} = this.state;
    if (operate === commonLocale.deleteLocale){
      this.onDelete();
    }
  }
  /**
   * 删除
   */
  onDelete = ()=>{
    const {entity} = this.state
    this.props.dispatch({
      type: 'collectBinScheme/onRemove',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: (response) => {
        if (response && response.success) {
          this.onBack();
          message.success(commonLocale.removeSuccessLocale)
        }
      }
    })
  }
  /**
  * 绘制右上角按钮
  */
  drawActionButtion = () => {
      return (
        <Fragment>
          <Button onClick={this.onBack}>
              {commonLocale.backLocale}
          </Button>
          {
            <Button onClick={()=>this.handleModalVisible(commonLocale.deleteLocale)} 
              disabled={!havePermission(COLLECTBIN_RES.DELETE)}
            >
              {commonLocale.deleteLocale}
            </Button>
          }
          {
            <Button onClick={this.onEdit} type="primary" 
              disabled={!havePermission(COLLECTBIN_RES.EDIT)}
            >
              {commonLocale.editLocale}
            </Button>
          }
        </Fragment>
      );
  }
  /**
  * 绘制信息详情
  */
  drawCollectBinBillInfoTab = () => {
    const { entity,dockGroupItems,dockItems,fixCollectBinItems } = this.state;
    // 概要
    let profileItems = [
      {
        label: commonLocale.codeLocale,
        value: entity.code
      },
      {
        label: commonLocale.nameLocale,
        value: entity.name
      },
      {
        label: collectBinLocale.mgrType,
        value: entity.mgrType?CollectBinMgrType[entity.mgrType].caption:'无'
      }
    ];
    if (entity.mgrType==='CAREFUL'){
      profileItems.push(
        {
          label: collectBinLocale.startFromFirstLable,
          value: entity.startFromFirst?'是':'否'
        },
        {
          label: collectBinLocale.loopFindLable,
          value: entity.loopFind ? '是' : '否'
        }
      );
    }


    //码头集明细
    let dockGroupCols =[
      {
        title: commonLocale.lineLocal,
        width: itemColWidth.lineColWidth,
        dataIndex: 'line',
      },
      {
        title: collectBinLocale.dockGroup,
        width: colWidth.codeNameColWidth + 100,
        render: record => record.dockGroup ? <EllipsisCol colValue={convertCodeName(record.dockGroup)} /> : record.dockGroup
      },
      {
        title: collectBinLocale.collectBin,
        dataIndex: 'collectBin',
        width: itemColWidth.binCodeEditColWidth + 100,
      }
    ];

    // 码头明细
    let dockCols=[
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: collectBinLocale.dockGroup,
        width: colWidth.codeNameColWidth + 100,
        render: record => record.dockGroup ? <EllipsisCol colValue={convertCodeName(record.dockGroup)} /> : '无'
      },
      {
        title: commonLocale.inStoreLocale,        
        width: colWidth.codeNameColWidth + 100,
        render: record => record.dockGroup ? <EllipsisCol colValue={convertCodeName(record.store)} /> : '无'
      },
      {
        title: collectBinLocale.dock,
        width: colWidth.codeNameColWidth + 100,
        render: record => record.dockGroup ? <EllipsisCol colValue={convertCodeName(record.dock)} /> : '无'
      },
      {
        title: collectBinLocale.collectBin,
        dataIndex: 'collectBin',
        width: itemColWidth.binCodeEditColWidth + 100,
      },
    ];

    // 固定集货位明细
    let collectBinCols=[
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: commonLocale.inStoreLocale,   
        width: colWidth.codeNameColWidth + 100,
        render: record => record.store ? <EllipsisCol colValue={convertCodeName(record.store)} /> : '无'
      },
      {
        title: collectBinLocale.collectBinScope,
        dataIndex: 'binScope',
        width: itemColWidth.binCodeEditColWidth + 100,
      },
    ];
   

    return (
        <TabPane key="basicInfo" tab={collectBinLocale.title}>
          <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} />
          {
            this.state.entity.mgrType===CollectBinMgrType.NOCARE.name?
            <ViewTablePanel
              notNote
              title = {collectBinLocale.dockGroupItem}
              columns={dockGroupCols}
              data={dockGroupItems?dockGroupItems:[]}
            />:null
          }
          {
            this.state.entity.mgrType==='CARELESS'?
            <ViewTablePanel
              notNote
              title = {collectBinLocale.dockItem}
              columns={dockCols}
              data={dockItems?dockItems:[]}
            />:null
          }
          {
            this.state.entity.mgrType === 'CAREFUL' ?
              <ViewTablePanel
                notNote
                title = {collectBinLocale.storeFixCollectBin}
                columns={collectBinCols}
                data={fixCollectBinItems?fixCollectBinItems:[]}
            />:null
          }
          <div>
            <ConfirmModal
              visible={this.state.modalVisible}
              operate={this.state.operate}
              object={collectBinLocale.title+':'+this.state.entity.name}
              onOk={this.handleOk}
              onCancel={this.handleModalVisible}
            />
          </div>
        </TabPane>
    );
  }
  /**
  * 绘制Tab页
  */
  drawTabPanes = () => {
    let tabPanes = [
      this.drawCollectBinBillInfoTab(),
    ];

    return tabPanes;
  }
}
