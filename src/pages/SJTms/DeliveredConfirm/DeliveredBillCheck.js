import React, { PureComponent } from 'react';
import { Button, message } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { confirmOrder } from '@/services/sjtms/DeliveredConfirm';
import Result from '@/components/Result';
import { res } from '@/pages/In/Move/PlaneMovePermission';
import { queryIdleAndThisPostionUseing } from '@/services/facility/Container';
import { loginOrg, loginCompany, loginUser } from '@/utils/LoginContext';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class DeliveredBillCheck extends QuickFormSearchPage {
  state = {
    ...this.state,
    isNotHd: true,
    pageData: [],
  };
  drawToolbarPanel = () => {};
  drawTopButton = () => {};
  drawToolsButton = () => {};
  drawSearchPanel = () => {};
  componentWillReceiveProps(nextProps) {
    if (nextProps.pageFilters != this.props.pageFilters) {
      this.onSearch(nextProps.pageFilters);
    }
  }

  //该方法会覆盖所有的上层按钮
  drawActionButton = () => {
    return (
      <>
        <Button onClick={this.checkAndSave}>核对并保存单据</Button>
      </>
    );
  };

  checkAndSave = async () => {
    const { selectedRows } = this.state;
    selectedRows.forEach(e => {
      e.companyUuid = loginCompany().uuid;
      e.dispatchCenterUuid = loginOrg().uuid;
    });
    await confirmOrder(selectedRows).then(result => {
      if (result && result.success) {
        this.refreshTable();
        message.success('保存成功');
      }
    });
  };
}
