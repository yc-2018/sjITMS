import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Tabs, message } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import { addressToStr, convertCodeName } from '@/utils/utils';
import { basicState } from '@/utils/BasicState';
import { havePermission } from '@/utils/authority';
import { CATEGORY_RES } from './CategoryPermission';
import { commonLocale } from '@/utils/CommonLocale';
import { categoryLocale } from './CategoryLocale';
import { getSourceWayCaption } from '@/utils/SourceWay';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

const TabPane = Tabs.TabPane;

@connect(({ category, loading }) => ({
  category,
  loading: loading.models.category,
}))
export default class CategoryViewPage extends ViewPage {
  constructor(props) {
    super(props);

    this.state = {
      entity: {},
      entityUuid: props.category.entityUuid,
      title: '',
      disabledChangeState: loginOrg().type === 'COMPANY' ? !havePermission(CATEGORY_RES.ONLINE) : 'disabled',
      entityCode: props.category.entityCode
    }
  }
  componentDidMount() {
    this.refresh(this.state.entityCode);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.category.entity) {
      this.setState({
        entity: nextProps.category.entity,
        title: convertCodeName(nextProps.category.entity),
        entityState: nextProps.category.entity.state,
        entityUuid: nextProps.category.entity.uuid,
      });
    }
  }
  /**
   * 刷新
   */
  refresh(entityCode) {
    if (!entityCode) {
      entityCode = this.state.entityCode;
    }
    if (entityCode) {
      this.props.dispatch({
        type: 'category/getByCode',
        payload: entityCode,
        callback:(response) =>{
          if(!response || !response.data || !response.data.uuid){
            message.error("指定类别不存在。")
            this.onBack();
          }else{
            this.setState({
              entityCode:response.data.code
            })
          }
        }
      });
    } else {
      this.props.dispatch({
      type: 'category/get',
      payload: this.props.category.entityUuid
    });
    }
  }
  /**
   * 返回
   */
  onBack = () => {
    this.props.dispatch({
      type: 'category/showPage',
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
      type: 'category/showPage',
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
        type: 'category/offline',
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
        type: 'category/online',
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
   * 右上角按钮
   */
  drawActionButtion = () => {
    return (
      <Fragment>
        <Button onClick={this.onBack}>
          {commonLocale.backLocale}
        </Button>
        {
          loginOrg().type === 'COMPANY' ?
            <Button type="primary" onClick={this.onEdit} disabled={!havePermission(CATEGORY_RES.EDIT)}>
              {commonLocale.editLocale}
            </Button> : null
        }
      </Fragment>
    );
  }
  /**
   * 绘制信息详情
   */
  drawCategoryInfoTab = () => {
    const { entity } = this.state;
    let basicItems = [{
      label: commonLocale.codeLocale,
      value: entity.code
    }, {
      label: commonLocale.nameLocale,
      value: entity.name
    }, {
      label: commonLocale.inOwnerLocale,
      value: convertCodeName(entity.owner)
    }, {
      label: categoryLocale.level,
      value: entity.level
    }, {
      label: categoryLocale.upperCategory,
      value: convertCodeName(entity.upper ? entity.upper : undefined)
    }, {
      label: commonLocale.sourceWayLocale,
      value: getSourceWayCaption(entity.sourceWay)
    }, {
      label: commonLocale.noteLocale,
      value: entity.note
    }];

    return (
      <TabPane key="basicInfo" tab={categoryLocale.title}>
        <ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} />
      </TabPane>
    );
  }
  /**
   * 绘制Tab页
   */
  drawTabPanes = () => {
    let tabPanes = [
      this.drawCategoryInfoTab(),
    ];

    return tabPanes;
  }
}
