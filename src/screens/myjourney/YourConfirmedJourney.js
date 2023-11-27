import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, FlatList, Image, ScrollView, Modal
} from 'react-native';
import { Images } from '../../commonStyles/Images'
import { C, F, HT, L, WT, h } from '../../commonStyles/style-layout';
import { Header, Loader, TouchableOpacity, Button } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import { hasValue } from '../../Utils';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { API } from '../../shared/API-end-points';
import MapViewDirections from 'react-native-maps-directions';
import RootNavigation from '../../Navigation/RootNavigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { cancelRide, confirmRide, region_state, route_coordinates_state, current_ride_coordinates_state, current_ride_region_state } from '../master/masterSlice';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
STR = require('../../languages/strings');

function YourConfirmedJourney({ navigation, route }) {
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
    console.log(select_route, 'select_route');
    var mapRef = useRef(null);
    var markerRef = useRef(null);
    const [vehicleData, set_vehicleData] = useState([]);
    const [modalCancel, set_modalCancel] = useState(false);
    const [cancelReason, set_cancelReason] = useState("");
    const [filterData, setFilterData] = useState("");
    const [postData, setPostData] = useState("");

    useFocusEffect(
        React.useCallback(() => {
            try {
                setFilterData(filter_data)
                let itemObj = {}
                if (hasValue(select_route) && Array.isArray(select_route) && select_route.length > 0) {
                    const is_find = completed_trips.find((element) => element.status === "SELECTED");
                    if (hasValue(is_find)) {
                        itemObj = is_find
                    } else {
                        itemObj = completed_trips[1] ?? {}
                    }
                } else if (hasValue(select_route)) {
                    itemObj = select_route
                }
            } catch (error) {
                console.log(error);
            }
            return () => {

            };
        }, []),
    );

    useFocusEffect(
        React.useCallback(() => {
            // setRoutes()
            set_vehicleData(completed_trips)
            return () => {

            };
        }, [completed_trips]),
    );

    function setRoutes() {
        try {
            if (Array.isArray(select_route) && select_route.length > 0) {
                let tmpArray = []
                select_route.forEach(element => {
                    let startLocation = element?.fulfillment?.start?.location?.gps ?? ""
                    let start_data = startLocation.split(",")
                    let source_lat = parseFloat(start_data[0])
                    let source_lng = parseFloat(start_data[1])

                    let endLocation = element?.fulfillment?.end?.location?.gps ?? ""
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
                console.log(tmpArray, 'tmpArray');
                dispatch(route_coordinates_state({
                    route_coordinates: tmpArray
                }))
                if (hasValue(tmpArray) && tmpArray.length > 0) {
                    dispatch(region_state({
                        region_data: {
                            latitude: tmpArray[0].latitude ?? API.LATITUDE,
                            longitude: tmpArray[0].longitude ?? API.LONGITUDE,
                            latitudeDelta: region_data?.latitudeDelta ?? API.LATITUDE_DELTA,
                            longitudeDelta: region_data?.longitudeDelta ?? API.LONGITUDE_DELTA,
                        }
                    }))
                }
            } else {
                let startLocation = select_route?.fulfillment?.start?.location?.gps ?? ""
                let start_data = startLocation.split(",")
                let source_lat = parseFloat(start_data[0])
                let source_lng = parseFloat(start_data[1])

                let endLocation = select_route?.fulfillment?.end?.location?.gps ?? ""
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
                dispatch(region_state({
                    region_data: {
                        latitude: source_lat,
                        longitude: source_lng,
                        latitudeDelta: region_data?.latitudeDelta ?? API.LATITUDE_DELTA,
                        longitudeDelta: region_data?.longitudeDelta ?? API.LONGITUDE_DELTA,
                    }
                }))
            }
        } catch (error) {
            console.log(error);
        }
    }

    function onItemPress(item) {
        try {
            console.log(item, 'item');
            if (item.type === "BUS") {
                let payloads = select_route
                if (vehicleData.length > 1) {
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
                if (vehicleData.length > 1) {
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
    function onSelectFilter(params) {
        try {
            set_cancelReason(params)
        } catch (error) {
            console.log(error);
        }
    }
    function onCancel() {
        try {
            set_modalCancel(false);
            // RootNavigation.replace("Dashboard")
            dispatch(cancelRide(postData))
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
            sub_title = item.status != "SELECTED" ? "Ride Completed" : STR.strings.ride_not_started_yet
        } else if (item.type === "BUS") {
            image = Images.bus_full
            title = "Bus"
            sub_title = item.status != "SELECTED" ? "Ride Completed" : STR.strings.ride_not_started_yet
        } else {
            image = Images.bus_full
            title = "Bus"
            sub_title = item.status != "SELECTED" ? "Ride Completed" : STR.strings.ride_not_started_yet
        }
        return (
            <TouchableOpacity disabled={item.status != "SELECTED" ? true : false} style={[WT('100%'), HT(70), L.jcC, C.bgWhite, L.card, L.mB3, item.status != "SELECTED" ? L.opc4 : L.opc1]}
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
    console.log(route_coordinates, 'route_coordinates');
    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen2]}>
            <Header navigation={navigation} hardwareBack={"Dashboard"} left_press={"Dashboard"} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} style={[C.bgTrans]} ic_left={Images.back} label_left={STR.strings.your_journey_is_confirmed} ic_right={Images.call} ic_right_style={[WT(25), HT(25)]} ic_right_press={"call"} />
            {/* <Header navigation={navigation} hardwareBack={'cancel_trip'} left_press={'cancel_trip'} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} style={[C.bgTrans]} ic_left={Images.back} label_left={STR.strings.your_journey_is_confirmed} ic_right={Images.call} ic_right_style={[WT(25), HT(25)]} ic_right_press={"call"} /> */}
            {responseDataMaster.isLoading && <Loader isLoading={responseDataMaster.isLoading} />}
            <ScrollView>
                <View style={[WT('95%'), HT(300), L.asC, L.bR10, L.mT10, { overflow: 'hidden' }, L.card, L.br05, C.brLight]}>
                    <MapView
                        provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                        ref={ref => mapRef = ref}
                        style={[WT('100%'), HT('100%')]}
                        // showsUserLocation={true}
                        showsMyLocationButton={true}
                        followsUserLocation={true}
                        showsCompass={true}
                        // scrollEnabled={true}
                        // zoomEnabled={true}
                        // pitchEnabled={true}
                        // rotateEnabled={true}
                        // initialRegion={position}
                        // initialCamera={position}
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
            {/* <View style={[L.dpARL, { bottom: 10 }]}>
                <Button onPress={() => { set_modalCancel(true) }} style={[WT('90%'), HT(45)]} label={STR.strings.cancel_trip} />
            </View> */}
            <Modal
                transparent={true}
                supportedOrientations={['portrait', 'landscape']}
                visible={modalCancel}
                animationType='fade'
                onRequestClose={() => set_modalCancel(false)}>
                <View style={[WT('100%'), HT('100%'), C.bgTPL, L.jcB]}>
                    <View style={[WT('100%'), C.bgScreen, L.aiB, { borderTopLeftRadius: 20, borderTopRightRadius: 20 }]}>
                        <View style={[HT(Platform.OS == 'ios' ? '5%' : '0%'), WT('100%')]} />
                        <View style={[WT(50), HT(5), L.asC, C.bgVLGray, L.bR30, L.mT6]} />
                        <View style={[WT('100%'), HT(50)]}>
                            <View style={[WT('100%'), HT('100%'), L.pH15, L.even, L.aiC, L.jcSB]}>
                                <View style={[L.f1, L.jcC, L.aiL]}>
                                    <Text style={[F.fsOne6, F.ffM, C.fcBlack]}>{STR.strings.cancel_booking_reason}</Text>
                                </View>
                                <View style={[L.f1, L.jcC, L.aiR]}>
                                    <TouchableOpacity style={[WT(60), HT(45), L.jcC, L.aiR]}
                                        onPress={() => set_modalCancel(false)}>
                                        <Icon name={"close"} size={25} color={C.black} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <View style={[WT('100%'), HT(1), C.bgLGray]} />
                        <View style={[WT('95%'), L.asC]}>
                            <Text style={[F.fsOne6, F.ffM, C.lColor, L.mT20]}>{STR.strings.please_select_the_reason_for_cancellation}</Text>
                            <FlatList
                                style={[L.mT25]}
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item, index) => String(index)}
                                data={filterData}
                                contentContainerStyle={[{ paddingBottom: h(1) }]}
                                renderItem={({ item, index }) => {
                                    return (
                                        <TouchableOpacity key={index} style={[L.even, L.aiC, WT('95%'), L.asC, L.mB20]} onPress={() => onSelectFilter(item.id)}>
                                            <Icon name={cancelReason == item.id ? "radiobox-marked" : "radiobox-blank"} size={22} color={cancelReason == item.id ? C.black : C.gray400} />
                                            <View style={[WT(5)]} />
                                            <Text style={[F.fsOne6, F.ffM, C.lColor]}>{item.label}</Text>
                                        </TouchableOpacity>
                                    )
                                }}
                            />
                            <Button disabled={hasValue(cancelReason) ? false : true} onPress={() => { onCancel() }} style={[WT('100%'), HT(45), L.mT15, hasValue(cancelReason) ? L.opc1 : L.opc4]} label={STR.strings.confirm_cancellation_request} />
                            <View style={[HT(20)]} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

export default YourConfirmedJourney

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