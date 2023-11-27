import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, FlatList, Image, ScrollView, Modal
} from 'react-native';
import { Images } from '../../commonStyles/Images'
import { C, F, HT, L, WT, h } from '../../commonStyles/style-layout';
import { Header, TouchableOpacity, Button } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import { hasValue } from '../../Utils';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { API } from '../../shared/API-end-points';
import MapViewDirections from 'react-native-maps-directions';
import RootNavigation from '../../Navigation/RootNavigation';
STR = require('../../languages/strings');

function BusJourneyConfirmed({ navigation, route }) {
    const dispatch = useDispatch()
    const responseData = useSelector(state => state.user)
    var mapRef = useRef(null);
    var markerRef = useRef(null);
    const [modalConfirm, set_modalConfirm] = useState(false);
    const [disable_vehicle, set_disable_vehicle] = useState("");
    const [selectedItem, set_selectedItem] = useState(1);
    const [routeCoordinates, set_routeCoordinates] = useState([]);
    const [position, setPosition] = useState({
        latitude: API.LATITUDE,
        longitude: API.LONGITUDE,
        latitudeDelta: API.LATITUDE_DELTA,
        longitudeDelta: API.LONGITUDE_DELTA,
    });
    const [region, setRegion] = useState({
        latitude: API.LATITUDE,
        longitude: API.LONGITUDE,
        latitudeDelta: API.LATITUDE_DELTA,
        longitudeDelta: API.LONGITUDE_DELTA,
    });

    useEffect(() => {
        try {
            Geolocation.getCurrentPosition((pos) => {
                const crd = pos.coords;
                setPosition({
                    latitude: crd.latitude,
                    longitude: crd.longitude,
                    latitudeDelta: API.LATITUDE_DELTA,
                    longitudeDelta: API.LONGITUDE_DELTA,
                });
            })
        } catch (error) {
            console.log(error);
        }
    }, []);
    function onItemPress(item) {
        try {
            if (!hasValue(disable_vehicle) && disable_vehicle === item.id) {
                set_selectedItem(item.id)
                set_routeCoordinates(item.routeCoordinates)
                const routeCoordinates_obj = {
                    latitude: item?.routeCoordinates[0]?.latitude ?? API.LATITUDE,
                    longitude: item?.routeCoordinates[0]?.longitude ?? API.LONGITUDE,
                    latitudeDelta: API.LATITUDE_DELTA,
                    longitudeDelta: API.LONGITUDE_DELTA
                }
                setRegion(routeCoordinates_obj)
                set_disable_vehicle(item.id)
                set_modalConfirm(true)
            } else if (disable_vehicle != item.id) {
                set_disable_vehicle(item.id)
                set_modalConfirm(true)
            } else {
                set_disable_vehicle("")
            }
        } catch (error) {
            console.log(error);
        }
    }
    const renderItem = (item, index) => {
        return (
            <View style={[WT('100%'), L.jcC, L.mB3]}>
                <TouchableOpacity disabled={disable_vehicle === item.id ? true : false} style={[WT('100%'), HT(70), L.jcC, disable_vehicle === item.id ? C.bgVLGray : C.bgWhite, disable_vehicle === item.id ? L.opc4 : L.opc1, L.card]}
                    onPress={() => { onItemPress(item) }}>
                    <View style={[WT('100%'), L.pV10, L.pH10, L.even, L.aiC, L.jcSB]}>
                        <View style={[WT('12%')]}>
                            <View style={[HT(25), WT(30), C.bgWhite, L.card, C.brLight, L.br05, L.bR4, L.jcC, L.aiC]}>
                                <Image style={[HT(18), WT(18)]} source={item.icon} />
                            </View>
                        </View>
                        <View style={[WT('88%')]}>
                            <Text style={[C.fcBlack, F.ffB, F.fsOne4]}>{item.title}</Text>
                            <Text style={[C.fcBlack, F.ffM, F.fsOne3]}>{item.sub}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                {hasValue(disable_vehicle) && disable_vehicle === item.id && <View style={[WT('95%'), HT(300), L.asC, L.bR10, L.mT10, { overflow: 'hidden' }, L.card, L.br05, C.brLight, L.mB10]}>
                    <MapView
                        provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                        ref={ref => mapRef = ref}
                        style={[WT('100%'), HT('100%')]}
                        // showsUserLocation={true}
                        showsMyLocationButton={true}
                        followsUserLocation={true}
                        showsCompass={true}
                        initialRegion={position}
                        region={region}>
                        {hasValue(routeCoordinates) && routeCoordinates.length > 0 && <>
                            <Marker
                                ref={ref => { markerRef = ref; }}
                                coordinate={routeCoordinates[0]}
                                // title={routeCoordinates[0]?.name ?? 'Start Point'}
                                onPress={() => { }}>
                                {/* <Image source={Images.position} resizeMode="contain" style={[WT(100), HT(100)]} /> */}
                            </Marker>
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
                            />
                            <Marker
                                ref={ref => { markerRef = ref; }}
                                coordinate={routeCoordinates.length > 1 ? routeCoordinates[routeCoordinates.length - 1] : routeCoordinates[0]}
                                // title={routeCoordinates[1]?.name ?? 'End Point'}
                                onPress={() => { }}>
                            </Marker>
                        </>}
                    </MapView>
                </View>}
            </View>
        )
    }
    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen2]}>
            <Header navigation={navigation} hardwareBack={1} left_press={1} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} style={[C.bgTrans]} ic_left={Images.back} label_left={STR.strings.bus_journey_is_confirmed} ic_right={Images.call} ic_right_style={[WT(25), HT(25)]} ic_right_press={"call"} />
            <ScrollView>
                {!hasValue(disable_vehicle) && <View style={[WT('95%'), HT(300), L.asC, L.bR10, L.mT10, { overflow: 'hidden' }, L.card, L.br05, C.brLight]}>
                    <MapView
                        provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                        ref={ref => mapRef = ref}
                        style={[WT('100%'), HT('100%')]}
                        // showsUserLocation={true}
                        showsMyLocationButton={true}
                        followsUserLocation={true}
                        showsCompass={true}
                        initialRegion={position}
                        region={region}>
                        {hasValue(routeCoordinates) && routeCoordinates.length > 0 && <>
                            <Marker
                                ref={ref => { markerRef = ref; }}
                                coordinate={routeCoordinates[0]}
                                // title={routeCoordinates[0]?.name ?? 'Start Point'}
                                onPress={() => { }}>
                                {/* <Image source={Images.position} resizeMode="contain" style={[WT(100), HT(100)]} /> */}
                            </Marker>
                            <MapViewDirections
                                origin={routeCoordinates[0]}
                                destination={routeCoordinates.length > 1 ? routeCoordinates[routeCoordinates.length - 1] : routeCoordinates[0]}
                                apikey={API.map_key}
                                mode='DRIVING'
                                strokeWidth={6}
                                strokeColor={C.red}
                                waypoints={routeCoordinates}
                                optimizeWaypoints={false}
                                splitWaypoints={true}
                                resetOnChange={false}
                                precision={'high'}
                            />
                            <Marker
                                ref={ref => { markerRef = ref; }}
                                coordinate={routeCoordinates.length > 1 ? routeCoordinates[routeCoordinates.length - 1] : routeCoordinates[0]}
                                // title={routeCoordinates[1]?.name ?? 'End Point'}
                                onPress={() => { }}>
                            </Marker>
                        </>}
                    </MapView>
                </View>}
                <View style={[L.mT20]}>
                    {/* <View style={[WT('100%'), HT(1), C.bgLightGray, L.mB5]} /> */}
                    <FlatList
                        keyboardShouldPersistTaps='always'
                        keyExtractor={(item, index) => String(index)}
                        data={tracking}
                        renderItem={({ item, index }) => renderItem(item, index)}
                        contentContainerStyle={[{ paddingBottom: h(0) }]}
                    />
                </View>
                <View style={[HT(100)]} />
            </ScrollView>
            <Modal
                transparent={true}
                supportedOrientations={['portrait', 'landscape']}
                visible={modalConfirm}
                animationType='fade'
                onRequestClose={() => set_modalConfirm(false)}>
                <View style={[WT('100%'), HT('100%'), C.bgTPH, L.jcB, L.aiC]}>
                    <View style={[WT('100%'), L.pV10, C.bgWhite, L.aiC]}>
                        <View style={[HT(Platform.OS == 'ios' ? '5%' : '0%'), WT('100%')]} />
                        <View style={[HT(40)]} />
                        <Text style={[F.fsOne6, F.ffM, C.fcBlack, L.taC]}>{STR.strings.tap_yes_when_your_bus_ride_starts}</Text>
                        <View style={[HT(30)]} />
                        <Button onPress={() => { set_modalConfirm(false); RootNavigation.navigate("JourneyStarted") }} style={[WT('95%'), L.asC, HT(45)]} label={STR.strings.yes} />
                        <View style={[HT(20)]} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

