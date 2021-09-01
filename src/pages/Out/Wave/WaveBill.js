import { PureComponent } from "react";
import { connect } from 'dva';
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';
import WaveBillCreatePage from './WaveBillCreatePage';
import WaveBillSearchPage from './WaveBillSearchPage';
import WaveBillViewPage from './WaveBillViewPage';
import WaveBillFinishPage from './WaveBillFinishPage';
import { waveBillLocale } from './WaveBillLocale';


@connect(({ wave, loading }) => ({
  wave,
  loading: loading.models.wave,
}))
export default class WaveBill extends PureComponent {

  render() {
    const { showPage, entityUuid,waveBillNumber,waveState,billNumber } = this.props.wave;
    if (showPage === 'query') {
      return <WaveBillSearchPage pathname={this.props.location.pathname} />;
    }else if (showPage === 'create') {
      return <WaveBillCreatePage pathname={this.props.location.pathname} entityUuid={entityUuid} waveBillNumber={waveBillNumber}/>;
    }else if (showPage === 'waveTypeView') {
      return <PreType 
        preType = {
          PRETYPE['waveType']
        }
        title = {waveBillLocale.waveType}
        backToBefore = {
          () => {
            this.props.dispatch({
              type: 'wave/onCancelWaveType',
            })
          }
        }
      />
    }else if(showPage === 'finish'){
      return <WaveBillFinishPage pathname={this.props.location.pathname} entityUuid={entityUuid} waveBillNumber={waveBillNumber} waveState={waveState}/>;
    } else {
      return (<WaveBillViewPage pathname={this.props.location.pathname} entityUuid={entityUuid} waveBillNumber={waveBillNumber} billNumber={billNumber} waveState={waveState}/>);
    }
  }
}
