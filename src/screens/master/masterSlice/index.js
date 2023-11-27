import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { performDeleteRequest, performGetRequest, performPostRequest, performPutRequest, performPostRequest_FormData } from '../../../constants/axios-utils'
import { API } from '../../../shared/API-end-points'
import { clearStorage, multipleMassage, getStorage, hasValue, MyAlert, MyToast, responseHandler, setStorage } from '../../../Utils'
import RootNavigation from '../../../Navigation/RootNavigation';
import { completed_trips_state, ride_status_state, ride_vehicle_state } from '../../user/userSlice';
import { store } from '../../../redux/store';
import { Images } from '../../../commonStyles/Images';
STR = require('../../../languages/strings');

export const searchRoutes = createAsyncThunk('master/searchRoutes', async (data, { dispatch }) => {
    dispatch(common_state({ isLoading: true }))
    await performPostRequest(API.search, data?.data ?? "").then((res) => {
        const apiResponse = responseHandler(res)
        if (hasValue(apiResponse)) {
            const payloads = {
                data: {
                    id: apiResponse?.data?.id ?? "",
                    itemData: data.itemData ?? {}
                },
                url: `/${apiResponse?.data?.id ?? ""}`,
            }
            dispatch(getJobDetails(payloads))
        }
    }).catch(error => {
        const apiResponse = responseHandler(error.response);
        dispatch(common_state({}))
    })
})
export const getJobDetails = createAsyncThunk('master/getJobDetails', async (data, { dispatch }) => {
    await performGetRequest(API.get_job_details + data.url).then((res) => {
        const apiResponse = responseHandler(res)
        if (apiResponse?.data?.status === "IN PROGRESS") {
            setTimeout(() => {
                dispatch(getJobDetails(data))
            }, 10000);
            return
        }
        if (apiResponse?.data?.status === "FAILED") {
            dispatch(get_job_details_state({}))
            return
        }
        if (hasValue(apiResponse)) {
            dispatch(get_job_details_state({
                job_details: apiResponse?.data?.response ?? null
            }))
            RootNavigation.navigate("AvailableOptions", { itemData: data?.data?.itemData ?? {} })
        } else {
            dispatch(get_job_details_state({}))
        }
    }).catch(error => {
        const apiResponse = responseHandler(error.response);
        dispatch(get_job_details_state({}))
    })
})
export const selectRoute = createAsyncThunk('master/selectRoute', async (data, { dispatch }) => {
    dispatch(select_route_state({ isLoading: true }))
    await performPostRequest(API.select_route, data.data).then((res) => {
        const apiResponse = responseHandler(res)
        if (hasValue(apiResponse)) {
            const select_route = apiResponse?.data ?? null
            const completed_trips = data?.completed_trips ?? []
            dispatch(select_route_state({
                isLoading: true,
                select_route: select_route,
                select_route_item: data?.data ?? {}
            }))
            // RootNavigation.navigate("SelectedJourneyDetails", { itemData: data?.data ?? {} })
            dispatch(completed_trips_state(completed_trips))
            dispatch(bookRide({
                select_route: select_route,
                completed_trips: completed_trips,
            }))
        } else {
            dispatch(select_route_state({}))
        }
    }).catch(error => {
        const apiResponse = responseHandler(error.response);
        dispatch(select_route_state({}))
    })
})
export const confirmRide = createAsyncThunk('master/confirmRide', async (data, { dispatch }) => {
    const confirm_ride = store?.getState()?.master?.confirm_ride ?? null
    dispatch(confirm_ride_state({ isLoading: true, confirm_ride: confirm_ride }))
    await performPostRequest(API.confirm_ride, data).then((res) => {
        const apiResponse = responseHandler(res)
        if (hasValue(apiResponse)) {
            dispatch(ride_status_state({ ride_status: "RIDE_ASSIGNED" }))
            dispatch(ride_vehicle_state({ ride_vehicle: data?.type ?? null }))
            if (data?.type === "BUS") {
                RootNavigation.navigate("TicketDetails", { itemData: apiResponse?.data ?? null })
            } else {
                RootNavigation.navigate("ConfirmedRide", {
                    itemData: apiResponse?.data ?? null
                })
            }
            dispatch(confirm_ride_state({
                confirm_ride: apiResponse?.data ?? null
            }))
            dispatch(completed_trips_state(data))
        } else {
            dispatch(confirm_ride_state({}))
        }
    }).catch(error => {
        const apiResponse = responseHandler(error.response);
        dispatch(confirm_ride_state({}))
    })
})

