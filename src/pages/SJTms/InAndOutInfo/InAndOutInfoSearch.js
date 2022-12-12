import React from 'react';
import { Button, Input, Popconfirm, message, Modal } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import StoreModal from './StoreModal';
import OtherFeeModal from './OtherFeeModal';
import { commonLocale } from '@/utils/CommonLocale';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import { submitFee } from '@/services/sjtms/OtherFeeService';

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
    showAuditPop: false,
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
          scheduleBillNumber={scheduleBillNumber}
          handleModal={() => this.setState({ storeModalVisible: false })}
        />
        <OtherFeeModal
          visible={otherFeeModalVisible}
          shipBillTmsUuid={scheduleBillTmsUuid}
          scheduleBillNumber={scheduleBillNumber}
          handleModal={() => this.setState({ otherFeeModalVisible: false })}
        />
      </>
    );
  };

  drawcell = e => {
    const column = e.column;
    const record = e.record;
    const fieldName = column.fieldName;
    if (fieldName == 'UUID') {
      const component = (
        <a onClick={() => this.showStore(record.BILLNUMBER, record.UUID)}>查看编辑</a>
      );
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
          onChange={event => this.onChange(record, column.fieldName, event.target.value)}
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
          onChange={event => this.onChange(record, column.fieldName, Number(event.target.value))}
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

  showStore = (number, uuid) => {
    if (uuid) {
      this.setState({
        scheduleBillTmsUuid: uuid,
        scheduleBillNumber: number,
        storeModalVisible: !this.state.storeModalVisible,
      });
    }
  };

  onChange = (record, fieldName, value) => {
    const { data } = this.state;
    let newData = { ...data };
    let row = newData.list.find(x => x.uuid == record.uuid);
    row.DISPATCHMILEAGE == 0 ? (row.DISPATCHMILEAGE = record.LAST_RETURN_MILEAGE) : {};
    if (fieldName == 'RETURNMILEAGE') {
      row.RETURNMILEAGE = value;
      row.TOTALMILEAGE =
        value - (row.DISPATCHMILEAGE == 0 ? record.LAST_RETURN_MILEAGE : record.DISPATCHMILEAGE);
    } else {
      row.DISPATCHMILEAGE = value;
    }
    const index = newData.list.findIndex(x => x.uuid == row.uuid);
    newData.list[index] = row;
    this.setState({ data: newData });
  };

  convertCodeName = () => { };
  //该方法用于写最上层的按钮 多个按钮用<span>包裹
  drawTopButton = () => { };

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
    const { showAuditPop, selectedRows } = this.state;
    return (
      <span>
        <Popconfirm
          title="确定审核?"
          onConfirm={() => this.checkTotalMileage(this.audits)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="primary">保存审核</Button>
        </Popconfirm>
        <Popconfirm
          title="确定保存?"
          onConfirm={() => this.checkTotalMileage(this.save)}
          okText="确定"
          cancelText="取消"
        >
          <Button>保存</Button>
        </Popconfirm>
        <Popconfirm
          title="确定取消?"
          onConfirm={() => this.cancelRecordMiles()}
          okText="确定"
          cancelText="取消"
        >
          <Button>取消公里数</Button>
        </Popconfirm>
        <Popconfirm
          title="确定提交至审批?"
          visible={showAuditPop}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showAuditPop: visible });
          }}
          onCancel={() => {
            this.setState({ showAuditPop: false });
          }}
          onConfirm={() => {
            this.setState({ showAuditPop: false });
            this.onTollFeeAudits(selectedRows[0]).then(response => {
              if (response.success) {
                message.success('审核成功！');
                this.onSearch();
              }
            });
          }}
        >
          <Button onClick={() => this.onBatchAudits()}>费用提交至审批</Button>
        </Popconfirm>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
      </span>
    );
  };
  //保存
  save = () => {
    const { selectedRows } = this.state;
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
  //审核
  audits = () => {
    const { selectedRows } = this.state;
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

  //路桥费提交至审批
  onBatchAudits = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length < 1) {
      message.warn('请至少选择一条记录');
      return;
    }
    selectedRows.length == 1
      ? this.setState({ showAuditPop: true })
      : this.batchProcessConfirmRef.show('审核', selectedRows, this.onTollFeeAudits, this.onSearch);
  };
  cancelRecordMiles = async () => {
    const { selectedRows } = this.state;
    if (selectedRows.length != 1) {
      message.warn('请选择一条记录');
      return;
    }
    this.props.dispatch(
      {
        type: 'dispatchReturnStore/cancelRecordMiles',
        payload: selectedRows.map(e => e.UUID)[0],
        callback: response => {
          this.setState({ selectedRows: [] });
          if (response && response.success) {
            this.refreshTable();
            message.success(commonLocale.saveSuccessLocale);
          }
        },
      }
    )
  }
  onTollFeeAudits = async rows => {
    return await submitFee(rows.BILLNUMBER);
  };

  //校验本次里程数
  checkTotalMileage = saveOrAudits => {
    const { selectedRows } = this.state;
    if (selectedRows.length < 1) {
      message.warn('请至少选择一条记录');
      return;
    }
    const totalMileageData = selectedRows.filter(e => {
      if (e.TOTALMILEAGE >= 1000) {
        return e;
      }
    });
    if (totalMileageData.length > 0) {
      let str = '';
      totalMileageData.forEach(e => {
        str += e.BILLNUMBER + ',';
      });
      str = '单号:' + str + '本次里程数超过1000,确定继续吗？';
      Modal.confirm({
        title: '提示',
        content: str,
        okText: '确定',
        onOk: saveOrAudits,
      });
    } else {
      saveOrAudits();
    }
  };
}
