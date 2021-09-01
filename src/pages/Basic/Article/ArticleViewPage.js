import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import { Tabs, Button, message, Spin } from 'antd';
import { connect } from 'dva';
import { Fragment } from 'react';
import { formatMessage } from 'umi/locale';
import { STATE } from '@/utils/constants';
import { convertCodeName } from '@/utils/utils';
import ArticleQpcTab from './ArticleQpcTab';
import ArticleBarcodeTab from './ArticleBarcodeTab';
import ArticleVendorTab from './ArticleVendorTab';
import StorePickQtyTab from './StorePickQtyTab';
import { havePermission } from '@/utils/authority';
import {
  RESOURCE_IWMS_BASIC_ARTICLE_EDIT,
  RESOURCE_IWMS_BASIC_ARTICLE_ONLINE,
} from './Permission';
import { loginOrg } from '@/utils/LoginContext';
import ArticleBusinessForm from './ArticleBusinessForm';
import { articleLocale } from './ArticleLocale';
import { commonLocale } from '@/utils/CommonLocale';
import { SHELFLIFE_TYPE, PUTAWAY_BIN, WEIGHT_SORT, MixArticle, PRICE_TYPE } from './Constants';
import { orgType } from '@/utils/OrgType';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';
import { OWNER_RES } from '@/pages/Basic/Owner/OwnerPermission';
import { CATEGORY_RES } from '@/pages/Basic/Category/CategoryPermission';
import { routerRedux } from 'dva/router';
import Empty from '@/pages/Component/Form/Empty';
import { sourceWay } from '@/utils/SourceWay';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';
const TabPane = Tabs.TabPane;
@connect(({ article, loading }) => ({
  article,
  loading: loading.models.article,
}))
export default class ArticleViewPage extends ViewPage {
  constructor(props) {
    super(props);

    this.state = {
      title: articleLocale.title,
      qpcs: [],
      vendors: [],
      barcodes: [],
      storePickQtys: [],
      articleBusiness: {
        processe: false
      },
      pickSchema: {},
      disabledChangeState: loginOrg().type !== orgType.company.name || !havePermission(RESOURCE_IWMS_BASIC_ARTICLE_ONLINE),
      showArticleBusinessForm: false,
      articleBusinessLoading: false,
      pickSchemaLoading: false,
      entityCode: props.article.entityCode,
      entityUuid: props.article.entityUuid,
    }
  }

  componentDidMount() {
    this.refresh(this.state.entityCode, this.state.entityUuid);
  }

  componentWillReceiveProps(nextProps) {
    const article = nextProps.article.entity;
    if (article && (article.code === this.state.entityCode || article.uuid === this.state.entityUuid)) {
      this.setState({
        title: convertCodeName(article),
        entityState: article.state,
        entityUuid: article.uuid,
        entityCode: article.code,
        qpcs: article.qpcs,
        vendors: article.vendors,
        barcodes: article.barcodes,
        storePickQtys: article.storePickQtys,
        entity: article
      });
    }
    const nextEntityUuid = nextProps.entityUuid;
    // 当本次传入的entityCode与当前状态中的code不一致时，重新查询渲染
    if (nextEntityUuid && nextEntityUuid !== this.state.entityUuid) {
      this.setState({
        entityUuid: nextEntityUuid
      });
      this.refresh(undefined, nextEntityUuid);
    }
  }