export const bookRide = createAsyncThunk('master/bookRide', async (data, { dispatch }) => {
    try {
        console.log('bookRide');
        console.log(data, 'data bookRide');
        // const select_route = data?.select_route ?? []
        // const completed_trips = data?.completed_trips ?? []
        const select_route = store?.getState()?.master?.select_route ?? null
        const completed_trips = store?.getState()?.user?.completed_trips ?? null
        const region_data = store?.getState()?.master?.region_data ?? null
        console.log(select_route, 'data select_route');
        console.log(completed_trips, 'data completed_trips');

        if (hasValue(completed_trips) && completed_trips.length > 0) {
            let item = null
            for (let index = 0; index < completed_trips.length; index++) {
                const element = completed_trips[index];
                if (element.isBooked === 0) {
                    item = element
                    break;
                }
            }
            console.log(item, 'item');
            if (!hasValue(item)) {
                return
            }
            let payloads = select_route
            if (select_route.length > 1) {
                select_route.forEach(element => {
                    if (item.id === element.id) {
                        payloads = element
                    }
                });
            }
            dispatch(confirmRide(payloads))


            console.log(payloads, 'payloads');

            // set current route
            let startLocation = item?.start?.gps ?? ""
            let start_data = startLocation.split(",")
            let source_lat = parseFloat(start_data[0])
            let source_lng = parseFloat(start_data[1])

            let endLocation = item?.end?.gps ?? ""
            let end_data = endLocation.split(",")
            let end_lat = parseFloat(end_data[0])
            let end_lng = parseFloat(end_data[1])
            const tmp_routeCoordinates = [
                {
                    latitude: source_lat,
                    longitude: source_lng,
                    latitudeDelta: API.LATITUDE_DELTA,
                    longitudeDelta: API.LONGITUDE_DELTA,
                    icon: item?.type === "AUTO" ? Images.auto_marker : Images.bus_marker
                },
                {
                    latitude: end_lat,
                    longitude: end_lng,
                    latitudeDelta: API.LATITUDE_DELTA,
                    longitudeDelta: API.LONGITUDE_DELTA,
                }
            ]
            console.log(tmp_routeCoordinates, 'tmp_routeCoordinates');
            dispatch(current_ride_coordinates_state({
                current_ride_coordinates: tmp_routeCoordinates
            }))
            dispatch(current_ride_region_state({
                current_ride_region: {
                    latitude: source_lat,
                    longitude: source_lng,
                    latitudeDelta: region_data?.latitudeDelta ?? API.LATITUDE_DELTA,
                    longitudeDelta: region_data?.longitudeDelta ?? API.LONGITUDE_DELTA
                }
            }))
        }
    } catch (error) {
        console.log(error);
    }
})
export const cancelRide = createAsyncThunk('master/cancelRide', async (data, { dispatch }) => {
    dispatch(common_state({ isLoading: true }))
    await performPostRequest(API.cancel_ride, data).then((res) => {
        const apiResponse = responseHandler(res)
        if (hasValue(apiResponse)) {
            RootNavigation.replace("Dashboard")
        }
        MyToast(apiResponse?.data?.message ?? "")
        dispatch(common_state({}))
    }).catch(error => {
        const apiResponse = responseHandler(error.response);
        dispatch(common_state({}))
    })
})
export const getHistory = createAsyncThunk('master/getHistory', async (data, { dispatch }) => {
    dispatch(history_state({ isLoading: true }))
    await performGetRequest(API.history + data.url).then((res) => {
        const apiResponse = responseHandler(res)
        if (hasValue(apiResponse)) {
            dispatch(history_state({
                history: apiResponse?.data ?? []
            }))
        } else {
            dispatch(history_state({}))
        }
    }).catch(error => {
        const apiResponse = responseHandler(error.response);
        dispatch(history_state({}))
    })
})
export const addRating = createAsyncThunk('master/addRating', async (data, { dispatch }) => {
    dispatch(common_state({ isLoading: true }))
    await performPostRequest(API.rating, data).then((res) => {
        const apiResponse = responseHandler(res)
        if (hasValue(apiResponse)) {
            RootNavigation.replace("Dashboard")
        }
        MyToast(apiResponse?.data?.message ?? "")
        dispatch(common_state({}))
    }).catch(error => {
        const apiResponse = responseHandler(error.response);
        dispatch(common_state({}))
    })
})
export const getRideUpdates = createAsyncThunk('master/getRideUpdates', async (data, { dispatch }) => {
    const ride_updates = store?.getState()?.master?.ride_updates ?? null
    dispatch(ride_updates_state({ isLoading: true, ride_updates: ride_updates }))
    await performPostRequest(API.get_ride_updates, data).then((res) => {
        const apiResponse = responseHandler(res)
        if (hasValue(apiResponse)) {
            dispatch(ride_updates_state({ ride_updates: apiResponse?.data?.descriptor ?? null }))
        } else {
            dispatch(ride_updates_state({}))
        }
        MyToast(apiResponse?.data?.message ?? "")
    }).catch(error => {
        const apiResponse = responseHandler(error.response);
        dispatch(ride_updates_state({}))
    })
})
export const ridesStatus = createAsyncThunk('master/ridesStatus', async (data, { dispatch }) => {
    dispatch(rides_status_state({ isLoading: true }))
    await performGetRequest(API.rides_status, data).then((res) => {
        const apiResponse = responseHandler(res)
        if (hasValue(apiResponse)) {
            dispatch(rides_status_state({ rides_status: apiResponse?.data ?? null }))
        } else {
            dispatch(rides_status_state({}))
        }
        MyToast(apiResponse?.data?.message ?? "")
    }).catch(error => {
        const apiResponse = responseHandler(error.response);
        dispatch(rides_status_state({}))
    })
})

