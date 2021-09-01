import React, { PureComponent } from 'react';
import { Button, Switch, Table,DatePicker,Form,Row,Col,Input,Select } from 'antd';
import { connect } from 'dva';
import moment from "moment";
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import StandardTable from '@/components/StandardTable';
import Empty from '@/pages/Component/Form/Empty';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { DailyType,LogLevel } from './BillDailyKnotsContants';
import styles from './DailyLogTab.less';
const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;

const dailyTypeOptions = [];
dailyTypeOptions.push(<Option key='dailyTypeAll' value=''>全部</Option>);
Object.keys(DailyType).forEach(function (key) {
  dailyTypeOptions.push(<Option key={DailyType[key].name} value={DailyType[key].name}>{DailyType[key].caption}</Option>);
});

/**
 * 日结日志记录展示组件
 * key:适用于当entityUuid不变时,如果想重新渲染此组件，设置key值
 */

@connect(({ dailyKnotsConfig, loading }) => ({
  dailyKnotsConfig,
  loading: loading.models.dailyKnotsConfig,
}))

@Form.create()
export default class DailyLogTab extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      fieldsValue:{},
      data:{},
      pageFilter: {
        page: 0,
        pageSize: 10,
        sortFields: {
            logTime: true
        },
        searchKeyValues: {
            companyUuid:loginCompany().uuid,
            dcUuid:loginOrg().uuid,
            logTime:moment(new Date(new Date(new Date().toLocaleDateString()).getTime())).format('YYYY-MM-DD HH:mm:ss')
        },
      },
    };
  }

  componentDidMount() {
    this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.key&&nextProps.entityUuid&&this.props.key !== nextProps.key){
      const { pageFilter } = this.state;
      this.refreshTable();
    }
    if(nextProps.dailyKnotsConfig.dailyLog!=this.props.dailyKnotsConfig.dailyLog){
      this.setState({
        data:nextProps.dailyKnotsConfig.dailyLog
      })
    }
  }

  /**
   * 刷新
   */
  refreshTable = () => {
    const { pageFilter } = this.state;
    const { dispatch } = this.props;

    dispatch({
      type: 'dailyKnotsConfig/queryLog',
      payload: pageFilter,
    });
  }

  /**
   * 查询
   */
  handleSearch=(e) =>{
    e.preventDefault();
    const { form,dispatch,que } = this.props;
    const { pageFilter } = this.state;
    form.validateFields((err, fieldsValue) => {
      if(fieldsValue){
        if(fieldsValue.logTime){
          fieldsValue.beginLogTime = moment(fieldsValue.logTime[0]).format('YYYY-MM-DD HH:mm:ss');
          fieldsValue.endLogTime = moment(fieldsValue.logTime[1]).format('YYYY-MM-DD HH:mm:ss');
          // fieldsValue.logTime = moment(fieldsValue.logTime).format('YYYY-MM-DD HH:mm:ss')
        }
        pageFilter.searchKeyValues = {
          ...pageFilter.searchKeyValues,
          ...fieldsValue,
        }
      }
      this.refreshTable();
    });
  }

  /**
   * 表格内容改变时，调用此方法
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    let { pageFilter } = this.state;

    pageFilter.page = pagination.current - 1;
    pageFilter.pageSize = pagination.pageSize;

    if (sorter.field) {
      // 如果有排序字段，则需要将原来的清空
      pageFilter.sortFields = {};
      var sortField = `${sorter.field}`;
      var sortType = sorter.order === 'descend' ? true : false;
      pageFilter.sortFields[sortField] = sortType;
    }

    this.refreshTable();
  };

  /**
   * 重置
   */
  reset =()=>{
    const { pageFilter } = this.state;
    const { form } = this.props;
    pageFilter.searchKeyValues = {
      companyUuid:loginCompany().uuid,
      dcUuid:loginOrg().uuid,
    };
    form.resetFields();
    this.refreshTable();
  }

  columns = [
      {
        title: '实体标示',
        dataIndex: 'entityId',
      },
      {
        title: '日结类型',
        dataIndex: 'dailyType',
        render:val=>DailyType[val].caption
      },
      {
        title: '日志时间',
        dataIndex: 'logTime',
        sorter:true
      },
      {
        title: '日志级别',
        dataIndex: 'logLevel',
        render:val=>LogLevel[val].caption
      },
      {
        title: '详情',
        dataIndex: 'message',
        render:val=>val?val:<Empty/>
      }
    ];

    render() {
        const {
            loading,
        } = this.props;
        const { fieldsValue,data } = this.state;
        const { getFieldDecorator } = this.props.form;
        const paginationProps = {
            showSizeChanger: true,
            showQuickJumper: true,
            ...data.pagination,
        };

        const tableLoading = {
            spinning: loading,
            indicator: LoadingIcon('default')
        }

      let logTimeInitial = fieldsValue.logTime && fieldsValue.logTime.length == 2 ?
        [moment(fieldsValue.logTime[0]), moment(fieldsValue.logTime[1])] : null;

        return (
          <div>
            <Form className={styles.formItems} onSubmit={this.handleSearch}>
              <Row gutter={16}>
                <Col md={6} sm={24}>
                  <Form.Item key="entityId" label='实体标示'>
                    {
                      getFieldDecorator('entityId', {
                          initialValue: fieldsValue.entityId
                        })(
                        <Input autoFocus placeholder={placeholderLocale('实体标示')}/>
                    )}
                  </Form.Item>
                </Col>
                <Col md={6} sm={24}>
                  <Form.Item key="dailyType" label='日结类型'>
                    {
                      getFieldDecorator('dailyType', {
                          initialValue: ''
                        })(
                        <Select style={{width:'100%'}}  placeholder={placeholderLocale('日结类型')}>
                          {dailyTypeOptions}
                        </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col md={6} sm={24}>
                  <Form.Item key="logTime" label='日志时间'>
                    {
                      getFieldDecorator('logTime', {
                        initialValue: logTimeInitial
                        })(
                          <RangePicker style={{width:'140%'}}  format="YYYY-MM-DD HH:mm:ss" showTime allowClear={false}/>
                    )}
                  </Form.Item>
                </Col>
                <Col md={6} sm={24}>
                  <div style={{float:"right"}}>
                    <Button type="primary" htmlType="submit">
                      查询
                    </Button>
                    <Button style={{ marginLeft: 12, background: '#516173', color: '#FFFFFF' }} onClick={this.reset}>
                      重置
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
      
            <div className={styles.standardTable}>
              <Table
                columns={this.columns}
                dataSource={data.list}
                pagination={paginationProps}
                onChange={this.handleStandardTableChange}
                rowKey={record => record.uuid}
                rowClassName={(record, index) => index % 2 === 0 ? styles.lightRow : ''}
                loading={tableLoading}
              />
             </div>
          </div>
        );
    }
}
