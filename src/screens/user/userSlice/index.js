import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { performDeleteRequest, performGetRequest, performPutRequest, performPatchRequest, performPostRequest, performPostRequest_FormData } from '../../../constants/axios-utils'
import { clearStorage, multipleMassage, getStorage, hasValue, MyAlert, MyToast, responseHandler, setStorage } from '../../../Utils'
import { API } from '../../../shared/API-end-points'
import RootNavigation from '../../../Navigation/RootNavigation'
import { store } from '../../../redux/store'
import { clear_master_state } from '../../master/masterSlice'
import { Alert } from 'react-native'
STR = require('../../../languages/strings');

export const sendOTP = createAsyncThunk('user/sendOTP', async (data, { dispatch }) => {
    dispatch(common_state({ isLoading: true }))
    await performPostRequest(API.send_otp, data).then((res) => {
        const apiResponse = responseHandler(res)
        if (hasValue(apiResponse)) {
            RootNavigation.navigate("VerifyOTP", {
                mobileNo: data?.mobileNo ?? ""
            });
        }
        MyToast(apiResponse?.data?.message ?? "")
        dispatch(common_state({}))
    }).catch(error => {
        const apiResponse = responseHandler(error.response);
        dispatch(common_state({}))
    })
})
export const verifyOTP = createAsyncThunk('user/verifyOTP', async (data, { dispatch }) => {
    dispatch(common_state({ isLoading: true }))
    await performPostRequest(API.verify_otp, data).then((res) => {
        const apiResponse = responseHandler(res)
        if (hasValue(apiResponse)) {
            dispatch(user_token_state({
                user_token: apiResponse?.data?.token?.token ?? "",
            }))
            dispatch(userDetails({ flag: 0 }))
            dispatch(customer_support_state({
                customer_support: apiResponse?.data?.customerSupport ?? "",
            }))
        }
        MyToast(apiResponse?.data?.message ?? "")
        dispatch(common_state({}))
    }).catch(error => {
        const apiResponse = responseHandler(error.response);
        dispatch(common_state({}))
    })
})
export const userDetails = createAsyncThunk('user/userDetails', async (data, { dispatch }) => {
    dispatch(user_details_state({ isLoading: true }))
    await performGetRequest(API.user_details).then((res) => {
        const apiResponse = responseHandler(res)
        if (hasValue(apiResponse)) {
            if (hasValue(data?.flag ?? "")) {
                RootNavigation.replace("Dashboard");
            }
            MyToast(apiResponse?.data?.message ?? "")
        }
        dispatch(user_details_state({
            user_data: apiResponse?.data ?? null
        }))
    }).catch(error => {
        const apiResponse = responseHandler(error.response);
        dispatch(user_details_state({}))
    })
})
export const updateUserDetails = createAsyncThunk('user/updateUserDetails', async (data, { dispatch }) => {
    dispatch(user_details_state({ isLoading: true }))
    await performPutRequest(API.update_user_details, data).then((res) => {
        const apiResponse = responseHandler(res)
        if (hasValue(apiResponse)) {
            MyToast(apiResponse?.data?.message ?? "")
            // RootNavigation.goBack();
            const otp = apiResponse?.data?.otp ?? false
            if (otp) {
                dispatch(modal_otp_state({ modal_otp: true }))
            }
        }
        dispatch(user_details_state({
            user_data: apiResponse?.data ?? null
        }))
    }).catch(error => {
        const apiResponse = responseHandler(error.response);
        dispatch(user_details_state({}))
    })
})

