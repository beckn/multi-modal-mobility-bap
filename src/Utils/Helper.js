import { Platform, ToastAndroid, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { store } from '../redux/store';
import RootNavigation from '../Navigation/RootNavigation';

export const getStorage = (key) => {
  return AsyncStorage.getItem(key).then((data) => {
    return JSON.parse(data);
  }).catch((error) => { console.log(error); });
};
export const setStorage = async (key, item) => {
  try {
    var jsonOfItem = await AsyncStorage.setItem(key, JSON.stringify(item));
    return jsonOfItem;
  } catch (error) {
    console.log(error);
  }
};

export const clearStorage = async () => {
  await AsyncStorage.clear();
}

export const clearStorageByKey = async (key) => {
  await AsyncStorage.removeItem(key);
}

export const hasValue = (data) => {
  return (data !== undefined) && (data !== null) && (data !== "");
}

export const openURL = (data) => {
  try {
    if (hasValue(data)) {
      Linking.openURL(data);
    }
  } catch (error) {
    console.log(error);
  }
}

const email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
export const IsEmailValid = function (res) { return email.test(res) }

const phone = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
export const IsNumberValid = (res) => {
  return phone.test(res)
}

export const isUserNameValid = (data) => {
  try {
    /* 
   Usernames can only have: 
   - Uppercase Letters (A-Z) 
   - Lowercase Letters (a-z) 
   - Numbers (0-9)
   - Dots (.)
   - Underscores (_)
 */
    const res = /^[A-Za-z0-9_\.]+$/.exec(data);
    const valid = !!res;
    return valid;
  } catch (error) {
    console.log(error);
  }
}

export const isAlphabet = (data) => {
  try {
    /* 
   Usernames can only have: 
   - Uppercase Letters (A-Z) 
   - Lowercase Letters (a-z)   
   - Space
 */
    const res = /^[A-Za-z\s]*$/.exec(data);
    const valid = !!res;
    return valid;
  } catch (error) {
    console.log(error);
  }
}

export const MyToast = function (msg) {
  try {
    if (hasValue(msg)) {
      Platform.select({
        ios: () => { Alert.alert('' + msg); },
        android: () => { ToastAndroid.show('' + msg, ToastAndroid.SHORT); }
      })();
    }
  } catch (error) {
    console.log(error);
  }
}

export const MyAlert = function (msg, title) {
  try {
    if (hasValue(msg)) {
      Alert.alert(
        hasValue(title) ? title : '',
        msg,
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: true },
      );
    }
  } catch (error) {
    console.log(error);
  }
}

export const responseHandler = (response) => {
  try {
    if (hasValue(response)) {
      console.log(response?.config?.url ?? "" + ' :- ', response);
      if (hasValue(response?.status ?? "") && (response.status < 200 || response.status >= 300)) {
        var error = response?.data?.message ?? null
        if (response.status == 401) { // Unauthorized
          MyAlert("Your session is expired!")
          RootNavigation.replace('Login');
        }
        MyToast(error);
        return null
      } else {
        const response_status = response?.status ?? null
        const status = response?.data?.status ?? null
        const success = response?.data?.success ?? null
        if (response_status == 200 || status == "success" || status == 200 || success == true || success == 'true') {
          return response
        } else {
          MyToast(error);
          return null
        }
      }
    } else {
      return null
    }
  } catch (error) {
    console.log('responseHandler error:- ', error);
    return null
  }
}

export const dateTime = (data, prev_format, show_format) => {
  let res = moment(data ? data : new Date(), prev_format).format(show_format ? show_format : 'YYYY-MM-DD HH:mm:ss')
  if (!hasValue(res)) { res = "" }
  if (res == 'Invalid date') { res = "" }
  return res;
}

export const toFixed = (data, flag) => {
  const num = hasValue(data) ? Number(data) : 0
  let n = num.toFixed(hasValue(flag) ? flag : 2);
  if (n == 'NaN') {
    n = 0
  }
  return n == 0.0000000000 ? '0' : n;
}

export const hasWhiteSpace = (data) => {
  return /\s/g.test(data);
}

export const trimString = (data) => {
  let result = data.trim();
  return result;
}

export const multipleMassage = (data) => {
  try {
    if (hasValue(data)) {
      if (Array.isArray(data) && data.length > 0) {
        let error = data.join("\n\n");
        MyToast(error)
      }
    }
  } catch (error) {
    console.log(error);
  }
}

export const isCompletedTrip = (flag) => {
  try {
    let status = false
    const items = store?.getState()?.user?.completed_trips ?? []
    if (hasValue(items) && items.length > 0) {
      let is_find = null
      for (let index = 0; index < items.length; index++) {
        const element = items[index];
        if (hasValue(flag) && flag === "isMulti") {
          if (element.status === "SELECTED" || element.status === "CONFIRMED" || element.status === "IN_PROGRESS" || element.status === "FAILED") {
            is_find = element
            break;
          }
        } else {
          if (element.status === "SELECTED") {
            is_find = element
            break;
          }
        }
      }
      console.log(is_find, 'is_find isCompletedTrip');
      if (hasValue(is_find)) {
        status = true
      }
    }
    console.log(status, 'status isCompletedTrip');
    return status;
  } catch (error) {
    console.log(error);
    return false
  }
}
