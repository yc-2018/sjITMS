import React, { PureComponent } from 'react'
import { Table, Button, Input, Col, Row, Popconfirm, message } from 'antd';
import { connect } from 'dva'
import { Route, Switch } from 'react-router-dom'
import QuickSearchExpand from '@/pages/Quick/QuickSearchExpand';
import SearchPage from '@/pages/Component/Page/SearchPage';
import ExportJsonExcel from 'js-export-excel';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class QuickSearchPage extends QuickSearchExpand {


    constructor(props) {
        super(props);
     }


    state = {
        ...this.state,
        title: 'test',
        data: [],
        suspendLoading: false,
        columns: [],
        key: this.props.quickuuid + 'quick.search.table'  //用于缓存用户配置数据
    };

  // componentDidMount(){
  //   console.log("testzzz",this)

  // }


  /**
   * 显示新建/编辑界面
   */
  onCreate = () => {
    this.props.dispatch({
        type: 'quick/showPageMap',
        payload: {
           showPageK:this.state.reportCode,
           showPageV:this.state.reportCode+'create'
        }
    });
  }
  /**
   * 编辑界面
   */
  onUpdate = () => {
    const { selectedRows} = this.state;
    if (selectedRows.length !== 0) {
    this.props.dispatch({
        type: 'quick/showPageMap',
        payload: {
           showPageK:this.state.reportCode,
           showPageV:this.state.reportCode+'update',
           entityUuid: selectedRows[0].ID
        }
    });
  }else{
    message.error('请至少选中一条数据！');
  }
}
  /**
   * 查看详情
   */
  onView = () => {
    const { selectedRows, batchAction } = this.state;
    //console.log("rows为",selectedRows,"batchAction为",batchAction,selectedRows[0].ID)
    if (selectedRows.length > 0) {
      this.props.dispatch({
        type: 'quick/showPage',
        payload: {
          showPage: 'view',
          entityUuid: selectedRows[0].ID
        }
      });
    } else message.error('请至少选中一条数据！');
  }


  /**
   * 批量删除
   */
  onBatchDelete = () => {

    const { selectedRows, batchAction } = this.state;
    if (selectedRows.length !== 0) {
      for (var i = 0; i < selectedRows.length; i++) {
        this.deleteById(selectedRows[i]);
      }
    } else {
      message.error('请至少选中一条数据！');
    }


  }


  /**
* 单一删除
*/
  deleteById = (record, batch) => {
    const { dispatch } = this.props;
    let that = this;
    // const {selectedRows} = this.state
    console.log("record",record);
    const{onlFormField}=this.state
    var field = onlFormField.find(x => x.dbIsKey)?.dbFieldName;

    const recordMap = new Map(Object.entries(record));
    var val = recordMap.get(field)

    const params = {
      tableName:this.state.tableName,
      condition:{
        params:[
          {
            field,
            rule:'eq',
            val:[val]
          }
        ]
      },
      deleteAll:"false"   
    }  
    dispatch({
      type: 'quick/dynamicDelete',
      payload: { 
        params
      },
      callback: response => {
        if (batch) {
          that.batchCallback(response, record);
          resolve({ success: response.success });
          return;
        }

        if (response && response.success) {
          this.setState({ selectedRows: [] })
          that.refreshTable();
          message.success("删除成功！");

        }
      }
    });
  }


  port = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'quick/queryAllData',
      payload: this.state.pageFilters,
      callback: response => {
        if (response && response.success) {
          let columns = this.state.columns
          var option = []
          let sheetfilter = [] //对应列表数据中的key值数组，就是上面resdata中的 name，address
          let sheetheader = [] //对应key值的表头，即excel表头
          columns.map(a=>{
            sheetfilter.push(a.key)
            sheetheader.push(a.title)
          })
          option.fileName = this.state.title  //导出的Excel文件名
          option.datas = [
            {
              sheetData: this.state.data.list,
              sheetName: this.state.title,  //工作表的名字
              sheetFilter: sheetfilter,
              sheetHeader: sheetheader,
            }
          ]
          var toExcel = new ExportJsonExcel(option);
          toExcel.saveExcel();
        }
      }
    })
  }

  


  /**
 * 绘制右上角按钮
 */
  drawActionButton = () => {
    //额外的菜单选项
    const menus = []
    menus.push({
      // disabled: !havePermission(STORE_RES.CREATE), //权限认证
      name: '测试', //功能名称
      onClick: this.test //功能实现
    });
    return (
      <div>
        <Button onClick={this.onCreate} type='primary' icon='plus'
        >
          新建
        </Button>
        <Button onClick={this.onUpdate} type='primary' 
        >
          编辑
        </Button>
        <Button onClick={this.onView} type='primary'
        >
          查看
        </Button>
        <Button onClick={this.port} type='primary'>
          导出
        </Button>
      </div>
    )
  }

  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel = () => {
    return (
      <Popconfirm
        title="你确定要删除所选中的内容吗?"
        onConfirm={() => this.onBatchDelete()}
        // onCancel={cancel}
        okText="确定"
        cancelText="取消"
      >
        <Button>
          删除
        </Button>
      </Popconfirm>

    )
  }






}
