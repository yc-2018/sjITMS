import React, { Component } from 'react'
import SearchPage from '@/pages/Component/Page/SearchPage';
import ZzSearchForm from '../../Test/Zz/ZzSearchForm'
import { Button,Input,message,Popconfirm } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { colWidth } from '@/utils/ColWidth';
import {zzLocale} from '../../Test/Zz/ZzLocale'
import {connect} from 'dva'
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
import BatchNumberConfigForm from '@/pages/Basic/BatchNumberConfig/BatchNumberConfigForm';
//import { havePermission } from '@/utils/authority';
const { Search } = Input;

@connect(({ batchNumberConfig, loading }) => ({
    batchNumberConfig,
    loading: loading.models.batchNumberConfig,
  }))
export default class BatchNumberConfigSearchForm extends SearchPage {

    constructor(props) {
        super(props);
        console.log("props",props);
      console.log("state1",this.state);
        this.state = {
          ...this.state,
          title: zzLocale.title,
          data: props.batchNumberConfig.data,
          suspendLoading: false,
        };
      console.log("state2",this.state);
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
          data: nextProps.batchNumberConfig.data
        });
      }

      componentDidMount() {
        if(this.props.batchNumberConfig.fromView) {
          return;
        } else {
          this.refreshTable();
        }
        //this.refreshTable();
      }

      /**
       * 查看详情
       */
    /*  onView = (record) => {
        console.log("record111",record.uuid);
        let entityUuid = '';
        this.props.dispatch({
          type: 'batchNumberConfig/showPage',
          payload: {
            showPage: 'view',
            entityUuid: record.uuid,
          }
        });
      }*/

    /**
     * 显示新建/
     */
    onCreate = () => {
      this.props.dispatch({
        type: 'batchNumberConfig/showPage',
        payload: {
          showPage: 'create',
          entityUuid: '',
          entity : []
        }
      });
        }

//编辑界面
  onUpdate = () => {
    const { selectedRows, batchAction } = this.state;
    console.log("selectedRows",selectedRows);
    console.log("batchAction",batchAction);
    selectedRows.length==0?message.error('请选中一条数据！'):selectedRows.length>1?
      message.error('只能选中一条数据！'):
      this.props.dispatch({
        type: 'batchNumberConfig/showPage',
        payload: {
          showPage: 'create',
          entityUuid: '',
          entity : selectedRows
        }
      });

  }




      /**
       * 刷新/重置
       */
      refreshTable = (filter) => {
        const { dispatch } = this.props;
        const { pageFilter } = this.state;
        console.log("refreshTable");
        let queryFilter = { ...pageFilter };
        if (filter) {
          queryFilter = { ...pageFilter, ...filter };
        }

        dispatch({
          type: 'batchNumberConfig/query',
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
          console.log("record",record.uuid);
          this.props.dispatch({
            type: 'batchNumberConfig/showPage',
            payload: {
              showPage: 'view',
              entityUuid: record.uuid,
              entity:record
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
        type: 'batchNumberConfig/onDelete',
        payload: record.uuid,
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }

          if (response && response.data>0) {
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
     /*   {
          title: 'uuid',
          dataIndex: 'uuid',
          key: 'uuid',
          sorter: true,
          width: colWidth.codeColWidth

        },*/
     /* {
          title: 'uuid',
          dataIndex: 'uuid',
          key: 'uuid',
          sorter: false,
          width: colWidth.codeColWidth,
          render: (val, record) => <a onClick={this.onView.bind(this, record)}>{val}</a>,
        },*/
        {
          title: '货主',
          dataIndex: 'ownerName',
          key: 'ownerName',
          sorter: false,
          width: colWidth.codeColWidth,
        },
        {
          title: '组织',
          dataIndex: 'dcName',
          key: 'dcName',
          sorter: false,
          width: colWidth.codeColWidth,
        },
        {
          title: '前缀',
          key: 'first',
          dataIndex: 'first',
          sorter: false,
          width: colWidth.codeColWidth,
        },
        {
          title: '中间',
          key: 'middle',
          dataIndex: 'middle',
          sorter: false,
          width: colWidth.codeColWidth,
        },
        {
          title: '后缀',
          key: 'behind',
          dataIndex: 'behind',
          sorter: false,
          width: colWidth.codeColWidth,
        },
        {
          title: '状态',
          key: 'state',
          dataIndex: 'state',
          sorter: false,
          width: colWidth.codeColWidth,
          render:(val,record) =>{return val == 0?"禁用":"启用"}
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
          <Button onClick={this.onUpdate} type='primary'
        >
          编辑
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
        return <BatchNumberConfigForm filterValue={this.state.pageFilter.searchKeyValues}  refresh={this.onSearch} />;
    }
}
