import request from '@/utils/request';

export async function save(payload) {
    return request(`/iwms-facility/facility/vendorrtnbinconfig`, {
        method: 'POST',
        body: payload,
    });
}
export async function query(payload) {
    return request(`/iwms-facility/facility/vendorrtnbinconfig/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function remove(payload) {
    return request(`/iwms-facility/facility/vendorrtnbinconfig/remove?uuid=${payload.uuid}&version=${payload.version}`, {
        method: 'POST'
    });
}

export async function getByDCUuidAndVendor(payload) {
    return request(`/iwms-facility/facility/vendorrtnbinconfig?vendorUuid=${payload.vendorUuid}&dcUuid=${payload.dcUuid}`);
}

export async function modify(payload) {
  return request(`/iwms-facility/facility/vendorrtnbinconfig/modify`, {
    method: 'POST',
    body: payload,
  });
}
