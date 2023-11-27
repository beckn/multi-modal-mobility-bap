import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, FlatList, Image, ScrollView
} from 'react-native';
import { Images } from '../../commonStyles/Images'
import { C, F, HT, L, WT, h } from '../../commonStyles/style-layout';
import { Header, Loader, TouchableOpacity, Button } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import { hasValue, isCompletedTrip } from '../../Utils';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { API } from '../../shared/API-end-points';
import MapViewDirections from 'react-native-maps-directions';
import RootNavigation from '../../Navigation/RootNavigation';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { confirmRide, current_ride_coordinates_state, current_ride_region_state } from '../master/masterSlice';
STR = require('../../languages/strings');

function JourneyCompleted({ navigation, route }) {
    const dispatch = useDispatch()
    const responseDataUser = useSelector(state => state.user)
    const responseDataMaster = useSelector(state => state.master)
    const route_coordinates = responseDataMaster?.route_coordinates ?? []
    const region_data = responseDataMaster?.region_data ?? {
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

    useFocusEffect(
        React.useCallback(() => {
            set_vehicleData(completed_trips)
            return () => {

            };
        }, [completed_trips]),
    );

    function onItemPress(item) {
        try {

        } catch (error) {
            console.log(error);
        }
    }
    function onNext() {
        try {
            if (isCompletedTrip(0)) {
                // RootNavigation.replace("YourConfirmedJourney")
                RootNavigation.replace("SelectedJourneyDetails")
                // onBook()
            } else {
                RootNavigation.replace("RateTrip")
            }
        } catch (error) {
            console.log(error);
        }
    }
    function onBook() {
        try {
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
                    RootNavigation.navigate("SelectedBusDetails", {
                        itemData: item,
                        payloads: payloads
                    })
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
        if (item.type === "AUTO") {
            image = Images.auto
            title = "Auto"
            sub_title = item.isBooked === 1 ? "Ride Completed" : STR.strings.ride_not_started_yet
        } else if (item.type === "BUS") {
            image = Images.bus_full
            title = "Bus"
            sub_title = item.isBooked === 1 ? "Ride Completed" : STR.strings.ride_not_started_yet
        } else {
            image = Images.bus_full
            title = "Bus"
            sub_title = item.isBooked === 1 ? "Ride Completed" : STR.strings.ride_not_started_yet
        }
        return (
            <TouchableOpacity disabled={item.isBooked === 1 ? true : false} style={[WT('100%'), HT(70), L.jcC, C.bgWhite, L.card, L.mB3, item.isBooked === 1 ? L.opc4 : L.opc1]}
                onPress={() => { onItemPress(item) }}>
                <View style={[WT('100%'), L.pV10, L.pH10, L.even, L.aiC, L.jcSB]}>
                    <View style={[WT('12%')]}>
                        <View style={[HT(25), WT(30), L.bR4, L.jcC, L.aiC, C.bgWhite, L.card, C.brLight, L.br05]}>
                            <Image style={[HT(18), WT(18)]} source={image} />
                        </View>
                    </View>
                    <View style={[WT('88%')]}>
                        <View style={[WT(5)]} />
                        <Text style={[C.fcBlack, F.ffB, F.fsOne4]}>{title}</Text>
                        <Text style={[C.lColor, F.ffM, F.fsOne2]}>{sub_title}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen2]}>
            <Header navigation={navigation} hardwareBack={"progress_trip"} left_press={"progress_trip"} height={HT(70)} card={false} style={[C.bgTrans]} label_left={"Your Journey is completed"} ic_right={Images.call} ic_right_style={[WT(25), HT(25)]} ic_right_press={"call"} />
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
            <View style={[L.dpARL, { bottom: 10 }]}>
                <Button onPress={() => { onNext() }} style={[WT('90%'), HT(45)]} label={"Next"} />
            </View>
        </View>
    );
}

export default JourneyCompleted
