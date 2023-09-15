import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, Popconfirm, message } from 'antd';
import BatchProcessConfirm from '@/pages/SJTms/Dispatching/BatchProcessConfirm';
import { audit, aborted } from '@/services/cost/CostPlan';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class CostSubidyProjectSearchPage extends QuickFormSearchPage {
  onView = () => {};

  drawToolsButton = () => {
    const { showAuditPop, showAbortedPop, selectedRows } = this.state;
    return (
      <>
        <Button>发起流程</Button>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
      </>
    );
  };
}
