import React, { PureComponent } from 'react'
import {Table,Button,Input,Col,Row} from 'antd';
import {connect} from 'dva'
import { Route,Switch } from 'react-router-dom'
import axios from 'axios';
import SearchPage from '@/pages/Component/Page/SearchPage';
import { colWidth } from '@/utils/ColWidth';
import AdvanceQuery from './AdvancedQuery/QueryT'
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';


const { Search } = Input;


export default class QuickSearchExpand extends SearchPage {

    // query=()=>{
    //     const { dispatch } = this.props;
    //     dispatch({
    //         type: 'quick/query',
    //         payload: this.state.quickuuid,
    //       });
    // }

    getData=(pageFilters)=>{
        const { dispatch } = this.props;
        dispatch({
            type: 'quick/queryDate',
            payload: pageFilters
        });    
    }

    queryCoulumns=()=>{
        const { dispatch } = this.props;
        dispatch({
            type: 'quick/queryColumns',
            payload: this.state.quickuuid,
          });
    }

    constructor(props) {
       
        super(props);
        //console.log("这是父类search2",this)
        this.state = {
            ...this.state,
            title: 'test',
            data: [],
            suspendLoading: false,
            columns:[],
            quickuuid:this.props.quickuuid,
            //quickuuid:props.route.quickuuid,
            pageFilters:{quickuuid:props.quickuuid,changePage:true},
            key: this.props.quickuuid+'quick.search.table'  //用于缓存用户配置数据
        };
      
       
    }
    



    componentDidMount(){
        this.queryCoulumns()
        this.queryCoulumns()
        this.onSearch()
    }
 
    componentWillMount(){

    }

    componentWillReceiveProps(nextProps) {  
        console.log("next",nextProps)
        const{map} = nextProps.quick
        const{quickuuid} = this.state
        var quickColumn = quickuuid+'columns'
        var quickData = quickuuid+'data'
        var reportHeadName = quickuuid+'reportHeadName';
        if(map.get(quickColumn)!=null){
            this.columns=map.get(quickColumn)
        }
        this.setState({columns:map.get(quickColumn)})
        this.setState({data:map.get(quickData)})  
        this.setState({title:map.get(reportHeadName)})
    }

    componentWillUnmount (){
        console.log("谁被卸载了",this.state.quickuuid)
    }



        /**
     * 显示新建/编辑界面
     */
    onCreate = () => {
       
    }

     /**
       * 查询
       */
      onSearch=(filter)=>{
        console.log(filter)
        if(typeof(filter) == "undefined"){
           //重置搜索条件 
           this.state.pageFilters={quickuuid:this.props.quickuuid}
           //this.query();
           this.getData(this.state.pageFilters)
        }else{
            const { dispatch } = this.props;
            const{columns} = this.state
            const pageFilters = {
                ...this.state.pageFilters,
                superQuery:{
                matchType:filter.matchType,
                queryParams:filter.queryParams
                }
            }
            this.state.pageFilters = pageFilters
            this.refreshTable()    
        }
           
           

    }



     /**
       * 刷新/重置
       */
      refreshTable = (filter) => {
        console.log("let me see see",filter)
        const { dispatch } = this.props;
        const { pageFilters } = this.state;
    
        let queryFilter = { ...pageFilters, };
        if (filter) {
            var order = '';
            for(var key in filter.sortFields){
                var sort = filter.sortFields[key]?'descend':'ascend'
                order=key+','+sort
            }
            queryFilter = { 
                order:order,
                ...pageFilters, 
                page:filter.page+1,
                pageSize:filter.pageSize,
                 
            };
        }
     
        dispatch({
            type: 'quick/queryDate',
            payload: queryFilter,
        });    

        
      };


    columns = [{
        title: '过度数据',
        dataIndex: 'name',
        key: 'name',
        sorter: true,
        width: colWidth.codeColWidth,
    }] ;

     /**
       * 绘制右上角按钮
       */
    drawActionButton = () => { 
            
    }


     /**
       * 绘制批量工具栏
       */
    drawToolbarPanel = () => { 
        
    }
    

       
      /**
       * 绘制搜索表格
       */
       drawSearchPanel = () => { 
        return (
            <div>
               <AdvanceQuery fieldInfos={this.columns} filterValue={this.state.pageFilter.searchKeyValues}  refresh={this.onSearch}/>
            </div>
        )
    }

}