  refresh = (entityCode, entityUuid) => {
    const { dispatch } = this.props;
    if (!entityCode && !entityUuid) {
      entityCode = this.state.entityCode;
    }

    if (entityCode) {
      dispatch({
        type: 'article/getByCode',
        payload: {
          code: entityCode
        },
        callback: response => {
          // 当查询实体结果为空时，给出错误信息，返回列表页
          if (!response || !response.data || !response.data.uuid) {
            message.error("指定的商品不存在！");
            this.onCancel();
          } else {
            this.setState({
              entityCode: response.data.code,
            });
            if (loginOrg().type === orgType.dc.name) {
              this.fetchArticleBusiness(response.data.uuid);
              this.fetchPickSchema(response.data.uuid);
            }
          }
        }
      });
      return;
    }

    if (entityUuid) {
      dispatch({
        type: 'article/get',
        payload: {
          uuid: entityUuid ? entityUuid : this.state.entityUuid,
        },
        callback: response => {
          // 当查询实体结果为空时，给出错误信息，返回列表页
          if (!response || !response.data || !response.data.uuid) {
            message.error("指定的商品不存在！");
            this.onCancel();
          } else {
            this.setState({
              entityCode: response.data.code,
            });
          }
        }
      });
      if (loginOrg().type === orgType.dc.name) {
        this.fetchArticleBusiness(entityUuid);
        this.fetchPickSchema(entityUuid);
      }
    }
    // if (loginOrg().type === orgType.dc.name) {
    //   this.fetchArticleBusiness();
    //   this.fetchPickSchema();
    // }
  }

  fetchArticleBusiness = (uuid) => {
    this.setState({
      articleBusinessLoading: true
    })

    // 获取商品业务信息
    this.props.dispatch({
      type: 'articleBusiness/getByDcUuidAndArticleUuid',
      payload: {
        articleUuid: uuid ? uuid : this.state.entityUuid
      },
      callback: response => {
        if (response && response.success) {
          let data = response.data;
          this.setState({
            articleBusiness: data,
          });
        }
        this.setState({
          articleBusinessLoading: false
        })
      }
    });
  }

  fetchPickSchema = (uuid) => {
    this.setState({
      pickSchemaLoading: true
    })

    // 获取拣货信息
    this.props.dispatch({
      type: 'pickSchema/getByDcUuidAndArticleUuid',
      payload: {
        articleUuid: uuid ? uuid : this.state.entityUuid
      },
      callback: response => {
        if (response && response.success) {
          let data = response.data;
          this.setState({
            pickSchema: data,
          });
        }

        this.setState({
          pickSchemaLoading: false
        })
      }
    });
  }