export const masterSlice = createSlice({
    name: 'master',
    initialState: {
        isLoading: false,
        is_filter_visible: false,
        filter_value: false,
        job_details: [],
        select_route: null,
        confirm_ride: null,
        route_coordinates: [],
        region_data: {
            latitude: API.LATITUDE,
            longitude: API.LONGITUDE,
            latitudeDelta: API.LATITUDE_DELTA,
            longitudeDelta: API.LONGITUDE_DELTA,
        },
        current_ride_coordinates: [],
        current_ride_region: {
            latitude: API.LATITUDE,
            longitude: API.LONGITUDE,
            latitudeDelta: API.LATITUDE_DELTA,
            longitudeDelta: API.LONGITUDE_DELTA,
        },
        history: [],
        select_route_item: {},
        ride_updates: null,
        rides_status: null
    },
    reducers: {
        clear_master_state: (state, action) => {
            state.isLoading = false
            state.is_filter_visible = false
            state.filter_value = false
        },
        common_state: (state, action) => {
            state.isLoading = action?.payload?.isLoading ?? false
        },
        filter_state: (state, action) => {
            state.is_filter_visible = action?.payload?.is_filter_visible ?? false
        },
        filter_value_state: (state, action) => {
            state.filter_value = action?.payload?.filter_value ?? null
        },
        get_job_details_state: (state, action) => {
            state.isLoading = action?.payload?.isLoading ?? false
            state.job_details = action?.payload?.job_details ?? []
        },
        select_route_state: (state, action) => {
            state.isLoading = action?.payload?.isLoading ?? false
            state.select_route = action?.payload?.select_route ?? null
            state.select_route_item = action?.payload?.select_route_item ?? null
        },
        confirm_ride_state: (state, action) => {
            state.isLoading = action?.payload?.isLoading ?? false
            state.confirm_ride = action?.payload?.confirm_ride ?? null
        },
        route_coordinates_state: (state, action) => {
            state.route_coordinates = action?.payload?.route_coordinates ?? []
        },
        region_state: (state, action) => {
            state.region_data = action?.payload?.region_data ?? {
                latitude: API.LATITUDE,
                longitude: API.LONGITUDE,
                latitudeDelta: API.LATITUDE_DELTA,
                longitudeDelta: API.LONGITUDE_DELTA,
            }
        },
        current_ride_coordinates_state: (state, action) => {
            state.current_ride_coordinates = action?.payload?.current_ride_coordinates ?? []
        },
        current_ride_region_state: (state, action) => {
            state.current_ride_region = action?.payload?.current_ride_region ?? {
                latitude: API.LATITUDE,
                longitude: API.LONGITUDE,
                latitudeDelta: API.LATITUDE_DELTA,
                longitudeDelta: API.LONGITUDE_DELTA,
            }
        },
        history_state: (state, action) => {
            state.isLoading = action?.payload?.isLoading ?? false
            state.history = action?.payload?.history ?? []
        },
        ride_updates_state: (state, action) => {
            state.isLoading = action?.payload?.isLoading ?? false
            state.ride_updates = action?.payload?.ride_updates ?? null
        },
        rides_status_state: (state, action) => {
            state.isLoading = action?.payload?.isLoading ?? false
            state.rides_status = action?.payload?.rides_status ?? null
        },
    },
})

export default masterSlice.reducer
export const {
    clear_master_state,
    common_state,
    filter_state,
    filter_value_state,
    get_job_details_state,
    select_route_state,
    confirm_ride_state,
    route_coordinates_state,
    region_state,
    current_ride_coordinates_state,
    current_ride_region_state,
    history_state,
    ride_updates_state,
    rides_status_state
} = masterSlice.actions
