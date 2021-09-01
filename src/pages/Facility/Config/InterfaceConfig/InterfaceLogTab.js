import React, { PureComponent } from 'react';
import { Button, Switch, Table,DatePicker,Form,Row,Col,Input,Select } from 'antd';
import moment from "moment";
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import StandardTable from '@/components/StandardTable';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import styles from './InterfaceLogTab.less';
import {InterfaceType,Level,getTypeOptions} from './InterfaceConfigContants';
const FormItem = Form.Item;

const Option = Select.Option;

/**
 * 接口日志记录展示组件
 * key:适用于当entityUuid不变时,如果想重新渲染此组件，设置key值
 */

@connect(({ interfaceConfig, loading }) => ({
  interfaceConfig,
  loading: loading.models.interfaceConfig,
}))

@Form.create()
export default class InterfaceLog extends PureComponent {
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
            orgId:loginOrg().uuid,
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

    if(nextProps.interfaceConfig.interfaceLog!=this.props.interfaceConfig.interfaceLog){
      this.setState({
        data:nextProps.interfaceConfig.interfaceLog
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
      type: 'interfaceConfig/queryLog',
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
          fieldsValue.logTime = moment(fieldsValue.logTime).format('YYYY-MM-DD HH:mm:ss')
        }
        pageFilter.searchKeyValues = {
          ...pageFilter.searchKeyValues,
          ...fieldsValue,
        }
      }

      this.setState({
        pageFilter:pageFilter
      });
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
      orgId:loginOrg().uuid,
    };
    form.resetFields();
    this.refreshTable();
  }

  columns = [
      {
        title: '实体标示',
        dataIndex: 'entityId',
        width: colWidth.billNumberColWidth,
      },
      {
        title: '接口名称',
        dataIndex: 'interfaceName',
        width: colWidth.codeNameColWidth,
        render:val=>InterfaceType[val]?InterfaceType[val].caption:'未定义'
      },
      {
        title: '日志时间',
        width: colWidth.dateColWidth+50,
        dataIndex: 'logTime',
        sorter:true
      },
      {
        title: '日志级别',
        dataIndex: 'level',
        width: colWidth.enumColWidth-50,
        render:val=>val?Level[val].caption:<Empty/>
      },
      {
        title: '详情',
        dataIndex: 'message',
        width:itemColWidth.noteEditColWidth+100,
        render:val=>val?<EllipsisCol colValue={val}/>:<Empty/>
      }
    ];

    refreshColumns = (columns) => {
      columns.forEach(e => {
        if (e.width) {
          e.onCell = () => {
            return {
              style: {
                maxWidth: e.width,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                cursor: 'pointer'
              }
            }
          }
        }
      });
    }
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
        this.refreshColumns(this.columns);

        return (
          <div>
            <Form className={styles.formItems} onSubmit={this.handleSearch}>
              <Row gutter={16}>
                <Col md={6} sm={24}>
                  <Form.Item key="interfaceName" label='接口名称'>
                    {
                      getFieldDecorator('interfaceName', {
                          initialValue:''
                        })(
                        <Select style={{width:'100%'}} placeholder={placeholderLocale('接口名称')} autoFocus>
                          {getTypeOptions()}
                        </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col md={6} sm={24}>
                  <Form.Item key="entityId" label='实体标示'>
                    {
                      getFieldDecorator('entityId', {
                          initialValue: fieldsValue.entityId
                        })(
                        <Input placeholder={placeholderLocale('实体标示')}/>
                    )}
                  </Form.Item>
                </Col>
                <Col md={6} sm={24}>
                  <Form.Item key="logTime" label='日志时间'>
                    {
                      getFieldDecorator('logTime', {
                          initialValue: moment(new Date(new Date(new Date().toLocaleDateString()).getTime()))
                        })(
                          <DatePicker style={{width:'100%'}}  format="YYYY-MM-DD HH:mm:ss" showTime allowClear={false}/>
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
