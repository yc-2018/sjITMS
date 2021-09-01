import { connect } from 'dva';
import { Form, Input, Select, InputNumber, message, Tooltip, Icon } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import CreatePage from './CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import BinSelect from '@/pages/Component/Select/BinSelect';
import ContainerTypeSelect from '@/pages/Component/Select/ContainerTypeSelect';

import {
  PickType, RplType, PickMethod, WholePickMethod, PickMode,
  RplStep, RplMode, RplMethod, RplMethodExtend, BasicIf,
  getRplModeOptions, getRplStepOptions, getRplTypeOptions, getRplMethodOptions, getRplMethodExtendOptions,
} from './PickAreaContants';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { binUsage } from '@/utils/BinUsage';
import { binState } from '@/utils/BinState';
import { pickAreaLocale } from './PickAreaLocale';
import { codePattern, binScopePattern } from '@/utils/PatternContants';
import { func } from 'prop-types';

const Option = Select.Option;
const { TextArea } = Input;

const pickTypeOptions = [];
Object.keys(PickType).forEach(function (key) {
  pickTypeOptions.push(<Option value={PickType[key].name} key={PickType[key].name}>{PickType[key].caption}</Option>);
});

const pickMethodOptions = [];
Object.keys(PickMethod).forEach(function (key) {
  pickMethodOptions.push(<Option value={PickMethod[key].name} key={PickMethod[key].name}>{PickMethod[key].caption}</Option>);
});

const wholePickMethodOptions = [];
Object.keys(WholePickMethod).forEach(function (key) {
  wholePickMethodOptions.push(<Option value={WholePickMethod[key].name} key={WholePickMethod[key].name}>{WholePickMethod[key].caption}</Option>);
});

const pickModeOptions = [];
Object.keys(PickMode).forEach(function (key) {
  pickModeOptions.push(<Option value={PickMode[key].name} key={PickMode[key].name}>{PickMode[key].caption}</Option>);
});
const basicIfOptions = [];
Object.keys(BasicIf).forEach(function (key) {
  basicIfOptions.push(<Option value={BasicIf[key].name} key={BasicIf[key].name}>{BasicIf[key].caption}</Option>);
});
const everRpl = [];
everRpl.push(<Option value={true} key={true}>{'是'}</Option>);
everRpl.push(<Option value={false} key={false}>{'否'}</Option>);
var rplModeOptions = [];
rplModeOptions.push(getRplModeOptions());
const rplStepOptions = [];
const rplTypeOptions = [];
const rplMethodOptions = [];
const rplMethodExtendOptions = [];

