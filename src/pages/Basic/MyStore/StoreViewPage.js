import { connect } from 'dva';
import moment from 'moment';
import { Fragment } from 'react';
import { Button, Tabs, message, Spin } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import { orgType } from '@/utils/OrgType';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { OWNER_RES } from '@/pages/Basic/Owner/OwnerPermission';
import Empty from '@/pages/Component/Form/Empty';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import { commonLocale } from '@/utils/CommonLocale';
import { addressToStr, convertCodeName, formatDate } from '@/utils/utils';
import { basicState } from '@/utils/BasicState';
import { havePermission } from '@/utils/authority';
import { STORE_RES } from './StorePermission';
import { storeLocale } from './StoreLocale';
import StoreBusinessForm from './StoreBusinessForm';
import { ArrivalType, SignIn } from './StoreContants';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import StoreDCBusinessForm from './StoreDCBusinessForm';
import { accMul } from '@/utils/QpcStrUtil';

const TabPane = Tabs.TabPane;

@connect(({ store, loading }) => ({
  store,
  loading: loading.models.store,
}))
export default class StoreViewPage extends ViewPage {
  constructor(props) {
    super(props);

    this.state = {
      entity: {},
      entityUuid: props.store.entityUuid,
      title: '',
      // disabledChangeState: loginOrg().type === 'COMPANY' ? !havePermission(STORE_RES.ONLINE) : 'disabled',
      showStoreBusinessForm: false,
      showStoreDCBusinessForm: false,
      entityCode: props.store.entityCode
    }
  }
  componentDidMount() {
    this.refresh(this.state.entityCode);
  }

