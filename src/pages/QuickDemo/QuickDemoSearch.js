import React, { PureComponent } from 'react'
import {Table,Button,Input,Col,Row,Popconfirm,message} from 'antd';
import {connect} from 'dva'
import { Route,Switch } from 'react-router-dom'
import QuickSearchExpand from '@/pages/Quick/QuickSearchExpand';
import SearchPage from '@/pages/Component/Page/SearchPage';

@connect(({ quick,zztest, loading }) => ({
    quick,
    zztest,
    loading: loading.models.quick,
  }))
export default class QuickDemoSearch extends QuickSearchExpand {

      constructor(props) {
        super(props);
        console.log("this")
      }

      state = {
          ...this.state,
          title: 'test',
          data: [],
          suspendLoading: false,
          columns:[],
          //quickuuid:this.props.route.quickuuid,
          key: this.props.quickuuid+'quick.search.table'  //用于缓存用户配置数据
      };

        // componentDidMount(){
        //   console.log("testzzz",this)
          
        // }

        // componentWillReceiveProps(nextProps) {  
        
        // }

    /**
     * 显示新建/编辑界面
     */
    onCreate = () => {    
        this.props.dispatch({
        type: 'zztest/showPage',
        payload: {
        //...payload
        showPage: 'create',
        entityUuid: ''
        }
      });
    }

      /**
       * 查看详情
       */
      onView = () => {
        const { selectedRows, batchAction } = this.state;
        //console.log("rows为",selectedRows,"batchAction为",batchAction,selectedRows[0].ID)
        if(selectedRows.length>0){
          this.props.dispatch({
            type: 'zztest/showPage',
            payload: {
              showPage: 'view',
              entityUuid: selectedRows[0].ID
            }
          });
        }else message.error('请至少选中一条数据！');
      }


    /**
     * 批量删除
     */
      onBatchDelete = () => {

          const { selectedRows, batchAction } = this.state;
          if(selectedRows.length!==0){
            for(var i = 0;i<selectedRows.length;i++){
              this.deleteById(selectedRows[i]);
            }
          }else{
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

      // return new Promise(function (resolve, reject) {
        dispatch({
          type: 'zztest/onDelete',
          payload: {id:record.ID},
          callback: response => {
            if (batch) {
              that.batchCallback(response, record);
              resolve({ success: response.success });
              return;
            }

            if (response && response.success) {
              this.setState({selectedRows:[]})
              that.refreshTable();
              message.success("删除成功！");
              
            }
          }
        });
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
                <Button onClick={this.onView} type='primary'
                    >
                    查看
                </Button>
            </div>
          ) }

      /**
       * 绘制批量工具栏
       */
      drawToolbarPanel = () => { return (
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
        ) }
      
          




}
