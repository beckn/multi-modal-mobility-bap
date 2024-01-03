import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { performDeleteRequest, performGetRequest, performPostRequest, performPutRequest, performPostRequest_FormData } from '../../../constants/axios-utils'
import { API } from '../../../shared/API-end-points'
import { clearStorage, multipleMassage, getStorage, hasValue, MyAlert, MyToast, responseHandler, setStorage, isCompletedTrip } from '../../../Utils'
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
        const status = apiResponse?.data?.status ?? null
        const job_details = apiResponse?.data?.response ?? null
        if (status === "IN PROGRESS") {
            setTimeout(() => {
                dispatch(getJobDetails(data))
            }, 10000);
            return
        }
        if (status === "FAILED") {
            dispatch(get_job_details_state({}))
            return
        }
        if (hasValue(apiResponse)) {
            if (hasValue(job_details)) {
                dispatch(get_job_details_state({
                    job_details: job_details
                }))
                RootNavigation.navigate("AvailableOptions", { itemData: data?.data?.itemData ?? {} })
            }
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
            // const completed_trips = data?.completed_trips ?? []
            let tmpCompleted_trips = []
            if (hasValue(select_route)) {
                if (Array.isArray(select_route) && select_route.length > 0) {
                    select_route.forEach(element => {
                        tmpCompleted_trips.push({
                            ...element,
                            status: "SELECTED"
                        })
                    });
                } else {
                    tmpCompleted_trips = [{
                        ...select_route,
                        status: "SELECTED"
                    }]
                }
            }
            dispatch(select_route_state({
                isLoading: true,
                select_route: select_route,
                select_route_item: data?.data ?? {}
            }))
            dispatch(completed_trips_state(tmpCompleted_trips))
            dispatch(confirmRide({}))
        } else {
            dispatch(select_route_state({}))
        }
    }).catch(error => {
        const apiResponse = responseHandler(error.response);
        dispatch(select_route_state({}))
    })
})
export const confirmRide = createAsyncThunk('master/confirmRide', async (data, { dispatch }) => {
    try {
        const confirm_ride = store?.getState()?.master?.confirm_ride ?? null
        dispatch(confirm_ride_state({ isLoading: true, confirm_ride: confirm_ride }))
        const select_route = store?.getState()?.master?.select_route ?? null
        const rides_status = store?.getState()?.master?.rides_status ?? null
        const completed_trips = store?.getState()?.user?.completed_trips ?? null
        if (hasValue(completed_trips) && completed_trips.length > 0) {
            let payloads = null
            for (let index = 0; index < completed_trips.length; index++) {
                const element = completed_trips[index];
                if (element.status === "SELECTED" && (index == 2 && completed_trips?.length == 3 ? (element.type != "AUTO" || data?.apiCall) : true)) {
                    payloads = element
                    break;
                }
            }
            for (let index = 0; index < completed_trips.length; index++) {
                const element = completed_trips[index];
                const element_first = completed_trips[0];
                if (element_first.status === "SELECTED" && payloads) {
                    dispatch(setCurrentRoute(payloads))
                    break;
                } else if ((element.status === "CONFIRMED" || element.status === "IN_PROGRESS") && payloads) {
                    dispatch(setCurrentRoute(payloads))
                    break;
                }
            }
            if (!hasValue(payloads)) {
                return
            }
            await performPostRequest(API.confirm_ride, payloads).then((res) => {
                const apiResponse = responseHandler(res)
                if (hasValue(apiResponse)) {
                    dispatch(ridesStatus({
                        navigate: "navigate",
                        payloads: payloads,
                        apiResponse: apiResponse?.data ?? null,
                        data: data
                    }))
                    dispatch(ride_status_state({ ride_status: "RIDE_ASSIGNED" }))
                    dispatch(ride_vehicle_state({ ride_vehicle: payloads?.type ?? null }))
                    dispatch(confirm_ride_state({
                        confirm_ride: apiResponse?.data ?? null
                    }))
                } else {
                    dispatch(confirm_ride_state({}))
                }
            }).catch(error => {
                const apiResponse = responseHandler(error.response);
                dispatch(confirm_ride_state({}))
            })
        }
    } catch (error) {
        const apiResponse = responseHandler(error);
        dispatch(confirm_ride_state({}))
    }
})