  onCancel = () => {
    this.props.dispatch({
      type: 'article/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }

  onChangeState = () => {
    const article = this.props.article.entity;
    if (article.state === STATE.ONLINE) {
      this.props.dispatch({
        type: 'article/offline',
        payload: {
          uuid: article.uuid,
          version: article.version
        },
        callback: response => {
          if (response && response.success) {
            this.refresh(this.state.entityCode, this.state.entityUuid);
          }
        }
      });
    } else {
      this.props.dispatch({
        type: 'article/online',
        payload: {
          uuid: article.uuid,
          version: article.version
        },
        callback: response => {
          if (response && response.success) {
            this.refresh(this.state.entityCode, this.state.entityUuid);
          }
        }
      });
    }
  }

  /**
   * 跳转到类别详情页面
   */
  onCategoryView = (category) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/category',
      payload: {
        showPage: 'view',
        entityUuid: category.uuid,
      }
    }));
  }

  drawActionButtion = () => {
    return (
      <Fragment>
        <Button onClick={this.onCancel}>
          {commonLocale.backLocale}
        </Button>
        {loginOrg().type === orgType.company.name &&
          <Button disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_EDIT)}
            type="primary"
            onClick={this.onEditBasicInfo}>
            {commonLocale.editLocale}
          </Button>
        }
      </Fragment>
    );
  }

  onEditBasicInfo = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'article/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.props.article.entity.uuid,
      }
    });
  }

  onArticleBusinessEdit = () => {
    this.switchArticleBusinessView(true);
  }

  switchArticleBusinessView = (flag) => {
    this.setState({
      showArticleBusinessForm: !!flag
    })
  }

  drawArticleInfoTab = () => {
    const article = this.props.article.entity;
    const {
      articleBusiness,
      pickSchema,
      showArticleBusinessForm,
      articleBusinessLoading,
      pickSchemaLoading
    } = this.state;

    if (!article)
      return;
    let basicItems = [{
      label: commonLocale.codeLocale,
      value: article.code
    }, {
      label: commonLocale.nameLocale,
      value: article.name
    }, {
      label: commonLocale.shortNameLocale,
      value: article.shortName
    }, {
      label: articleLocale.articleOwner,
      value: <a onClick={this.onViewOwner.bind(this, article.owner ? article.owner.uuid : undefined)}
        disabled={!havePermission(OWNER_RES.VIEW)}>{convertCodeName(article.owner)}</a>
    }, {
      label: articleLocale.articleSpec,
      value: article.spec
    }, {
      label: articleLocale.articleCategory,
      value: <a onClick={this.onCategoryView.bind(this, article.category)}
        disabled={!havePermission(CATEGORY_RES.VIEW)}>{convertCodeName(article.category)}</a>
    }, {
      label: articleLocale.articleBarcode,
      value: article.barcode
    }, {
      label: articleLocale.articleDefaultVendor,
      value: <a onClick={this.onViewVendor.bind(this, article.defaultVendor ? article.defaultVendor.uuid : undefined)}
        disabled={!havePermission(VENDOR_RES.VIEW)}>{convertCodeName(article.defaultVendor)}</a>
    }, {
      label: articleLocale.articlePurchasePrice,
      value: article.purchasePrice
    }, {
      label: articleLocale.articleSalePrice,
      value: article.salePrice
    }, {
      label: articleLocale.articleOrigin,
      value: article.origin
    }, {
      label: articleLocale.articleGroupName,
      value: article.groupName
    }, {
      label: articleLocale.manageBatch,
      value: article.manageBatch ? '是' : '否'
    }, {
      label: commonLocale.noteLocale,
      value: article.note
    }];
    if(loginOrg().type == orgType.dispatchCenter.name){
      basicItems = [
        {
          label: commonLocale.codeLocale,
          value: article.code
        }, {
          label: commonLocale.nameLocale,
          value: article.name
        }, {
          label: commonLocale.shortNameLocale,
          value: article.shortName
        }, {
          label: articleLocale.articleOwner,
          value: <a onClick={this.onViewOwner.bind(this, article.owner ? article.owner.uuid : undefined)}
            disabled={!havePermission(OWNER_RES.VIEW)}>{convertCodeName(article.owner)}</a>
        }, {
          label: articleLocale.articleSpec,
          value: article.spec
        },{
          label: articleLocale.articleDefaultVendor,
          value: <a onClick={this.onViewVendor.bind(this, article.defaultVendor ? article.defaultVendor.uuid : undefined)}
            disabled={!havePermission(VENDOR_RES.VIEW)}>{convertCodeName(article.defaultVendor)}</a>
        }, {
          label: articleLocale.articleBarcode,
          value: article.barcode
        }, {
          label: '来源方式',
          value: article.sourceWay?sourceWay[article.sourceWay].caption:<Empty/>,
        },
        {
          label: commonLocale.noteLocale,
          value: article.note
        }
      ]
    }
    let shelfLifeItems = [{
      label: articleLocale.articleShelfLifeType,
      value: SHELFLIFE_TYPE[article.shelfLifeType]
    }, {
      label: articleLocale.articleShelfLifeDays,
      value: article.shelfLifeDays
    }, {
      label: articleLocale.articleReceiveControlDays,
      value: article.receiveControlDays
    }, {
      label: articleLocale.articleDeliveryControlDays,
      value: article.deliveryControlDays
    }, {
      label: articleLocale.articleReturnControlDays,
      value: article.returnControlDays
    }]

    let businessItems = [{
      label: articleLocale.articleBusinessPutawayBin,
      value: articleBusiness && PUTAWAY_BIN[articleBusiness.putawayBin]
    }, {
      label: articleLocale.articleBusinessUnLoadAdvice,
      value: articleBusiness && articleBusiness.unLoadAdvice
    }, {
      label: articleLocale.pickSchemaCaseBin,
      value: pickSchema && pickSchema.caseBinCode
    }, {
      label: articleLocale.pickSchemaSplitBin,
      value: pickSchema && pickSchema.splitBinCode
    }, {
      label: articleLocale.articleBusinessProcess,
      value: articleBusiness && articleBusiness.processe ? '是' : '否'
    }, {
      label: articleLocale.articleBusinessWeightSort,
      value: articleBusiness && WEIGHT_SORT[articleBusiness.weightSort]
    }, {
      label: articleLocale.setPickBin,
      value: articleBusiness && articleBusiness.pickBin ? '是' : '否'
    },{
      label: articleLocale.newArticle,
      value: articleBusiness && articleBusiness.newArticle ? '是' : '否'
    },{
      label: articleLocale.pickQpcStr,
      value: articleBusiness && articleBusiness.pickQpcStr ?  articleBusiness.pickQpcStr:<Empty/>
    }, {
      label:  articleLocale.mixArticle,
      value: articleBusiness.mixArticle?MixArticle[articleBusiness.mixArticle].caption:<Empty/>
    }
  ]

    return (
      <TabPane key="basicInfo" tab={articleLocale.tabBasicInfo}>
        <ViewTabPanel withoutTable={true} style={{marginTop: '-22px'}}>
        <ViewPanel items={basicItems} title={articleLocale.panelBasic} />
        {loginOrg().type != orgType.dispatchCenter.name &&<ViewPanel items={shelfLifeItems} title={articleLocale.panelShelfLife} />}
        {loginOrg().type === orgType.dc.name &&
          <Spin indicator={LoadingIcon('default')} tip="加载中..." spinning={articleBusinessLoading || pickSchemaLoading}>
            <ViewPanel onEdit={!showArticleBusinessForm && this.onArticleBusinessEdit}
              items={businessItems} title={articleLocale.panelBusiness} >
              {showArticleBusinessForm &&
                (
                  <ArticleBusinessForm
                    articleBusiness={articleBusiness}
                    pickSchema={pickSchema}
                    switchArticleBusinessView={this.switchArticleBusinessView}
                    dispatch={this.props.dispatch}
                    article={article}
                    refresh={this.refresh}
                  />
                )
              }
            </ViewPanel>
          </Spin>
        }
        </ViewTabPanel>
      </TabPane>
    );
  }

  drawQpcInfoTab = () => {
    return (
      <TabPane key="qpc" tab={articleLocale.tabQpc}>
        <ViewTabPanel withoutTable={true} style={{marginTop:'-20px'}}>
          <ArticleQpcTab
            data={this.state.qpcs}
            article={this.state.entity}
            dispatch={this.props.dispatch}
            refresh={this.refresh}
          />
        </ViewTabPanel>
      </TabPane>
    );
  }

  drawBarcodeInfoTab = () => {
    return (
      <TabPane key="barcode" tab={articleLocale.tabBarcode}>
        <ViewTabPanel withoutTable={true}>
          <ArticleBarcodeTab
            data={this.state.barcodes}
            article={this.state.entity}
            dispatch={this.props.dispatch}
          />
        </ViewTabPanel>
      </TabPane>
    )
  }

  drawVendorInfoTab = () => {
    return (
      <TabPane key="vendor" tab={articleLocale.tabVendor}>
        <ViewTabPanel withoutTable={true} style={{marginTop:'-23px'}}>
          <ArticleVendorTab
            data={this.state.vendors}
            article={this.state.entity}
            dispatch={this.props.dispatch}
            refresh={this.refresh}
          />
      </ViewTabPanel>
      </TabPane>
    )
  }

  drawStorePickQtyInfoTab = () => {
    return (
      <TabPane key="storePickQpc" tab={articleLocale.tabStorePickQpc}>
        <ViewTabPanel withoutTable={true}>
          <StorePickQtyTab
            data={this.state.storePickQtys}
            dispatch={this.props.dispatch}
            article={this.state.entity}
          />
        </ViewTabPanel>
      </TabPane>
    )
  }

  drawTabPanes = () => {
    let tabPanes = [
      this.drawArticleInfoTab(),
      this.drawQpcInfoTab(),
      this.drawBarcodeInfoTab(),
      this.drawVendorInfoTab(),
      this.drawStorePickQtyInfoTab(),
    ];

    if(loginOrg().type ==='DISPATCH_CENTER'){
      tabPanes = [
        this.drawArticleInfoTab(),
        this.drawQpcInfoTab(),
        this.drawBarcodeInfoTab(),
      ];
    }

    return tabPanes;
  }
}
