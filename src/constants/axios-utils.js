import { getAxiosInstance, getAxiosInstance_FormData } from './axios-wrapper'

export const performGetRequest = async (endpoint) => {
  let wrapper = getAxiosInstance();
  return wrapper.get(endpoint).then((res) => {
    return res
  }).catch(ex => {
    throw ex
  })
}
export const performPostRequest = async (endPoint, jsonRequest) => {
  let wrapper = getAxiosInstance();
  return wrapper.post(endPoint, jsonRequest).then((res) => {
    return res
  }).catch(ex => {
    throw ex
  })
}
export const performPutRequest = async (endPoint, jsonRequest) => {
  let wrapper = getAxiosInstance();
  return wrapper.put(endPoint, jsonRequest).then((res) => {
    return res
  }).catch(ex => {
    throw ex
  })
}
export const performDeleteRequest = async (endPoint, jsonRequest) => {
  let wrapper = getAxiosInstance();
  return wrapper.delete(endPoint, jsonRequest).then((res) => {
    return res
  }).catch(ex => {
    throw ex
  })
}
export const performParallelRequest = (jsonArray) => {
  return Promise.all(jsonArray).then((response) => {
    return response
    // Both requests are now complete
  });
}

export const performPostRequest_FormData = async (endPoint, jsonRequest) => {
  let wrapper = getAxiosInstance_FormData();
  return wrapper.post(endPoint, jsonRequest).then((res) => {
    return res
  }).catch(ex => {
    throw ex
  })
}