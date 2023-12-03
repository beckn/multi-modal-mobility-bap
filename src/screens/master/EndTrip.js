import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, Linking, Image, ScrollView, Modal, FlatList, Platform
} from 'react-native';
import { Images } from '../../commonStyles/Images'
import { C, F, HT, L, WT, h, WTD } from '../../commonStyles/style-layout';
import { Header, TouchableOpacity, TextField, Button, Loader } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import { hasValue } from '../../Utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { API } from '../../shared/API-end-points';
import MapViewDirections from 'react-native-maps-directions';
import RootNavigation from '../../Navigation/RootNavigation';
import Geolocation from '@react-native-community/geolocation';
STR = require('../../languages/strings');

function EndTrip({ navigation, route }) {
    const dispatch = useDispatch()
    const responseDataMaster = useSelector(state => state.master)
    const confirm_ride = responseDataMaster?.confirm_ride ?? null
    const route_coordinates = responseDataMaster?.route_coordinates ?? []
    const region_data = responseDataMaster?.region_data ?? {
        latitude: API.LATITUDE,
        longitude: API.LONGITUDE,
        latitudeDelta: API.LATITUDE_DELTA,
        longitudeDelta: API.LONGITUDE_DELTA,
    }
    const itemData = route.params?.itemData ?? {};
    console.log(itemData, 'itemData');
    var mapRef = useRef(null);
    var markerRef = useRef(null);
    const [routeCoordinates, set_routeCoordinates] = useState([]);
    const [delta, setDelta] = useState({
        latitudeDelta: API.LATITUDE_DELTA,
        longitudeDelta: API.LONGITUDE_DELTA
    });
    const [region, setRegion] = useState({
        latitude: API.LATITUDE,
        longitude: API.LONGITUDE,
        latitudeDelta: API.LATITUDE_DELTA,
        longitudeDelta: API.LONGITUDE_DELTA,
    });
    const [distance, setDistance] = useState(0);

    useEffect(() => {
        try {
            setDestinationCoordinates()
        } catch (error) {
            console.log(error);
        }
    }, []);

    function setDestinationCoordinates() {
        try {
            const startLocation = itemData?.fulfillment?.start?.location?.gps ?? region
            const endLocation = itemData?.fulfillment?.end?.location?.gps ?? region
            var start_data = startLocation.split(",")
            var source_lat = parseFloat(start_data[0])
            var source_lng = parseFloat(start_data[1])

            var end_data = endLocation.split(",")
            var end_lat = parseFloat(end_data[0])
            var end_lng = parseFloat(end_data[1])

            let tmp_routeCoordinates = [
                {
                    latitude: source_lat ?? API.LATITUDE,
                    longitude: source_lng ?? API.LONGITUDE,
                    latitudeDelta: API.LATITUDE_DELTA,
                    longitudeDelta: API.LONGITUDE_DELTA,
                    location_type: "start",
                    icon: itemData?.type === "AUTO" ? Images.auto_marker : Images.bus_marker
                },
                {
                    latitude: end_lat ?? API.LATITUDE,
                    longitude: end_lng ?? API.LONGITUDE,
                    latitudeDelta: API.LATITUDE_DELTA,
                    longitudeDelta: API.LONGITUDE_DELTA,
                    location_type: "end",
                    icon: itemData?.type === "AUTO" ? Images.auto_marker : Images.bus_marker
                },
            ]
            set_routeCoordinates(tmp_routeCoordinates)
            setRegion({
                latitude: source_lat ?? API.LATITUDE,
                longitude: source_lng ?? API.LONGITUDE,
                latitudeDelta: delta?.latitudeDelta ?? 0,
                longitudeDelta: delta?.longitudeDelta ?? 0
            })
            Geolocation.watchPosition(async (pos) => {
                console.log(pos, 'pos');
                const crd = pos.coords;
                const location_data = {
                    latitude: crd.latitude,
                    longitude: crd.longitude,
                    latitudeDelta: API.LATITUDE_DELTA,
                    longitudeDelta: API.LONGITUDE_DELTA,
                    location_type: "end",
                    icon: itemData?.type === "AUTO" ? Images.auto_marker : Images.bus_marker
                }
                setRegion({
                    latitude: crd.latitude,
                    longitude: crd.longitude,
                    latitudeDelta: delta?.latitudeDelta ?? 0,
                    longitudeDelta: delta?.longitudeDelta ?? 0
                });
                let tmp_routeCoordinates = [
                    location_data,
                    {
                        latitude: end_lat ?? API.LATITUDE,
                        longitude: end_lng ?? API.LONGITUDE,
                        latitudeDelta: API.LATITUDE_DELTA,
                        longitudeDelta: API.LONGITUDE_DELTA,
                        location_type: "end",
                        icon: itemData?.type === "AUTO" ? Images.auto_marker : Images.bus_marker
                    },
                ]
                set_routeCoordinates(tmp_routeCoordinates)
            })
        } catch (error) {
            console.log(error);
        }
    }

    function onCall(flag) {
        try {
            Linking.openURL(`tel:${flag}`)
        } catch (error) {
            console.log(error);
        }
    }
    function onSubmit() {
        try {
            const vehicle = itemData?.fulfillment?.vehicle?.category ?? null
            if (vehicle === "AUTO_RICKSHAW") {
                RootNavigation.navigate("JourneyCompleted")
            } else {
                RootNavigation.navigate("TicketDetails")
            }
        } catch (error) {
            console.log(error);
        }
    }
    const radiusToDelta = (radius, lat, lng) => {
        try {
            setDistance(distance)
            const oneDegreeOfLatitudeInMeters = 230 * 1000;
            const diameter = radius * 2;
            const delta = (diameter * 1609.34) / (oneDegreeOfLatitudeInMeters * Math.cos(lat * (Math.PI / 180)));
            setDelta({
                latitudeDelta: delta,
                longitudeDelta: delta
            })
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen2]}>
            <Header navigation={navigation} hardwareBack={"progress_trip"} left_press={"progress_trip"} height={HT(70)} card={false} style={[C.bgTrans]} label_left={"Ride is In Progress"} ic_right={Images.call} ic_right_style={[WT(25), HT(25)]} ic_right_press={"call"} />
            {responseDataMaster.isLoading && <Loader isLoading={responseDataMaster.isLoading} />}
            <View style={[WT('100%'), HT('83%'), L.asC]}>
                {/* <View style={[WT('100%'), HT('83%'), L.asC, L.bR10, { overflow: 'hidden' }, L.card, L.br05, C.brLight]}> */}
                <MapView
                    provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                    ref={ref => mapRef = ref}
                    style={[WT('100%'), HT('100%')]}
                    showsMyLocationButton={true}
                    followsUserLocation={true}
                    showsCompass={true}
                    region={region}>
                    {hasValue(routeCoordinates) && routeCoordinates.length > 0 && <>
                        <>
                            {routeCoordinates.map(function (element, index) {
                                return (<>
                                    {hasValue(element?.icon ?? "") ?
                                        (<Marker coordinate={element}>
                                            {hasValue(element?.icon ?? "") &&
                                                <Image source={element?.icon} resizeMode="contain" style={[WT(20), HT(20)]} />
                                            }
                                        </Marker>) :
                                        (<>
                                            {routeCoordinates.length == index + 1 &&
                                                <Marker coordinate={element} />
                                            }
                                        </>)
                                    }
                                </>)
                            })}
                        </>
                        <MapViewDirections
                            origin={routeCoordinates[0]}
                            destination={routeCoordinates.length > 1 ? routeCoordinates[routeCoordinates.length - 1] : routeCoordinates[0]}
                            apikey={API.map_key}
                            mode='DRIVING'
                            strokeWidth={4}
                            strokeColor={C.strokeColor}
                            fillColor={C.fillColor}
                            waypoints={routeCoordinates}
                            optimizeWaypoints={false}
                            splitWaypoints={true}
                            resetOnChange={false}
                            precision={'high'}
                            onReady={(text) => {
                                console.log(text, 'onReady');
                                let distance = text?.distance ?? 0
                                if (distance != 0) {
                                    radiusToDelta(distance, routeCoordinates[routeCoordinates.length - 1].latitude, routeCoordinates[routeCoordinates.length - 1].longitude)
                                }
                            }}
                        />
                    </>}
                </MapView>
            </View>
            <View style={[C.bgTrans, L.pH10, L.dpARL]}>
                <View style={[L.asR, L.mB10]}>
                    <Text style={[C.fcBlack, F.ffM, F.fsOne4]}>Distance:- {distance} km</Text>
                </View>
                <Button onPress={() => { onSubmit() }} style={[WT('100%'), HT(45)]} label={STR.strings.end_trip} />
                <View style={[HT(15)]} />
            </View>
        </View>
    );
}

export default EndTrip

const filter_data = [
    {
        id: 1,
        label: STR.strings.plan_changed
    },
    {
        id: 2,
        label: STR.strings.booked_by_mistake
    },
    {
        id: 3,
        label: STR.strings.partner_denied_duty
    },
    {
        id: 4,
        label: STR.strings.long_waiting_time
    },
    {
        id: 5,
        label: STR.strings.unable_to_contact_partner
    },
    {
        id: 6,
        label: STR.strings.my_reason_is_not_listed_here
    }
]
