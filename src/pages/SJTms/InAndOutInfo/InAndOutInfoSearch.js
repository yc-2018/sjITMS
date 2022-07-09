import React from 'react';
import { Button, Input, Popconfirm, message } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import StoreModal from './StoreModal';
import OtherFeeModal from './OtherFeeModal';
import { commonLocale } from '@/utils/CommonLocale';

@connect(({ quick, sjdispatchReturn, loading }) => ({
  quick,
  sjdispatchReturn,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class InAndOutInfoSearch extends QuickFormSearchPage {
  state = {
    ...this.state,
    storeItemConfirmModalVisible: false,
    storeModalVisible: false,
    scheduleBillTmsUuid: '',
    scheduleBillNumber: '',
    isShowStandardTable: false,
    feeTypeModalVisible: false,
    billData: {
      list: [],
    }, // 票据核对
    otherFeeModalVisible: false,
    filelist: [],
    previewImage: '',
  };

  drawActionButton = () => {
    const {
      storeModalVisible,
      scheduleBillTmsUuid,
      scheduleBillNumber,
      otherFeeModalVisible,
    } = this.state;
    return (
      <>
        <StoreModal
          visible={storeModalVisible}
          shipBillTmsUuid={scheduleBillTmsUuid}
          handleModal={() => this.setState({ storeModalVisible: false })}
        />
        <OtherFeeModal
          visible={otherFeeModalVisible}
          shipBillTmsUuid={scheduleBillTmsUuid}
          scheduleBillNumber={scheduleBillNumber}
          handleModal={() => this.setState({ otherFeeModalVisible: false })}
        />
        {/* <Button onClick={()=>this.setState({feeTypeModalVisible:true})}>费用类型管理</Button>
        <Modal  width ={'auto'} height ={'auto'}
          footer={null}
          style={{overflow:'auto'}}
          visible={this.state.feeTypeModalVisible}
          onCancel={()=>this.setState({feeTypeModalVisible:false})}
          title={"费用类型管理"}>
          <FeeTypeForm quickuuid='sj_feeType' location={{pathname:window.location.pathname}}></FeeTypeForm>
        </Modal>  */}
      </>
    );
  };

  drawcell = e => {
    const column = e.column;
    const record = e.record;
    const fieldName = column.fieldName;
    if (fieldName == 'UUID') {
      const component = <a onClick={() => this.showStore(record.UUID)}>查看编辑</a>;
      e.fixed = true;
      e.component = component;
    }
    if (fieldName == 'FVERSION') {
      const component = (
        <a onClick={() => this.showOrderFee(record.BILLNUMBER, record.UUID)}>查看编辑</a>
      );
      e.fixed = true;
      e.component = component;
    }
    //出车里程
    if (fieldName == 'DISPATCHMILEAGE') {
      const component = (
        <Input
          className={e.record.ROW_ID + 'DISPATCHMILEAGE'}
          step={0.01}
          style={{ width: 100 }}
          onFocus={() => {
            document.getElementsByClassName(e.record.ROW_ID + 'DISPATCHMILEAGE')[0].select();
          }}
          onBlur={this.onBlurs.bind(this, record, column.fieldName)}
          min={0}
          max={10000}
          disabled={e.record.INOUTCHECKED == 1}
          defaultValue={
            record.INOUTCHECKED == 0 ? record.LAST_RETURN_MILEAGE : record.DISPATCHMILEAGE
          }
        />
      );
      e.component = component;
    }
    //回车里程
    if (fieldName == 'RETURNMILEAGE') {
      const component = (
        <Input
          className={e.record.ROW_ID + 'RETURNMILEAGE'}
          onFocus={() => {
            document.getElementsByClassName(e.record.ROW_ID + 'RETURNMILEAGE')[0].select();
          }}
          step={0.0}
          min={0}
          max={10000}
          disabled={e.record.INOUTCHECKED == 1}
          defaultValue={record.RETURNMILEAGE}
          style={{ width: 100 }}
          onBlur={this.onBlurs.bind(this, record, column.fieldName)}
        />
      );
      e.component = component;
    }
  };

  showOrderFee = (number, uuid) => {
    if (uuid) {
      this.setState({
        scheduleBillTmsUuid: uuid,
        scheduleBillNumber: number,
        otherFeeModalVisible: !this.state.otherFeeModalVisible,
      });
    }
  };

  showStore = uuid => {
    if (uuid) {
      this.setState({
        scheduleBillTmsUuid: uuid,
        storeModalVisible: !this.state.storeModalVisible,
      });
    }
  };

  onBlurs = (record, fieldName, e) => {
    const { data } = this.state;
    let newData = { ...data };
    let row = newData.list.find(x => x.uuid == record.uuid);
    if (fieldName == 'RETURNMILEAGE') {
      row.RETURNMILEAGE = Number(e.target.value);
      row.TOTALMILEAGE =
        Number(e.target.value) -
        (row.DISPATCHMILEAGE == 0 ? record.LAST_RETURN_MILEAGE : record.DISPATCHMILEAGE);
    } else {
      row.DISPATCHMILEAGE = Number(e.target.value);
    }
    const index = newData.list.findIndex(x => x.uuid == row.uuid);
    newData.list[index] = row;
    this.setState({ data: newData });
  };

  convertCodeName = () => {};
  //该方法用于写最上层的按钮 多个按钮用<span>包裹
  drawTopButton = () => {};

  onPreview = async file => {
    let src = file.url;
    if (!src) {
      src = await new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  drawToolbarPanel = () => {
    return (
      <span>
        <Popconfirm title="确定审核?" onConfirm={this.audits} okText="确定" cancelText="取消">
          <Button type="primary">保存审核</Button>
        </Popconfirm>
        <Popconfirm title="确定保存?" onConfirm={this.save} okText="确定" cancelText="取消">
          <Button>保存</Button>
        </Popconfirm>
      </span>
    );
  };

  save = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length < 1) {
      message.warn('请至少选择一条记录');
      return;
    }
    this.props.dispatch({
      type: 'dispatchReturnStore/onConfirm',
      payload: selectedRows,
      callback: response => {
        this.setState({ selectedRows: [] });
        if (response && response.success) {
          this.refreshTable();
          message.success(commonLocale.saveSuccessLocale);
        }
      },
    });
  };

  audits = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length < 1) {
      message.warn('请至少选择一条记录');
      return;
    }
    this.props.dispatch({
      type: 'dispatchReturnStore/onAudit',
      payload: selectedRows,
      callback: response => {
        this.setState({ selectedRows: [] });
        if (response && response.success) {
          this.refreshTable();
          message.success(commonLocale.saveSuccessLocale);
        }
      },
    });
  };
}
