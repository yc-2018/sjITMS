import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Tabs, message, Table, Checkbox } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import { formatMessage } from 'umi/locale';
import NotePanel from '@/pages/Component/Form/NotePanel';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import FormTitle from '@/pages/Component/Form/FormTitle';
import { CONTAINERTYPE_RES } from './PalletBinTypePermission';
import { addressToStr, convertCodeName } from '@/utils/utils';
import { basicState } from '@/utils/BasicState';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import { palletBinTypeLocale, BarcodeType, RecycleType } from './PalletBinTypeLocale';
import { spawn } from 'child_process';
import { containerTypeLocale } from '@/pages/Facility/ContainerType/ContainerTypeLocale';
import responsive from '@/components/DescriptionList/responsive';

const TabPane = Tabs.TabPane;

@connect(({ palletBinType, loading }) => ({
    palletBinType,
    loading: loading.models.palletBinType,
}))
export default class PalletBinTypeViewPage extends ViewPage {

    constructor(props) {
        super(props);

        this.state = {
            entity: {},
            title: '',
            entityUuid: props.palletBinType.entityUuid,
            entityState: '',
            entityCode : props.palletBinType.entityCode
        }
    }

    componentDidMount() {
        this.refresh(this.state.entityCode);
    }

    componentWillReceiveProps(nextProps) {
        const palletBinType = nextProps.palletBinType.entity;
        if(palletBinType ) {
          this.setState({
            entity: palletBinType,
            title: palletBinType ? convertCodeName(palletBinType) : '',
            entityUuid: palletBinType ? palletBinType.uuid : '',
            entityCode: palletBinType ? palletBinType.code : '',
          });
        }
        const  nextEntityCode = nextProps.palletBinType.entityCode;
        if(nextEntityCode && nextEntityCode !== this.state.entityCode){
          this.setState({
            entityCode :nextEntityCode
          });
          this.refresh(nextEntityCode)
        }
    }

    refresh(entityCode) {
      if (!entityCode ) {
        entityCode = this.state.entityCode
      }
      if(entityCode){
        this.props.dispatch({
          type: 'palletBinType/getByCode',
          payload: entityCode,
          callback: (response) => {
            if (!response || !response.data || !response.data.uuid) {
              message.error("指定的板位类型不存在！");
              this.onBack();
            } else {
              this.setState({
                entityCode: response.data.code
              });
            }
          }
        });
      } else {
        this.props.dispatch({
          type: 'palletBinType/get',
          payload: this.props.palletBinType.entityUuid,
          callback:(response) =>{
            if (!response || !response.data || !response.data.uuid) {
              message.error("指定的板位类型不存在！");
              this.onBack();
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
            type: 'palletBinType/showPage',
            payload: {
                showPage: 'query',
              fromView: true
            }
        });
    }

    onEdit = () => {
        this.props.dispatch({
            type: 'palletBinType/showPage',
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
                <Button type="primary" onClick={this.onEdit}>
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
            label: palletBinTypeLocale.barCodePrefix,
            value: entity ? entity.barCodePrefix : ''
        }, {
          label: palletBinTypeLocale.barCodeLength,
          value: entity ? entity.barCodeLength : ''
        },{
          label: commonLocale.noteLocale,
          value: entity ? entity.note : ''
        }];

        let qpcItems = [
            {
                label: palletBinTypeLocale.length,
                value: entity ? entity.length : ''
            }, {
                label: palletBinTypeLocale.width,
                value: entity ? entity.width : ''
            }, {
                label: palletBinTypeLocale.height,
                value: entity ? entity.height : ''
            }, {
                label: palletBinTypeLocale.weight,
                value: entity ? entity.weight : ''
            }, {
                label: palletBinTypeLocale.plotRatio,
                value: entity ? entity.plotRatio : ''
            },
        ];


        return (
            <TabPane key="basicInfo" tab={palletBinTypeLocale.title}>
                <ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} />
                <ViewPanel items={qpcItems} title={palletBinTypeLocale.qpcInfoLocale} />
            </TabPane>
        );
    }
}
