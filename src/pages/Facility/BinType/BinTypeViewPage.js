import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Tabs, message } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import { formatMessage } from 'umi/locale';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { BinType_RES } from './BinTypePermission';
import { commonLocale } from '@/utils/CommonLocale';
import { BinTypeLocale } from './BinTypeLocale';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
const TabPane = Tabs.TabPane;

@connect(({ binType, loading }) => ({
  binType,
  loading: loading.models.binType,
}))
export default class BinTypeViewPage extends ViewPage {

  constructor(props) {
    super(props);

    this.state = {
      entity: {},
      entityUuid: props.binType.entityUuid,
      entityCode: props.binType.entityCode,
      title: '',
    }
  }

  componentDidMount() {
    this.refresh(this.state.entityCode, this.state.entityUuid);
  }

  componentWillReceiveProps(nextProps) {
    const entity = nextProps.binType.entity;
    if (entity && (entity.code === this.state.entityCode || entity.uuid === this.state.entityUuid)) {
      this.setState({
        entity: entity,
        title: convertCodeName(entity),
        entityUuid: entity.uuid,
        entityCode: entity.code,
      });
    }
  }

  refresh(entityCode, entityUuid) {
    // const { entityUuid } = this.state;
    if (!entityCode && !entityUuid) {
      entityCode = this.state.entityCode;
    }

    if(entityCode){
      this.props.dispatch({
        type: 'binType/getByCodeAndDcUuid',
        payload: {
          code: entityCode,
          dcUuid: loginOrg().uuid
        },
        callback: (response) => {
          // 当查询实体结果为空时，给出错误信息，返回列表页
          if (!response || !response.data || !response.data.uuid) {
            message.error("指定的货位类型不存在！");
            this.onCancel();
          } else {
            this.setState({
              entityCode: response.data.code
            });
          }
        }
      });
      return;
    }

    if(entityUuid){
      this.props.dispatch({
        type: 'binType/get',
        payload: {
          uuid: entityUuid
        },
        callback: (response) => {
          // 当查询实体结果为空时，给出错误信息，返回列表页
          if (!response || !response.data || !response.data.uuid) {
            message.error("指定的货位类型不存在！");
            this.onCancel();
          } else {
            this.setState({
              entityCode: response.data.code
            });
          }
        }
      });
    }

  }

  onBack = () => {
    this.props.dispatch({
      type: 'binType/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  onEdit = () => {
    this.props.dispatch({
      type: 'binType/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entityUuid
      }
    });
  }

  drawActionButtion = () => {
    return (
      <Fragment>
        <Button onClick={this.onBack} >
          {commonLocale.backLocale}
        </Button>
        <Button type="primary" onClick={this.onEdit} disabled={!havePermission(BinType_RES.EDIT)}>
          {commonLocale.editLocale}
        </Button>
      </Fragment>
    );
  }

  drawTabPanes = () => {
    let tabPanes = [
      this.drawBinTypeInfoTab(),
    ];

    return tabPanes;
  }

  drawBinTypeInfoTab = () => {
    const { entity } = this.state;

    let basicItems = [{
      label: commonLocale.codeLocale,
      value: entity.code
    }, {
      label: commonLocale.nameLocale,
      value: entity.name
    }, {
      label: formatMessage({ id: 'bintype.detail.basic.storageNumber' }),
      value: entity.storageNumber
    }, {
      label: commonLocale.noteLocale,
      value: entity.note
    }];

    let qpcItems = [{
      label: formatMessage({ id: 'bintype.detail.basic.length' }),
      value: entity.length
    }, {
      label: formatMessage({ id: 'bintype.detail.basic.width' }),
      value: entity.width
    }, {
      label: formatMessage({ id: 'bintype.detail.basic.height' }),
      value: entity.height
    }, {
      label: formatMessage({ id: 'bintype.detail.basic.weight' }),
      value: entity.weight
    }, {
      label: formatMessage({ id: 'bintype.detail.basic.plotRatio' }),
      value: entity.plotRatio
    }
    ];


    return (
      <TabPane key="basicInfo" tab={BinTypeLocale.title}>
          <ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} />
          <ViewPanel items={qpcItems} title={formatMessage({ id: 'bintype.create.qpc' })} />
      </TabPane>
    );
  }

  /**
   * 跳转至列表页面
   */
  onCancel = () => {
    this.props.dispatch({
      type: 'binType/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
}
