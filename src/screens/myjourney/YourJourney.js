import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, FlatList, Image, ScrollView
} from 'react-native';
import { Images } from '../../commonStyles/Images'
import { C, F, HT, L, WT, h } from '../../commonStyles/style-layout';
import { Header, Loader, TouchableOpacity, Button } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import { hasValue, isCompletedTrip, toFixed } from '../../Utils';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { API } from '../../shared/API-end-points';
import MapViewDirections from 'react-native-maps-directions';
import RootNavigation from '../../Navigation/RootNavigation';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { busStatus, confirmRide, current_ride_coordinates_state, getRideUpdates, current_ride_region_state, ridesStatus } from '../master/masterSlice';
import { ride_status_state } from '../user/userSlice';
STR = require('../../languages/strings');

function YourJourney({ navigation, route }) {
    const dispatch = useDispatch()
    const responseDataUser = useSelector(state => state.user)
    const responseDataMaster = useSelector(state => state.master)
    const ride_vehicle = responseDataUser?.ride_vehicle ?? null
    const ride_status = responseDataUser?.ride_status ?? null
    const rides_status = responseDataMaster?.rides_status ?? null
    const route_coordinates = responseDataMaster?.current_ride_coordinates ?? []
    const ride_updates = responseDataMaster?.ride_updates?.descriptor ?? null
    const region_data = responseDataMaster?.current_ride_region ?? {
        latitude: API.LATITUDE,
        longitude: API.LONGITUDE,
        latitudeDelta: API.LATITUDE_DELTA,
        longitudeDelta: API.LONGITUDE_DELTA,
    }
    const select_route = responseDataMaster?.select_route ?? null
    const confirm_ride = responseDataMaster?.confirm_ride ?? null
    const completed_trips = responseDataUser?.completed_trips ?? []
    var mapRef = useRef(null);
    var markerRef = useRef(null);
    const [vehicleData, set_vehicleData] = useState([]);
    const [headerLabel, setHeaderLabel] = useState("Your Journey");
    const [quantity, set_quantity] = useState(0);
    const [modalConfirm, set_modalConfirm] = useState(false);
    const [rideDetails, setRideDetails] = useState({});

    useFocusEffect(
        React.useCallback(() => {
            dispatch(ridesStatus({}))
            return () => { };
        }, []),
    );

    useEffect(() => {
        setJourneyData()
    }, [rides_status]);

    useEffect(() => {
        setJourneyData()
    }, [completed_trips]);

    function setJourneyData() {
        try {
            set_vehicleData(completed_trips)
            if (hasValue(completed_trips) && completed_trips.length > 0) {
                for (let index = 0; index < completed_trips.length; index++) {
                    const element = completed_trips[index];
                    if (element.status != "SELECTED") {
                        setRideDetails(element)
                        if (element.status === "CONFIRMED" || element.status === "COMPLETED" || element.status === "IN_PROGRESS") {
                            onHeaderLabel(element)
                            const type = element?.type ?? null
                            const status = element?.status ?? null
                            if (type === "BUS") {
                                if (status === "CONFIRMED") {
                                    set_quantity(0)
                                }
                                if (status === "IN_PROGRESS") {
                                    set_quantity(1)
                                }
                                if (status === "COMPLETED") {
                                    set_quantity(2)
                                }
                            }
                            if (element.status === "IN_PROGRESS") {
                                break;
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    function onHeaderLabel(element) {
        try {
            const type = element?.type ?? null
            const status = element?.status ?? null
            const code = ride_updates?.code ?? null
            if (type === "AUTO") {
                // if (code === "RIDE_IN_PROGRESS") {
                if (status === "IN_PROGRESS") {
                    setHeaderLabel("Your Journey")
                    // fetchRideStatus()
                } else if (status === "CONFIRMED") {
                    setHeaderLabel("Your Journey is confirmed")
                    // fetchRideStatus()
                } else if (status === "COMPLETED") {
                    setHeaderLabel("Your Journey")
                } else {
                    setHeaderLabel("Your Journey")
                }
            } else {
                if (status === "CONFIRMED") {
                    setHeaderLabel("Your Journey is confirmed")
                    if (quantity === 1) {
                        setHeaderLabel("Bus journey has started")
                    }
                } else if (status === "COMPLETED") {
                    setHeaderLabel("Bus journey has Completed")
                } else if (status === "IN_PROGRESS") {
                    setHeaderLabel("Bus journey has started")
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    function fetchRideStatus() {
        try {
            if (hasValue(rides_status)) {
                if (hasValue(rides_status) && Array.isArray(rides_status) && rides_status.length > 0) {
                    let payloads = {}
                    for (let index = 0; index < rides_status[0].details.length; index++) {
                        const element = rides_status[0].details[index];
                        if (element.status != "SELECTED" && element.type === "AUTO") {
                            payloads = element
                            break;
                        }
                    }
                    dispatch(getRideUpdates({
                        "routeId": rides_status[0].routeId,
                        "order_id": payloads?.order_id ?? ""
                    }))
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    function onItemPress(item) {
        try {
            if (item.type === "AUTO") {
                if (item.status != "SELECTED") {
                    if (item.status === "COMPLETED") {
                        RootNavigation.navigate("RideCompleted", { itemData: item })
                    } else {
                        RootNavigation.navigate("ConfirmedRide", { itemData: item })
                    }
                } else {
                    onBookRide()
                }
            } else {
                if (item.status === "CONFIRMED") {
                    RootNavigation.navigate("TicketDetails", { itemData: item })
                } else if (item.status === "IN_PROGRESS") {
                    RootNavigation.navigate("TicketDetails", { itemData: item })
                } else if (item.status === "COMPLETED") {
                    RootNavigation.navigate("TicketDetails", { itemData: item })
                } else {
                    // onBookRide()
                }
            }

        } catch (error) {
            console.log(error);
        }
    }

    const renderItem = (item, index) => {
        let image = item.type === "AUTO" ? Images.auto : Images.bus_full
        let sub_title = ""
        let showPrice = false
        if (item.status === "SELECTED") {
            sub_title = item.type === "AUTO" ? STR.strings.ride_not_started_yet : "Ticket not confirmed"
        } else if (item.status === "CONFIRMED") {
            sub_title = item.type === "AUTO" ? "Ride Confirmed" : "Ticket Confirmed"
            showPrice = true
        } else if (item.status === "IN_PROGRESS") {
            sub_title = "Ride has Started"
            showPrice = true
        } else if (item.status === "COMPLETED") {
            sub_title = "Ride Completed"
            showPrice = true
        } else if (item.status === "FAILED") {
            sub_title = "Ride failed"
        }
        return (
            <TouchableOpacity style={[WT('100%'), HT(70), L.jcC, C.bgWhite, L.card, L.mB3]}
                onPress={() => { onItemPress(item) }}>
                <View style={[WT('100%'), L.pV10, L.pH10, L.even, L.aiC, L.jcSB]}>
                    <View style={[WT('50%'), L.even, L.aiC]}>
                        <View style={[HT(25), WT(30), L.bR4, L.jcC, L.aiC, C.bgWhite, L.card, C.brLight, L.br05]}>
                            <Image style={[HT(18), WT(18)]} source={image} />
                        </View>
                        <View style={[WT(8)]} />
                        <View style={[]}>
                            <Text style={[C.fcBlack, F.ffB, F.fsOne4]}>{item?.type ?? "NA"}</Text>
                            <Text style={[C.lColor, F.ffM, F.fsOne2]}>{sub_title}</Text>
                        </View>
                    </View>
                    <View style={[WT('50%'), L.aiR]}>
                        {showPrice &&
                            <Text style={[C.fcBlack, F.ffB, F.fsOne4]}
                            >{hasValue(item?.price?.value ?? "") ? toFixed(item?.price?.value ?? "") != 0 ? "Rs " + toFixed(item?.price?.value ?? "") : "Rs " + item?.price?.value ?? "" : ""}</Text>
                        }
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    function onSubmit(flag) {
        try {
            if (flag === 0) {
                dispatch(ride_status_state({ ride_status: "RIDE_ASSIGNED" }))
            } else if (flag === 1) {
                dispatch(ride_status_state({ ride_status: "RIDE_STARTED" }))
                for (let index = 0; index < vehicleData.length; index++) {
                    const element = vehicleData[index];
                    if (element.type === "BUS") {
                        dispatch(busStatus({
                            "routeId": rides_status[0].routeId,
                            "order_id": element?.order_id ?? "",
                            // "status": "RIDE_STARTED"
                            "status": "RIDE_IN_PROGRESS"
                        }))
                        break;
                    }
                }
            } else {
                dispatch(ride_status_state({ ride_status: "RIDE_COMPLETED" }))
                for (let index = 0; index < vehicleData.length; index++) {
                    const element = vehicleData[index];
                    if (element.type === "BUS") {
                        dispatch(busStatus({
                            "routeId": rides_status[0].routeId,
                            "order_id": element?.order_id ?? "",
                            "status": "RIDE_COMPLETED"
                        }))
                        break;
                    }
                }
                onBookRide()
            }
            set_quantity(quantity + 1)
        } catch (error) {
            console.log(error);
        }
    }
    function onBookRide() {
        try {
            if (isCompletedTrip(0)) {
                // set_modalConfirm(true)
                // dispatch(confirmRide({}))
            } else {
                RootNavigation.replace("RateTrip")
            }
        } catch (error) {
            console.log(error);
        }
    }
    function journeyLabel() {
        try {
            let label = "Has your bus ride started?"
            if (quantity === 0) {
                label = "Has your bus ride started?"
            } else if (quantity === 1) {
                label = "Has your bus ride ended?"
            } else {
                label = "Has your bus ride ended?"
            }
            return label
        } catch (error) {
            return "Has you your ride started?"
        }
    }

    function busBtn() {
        try {
            let status = false
            const type = rideDetails?.type ?? null
            const bus_status = rideDetails?.status ?? null
            if (type === "BUS") {
                if (bus_status === "CONFIRMED") {
                    status = true
                }
                if (bus_status === "IN_PROGRESS") {
                    status = true
                }
            }
            return status
        } catch (error) {
            console.log(error);
            return false
        }
    }
    console.log(route_coordinates, 'route_coordinates');
    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen2]}>
            <Header navigation={navigation} hardwareBack={'Dashboard'} left_press={'Dashboard'} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} style={[C.bgTrans]} ic_left={Images.back} label_left={headerLabel} />
            {responseDataMaster.isLoading && <Loader isLoading={responseDataMaster.isLoading} />}
            <ScrollView>
                <View style={[WT('95%'), HT(300), L.asC, L.bR10, L.mT10, { overflow: 'hidden' }, L.card, L.br05, C.brLight]}>
                    <MapView
                        provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                        ref={ref => mapRef = ref}
                        style={[WT('100%'), HT('100%')]}
                        showsMyLocationButton={true}
                        followsUserLocation={true}
                        showsCompass={true}
                        region={region_data}>
                        {hasValue(route_coordinates) && route_coordinates.length > 0 && <>
                            <>
                                {route_coordinates.map(function (element, index) {
                                    return (<>
                                        {hasValue(element?.icon ?? "") ?
                                            (<Marker coordinate={element}>
                                                {hasValue(element?.icon ?? "") &&
                                                    <Image source={element?.icon} resizeMode="contain" style={[WT(20), HT(20)]} />
                                                }
                                            </Marker>) :
                                            (<>
                                                {route_coordinates.length == index + 1 &&
                                                    <Marker coordinate={element} />
                                                }
                                            </>)
                                        }
                                    </>)
                                })}
                            </>
                            <MapViewDirections
                                origin={route_coordinates[0]}
                                destination={route_coordinates.length > 1 ? route_coordinates[route_coordinates.length - 1] : route_coordinates[0]}
                                apikey={API.map_key}
                                mode='DRIVING'
                                strokeWidth={4}
                                strokeColor={C.strokeColor}
                                fillColor={C.fillColor}
                                waypoints={route_coordinates}
                                optimizeWaypoints={false}
                                splitWaypoints={true}
                                resetOnChange={false}
                                precision={'high'}
                            />
                        </>}
                    </MapView>
                </View>
                <View style={[L.mT20]}>
                    <FlatList
                        keyboardShouldPersistTaps='always'
                        keyExtractor={(item, index) => String(index)}
                        data={vehicleData}
                        renderItem={({ item, index }) => renderItem(item, index)}
                        contentContainerStyle={[{ paddingBottom: h(0) }]}
                    />
                </View>
                <View style={[HT(100)]} />
            </ScrollView>
            {/* <View style={[C.bgTrans, L.pH10, L.dpARL]}>
                <TouchableOpacity onPress={() => { onBookRide() }}
                    style={[WT('100%'), HT(45), L.br05, C.bgBlack, L.bR5, L.jcC, L.aiC]}>
                    <Text style={[C.fcWhite, F.ffB, F.fsOne5, L.taC]}>Next</Text>
                </TouchableOpacity>
                <View style={[HT(15)]} />
            </View> */}
            {busBtn() &&
                <View style={[C.bgWhite, L.card, C.brLight, L.br05, L.aiC, L.jcC, HT(150), L.dpARL, { bottom: 0 }]}>
                    <Text style={[C.fcBlack, F.ffM, L.taC, F.fsOne5]}>{journeyLabel()}</Text>
                    <View style={[HT(25)]} />
                    <Button onPress={() => { onSubmit(quantity + 1) }} style={[WT('90%'), HT(45)]} label={"Yes"} />
                </View>
            }
        </View>
    );
}

export default YourJourney
