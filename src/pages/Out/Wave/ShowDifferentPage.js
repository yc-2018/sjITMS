import { connect } from 'dva';
import { PureComponent } from "react";
import moment from 'moment';
import { Table, Drawer, Input, Button, Icon, InputNumber } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, getDefOwner } from '@/utils/LoginContext';
import { formatMessage } from 'umi/locale';
import { convertCodeName } from '@/utils/utils';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import Empty from '@/pages/Component/Form/Empty';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import { waveBillLocale } from '@/pages/Out/Wave/WaveBillLocale';

@connect(({ wave, loading }) => ({
  wave,
  loading: loading.models.wave,
}))
export default class ItemBatchAddModal extends PureComponent {
  state = {
    waveAlcntcInfos: [],
  }

  componentDidMount() {
    if (this.props.visible) {
      this.queryWaveDifference();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.wave) {
      this.setState({
        waveAlcntcInfos: nextProps.wave.waveAlcntcInfos ? nextProps.wave.waveAlcntcInfos : []
      });
    }
  }
  /**
   * 查询差异结果
   */
  queryWaveDifference = (dataIndex) => {
    const { pageFilter } = this.state
    const { dispatch } = this.props;
    let payload = {
      waveBillUuid: this.props.waveBillUuid,
      articleCode: '',
      fillRate: ''
    }

    if (dataIndex) {
      payload[`${dataIndex}`] = this.state[`searchText${dataIndex}`] ? this.state[`searchText${dataIndex}`] : ''
    }

    dispatch({
      type: 'wave/queryWaveDifference',
      payload: { ...payload }
    });
  }

  /**
   * 控制弹出框展示
   */
  handleDifferentPageVisible = () => {
    this.setState({
      waveAlcntcInfos: [],
    });
    this.props.handleDifferentPageVisible();
  }

  /**
   * 设置条件
   *  */
  setText = (dataIndex, text) => {
    this.setState({
      [`searchText${dataIndex}`]: text
    })
  };

  /**
   * 搜索 
   * */
  handleSearch = (dataIndex, confirm) => {
    this.queryWaveDifference(dataIndex);
    confirm();
  };

  /**
   * 重置
   */
  handleReset = (dataIndex, clearFilters) => {
    this.setState({
      [`searchText${dataIndex}`]: ''
    });
    clearFilters();
    this.queryWaveDifference();
  };

  /**
   * 绘制表格列条件查询
   */
  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        {dataIndex == 'articleCode' ? <Input
          placeholder={dataIndex === 'articleCode' ? '请输入商品' : '请输入满足率'}
          value={this.state[`searchText${dataIndex}`]}
          onChange={e => this.setText(dataIndex, e.target.value ? e.target.value : undefined)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        /> : <InputNumber
          placeholder={dataIndex === 'articleCode' ? '请输入商品' : '请输入满足率'}
          value={this.state[`searchText${dataIndex}`]}
          onChange={e => this.setText(dataIndex, e)}
          min={0}
          max={100}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />}
        <Button
          type="primary"
          onClick={
            () => this.handleSearch(dataIndex, confirm)
          }
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          {formatMessage({ id: 'company.index.search.button.search' })}
        </Button>
        <Button onClick={() => this.handleReset(dataIndex, clearFilters)} size="small" style={{ width: 90 }}>
          {formatMessage({ id: 'company.index.search.button.reset' })}
        </Button>
      </div>
    ),
    filterIcon: () => (
      <Icon type="search" style={{ color: this.state[`searchText${dataIndex}`] ? '#1890ff' : undefined }} />
    ),
    render: val => convertCodeName(val),
  });

  render() {
    const { waveAlcntcInfos } = this.state;
    const { loading } = this.props;

    const tableLoading = {
      spinning: loading,
      indicator: LoadingIcon('default')
    }

    let waveAlcntcCols = [
      {
        title: commonLocale.inArticleLocale,
        dataIndex: 'article',
        key: 'article',
        width: colWidth.codeNameColWidth,
        ...this.getColumnSearchProps('articleCode'),
        render: text => <EllipsisCol colValue={convertCodeName(text)} />,
      },
      {
        title: commonLocale.inWrhLocale,
        dataIndex: 'wrh',
        key: 'wrh',
        width: colWidth.codeNameColWidth - 20,
        render: text => <EllipsisCol colValue={convertCodeName(text)} />
      },
      {
        title: waveBillLocale.qty,
        dataIndex: 'qty',
        key: 'qty',
        width: itemColWidth.qtyColWidth + 10,
      },
      {
        title: waveBillLocale.planQty,
        dataIndex: 'planQty',
        key: 'planQty',
        width: itemColWidth.qtyColWidth + 80,
      },
      {
        title: waveBillLocale.stockQty,
        dataIndex: 'stockQty',
        key: 'stockQty',
        width: itemColWidth.qtyColWidth + 60,
      },
      {
        title: waveBillLocale.fillRate,
        dataIndex: 'fillRate',
        key: 'fillRate',
        width: itemColWidth.qtyColWidth + 50,
        ...this.getColumnSearchProps('fillRate'),
        render: val => (val * 100).toFixed(2),
      },
      {
        title: waveBillLocale.message,
        dataIndex: 'message',
        key: 'message',
        width: itemColWidth.noteEditColWidth + 50,
        render: val => val ? <EllipsisCol colValue={val} /> : <Empty />,
      }
    ];

    waveAlcntcCols.forEach(e => {
      if (e.width) {
        e.onCell = () => {
          return {
            style: {
              maxWidth: e.width,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }
          }
        }
      }
    });

    return (
      <Drawer
        title="查看差异"
        placement="right"
        closable={false}
        onClose={this.handleDifferentPageVisible}
        visible={this.props.visible}
        width='72%'
      >
        <Table
          rowKey={record => record.uuid}
          dataSource={waveAlcntcInfos}
          columns={waveAlcntcCols}
          loading={tableLoading}
        />
      </Drawer>
    );
  }
}