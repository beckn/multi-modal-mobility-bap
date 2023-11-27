import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, FlatList, Image, Modal, ScrollView
} from 'react-native';
import { Images } from '../../commonStyles/Images'
import { C, F, HT, L, WT, WTD, h } from '../../commonStyles/style-layout';
import { Header, TouchableOpacity, TextField, Button, Loader } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import { hasValue, toFixed } from '../../Utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { API } from '../../shared/API-end-points';
import MapViewDirections from 'react-native-maps-directions';
import RootNavigation from '../../Navigation/RootNavigation';
import { selectRoute, confirmRide, region_state, route_coordinates_state, current_ride_coordinates_state, current_ride_region_state } from '../master/masterSlice';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
STR = require('../../languages/strings');

function SelectedJourneyDetails({ navigation, route }) {
    const dispatch = useDispatch()
    const responseDataUser = useSelector(state => state.user)
    const responseDataMaster = useSelector(state => state.master)
    const itemData = responseDataMaster?.select_route_item ?? {}
    const select_route = responseDataMaster?.select_route ?? null
    const completed_trips = responseDataUser?.completed_trips ?? []
    const route_coordinates = responseDataMaster?.route_coordinates ?? []
    const region_data = responseDataMaster?.region_data ?? {
        latitude: API.LATITUDE,
        longitude: API.LONGITUDE,
        latitudeDelta: API.LATITUDE_DELTA,
        longitudeDelta: API.LONGITUDE_DELTA,
    }
    var mapRef = useRef(null);
    var markerRef = useRef(null);
    const [trackingData, set_tracking] = useState([]);
    const [modalConfirm, set_modalConfirm] = useState(false);

    const [distanceFromStartPoint, set_distanceFromStartPoint] = useState("");
    const [waitTimeUpto, set_waitTimeUpto] = useState("");
    const [price, set_price] = useState("");
    const [title, set_title] = useState("");

    useEffect(() => {
        try {
            let itemObj = {}
            if (itemData.type === "MULTI") {
                itemObj = itemData?.routes[1] ?? {}
            } else {
                itemObj = itemData
            }
            setRoutes()
            let tmp_track = []
            if (hasValue(itemData?.routes ?? "")) {
                tmp_track = itemData.routes
            } else {
                tmp_track.push(itemData)
            }
            set_tracking(tmp_track)

            let totalCost = ""
            if (itemData.type === "AUTO") {
                totalCost = itemData?.price?.value ?? ""
                set_title("Auto");
            } else if (itemData.type === "BUS") {
                totalCost = itemData?.price?.value ?? ""
                set_title("Bus");
            } else {
                set_title("Auto + Bus");
                totalCost = itemData.totalCost
            }
            set_distanceFromStartPoint(itemObj?.distance ?? "");
            set_waitTimeUpto(itemObj?.duration ?? "");
            set_price(totalCost);
        } catch (error) {
            console.log(error);
        }
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            set_modalConfirm(false);
            return () => {
                set_modalConfirm(false);
            };
        }, []),
    );

    function onCancelBooking() {
        try {
            set_modalConfirm(false);
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
                    dispatch(confirmRide(payloads))
                    // RootNavigation.navigate("SelectedBusDetails", {
                    //     itemData: item,
                    //     payloads: payloads
                    // })
                } else {
                    let payloads = select_route
                    if (select_route.length > 1) {
                        select_route.forEach(element => {
                            if (item.id === element.id) {
                                payloads = element
                            }
                        });
                    }
                    dispatch(confirmRide(payloads))
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
    function setRoutes() {
        try {
            let select_route = {}
            if (itemData.type === "MULTI") {
                select_route = itemData?.routes ?? []
            } else {
                select_route = [itemData]
            }
            if (Array.isArray(select_route) && select_route.length > 0) {
                let tmpArray = []
                select_route.forEach(element => {
                    let startLocation = element?.start?.gps ?? ""
                    let start_data = startLocation.split(",")
                    let source_lat = parseFloat(start_data[0])
                    let source_lng = parseFloat(start_data[1])

                    let endLocation = element?.end?.gps ?? ""
                    let end_data = endLocation.split(",")
                    let end_lat = parseFloat(end_data[0])
                    let end_lng = parseFloat(end_data[1])

                    let tmpJasonStart = {
                        latitude: source_lat,
                        longitude: source_lng,
                        latitudeDelta: API.LATITUDE_DELTA,
                        longitudeDelta: API.LONGITUDE_DELTA,
                        icon: element?.type === "AUTO" ? Images.auto_marker : Images.bus_marker
                    }
                    let tmpJasonEnd = {
                        latitude: end_lat,
                        longitude: end_lng,
                        latitudeDelta: API.LATITUDE_DELTA,
                        longitudeDelta: API.LONGITUDE_DELTA,
                    }
                    tmpArray.push(tmpJasonStart)
                    tmpArray.push(tmpJasonEnd)
                });
                dispatch(route_coordinates_state({
                    route_coordinates: tmpArray
                }))
            } else {
                let startLocation = select_route?.start?.gps ?? ""
                let start_data = startLocation.split(",")
                let source_lat = parseFloat(start_data[0])
                let source_lng = parseFloat(start_data[1])

                let endLocation = select_route?.end?.gps ?? ""
                let end_data = endLocation.split(",")
                let end_lat = parseFloat(end_data[0])
                let end_lng = parseFloat(end_data[1])
                const tmp_routeCoordinates = [
                    {
                        latitude: source_lat,
                        longitude: source_lng,
                        latitudeDelta: API.LATITUDE_DELTA,
                        longitudeDelta: API.LONGITUDE_DELTA,
                        icon: select_route?.type === "AUTO" ? Images.auto_marker : Images.bus_marker
                    },
                    {
                        latitude: end_lat,
                        longitude: end_lng,
                        latitudeDelta: API.LATITUDE_DELTA,
                        longitudeDelta: API.LONGITUDE_DELTA,
                    }
                ]
                dispatch(route_coordinates_state({
                    route_coordinates: tmp_routeCoordinates
                }))
            }
        } catch (error) {
            console.log(error);
        }
    }

    const radiusToDelta = (radius, lat, lng) => {
        try {
            const oneDegreeOfLatitudeInMeters = 230 * 1000;
            const diameter = radius * 2;
            const delta = (diameter * 1609.34) / (oneDegreeOfLatitudeInMeters * Math.cos(lat * (Math.PI / 180)));
            dispatch(region_state({
                region_data: {
                    latitude: lat ?? API.LATITUDE,
                    longitude: lng ?? API.LONGITUDE,
                    latitudeDelta: delta,
                    longitudeDelta: delta
                }
            }))
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen2]}>
            <Header navigation={navigation} hardwareBack={1} left_press={1} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} style={[C.bgTrans]} ic_left={Images.back} label_left={STR.strings.selected_journey_details} />
            <ScrollView>
                <View style={[WT('90%'), L.asC, C.bgWhite, L.bR4, HT(80), L.card, L.jcC]}>
                    <Text style={[F.fsOne4, F.ffB, C.fcBlue, L.taC]}>{title}</Text>
                    <View style={[L.even, L.jcSB, L.aiC, WT('100%'), L.mT10]}>
                        <View style={[WT('33%'), L.jcC, L.aiL, L.pH15]}>
                            <Text style={[F.fsOne2, F.ffM, C.pColor]}>{STR.strings.distance}</Text>
                            <Text style={[F.fsOne5, F.ffB, C.lColor]}>{distanceFromStartPoint}</Text>
                        </View>
                        <View style={[WT('33%'), L.aiC, L.jcC]}>
                            <Text style={[F.fsOne2, F.ffM, C.pColor]}>{STR.strings.duration}</Text>
                            <Text style={[F.fsOne5, F.ffB, C.lColor]}>{waitTimeUpto}</Text>
                        </View>
                        <View style={[WT('33%'), L.jcC, L.aiR, L.pH15]}>
                            <Text style={[F.fsOne2, F.ffM, C.pColor]}>{STR.strings.cost}</Text>
                            <Text style={[F.fsOne5, F.ffB, C.lColor]}>{price}</Text>
                        </View>
                    </View>
                </View>
                <View style={[WT('90%'), HT(200), L.asC, L.bR10, L.mT10, { overflow: 'hidden' }, L.card, L.br05, C.brLight]}>
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
                                onReady={(text) => {
                                    console.log(text, 'onReady');
                                    let distance = text?.distance ?? 0
                                    if (distance != 0) {
                                        radiusToDelta(distance, route_coordinates[route_coordinates.length - 1].latitude, route_coordinates[route_coordinates.length - 1].longitude)
                                    }
                                }}
                            />
                        </>}
                    </MapView>
                </View>
                {hasValue(trackingData) && trackingData.length > 0 &&
                    <View style={[WT('90%'), L.asC, L.jcC, L.mT5, C.bgWhite, L.card, L.br05, L.mH10, L.bR5, C.brLight, L.pV10, L.pH10, L.mT10]}>
                        <View style={[HT(15)]} />
                        {trackingData.map(function (element, index) {
                            return (
                                <View key={index} style={[L.pH8]}>
                                    <View style={[L.even, L.aiC, { marginTop: -11 }]}>
                                        <View style={[HT(8), WT(8), L.bR8, C.bgLightGray, { marginLeft: -3 }]} />
                                        <View style={[WT(10)]} />
                                        <View style={[]}>
                                            <View style={[L.even, L.aiC]}>
                                                <Text style={[C.fcBlack, F.ffB, F.fsOne5]} numberOfLines={1}>{hasValue(element?.start?.name ?? "") ? element?.start?.name ?? "" : element?.start?.address?.ward ?? ""}</Text>
                                            </View>
                                            <Text style={[C.fcBlack, F.ffM, F.fsOne2]}>{element.type === "AUTO" ? "Auto" : "Bus"}  |  {element?.distanceFromStartPoint ?? ""}</Text>
                                        </View>
                                    </View>
                                    {trackingData.length == index + 1 && <>
                                        <View style={[HT(100), WT(2), C.bgBlack, L.jcC, { marginTop: -11 }]}>
                                            <View style={[HT(25), WTD(80), L.even, L.aiC, { marginLeft: -10 }]}>
                                                <View style={[WT(10)]} />
                                                <View style={[HT(25), WT(25), C.bgWhite, L.card, C.brLight, L.br05, L.bR4, L.jcC, L.aiC, { marginLeft: -10 }]}>
                                                    <Image style={[HT(18), WT(18)]} source={element.type === "AUTO" ? Images.auto : Images.bus_full} />
                                                </View>
                                                <View style={[WT(10)]} />
                                                <Text style={[C.fcBlack, F.ffM, F.fsOne2, C.fcBlue]}>{toFixed(element?.price?.value ?? "") != 0 ? toFixed(element?.price?.value ?? "") : element?.price?.value ?? ""}</Text>
                                            </View>
                                        </View>
                                        <View style={[L.even, L.aiC, { marginTop: -11 }]}>
                                            <View style={[HT(8), WT(8), L.bR8, C.bgLightGray, { marginLeft: -3 }]} />
                                            <View style={[WT(10)]} />
                                            <View style={[]}>
                                                <View style={[L.even, L.aiC]}>
                                                    <Text style={[C.fcBlack, F.ffB, F.fsOne5]} numberOfLines={1}>{hasValue(element?.end?.name ?? "") ? element?.end?.name ?? "" : element?.end?.address?.ward ?? ""}</Text>
                                                </View>
                                                <Text style={[C.fcBlack, F.ffM, F.fsOne2]}>{element.type === "AUTO" ? "Auto" : "Bus"}  |  {element?.distanceFromStartPoint ?? ""}</Text>
                                            </View>
                                        </View>
                                    </>}
                                    {trackingData.length != index + 1 &&
                                        <View style={[HT(100), WT(2), C.bgBlack, L.jcC, { marginTop: -11 }]}>
                                            <View style={[HT(25), WTD(80), L.even, L.aiC, { marginLeft: -10 }]}>
                                                <View style={[WT(10)]} />
                                                <View style={[HT(25), WT(25), C.bgWhite, L.card, C.brLight, L.br05, L.bR4, L.jcC, L.aiC, { marginLeft: -10 }]}>
                                                    <Image style={[HT(18), WT(18)]} source={element.type === "AUTO" ? Images.auto : Images.bus_full} />
                                                </View>
                                                <View style={[WT(10)]} />
                                                <Text style={[C.fcBlack, F.ffM, F.fsOne2, C.fcBlue]}>{toFixed(element?.price?.value ?? "") != 0 ? toFixed(element?.price?.value ?? "") : element?.price?.value ?? ""}</Text>
                                            </View>
                                        </View>
                                    }
                                </View>
                            )
                        })}
                    </View>
                }
                <View style={[HT(100)]} />
            </ScrollView >
            <View style={[C.bgTrans, L.pH10, L.dpARL]}>
                <Button onPress={() => { onBook(); set_modalConfirm(true) }}
                    style={[WT('100%'), HT(45), L.mT20]} label={STR.strings.book_now} />
                <View style={[HT(15)]} />
            </View>
            <Modal
                transparent={true}
                supportedOrientations={['portrait', 'landscape']}
                visible={modalConfirm}
                animationType='fade'
                onRequestClose={() => set_modalConfirm(false)}>
                <View style={[WT('100%'), HT('100%'), C.bgTPH, L.jcC, L.aiC]}>
                    <View style={[WT('100%'), HT('100%'), C.bgTPH, L.aiC]}>
                        <View style={[HT(Platform.OS == 'ios' ? '5%' : '0%'), WT('100%')]} />
                        <View style={[HT('5%')]} />
                        <Text style={[F.fsOne9, F.ffM, C.fcWhite, L.taC]}>{STR.strings.booking_your_ride}</Text>
                        <Text style={[F.fsOne5, F.ffM, C.fcWhite, L.taC, L.mT10]}>{STR.strings.hold_on_this_may_take_a_few_seconds}</Text>
                        <View style={[HT('25%')]} />
                        <Image style={[WT(250), HT(250), L.asC]} source={Images.booking_loader} />
                        {/* <TouchableOpacity style={[HT(50), L.pH10, L.asC, L.jcC, L.mT20]} onPress={() => { onCancelBooking() }}>
                            <Text style={[F.fsOne6, F.ffM, C.fcWhite, L.taC, F.tDL]}>{STR.strings.cancel_booking}</Text>
                        </TouchableOpacity> */}
                    </View>
                </View>
            </Modal>
            {responseDataMaster.isLoading && <Loader isLoading={responseDataMaster.isLoading} />}
        </View >
    );
}

export default SelectedJourneyDetails
