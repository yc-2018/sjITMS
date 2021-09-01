export const state = {
    INPROGRESS: {
        name: 'INPROGRESS',
        caption: '进行中'
    },
    audited: {
        name: 'AUDITED',
        caption: '已审核'
    }
};

export const moveType = {
    UNIFYRECEIVE: {
        name: 'UNIFYRECEIVE',
        caption: '统配收货'
    },
    CROSSRECEIVE: {
        name: 'CROSSRECEIVE',
        caption: '越库收货'
    },
    UNIFYPICK: {
        name: 'UNIFYPICK',
        caption: '统配拣货'
    },
    CROSSPICK: {
        name: 'CROSSPICK',
        caption: '越库拣货'
    },
    UNIFYCOLLECT: {
        name: 'UNIFYCOLLECT',
        caption: '统配集货'
    },
    CROSSCOLLECT: {
        name: 'CROSSCOLLECT',
        caption: '越库集货'
    },
    VENDORRTNCOLLECT: {
        name: 'VENDORRTNCOLLECT',
        caption: '返厂集货 '
    },
    PACKAGECOLLECT:{
        name:'PACKAGECOLLECT',
        caption:'包裹集货'
    }
}

export function getTypeCaption(name) {
    let caption;
    Object.keys(moveType).forEach(function (key) {
        if (moveType[key].name === name)
            caption = moveType[key].caption;
    });
    return caption;
}

export function getStateCaption(name) {
    let caption;
    Object.keys(state).forEach(function (key) {
        if (state[key].name === name)
            caption = state[key].caption;
    });
    return caption;
}