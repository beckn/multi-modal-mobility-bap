import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, FlatList, Image, Modal
} from 'react-native';
import { Images } from '../../commonStyles/Images'
import { C, F, HT, L, WT, h } from '../../commonStyles/style-layout';
import { Header, TouchableOpacity, TextField, Button } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import { hasValue } from '../../Utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { API } from '../../shared/API-end-points';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapViewDirections from 'react-native-maps-directions';
import RootNavigation from '../../Navigation/RootNavigation';
STR = require('../../languages/strings');

function ConfirmLocation({ navigation, route }) {
    const dispatch = useDispatch()
    const responseData = useSelector(state => state.user)
    const itemData = route.params?.itemData ?? null;
    var mapRef = useRef(null);
    var markerRef = useRef(null);
    const [selected_tab, set_selected_tab] = useState(1);
    const [selected_tab2, set_selected_tab2] = useState(1);
    const [selected_tab3, set_selected_tab3] = useState(1);
    const [modalSearch, set_modalSearch] = useState(false);
    const [location_type, set_location_type] = useState(1);
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
    const [source_lat_lng, set_source_lat_lng] = useState(0);
    const [destination_lat_lng, set_destination_lat_lng] = useState(0);
    const [source_location, set_source_location] = useState("");
    const [destination_location, set_destination_location] = useState("");

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

    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen]}>
            <View style={[WT('100%'), HT('78%')]}>
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
            <View style={[L.dpA, { top: 0, left: 0, right: 0 }]}>
                <Header navigation={navigation} hardwareBack={1} left_press={1} card={false} height={HT(60)} ic_left_style={[WT(80), HT(80)]} ic_left={Images.back} style={[C.bgTrans]} />
            </View>
            <View style={[C.bgWhite, L.card, L.pH10, L.dpARL]}>
                <View style={[WT('95%'), L.asC, L.jcSB, L.mT5]}>
                    <View style={[WT('100%'), L.aiC, L.jcSB, L.even]}>
                        <Text style={[F.fsOne5, F.ffM, C.lColor]}>{STR.strings.select_location}</Text>
                        <TouchableOpacity style={[HT(45), L.jcC]} onPress={() => { RootNavigation.goBack() }}>
                            <Text style={[F.fsOne5, F.ffB, C.lColor, F.tDL]}>{STR.strings.change}</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={[F.fsOne5, F.ffB, C.lColor]} numberOfLines={2}>{itemData?.source_location ?? ""}</Text>
                    <Text style={[F.fsOne5, F.ffM, C.lColor]} numberOfLines={2}>{itemData?.destination_location ?? ""}</Text>
                </View>
                <Button onPress={() => { }} style={[WT('100%'), HT(45), L.mT20]} label={STR.strings.confirm_location} />
                <View style={[HT(15)]} />
            </View>
        </View>
    );
}

export default ConfirmLocation
