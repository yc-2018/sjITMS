import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Tabs, message, Row, Col } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import { addressToStr, convertCodeName } from '@/utils/utils';
import { basicState } from '@/utils/BasicState';
import { havePermission } from '@/utils/authority';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { commonLocale } from '@/utils/CommonLocale';
import { processingSchemeLocal } from './ProcessingSchemeLocal';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { sourceWay } from '@/utils/SourceWay';
import { WORK_RES } from './ProcessingSchemePermission';
import { OWNER_RES } from '@/pages/Basic/Owner/OwnerPermission';
import { routerRedux } from 'dva/router';
import StandardTable from '@/components/StandardTable';
const TabPane = Tabs.TabPane;
@connect(({ processingScheme, loading }) => ({
  processingScheme,
  loading: loading.models.processingScheme,
}))
export default class ProcessingSchemeViewPage extends ViewPage {
  constructor(props) {
    super(props);
    this.state = {
      entity: {},
      rawItems: [],
      endproductItems: [],
      entityUuid: props.processingScheme.entityUuid,
      title: '',
      operate: '',
      modalVisible: false,
      disabledChangeState: loginOrg().type === 'COMPANY' ? !havePermission(WORK_RES.ONLINE) : true
    }
  }
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.processingScheme.entity) {
      this.setState({
        entity: nextProps.processingScheme.entity,
        rawItems:nextProps.processingScheme.entity.rawItems ? nextProps.processingScheme.entity.rawItems : [],
        endproductItems:nextProps.processingScheme.entity.endproductItems ? nextProps.processingScheme.entity.endproductItems : [],
        title: convertCodeName(nextProps.processingScheme.entity),
        entityState: nextProps.processingScheme.entity.state,
        entityUuid: nextProps.processingScheme.entity.uuid,
      });
    }
  }
  /**
   * 刷新
   */
  refresh() {
    const { entityUuid } = this.state;
    this.props.dispatch({
      type: 'processingScheme/getByUuid',
      payload: entityUuid
    });
  }
  /**
   * 返回
   */
  onBack = () => {
    this.props.dispatch({
      type: 'processingScheme/showPage',
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
      type: 'processingScheme/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entityUuid
      }
    });
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
      this.onDelete();
    }
  }
  /**
   * 删除
   */
  onDelete = () => {
    const { entity } = this.state
    this.props.dispatch({
      type: 'processingScheme/remove',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: (response) => {
        if (response && response.success) {
          this.onBack();
          message.success(commonLocale.removeSuccessLocale)
        } else {
          message.error(response.message)
        }
      }
    })
  }
  /**
   * 启用禁用
   */
  onChangeState = () => {
    const { entity } = this.state;
    if (entity.state === basicState.ONLINE.name) {
      this.props.dispatch({
        type: 'processingScheme/offline',
        payload: {
          uuid: entity.uuid,
          version: entity.version
        },
        callback: (response) => {
          if (response && response.success) {
            this.refresh();
            message.success(commonLocale.offlineSuccessLocale);
          }
        }
      });
    } else {
      this.props.dispatch({
        type: 'processingScheme/online',
        payload: {
          uuid: entity.uuid,
          version: entity.version
        },
        callback: (response) => {
          if (response && response.success) {
            this.refresh();
            message.success(commonLocale.onlineSuccessLocale);
          }
        }
      });
    }
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
          loginOrg().type === 'COMPANY' ?
            <Button
              disabled={!havePermission(WORK_RES.DELETE)}
              onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}>
              {commonLocale.deleteLocale}
            </Button> : null
        }
        {
          loginOrg().type === 'COMPANY' ?
            <Button
              disabled={!havePermission(WORK_RES.CREATE)}
              type="primary" onClick={this.onEdit}>
              {commonLocale.editLocale}
            </Button> : null
        }
      </Fragment>
    );
  }
  /**
   * 绘制信息详情
   */
  drawInfoTab = () => {
    const { entity } = this.state;
    const rawItems = entity.rawItems;
    const endproductItems = entity.endproductItems;
    let articleUuids = [];
    rawItems && rawItems.map(item => {
      if (articleUuids.indexOf(item.article.uuid) === -1) {
        articleUuids.push(item.article.uuid);
      }
    })
    endproductItems && endproductItems.map(item => {
      if (articleUuids.indexOf(item.article.uuid) === -1) {
        articleUuids.push(item.article.uuid);
      }
    })
    let basicItems = [{
      label: commonLocale.codeLocale,
      value: entity.code
    }, {
      label: commonLocale.nameLocale,
      value: entity.name
    },
      {
        label: commonLocale.ownerLocale,
        value: <a onClick={this.onViewOwner.bind(true, entity.owner ? entity.owner.uuid : undefined) }
                  disabled={!havePermission(OWNER_RES.VIEW)}>{convertCodeName(entity.owner)}</a>
      },
      {
        label: commonLocale.noteLocale,
        value: entity.note
      }];
    let articleCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: processingSchemeLocal.articleAndSpec,
        width: itemColWidth.articleEditColWidth,
        render: (record) => {
          return <span>
            <a onClick={this.onViewArticle.bind(true, record.article ? record.article.uuid : undefined) }><EllipsisCol colValue={convertCodeName(record.article)+ ' / ' + record.spec}/></a>
          </span> ;
        }
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        width: itemColWidth.qpcStrEditColWidth,
        render: record => record.qpcStr + ' / ' + record.munit
      },
      {
        title: commonLocale.inQtyStrLocale,
        dataIndex: 'qtyStr',
        key: 'qtyStr',
        width: itemColWidth.qtyStrColWidth
      },
      {
        title: commonLocale.inQtyLocale,
        dataIndex: 'qty',
        key: 'qty',
        width: itemColWidth.qtyColWidth
      },
    ]
    let articleCols1 = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: processingSchemeLocal.articleAndSpec,
        width: itemColWidth.articleEditColWidth,
        render: (record) => {
          return <span>
            <a onClick={this.onViewArticle.bind(true, record.article ? record.article.uuid : undefined) }><EllipsisCol colValue={convertCodeName(record.article)+ ' / ' + record.spec}/></a>
          </span> ;
        }
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        width: itemColWidth.qpcStrEditColWidth,
        render: record => record.qpcStr + ' / ' + record.munit
      },
      {
        title: commonLocale.inQtyStrLocale,
        dataIndex: 'qtyStr',
        key: 'qtyStr',
        width: itemColWidth.qtyStrColWidth
      },
      {
        title: commonLocale.inQtyLocale,
        dataIndex: 'qty',
        key: 'qty',
        width: itemColWidth.qtyColWidth
      },
    ]
    let itemsTab = <Tabs defaultActiveKey="rawItems">
    <TabPane tab={commonLocale.rawArticleLocal} key={'rawItems'}>
       <div style={{marginTop:'-30px'}}>
       <StandardTable
               minHeight={this.minHeight ? this.minHeight : 150}
               rowKey={record => record.uuid ? record.uuid : record.line}
               unShowRow={true}
               data={this.state.rawItems ? this.state.rawItems : []}
               columns={articleCols}
               selectedRows={[]}
               comId={'processScheme.view.rawItems'}
               hasSettingColumns
             />
       </div>
       <div style={{height:'60px'}}></div>
     </TabPane>
    <TabPane tab={commonLocale.endproductArticleLocal} key={'endproductItems'}>
       <div style={{marginTop:'-30px'}}>
       <StandardTable
               minHeight={this.minHeight ? this.minHeight : 150}
               rowKey={record => record.uuid ? record.uuid : record.line}
               unShowRow={true}
               data={this.state.endproductItems ? this.state.endproductItems : []}
               columns={articleCols1}
               selectedRows={[]}
               comId={'processScheme.view.endproductItems'}
               hasSettingColumns
             />
       </div>
       <div style={{height:'60px'}}></div>
     </TabPane>
   </Tabs>
    return (
      <TabPane key="basicInfo" tab={processingSchemeLocal.title}>
        <ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} />
        <ViewPanel children={itemsTab} title={'明细'} />
        <div>
          <ConfirmModal
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={processingSchemeLocal.title}
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
      this.drawInfoTab(),
    ];

    return tabPanes;
  }
}
