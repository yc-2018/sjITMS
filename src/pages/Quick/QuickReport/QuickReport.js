import React, { PureComponent } from 'react'
import {Table,Button,Input,Col,Row} from 'antd';
import {connect} from 'dva'
import { Route,Switch } from 'react-router-dom'
import Create from "@/pages/Component/Page/QuickPage/QuickCreatePage/QuickCreatePage"
import QuicSearchPage from '@/pages/Component/Page/QuickPage/QuickSearchPage/QuickSearchPage'
// import QuickDemoView from './QuickDemoView'
const { Search } = Input;

@connect(({ quick, loading }) => ({
    quick,
    loading: loading.models.quick,
  }))
export default class QuickReport extends PureComponent {

    /**
     * 进入时进入query
     */
    toQueryPage = () => {
        this.props.dispatch({
            type: 'quick/showPageMap',
            payload: {
               showPageK:this.state.quickuuid,
               showPageV:this.state.quickuuid+'query'
            }
        });
    }


      //获取tableName
  queryCoulumns = () => {
    //debugger;
    const { dispatch } = this.props;
    dispatch({
        type: 'quick/queryColumns',
        payload: {
        reportCode: this.state.quickuuid,
        sysCode: 'tms',
        },
        callback: response => {
        if (response.result){
            //获取tableName
            let sqlsplit = response.result.sql.split(/\s+/);
            let tableName = sqlsplit[sqlsplit.length-1]
            this.setState({tableName:tableName})
            //this.state.tableName=tableName;
        }
        },
    });
    };
    constructor(props) {
        super(props);
        this.toQueryPage()   
    }

    state = {
        quickuuid:this.props.route.quickuuid,
        showPageNow:this.props.route.quickuuid+'query',
        tableName:''
    }

    componentDidMount(){
        this.queryCoulumns();
    }

    componentWillReceiveProps(nextProps){
        console.log("next1",nextProps.quick);
        const{showPageMap,map} = nextProps.quick
        this.setState({showPageNow:showPageMap.get(this.state.quickuuid)})
        // this.setState({tableName:map.get(this.state.quickuuid+'tableName')})
    }






    render() {
        const{showPageNow} = this.state
        if(showPageNow === this.state.quickuuid+'create'){
            return (<Create quickuuid={this.state.quickuuid} tableName={this.state.tableName}/>)
        }else if(showPageNow === this.state.quickuuid+'query'){
            return (<QuicSearchPage quickuuid={this.state.quickuuid} pathname={this.props.location.pathname}/>)
        }else if(showPageNow === this.state.quickuuid+'view'){
            return (<QuickDemoView pathname={this.props.location.pathname}/>)
        }else if(showPageNow === this.state.quickuuid+'update'){
            return (<Create quickuuid={this.state.quickuuid}  tableName={this.state.tableName}/>)
        }return null
    }
}
