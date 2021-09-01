import React from 'react';
import { Form, Input, Row, Col, Button, Icon, Select, DatePicker } from 'antd';
import SearchSimpleFormButtonSpan from '@/components/MyComponent/SearchSimpleFormButtonSpan';
import { formatMessage } from 'umi/locale';
import { noticeLocale } from './NoticeLocale';
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const { Search } = Input;

const NoticeSearchForm = Form.create()(props => {
  const { form, handleSearch, typeNames } = props;
  const { getFieldDecorator } = form;
  let typeNamesItems = [];
  typeNamesItems.push(<Select.Option key="all" value={null}>{noticeLocale.title}{noticeLocale.type}</Select.Option>);

  if (typeNames) {
    typeNames.map((result) => typeNamesItems.push(<Select.Option key={`${result}`}>{`${result}`}</Select.Option>));
  }

  const onSearch = (value, name) => {
    handleSearch(`${name}`, value);
  };

  return (
    <Form>
      <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
        <Col xs={24} md={6} sm={12}>
          <FormItem>
            {getFieldDecorator('title')(
              <Search
                autoFocus
                placeholder={formatMessage({ id: 'notice.inputTitle' })}
                onSearch={(value) => onSearch(value, 'title')}
              />
            )}
          </FormItem>
        </Col>

        <Col xs={24} md={5} sm={12}>
          <FormItem>
            {getFieldDecorator('type', { initialValue: null })(
              <Select onSelect={(value) => onSearch(value, 'type')}>
                {typeNamesItems}
              </Select>
            )}
          </FormItem>
        </Col>
        <Col xs={24} md={8} sm={12}>
          <FormItem>
            {getFieldDecorator('timeRange', { initialValue: '' })(
              <RangePicker
                placeholder={
                  [formatMessage({ id: 'form.date.placeholder.start' }),
                  formatMessage({ id: 'form.date.placeholder.end' })
                  ]}
                onChange={(value) => onSearch(value, 'timeRange')}
              />
            )}
          </FormItem>
        </Col>
        <Col xs={24} md={5} sm={12}>
          <FormItem>
            {getFieldDecorator('publisher', { initialValue: 'all' })(
              <Select onSelect={(value) => onSearch(value, 'publisher')}>
                <Select.Option key="all">{noticeLocale.formAll}{noticeLocale.title}</Select.Option>
                <Select.Option key="my_publish">{noticeLocale.formPublished}</Select.Option>
                <Select.Option key="my_receive">{noticeLocale.formReceived}</Select.Option>
              </Select>
            )}
          </FormItem>
        </Col>
      </Row>
    </Form>
  );
});

export { NoticeSearchForm };
