import React, { Component,PureComponent } from 'react'
import {Table,Button,Input,Col,Row} from 'antd';
import {query,queryDate} from '@/services/quick/Quick';
import {connect} from 'dva'
import { Route,Switch } from 'react-router-dom'
import QuickSearch from './QuickSearch'

const { Search } = Input;

@connect(({ quick, loading }) => ({
    quick,
    loading: loading.models.quick,
}))
  export default class Quick extends Component {

    queryCoulumns=()=>{
        const { dispatch } = this.props;
        dispatch({
            type: 'quick/queryColumns',
            payload: {
                "reportCode":this.state.quickuuid,
                "sysCode":"tms"
            },
          });
    }   

    state = {
        quickuuid:this.props.route.quickuuid
     }

   
    componentDidMount(){
        this.queryCoulumns();
    }

    
    componentWillReceiveProps(nextProps) {  
        
    }

    query=()=>{
        const { dispatch } = this.props;
        dispatch({
            type: 'quick/query',
            payload: this.state.quickuuid,
          });
    }


    render() {
       if(this.props.quick.showPage === 'query'){
            return (<QuickSearch quickuuid={this.state.quickuuid} pathname={this.props.location.pathname}/>)
       }
    }
}
