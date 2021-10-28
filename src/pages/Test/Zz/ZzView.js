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
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { accMul } from '@/utils/QpcStrUtil';

const TabPane = Tabs.TabPane;

@connect(({ zztest, loading }) => ({
    zztest,
    loading: loading.models.zztest,
  }))
  export default class ZzView extends ViewPage {
    constructor(props) {
      super(props);
  
      this.state = {
        entity: this.props.zztest.entity,
        entityUuid: props.zztest.entityUuid,
        title: '',
        showStoreBusinessForm: false,
        showStoreDCBusinessForm: false,
        entityCode: ''
      }
    }
    componentDidMount() {
      this.refresh();
    }

    /**
       * 查询后刷新数据！！
       * 
       */
    componentWillReceiveProps(nextProps) {
        this.setState({
            entity: nextProps.zztest.entity,
            title:nextProps.zztest.entity.name
        });
    }
      
    /**
    * 刷新
    */
    refresh() {
        this.props.dispatch({
          type: 'zztest/getById',
          payload: this.props.zztest.entityUuid
        });
        console.log('接收到了吗？',this.props.zztest.entity)
      
    }
      
    /**
    * 返回
    */
    onBack = () => {
      this.props.dispatch({
        type: 'zztest/showPage',
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
        type: 'zztest/showPage',
        payload: {
          showPage: 'create',
          entityUuid: this.state.entityUuid
        }
      });
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
              <Button type="primary" onClick={this.onEdit}>
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
    * 绘制信息详情
    */
    drawStoreInfoTab = () => {
      const { entity} = this.state;
      
  
        // 基本员工信息
      let basicItems = [{
        label: '姓名',
        value: entity.name
      }, {
        label: '年龄',
        value: entity.age
      }, {
        label: '性别',
        value: entity.sex
      },
      {
        label: '电话',
        value: entity.phone
      },
      {
        label: '地址',
        value: entity.address2
      }];
  
  
      return (
        <TabPane key="basicInfo" tab='员工信息'>
          <ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} />
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
        type: 'zztest/showPage',
        payload: {
          showPage: 'query',
          fromView: true
        }
      });
    }
  }