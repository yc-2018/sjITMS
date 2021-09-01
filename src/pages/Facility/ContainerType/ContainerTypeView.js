import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Tabs, message, Table, Checkbox } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import { formatMessage } from 'umi/locale';
import NotePanel from '@/pages/Component/Form/NotePanel';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import FormTitle from '@/pages/Component/Form/FormTitle';
import { CONTAINERTYPE_RES } from './ContainerTypePermission';
import { addressToStr, convertCodeName } from '@/utils/utils';
import { basicState } from '@/utils/BasicState';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import { containerTypeLocale, BarcodeType, RecycleType } from './ContainerTypeLocale';
import { spawn } from 'child_process';
import { loginOrg, loginCompany } from '@/utils/LoginContext';

const TabPane = Tabs.TabPane;

@connect(({ containerType, loading }) => ({
  containerType,
  loading: loading.models.containerType,
}))
export default class ContainerTypeView extends ViewPage {

  constructor(props) {
    super(props);

    this.state = {
      entity: {},
      title: '',
      entityState: '',
      entityUuid: props.containerType.entityUuid,
      entityCode: props.containerType.entityCode,
    }
  }

  componentDidMount() {
    this.refresh(this.state.entityCode, this.state.entityUuid);
  }

  componentWillReceiveProps(nextProps) {
    const containerType = nextProps.containerType.entity;
    if (containerType ) {
      this.setState({
        entity: containerType,
        title: containerType ? convertCodeName(containerType) : '',
        entityUuid: containerType ? containerType.uuid : '',
        entityCode: containerType ? containerType.code : '',
      });
    }
  }

  refresh(entityCode, entityUuid) {
    if (!entityCode && !entityUuid) {
      entityCode = this.state.entityCode;
    }

    if(entityCode){
      this.props.dispatch({
        type: 'containerType/getByCode',
        payload: {
          code: entityCode,
          dcUuid: loginOrg().uuid,
          companyUuid: loginCompany().uuid
        },
        callback: (response) => {
          // 当查询实体结果为空时，给出错误信息，返回列表页
          if (!response || !response.data || !response.data.uuid) {
            message.error("指定的容器类型不存在！");
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
        type: 'containerType/get',
        payload: entityUuid,
        callback: (response) => {
          // 当查询实体结果为空时，给出错误信息，返回列表页
          if (!response || !response.data || !response.data.uuid) {
            message.error("指定的容器类型不存在！");
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
      type: 'containerType/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }

  onEdit = () => {
    this.props.dispatch({
      type: 'containerType/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entity.uuid
      }
    });
  }


  drawActionButtion = () => {
    return (
      <Fragment>
        <Button onClick={this.onBack}>
          {commonLocale.backLocale}
        </Button>
        <Button type="primary" disabled={!havePermission(CONTAINERTYPE_RES.EDIT)} onClick={this.onEdit}>
          {commonLocale.editLocale}
        </Button>
      </Fragment>
    );
  }

  drawTabPanes = () => {
    let tabPanes = [
      this.drawInfoTab(),
    ];

    return tabPanes;
  }

  drawInfoTab = () => {
    const { entity } = this.state;

    let basicItems = [{
      label: commonLocale.codeLocale,
      value: entity ? entity.code : ''
    }, {
      label: commonLocale.nameLocale,
      value: entity ? entity.name : ''
    }, {
      label: containerTypeLocale.barCodePrefix,
      value: entity ? entity.barCodePrefix : ''
    }, {
      label: containerTypeLocale.barcodeType,
      value: entity && entity.barcodeType ? BarcodeType[entity.barcodeType] : ''
    }, {
      label: containerTypeLocale.barCodeLength,
      value: entity ? entity.barCodeLength : ''
    }, {
      label: containerTypeLocale.recycleType,
      value: entity && entity.recycleType ? RecycleType[entity.recycleType] : ''
    }, {
      label: containerTypeLocale.shipFlage,
      value: entity ? (entity.shipFlage ? '是' : '否') : ''
    }, {
      label: containerTypeLocale.collect,
      value: entity ? (entity.collect ? '是' : '否') : ''
    },{
      label: commonLocale.noteLocale,
      value: entity ? entity.note : ''
    }
    ];

    let qpcItems = [
      {
        label: containerTypeLocale.inLength,
        value: entity ? entity.inLength : ''
      },
      {
        label: containerTypeLocale.outLength,
        value: entity ? entity.outLength : ''
      }, {
        label: containerTypeLocale.inWidth,
        value: entity ? entity.inWidth : ''
      }, {
        label: containerTypeLocale.outWidth,
        value: entity ? entity.outWidth : ''
      }, {
        label: containerTypeLocale.inHeight,
        value: entity ? entity.inHeight : ''
      },
      {
        label: containerTypeLocale.outHeight,
        value: entity ? entity.outHeight : ''
      }, {
        label: containerTypeLocale.weight,
        value: entity ? entity.weight : ''
      }, {
        label: containerTypeLocale.bearingWeight,
        value: entity ? entity.bearingWeight : ''
      }, {
        label: containerTypeLocale.plotRatio,
        value: entity ? entity.plotRatio : ''
      },
    ];

    return (
      <TabPane key="basicInfo" tab={containerTypeLocale.title}>
        <ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} />
        <ViewPanel items={qpcItems} title={containerTypeLocale.qpcInfoLocale} />
      </TabPane>
    );
  }

  /**
   * 跳转至列表页面
   */
  onCancel = () => {
    this.props.dispatch({
      type: 'containerType/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
}
