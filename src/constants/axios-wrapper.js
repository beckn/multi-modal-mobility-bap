import axios from 'axios'
import { Platform } from 'react-native';
import { API } from '../shared/API-end-points';
import { BASE_URL } from '../shared/app-setting';
import { store } from "../redux/store";

export const getAxiosInstance = () => {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: API.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + store?.getState()?.user?.user_token ?? ""
    }
  });
  return instance
}

export const getAxiosInstance_FormData = () => {
  console.log(store.getState().user,);
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: API.TIMEOUT,
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': 'Bearer ' + store?.getState()?.user?.user_token ?? ""
    }
  });
  return instance
}
