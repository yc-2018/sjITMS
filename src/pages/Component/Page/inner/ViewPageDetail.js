import React, { Component, Fragment } from 'react';
import { Switch, Input, Button, message, Divider } from 'antd';
import styles from './ViewPageDetail.less';
import { basicState } from '@/utils/BasicState';
import { connect } from 'dva';
import { TITLE_SEPARATION, BASIC_TITLE_SEPARATION } from '@/utils/constants';
import IconFont from '@/components/IconFont';
import { havePermission } from '@/utils/authority';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

const { Search } = Input;

@connect(({ innerBill, loading }) => ({
  innerBill,
  loading: loading.models.innerBill,
}))
export default class ViewPageDetail extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showInput: false
    }
  }

  componentWillReceiveProps(nextProps) {
    let oldBillNumber, newBillNumber, title;
    // if(nextProps.title === undefined){
    //   title = "";
    //   oldBillNumber = nextProps.title;
    //   newBillNumber =  nextProps.title;
    // }else {
      let titles = nextProps.title ? nextProps.title.split(TITLE_SEPARATION) : [];
      if (titles.length > 1) {
        oldBillNumber = titles[1];
        newBillNumber = titles[1];
        title = titles[0] + TITLE_SEPARATION;
      } else {
        title = titles[0];
        titles = nextProps.title ? nextProps.title.split(BASIC_TITLE_SEPARATION):[];
        if (titles.length > 1) {
          title = "";
          oldBillNumber = nextProps.title;
          newBillNumber = titles[0].substr(1);
        }
      }


    this.state = {
      oldBillNumber: oldBillNumber,
      newBillNumber: newBillNumber,
      label: title
    }
  }

  render() {
    const {
      children,
      title,
      state,
      onChangeState,
      action,
      stateCaption,
      stateDisabled,
      realStateCaption,
      realChecked,
      billState,
      noUpDown,
      noShowBeforeNext,
      noShowInput
    } = this.props;

    const switchStateCaption = realStateCaption ? realStateCaption : state === basicState.ONLINE.name
      ? basicState.ONLINE.caption
      : basicState.OFFLINE.caption;
    const switchChecked = realStateCaption ? realChecked : state === basicState.ONLINE.name;

    const operate = [];
    operate.push(action);

    const child = [];
    if (this.props.onNew) {
      child.push(
        <Button key="01" onClick={() => this.onNew()}
                icon='plus'
                style={{ margin: "0px 0px 0px 10px" }}
                disabled={this.props.createPermission ? !havePermission(this.props.createPermission) : true}
                type="primary">
          新建
        </Button>
      );
    }
    child.push(<a key="02" onClick={() => this.onRefresh()}><IconFont style={{ margin: "0px 0px 0px 10px" }} type="icon-refresh" /> </a>);
    operate.push(<Fragment key="001">{child}</Fragment>);

    let ret = (
      <div className={styles.pageDetail} style={{ height: 'calc(100vh - 135px)' }}>
        <div key={"1"} className={styles.detailNavigatorPanelWrapper}>
          {
            billState &&
            <div className={styles.billState}>
              {billState}
            </div>
          }
          <span key={"2"} className={styles.title}>
            {this.state.label}
            {this.state.showInput && !noShowInput &&
            <Search
              defaultValue={this.state.newBillNumber}
              onSearch={() => this.onSearch()}
              size="middle"
              style={{ width: 200 }}
              onBlur={() => this.onSearch()}
              autoFocus
              onPressEnter={() => this.onSearch()}
              onChange={e => this.onChange(e)}
            />

            }
            {!this.state.showInput && this.state.oldBillNumber && !noShowInput ?
            <span key={"3"} onClick={() => this.changeBillNumber()}>{this.state.oldBillNumber}</span> : !this.state.showInput ?
              <span key={"3"}>{this.state.oldBillNumber}</span> : ''
            }
            {!noShowBeforeNext && !noUpDown && billState && !this.state.showInput && <Button key={"4"} className={styles.nextBeforeButton} onClick={() => this.onBefore()} style={{ margin: "0px 0px 0px 10px", 'border-style': 'none' }}
                                                                        size="small" type="text" >
              <IconFont type="icon-arrow_triangle_left1" />上一单</Button>}
            {!noShowBeforeNext && !noUpDown && billState && !this.state.showInput && <Divider key={"5"} style={{ 'border': '1px solid #D8DAE6' }} type="vertical" />}
            {!noShowBeforeNext && !noUpDown && billState && !this.state.showInput && <Button key={"6"} className={styles.nextBeforeButton} onClick={() => this.onNext()} style={{ margin: "0px 0px 0px 0px", 'border-style': 'none' }} size="small" type="text" >
              下一单<IconFont type="icon-arrow_triangle_right1" /></Button>}
          </span>

          {state &&
          <div key={"7"} className={styles.enableCheck}>
            <Switch key="10" disabled={stateDisabled == 'disabled' ? true : stateDisabled} className={styles.enableSwitch} checked={switchChecked} onChange={onChangeState} />
            <span key="11" style={{fontSize: 14}}>
                {switchStateCaption}
              </span>
          </div>
          }
          {stateCaption && <div className={styles.enableCheck}><span key="12">{stateCaption}</span></div>}
          <div key={"8"} className={styles.action}>
            {operate}
          </div>
        </div>

        <div key={"9"} className={styles.tab} >
          {children}
        </div>
      </div>
    );
    if (this.state.isDrag || true) {
      return (
        <DndProvider backend={HTML5Backend}>
          {ret}
        </DndProvider>
      );
    } else {
      return ret;
    }
  }

  changeBillNumber = () => {
    this.setState({
      showInput: true,
      noShowInput: false
    });
  }

  onSearch = () => {
    this.setState({
      showInput: false,
      // noShowInput: true
    });
    const billNumber = this.state.newBillNumber ? this.state.newBillNumber : this.state.oldBillNumber;
    if (billNumber !== this.state.oldBillNumber) {
      this.props.refresh(billNumber.trim());
    }
  }

  onRefresh = () => {
    if (this.props.refresh)
      this.props.refresh();
  }

  onChange = (e) => {
    this.setState({
      newBillNumber: e.target.value
    });
  }

  onNew = () => {
    this.props.onNew();
  }

  onNext = () => {
    this.props.dispatch({
      type: 'innerBill/next',
      payload: {
        billNumber: this.state.oldBillNumber,
        type: this.props.namespace,
        createOrgUuid:loginOrg().uuid,
        companyUuid:loginCompany().uuid
      },
      callback: (res) => {

        if(res && res.data) {
          this.props.refresh(undefined,res.data);
        }
      }
    });
  }

  onBefore = () => {
    this.props.dispatch({
      type: 'innerBill/before',
      payload: {
        billNumber: this.state.oldBillNumber,
        type: this.props.namespace,
        createOrgUuid:loginOrg().uuid,
        companyUuid:loginCompany().uuid
      },
      callback: (res) => {
       
        if(res && res.data) {
          this.props.refresh(undefined, res.data);
        }
      
    }
    });
  }
}
