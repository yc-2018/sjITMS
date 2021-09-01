import { connect } from 'dva';
import { Fragment, PureComponent } from 'react';
import { Button, message, Modal, Form, Layout, Menu, Icon } from 'antd';
import UnitConversionSearchPage from './UnitConversionSearchPage'
import UnitConversionCreatePage from './UnitConversionCreatePage'

@connect(({ unitConversion, loading }) => ({
    unitConversion,
    loading: loading.models.unitConversion,
  }))
export default class unitConversion extends PureComponent{


    render(){
        const {
            showPage,
            entityUuid,
          } = this.props.unitConversion;

        if(showPage === 'query'){
            return (<UnitConversionSearchPage pathname={this.props.location.pathname} />)
        }else if(showPage ==='edit'){
            return (<UnitConversionCreatePage pathname={this.props.location.pathname} entityUuid={this.props.unitConversion.entityUuid} />)
        }
    }
}