import React, { Component } from 'react'
import SearchPage from '@/pages/Component/Page/SearchPage';
import ZzSearchForm from './ZzSearchForm'
import { Button,Input,message,Popconfirm } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { colWidth } from '@/utils/ColWidth';
import {zzLocale} from './ZzLocale'
import {connect} from 'dva'
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
//import { havePermission } from '@/utils/authority';
const { Search } = Input;

@connect(({ zztest, loading }) => ({
    zztest,
    loading: loading.models.zztest,
  }))
export default class ZzSearch extends SearchPage {

    constructor(props) {
        super(props);
    
        this.state = {
          ...this.state,
          title: zzLocale.title,
          data: props.zztest.data,
          suspendLoading: false,
        };
        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        // if (!this.state.pageFilter.searchKeyValues.state)
        //   this.state.pageFilter.searchKeyValues.state = '';
      }
    
      /**
       * 查询后刷新数据！！
       * 
       */
      componentWillReceiveProps(nextProps) {
        this.setState({
          data: nextProps.zztest.data
        });
      }

      componentDidMount() {
        if(this.props.zztest.fromView) {
          return;
        } else {
          this.refreshTable();
        }
        //this.refreshTable();
      }
      
      /**
       * 查看详情
       */
      onView = (record) => {
        this.props.dispatch({
          type: 'zztest/showPage',
          payload: {
            showPage: 'view',
            entityUuid: record.uuid
          }
        });
      }

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
       * 刷新/重置
       */
      refreshTable = (filter) => {
        const { dispatch } = this.props;
        const { pageFilter } = this.state;
    
        let queryFilter = { ...pageFilter };
        if (filter) {
          queryFilter = { ...pageFilter, ...filter };
        }
    
        dispatch({
          type: 'zztest/query',
          payload: queryFilter,
        });
        // console.log("a",this.props.zztest.data)
        // console.log("b",this.props.zz)
      };

      /**
       * 查询
       */
       onSearch=(filter)=>{
           const { pageFilter } = this.state;  //从state中获取搜索条件
       
        //   let queryFilter = { ...pageFilter }; 

        //如果用户有传入filter条件则将条件存入pageFilter中
           if(filter){
                this.state.pageFilter.searchKeyValues={  
                    ...pageFilter.searchKeyValues,
                    ...filter
                }
           }else{
               this.state.pageFilter.searchKeyValues={ 
                  companyUuid: loginCompany().uuid,
               }
           }

      //     queryFilter = { ...pageFilter };
       
       
           this.refreshTable();
       }

        /**
       * 查看详情
       */
        onView = (record) => {
          this.props.dispatch({
            type: 'zztest/showPage',
            payload: {
              showPage: 'view',
              entityUuid: record.id
            }
          });
        }

        /**
         * 批量删除
         */
        onBatchDelete = () => {

          const { selectedRows, batchAction } = this.state;
          console.log("rows为",selectedRows,"batchAction为",batchAction)
          // this.setState({
          //   batchAction: "删除"
          // });         
          // this.handleBatchProcessConfirmModalVisible(true);
        if(selectedRows.length!==0){
          for(var i = 0;i<selectedRows.length;i++){
            this.deleteById(selectedRows[i]);
          }
        }else{
          message.error('请至少选中一条数据！');
        }
         
         

        }

    /**
     * 批量操作动画
     * 暂时不用
     */
    // onBatchProcess = () => {
    //   this.setState({
    //     suspendLoading: true
    //   })
    //   console.log("是否继续进行下一步")  
    //   this.setState({
    //     suspendLoading: false
    //   })

    //   batch(0);
    // }

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
        payload: {id:record.id},
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
    
       test=()=>{
         alert("这是一个测试功能111")
       }
      /**
       * 表格列
       */
    
      columns = [
        {
          title: '姓名',
          dataIndex: 'name',
          key: 'name',
          sorter: true,
          width: colWidth.codeColWidth,
          render: (val, record) => <a onClick={this.onView.bind(this, record)}>{val}</a>,
        },
        {
          title: '年龄',
          dataIndex: 'age',
          key: 'age',
          sorter: true,
          width: colWidth.codeColWidth,
        },
        {
          title: '地址',
          dataIndex: 'address2',
          key: 'address2',
          sorter: true,
          width: colWidth.codeColWidth,
        },
        {
          title: '性别',
          key: 'sex',
          dataIndex: 'sex',
          sorter: true,
          width: colWidth.codeColWidth,
        },
        {
          title: '手机号',
          key: 'phone',
          dataIndex: 'phone',
          sorter: true,
          width: colWidth.codeColWidth,
        }
      ];
            
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
         <SearchMoreAction menus={menus}/>
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
    
      /**
       * 绘制搜索表格
       */
      drawSearchPanel = () => { 
        //   return (
        //         <div>员工姓名：<Search  placeholder="输入员工姓名开始搜索" onSearh={this.onSearch} style={{ width: 350}} /></div>
        //         ) 
        return <ZzSearchForm filterValue={this.state.pageFilter.searchKeyValues}  refresh={this.onSearch} />;
    }
}
