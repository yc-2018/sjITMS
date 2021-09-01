import { Form, Input, Select,DatePicker } from 'antd';
import { connect } from 'dva';
import { loginCompany } from '@/utils/LoginContext';
import { PRETYPE } from '@/utils/constants';
import { commonLocale,placeholderLocale } from '@/utils/CommonLocale';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { waveBillLocale } from './WaveBillLocale';
import { WaveBillState,WaveType } from './WaveBillContants';

const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key='' value=''>{commonLocale.allLocale}</Option>);
Object.keys(WaveBillState).forEach(function (key) {
  stateOptions.push(<Option value={WaveBillState[key].name} key={WaveBillState[key].name}>{WaveBillState[key].caption}</Option>);
});

const WaveTypeOptions = [];
WaveTypeOptions.push(<Option key='' value=''>{commonLocale.allLocale}</Option>)
Object.keys(WaveType).forEach(function (key) {
  WaveTypeOptions.push(<Option value={WaveType[key].name} key={WaveType[key].name} >{WaveType[key].caption}</Option>);
});

@connect(({ wave,pretype,loading }) => ({
  wave,
  pretype,
  loading: loading.models.wave,
}))
@Form.create()
export default class WaveBillSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      toggle: false,
      showLimitDays: true,
    }
  }

  componentDidMount(){
    this.fetchWaveTypesByCompanyUuid();
  }

  componentWillReceiveProps(nextProps){
    const preType = nextProps.pretype;
    if (preType.queryType === PRETYPE['waveType'] && preType.names) {
      var typeNames = [...preType.names];
      this.setState({
        typeNames: typeNames
      })
    }
  }
   /** 
    *  通过企业uuid获取波次类型信息
    */
   fetchWaveTypesByCompanyUuid = () => {
     const {
       dispatch
     } = this.props;
     dispatch({
       type: 'pretype/queryType',
       payload: PRETYPE['waveType']
     });
   };

  onReset = () => {
    this.props.refresh();
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }

  /**
   * 绘制列
   */
  drawCols = () => {
    const { form, filterValue } = this.props;
    const { getFieldDecorator } = form;
    const { toggle,typeNames } = this.state;
    let cols = [];

    let typeNamesItems = [];
    typeNamesItems.push(<Select.Option key=" ">{waveBillLocale.all}</Select.Option>);
    if (typeNames) {
      typeNames.map((result) => typeNamesItems.push(<Option key={`${result}`}>{`${result}`}</Option>));
    }

    cols.push(
      <SFormItem key="billNumber" label={commonLocale.billNumberLocal}>
        {getFieldDecorator('billNumber', {
            initialValue: filterValue.billNumber ? filterValue.billNumber : ''
        })(
            <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)}/>
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="state" label={commonLocale.stateLocale}>
        {getFieldDecorator('state',
          {
            initialValue: filterValue.state? filterValue.state : ''
          }
        )(
          <Select initialValue=''>
            {stateOptions}
          </Select>
        )
        }
      </SFormItem>
    );
     cols.push(
        <SFormItem key="waveType" label={commonLocale.inWaveTypeLocale}>
          {getFieldDecorator('waveType',
            { initialValue: filterValue.waveType?filterValue.waveType:'' }
          )(
            <Select initialValue=''>
              {WaveTypeOptions}
            </Select>
            )
          }
        </SFormItem>
      );
    if (toggle) {
      cols.push(
        <SFormItem key="type" label={waveBillLocale.type}>
          {getFieldDecorator('type', {
              initialValue: filterValue.type ? filterValue.type : ' '
          })(
              <Select
                showSearch
                style={{ width: '100%' }}
              >
                {typeNamesItems}
              </Select>
          )}
        </SFormItem>
      );
    }
    return cols;
  }
}