export default BusJourneyConfirmed

const tracking = [
    {
        id: 1,
        title: STR.strings.auto_details,
        sub: STR.strings.ride_confirmed,
        icon: Images.auto,
        routeCoordinates: [
            {
                latitude: 22.692648,
                longitude: 75.867599,
                latitudeDelta: API.LATITUDE_DELTA,
                longitudeDelta: API.LONGITUDE_DELTA,
                name: "Bhawarkua"
            },
            {
                latitude: 22.711425,
                longitude: 75.883018,
                latitudeDelta: API.LATITUDE_DELTA,
                longitudeDelta: API.LONGITUDE_DELTA,
                name: "Shivaji"
            },
        ]
    },
    {
        id: 2,
        title: STR.strings.bus_details,
        sub: STR.strings.ride_not_started_yet,
        icon: Images.bus_full,
        routeCoordinates: [
            {
                latitude: 22.751008,
                longitude: 75.895366,
                latitudeDelta: API.LATITUDE_DELTA,
                longitudeDelta: API.LONGITUDE_DELTA,
                name: "Vijay Nagar"
            },
            {
                latitude: 22.746181,
                longitude: 75.934773,
                latitudeDelta: API.LATITUDE_DELTA,
                longitudeDelta: API.LONGITUDE_DELTA,
                name: "Phoenix"
            },
        ]
    },

]