@connect(({ pickArea, loading }) => ({
  pickArea,
  loading: loading.models.pickArea,
}))
@Form.create()
export default class pickAreaCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {//设置初始值
      title: commonLocale.createLocale + pickAreaLocale.title,
      noNote: true,
      entity: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        wholeContainer: true,
        directCollect: true,
        targetStock: false,
        pickConfigs: [{
          pickType: PickType.CASEANDSPLIT.name,
          key: PickType.CASEANDSPLIT.name,
          maxVolume: 0,
          lastVolumeRate: 0,
          maxArticleCount: 0,
          directCollect: true,
        }],
      },
      configType: PickType.CASEANDSPLIT.name,
      spinning: false,
      wholePickMethodRequired: true,
      wholeContainerValue: true,
      // 控制拣货面板容器类型动态展示
      containerTypeCASE: false,
      containerTypeSPLIT: false,
      containerTypeCASEANDSPLIT: false,
      // 控制拣货面板拣货暂存位动态展示
      pickTempBinRequiredCASE: false,
      pickTempBinRequiredSPLIT: false,
      pickTempBinRequiredCASEANDSPLIT: false,
      pickTempBinRequired: false,
      // 控制拣货面板统配集货暂存位动态展示
      unifyCollectTempBinRequiredCASE: false,
      unifyCollectTempBinRequiredSPLIT: false,
      unifyCollectTempBinRequiredCASEANDSPLIT: false,
      unifyCollectTempBinRequired: false,
      //控制分拨中转位动态展示
      allocateTransferBinRequiredCASE: false,
      allocateTransferBinRequiredSPLIT: false,
      allocateTransferBinRequiredCASEANDSPLIT: false,
      allocateTransferBinRequired: false,
      basicUnifyCollectTempBinRequired: false,
      rplTempBinRequired: false,
      rplTempBinShow: false,
      rplMethodExtendRequired: false,
      rplMethodExtendShow: false,
      tShow: false,
      index: 0,
      rplModeformValue: '',
      rplStepformValue: '',
      rplTypeformValue: '',
      rplMethodformValue: '',
      rplMethodExtendformValue: '',

    }
  }
  //--react
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.pickArea.entity && nextProps.pickArea.entityUuid && this.state.entity.uuid !== nextProps.pickArea.entity.uuid) {
      if (nextProps.pickArea.entity.directCollect === false) {
        this.setState({
          basicUnifyCollectTempBinRequired: true
        })
      } else {
        this.setState({
          basicUnifyCollectTempBinRequired: false
        })
      }
      if (nextProps.pickArea.entity.rplConfig.rplStep == RplStep.ONESTEP.name) {
        this.setState({
          rplTempBinRequired: false,
          rplTempBinShow: false,
        })
      } else {
        this.setState({
          rplTempBinRequired: true,
          rplTempBinShow: true,
        })
      }

      if (nextProps.pickArea.entity.rplConfig.rplMethod == RplMethod.HIGHANDLOW.name ||
        nextProps.pickArea.entity.rplConfig.rplMethod === RplMethod.RPLFULL.name) {
        this.setState({
          rplMethodExtendShow: true,
          rplMethodExtendRequired: true,
        })
      } else {
        this.setState({
          rplMethodExtendShow: false,
          rplMethodExtendRequired: false,
        })
      }

      if (nextProps.pickArea.entity.rplConfig.rplMethodExtend === RplMethodExtend.T_REPAIR.name) {
        this.setState({
          tShow: true
        })
      } else {
        this.setState({
          tShow: false
        })
      }

      if (nextProps.pickArea.entity.pickConfigs) {
        const that = this;
        nextProps.pickArea.entity.pickConfigs.forEach(function (e) {
          e.key = e.pickType;
          if (e.pickMethod == PickMethod.RFID.name) {
            that.state[`containerType${e.pickType}`] = true;
          }

          if (e.directCollect == false) {
            that.state[`unifyCollectTempBinRequired${e.pickType}`] = true;
          }

          if (e.pickMethod == PickMethod.RF.name) {
            that.state[`pickTempBinRequired${e.pickType}`] = true;
          }

          if (e.pickMode == PickMode.SOW.name) {
            that.state[`allocateTransferBinRequired${e.pickType}`] = true;
          }
        });
      }

      if (nextProps.pickArea.entity.targetStockConfig) {
        const targetStockConfig = nextProps.pickArea.entity.targetStockConfig;
        const that = this;

        if (targetStockConfig.directCollect == false) {
          that.state[`unifyCollectTempBinRequired`] = true;
        }

        if (targetStockConfig.pickMethod == PickMethod.RF.name) {
          that.state[`pickTempBinRequired`] = true;
        }

        if (targetStockConfig.pickMode == PickMode.SOW.name) {
          that.state[`allocateTransferBinRequired`] = true;
          that.state[`crossPickMethod`] = true;
        }
      }

      rplStepOptions.length = 0;
      rplTypeOptions.length = 0;
      rplMethodOptions.length = 0;
      rplMethodExtendOptions.length = 0;
      if (nextProps.pickArea.entity.rplConfig.rplMode !== RplMode.RF.name) {
        rplStepOptions.push(getRplStepOptions(['ONESTEP']));
        rplTypeOptions.push(getRplTypeOptions(['STATIC']));
      } else {
        rplStepOptions.push(getRplStepOptions(['ONESTEP', 'TWOSTEP']));
        rplTypeOptions.push(getRplTypeOptions());
      }
      if (nextProps.pickArea.entity.rplConfig.rplStep != '' && nextProps.pickArea.entity.rplConfig.rplType != '') {
        if (nextProps.pickArea.entity.rplConfig.rplMode != RplMode.RF.name || nextProps.pickArea.entity.rplConfig.rplType == RplType.STATIC.name) {
          rplMethodOptions.push(getRplMethodOptions(['ENOUGHOUT', 'RPLFULL']));
        } else if (nextProps.pickArea.entity.rplConfig.rplMode == RplMode.RF.name && nextProps.pickArea.entity.rplConfig.rplType == RplType.DYANMIC.name) {
          if (nextProps.pickArea.entity.rplConfig.rplStep == RplStep.ONESTEP.name) {
            rplMethodOptions.push(getRplMethodOptions(['WHOLE', 'HIGHANDLOW','HIGHANDLOW_WHOLE']));
          } else if (nextProps.pickArea.entity.rplConfig.rplStep == RplStep.TWOSTEP.name) {
            rplMethodOptions.push(getRplMethodOptions(['HIGHANDLOW','HIGHANDLOW_WHOLE']));
          }
        }
      }
      if (nextProps.pickArea.entity.rplConfig.rplMethod != '') {
        if (nextProps.pickArea.entity.rplConfig.rplMethod == RplMethod.HIGHANDLOW.name || nextProps.pickArea.entity.rplConfig.rplMethod == RplMethod.RPLFULL.name) {
          rplMethodExtendOptions.push(getRplMethodExtendOptions(['T_REPAIR']))
        }
      }
      this.setState({
        entity: nextProps.pickArea.entity,
        title: convertCodeName(nextProps.pickArea.entity),
        rplModeformValue: nextProps.pickArea.entity.rplConfig.rplMode,
        rplStepformValue: nextProps.pickArea.entity.rplConfig.rplStep,
        rplTypeformValue: nextProps.pickArea.entity.rplConfig.rplType,
        rplMethodformValue: nextProps.pickArea.entity.rplConfig.rplMethod,
        rplMethodExtendformValue: nextProps.pickArea.entity.rplConfig.rplMethodExtend,
      });
    }
  }

  /**
   * 查询当前一条信息
   */
  refresh = () => {
    let entityUuid = this.props.pickArea.entityUuid;
    if (entityUuid) {
      this.props.dispatch({
        type: 'pickArea/get',
        payload: entityUuid
      });
    }
  }

  /**
   * 获取form表单中的值
   */
  formValueToEntity = () => {
    const { entity, index } = this.state;
    const data = this.props.form.getFieldsValue();
    const currentValue = {
      ...entity
    };
    currentValue.code = data.code;
    currentValue.name = data.name;
    currentValue.binScope = data.binScope;
    currentValue.wholeContainer = data.wholeContainer;
    currentValue.wholePickMethod = data.wholePickMethod;
    currentValue.directCollect = data.directCollect;
    currentValue.unifyCollectTempBin = data.unifyCollectTempBin;

    currentValue.rplMode = data.rplMode;
    currentValue.rplStep = data.rplStep;
    currentValue.rplType = data.rplType;
    currentValue.rplMethod = data.rplMethod;
    currentValue.t = data.t;
    currentValue.rplMethodExtend = data.rplMethodExtend;
    currentValue.rplTempBin = data.rplTempBin;
    currentValue.targetStock = data.targetStock;

    if(this.state.entity.targetStock){
      currentValue.targetStockConfig = {};
      currentValue.targetStockConfig.pickMethod = data['pickMethod'];
      currentValue.targetStockConfig.crossPickMethod = data['crossPickMethod'];
      currentValue.targetStockConfig.pickMode = data['pickMode'];
      currentValue.targetStockConfig.maxVolume = data['maxVolume'] ? data['maxVolume'] : 0;
      currentValue.targetStockConfig.lastVolumeRate = data['lastVolumeRate'] ? data['lastVolumeRate'] : 0;
      currentValue.targetStockConfig.maxArticleCount = data['maxArticleCount'];
      currentValue.targetStockConfig.pickTempBin = data['pickTempBin'];
      currentValue.targetStockConfig.directCollect = data['directCollect'];
      currentValue.targetStockConfig.unifyCollectTempBin = data['unifyCollectTempBin'];
      currentValue.targetStockConfig.allocateTransferBin = data['allocateTransferBin'];
      currentValue.targetStockConfig.maxStoreCount = data['maxStoreCount'];
      currentValue.targetStockConfig.rpl = data['rpl'];
    }else{
      currentValue.targetStockConfig = undefined;
    }

    currentValue.pickConfigs.forEach(function (e) {
      let value = e.pickType;
      e.pickType = data[value + index + 'pickType'];
      e.pickMethod = data[value + 'pickMethod'];
      e.pickMode = data[value + 'pickMode'];
      e.containerType = data[value + 'containerType'] ? JSON.parse(data[value + 'containerType']) : undefined;
      e.maxVolume = data[value + 'maxVolume'] ? data[value + 'maxVolume'] : 0;
      e.lastVolumeRate = data[value + 'lastVolumeRate'] ? data[value + 'lastVolumeRate'] : 0;
      e.maxArticleCount = data[value + 'maxArticleCount'];
      e.pickTempBin = data[value + 'pickTempBin'];
      e.directCollect = data[value + 'directCollect'];
      e.unifyCollectTempBin = data[value + 'unifyCollectTempBin'];
      e.allocateTransferBin = data[value + 'allocateTransferBin'];
      e.maxStoreCount = data[value +'maxStoreCount'];
    });
    return currentValue;
  }
  /**
   * 更改拣货类型--展示不同面板
   */
  onChangePickType = (pickConfigs, value) => {
    const { unifyCollectTempBinRequiredCASE, unifyCollectTempBinRequiredSPLIT, unifyCollectTempBinRequiredCASEANDSPLIT } = this.state
    const currentValue = this.formValueToEntity();
    currentValue.pickConfigs.forEach(function (e) {
      if (e.key === pickConfigs.key) {
        e.pickType = value;
      }
    });
    if (value === PickType.CASEANDSPLIT.name) {
      const that = this;
      const newData = currentValue.pickConfigs.filter(item => item.pickType === 'CASEANDSPLIT');

      newData.forEach(function (e) {
        e.key = PickType.CASEANDSPLIT.name;
        if (e.directCollect == false) {
          that.setState({
            unifyCollectTempBinRequiredCASEANDSPLIT: true
          })
        } else {
          that.setState({
            unifyCollectTempBinRequiredCASEANDSPLIT: false
          })
        }

        if (e.pickMethod == PickMethod.RF.name) {
          that.setState({
            pickTempBinRequiredCASEANDSPLIT: true,
          });
        } else {
          that.setState({
            pickTempBinRequiredCASEANDSPLIT: false,
          });
        }

        if (e.pickMethod == PickMethod.RFID.name) {
          that.setState({
            containerTypeCASEANDSPLIT: true,
          })
        } else {
          that.setState({
            containerTypeCASEANDSPLIT: false,
          })
        }

        if (e.pickMode == PickMode.SOW.name) {
          that.state[`allocateTransferBinRequired${e.pickType}`] = true;
        }else {
          that.state[`allocateTransferBinRequired${e.pickType}`] = false;
        }

      });
      currentValue.pickConfigs = newData;
    } else {
      if (currentValue.pickConfigs.length == 1) {
        const that = this;
        currentValue.pickConfigs[0].key = PickType.CASE.name,
          currentValue.pickConfigs[0].pickType = PickType.CASE.name,
          currentValue.pickConfigs.push({
            pickType: PickType.SPLIT.name,
            key: PickType.SPLIT.name,
            maxVolume: 0,
            lastVolumeRate: 0,
            maxArticleCount: 0,
            directCollect: true,
          });

        currentValue.pickConfigs.forEach(function (e) {
          if (e.directCollect == false) {
            that.state[`unifyCollectTempBinRequired${e.pickType}`] = true;
          } else {
            that.state[`unifyCollectTempBinRequired${e.pickType}`] = false;
          }

          if (e.pickMethod == PickMethod.RF.name) {
            that.state[`pickTempBinRequired${e.pickType}`] = true;
          } else {
            that.state[`pickTempBinRequired${e.pickType}`] = false;
          }

          if (e.pickMethod == PickMethod.RFID.name) {
            that.state[`containerType${e.pickType}`] = true;
          } else {
            that.state[`containerType${e.pickType}`] = false;
          }

          if (e.pickMode == PickMode.SOW.name) {
            that.state[`allocateTransferBinRequired${e.pickType}`] = true;
          }else {
            that.state[`allocateTransferBinRequired${e.pickType}`] = false;
          }
        })

      } else {
        currentValue.pickConfigs[0].pickType = PickType.CASE.name;
        currentValue.pickConfigs[0].key = PickType.CASE.name;
        currentValue.pickConfigs[1].pickType = PickType.SPLIT.name;
        currentValue.pickConfigs[1].pickType = PickType.SPLIT.name;
      }
    }
    this.setState({
      entity: currentValue,
      index: this.state.index + 1
    });
  }

  /**
   * 如果拣货方式为手持终端，则拣货暂存位为必填项
   */
  toChoosePickTempBin = (value, pickType) => {
    if (value == PickMethod.RF.name) {
      this.state[`pickTempBinRequired${pickType}`] = true
    } else {
      this.state[`pickTempBinRequired${pickType}`] = false
    }

    if (value == PickMethod.RFID.name) {
      this.state[`containerType${pickType}`] = true
    } else {
      this.state[`containerType${pickType}`] = false
    }
  }

  toChooseTargetStockPickTempBin = (value) => {
    if (value == PickMethod.RF.name) {
      this.state[`pickTempBinRequired`] = true
    } else {
      this.state[`pickTempBinRequired`] = false
    }
  }

  toChooseTargetStockUnifyCollectTempBin = (value) => {
    if (value == 0) {
      this.state[`unifyCollectTempBinRequired`] = true;
    } else {
      this.state[`unifyCollectTempBinRequired`] = false;
    }
  }

  toChooseTargetStockAllocateTransferBin = (value) => {
    if (PickMode.SOW.name == value) {
      this.state[`allocateTransferBinRequired`] = true;
      this.state[`crossPickMethod`] = true;
    } else {
      this.state[`allocateTransferBinRequired`] = false;
      this.state[`crossPickMethod`] = false;

    }
  }

  /**
 * 控制整托拣货方式是否为必选项
 */
  toChoosewholePickMethod = (value) => {
    if (value == 0) {
      this.setState({
        wholeContainerValue: false,
        wholePickMethodRequired: false
      });
      this.state.entity.wholeContainer = false;
    } else {
      this.setState({
        wholeContainerValue: true,
        wholePickMethodRequired: true
      })
      this.state.entity.wholeContainer = true;
    }
  }
  /**
   * 控制整托拣对应的集货暂存位是否为空
   */
  toChooseDirectCollect = (value) => {
    if (value == 1) {
      this.setState({
        basicUnifyCollectTempBinRequired: false
      });
      this.state.entity.directCollect = true;
    } else {
      this.setState({
        basicUnifyCollectTempBinRequired: true
      });
      this.state.entity.directCollect = false;
    }
  }

  /**
   * 是否指定库存
   */
  toChooseTargetStockFlag = (value) => {
    if (value == 1) {
      this.state.entity.targetStock = true;
    } else {
      this.state.entity.targetStock = false;
    }
  }
  /**
   * 是否直接集货为否时， 统配集货暂存位为必输项
   */
  toChooseUnifyCollectTempBin = (value, pickType) => {
    if (value == 0) {
      this.state[`unifyCollectTempBinRequired${pickType}`] = true;
    } else {
      this.state[`unifyCollectTempBinRequired${pickType}`] = false;
    }
  }

  toChooseAllocateTransferBin = (value, pickType) => {
    if (PickMode.SOW.name == value) {
      this.state[`allocateTransferBinRequired${pickType}`] = true;
    } else {
      this.state[`allocateTransferBinRequired${pickType}`] = false;
    }
  }
  /**
   * 改变补货方式
   */
  changeRplMode = (value) => {
    const { rplStepformValue, rplTypeformValue, entity } = this.state
    if (entity.rplConfig && entity.rplConfig.rplType) {
      entity.rplConfig.rplType = undefined
    } else {
      this.props.form.setFieldsValue({
        rplType: undefined,
      })
    }
    if (entity.rplConfig && entity.rplConfig.rplStep) {
      entity.rplConfig.rplStep = undefined
    } else {
      this.props.form.setFieldsValue({
        rplStep: undefined,
      })
    }
    rplStepOptions.length = 0;
    rplTypeOptions.length = 0;
    rplMethodOptions.length = 0;
    if (value != '' && value !== RplMode.RF.name) {
      rplStepOptions.push(getRplStepOptions(['ONESTEP']));
      rplTypeOptions.push(getRplTypeOptions(['STATIC']));
    } else {
      rplStepOptions.push(getRplStepOptions());
      rplTypeOptions.push(getRplTypeOptions());
    }
    if (rplStepformValue != '' && rplTypeformValue != '') {
      if (value != RplMode.RF.name || rplTypeformValue == RplType.STATIC.name) {
        rplMethodOptions.push(getRplMethodOptions(['ENOUGHOUT', 'RPLFULL']));
      } else if (value == RplMode.RF.name && rplTypeformValue == RplType.DYANMIC.name) {
        if (rplStepformValue == RplStep.ONESTEP.name) {
          rplMethodOptions.push(getRplMethodOptions(['WHOLE', 'HIGHANDLOW','HIGHANDLOW_WHOLE']));
        } else if (rplStepformValue == RplStep.TWOSTEP.name) {
          rplMethodOptions.push(getRplMethodOptions(['HIGHANDLOW','HIGHANDLOW_WHOLE']));
        }
      }
    }
    this.setState({
      rplModeformValue: value
    });
  }
  /**
   * 设置state中补货步骤的值
   */
  changeRplStep = value => {
    const { rplModeformValue, rplTypeformValue } = this.state
    rplMethodOptions.length = 0;
    if (rplModeformValue != '' && rplTypeformValue != '') {
      if (rplModeformValue != RplMode.RF.name || rplTypeformValue == RplType.STATIC.name) {
        rplMethodOptions.push(getRplMethodOptions(['ENOUGHOUT', 'RPLFULL']));
      } else if (rplModeformValue == RplMode.RF.name && rplTypeformValue == RplType.DYANMIC.name) {
        if (value == RplStep.ONESTEP.name) {
          rplMethodOptions.push(getRplMethodOptions(['WHOLE', 'HIGHANDLOW','HIGHANDLOW_WHOLE']));
        } else if (value == RplStep.TWOSTEP.name) {
          rplMethodOptions.push(getRplMethodOptions(['HIGHANDLOW','HIGHANDLOW_WHOLE']));
        }
      }
    }
    if (value == RplStep.ONESTEP.name) {
      this.setState({
        rplTempBinShow: false,
        rplTempBinRequired: false,
      });
    } else if (value == RplStep.TWOSTEP.name) {
      this.setState({
        rplTempBinShow: true,
        rplTempBinRequired: true
      });
    }
    this.setState({
      rplStepformValue: value
    });
  }
  /**
   * 设置state中补货类型的值
   */
  changeRplType = value => {
    const { rplModeformValue, rplStepformValue, entity } = this.state;
    if (entity.rplConfig && entity.rplConfig.rplMethod) {
      entity.rplConfig.rplMethod = undefined
    } else {
      this.props.form.setFieldsValue({
        rplMethod: undefined,
      })
    }
    rplMethodOptions.length = 0;
    if (rplModeformValue != '' && rplStepformValue != '') {
      if (rplModeformValue !== RplMode.RF.name || value == RplType.STATIC.name) {
        rplMethodOptions.push(getRplMethodOptions(['ENOUGHOUT', 'RPLFULL']));
      } else if (rplModeformValue == RplMode.RF.name && value == RplType.DYANMIC.name) {
        if (rplStepformValue == RplStep.ONESTEP.name) {
          rplMethodOptions.push(getRplMethodOptions(['WHOLE', 'HIGHANDLOW','HIGHANDLOW_WHOLE']));
        } else if (rplStepformValue == RplStep.TWOSTEP.name) {
          rplMethodOptions.push(getRplMethodOptions(['HIGHANDLOW','HIGHANDLOW_WHOLE']));
        }
      }
    }
    this.setState({
      rplTypeformValue: value
    });
  }
  /**
   * 补货算法变化
   */
  changeRplMethod = value => {
    rplMethodExtendOptions.length = 0;
    if (value == RplMethod.HIGHANDLOW.name|| value == RplMethod.RPLFULL.name) {
      rplMethodExtendOptions.push(getRplMethodExtendOptions(['T_REPAIR']))
      this.setState({
        rplMethodExtendShow: true,
        rplMethodExtendRequired: true,
      });
      if (this.state.entity.rplConfig && this.state.entity.rplConfig.rplMethodExtend && this.state.entity.rplConfig.rplMethodExtend === RplMethodExtend.T_REPAIR.name) {
        this.setState({
          tShow: true
        });
      }
    } else {
      this.setState({
        rplMethodExtendShow: false,
        rplMethodExtendRequired: false,
        tShow: false
      })
    }
    this.setState({
      rplMethodExtendformValue: value
    });
  }

  /**
   * 补货算法加强变化
   */
  handleChangeRplMethodExtend = value => {
    if (value == RplMethodExtend.T_REPAIR.name) {
      this.setState({
        tShow: true,
        tRequired: true,
      });
    } else {
      this.setState({
        tShow: false,
        tRequired: false,
      });
    }
  }
  /**
   * 取消
   */
  onCancel = () => {
    const payload = {
      showPage: 'query'
    }
    this.props.dispatch({
      type: 'pickArea/showPage',
      payload: {
        ...payload
      }
    });
  }

  /**
   * 基本信息面板
   */
  drawBasicInfoCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;
    let columns = [
      <CFormItem key='code' label={commonLocale.codeLocale}>
        {getFieldDecorator('code', {
          initialValue: entity.code,
          rules: [
            { required: true, message: notNullLocale(commonLocale.codeLocale) },
            {
              pattern: codePattern.pattern,
              message: codePattern.message,
            },
          ]
        })(<Input placeholder={placeholderLocale(commonLocale.codeLocale)} />)}
      </CFormItem>,

      <CFormItem key='name' label={commonLocale.nameLocale}>
        {getFieldDecorator('name', {
          initialValue: entity.name,
          rules: [
            { required: true, message: notNullLocale(commonLocale.nameLocale) },
            {
              max: 30,
              message: tooLongLocale(commonLocale.nameLocale, 30),
            },
          ]
        })(<Input placeholder={placeholderLocale(commonLocale.nameLocale)} />)}
      </CFormItem>,

      <CFormItem key='binScope' label={(
        <span>
          {pickAreaLocale.binScope}&nbsp;
          <Tooltip title={binScopePattern.message}>
            <Icon type="info-circle" />
          </Tooltip>
        </span>
      )}>
        {
          getFieldDecorator('binScope', {
            initialValue: entity.binScope,
            rules: [
              {
                required: true,
                message: notNullLocale(pickAreaLocale.binScope)
              },
              {
                pattern: binScopePattern.pattern,
                message: binScopePattern.message
              }
            ]
          })(<TextArea rows={2} placeholder={placeholderLocale(pickAreaLocale.binScope)} />)
        }
      </CFormItem>,
      <CFormItem key='wholeContainer' label={pickAreaLocale.wholeContainer}>
        {
          getFieldDecorator('wholeContainer', {
            initialValue: entity.wholeContainer,
            rules: [
              { required: true, message: notNullLocale(pickAreaLocale.wholeContainer) },
            ]
          })(
            <Select initialValue='' onChange={this.toChoosewholePickMethod}>
              {basicIfOptions}
            </Select>
          )
        }
      </CFormItem>,
       <CFormItem key='targetStock' label={pickAreaLocale.targetStock}>
       {
         getFieldDecorator('targetStock', {
           initialValue: entity.targetStock,
           rules: [
             { required: false },
           ]
         })(
           <Select initialValue={entity.targetStock} onChange={(e) => this.toChooseTargetStockFlag(e)}>
             <Option value={false} key='0'>否</Option>
             <Option value={true} key='1'>是</Option>
           </Select>
         )
       }
     </CFormItem>
    ];
    if (entity.wholeContainer == true) {
      columns.push(
        <CFormItem key='wholePickMethod' label={pickAreaLocale.wholePickMethod}>
          {
            getFieldDecorator('wholePickMethod', {
              initialValue: entity.wholePickMethod,
              rules: [
                {
                  required: this.state.wholePickMethodRequired,
                  message: notNullLocale(pickAreaLocale.wholePickMethod)
                },
              ]
            })(
              <Select initialValue='' placeholder={placeholderChooseLocale(pickAreaLocale.wholePickMethod)}>
                {wholePickMethodOptions}
              </Select>
            )
          }
        </CFormItem>,
        <CFormItem key='directCollect' label={pickAreaLocale.basicDirectCollect}>
          {
            getFieldDecorator('directCollect', {
              initialValue: entity.directCollect,
              rules: [
                { required: true, message: notNullLocale(pickAreaLocale.basicDirectCollect) },
              ]
            })(
              <Select initialValue='' onChange={this.toChooseDirectCollect}>
                {basicIfOptions}
              </Select>
            )
          }
        </CFormItem>,
        this.state.basicUnifyCollectTempBinRequired ?
          <CFormItem key='unifyCollectTempBin' label={pickAreaLocale.unifyCollectTempBin}>
            {
              getFieldDecorator('unifyCollectTempBin', {
                initialValue: entity.unifyCollectTempBin,
                rules: [
                  { required: this.state.basicUnifyCollectTempBinRequired, message: notNullLocale(pickAreaLocale.unifyCollectTempBin) },
                ]
              })(
                <BinSelect placeholder={placeholderLocale(pickAreaLocale.unifyCollectTempBin)}
                  usage={binUsage.UnifyCollectTemporaryBin.name} />
              )
            }
          </CFormItem> : null,
      )
    }
    return columns;
  }
  /**
   * 补货配置面板
   */
  drawRplInfoCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;
    let columns = [
      <CFormItem key='rplMode' label={pickAreaLocale.rplMode}>
        {
          getFieldDecorator('rplMode', {
            initialValue: entity.rplConfig ? entity.rplConfig.rplMode : undefined,
            rules: [
              { required: true, message: notNullLocale(pickAreaLocale.rplMode) },
            ]
          })(
            <Select initialValue=''
              placeholder={placeholderChooseLocale(pickAreaLocale.rplMode)}
              onChange={this.changeRplMode}>
              {rplModeOptions}
            </Select>
          )
        }
      </CFormItem>,

      <CFormItem key='rplStep' label={pickAreaLocale.rplStep}>
        {
          getFieldDecorator('rplStep', {
            initialValue: entity.rplConfig ? entity.rplConfig.rplStep : undefined,
            rules: [{
              required: true,
              message: notNullLocale(pickAreaLocale.rplStep)
            }]
          })(
            <Select initialValue='' placeholder={placeholderChooseLocale(pickAreaLocale.rplStep)} onChange={this.changeRplStep}>
              {rplStepOptions}
            </Select>
          )
        }
      </CFormItem>,

      <CFormItem key='rplType' label={pickAreaLocale.rplType}>
        {
          getFieldDecorator('rplType', {
            initialValue: entity.rplConfig ? entity.rplConfig.rplType : undefined,
            rules: [
              { required: true, message: notNullLocale(pickAreaLocale.rplType) },
            ]
          })(
            <Select initialValue='' placeholder={placeholderChooseLocale(pickAreaLocale.rplType)} onChange={this.changeRplType}>
              {rplTypeOptions}
            </Select>
          )
        }
      </CFormItem>,

      <CFormItem key='rplMethod' label={pickAreaLocale.rplMethod}>
        {
          getFieldDecorator('rplMethod', {
            initialValue: entity.rplConfig ? entity.rplConfig.rplMethod : undefined,
            rules: [{
              required: true,
              message: notNullLocale(pickAreaLocale.rplMethod)
            }]
          })(
            <Select initialValue='' placeholder={placeholderChooseLocale(pickAreaLocale.rplMethod)} onChange={this.changeRplMethod}>
              {rplMethodOptions}
            </Select>
          )
        }
      </CFormItem>,
      this.state.rplMethodExtendShow ?
        <CFormItem key='rplMethodExtend' label={pickAreaLocale.rplMethodExtend}>
          {
            getFieldDecorator('rplMethodExtend', {
              initialValue: entity.rplConfig ? entity.rplConfig.rplMethodExtend : undefined,
              rules: [{
                required: this.state.rplMethodExtendRequired,
                message: notNullLocale(pickAreaLocale.rplMethodExtend)
              }]
            })(
              <Select initialValue=''
                placeholder={placeholderChooseLocale(pickAreaLocale.rplMethodExtend)}
                onChange={this.handleChangeRplMethodExtend}>
                {rplMethodExtendOptions}
              </Select>
            )
          }
        </CFormItem> : null,
      this.state.tShow ?
        <CFormItem key='t' label={pickAreaLocale.t}>
          {
            getFieldDecorator('t', {
              initialValue: entity.rplConfig ? entity.rplConfig.t : '',
              rules: [{ required: true, message: notNullLocale(pickAreaLocale.t) }]
            })(
              <InputNumber style={{ width: '100%' }} min={0} placeholder={placeholderLocale(pickAreaLocale.t)} />
            )
          }
        </CFormItem> : null,
    ];

    if (this.state.rplTempBinShow) {
      columns.splice(3, 0, <CFormItem key='rplTempBin' label={pickAreaLocale.rplTempBin} >
        {
          getFieldDecorator('rplTempBin', {
            initialValue: entity.rplConfig ? entity.rplConfig.rplTempBin : undefined,
            rules: [{ required: this.state.rplTempBinRequired, message: notNullLocale(pickAreaLocale.rplTempBin) }]
          })(
            <BinSelect placeholder={placeholderLocale(pickAreaLocale.rplTempBin)}
              usage={binUsage.RplTemporaryBin.name} />
          )
        }
      </CFormItem>)
    }
    return columns;
  }
  /**
  * 指定库存配置面板
  */
  drawTargetStockInfoCols = () => {
    const { getFieldDecorator } = this.props.form;
    const index = this.state.index;
    const { entity } = this.state;
    let columns = [
      <CFormItem key='pickMode' label={pickAreaLocale.pickMode}>
        {
          getFieldDecorator(`pickMode`, {
            initialValue: entity.targetStockConfig ? entity.targetStockConfig.pickMode : undefined,
            rules: [
              { required: true, message: notNullLocale(pickAreaLocale.pickMode) },
            ]
          })(
            <Select initialValue='' placeholder={placeholderChooseLocale(pickAreaLocale.pickMode)}
              onChange={(e) => this.toChooseTargetStockAllocateTransferBin(e)}
            >
              {pickModeOptions}
            </Select>
          )
        }
      </CFormItem>,
      <CFormItem key='rpl' label={'是否补货'}>
      {
        getFieldDecorator(`rpl`, {
          initialValue: entity.targetStockConfig ? entity.targetStockConfig.rpl? entity.targetStockConfig.rpl : false : false,
          rules: [
            { required: true, message: notNullLocale('是否补货') },
          ]
        })(
          <Select initialValue='' placeholder={placeholderChooseLocale('是否补货')}>
            {everRpl}
          </Select>
        )
      }
    </CFormItem>,
      <CFormItem key='directCollect' label={pickAreaLocale.directCollect}>
      {
        getFieldDecorator(`directCollect`, {
          initialValue: entity.targetStockConfig ? entity.targetStockConfig.directCollect : undefined,
          rules: [{ required: true, message: notNullLocale(pickAreaLocale.directCollect) }]
        })(
          <Select initialValue=''
            placeholder={placeholderLocale(pickAreaLocale.directCollect)}
            onChange={(e) => this.toChooseTargetStockUnifyCollectTempBin(e)}>
            {basicIfOptions}
          </Select>
        )
      }
    </CFormItem>,
      <CFormItem key='pickMethod' label={pickAreaLocale.pickMethod}>
        {
          getFieldDecorator(`pickMethod`, {
            initialValue: entity.targetStockConfig ? entity.targetStockConfig.pickMethod : undefined,
            rules: [
              { required: true, message: notNullLocale(pickAreaLocale.pickMethod) },
            ]
          })(
            <Select initialValue=''
              placeholder={placeholderChooseLocale(pickAreaLocale.pickMethod)}
              onChange={(e) => this.toChooseTargetStockPickTempBin(e)}>
              {pickMethodOptions}
            </Select>
          )
        }
      </CFormItem>,


      <CFormItem key='maxVolume' label={pickAreaLocale.maxVolume}>
        {
          getFieldDecorator(`maxVolume`, {
            initialValue: entity.targetStockConfig ? entity.targetStockConfig.maxVolume : 0,
          })(
            <InputNumber style={{ width: '100%' }}
              min={0}
              max={1000.000}
              precision={3} placeholder={placeholderLocale(pickAreaLocale.maxVolume)} />
          )
        }
      </CFormItem>,

      <CFormItem key='lastVolumeRate' label={pickAreaLocale.lastVolumeRate}>
        {
          getFieldDecorator(`lastVolumeRate`, {
            initialValue: entity.targetStockConfig ? entity.targetStockConfig.lastVolumeRate : 0,
          })(
            <InputNumber style={{ width: '100%' }}
              min={0}
              max={100.000}
              precision={3} placeholder={placeholderLocale(pickAreaLocale.lastVolumeRate)} />
          )
        }
      </CFormItem>,

      <CFormItem key='maxArticleCount' label={pickAreaLocale.maxArticleCount}>
        {
          getFieldDecorator(`maxArticleCount`, {
            initialValue: entity.targetStockConfig ? entity.targetStockConfig.maxArticleCount : 0,
          })(
            <InputNumber style={{ width: '100%' }}
              min={0}
              precision={4}
              max={1000.0000}
              placeholder={placeholderLocale(pickAreaLocale.maxArticleCount)} />
          )
        }
      </CFormItem>,

      <CFormItem key='maxStoreCount' label={pickAreaLocale.maxStoreCount}>
      {
        getFieldDecorator(`maxStoreCount`, {
          initialValue: entity.targetStockConfig ? entity.targetStockConfig.maxStoreCount : undefined,
        })(
          <InputNumber style={{ width: '100%' }}
            min={0}
            precision={4}
            max={1000.0000}
            placeholder={placeholderLocale(pickAreaLocale.maxStoreCount)} />
        )
      }
    </CFormItem>,
    ];

    if (this.state[`pickTempBinRequired`]) {
      columns.splice(columns.length, 0, <CFormItem key='pickTempBin' label={pickAreaLocale.pickTempBin}>
        {
          getFieldDecorator(`pickTempBin`, {
            initialValue: entity.targetStockConfig ? entity.targetStockConfig.pickTempBin : undefined,
            rules: [
              {
                required: this.state[`pickTempBinRequired`],
                message: notNullLocale(pickAreaLocale.pickTempBin)
              },
            ]
          })(
            <BinSelect placeholder={placeholderLocale(pickAreaLocale.pickTempBin)}
              usage={binUsage.PickUpTemporaryBin.name} />
          )
        }
      </CFormItem>)
    }

    if (this.state[`unifyCollectTempBinRequired`]) {
      columns.splice(columns.length, 0, <CFormItem key='unifyCollectTempBin' label={pickAreaLocale.unifyCollectTempBin}>
        {
          getFieldDecorator(`unifyCollectTempBin`, {
            initialValue: entity.targetStockConfig ? entity.targetStockConfig.unifyCollectTempBin : undefined,
            rules: [{
              required: this.state[`unifyCollectTempBinRequired`],
              message: notNullLocale(pickAreaLocale.unifyCollectTempBin)
            }]
          })(
            <BinSelect placeholder={placeholderLocale(pickAreaLocale.unifyCollectTempBin)}
              usage={binUsage.UnifyCollectTemporaryBin.name} />
          )
        }
      </CFormItem>);
    }

    if (this.state[`allocateTransferBinRequired`]) {
      columns.splice(columns.length, 0, <CFormItem key='allocateTransferBin' label={pickAreaLocale.allocateTransferBin}>
        {
          getFieldDecorator(`allocateTransferBin`, {
            initialValue: entity.targetStockConfig ? entity.targetStockConfig.allocateTransferBin : undefined,
            rules: [
              {
                required: this.state[`allocateTransferBinRequired`],
                message: notNullLocale(pickAreaLocale.allocateTransferBin)
              },
            ]
          })(
            <BinSelect placeholder={placeholderLocale(pickAreaLocale.allocateTransferBin)}
              usage={binUsage.AllocateTransferBin.name} />
          )
        }
      </CFormItem>)
    }

    if(this.state[`crossPickMethod`]){
      columns.splice(3, 0,<CFormItem key='crossPickMethod' label={'集合'+pickAreaLocale.pickMethod}>
      {
        getFieldDecorator(`crossPickMethod`, {
          initialValue: entity.targetStockConfig ? entity.targetStockConfig.crossPickMethod : undefined,
          rules: [
            { required: true, message: notNullLocale('集合'+pickAreaLocale.pickMethod) },
          ]
        })(
          <Select initialValue=''
            placeholder={placeholderChooseLocale('集合'+pickAreaLocale.pickMethod)}
            // onChange={(e) => this.toChooseTargetStockPickTempBin(e)}
          >
            {pickMethodOptions}
          </Select>
        )
      }
    </CFormItem>,)
    }
    return columns;
  }

  /**
   * 拣货面板
   */
  drawCaseInfoCols = (pickConfigs) => {
    const { getFieldDecorator } = this.props.form;
    const index = this.state.index;
    let columns = [
      <CFormItem key='pickType' label={pickAreaLocale.pickType}>
        {
          getFieldDecorator(`${pickConfigs.pickType}${index}pickType`, {
            initialValue: pickConfigs.pickType,
            rules: [
              { required: true, message: notNullLocale(pickAreaLocale.pickType) },
            ]
          })(
            <Select initialValue='' onChange={this.onChangePickType.bind(this, pickConfigs)}>
              {pickTypeOptions}
            </Select>
          )
        }
      </CFormItem>,
      <CFormItem key='pickMethod' label={pickAreaLocale.pickMethod}>
        {
          getFieldDecorator(`${pickConfigs.pickType}pickMethod`, {
            initialValue: pickConfigs.pickMethod,
            rules: [
              { required: true, message: notNullLocale(pickAreaLocale.pickMethod) },
            ]
          })(
            <Select initialValue=''
              placeholder={placeholderChooseLocale(pickAreaLocale.pickMethod)}
              onChange={(e) => this.toChoosePickTempBin(e, pickConfigs.pickType)}>
              {pickMethodOptions}
            </Select>
          )
        }
      </CFormItem>,

      <CFormItem key='pickMode' label={pickAreaLocale.pickMode}>
        {
          getFieldDecorator(`${pickConfigs.pickType}pickMode`, {
            initialValue: pickConfigs.pickMode,
            rules: [
              { required: true, message: notNullLocale(pickAreaLocale.pickMode) },
            ]
          })(
            <Select initialValue='' placeholder={placeholderChooseLocale(pickAreaLocale.pickMode)}
              onChange={(e) => this.toChooseAllocateTransferBin(e, pickConfigs.pickType)}
            >
              {pickModeOptions}
            </Select>
          )
        }
      </CFormItem>,

      <CFormItem key='pickTempBin' label={pickAreaLocale.pickTempBin}>
        {
          getFieldDecorator(`${pickConfigs.pickType}pickTempBin`, {
            initialValue: pickConfigs.pickTempBin,
            rules: [
              {
                required: this.state[`pickTempBinRequired${pickConfigs.pickType}`],
                message: notNullLocale(pickAreaLocale.pickTempBin)
              },
            ]
          })(
            <BinSelect placeholder={placeholderLocale(pickAreaLocale.pickTempBin)}
              usage={binUsage.PickUpTemporaryBin.name} />
          )
        }
      </CFormItem>,
      <CFormItem key='directCollect' label={pickAreaLocale.directCollect}>
        {
          getFieldDecorator(`${pickConfigs.pickType}directCollect`, {
            initialValue: pickConfigs.directCollect,
            rules: [{ required: true, message: notNullLocale(pickAreaLocale.directCollect) }]
          })(
            <Select initialValue=''
              onChange={(e) => this.toChooseUnifyCollectTempBin(e, pickConfigs.pickType)}>
              {basicIfOptions}
            </Select>
          )
        }
      </CFormItem>,

      <CFormItem key='maxVolume' label={pickAreaLocale.maxVolume}>
        {
          getFieldDecorator(`${pickConfigs.pickType}maxVolume`, {
            initialValue: pickConfigs.maxVolume
          })(
            <InputNumber style={{ width: '100%' }}
              min={0}
              max={1000.000}
              precision={3} placeholder={placeholderLocale(pickAreaLocale.maxVolume)} />
          )
        }
      </CFormItem>,

      <CFormItem key='lastVolumeRate' label={pickAreaLocale.lastVolumeRate}>
        {
          getFieldDecorator(`${pickConfigs.pickType}lastVolumeRate`, {
            initialValue: pickConfigs.lastVolumeRate
          })(
            <InputNumber style={{ width: '100%' }}
              min={0}
              max={100.000}
              precision={3} placeholder={placeholderLocale(pickAreaLocale.lastVolumeRate)} />
          )
        }
      </CFormItem>,

      <CFormItem key='maxArticleCount' label={pickAreaLocale.maxArticleCount}>
        {
          getFieldDecorator(`${pickConfigs.pickType}maxArticleCount`, {
            initialValue: pickConfigs.maxArticleCount
          })(
            <InputNumber style={{ width: '100%' }}
              min={0}
              precision={4}
              max={1000.0000}
              placeholder={placeholderLocale(pickAreaLocale.maxArticleCount)} />
          )
        }
      </CFormItem>,
       <CFormItem key='maxStoreCount' label={pickAreaLocale.maxStoreCount}>
       {
         getFieldDecorator(`${pickConfigs.pickType}maxStoreCount`, {
           initialValue: pickConfigs.maxStoreCount
         })(
           <InputNumber style={{ width: '100%' }}
             min={0}
             precision={4}
             max={1000.0000}
             placeholder={placeholderLocale(pickAreaLocale.maxStoreCount)} />
         )
       }
     </CFormItem>,
    ];
    if (this.state[`unifyCollectTempBinRequired${pickConfigs.pickType}`]) {
      columns.splice(5, 0, <CFormItem key='unifyCollectTempBin' label={pickAreaLocale.unifyCollectTempBin}>
        {
          getFieldDecorator(`${pickConfigs.pickType}unifyCollectTempBin`, {
            initialValue: pickConfigs.unifyCollectTempBin,
            rules: [{
              required: this.state[`unifyCollectTempBinRequired${pickConfigs.pickType}`],
              message: notNullLocale(pickAreaLocale.unifyCollectTempBin)
            }]
          })(
            <BinSelect placeholder={placeholderLocale(pickAreaLocale.unifyCollectTempBin)}
              usage={binUsage.UnifyCollectTemporaryBin.name} />
          )
        }
      </CFormItem>);
    }

    if (this.state[`containerType${pickConfigs.pickType}`]) {
      columns.splice(4, 0, <CFormItem key='containerType' label={pickAreaLocale.containerType}>
        {
          getFieldDecorator(`${pickConfigs.pickType}containerType`, {
            initialValue: pickConfigs.containerType ? JSON.stringify(pickConfigs.containerType) : undefined,
            rules: [
              {
                required: this.state[`containerType${pickConfigs.pickType}`],
                message: notNullLocale(pickAreaLocale.containerType)
              },
            ]
          })(
            <ContainerTypeSelect placeholder={placeholderLocale(pickAreaLocale.containerType)} />
          )
        }
      </CFormItem>)
    }

    if (this.state[`allocateTransferBinRequired${pickConfigs.pickType}`]) {
      columns.splice(columns.length, 0, <CFormItem key='allocateTransferBin' label={pickAreaLocale.allocateTransferBin}>
        {
          getFieldDecorator(`${pickConfigs.pickType}allocateTransferBin`, {
            initialValue: pickConfigs.allocateTransferBin,
            rules: [{
              required: this.state[`allocateTransferBinRequired${pickConfigs.pickType}`],
              message: notNullLocale(pickAreaLocale.allocateTransferBin)
            }]
          })(
            <BinSelect placeholder={placeholderLocale(pickAreaLocale.allocateTransferBin)}
              usage={binUsage.AllocateTransferBin.name} />
          )
        }
      </CFormItem>);
    }

    if (!this.state[`pickTempBinRequired${pickConfigs.pickType}`]) {
      columns.splice(3, 1)
    }

    return columns;
  }

  // 实现父类方法--开始
  onSave = (data) => {
    this.onCreate(data, true)
  }

  onSaveAndCreate = (data) => {
    this.onCreate(data, false);
  }
  /**
   * 保存
   */
  onCreate = (data, isGoDetail) => {
    const { entity } = this.state;
    const { form, dispatch } = this.props;
    let type = 'pickArea/add';
    if (entity.uuid) {
      type = 'pickArea/modify';
    }
    let payload = this.formValueToEntity();
    if (payload.uuid) {
      delete payload.rplConfig
    }
    dispatch({
      type: type,
      payload: payload,
      callback: (response) => {
        if (response && response.success) {
          let uuid;
          if (entity.uuid) {
            message.success(commonLocale.modifySuccessLocale);
            uuid = entity.uuid;
          } else {
            message.success(commonLocale.saveSuccessLocale);
            uuid = response.data;
          }
          this.setState({
            entity: {
              companyUuid: loginCompany().uuid,
              dcUuid: loginOrg().uuid,
              wholeContainer: true,
              pickConfigs: [{
                pickType: PickType.CASEANDSPLIT.name,
                key: PickType.CASEANDSPLIT.name,
                maxVolume: 0,
                lastVolumeRate: 0,
                maxArticleCount: 0,
                directCollect: true,
              }]
            },
            index: 0
          });
          this.props.form.resetFields();
          if (isGoDetail) {
            this.onView(uuid);
          }
        }
      },
    });
  }
  /**
   * 详情页
   */
  onView = (uuid) => {
    this.props.dispatch({
      type: 'pickArea/showPage',
      payload: {
        showPage: 'view',
        entityUuid: uuid
      }
    });
  }
  /**
   * 绘制 formItem
   */
  drawFormItems = () => {

    const { configType, entity } = this.state;
    let panels = [
      <FormPanel key="basicInfo" title={commonLocale.basicInfoLocale} cols={this.drawBasicInfoCols()} />,
      <FormPanel key="rplInfo" title={pickAreaLocale.rplConfigTitle} cols={this.drawRplInfoCols()} />,
    ];
    if(this.state.entity.targetStock){
      panels.splice(2, 0, <FormPanel key="targetStockConfigInfo" title={pickAreaLocale.targetStockConfigTitle} cols={this.drawTargetStockInfoCols()} />);
    }
    if (entity.pickConfigs) {
      //整件在前 拆零在后
      let queuePickConfigs = [];
      entity.pickConfigs.map(item => {
        if (item.pickType === PickType.CASE.name) {
          queuePickConfigs[0] = item;
        } else if (item.pickType === PickType.SPLIT.name) {
          queuePickConfigs[1] = item;
        } else if (item.pickType === PickType.CASEANDSPLIT.name) {
          queuePickConfigs[0] = item;
        }
      });

      queuePickConfigs.map(item => {
        panels.push(
          <FormPanel key={item.pickType}
            title={PickType[item.pickType].caption + pickAreaLocale.pickTypeTitle}
            cols={this.drawCaseInfoCols(item)} />
        );
      });
    }
    return panels;
  }
  // 实现父类方法--结束
}
