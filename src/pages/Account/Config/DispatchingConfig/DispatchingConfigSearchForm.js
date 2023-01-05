/*
 * @Author: guankongjin
 * @Date: 2023-01-04 17:09:56
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-01-05 09:09:03
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\Account\Config\DispatchingConfig\DispatchingConfigSearchForm.js
 */
import SearchForm from '@/pages/Component/Form/SearchForm';
import { Form, Select, Col } from 'antd';
import { DispatchingConfigLocale } from './DispatchingConfigLocale';
const FormItem = Form.Item;

@Form.create()
export default class DispatchingConfigSearchForm extends SearchForm {
  onReset = () => {
    this.props.refresh();
  };

  onSearch = data => {
    const dispatchCenter = JSON.parse(data.dispatchCenter);
    data.dispatchCenterUuid = dispatchCenter.uuid;
    data.dispatchCenterName = dispatchCenter.name;
    data.dispatchCenterCode = dispatchCenter.code;
    this.props.refresh(data);
  };

  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue, dispatchData } = this.props;

    return [
      <Col key="dcCodeNameLike">
        <FormItem label={DispatchingConfigLocale.name}>
          {getFieldDecorator('dispatchCenter', {
            initialValue: filterValue.name,
          })(
            <Select>
              {dispatchData?.map(dispatch => {
                return (
                  <Select.Option value={JSON.stringify(dispatch)} key={dispatch.uuid}>
                    {'[' + dispatch.code + ']' + dispatch.name}
                  </Select.Option>
                );
              })}
            </Select>
          )}
        </FormItem>
      </Col>,
    ];
  };
}
