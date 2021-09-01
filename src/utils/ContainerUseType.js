export const containerUseType = {
    DC: {
        name: 'DC',
        caption: '配送中心'
    },
    STORE: {
        name: 'STORE',
        caption: '门店'
    },
    VENDOR: {
        name: 'VENDOR',
        caption: '供应商'
    }
}

export function getUseTypeCaption(useType) {
    let caption;
    for (let x in containerUseType) {
        if (containerUseType[x].name === useType) {
            caption = containerUseType[x].caption;
            break;
        }
    }
    return caption;
}