export const onLogout = createAsyncThunk('user/onLogout', async (data, { dispatch }) => {
    try {
        dispatch(doLogout())
        // Alert.alert(
        //     '',
        //     STR.strings.are_you_sure_want_to_logout,
        //     [
        //         { text: STR.strings.cancel, onPress: () => console.log('CANCEL Pressed'), style: 'cancel' },
        //         { text: STR.strings.ok, onPress: () => dispatch(doLogout()) },
        //     ],
        //     { cancelable: false }
        // )
    } catch (error) {
        console.log(error);
    }
})
export const doLogout = createAsyncThunk('user/doLogout', async (data, { dispatch }) => {
    dispatch(clear_state())
    dispatch(clear_master_state())
    clearStorage()
    // MyToast(apiResponse?.data?.message ?? "")
    RootNavigation.replace("Login")
    // await performGetRequest(API.logout, data).then((res) => {
    //     const apiResponse = responseHandler(res)
    //     dispatch(clear_state())
    //     dispatch(clear_master_state())
    //     clearStorage()
    //     MyToast(apiResponse?.data?.message ?? "")
    //     RootNavigation.replace("Login")
    // }).catch(error => {
    //     const apiResponse = responseHandler(error.response);
    //     dispatch(common_state({}))
    // })
})
export const verifyMobileNumber = createAsyncThunk('user/verifyMobileNumber', async (data, { dispatch }) => {
    dispatch(common_state({ isLoading: true }))
    await performPostRequest(API.verify_mobile_number, data).then((res) => {
        const apiResponse = responseHandler(res)
        if (hasValue(apiResponse)) {
            dispatch(user_token_state({
                user_token: apiResponse?.data?.token?.token ?? "",
            }))
            dispatch(modal_otp_state({}))
            dispatch(userDetails())
        }
        MyToast(apiResponse?.data?.message ?? "")
        dispatch(common_state({}))
    }).catch(error => {
        const apiResponse = responseHandler(error.response);
        dispatch(common_state({}))
    })
})
export const userSendOtp = createAsyncThunk('user/userSendOtp', async (data, { dispatch }) => {
    dispatch(common_state({ isLoading: true }))
    await performPostRequest(API.user_send_otp, data).then((res) => {
        const apiResponse = responseHandler(res)
        if (hasValue(apiResponse)) {

        }
        MyToast(apiResponse?.data?.message ?? "")
        dispatch(common_state({}))
    }).catch(error => {
        const apiResponse = responseHandler(error.response);
        dispatch(common_state({}))
    })
})

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        isLoading: false,
        user_data: null,
        user_token: "",
        language: "en",
        completed_trips: [],
        customer_support: "",
        modal_otp: false,
        modal_update_success: false,
        ride_status: null,
        ride_vehicle: null,
    },
    reducers: {
        clear_state: (state, action) => {
            state.isLoading = false
            state.user_data = null
            state.user_token = ""
            state.language = "en"
        },
        user_details_state: (state, action) => {
            state.isLoading = action?.payload?.isLoading ?? false
            state.user_data = action?.payload?.user_data ?? null
        },
        common_state: (state, action) => {
            state.isLoading = action?.payload?.isLoading ?? false
        },
        user_token_state: (state, action) => {
            state.user_token = action?.payload?.user_token ?? ""
        },
        language_state: (state, action) => {
            STR.strings.setLanguage(action.payload.language);
            setStorage('active_language', action.payload.language);
            I18nManager.forceRTL(action.payload.language == "en" ? false : true);
            state.language = action?.payload?.language ?? "en"
        },
        completed_trips_state: (state, action) => {
            if (hasValue(action.payload) && Array.isArray(action.payload) && action.payload.length > 0) {
                let tmp_trip = []
                action.payload.forEach(element => {
                    if (hasValue(element?.status ?? "")) {
                        if (element.status === "SELECTED") {
                            tmp_trip.push({ ...element, isBooked: 0 })
                        } else {
                            tmp_trip.push({ ...element, isBooked: 1 })
                        }
                    } else {
                        tmp_trip.push({ ...element, isBooked: 0 })
                    }
                });
                state.completed_trips = tmp_trip
            } else if (hasValue(action.payload)) {
                const item = state.completed_trips.find(element => element.id === action.payload.id);
                if (hasValue(item)) {
                    item.isBooked = 1
                }
            } else {
                state.completed_trips = [];
            }
        },
        customer_support_state: (state, action) => {
            state.customer_support = action?.payload?.customer_support ?? ""
        },
        modal_otp_state: (state, action) => {
            state.modal_otp = action?.payload?.modal_otp ?? false
        },
        modal_update_success_state: (state, action) => {
            state.modal_update_success = action?.payload?.modal_update_success ?? false
        },
        ride_status_state: (state, action) => {
            state.ride_status = action?.payload?.ride_status ?? null
        },
        ride_vehicle_state: (state, action) => {
            state.ride_vehicle = action?.payload?.ride_vehicle ?? null
        },
    },
})

export default userSlice.reducer
export const {
    oauth_token_state,
    user_token_state,
    user_details_state,
    clear_state,
    common_state,
    language_state,
    completed_trips_state,
    customer_support_state,
    modal_otp_state,
    modal_update_success_state,
    ride_status_state,
    ride_vehicle_state
} = userSlice.actions