  componentWillReceiveProps(nextProps) {
    const entity = nextProps.store.entity;
    if (entity) {
      this.setState({
        entity: entity,
        title: convertCodeName(entity),
        entityState: entity.state,
        entityUuid: entity.uuid,
        entityCode: entity.code
      });
    }
  }
  /**
  * 刷新
  */
  refresh(entityCode) {
    if(!entityCode){
      entityCode = this.state.entityCode
    }
    if(entityCode){
      this.props.dispatch({
        type:'store/getByCompanyUuidAndCode',
        payload: entityCode,
        callback: (response)=>{
          if(!response || !response.data || !response.data.uuid){
            message.error("指定的门店不存在")
            this.onCancel()
          } else {
            this.setState({
              entityCode: response.data.code
            })
          }
        }
      })
    }else {
      this.props.dispatch({
        type: 'store/getByCompanyUuidAndUuid',
        payload: this.props.store.entityUuid
      });
    }
  }
  /**
  * 返回
  */
  onBack = () => {
    this.props.dispatch({
      type: 'store/showPage',
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
      type: 'store/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entityUuid
      }
    });
  }
  /**
  * 启用禁用
  */
  onChangeState = () => {
    const { entity } = this.state;
    if (entity.state === basicState.ONLINE.name) {
      this.props.dispatch({
        type: 'store/offline',
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
        type: 'store/online',
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
            <Button type="primary" onClick={this.onEdit} disabled={!havePermission(STORE_RES.EDIT)}>
              {commonLocale.editLocale}
            </Button> : null
        }
      </Fragment>
    );
  }

  /**
   * 显示编辑业务信息框
   */
  onStoreBusinessEdit = () => {
    this.switchStoreBusinessView(true);
  }
  /**
   * 显示编辑业务信息框-DC
   */
  onStoreDCBusinessEdit= () => {
    this.switchStoreDCBusinessView(true);
  }
  /**
   * 控制门店业务信息的展示--调度
   */
  switchStoreBusinessView = (flag) => {
    this.setState({
      showStoreBusinessForm: !!flag
    })
  }

  /**
   * 控制门店业务信息的展示--调度
   */
  switchStoreDCBusinessView = (flag) => {
    this.setState({
      showStoreDCBusinessForm: !!flag
    })
  }


  /**
  * 绘制信息详情
  */
  drawStoreInfoTab = () => {
    const { entity,showStoreBusinessForm,showStoreDCBusinessForm} = this.state;
    let ownerInitialValues = [];

    if (entity && entity.owners) {
      entity.owners.map(value => {
        ownerInitialValues.push('[' + value.owner.code + ']' + value.owner.name);
      });
    }

    let basicItems = [{
      label: commonLocale.codeLocale,
      value: entity.code
    }, {
      label: commonLocale.nameLocale,
      value: entity.name
    }, {
      label: commonLocale.shortNameLocale,
      value: entity.shortName
    }, {
      label: storeLocale.storeType,
      value: entity.storeType
    }, {
      label: commonLocale.ownerLocale,
      value: entity.owners ? <EllipsisCol colValue={ownerInitialValues.join('、')} /> : <Empty/>
    }, {
      label: storeLocale.operatingType,
      value: entity.operatingType
    }, {
      label: commonLocale.contactorLocale,
      value: entity.contactor
    }, {
      label: commonLocale.contactPhoneLocale,
      value: entity.contactPhone
    }, {
      label: commonLocale.addressLocale,
      value: addressToStr(entity.address)
    }, {
      label: storeLocale.operatingArea,
      value: entity.operatingArea
    }, {
      label: storeLocale.distance,
      value: entity.distance
    }, {
      label: commonLocale.zipCodeLocale,
      value: entity.zipCode
    }, {
      label: commonLocale.homeUrlLocale,
      value: entity.homeUrl
    }, {
      label: commonLocale.customField1,
      value: entity.custom1
    }, {
      label: commonLocale.noteLocale,
      value: entity.note
    }];

    let businessItems = [
      {
        label: storeLocale.arrivalType,
        value: entity.storeTms&&entity.storeTms.arrivalType?ArrivalType[entity.storeTms.arrivalType].caption:<Empty/>
      },
      {
        label: storeLocale.signIn,
        value:  entity.storeTms&&entity.storeTms.signIn?SignIn[entity.storeTms.signIn].caption:<Empty/>
      },
      {
        label: storeLocale.receiveTime,
        value:  entity.storeTms&&entity.storeTms.receiveTime?moment(entity.storeTms.receiveTime).format('YYYY-MM-DD'):<Empty/>
      },
      {
        label: storeLocale.parkingFee,
        value:  entity.storeTms&&entity.storeTms.parkingFee?entity.storeTms.parkingFee:<Empty/>
      },
      {
        label: storeLocale.area,
        value:  entity.storeTms&&entity.storeTms.area?entity.storeTms.area:<Empty/>
      },
    ];

    let businessDCItems = [
      {
        label: '货品允收期',
        value: entity.allowReceiveDay?(entity.allowReceiveDay>1?entity.allowReceiveDay:accMul(entity.allowReceiveDay,100)+' %'):<Empty/>
      },
    ]
    return (
      <TabPane key="basicInfo" tab={storeLocale.title}>
        <ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} />
        {
          loginOrg().type === orgType.dispatchCenter.name &&
          <Spin indicator={LoadingIcon('default')} tip="加载中..."spinning ={this.props.loading}>
            <ViewPanel onEdit={!showStoreBusinessForm && this.onStoreBusinessEdit}
              items={businessItems} title={storeLocale.tmsInfo} >
              {showStoreBusinessForm &&
                (
                  <StoreBusinessForm
                    storeBusiness={entity.storeTms}
                    storeInfo={entity}
                    switchStoreBusinessView={this.switchStoreBusinessView}
                    refresh={this.refresh.bind(this)}
                  />
                )
              }
            </ViewPanel>
          </Spin>
        }
        {
          loginOrg().type === orgType.dc.name &&
          <Spin indicator={LoadingIcon('default')} tip="加载中..."spinning ={this.props.loading}>
            <ViewPanel onEdit={!showStoreDCBusinessForm && this.onStoreDCBusinessEdit}
              items={businessDCItems} title={'配送中心信息'} >
              {showStoreDCBusinessForm &&
                (
                  <StoreDCBusinessForm
                    // storeBusiness={entity.storeTms}
                    storeInfo={entity}
                    switchStoreDCBusinessView={this.switchStoreDCBusinessView}
                    refresh={this.refresh.bind(this)}
                  />
                )
              }
            </ViewPanel>
          </Spin>
        }
      </TabPane>
    );
  }
  /**
  * 绘制Tab页
  */
  drawTabPanes = () => {
    let tabPanes = [
      this.drawStoreInfoTab(),
    ];

    return tabPanes;
  }

  /**
   * 跳转至列表页面
   */
  onCancel = () => {
    this.props.dispatch({
      type: 'store/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }
}