export const setCurrentRoute = createAsyncThunk('master/setCurrentRoute', async (data, { dispatch }) => {
    try {
        const region_data = store?.getState()?.master?.region_data ?? null
        let startLocation = ""
        let endLocation = ""
        if (hasValue(data?.fulfillment?.end?.location?.gps ?? "")) {
            startLocation = data?.fulfillment?.start?.location?.gps ?? ""
            endLocation = data?.fulfillment?.end?.location?.gps ?? ""
        } else {
            startLocation = data?.start?.gps ?? ""
            endLocation = data?.end?.gps ?? ""
        }

        let start_data = startLocation.split(",")
        let source_lat = parseFloat(start_data[0])
        let source_lng = parseFloat(start_data[1])

        let end_data = endLocation.split(",")
        let end_lat = parseFloat(end_data[0])
        let end_lng = parseFloat(end_data[1])
        const tmp_routeCoordinates = [
            {
                latitude: source_lat,
                longitude: source_lng,
                latitudeDelta: API.LATITUDE_DELTA,
                longitudeDelta: API.LONGITUDE_DELTA,
                icon: data?.type === "AUTO" ? Images.auto_marker : Images.bus_marker
            },
            {
                latitude: end_lat,
                longitude: end_lng,
                latitudeDelta: API.LATITUDE_DELTA,
                longitudeDelta: API.LONGITUDE_DELTA,
            }
        ]
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
    } catch (error) {
        console.log(error);
    }
})
export const cancelRide = createAsyncThunk('master/cancelRide', async (data, { dispatch }) => {
    dispatch(cancel_ride_state({ isLoadingCancel: true }))
    await performPostRequest(API.cancel_ride, data).then((res) => {
        const apiResponse = responseHandler(res)
        if (hasValue(apiResponse)) {
            RootNavigation.replace("Dashboard")
            dispatch(getRideUpdates({
                "cancel": "CANCELED"
            }))
        }
        MyToast(apiResponse?.data?.message ?? "")
        dispatch(cancel_ride_state({}))
    }).catch(error => {
        const apiResponse = responseHandler(error.response);
        dispatch(cancel_ride_state({}))
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
    dispatch(rides_status_state({}))
    dispatch(completed_trips_state({}))
    dispatch(ride_updates_state({}))
    dispatch(getRideUpdates({ "cancel": "CANCELED" }))
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
    const rides_status = store?.getState()?.master?.rides_status ?? null
    const completed_trips = store?.getState()?.user?.completed_trips ?? null
    dispatch(ride_updates_state({ isLoading: false, ride_updates: ride_updates }))
    const cancel = data?.cancel ?? null
    if (hasValue(cancel)) {
        dispatch(ride_updates_state({}))
        return
    }
    const ride_code = ride_updates?.descriptor?.code ?? null
    if (ride_code === "RIDE_COMPLETED" && completed_trips?.length != 3) {
        return
    }
    await performPostRequest(API.get_ride_updates, data).then((res) => {
        const apiResponse = responseHandler(res)
        if (hasValue(apiResponse)) {
            const code = apiResponse?.data?.descriptor?.code ?? null
            dispatch(ride_updates_state({ ride_updates: apiResponse?.data ?? null }))
            dispatch(ridesStatus({ isLoading: false }))

            let rideStatus = "IN_PROGRESS"
            if (hasValue(rides_status) && Array.isArray(rides_status) && rides_status.length > 0) {
                rideStatus = rides_status[0].status
            }
            if (code != "RIDE_COMPLETED") {
                setTimeout(() => {
                    if (rideStatus != "CANCELLED") {
                        dispatch(getRideUpdates(data))
                    }
                }, 30000);
            }
            if (code === "RIDE_IN_PROGRESS") {
                if (isCompletedTrip()) {
                    dispatch(confirmRide({ data: "", autoBook: "autoBook" }))
                }
            }
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
    // const rides_status = store?.getState()?.master?.rides_status ?? null
    dispatch(rides_status_state({ isLoading: data?.isLoading ?? true }))
    await performGetRequest(API.rides_status, data).then((res) => {
        const apiResponse = responseHandler(res)
        if (hasValue(apiResponse)) {
            dispatch(rides_status_state({ rides_status: apiResponse?.data ?? null }))
            dispatch(completed_trips_state(apiResponse?.data[0]?.details ?? []))
            const is_navigate = data?.navigate ?? null
            if (hasValue(is_navigate)) {
                const ride_type = data?.payloads?.type ?? null
                if (ride_type === "BUS") {
                    if (!hasValue(data?.data?.autoBook ?? null)) {
                        RootNavigation.navigate("TicketDetails", { itemData: data?.apiResponse ?? null })
                    }
                } else {
                    // dispatch(ride_updates_state({}))
                    RootNavigation.navigate("ConfirmedRide", {
                        itemData: data?.apiResponse ?? null
                    })
                }
            }
        } else {
            dispatch(rides_status_state({}))
            dispatch(completed_trips_state({}))
        }
        MyToast(apiResponse?.data?.message ?? "")
    }).catch(error => {
        const apiResponse = responseHandler(error.response);
        dispatch(rides_status_state({}))
        dispatch(completed_trips_state({}))
    })
})
export const busStatus = createAsyncThunk('master/busStatus', async (data, { dispatch }) => {
    dispatch(bus_status_state({ isLoading: true }))
    await performPostRequest(API.bus_status, data).then((res) => {
        const apiResponse = responseHandler(res)
        dispatch(ridesStatus({}))
        if (hasValue(apiResponse)) {
            dispatch(bus_status_state({ bus_status: apiResponse?.data ?? null }))
        } else {
            dispatch(bus_status_state({}))
        }
        MyToast(apiResponse?.data?.message ?? "")
    }).catch(error => {
        const apiResponse = responseHandler(error.response);
        dispatch(bus_status_state({}))
    })
})
export const getDistance = createAsyncThunk('master/getDistance', async ({originLatitude,originLongitude , destinationLatitude , destinationLongitude,}, { dispatch }) => {
    await performPostRequest(API.get_distance + `?origin=${originLatitude},${originLongitude}&destination=${destinationLatitude},${destinationLongitude}&key=${API.map_key}`).then((res) => {
        const apiResponse = responseHandler(res)
        if (hasValue(apiResponse)) {
            dispatch(get_distance_state({ get_distance: apiResponse?.data?.routes?.[0]?.legs ?? [] }))
        } 
        else {
            dispatch(get_distance_state({}))
        }
    }
    )
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
        rides_status: null,
        bus_status: null,
        isLoadingCancel: false,
        get_distance: []
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
        bus_status_state: (state, action) => {
            state.isLoading = action?.payload?.isLoading ?? false
            state.bus_status = action?.payload?.bus_status ?? null
        },
        cancel_ride_state: (state, action) => {
            state.isLoadingCancel = action?.payload?.isLoadingCancel ?? false
        },
        get_distance_state: (state, action) => {
            state.get_distance = action?.payload?.get_distance ?? []
        }
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
    rides_status_state,
    bus_status_state,
    cancel_ride_state,
    get_distance_state,
} = masterSlice.actions
