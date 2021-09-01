export const configLocale = {
    title: '配置中心',
    innerConfig: {        
        key: 'innerConfig',
        name: '内部配置',
        queryBillDateConfig: {
            key: 'queryBillDateConfig',
            name: '查询单据日期配置'
        },
        binViewConfig: {
            key: 'binViewConfig',
            name: '货位显示配置'
        },        
        containerTypeBearConfig: {
            key: 'containerTypeBearConfig',
            name: '容器类型承载关系配置'
        },
        moveConfig: {
            key: 'moveConfig',
            name: '移库规则'
        },
        decIncConfig: {
            key: 'decIncConfig',
            name: '损溢规则'
        },
        lockConfig: {
            key: 'lockConfig',
            name: '库存锁定解锁配置'
        },
        closeConfig: {
            key: 'closeConfig',
            name: '封仓解仓配置'
        },
        takeConfig: {
            key: 'takeConfig',
            name: '盘点配置'
        },
        bindConfig: {
            key: 'bindConfig',
            name: '容器绑定/拆并配置'
        },
        validStockConfig: {
            key: 'validStockConfig',
            name: '可用库存范围配置'
        },
        stockoutconfig: {
            key: 'stockoutconfig',
            name: '缺货库存分配方案配置',
        },
        receiveConfig: {
          key: 'receiveConfig',
          name: '收货配置',
        },
        billQpcstrCongig:{
           key: 'billQpcstrCongig',
           name: '单据规格取值配置'
        }
    },
    bookConfig: {
        key: 'bookConfig',
        name: '预约配置',
        bookTimeConfig: {
            key: 'bookTimeConfig',
            name: '预约时间配置'
        },
        bookQtyStrConfig: {
            key: 'bookQtyStrConfig',
            name: '预约量配置'
        },
        orderMaxUnloadConfig: {
            key: 'orderMaxUnloadConfig',
            name: '码头卸货配置'
        }
    },
    putawayConfig: {
        key: 'putawayConfig',
        name: '上架配置',
        t_putawayConfig: {
            key: 't_putawayConfig',
            name: 'T型上架配置'
        },
        binTypeStorageConfig: {
            key: 'binTypeStorageConfig',
            name: '货位类型存储配置'
        },
        articleStroageConfig: {
            key: 'articleStroageConfig',
            name: '商品存储范围配置'
        },
        categoryStorageConfig: {
            key: 'categoryStorageConfig',
            name: '类别存储范围配置'
        },
        pickareaStorageConfig: {
            key: 'pickareaStorageConfig',
            name: '拣货分区存储范围配置'
        },
        putAwayTransferConfig: {
            key: 'putAwayTransferConfig',
            name: '上架中转位配置'
        }
    },
    taskConfig: {
        key: 'taskConfig',
        name: '作业配置',
        taskScopeConfig: {
            key: 'taskScopeConfig',
            name: '高叉员作业配置'
        },
        pickScopeConfig: {
            key: 'pickScopeConfig',
            name: '拣货员作业配置'
        },

    },
    rtnConfig: {
        key: 'rtnConfig',
        name: '退货配置',
        vendorRtnBinConfig: {
            key: 'vendorRtnBinConfig',
            name: '供应商退货位配置'
        },
        vendorCollectBinConfig: {
            key: 'vendorCollectBinConfig',
            name: '供应商集货位配置'
        },
        vendorPickerConfig: {
            key: 'vendorPickerConfig',
            name: '拣货员拣货范围配置'
        },
        allowVendorRtnConfig: {
            key: 'allowVendorRtnConfig',
            name: '配送主动退货供应商配置'
        },
        countingBinConfig: {
          key: 'countingBinConfig',
          name: '点数处理仓配置'
        },
        storeRtnAuditConfig: {
          key: 'storeRtnAuditConfig',
          name: '退仓单审核生成单据状态设置'
        }
    },
    outConfig: {
        key: 'outConfig',
        name: '出库配置',
        collectionBinReviewShipConfig: {
            key: 'collectbinreviewshipconfig',
            name: '集货区复查装车配置'
        },
        alcNtcBillConfig: {
            key: 'alcNtcBillConfig',
            name: '配单分单类型配置'
        },
        attachmentConfig: {
            key: 'attachmentconfig',
            name: '附件配置'
        },
        wholeContainerTypeConfig: {
            key: 'wholecontainertypeconfig',
            name: '整箱配置'
        },
        collectSchemeConfig: {
            key: 'collectSchemeConfig',
            name: '业务集货方案配置'
        },
        storeAllocationConfig: {
            key: 'storeAllocationConfig',
            name: '门店分拨位配置'
        },
        dockGroupConfig: {
            key: 'dockGroupConfig',
            name: '码头集配置'
        },
        printerConfig: {
            key: 'printerConfig',
            name: '打印机管理'
        },
        binScopePrinterConfig: {
            key: 'binScopePrinterConfig',
            name: '容器打印机推荐'
        },
        printLabelConfig: {
          key: 'printLabelConfig ',
          name: '打印标签配置'
        },
        waveAlgorithmConfig: {
            key: 'waveAlgorithmConfig ',
            name: '波次配货算法配置'
          },
    },
    dailyKnotsConfig: {
        key: 'dailyKnotsConfig',
        name: '日结配置',
        billDailyKnotsConfig: {
            key: 'billDailyKnotsConfig',
            name: '日结配置'
        },
    },
    interfaceConfig: {
        key: 'interfaceConfig',
        name: '接口配置',
        interfaceConfig: {
            key: 'interfaceConfig',
            name: '接口配置'
        },
    },
    packageInOutConfig: {
      key: 'packageInOutConfig',
      name: '包裹出入库配置',
      packageConfig: {
        key: 'packageConfig',
        name: '包裹配置'
      },
      virtualArticleConfig: {
        key: 'virtualArticleConfig',
        name: '包裹虚拟商品配置'
      }
    },
}
