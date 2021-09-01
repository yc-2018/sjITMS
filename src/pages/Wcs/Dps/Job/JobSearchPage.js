import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Select, Switch, Divider, message } from 'antd';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import SearchPage from '@/pages/Component/Page/SearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { getSourceWayCaption } from '@/utils/SourceWay';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import  jobLocale  from './JobLocal';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import OperateCol from '@/pages/Component/Form/OperateCol';
import Empty from '@/pages/Component/Form/Empty';
import AlcNumModal from './AlcNumModal';

@connect(({ job, loading }) => ({
  job,
  loading: loading.models.owner,
}))
export default class JobSearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: jobLocale.title,
      data: props.job.data,
      suspendLoading:false,
      startModalVisible:false,
      key:'job.search.table',
      pageFilter: {
        page: 0,
        pageSize: 10,
        sortFields: {},
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        }
      }
    };

  }

  componentDidMount() {
    this.refreshTable();
    this.getAlcNum();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.job.data
    });
  }

  refreshTable = () => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    dispatch({
      type: 'job/query',
      payload: pageFilter,
      callback: (response) => {
        if (response && response.success) {
          this.setState({
            listData: response.data.records
          })
        }
      }
    });
  };

  getAlcNum = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'job/getAlc',
      payload: {
        dcuuid: loginOrg().uuid
      },
      callback: (response) => {
        if (response && response.success) {
          this.setState({
            alcData: response.data
          })
        }
      }
    });
  };

  buildOptions = () => {
    const { alcData } = this.state;
    let options = [];
    let data = alcData;
    Array.isArray(data) && data.forEach(function (dg) {
      options.push(
        <Select.Option key={dg.jobId} value={dg.jobId}>
          {dg.jobId}
        </Select.Option>
      );
    });
    this.setState({
      alcNumData: options
    })
  }

  startWork = value => {
    const { data } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'job/startJob',
      payload: value,
      callback: (response) => {
        if (response && response.success) {
          if (Array.isArray(data)) {
            for (const item of data) {
              if (item.jobpoint.uuid === value.alcjob) {
                item.alcjob = value.alcjob;
                break;
              }
            }
          }
          this.refreshTable();
          this.setState({
            startModalVisible: false
          });
        }
      }
    });
  }

  endWork = (jobpointuuid) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'job/endJob',
      payload: {
        uuid: jobpointuuid
      },
      callback: (response) => {
        if (response && response.success) {
          this.refreshTable();
        }
      }
    });
  }

  /**
   * 控制器新增编辑弹窗显示控制
   */
  handleCreateModalVisible = (flag, startAlc) => {
    this.buildOptions();
    this.setState({
      startModalVisible: !!flag,
      startAlcNumObj: {
        ...startAlc
      }
    });
  };

  drawOtherCom = () => {
    const { startModalVisible, alcData, startAlcNumObj, alcNumData
    } = this.state;
    const startParentMethods = {
      entity: alcData,
      handleSave: this.startWork,
      alcNumData:alcNumData,
      handleCreateModalVisible: this.handleCreateModalVisible,
    };
    return (
      <div>
        <AlcNumModal
          {...startParentMethods}
          startModalVisible={startModalVisible}
          confirmLoading={this.props.loading}
          startAlcNumObj = {startAlcNumObj}
        />
      </div>
    )
  }

  columns = [
    {
      title: jobLocale.codeLocale,
      dataIndex: 'jobpoint.code',
      width: colWidth.codeColWidth
    },
    {
      title: jobLocale.nameLocale,
      dataIndex: 'jobpoint.name',
      width: colWidth.codeColWidth,
    },
    {
      title: jobLocale.alcNum,
      dataIndex: 'alcjob',
      width: itemColWidth.articleColWidth,
      render:val=>val?val:<Empty/>
      // render: (text, record) => (
      //   <span>
      //     <Select style={{width:'100'}}>
      //       {this.buildOptions()}
      //     </Select>
      //   </span>
      // )
    },
    {
      title: commonLocale.operateLocale,
      width: itemColWidth.amountColWidth,
      render: (text, record) => {
        let s1 = 'primary'
        let s2 = 'default'
        if (record && record.jobState === 'STOP') {
          return <span>
            <Button
              type = {s1}
              onClick={
                () => this.handleCreateModalVisible(true, record.jobpoint)
              }
              size="small"
              style={{ width: 90, marginRight: 8 }}
            >
            {formatMessage({ id: 'start.work' })}
          </Button>
            <Button
              type={s2}
              size="small"
              style={{ width: 90, marginRight: 8 }}
              disabled
            >
              {formatMessage({ id: 'end.work' })}
            </Button>
          </span>
        }
        if(record && record.jobState === 'START') {
          return <span>
            <Button
              type = {s2}
              size="small"
              style={{ width: 90, marginRight: 8 }}
              disabled
            >
            {formatMessage({ id: 'start.work' })}
          </Button>
            <Button
              type={s1}
              onClick={
                () => this.endWork(record.jobpoint.uuid)
              }
              size="small"
              style={{ width: 90, marginRight: 8 }}
            >
              {formatMessage({ id: 'end.work' })}
            </Button>
          </span>
        }

      }

    },
  ];
}
