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
import { confirmRide, current_ride_coordinates_state, current_ride_region_state } from '../master/masterSlice';
import { ride_status_state } from '../user/userSlice';
STR = require('../../languages/strings');

function YourJourney({ navigation, route }) {
    const dispatch = useDispatch()
    const responseDataUser = useSelector(state => state.user)
    const responseDataMaster = useSelector(state => state.master)
    const ride_vehicle = responseDataUser?.ride_vehicle ?? null
    const ride_status = responseDataUser?.ride_status ?? null
    const route_coordinates = responseDataMaster?.current_ride_coordinates ?? []
    const region_data = responseDataMaster?.current_ride_region ?? {
        latitude: API.LATITUDE,
        longitude: API.LONGITUDE,
        latitudeDelta: API.LATITUDE_DELTA,
        longitudeDelta: API.LONGITUDE_DELTA,
    }
    const select_route = responseDataMaster?.select_route ?? null
    const completed_trips = responseDataUser?.completed_trips ?? []
    var mapRef = useRef(null);
    var markerRef = useRef(null);
    const [vehicleData, set_vehicleData] = useState([]);
    const [headerLabel, setHeaderLabel] = useState("Your Journey");
    const [quantity, set_quantity] = useState(0);
    const [modalConfirm, set_modalConfirm] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            set_vehicleData(completed_trips)
            return () => { };
        }, [completed_trips]),
    );

    useEffect(() => {
        try {
            if (ride_vehicle === "AUTO") {
                if (ride_status === "RIDE_STARTED") {
                    setHeaderLabel("Your Journey is confirmed")
                } else {
                    setHeaderLabel("Your Journey")
                }
            } else {
                if (ride_status === "RIDE_ASSIGNED") {
                    setHeaderLabel("Bus journey is confirmed")
                } else if (ride_status === "RIDE_STARTED") {
                    setHeaderLabel("Bus journey has started")
                } else if (ride_status === "RIDE_COMPLETED") {
                    setHeaderLabel("Bus journey has Completed")
                }
            }
        } catch (error) {
            console.log(error);
        }
    }, [ride_status]);

    function onItemPress(item) {
        try {
            if (item.type === "AUTO") {
                if (item.isBooked === 1) {
                    RootNavigation.navigate("RideCompleted")
                } else {
                    bookRide()
                }
            } else {
                if (item.isBooked === 1) {
                    RootNavigation.navigate("TicketDetails")
                } else {
                    bookRide()
                }
            }

        } catch (error) {
            console.log(error);
        }
    }
    function bookRide() {
        try {
            if (isCompletedTrip(0)) {
                onBook()
            } else {
                RootNavigation.replace("RateTrip")
            }
        } catch (error) {
            console.log(error);
        }
    }
    function onBook() {
        try {
            set_modalConfirm(true)
            if (hasValue(completed_trips) && completed_trips.length > 0) {
                let item = null
                for (let index = 0; index < completed_trips.length; index++) {
                    const element = completed_trips[index];
                    if (element.isBooked === 0) {
                        item = element
                        break;
                    }
                }
                if (!hasValue(item)) {
                    return
                }
                if (item.type === "BUS") {
                    let payloads = select_route
                    if (select_route.length > 1) {
                        select_route.forEach(element => {
                            if (item.id === element.id) {
                                payloads = element
                            }
                        });
                    }
                    dispatch(confirmRide(payloads))
                } else {
                    if (select_route.length > 1) {
                        select_route.forEach(element => {
                            if (item.id === element.id) {
                                dispatch(confirmRide(element))
                            }
                        });
                    } else {
                        dispatch(confirmRide(select_route))
                    }
                }
                setCurrentRoutes(item)
            }
        } catch (error) {
            console.log(error);
        }
    }
    function setCurrentRoutes(item) {
        try {
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
    }
    const renderItem = (item, index) => {
        let image = Images.auto
        let title = ""
        let sub_title = ""
        let showPrice = false
        if (item.type === "AUTO") {
            image = Images.auto
            title = "Auto"
            if (ride_vehicle === "AUTO") {
                if (ride_status === "RIDE_ASSIGNED") {
                    sub_title = "Ride Confirmed"
                } else if (ride_status === "RIDE_STARTED") {
                    sub_title = "Ride Confirmed"
                } else if (ride_status === "RIDE_IN_PROGRESS") {
                    sub_title = "Ride Started"
                    showPrice = true
                } else if (ride_status === "RIDE_COMPLETED") {
                    sub_title = "Ride Completed"
                    showPrice = true
                } else {
                    sub_title = item.isBooked === 1 ? "Ride Completed" : STR.strings.ride_not_started_yet
                    if (item.isBooked === 1) {
                        showPrice = true
                    }
                }
            } else {
                sub_title = item.isBooked === 1 ? "Ride Completed" : STR.strings.ride_not_started_yet
                if (item.isBooked === 1) {
                    showPrice = true
                }
            }
        } else if (item.type === "BUS") {
            image = Images.bus_full
            title = "Bus"
            if (ride_vehicle === "BUS") {
                if (ride_status === "RIDE_ASSIGNED") {
                    sub_title = "Ticket Confirmed"
                } else if (ride_status === "RIDE_STARTED") {
                    sub_title = "Bus ride started"
                    showPrice = true
                } else if (ride_status === "RIDE_COMPLETED") {
                    sub_title = "Ride Completed"
                    showPrice = true
                } else {
                    sub_title = item.isBooked === 1 ? "Ride Completed" : STR.strings.ride_not_started_yet
                    if (item.isBooked === 1) {
                        showPrice = true
                    }
                }
            } else {
                sub_title = item.isBooked === 1 ? "Ride Completed" : STR.strings.ride_not_started_yet
                if (item.isBooked === 1) {
                    showPrice = true
                }
            }
        } else {
            image = Images.bus_full
            if (ride_vehicle === "BUS") {
                if (ride_status === "RIDE_ASSIGNED") {
                    sub_title = "Ticket Confirmed"
                } else if (ride_status === "RIDE_STARTED") {
                    sub_title = "Bus ride started"
                    showPrice = true
                } else if (ride_status === "RIDE_COMPLETED") {
                    sub_title = "Ride Completed"
                    showPrice = true
                } else {
                    sub_title = item.isBooked === 1 ? "Ride Completed" : STR.strings.ride_not_started_yet
                    if (item.isBooked === 1) {
                        showPrice = true
                    }
                }
            } else {
                sub_title = item.isBooked === 1 ? "Ride Completed" : STR.strings.ride_not_started_yet
                if (item.isBooked === 1) {
                    showPrice = true
                }
            }
        }
        return (
            <>
                {/*  <TouchableOpacity disabled={item.isBooked === 1 ? true : false} style={[WT('100%'), HT(70), L.jcC, C.bgWhite, L.card, L.mB3, item.isBooked === 1 ? L.opc4 : L.opc1]} */}
                <TouchableOpacity style={[WT('100%'), HT(70), L.jcC, C.bgWhite, L.card, L.mB3]}
                    onPress={() => { onItemPress(item) }}>
                    <View style={[WT('100%'), L.pV10, L.pH10, L.even, L.aiC, L.jcSB]}>
                        <View style={[WT('12%')]}>
                            <View style={[HT(25), WT(30), L.bR4, L.jcC, L.aiC, C.bgWhite, L.card, C.brLight, L.br05]}>
                                <Image style={[HT(18), WT(18)]} source={image} />
                            </View>
                        </View>
                        <View style={[WT('68%')]}>
                            <Text style={[C.fcBlack, F.ffB, F.fsOne4]}>{title}</Text>
                            <Text style={[C.lColor, F.ffM, F.fsOne2]}>{sub_title}</Text>
                        </View>
                        <View style={[WT('20%'), L.aiR]}>
                            {showPrice &&
                                <Text style={[C.fcBlack, F.ffB, F.fsOne4]} numberOfLines={1}
                                >{hasValue(item?.price?.value ?? "") ? toFixed(item?.price?.value ?? "") != 0 ? "Rs " + toFixed(item?.price?.value ?? "") : "Rs " + item?.price?.value ?? "" : ""}</Text>
                            }
                        </View>
                    </View>
                </TouchableOpacity>

            </>
        )
    }
    console.log(quantity, 'quantity');
    function onSubmit(flag) {
        try {
            console.log(flag, 'flag');
            if (flag === 0) {
                dispatch(ride_status_state({ ride_status: "RIDE_ASSIGNED" }))
            } else if (flag === 1) {
                dispatch(ride_status_state({ ride_status: "RIDE_STARTED" }))
            } else {
                dispatch(ride_status_state({ ride_status: "RIDE_COMPLETED" }))
                bookRide()
            }
            set_quantity(quantity + 1)
        } catch (error) {
            console.log(error);
        }
    }
    function journeyLabel() {
        try {
            let label = "Has you bus ride started?"
            if (quantity === 0) {
                label = "Has you bus ride started?"
            } else if (quantity === 1) {
                label = "Has your bus ride ended?"
            } else {
                label = "Has your bus ride ended?"
            }
            return label
        } catch (error) {
            return "Has you bus ride started?"
        }
    }
    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen2]}>
            <Header navigation={navigation} hardwareBack={'Dashboard'} left_press={'Dashboard'} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} style={[C.bgTrans]} ic_left={Images.back} label_left={headerLabel} />
            {/* <Header navigation={navigation} hardwareBack={"progress_trip"} left_press={"progress_trip"} height={HT(70)} card={false} style={[C.bgTrans]} label_left={"Your Journey is completed"} ic_right={Images.call} ic_right_style={[WT(25), HT(25)]} ic_right_press={"call"} /> */}
            {/* <Header navigation={navigation} hardwareBack={"progress_trip"} left_press={"progress_trip"} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} style={[C.bgTrans]} ic_left={Images.back} label_left={"Your Journey is completed"} ic_right={Images.call} ic_right_style={[WT(25), HT(25)]} ic_right_press={"call"} /> */}
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
            {ride_vehicle === "BUS" && ride_status != "completed" &&
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
