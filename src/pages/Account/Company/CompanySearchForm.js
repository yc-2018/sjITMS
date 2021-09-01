import React from 'react';
import {  
  Icon, 
  Form, 
  Input, 
  Select, 
  Row, 
  Col, 
  Button,
  DatePicker,
} from 'antd';
import { formatMessage } from 'umi/locale';
import SearchSimpleFormButtonSpan from '@/components/MyComponent/SearchSimpleFormButtonSpan';
import styles from './company.less';
import { STATUS, STATE } from '@/utils/constants';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { Option } = Select;

const CompanySimpleSearchForm = Form.create()(props => {
  const { form, handleFormReset, handleSearch } = props;
  const { getFieldDecorator } = form;

  const onSearch = e => {
    e.preventDefault();

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const data = {
        ...fieldsValue
      };
      
      handleSearch(data);
    });
  };

  const reset = () => {
    form.resetFields();
    handleFormReset();
  }

  return (
    <Form onSubmit={onSearch}>
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col md={6} sm={24}>
          <FormItem label={formatMessage({ id: 'company.index.search.input.codeName' })}>
            {getFieldDecorator('codeName')(<Input autoFocus placeholder={formatMessage({ id: 'company.index.search.input.codeName.placeholder' })} />)}
          </FormItem>
        </Col>
        <Col md={6} sm={24}>
          <FormItem label={formatMessage({ id: 'company.index.search.input.status' })}>
            {getFieldDecorator('state')(
            <Select placeholder={formatMessage({ id: 'company.index.search.input.status.placeholder' })}>
              <Option value={STATE['ONLINE']}>{STATUS['ONLINE']}</Option>
              <Option value={STATE['OFFLINE']}>{STATUS['OFFLINE']}</Option>
            </Select>
            )}
          </FormItem>
        </Col>
        <Col md={6} sm={24}>
          <FormItem label={formatMessage({ id: 'company.index.search.input.validDate' })}>
            {getFieldDecorator('startEndvalidDate')(
              <RangePicker />
            )}
          </FormItem>
        </Col>
        <Col md={6} sm={24}>
          <div className={styles.simpleSearchBtnWrapper}>
            <SearchSimpleFormButtonSpan>
              <Button type="primary" htmlType="submit">
                {formatMessage({ id: 'company.index.search.button.search' })}
              </Button>
              <Button style={{ marginLeft: 8, background: '#516173', color: '#FFFFFF' }} onClick={reset}>
                {formatMessage({ id: 'company.index.search.button.reset' })}
              </Button>
            </SearchSimpleFormButtonSpan>
          </div>
        </Col>
      </Row>
    </Form>
  );
});

export {CompanySimpleSearchForm};
