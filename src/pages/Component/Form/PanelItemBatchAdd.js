import { connect } from 'dva';
import { PureComponent } from "react";
import { Button, Drawer, message } from 'antd';
import { commonLocale } from '@/utils/CommonLocale';
import StandardTable from '@/components/StandardTable';
import styles from './PanelItemBatchAdd.less';
/**
 * 新建页面的批量添加
 * 标题：传入title属性，不传则默认‘批量添加’。
 * 显示与隐藏：传入visible以及handlebatchAddVisible()。
 * 搜索表单：传入searchPanel属性，值为封装好的表单控件。
 * 表格：传入表格列数组columns；表格数据源data;若不分页则传入noPagination属性。
 * 确认添加：传入getSeletedItems(),在调用者的方法中，可通过参数获取到选中的行数据。
 * 面板宽度：传入width属性，不传则默认为‘77%’。
 * 表格loading ：传入loading属性
 */
export default class PanelItemBatchAdd extends PureComponent {
  state = {
    selectedRows: [],
    data: {
      list: [],
      pagination: {}
    },
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data && this.props.data && nextProps.data.list && nextProps.data.list != this.props.data.list) {
      if (nextProps.data.pagination) {
        nextProps.data.list.forEach((item, index) => {
          item.uuid = item.uuid ? item.uuid : nextProps.data.pagination.current + "&" + index;
        });
      }

      if (this.state.pagination && this.state.data.pagination.current == 1) {
        this.setState({
          selectedRows: [],
        })
      } else if (!nextProps.data.pagination) {
        this.setState({
          selectedRows: [],
        })
      } else if (nextProps.data.pagination && nextProps.data != this.state.data
        && this.state.data.pagination
        && this.state.data.pagination.current == nextProps.data.pagination.current) {
        this.setState({
          selectedRows: [],
        })
      }

      this.setState({
        data: nextProps.data,
      })
    }
  }

  /**添加 */
  handleOk = () => {
    if (this.state.selectedRows.length <= 0) {
      message.warning('请先选择要添加的行');
      return;
    }
    this.handlebatchAddVisible();
    this.props.getSeletedItems(this.state.selectedRows);
  }

  /** 控制弹出框展示*/
  handlebatchAddVisible = () => {
    this.setState({
      selectedRows: [],
      data: { list: [] }
    }, () => {
      this.props.handlebatchAddVisible();
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
    let widthNum = this.props.width ? String(this.props.width).split('%')[0] : 0;
    const width = this.props.width ? Number(widthNum)>85?'85%':this.props.width : '77%';
    return (
      <Drawer
        title={this.props.title ? this.props.title : "批量添加"}
        headerStyle={{ height: '48px' }}
        placement="right"
        closable={true}
        onClose={this.handlebatchAddVisible}
        visible={this.props.visible}
        width={width}
        destroyOnClose
        maskClosable={false}
      >
        <div className={styles.panelSearch} >
          {this.props.searchPanel}
        </div>
        <StandardTable
          loading={this.props.loading}
          noPagination={this.props.noPagination}
          selectedRows={selectedRows}
          rowKey={record => record.uuid}
          data={data}
          overHeight={114}
          columns={this.props.columns}
          onSelectRow={this.handleRowSelectChange}
          onChange={this.props.onChange}
          noSettingColumns
          comId={this.props.tableId ? this.props.tableId : undefined}
        />

        <div className={styles.buttonBottom} style={{width:width}}>
          <Button onClick={this.handlebatchAddVisible} style={{ marginRight: 8 }}>
            {commonLocale.cancelLocale}
          </Button>
          <Button onClick={this.handleOk} type="primary">
            添加
          </Button>
        </div>

      </Drawer>
    );
  }
}
