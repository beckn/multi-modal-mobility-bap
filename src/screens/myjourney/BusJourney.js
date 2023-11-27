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

function BusJourney({ navigation, route }) {
    const dispatch = useDispatch()
    const responseDataUser = useSelector(state => state.user)
    const responseDataMaster = useSelector(state => state.master)
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
    const [journeyStatus, setJourneyStatus] = useState("");
    const [quantity, set_quantity] = useState(1);

    useFocusEffect(
        React.useCallback(() => {
            set_vehicleData(completed_trips)
            return () => {

            };
        }, [completed_trips]),
    );

    function onSubmit(flag) {
        try {
            if (flag != 2) {
                setJourneyStatus(flag)
            }
            set_quantity(quantity + 1)
            if (flag === 2) {
                if (isCompletedTrip(0)) {
                    // RootNavigation.replace("YourConfirmedJourney")
                    RootNavigation.replace("SelectedJourneyDetails")
                    // onBook()
                } else {
                    RootNavigation.replace("RateTrip")
                }
            }
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
            title = "Auto details"
            sub_title = item.status != "SELECTED" ? "Ride Completed" : STR.strings.ride_not_started_yet
        } else if (item.type === "BUS") {
            image = Images.bus_full
            title = "Bus details"
            sub_title = item.status != "SELECTED" ? "Ride Completed" : "Ticket Confirmed"
        } else {
            image = Images.bus_full
            title = "Bus details"
            sub_title = item.status != "SELECTED" ? "Ride Completed" : "Ticket Confirmed"
        }
        return (<>
            <View style={[WT('100%'), L.pV10, L.jcC, L.mB3, { borderTopWidth: 3, borderTopColor: C.gray200, borderBottomWidth: 3, borderBottomColor: C.gray200 }]}>
                <View style={[WT('100%'), L.pV10, L.pH10, L.even, L.aiC, L.jcSB]}>
                    <View style={[WT('12%')]}>
                        <View style={[HT(30), WT(35), L.bR4, L.jcC, L.aiC, C.brLight, L.br05]}>
                            <Image style={[HT(18), WT(18)]} source={image} />
                        </View>
                    </View>
                    <View style={[WT('88%')]}>
                        <View style={[WT(5)]} />
                        <Text style={[C.fcBlack, F.ffB, F.fsOne4]}>{title}</Text>
                        <Text style={[C.lColor, F.ffM, F.fsOne2]}>{sub_title}</Text>
                    </View>
                </View>
            </View>
            {item.type === "AUTO" &&
                <View style={[WT('95%'), HT(300), L.asC, L.bR10, L.mT10, L.mB15, { overflow: 'hidden' }, L.card, L.br05, C.brLight]}>
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
            }
        </>)
    }
    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen2]}>
            {/* <Header navigation={navigation} hardwareBack={"progress_trip"} left_press={"progress_trip"} height={HT(70)} card={false} style={[C.bgTrans]} label_left={"Your Journey is completed"} ic_right={Images.call} ic_right_style={[WT(25), HT(25)]} ic_right_press={"call"} /> */}
            <Header navigation={navigation} hardwareBack={"progress_trip"} left_press={"progress_trip"} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} style={[C.bgTrans]} ic_left={Images.back} label_left={journeyStatus === 1 ? "Bus journey has started" : "Bus journey is confirmed"} ic_right={Images.call} ic_right_style={[WT(25), HT(25)]} ic_right_press={"call"} />
            {responseDataMaster.isLoading && <Loader isLoading={responseDataMaster.isLoading} />}
            <ScrollView>
                {/* <View style={[WT('95%'), HT(300), L.asC, L.bR10, L.mT10, { overflow: 'hidden' }, L.card, L.br05, C.brLight]}>
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
                </View> */}
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
            <View style={[C.bgWhite, L.card, C.brLight, L.br05, L.aiC, L.jcC, HT(150), L.dpARL, { bottom: 0 }]}>
                <Text style={[C.fcBlack, F.ffM, L.taC, F.fsOne5]}>{journeyStatus === 1 ? "Has your bus ride ended?" : "Has you bus ride started?"}</Text>
                <View style={[HT(25)]} />
                <Button onPress={() => { onSubmit(quantity) }} style={[WT('90%'), HT(45)]} label={"Yes"} />
            </View>
        </View>
    );
}

export default BusJourney
