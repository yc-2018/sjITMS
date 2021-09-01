import { connect } from 'dva';
import { PureComponent } from "react";
import { Button, Drawer, message } from 'antd';
import { commonLocale } from '@/utils/CommonLocale';
import StandardTable from '@/components/StandardTable';
import styles from './AtricleDtlModal.less';
/**
 * 新建页面的批量添加
 * 标题：传入title属性，不传则默认‘批量添加’。
 * 显示与隐藏：传入visible以及handlebatchAddVisible()。
 * 搜索表单：传入searchPanel属性，值为封装好的表单控件。
 * 表格：传入表格列数组columns；表格数据源data;若不分页则传入noPagination属性。
 * 确认添加：传入getSeletedItems(),在调用者的方法中，可通过参数获取到选中的行数据。
 * 面板宽度：传入width属性，不传则默认为‘77%’。
 */
export default class PanelItemBatchAdd extends PureComponent {
  state = {
    selectedRows: [],
    data: {
      list: [],
      pagination: {}
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data && this.props.data && nextProps.data.list && nextProps.data.list != this.props.data.list) {
      if (nextProps.data.pagination) {
        nextProps.data.list.forEach((item, index) => {
          item.uuid = item.uuid ? item.uuid : nextProps.data.pagination.current + "&" + index;
        });
      }
      this.setState({
        data: nextProps.data
      })
    }
  }

  /** 控制弹出框展示*/
  handlebatchAddVisible = () => {
    this.setState({
      selectedRows: [],
      data: { list: [] }
    }, () => {
      this.props.handleAtricleDtlVisible();
    });
  }

  /** 获取选中行*/
  handleRowSelectChange = (rows) => {
    this.setState({
      selectedRows: rows,
    })
  };

  render() {
    const { selectedRows, data } = this.state;
    return (
      <Drawer
        title={this.props.title ? this.props.title : "商品信息"}
        placement="right"
        closable={false}
        onClose={this.handlebatchAddVisible}
        visible={this.props.visible}
        width={this.props.width ? this.props.width : '77%'}
        destroyOnClose
      >
        <StandardTable
          noPagination={this.props.noPagination}
          selectedRows={selectedRows}
          rowKey={record => record.uuid}
          data={data}
          columns={this.props.columns}
          onSelectRow={this.handleRowSelectChange}
          onChange={this.props.onChange}
        />
        <div className={styles.buttonBottom}>
          <Button onClick={this.handlebatchAddVisible} style={{ marginRight: 8 }}>
            {commonLocale.cancelLocale}
          </Button>
        </div>
      </Drawer>
    );
  }
}
