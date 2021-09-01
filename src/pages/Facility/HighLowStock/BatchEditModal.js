import React, { PureComponent } from 'react';
import { Form, Input, InputNumber, Modal, Select, message } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import BinTypeSelect from '@/pages/Component/Select/BinTypeSelect';
import { binScopePattern } from '@/utils/PatternContants';
import { highLowStockLocale } from './HighLowStockLocale';
import { commonLocale, notNullLocale, placeholderLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
const FormItem = Form.Item;
@Form.create()
class BatchEditModal extends PureComponent {
  //最高库存和最低库存下拉框的值可选：固定值、装盘规格，默认固定值
  state = {
    fieldsValue: {
      highSelect: 'MIX',
      lowSelect: 'MIX'
    },
    highPlaceholder : '请输入固定的最高库存件数，如10。',
    lowPlaceholder : '请输入固定的最低库存件数，如10。',
    highMonad : '件',
    lowMonad : '件',
  }

  okHandle = () => {
    const { form, selectedRows, dispatch } = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      if (fieldsValue.binType === undefined && fieldsValue.binCodeRange === undefined) {
        message.error(highLowStockLocale.binTypeAndRange);
        return;
      }
      let binTypeUuid = null;
      let binScope = null;
      if (fieldsValue.binType) {
        binTypeUuid = JSON.parse(fieldsValue.binType).uuid;
      }
      if (fieldsValue.binCodeRange) {
        if (binScopePattern.pattern.test(fieldsValue.binCodeRange) === false) {
          message.error(binScopePattern.message);
          return;
        } else {
          binScope = fieldsValue.binCodeRange;
        }
      }

      if (this.state.fieldsValue.lowStockQtyStr === undefined && this.state.fieldsValue.highStockQtyStr === undefined) {
        message.error(highLowStockLocale.lowAndHighStock);
        return;
      }
      if(this.state.fieldsValue.lowStockQtyStr && this.state.fieldsValue.highStockQtyStr && this.state.fieldsValue.lowStockQtyStr > this.state.fieldsValue.highStockQtyStr){
        message.error('最低库存应小于最高库存');
        return ;
      }
      let uuid = [];
      selectedRows.forEach(function (row) {
        uuid.push(row.uuid);
      });
      
      let params = {
        queryParam: {
          uuids: uuid,
          binScope: binScope,
          binTypeUuid: binTypeUuid,
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        },
        editParam: {
          highStockType: this.state.fieldsValue.highSelect,
          highStockQtyStr: this.state.fieldsValue.highStockQtyStr,
          lowStockType: this.state.fieldsValue.lowSelect,
          lowStockQtyStr: this.state.fieldsValue.lowStockQtyStr,
        }
      }
      const {handleBatchProcessConfirmModalVisible } = this.props;
      this.props.dispatch({
        type: 'highLowStock/queryStock',
        payload: params,
        callback:response=>{
          if(response && response.success && response.data && response.data.length>0){
            handleBatchProcessConfirmModalVisible(true)
          } else {
            handleBatchProcessConfirmModalVisible(false)
          }
        }
      });
      this.resetParams();
      const {handleBatchEditModalVisible } = this.props;
      handleBatchEditModalVisible(false);
    });
  };
  
  resetParams = () =>{  
    const { fieldsValue} = this.state;
    fieldsValue.highSelect = 'MIX',
    fieldsValue.lowSelect = 'MIX',
    fieldsValue.highStockQtyStr = undefined,
    fieldsValue.lowStockQtyStr = undefined,
    this.setState({
      highPlaceholder : '请输入固定的最高库存件数，如10。',
      highMonad : '件',
      lowPlaceholder : '请输入固定的最低库存件数，如10。',
      lowMonad : '件',
      fieldsValue : fieldsValue,
    });
    
  }
  
  handleCancel = () => {
    const { form, handleBatchEditModalVisible } = this.props;
    form.resetFields();
    handleBatchEditModalVisible(false);
    this.resetParams();
  };

  handleChange = (value, type) => {
    const { fieldsValue } = this.state;
    fieldsValue[`${type}`] = value;
    this.setState({
      fieldsValue: fieldsValue
    })
    if(fieldsValue.highSelect == 'MIX'){
      this.setState({
        highPlaceholder : '请输入固定的最高库存件数，如10。',
        highMonad : '件',
      })
    }
    if(fieldsValue.highSelect == 'PLATEADVIE'){
      this.setState({
        highPlaceholder : '请输入装盘规格对应的百分比，如80。',
        highMonad : '%',
      })
    }

    if(fieldsValue.lowSelect == 'MIX'){
      this.setState({
        lowPlaceholder : '请输入固定的最低库存件数，如10。',
        lowMonad : '件',
      })
    }
    if(fieldsValue.lowSelect == 'PLATEADVIE'){
      this.setState({
        lowPlaceholder : '请输入装盘规格对应的百分比，如80。',
        lowMonad : '%',
      })
    }
    
  }

  render() {
    const {
      form,
      batchEditModalVisible,
      selectedRows
    } = this.props;
    const { confirmLeaveVisible } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };

    return (
      <Modal
        title={formatMessage({ id: 'common.button.batchEdit' })}
        visible={batchEditModalVisible}
        onOk={this.okHandle}
        onCancel={() => this.handleCancel()}
        destroyOnClose={true}
        width={700}
      >
        <div>
          <Form>
            {selectedRows && selectedRows.length > 0 ?
              <p style={{ 'textAlign': 'center' }}>已选中{selectedRows.length}个商品</p>
              : null
            }
            <FormItem {...formItemLayout} label={highLowStockLocale.binType}>
              {form.getFieldDecorator('binType')(
                <BinTypeSelect width={'95%'}/>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label={highLowStockLocale.binCodeRange}>
              {form.getFieldDecorator('binCodeRange')(
                <Input style={{ 'width': '95%' }}
                placeholder={'格式：2001-3090,4001-5090 格式'} />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label={highLowStockLocale.lowStockQty}>
              {form.getFieldDecorator('lowStockQtyStr')(
                <div>
                  <Select style={{ 'width': '30%' }} defaultValue='MIX' onChange={(value) => this.handleChange(value, 'lowSelect')}>
                    <Select.Option value="MIX">{highLowStockLocale.selectFixValue}</Select.Option>
                    <Select.Option value="PLATEADVIE">{highLowStockLocale.selectPlateValue}</Select.Option>
                  </Select>
                  <InputNumber
                    max={10000}
                    min={0}
                    style={{ 'width': '65%' }}
                    precision={0}
                    decimalSeparator={null}
                    placeholder={this.state.lowPlaceholder} 
                    onChange={(value) => this.handleChange(value, 'lowStockQtyStr')} />{this.state.lowMonad} 
                </div>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label={highLowStockLocale.highStockQty}>
              {form.getFieldDecorator('highStockQtyStr')(
                <div>
                  <Select style={{ 'width': '30%' }} defaultValue='MIX' onChange={(value) => this.handleChange(value, 'highSelect')}>
                    <Select.Option value="MIX">{highLowStockLocale.selectFixValue}</Select.Option>
                    <Select.Option value="PLATEADVIE">{highLowStockLocale.selectPlateValue}</Select.Option>
                  </Select>
                  <InputNumber
                    max={10000}
                    min={0}
                    style={{ 'width': '65%' }}
                    precision={0}
                    decimalSeparator={null}
                    placeholder={this.state.highPlaceholder} 
                    onChange={(value) => this.handleChange(value, 'highStockQtyStr')} />{this.state.highMonad} 
                </div>
              )}
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
};
export default BatchEditModal;
