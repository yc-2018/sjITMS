import { PureComponent } from "react";
import { connect } from 'dva';
import { Select } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
@connect(({ decincConfig }) => ({
  decincConfig
}))

export default class CloseBinUsageSelect extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'decincConfig/query',
      payload: {
        page: 0,
        pageSize: 30,
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid,
          configType: 'CLOSE'
        }
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
  }
  buildOptions = () => {
    let options = [];
    options.push(<Select.Option key='' value=''>全部</Select.Option>);
    let data = this.props.decincConfig.data.list;
    let zBinusage = ''
    Array.isArray(data) && data.forEach(function (dg) {
      if(dg.binUsage === 'StorageBin')
      { zBinusage = '存储位'} else if(dg.binUsage === 'PickUpStorageBin') {
        zBinusage = '拣货存储位'
      } else if(dg.binUsage === 'PickUpBin') {
        zBinusage = '拣货位'
      } else if(dg.binUsage === 'UnifyReceiveStorageBin') {
        zBinusage = '统配收货暂存位'
      } else if(dg.binUsage === 'UnifyReceiveStorageBin') {
        zBinusage = '拣货暂存位'
      } else if(dg.binUsage === 'RplTemporaryBin') {
        zBinusage = '补货暂存位'
      } else if(dg.binUsage === 'PickTransitBin') {
        zBinusage = '上架中转位'
      } else if(dg.binUsage === 'UnifyCollectTemporaryBin') {
        zBinusage = '统配集货暂存位'
      } else if(dg.binUsage === 'OneStepReceiveStorageBin') {
        zBinusage = '一步越库收货暂存位'
      } else if(dg.binUsage === 'TwoStepReceiveStorageBin') {
        zBinusage = '二步越库收货暂存位'
      } else if(dg.binUsage === 'MoveTemporaryBin') {
        zBinusage = '移库暂存位'
      } else if(dg.binUsage === 'CollectBin') {
        zBinusage = '集货位'
      } else if(dg.binUsage === 'VendorRtnReceiveTempBin') {
        zBinusage = '退仓收货暂存位'
      } else if(dg.binUsage === 'VendorRtnBin') {
        zBinusage = '供应商退货位'
      } else if(dg.binUsage === 'VendorRtnCollectTempBin') {
        zBinusage = '供应商退货集货暂存位'
      } else if(dg.binUsage === 'VendorRtnCollectBin') {
        zBinusage = '供应商退货集货位'
      } else if(dg.binUsage === 'VendorRtnPickUpTempBin') {
        zBinusage = '供应商退货拣货暂存位'
      } else if(dg.binUsage === 'CrossCollectTempBin') {
        zBinusage = '越库集货暂存位'
      } else if(dg.binUsage === 'TwoCrossAllocateTransferBin') {
        zBinusage = '二步越库分拨中转位'
      } else if(dg.binUsage === 'StoreAllocateBin') {
        zBinusage = '门店分拨位'
      } else if(dg.binUsage === 'InStore') {
        zBinusage = '在门店'
      } else if(dg.binUsage === 'UnifyAdjBin') {
        zBinusage = '统配更正位'
      } else if(dg.binUsage === 'TranSitAndStraightAdjBin') {
        zBinusage = '越库更正位'
      }
      options.push(
        <Select.Option key={dg.binUsage} value={dg.binUsage}> {zBinusage} </Select.Option>
      );
    });
    return options;
  }

  render() {
    return (
      <Select {...this.props}>
        {this.buildOptions()}
      </Select>
    );
  }
}
