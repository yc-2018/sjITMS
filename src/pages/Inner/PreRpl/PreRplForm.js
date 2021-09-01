import React, { PureComponent } from 'react';
import { Form, Input, Modal, Row, Col, Select, Button, InputNumber, message } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import SearchPanel from '@/pages/Component/Page/inner/SearchPanel';
import { rplLocale } from '@/pages/Out/Rpl/RplLocale';
import PickareaSelect from '@/pages/Component/Select/PickareaSelect';
import {
  RplStep, RplMode, RplMethod, RplMethodExtend, getRplModeOptions, getRplStepOptions, getRplTypeOptions,
  getRplMethodOptions, getRplMethodExtendOptions
} from '@/pages/Facility/PickArea/PickAreaContants';
import { binScopePattern } from '@/utils/PatternContants';
const FormItem = Form.Item;
@Form.create()
export default class PreRplForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {

    }
  }
  /**
   * 执行
   */
  onExecute = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) return;
      if (!fieldsValue.binScope && (!fieldsValue.pickArea || fieldsValue.pickArea.length==0)) {
        message.error('拣货分区和货位范围不能同时为空');
        return;
      } else {
        this.props.onExecute(fieldsValue);
      }
    })
  }
  /**
   * 改变补货方式
   */
  changeRplMode = (value) => {
    let option = [];
    if (value == RplMode.RF.name) {
      option = getRplStepOptions([RplStep.ONESTEP.name, RplStep.TWOSTEP.name]);
    } else {
      option = getRplStepOptions([RplStep.ONESTEP.name]);
    }
    this.setState({
      rplStepOptions: [...option]
    })
    this.props.form.setFieldsValue({
      "rplStep": undefined
    })
  }
  /**
   * 改变补货算法
   */
  changeRplMethodExtend = () => {
    this.props.form.setFieldsValue({
      "rplMethodExtend": undefined
    })
  }
  /**重置搜索条件 */
  reset = () => {
    this.props.form.resetFields();
  }
  render() {
    const { form: { getFieldDecorator }, loading, filterValue } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      colon: true
    };
    return <Form {...formItemLayout} onSubmit={this.onExecute}>
      <Row>
        <Col span={12}>
          <FormItem label={rplLocale.pickArea} labelCol={{span:3}} wrapperCol={{span:21}}>
            {getFieldDecorator('pickArea', { initialValue: filterValue.pickArea })(
              <PickareaSelect autoFocus multiple placeholder={placeholderChooseLocale(rplLocale.pickArea)} />)}
          </FormItem>
        </Col>
        <Col span={6}>
          <FormItem label='货位范围'>
            {getFieldDecorator('binScope', {
              rules: [
                {
                  pattern: binScopePattern.pattern,
                  message: binScopePattern.message
                }
              ],
              initialValue: filterValue.binScope
            })(
              <Input placeholder={placeholderLocale('货位范围')} />)}
          </FormItem>
        </Col>
        <Col span={6}>
          <FormItem label={rplLocale.mode}>
            {getFieldDecorator('rplMode', {
              rules: [
                { required: true, message: notNullLocale(rplLocale.mode) }
              ],
              initialValue: filterValue.rplMode
            })(
              <Select
                placeholder={placeholderChooseLocale(rplLocale.mode)}
                onChange={this.changeRplMode}>
                {getRplModeOptions()}
              </Select>
            )}
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span={6}>
          <FormItem label={rplLocale.step}>
            {getFieldDecorator('rplStep', {
              rules: [
                { required: true, message: notNullLocale(rplLocale.step) }
              ],
              initialValue: filterValue.rplStep
            })(
              <Select
                placeholder={placeholderChooseLocale(rplLocale.step)}>
                {this.state.rplStepOptions}
              </Select>
            )}
          </FormItem>
        </Col>
        <Col span={6}>
          <FormItem label='补货算法'>
            {getFieldDecorator('rplMethod', {
              rules: [
                { required: true, message: notNullLocale('补货算法') }
              ],
              initialValue: filterValue.rplMethod
            })(
              <Select
                placeholder={placeholderChooseLocale('补货算法')}
                onChange={this.changeRplMethodExtend}
              >
                {getRplMethodOptions([RplMethod.HIGHANDLOW.name,
                // RplMethod.RPLFULL.name,
                RplMethod.WHOLE.name, RplMethod.HIGHANDLOW_WHOLE.name])}
              </Select>
            )}
          </FormItem>
        </Col>
        <Col span={6}>
          {(this.props.form.getFieldValue('rplMethod') == RplMethod.RPLFULL.name ||
            this.props.form.getFieldValue('rplMethod') == RplMethod.HIGHANDLOW.name) && <FormItem label='算法加强'>
              {getFieldDecorator('rplMethodExtend', { initialValue: filterValue.rplMethodExtend })(
                <Select
                  placeholder={placeholderChooseLocale(rplLocale.type)}>
                  {getRplMethodExtendOptions()}
                </Select>
              )}
            </FormItem>}
        </Col>
        <Col span={6}>
          {this.props.form.getFieldValue('rplMethodExtend') == RplMethodExtend.T_REPAIR.name && <FormItem label='尾板剩余'>
            {getFieldDecorator('t', { initialValue: filterValue.t })(
              <InputNumber style={{ width: '100%' }} min={0} placeholder={placeholderLocale('尾板剩余')} />
            )}
          </FormItem>}
        </Col>
        {this.props.buttonVisible && <Col style={{ float: 'right' }}>
          <Button type="primary" htmlType="submit">
            执行
            </Button>
          <Button style={{ marginLeft: 12, background: '#516173', color: '#FFFFFF' }} onClick={this.reset}>
            重置
            </Button>
        </Col>}
      </Row>
      {/* <Row>
       
        {this.props.buttonVisible && <Col style={{ float: 'right' }}>
          <Button type="primary" htmlType="submit">
            执行
            </Button>
          <Button style={{ marginLeft: 12, background: '#516173', color: '#FFFFFF' }} onClick={this.reset}>
            重置
            </Button>
        </Col>}
      </Row> */}
    </Form>
  }
}