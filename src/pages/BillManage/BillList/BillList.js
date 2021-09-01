import BillListSearchPage from './BillListSearchPage';
import BillListCreatePage from './BillListCreatePage';
import { connect } from 'dva';
import { Fragment, PureComponent } from 'react';
import { Button, message, Modal, Form, Layout, Menu, Icon } from 'antd';

@connect(({ billList, loading }) => ({
    billList,
    loading: loading.models.billList,
  }))

export default class BillList extends PureComponent{
    render(){
        const {
            showPage,
            entityUuid,
          } = this.props.billList;

        if(showPage === 'query'){
            return (<BillListSearchPage pathname={this.props.location.pathname} />)
        }else if(showPage ==='create'){
            return (<BillListCreatePage pathname={this.props.location.pathname} entityUuid={entityUuid} />)
        }
    }
}