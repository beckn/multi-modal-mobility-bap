import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, Linking, Image, ScrollView, Modal, FlatList, Platform
} from 'react-native';
import { Images } from '../../commonStyles/Images'
import { C, F, HT, L, WT, h, WTD } from '../../commonStyles/style-layout';
import { Header, TouchableOpacity, TextField, Button } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import { hasValue } from '../../Utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { API } from '../../shared/API-end-points';
import MapViewDirections from 'react-native-maps-directions';
import RootNavigation from '../../Navigation/RootNavigation';
STR = require('../../languages/strings');

function JourneyStarted({ navigation, route }) {
    const dispatch = useDispatch()
    const responseData = useSelector(state => state.user)
    const itemData = route.params?.itemData ?? "";
    var mapRef = useRef(null);
    var markerRef = useRef(null);
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
            if (hasValue(itemData?.routeCoordinates ?? "")) {
                set_routeCoordinates(itemData.routeCoordinates)
                const routeCoordinates_obj = {
                    latitude: itemData?.routeCoordinates[0]?.latitude ?? API.LATITUDE,
                    longitude: itemData?.routeCoordinates[0]?.longitude ?? API.LONGITUDE,
                    latitudeDelta: API.LATITUDE_DELTA,
                    longitudeDelta: API.LONGITUDE_DELTA
                }
                setRegion(routeCoordinates_obj)
            }
        } catch (error) {
            console.log(error);
        }
    }, [itemData]);

    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen2]}>
            <Header navigation={navigation} hardwareBack={1} left_press={1} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} style={[C.bgTrans]} ic_left={Images.back} label_left={STR.strings.bus_journey_has_started} ic_right={Images.call} ic_right_style={[WT(25), HT(25)]} ic_right_press={"call"} />
            <ScrollView>
                <View style={[WT('100%'), L.pH10, L.even, L.aiC, L.jcSB, L.mT10]}>
                    <View style={[L.jcC, L.aiC, L.even]}>
                        <Image style={[HT(35), WT(35)]} source={Images.auto_black} />
                        <View style={[WT(8)]} />
                        <View style={[]}>
                            <Text style={[C.fcBlack, F.ffB, F.fsOne5]}>Bus No 1234</Text>
                            <Text style={[C.lColor, F.ffM, F.fsOne2]}>Trip will Start at 10 : 53 am , ETA  11:50 am</Text>
                        </View>
                    </View>
                </View>
                <View style={[WT('95%'), HT(300), L.asC, L.bR10, L.mT15, { overflow: 'hidden' }, L.card, L.br05, C.brLight]}>
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
                        initialRegion={position}
                        // initialCamera={position}
                        region={region}>
                        {/* <Marker
                        title='Yor are here'
                        description='This is a description'
                        coordinate={position} /> */}
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
                                {/* <ImageBackground source={Images.marker} resizeMode="contain"
                            style={[WT(50), HT(50), L.aiC, L.jcC]}>
                            <Image source={{ uri: VehicleTypeIcon }} resizeMode="contain" style={[WT(20), HT(20), C.tcBlack, { marginTop: -11 }]} />
                        </ImageBackground> */}
                            </Marker>
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
                        <Text style={[C.lColor, F.ffM, F.fsOne2]}>{STR.strings.cost}</Text>
                        <View style={[WT(5)]} />
                        <Text style={[C.fcBlack, F.ffB, F.fsOne5]}>Rs. 3212</Text>
                    </View>
                </View>
                <View style={[WT('100%'), L.pH10, L.even, L.aiC, L.jcSB, L.mT5]}>
                    <View style={[]}>
                        <Text style={[C.fcBlack, F.ffB, F.fsOne6]}>KA05 AF 6226</Text>
                        <Text style={[C.lColor, F.ffM, F.fsOne3]}>Non A/C, BMTC</Text>
                    </View>
                </View>
                <View style={[HT(100)]} />
            </ScrollView>
            <View style={[L.dpARL]}>
                <View style={[WT('100%'), C.bgWhite, L.aiC]}>
                    <View style={[HT(40)]} />
                    <Text style={[F.fsOne6, F.ffM, C.fcBlack, L.taC]}>{STR.strings.tap_yes_when_your_bus_ride_starts}</Text>
                    <View style={[HT(30)]} />
                    <Button onPress={() => { RootNavigation.navigate("JourneyCompleted") }} style={[WT('95%'), L.asC, HT(45)]} label={STR.strings.yes} />
                    <View style={[HT(20)]} />
                </View>
            </View>
        </View>
    );
}

export default JourneyStarted
