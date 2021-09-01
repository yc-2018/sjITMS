import { PureComponent,Component } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Spin ,Empty} from 'antd';
import { connect } from 'dva';
// import Page from '@/components/MyComponent/Page';
import { loginUser, loginCompany, loginOrg } from '@/utils/LoginContext';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import emptySvg from '@/assets/common/img_empoty.svg';

@connect(({ report, loading }) => ({
  report,
  loading: loading.models.report
}))
class ReportPage extends Component {
  state = {
    height: document.documentElement.scrollHeight,
    loading:true
  }

  onLoad=()=>{
    this.setState({
      loading:false
    })
  }

  render() {
    let reportUrl = this.props.url;
    if(reportUrl){
      reportUrl = reportUrl + '&userUuid=' + loginUser().uuid + '&userCode=' + loginUser().code + '&userName=' + loginUser().name
      + '&dcUuid=' + loginOrg().uuid + '&dcCode=' + loginOrg().code + '&dcName=' + loginOrg().name
      + '&companyUuid=' + loginCompany().uuid + '&companyCode=' + loginCompany().code + '&companyName=' + loginCompany().name;
    }

    return (
      <PageHeaderWrapper>
        <Spin indicator={LoadingIcon('default')} delay={5} spinning={reportUrl ? this.props.loading || this.state.loading :false}>
        {
          reportUrl ? <iframe id='report' style={{height: 'calc(100vh - 120px)'}} width="100%" src={reportUrl}
            height={this.state.height + 'px'}
            scrolling="no"
            frameBorder="0"
            onLoad={this.onLoad}
          /> : <Empty
          image={emptySvg}
          style={{ position: 'absolute', top: '30%', left: '45%' }}
          description={
            <span>
              暂无数据，请刷新重试
            </span>
          }
        ></Empty>
        }
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default ReportPage;
