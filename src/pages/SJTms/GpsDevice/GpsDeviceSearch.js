/*
 * @Author: guankongjin
 * @Date: 2023-09-26 14:30:27
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-10-10 11:58:46
 * @Description: G7设备管理
 * @FilePath: \iwms-web\src\pages\SJTms\GpsDevice\GpsDeviceSearch.js
 */
import React from 'react';
import { Button, message, Modal, Radio, Form, DatePicker } from 'antd';
import { connect } from 'dva';
import { havePermission } from '@/utils/authority';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import { formatMessage } from 'umi/locale';
import { shift, split, saveServiceDate } from '@/services/sjitms/GpsDevice';
import moment from 'moment';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class GpsDeviceSearch extends QuickFormSearchPage {
  state = {
    ...this.state,
    opType: "StopSerivce",
    shiftMofal: false,
    serviceMofal: false,
    record: {}
  };
  drawToolsButton = () => {
    const { opType, shiftMofal, serviceMofal, record } = this.state;
    const { getFieldDecorator } = this.props.form;
    return <>
      <Button
        hidden={!havePermission(this.state.authority + '.stopService')}
        onClick={() => this.onStopService()}
      >
        流量管理
      </Button>
      <Modal
        title="流量管理"
        visible={serviceMofal}
        onOk={() => {
          this.props.form.validateFields(async (err, fieldsValue) => {
            if (record.GPSNOS == undefined || fieldsValue?.serviceDate == undefined) {
              return;
            }
            let serviceDate = fieldsValue.serviceDate;
            serviceDate = moment(serviceDate).format('YYYY-MM-DD');
            const response = await saveServiceDate(record.GPSNOS, opType, serviceDate);
            if (response.success) {
              this.setState({ serviceMofal: false });
              this.onSearch();
            }
          });
        }}
        onCancel={() => {
          this.setState({ serviceMofal: false });
        }}
      >
        <Form>
          <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 15 }} label="设备号">
            {record?.GPSNOS}
          </Form.Item>
          <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 6 }} label="服务开始日期">
            {record?.BEGINDATE}
          </Form.Item>
          <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 6 }} label="服务到期日期">
            {record?.EXPIREDATE}
          </Form.Item>
          <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 15 }} label="类型">
            <Radio.Group onChange={(e) => this.setState({ opType: e.target.value })} value={opType}>
              <Radio value="StopSerivce">暂停服务</Radio>
              <Radio value="StartSerivce">启用服务</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 10 }} label="启用/暂停日期">
            {getFieldDecorator('serviceDate', {
              rules: [
                { required: true, message: formatMessage({ id: 'company.authorize.form.item.validDate.validate.message.notNull' }) },
              ]
            })(<DatePicker style={{ width: '100%' }} />)}
          </Form.Item>
        </Form>
      </Modal>
      <Button
        hidden={!havePermission(this.state.authority + '.split')}
        type="danger"
        onClick={() => this.onSplit()}
      >
        拆除
      </Button>
      <Button
        hidden={!havePermission(this.state.authority + '.shift')}
        onClick={() => this.onShift()}
        type="primary"
      >
        移装
      </Button>
      <Modal
        title="移装"
        visible={shiftMofal}
        onOk={() => {
          this.props.form.validateFields(async (err, fieldsValue) => {
            if (record.GPSNOS == undefined || fieldsValue?.vehicle == undefined) {
              return;
            }
            const vehicle = fieldsValue.vehicle;
            const truckId = vehicle.match(new RegExp(/(?<=\[)(.+?)(?=\])/g))[0];
            const truckNo = vehicle.substr(vehicle.indexOf("]") + 1);
            const response = await shift(record.GPSNOS, truckId, truckNo);
            if (response.success) {
              this.setState({ shiftMofal: false });
              this.onSearch();
            }
          });
        }}
        onCancel={() => {
          this.setState({ shiftMofal: false });
        }}
      >
        <Form>
          <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 15 }} label="设备号">
            {record?.GPSNOS}
          </Form.Item>
          <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 15 }} label="当前车辆">
            {`[${record?.TRUCKID}]${record?.TRUCKNO}`}
          </Form.Item>
          <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 15 }} label="移装车辆">
            {getFieldDecorator('vehicle', { rules: [{ required: true, message: '请选择车辆' }] })(
              <SimpleAutoComplete
                style={{ width: 150 }}
                placeholder="请选择移装车辆"
                textField="[%CODE%]%PLATENUMBER%"
                valueField="[%CODE%]%PLATENUMBER%"
                queryParams={{ tableName: "v_sj_itms_vehicle" }}
                searchField="CODE,PLATENUMBER"
                autoComplete={true}
                noRecord
                allowClear={true}
              />)}
          </Form.Item>
        </Form>
      </Modal>
    </>
  }

  //流量管理
  onStopService = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length != 1) {
      message.warn('请选中一条数据！');
      return;
    }
    this.setState({ serviceMofal: true, record: selectedRows[0] });
  }

  //拆除
  onSplit = () => {

  }

  //移装
  onShift = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length != 1) {
      message.warn('请选中一条数据！');
      return;
    }
    this.setState({ shiftMofal: true, record: selectedRows[0] });
  }
}
