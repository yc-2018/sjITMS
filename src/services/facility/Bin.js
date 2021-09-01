import request from '@/utils/request';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

export async function saveZone(payload) {
    return request(`/iwms-facility/facility/bin/zone`, {
        method: 'POST',
        body: payload,
    });
}

export async function savePath(payload) {
    return request(`/iwms-facility/facility/bin/path`, {
        method: 'POST',
        body: payload,
    });
}

export async function saveShelf(payload) {
    return request(`/iwms-facility/facility/bin/shelf`, {
        method: 'POST',
        body: payload,
    });
}


export async function saveBin(payload) {
    return request(`/iwms-facility/facility/bin/bin`, {
        method: 'POST',
        body: payload,
    },true);
}

export async function queryZone(payload) {
    return request(`/iwms-facility/facility/bin/page/zone`, {
        method: 'POST',
        body: payload,
    });
}

export async function queryShelf(payload) {
    return request(`/iwms-facility/facility/bin/page/shelf`, {
        method: 'POST',
        body: payload,
    });
}

export async function queryPath(payload) {
    return request(`/iwms-facility/facility/bin/page/path`, {
        method: 'POST',
        body: payload,
    });
}

export async function queryBin(payload) {
    return request(`/iwms-facility/facility/bin/page/bin`, {
        method: 'POST',
        body: payload,
    });
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/bin/remove`, {
        method: 'POST',
        body: payload,
    });
}

export async function getZoneByCode(payload) {
    return request(`/iwms-facility/facility/bin/${payload.code}/zone?dcUuid=${payload.dcUuid}`);
}

export async function queryList(payload) {
    return request(`/iwms-facility/facility/bin/list`, {
        method: 'POST',
        body: payload,
    });
}

export async function genPathCode(payload) {
    return request(`/iwms-facility/facility/bin/gen/path`, {
        method: 'POST',
        body: payload,
    },true);
}

export async function genShelfCode(payload) {
    return request(`/iwms-facility/facility/bin/gen/shelf`, {
        method: 'POST',
        body: payload,
    });
}

export async function genBinCode(payload) {
    return request(`/iwms-facility/facility/bin/gen/bin`, {
        method: 'POST',
        body: payload,
    });
}

export async function getBinByCode(payload) {
    return request(`/iwms-facility/facility/bin/${payload.code}/bin?dcUuid=${payload.dcUuid}`);
}

export async function alterBinUsage(payload) {
    return request(`/iwms-facility/facility/bin/alter/binusage`, {
        method: 'POST',
        body: payload,
    });
}

export async function alterBinType(payload) {
    return request(`/iwms-facility/facility/bin/alter/bintype`, {
        method: 'POST',
        body: payload,
    });
}

export async function queryBinTree(payload) {
    return request(`/iwms-facility/facility/bin/list/tree?code=${payload.code}&dcUuid=${payload.dcUuid}`);
}

export async function getSimBin(payload) {
    return request(`/iwms-facility/facility/bin/simbin?code=${payload.code}&dcUuid=${payload.dcUuid}`);
}

export async function queryBinForArticleBusiness(payload) {
    return request(`/iwms-facility/facility/bin/list/forArticleBusiness`, {
        method: 'POST',
        body: payload,
    });
}

export async function queryByBincodes(payload) {
    return request(`/iwms-facility/facility/bin/bincodes?dcUuid=${payload.dcUuid}`, {
        method: 'POST',
        body: payload.bincodes,
    });
}


export async function  batchUpBin (payload) {
    return request(`/iwms-facility/facility/bin/batchUpBin?binScope=${payload.binScope}&binUsage=${payload.binUsage}&dcUuid=${loginOrg().uuid}`, {
        method: 'POST',
        body: payload.binType,
    });
}

export async function getContainersByBinCode(payload) {
    return request(`/iwms-facility/facility/bin/containers?dcUuid=${loginOrg().uuid}&companyUuid=${loginCompany().uuid}&binCode=${payload.binCode}&containerLike=${payload.containerLike? payload.containerLike : ""}`,{
        method: 'GET',
    });
}
