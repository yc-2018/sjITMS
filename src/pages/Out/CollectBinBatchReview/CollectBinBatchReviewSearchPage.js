import { connect } from 'dva';
import { Button, message, Form } from 'antd';
import NestSearchPage from '@/pages/Component/Page/NestSearchPage';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import CollectBinBatchReviewSearchForm from './CollectBinBatchReviewSearchForm';
import { colWidth } from '@/utils/ColWidth';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { collectBinBatchReviewLocale } from './CollectBinBatchReviewLocale';

const FormItem = Form.Item;
@connect(({ collectBinBatchReview, loading }) => ({
  collectBinBatchReview,
  loading: loading.models.collectBinBatchReview,
}))
@Form.create()
export default class CollectBinBatchReviewSearchPage extends NestSearchPage {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: collectBinBatchReviewLocale.title,
            data: props.collectBinBatchReview.data,
            key: 'collectBinBatchReview.search.table',
            // scroll:'auto'
        };
        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    }

    componentDidMount() {
        this.refreshTable();
    }

    componentWillReceiveProps(nextProps) {
       
      if(nextProps.collectBinBatchReview.data&&nextProps.collectBinBatchReview.data!=this.props.collectBinBatchReview.data){
        nextProps.collectBinBatchReview.data.list&&Array.isArray(nextProps.collectBinBatchReview.data.list)&&nextProps.collectBinBatchReview.data.list.forEach(info=>{
          if(info.exceptionInformation){
            info.disabled = true;
          } 
        })
        var data= JSON.parse(JSON.stringify(nextProps.collectBinBatchReview.data).replace(/toReviewItems/g,"list"));
        this.setState({
            data: data
        });
      }
    }
    onSearch = (data) => {
        const { pageFilter } = this.state;
        pageFilter.page = 0;
        // let dockGroupUuid = '';
        let serialArchLineUuid = '';
        if (data) {
            // if (data.dockGroup&data.dockGroup!='') {
            //   dockGroupUuid = JSON.parse(data.dockGroup).uuid
            // }
            if (data.serialArchLine) {
              serialArchLineUuid = JSON.parse(data.serialArchLine).uuid
            }

            pageFilter.searchKeyValues = {
                ...pageFilter.searchKeyValues,
                ...data,
                // dockGroupUuid:dockGroupUuid,
                serialArchLineUuid:serialArchLineUuid,
            }
        } else {
            pageFilter.searchKeyValues = {
                companyUuid: loginCompany().uuid,
                dcUuid: loginOrg().uuid
            }
        }
        this.refreshTable();
    }

    refreshTable = (filter) => {
      if (!filter || !filter.changePage) {
        this.setState({
          selectedRows: [],
        });
      }
      const { dispatch } = this.props;
      const { pageFilter } = this.state;

      

      let queryFilter = { ...pageFilter };
      if (filter) {
          queryFilter = { ...pageFilter, ...filter };
      }

      dispatch({
          type: 'collectBinBatchReview/queryStoreInfos',
          payload: queryFilter,
        callback:response=>{
          if(response && response.success && response.data && response.data.records){
            let dataInfo = {
              list: response.data.records ? response.data.records : [],
              pagination: {
                total: response.data.paging.recordCount,
                pageSize: response.data.paging.pageSize,
                current: response.data.page + 1,
                showTotal: total => `共 ${total} 条`,
              }
            };
           let data = JSON.parse(JSON.stringify(dataInfo).replace(/toReviewItems/g,"list"));
            this.setState({
              data: data,
              scroll:'auto'
            });

          } else {
            this.setState({
              data: {
                list: [],
                pagination: {}
              },
              scroll: undefined
            })
          }
        }
      });
    };

    drawSearchPanel = () => {
        return <CollectBinBatchReviewSearchForm filterValue={this.state.pageFilter.searchKeyValues}
            refresh={this.onSearch} toggleCallback={this.toggleCallback}/>;
    }

    drawToolbarPanel = () => {
      const { selectedRows } = this.state;
  
      const batchPrintParams = [];
      selectedRows.forEach(function (e) {
        batchPrintParams.push({
          billNumber: e.billNumber
        })
      });
      return [
        <Button key='onReview'
          // disabled={!havePermission(ALCNTC_RES.COPY)}
          onClick={() => this.onBatchReview()}
        >
          {collectBinBatchReviewLocale.batchReview}
        </Button>,
      ];
    }

    handleCancel() {
        this.props.form.resetFields();
        this.refreshTable();
    }

    nestColumns = [
      {
        title: commonLocale.lineLocal,
        width: 100,
        render:(text,record,index)=>`${index+1}`

      },
      {
          title: collectBinBatchReviewLocale.reviewItem,
          dataIndex: 'reviewItem',
          width: 200,
          render:val=>val?(val.name=='整箱数'?val.name:convertCodeName(val)):<Empty/>
      },
      {
        title: collectBinBatchReviewLocale.toReviewQtyStr,
        dataIndex: 'toReviewQtyStr',
        width: colWidth.billNumberColWidth,
      },
    ];

    columns = [
      {
          title: '波次'+commonLocale.billNumberLocal,
          dataIndex: 'waveBillNumber',
          sorter: true,
          width: colWidth.billNumberColWidth,
      },
      {
        title: collectBinBatchReviewLocale.serialArchLine,
        dataIndex: 'serialArchLines',
        width: colWidth.codeNameColWidth,
        render:val=>{
          if(val){
            let value = '';
            val.forEach((item,index)=>{
              if(index==val.length-1){
                value += convertCodeName(item);
              }else{
                value += convertCodeName(item)+'；';
              }
            });
            return <EllipsisCol  colValue={value}/>
          }else{
            return <Empty/>;
          }
        }
      },
      {
        title: commonLocale.inStoreLocale,
        dataIndex: 'store',
        sorter: true,
        width: colWidth.codeNameColWidth,
        render:val=>val?convertCodeName(val):<Empty/>
      },
      // {
      //   title: collectBinBatchReviewLocale.dockGroup,
      //   dataIndex: 'dockGroup',
      //   width: colWidth.codeNameColWidth,
      //   render:val=>val?convertCodeName(val):<Empty/>
      // },
      
    ];
  
 
  /**
   * 批量复核
   */
  onBatchReview = () => {
    const { selectedRows } = this.state;

    let data = [];
    if (Array.isArray(selectedRows) && selectedRows.length === 0) {
      message.warn('请勾选，再进行批量操作');
      return;
    }
    selectedRows.forEach(row=>{
        data.push({
            dcUuid: loginOrg().uuid,
            companyUuid: loginCompany().uuid,
            // dockGroup:row.dockGroup,
            storeCode: row.store.code,
            waveBillNumber: row.waveBillNumber
        });
    })
    if(data.length>0){
      this.props.dispatch({
        type: 'collectBinBatchReview/batchReview',
        payload: data,
        callback:response=>{
          if(response&&response.success){
            this.refreshTable();
            message.success(commonLocale.batchReviewSuccessLocale)
          }
        }
      })
    }
  }

}
