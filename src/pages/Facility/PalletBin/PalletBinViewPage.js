import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Tabs, message, Table } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import { palletBinLocale, palletBinStockLocale } from './PalletBinLocale';
import { convertCodeName } from '@/utils/utils';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { routerRedux } from 'dva/router';

const TabPane = Tabs.TabPane;

@connect(({ palletBin, loading }) => ({
  palletBin,
  loading: loading.models.palletBin,
}))
export default class PalletBinViewPage extends ViewPage {

  constructor(props) {
    super(props);

    this.state = {
      entity: {},
      title: '',
      entityUuid: props.palletBin.entityUuid,
      entityState: '',
      entityCode: props.palletBin.entityCode
    };
  }

  componentDidMount() {
    this.refresh(this.state.entityCode);
  }

  componentWillReceiveProps(nextProps) {
    const palletBin = nextProps.palletBin.entity;

    if (palletBin) {
      // if (nextProps.palletBin.entityUuid
      //   && palletBin.barcode !== nextProps.palletBin.entityUuid) {
      //   this.refresh();
      // }

      this.setState({
        entity: palletBin,
        title: palletBin ? '['+palletBin.barcode+']':'',
        entityUuid: palletBin ? palletBin.uuid :'',
        entityCode: palletBin ? palletBin.barcode : ''
      });
    }
    const  nextEntityCode = nextProps.palletBin.entityCode;
    if(nextEntityCode && nextEntityCode !== this.state.entityCode){
      this.setState({
        entityCode : nextEntityCode
      });
      this.refresh(nextEntityCode)
    }

  }

  refresh(entityCode) {
    if(!entityCode){
      entityCode = this.state.entityCode
    }
    if(entityCode){
      this.props.dispatch({
        type:'palletBin/get',
        payload:{
          barcode:entityCode
        },
        callback:(response) =>{
          if (!response || !response.data || !response.data.uuid) {
            message.error("指定的板位不存在！");
            this.onBack();
          } else {
            this.setState({
              entityCode: response.data.code
            });
          }
        }
      })
    }else {
      this.props.dispatch({
        type: 'palletBin/get',
        payload: {
          barcode: this.props.palletBin.entityUuid,
        },
      });
    }
  }

  getPalletBin = (barcode) => {
    this.props.dispatch({
      type: 'palletBin/get',
      payload: {
        barcode: barcode,
      },
    });
  };

  onViewPalletBinType = (palletBinTypeUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/facility/palletBinType',
      payload: {
        showPage: 'view',
        entityUuid: palletBinTypeUuid,
      },
    }));
  };

  onBack = () => {
    this.props.dispatch({
      type: 'palletBin/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      },
    });
  };

  drawActionButtion = () => {
    return (
      <Fragment>
        <PrintButton
          reportParams={[{ billNumber: this.state.entity ? `${this.state.entity.barcode}` : null }]}
          moduleId={'CONTAINER'}/>
        <Button onClick={this.onBack}>
          {commonLocale.backLocale}
        </Button>

      </Fragment>
    );
  };

  refreshColumns = (columns) => {
    columns.forEach(e => {
      if (e.width) {
        e.onCell = () => {
          return {
            style: {
              maxWidth: e.width,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer',
            },
          };
        };
      }
    });
  };

  drawTabPanes = () => {
    let tabPanes = [
      this.drawInfoTab(),
    ];

    return tabPanes;
  };

  drawInfoTab = () => {
    const { entity } = this.state;

    let basicItems = [{
      label: palletBinLocale.barcodeLocale,
      value: entity ? entity.barcode : '',
    }, {
      label: palletBinLocale.palletBinType,
      value: <a onClick={this.onViewPalletBinType.bind(true, entity && entity.type ? entity.type.uuid : undefined)}
                disabled={!entity.type}>{entity && entity.type ? convertCodeName(entity.type) : ''}</a>,
    }];

    return (
      <TabPane key="basicInfo" tab={palletBinLocale.title}>
        <ViewPanel items={basicItems} title={commonLocale.basicInfoLocale}/>
      </TabPane>
    );
  };
}
