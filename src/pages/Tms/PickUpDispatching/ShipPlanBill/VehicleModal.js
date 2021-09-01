import { PureComponent } from "react";
import { Modal } from "antd";
import VehicleSearchPage from './VehicleSearchPage'

export default class VehicleModal extends PureComponent{
  constructor(props){
    super(props)
    this.state={
      visible : props.visible,
      targetRow:{}
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.visible!=undefined&&nextProps.visible!=this.props.visible){
      this.setState({
        visible:nextProps.visible
      })
    }
  }

  onCancel = ()=>{
    this.props.onCancel();
  }
  onOk = ()=>{
    this.props.onOk(this.vehicleRef.getSelectRow());
  }
  render(){
    const { visible,targetRow } = this.state;
    return <div>
      <Modal
        visible = {visible}
        onCancel = {this.onCancel}
        onOk = {this.onOk}
        width="70%"
      >
        <VehicleSearchPage 
           onRef={(ref) => { this.vehicleRef = ref; }} 
        />
      </Modal>
    </div>
  }
}