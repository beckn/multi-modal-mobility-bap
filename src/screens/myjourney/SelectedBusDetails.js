import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, Linking, Image, ScrollView, Modal, FlatList, Platform
} from 'react-native';
import { Images } from '../../commonStyles/Images'
import { C, F, HT, L, WT, h, WTD } from '../../commonStyles/style-layout';
import { Header, TouchableOpacity, TextField, Button, Loader } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import { hasValue, toFixed } from '../../Utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { API } from '../../shared/API-end-points';
import MapViewDirections from 'react-native-maps-directions';
import RootNavigation from '../../Navigation/RootNavigation';
import { confirmRide, current_ride_region_state } from '../master/masterSlice';
STR = require('../../languages/strings');

function SelectedBusDetails({ navigation, route }) {
    const dispatch = useDispatch()
    const responseDataMaster = useSelector(state => state.master)
    const route_coordinates = responseDataMaster?.current_ride_coordinates ?? []
    const region_data = responseDataMaster?.current_ride_region ?? {
        latitude: API.LATITUDE,
        longitude: API.LONGITUDE,
        latitudeDelta: API.LATITUDE_DELTA,
        longitudeDelta: API.LONGITUDE_DELTA,
    }
    const itemData = route.params?.itemData ?? "";
    console.log(itemData, 'itemData1111');


    var mapRef = useRef(null);
    var markerRef = useRef(null);
    const [region, setRegion] = useState({
        latitude: API.LATITUDE,
        longitude: API.LONGITUDE,
        latitudeDelta: API.LATITUDE_DELTA,
        longitudeDelta: API.LONGITUDE_DELTA,
    });
    const [quantity, set_quantity] = useState(1);

    useEffect(() => {
        try {
            // setDestinationCoordinates()
        } catch (error) {
            console.log(error);
        }
    }, []);

    function setDestinationCoordinates() {
        try {
            const startLocation = itemData?.start?.gps ?? region
            const endLocation = itemData?.end?.gps ?? region
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
        } catch (error) {
            console.log(error);
        }
    }

    function onBook() {
        try {
            const payloads = route.params?.payloads ?? "";
            dispatch(confirmRide(payloads))
        } catch (error) {
            console.log(error);
        }
    }
    function onCounter(flag) {
        try {
            if (flag == 1) {
                set_quantity(quantity + 1)
            } else {
                if (quantity == 1) {
                    set_quantity(1)
                    return
                }
                set_quantity(quantity - 1)
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
            dispatch(current_ride_region_state({
                current_ride_region: {
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
            <Header navigation={navigation} hardwareBack={1} left_press={1} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} style={[C.bgTrans]} ic_left={Images.back} label_left={STR.strings.selected_bus_details} ic_right={Images.call} ic_right_style={[WT(25), HT(25)]} ic_right_press={"call"} />
            {responseDataMaster.isLoading && <Loader isLoading={responseDataMaster.isLoading} />}
            <ScrollView>
                <View style={[WT('100%'), L.pH10, L.even, L.aiC, L.jcSB, L.mT10]}>
                    <View style={[L.jcC, L.aiC, L.even]}>
                        <Image style={[HT(35), WT(35)]} source={Images.bus_full} />
                        <View style={[WT(8)]} />
                        <View style={[WT('90%')]}>
                            <Text style={[C.fcBlack, F.ffB, F.fsOne4]}>{itemData.vehicleNo}</Text>
                            <Text style={[C.lColor, F.ffM, F.fsOne1, L.mT2]}>{itemData.routeName}</Text>
                        </View>
                    </View>
                </View>
                <View style={[WT('95%'), HT(300), L.asC, L.bR10, L.mT15, { overflow: 'hidden' }, L.card, L.br05, C.brLight]}>
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
                <View style={[WT('100%'), L.pH10, L.even, L.aiC, L.jcSB, L.mT10]}>
                    <View style={[L.jcC, L.aiC, L.even]}>
                        <Image style={[HT(30), WT(30), L.bR30]} source={Images.avatar} />
                        <View style={[WT(7)]} />
                        <Text style={[C.fcBlack, F.ffB, F.fsOne4]}>BMTC</Text>
                    </View>
                    <View style={[L.jcC, L.aiC, L.even, HT(50)]}>
                        <Text style={[C.lColor, F.ffM, F.fsOne2]}>{STR.strings.price}</Text>
                        <View style={[WT(10)]} />
                        <Text style={[C.fcBlack, F.ffB, F.fsOne9]}>Rs. {toFixed(itemData?.price?.value ?? "")}</Text>
                    </View>
                </View>
                <View style={[WT('100%'), L.pH10, L.even, L.aiC, L.jcSB, L.mT5]}>
                    <View style={[]}>
                        <Text style={[C.fcBlack, F.ffB, F.fsOne9]}>{itemData.routeNo}</Text>
                        <Text style={[C.lColor, F.ffM, F.fsOne3, L.mT2]}>{itemData.vehicleName}</Text>
                    </View>
                    <View style={[]}>
                        <Text style={[C.fcBlack, F.ffM, F.fsOne3]}>No. of Passengers</Text>
                        <View style={[L.even, L.aiC, HT(25), L.jcB, L.opc4]}>
                            <View style={[L.jcC, L.aiC, HT(25), WT(30)]} onPress={() => onCounter(0)}>
                                <Text style={[F.fsOne6, F.ffM, C.fcBlack, L.mT2]}>-</Text>
                            </View>
                            <Text style={[F.fsOne4, F.ffM, C.fcBlack, L.mT2]}>{quantity}</Text>
                            <View style={[L.jcC, L.aiR, HT(25), WT(20)]} onPress={() => onCounter(1)}>
                                <Text style={[F.fsOne5, F.ffM, C.fcBlack, L.mT2]}>+</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={[HT(100)]} />
            </ScrollView>
            <View style={[C.bgTrans, L.pH10, L.dpARL]}>
                <Button onPress={() => { onBook() }} style={[WT('100%'), HT(45), L.mT20]} label={STR.strings.book_ticket} />
                <View style={[HT(15)]} />
            </View>
        </View>
    );
}

export default SelectedBusDetails
