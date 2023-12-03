import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, FlatList, Image, Modal, Dimensions
} from 'react-native';
import { Images } from '../../commonStyles/Images'
import { C, F, HT, L, WT, h } from '../../commonStyles/style-layout';
import { Header, TouchableOpacity, TextField, Button, Loader } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import { MyToast, hasValue } from '../../Utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { API } from '../../shared/API-end-points';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapViewDirections from 'react-native-maps-directions';
import { region_state, ridesStatus, searchRoutes, rides_status_state, ride_updates_state, getRideUpdates } from './masterSlice';
import { completed_trips_state } from '../user/userSlice';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import RootNavigation from '../../Navigation/RootNavigation';
STR = require('../../languages/strings');

function Dashboard({ navigation }) {
    const dispatch = useDispatch()
    const responseDataMaster = useSelector(state => state.master)
    const ride_updates = responseDataMaster?.ride_updates?.descriptor ?? null
    const rides_status = responseDataMaster?.rides_status ?? null
    var mapRef = useRef(null);
    var markerRef = useRef(null);
    const [selected_tab, set_selected_tab] = useState(1);
    const [selected_tab2, set_selected_tab2] = useState("ALL");
    const [selected_tab3, set_selected_tab3] = useState(1);
    const [modalSearch, set_modalSearch] = useState(false);
    const [location_type, set_location_type] = useState(1);
    const [modalRide, setModalRide] = useState(false);
    const [modalConfirmLocation, set_modalConfirmLocation] = useState(false);
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
    const [search_value, set_search_value] = useState("");
    const [start_location, setStartLocation] = useState("");
    const [end_location, setEndLocation] = useState("");

    const [confirm_region, set_confirm_region] = useState({
        latitude: API.LATITUDE,
        longitude: API.LONGITUDE,
        latitudeDelta: API.LATITUDE_DELTA,
        longitudeDelta: API.LONGITUDE_DELTA,
    });
    const [searchedData, set_searchedData] = useState(null);

    useFocusEffect(
        React.useCallback(() => {
            const code = ride_updates?.code ?? null
            if (code === "RIDE_COMPLETED") {
                dispatch(getRideUpdates({ "cancel": "CANCELED" }))
            }
            dispatch(rides_status_state({}))
            dispatch(completed_trips_state({}))
            dispatch(ride_updates_state({}))
            setStartLocation("")
            setEndLocation("")

            dispatch(ridesStatus({}))
            setModalRide(false)
            return () => { };
        }, []),
    );
    useFocusEffect(
        React.useCallback(() => {
            onCurrentRideStatus()
            return () => { };
        }, [rides_status]),
    );

    function onCurrentRideStatus() {
        try {
            setModalRide(false)
            setStartLocation("")
            setEndLocation("")
            const code = ride_updates?.code ?? ""
            if (hasValue(rides_status) && rides_status.length > 0) {
                const status = rides_status[0].status ?? null
                const feedBackScreenDisplayed = rides_status[0].feedBackScreenDisplayed ?? null
                if (status === "IN_PROGRESS") {
                    setModalAddress()
                } else if (status === "CONFIRMED") {
                    setModalAddress()
                } else if (status === "COMPLETED") {
                    if (feedBackScreenDisplayed === false) {
                        setModalAddress()
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    function setModalAddress() {
        try {
            rides_status[0].details.forEach(element => {
                if (element.status != "SELECTED") {
                    if (element.type === "BUS") {
                        setStartLocation(element?.fulfillment?.start?.location?.descriptor?.name ?? "")
                        setEndLocation(element?.fulfillment?.end?.location?.descriptor?.name ?? "")
                    } else {
                        setStartLocation(element?.fulfillment?.start?.location?.address?.ward ?? "")
                        setEndLocation(element?.fulfillment?.end?.location?.address?.ward ?? "")
                    }
                }
            });
            setModalRide(true)
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        try {
            Geolocation.getCurrentPosition(async (pos) => {
                const crd = pos.coords;
                const location_data = {
                    latitude: crd.latitude,
                    longitude: crd.longitude,
                    latitudeDelta: API.LATITUDE_DELTA,
                    longitudeDelta: API.LONGITUDE_DELTA,
                }
                const formatted_address = await getAddressFromCoordinates(crd.latitude, crd.longitude)
                setPosition(location_data);
                setRegion(location_data);
                set_source_location(formatted_address)
                set_source_lat_lng(location_data)
                let tmp_routeCoordinates = []
                tmp_routeCoordinates.push({
                    ...location_data,
                    name: formatted_address,
                })
                tmp_routeCoordinates.push({
                    latitude: crd.latitude + .0005,
                    longitude: crd.longitude + .0007,
                    latitudeDelta: API.LATITUDE_DELTA,
                    longitudeDelta: API.LONGITUDE_DELTA,
                    marker: "auto"
                })
                tmp_routeCoordinates.push({
                    latitude: crd.latitude + .0010,
                    longitude: crd.longitude + .0001,
                    latitudeDelta: API.LATITUDE_DELTA,
                    longitudeDelta: API.LONGITUDE_DELTA,
                    marker: "auto"
                })
                tmp_routeCoordinates.push({
                    latitude: crd.latitude + .0001,
                    longitude: crd.longitude + .0009,
                    latitudeDelta: API.LATITUDE_DELTA,
                    longitudeDelta: API.LONGITUDE_DELTA,
                    marker: "auto"
                })
                set_destination_location("")
                set_routeCoordinates(tmp_routeCoordinates)
            })
        } catch (error) {
            console.log(error);
        }
    }, []);

    function getAddressFromCoordinates(latitude, longitude) {
        try {
            return new Promise((resolve, reject) => {
                fetch(API.geocode + latitude + ',' + longitude + '&key=' + API.map_key
                ).then(response => response.json()).then(responseJson => {
                    if (responseJson.status === 'OK') {
                        resolve(responseJson?.results?.[0]?.formatted_address);
                    } else {
                        reject("");
                    }
                }).catch(error => {
                    reject(error);
                });
            });
        } catch (error) {
            console.log(error);
            return ""
        }
    }

    // useFocusEffect(
    //     React.useCallback(() => {
    //         set_source_lat_lng(0)
    //         set_destination_lat_lng(0)
    //         set_source_location("")
    //         set_destination_location("")
    //         return () => {
    //             // Cleanup logic (if necessary)
    //         };
    //     }, []),
    // );

    const renderItem = (item, index) => {
        return (
            <TouchableOpacity disabled={true} onPress={() => { set_selected_tab(item.id) }}
                style={[L.mR20,]}>
                <Text style={[F.fsOne3, F.ffB, C.lColor, L.mT8]} numberOfLines={1}>{item.label}</Text>
                <View style={[HT(4), L.bR20, L.mT5, selected_tab == item.id ? C.bgBlack : C.bgWhite]} />
            </TouchableOpacity>
        )
    }
    const renderItem2 = (item, index) => {
        return (
            <TouchableOpacity disabled={item.disable} onPress={() => { set_selected_tab2(item.id) }} style={[L.mR20, WT(60), L.aiC, item.disable ? L.opc4 : L.opc1]}>
                <Image style={[WT(40), HT(40), { tintColor: selected_tab2 == item.id ? C.black : C.gray500 }]} source={item.icon} />
                <Text style={[F.fsOne5, F.ffB, C.lColor, L.mT8]} numberOfLines={1}>{item.label}</Text>
            </TouchableOpacity>
        )
    }
    const renderItem3 = (item, index) => {
        return (
            <TouchableOpacity disabled={item.id === 1 ? false : true} onPress={() => { set_selected_tab3(item.id) }}
                style={[L.mL12, HT(28), L.pH10, L.aiC, L.br05, C.brLightGray, L.bR20, L.jcC, selected_tab3 == item.id ? C.bgBlack : C.bgWhite, item.id === 1 ? L.opc1 : L.opc4]}>
                <Text style={[F.fsOne3, F.ffM, selected_tab3 == item.id ? C.fcWhite : C.lColor]} numberOfLines={1}>{item.label}</Text>
            </TouchableOpacity>
        )
    }
    function returnDelta(params) {
        try {
            const northeast = params?.geometry?.viewport?.northeast ?? {}
            const southwest = params?.geometry?.viewport?.southwest ?? {}
            const { width, height } = Dimensions.get('window');
            const ASPECT_RATIO = width / height;
            const northeastLat = northeast.lat;
            const southwestLat = southwest.lat;
            const latDelta = northeastLat - southwestLat;
            const lngDelta = latDelta * ASPECT_RATIO;
            return {
                latitudeDelta: hasValue(latDelta) ? latDelta : API.LATITUDE_DELTA,
                longitudeDelta: hasValue(lngDelta) ? lngDelta : API.LONGITUDE_DELTA,
            }
        } catch (error) {
            console.log(error);
            return {
                latitudeDelta: API.LATITUDE_DELTA,
                longitudeDelta: API.LONGITUDE_DELTA,
            }
        }
    }
    function onSearchSelect(params) {
        try {
            const location_data = params?.geometry?.location ?? null
            set_searchedData(params)
            set_modalSearch(false)

            const latitudeDelta = returnDelta(params).latitudeDelta
            const longitudeDelta = returnDelta(params).longitudeDelta
            const routeCoordinates_obj = {
                latitude: location_data?.lat ?? API.LATITUDE,
                longitude: location_data?.lng ?? API.LONGITUDE,
                latitudeDelta: latitudeDelta,
                longitudeDelta: longitudeDelta
            }
            set_confirm_region(routeCoordinates_obj)
            setTimeout(() => {
                set_modalConfirmLocation(true)
            }, 600);
        } catch (error) {
            set_modalSearch(false)
            console.log(error);
        }
    }
    function onConfirmLocation() {
        try {
            const location_data = searchedData?.geometry?.location ?? null
            if (hasValue(location_data)) {
                const latitudeDelta = returnDelta(searchedData).latitudeDelta
                const longitudeDelta = returnDelta(searchedData).longitudeDelta
                const routeCoordinates_obj = {
                    latitude: location_data?.lat ?? API.LATITUDE,
                    longitude: location_data?.lng ?? API.LONGITUDE,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta
                }
                const formatted_address = searchedData?.formatted_address ?? ""
                setRegion(routeCoordinates_obj)
                if (location_type === 1) {
                    set_source_location(formatted_address)
                    set_source_lat_lng(routeCoordinates_obj)
                    let tmp_routeCoordinates = []
                    tmp_routeCoordinates.push({
                        ...routeCoordinates_obj,
                        name: formatted_address,
                    })
                    set_destination_location("")
                    set_routeCoordinates(tmp_routeCoordinates)
                } else {
                    set_destination_location(formatted_address)
                    set_destination_lat_lng(routeCoordinates_obj)
                    let tmp_routeCoordinates = [{ ...source_lat_lng, name: source_location }]
                    tmp_routeCoordinates.push({
                        ...routeCoordinates_obj,
                        name: formatted_address,
                    })
                    set_routeCoordinates(tmp_routeCoordinates)
                }
            }
            set_modalConfirmLocation(false)
        } catch (error) {
            console.log(error);
            set_modalConfirmLocation(false)
        }
    }
    function regionFrom(lat, lng, accuracy) {
        try {
            const oneDegreeOfLongitudeInMeters = 111.32 * 1000;
            const circumference = (40075 / 360) * 1000;
            const latDelta = accuracy * (1 / (Math.cos(lat) * circumference));
            const lonDelta = (accuracy / oneDegreeOfLongitudeInMeters);
            const routeCoordinates_obj = {
                latitude: lat ?? API.LATITUDE,
                longitude: lng ?? API.LONGITUDE,
                latitudeDelta: Math.max(0, latDelta),
                longitudeDelta: Math.max(0, lonDelta)
            }
            setRegion(routeCoordinates_obj)
        } catch (error) {
            console.log(error);
        }
    }
    const radiusToDelta = (radius, lat, lng) => {
        try {
            const oneDegreeOfLatitudeInMeters = 230 * 1000;
            const diameter = radius * 2;
            const delta = (diameter * 1609.34) / (oneDegreeOfLatitudeInMeters * Math.cos(lat * (Math.PI / 180)));
            const routeCoordinates_obj = {
                latitude: lat ?? API.LATITUDE,
                longitude: lng ?? API.LONGITUDE,
                latitudeDelta: delta,
                longitudeDelta: delta
            }
            setRegion(routeCoordinates_obj)
            dispatch(region_state({ region_data: routeCoordinates_obj }))
        } catch (error) {
            console.log(error);
        }
    };

    function onChangeLocation() {
        try {
            set_modalConfirmLocation(false)
            setTimeout(() => {
                set_modalSearch(true)
            }, 600);
        } catch (error) {
            set_modalConfirmLocation(false)
            console.log(error);
        }
    }
    function onProceed() {
        try {
            // if (hasValue(start_location)) {
            //     setModalRide(true)
            //     return
            // }
            // const source_lat = hasValue(source_lat_lng?.latitude ?? "") ? source_lat_lng.latitude.toString() : ""
            // const source_lng = hasValue(source_lat_lng?.longitude ?? "") ? source_lat_lng.longitude.toString() : ""
            // const destination_lat = hasValue(destination_lat_lng?.latitude ?? "") ? destination_lat_lng.latitude.toString() : ""
            // const destination_lng = hasValue(destination_lat_lng?.longitude ?? "") ? destination_lat_lng.longitude.toString() : ""
            // dispatch(searchRoutes({
            //     "data": {
            //         "start": source_lat + "," + source_lng,
            //         "end": destination_lat + "," + destination_lng,
            //         "type": selected_tab2,
            //     },
            //     "itemData": {
            //         source_location: source_location,
            //         destination_location: destination_location,
            //     }
            // }))

            dispatch(searchRoutes({
                "data": {
                    "start": "19.9590949,73.84173609999999",
                    "end": "20.0089103,73.80779749999999",
                    "type": "ALL"
                },
                "itemData": {
                    "source_location": "Government Colony, Nashik, Maharashtra, India",
                    "destination_location": "2R55+H47, Adgaon Naka, Vaishnavi Park, Nashik, Maharashtra 422003, India"
                }
            }))
        } catch (error) {
            console.log(error);
        }
    }
    function onDestinationInput(params) {
        try {
            if (!hasValue(source_location)) {
                MyToast(STR.strings.please_enter_source_location_first);
                return;
            }
            set_modalSearch(true);
            set_location_type(2);
        } catch (error) {
            console.log(error);
        }
    }
    function onRideModal() {
        try {
            setModalRide(false)
            if (hasValue(rides_status) && rides_status.length > 0) {
                RootNavigation.replace("YourJourney")
                const feedBackScreenDisplayed = rides_status[0].feedBackScreenDisplayed ?? null
                // if (feedBackScreenDisplayed === false) {
                //     RootNavigation.replace("RateTrip")
                // } else {
                //     RootNavigation.replace("YourJourney")
                // }
            }
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen]}>
            <Header navigation={navigation} hardwareBack={2} left_press={"MenuScreen"} card={false} height={HT(45)} ic_left_style={[WT(50), HT(50), { marginLeft: -10 }]} ic_left={Images.menu} ic_right={Images.avatar} ic_right_style={[WT(30), HT(30), { marginRight: -5 }]} ic_right_press="PersonalDetails" />
            {responseDataMaster.isLoading && <Loader isLoading={responseDataMaster.isLoading} />}
            <View style={[L.mT5, L.pH10]}>
                <FlatList
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps='always'
                    horizontal={true}
                    keyExtractor={(item, index) => String(index)}
                    data={menu_data}
                    renderItem={({ item, index }) => renderItem(item, index)}
                    contentContainerStyle={[{ paddingBottom: h(0) }]}
                />
            </View>
            <View style={[C.bgWhite, L.card, L.br05, C.brLightest]}>
                <FlatList
                    style={[L.mT15]}
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps='always'
                    horizontal={true}
                    keyExtractor={(item, index) => String(index)}
                    data={menu_data2}
                    renderItem={({ item, index }) => renderItem2(item, index)}
                    contentContainerStyle={[{ paddingBottom: h(2) }]}
                />
            </View>
            <View style={[WT('100%'), HT('55%')]}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    ref={mapRef}
                    style={[WT('100%'), HT('100%')]}
                    showsMyLocationButton={true}
                    followsUserLocation={true}
                    showsCompass={true}
                    initialRegion={region}
                    region={region}>
                    <>
                        {routeCoordinates.map(marker => (
                            <Marker coordinate={marker}>
                                {hasValue(marker?.marker ?? "") ?
                                    (<Image source={marker.marker === "auto" ? Images.auto : Images.bus_full} resizeMode="contain" style={[WT(20), HT(20)]} />)
                                    :
                                    (<Image source={Images.current_location} resizeMode="contain" style={[WT(65), HT(65)]} />)
                                }
                            </Marker>
                        ))}
                    </>
                    {hasValue(routeCoordinates) && routeCoordinates.length > 0 ?
                        (
                            <>
                                {hasValue(destination_location) && <>
                                    <Marker
                                        ref={markerRef}
                                        coordinate={routeCoordinates[0]}
                                        onPress={() => { }}>
                                    </Marker>
                                    <MapViewDirections
                                        origin={routeCoordinates[0]}
                                        destination={routeCoordinates.length > 1 ? routeCoordinates[routeCoordinates.length - 1] : routeCoordinates[0]}
                                        apikey={API.map_key}
                                        mode='DRIVING'
                                        onReady={(result) => {
                                            let distance = result?.distance ?? 0
                                            if (distance != 0) {
                                                radiusToDelta(distance, routeCoordinates[routeCoordinates.length - 1].latitude, routeCoordinates[routeCoordinates.length - 1].longitude)
                                            }
                                        }}
                                        strokeWidth={4}
                                        strokeColor={C.strokeColor}
                                        fillColor={C.fillColor}
                                        waypoints={routeCoordinates}
                                        optimizeWaypoints={true}
                                        splitWaypoints={true}
                                        resetOnChange={false}
                                        precision={'high'}
                                    />
                                    <Marker
                                        ref={markerRef}
                                        coordinate={routeCoordinates.length > 1 ? routeCoordinates[routeCoordinates.length - 1] : routeCoordinates[0]}
                                        onPress={() => { }}>
                                    </Marker>
                                </>}
                            </>
                        ) :
                        (
                            <Marker
                                ref={markerRef}
                                coordinate={region}
                                onPress={() => { }}>
                                <Image source={Images.current_location} resizeMode="contain" style={[WT(65), HT(65)]} />
                            </Marker>
                        )
                    }
                </MapView>
            </View>
            <View style={[C.bgWhite, L.card, L.dpARL]}>
                {/* <View style={[L.even, L.jcC, L.aiC, WT('100%')]}> 
                        <View style={[WT('70%'), L.jcC, L.aiC, HT(28)]}>
                        <FlatList
                            showsHorizontalScrollIndicator={false}
                            keyboardShouldPersistTaps='always'
                            horizontal={true}
                            keyExtractor={(item, index) => String(index)}
                            data={menu_data3}
                            renderItem={({ item, index }) => renderItem3(item, index)}
                        />
                    </View>
                    <View style={[WT('30%'), HT(40), L.jcC, L.even, L.aiC, L.jcB, { borderTopWidth: 2, borderBottomWidth: 2, borderTopColor: C.gray100, borderBottomColor: C.gray100 }]}>
                        <Image style={[WT(20), HT(20)]} source={Images.filter} />
                        <View style={[WT(5)]} />
                        <Text style={[F.fsOne5, F.ffB, C.lColor]} numberOfLines={1}>{STR.strings.more_filters}</Text>
                        <View style={[WT(5)]} />
                    </View> 
                </View> */}
                <View style={[WT('95%'), L.asC, L.even, L.aiC, L.pH10, L.jcSB, L.mT15]}>
                    <View style={[WT('10%'), L.jc]}>
                        <View style={[WT(7), HT(7), L.bR20, hasValue(source_location) ? C.bgBlack : C.bgLightGray]} />
                        <View style={[HT(60), WT(1), L.bR20, C.bgVLGray, L.mT1, L.mL3]} />
                        <View style={[WT(7), HT(7), L.bR20, hasValue(destination_location) ? C.bgBlack : C.bgLightGray, L.mT1]} />
                    </View>
                    <View style={[WT('90%')]}>
                        <TouchableOpacity style={[HT(50), WT('100%'), C.bgWhite, L.asC, L.aiC, L.br05, C.brLight, L.bR10, L.pH10]}
                            onPress={() => { set_modalSearch(true); set_location_type(1); set_search_value(source_location) }}>
                            <TextField
                                style={[HT(50), WT('100%'), C.lColor, F.ffM]}
                                placeholder={STR.strings.your_location}
                                value={source_location}
                                returnKeyType='done'
                                editable={false}
                                onChangeText={text => { set_source_location(text) }}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={[HT(50), WT('100%'), L.even, C.bgWhite, L.asC, L.aiC, L.br05, C.brLight, L.bR10, L.pH10, L.mT15]}
                            onPress={() => { onDestinationInput(); set_search_value(destination_location) }}>
                            <View style={[WT('90%')]}>
                                <TextField
                                    style={[HT(50), WT('100%'), C.lColor, F.ffB]}
                                    placeholder={STR.strings.where_do_you_want_to_go}
                                    value={destination_location}
                                    returnKeyType='done'
                                    editable={false}
                                    placeholderTextColor={C.black}
                                    onChangeText={text => { set_destination_location(text) }}
                                />
                            </View>
                            <TouchableOpacity style={[WT('10%'), L.aiR, HT(50), L.jcC]}>
                                <Icon name={"magnify"} size={22} color={C.gray400} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </View>
                </View>
                <Button onPress={() => { onProceed() }} style={[WT('90%'), HT(45), L.mT20, hasValue(source_location) && hasValue(destination_location) ? L.opc1 : L.opc4]} label={STR.strings.proceed} />
                {/* <Button disabled={hasValue(source_location) && hasValue(destination_location) ? false : true} onPress={() => { onProceed() }} style={[WT('90%'), HT(45), L.mT20, hasValue(source_location) && hasValue(destination_location) ? L.opc1 : L.opc4]} label={STR.strings.proceed} /> */}
                <View style={[HT(15)]} />
            </View>
            <Modal
                transparent={true}
                supportedOrientations={['portrait', 'landscape']}
                visible={modalSearch}
                animationType='fade'
                onRequestClose={() => set_modalSearch(false)}>
                <View style={[WT('100%'), HT('100%'), C.bgTPL, L.jcC]}>
                    <View style={[WT('100%'), HT('100%'), L.asC, L.pH20, C.bgWhite, L.pH10]}>
                        <View style={[L.even]}>
                            <View style={[WT('12%'), L.mT5]}>
                                <TouchableOpacity style={([WT(33), HT(40), L.jcC, L.aiC, L.bR20])} onPress={() => { set_modalSearch(false) }}>
                                    <Image style={[WT(80), HT(80)]} source={Images.back} />
                                </TouchableOpacity>
                            </View>
                            <GooglePlacesAutocomplete
                                styles={{
                                    textInput: [WT('88%'), C.bgWhite, L.card, L.asC, L.aiC, L.br05, C.brLight, L.bR10, L.pH10],
                                }}
                                query={{
                                    key: API.map_key,
                                    language: 'en',
                                }}
                                placeholder='Search Location'
                                fetchDetails={true}
                                // ref={ref => {
                                //     ref?.setAddressText(search_value)
                                // }}
                                textInputProps={{
                                    placeholderTextColor: '#7c7c7c',
                                    // onFocus: () => setisSearchEnable(true),
                                    // onBlur: () => setisSearchEnable(true),
                                    // value: search_value,
                                    // onChangeText: (tex) => set_search_value(tex)
                                }}
                                onPress={(data, details = null) => { onSearchSelect(details) }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                transparent={true}
                supportedOrientations={['portrait', 'landscape']}
                visible={modalConfirmLocation}
                animationType='fade'
                onRequestClose={() => set_modalConfirmLocation(false)}>
                <View style={[WT('100%'), HT('100%'), C.bgTPL, L.jcC]}>
                    <View style={[WT('100%'), HT('100%'), L.asC, C.bgWhite]}>
                        <View style={[WT('100%'), HT('80%')]}>
                            <MapView
                                provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                                ref={ref => mapRef = ref}
                                style={[WT('100%'), HT('97%')]}
                                // showsUserLocation={true}
                                showsMyLocationButton={true}
                                followsUserLocation={true}
                                showsCompass={true}
                                initialRegion={position}
                                // initialCamera={position}
                                region={confirm_region}>
                                <Marker coordinate={confirm_region}>
                                    <Image source={Images.current_location} resizeMode="contain" style={[WT(65), HT(65)]} />
                                </Marker>
                            </MapView>
                        </View>
                        <View style={[C.bgWhite, L.card, L.pH10, L.dpARL]}>
                            <View style={[WT('95%'), L.asC, L.jcSB]}>
                                <View style={[WT('100%'), L.aiC, L.jcSB, L.even]}>
                                    <Text style={[F.fsOne5, F.ffM, C.lColor]}>{STR.strings.select_location}</Text>
                                    <TouchableOpacity style={[HT(40), L.jcC]} onPress={() => { onChangeLocation() }}>
                                        <Text style={[F.fsOne5, F.ffB, C.lColor, F.tDL]}>{STR.strings.change}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={[F.fsOne5, F.ffB, C.lColor]} numberOfLines={1}>{searchedData?.name ?? ""}</Text>
                                <Text style={[F.fsOne5, F.ffM, C.lColor]} numberOfLines={2}>{searchedData?.formatted_address ?? ""}</Text>
                            </View>
                            <Button onPress={() => { onConfirmLocation() }} style={[WT('100%'), HT(45), L.mT20]} label={STR.strings.confirm_location} />
                            <View style={[HT(15)]} />
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                transparent={true}
                supportedOrientations={['portrait', 'landscape']}
                visible={modalRide}
                animationType='fade'
                onRequestClose={() => setModalRide(false)}>
                <View style={[WT('100%'), HT('100%'), C.bgTPL, L.jcC]}>
                    <TouchableOpacity style={[WT('95%'), L.asC, C.bgWhite, L.card, C.bgBlack, L.pH12, L.bR5]}
                        onPress={() => { onRideModal() }}>
                        <View style={[WT('100%'), L.aiR, L.mT8]}>
                            <Text style={[F.fsOne5, F.ffM, C.fcWhite]} numberOfLines={1}>{STR.strings.view}{" >"}</Text>
                        </View>
                        <View style={[WT('100%'), L.aiC, L.even]}>
                            <Image source={Images.route} resizeMode="contain" style={[WT(20), HT(20)]} />
                            <View style={[WT(8)]} />
                            <Text style={[F.fsOne5, F.ffB, C.fcWhite]} numberOfLines={1}>{STR.strings.your_current_journey_details}</Text>
                        </View>
                        <View style={[WT('100%'), L.aiC, L.jcSB, L.even, L.mT5]}>
                            <Text style={[F.fsOne3, F.ffB, C.fcWhite, WT('45%')]}>{start_location}</Text>
                            <View style={[WT(5)]} />
                            <Image source={Images.right_arrow} resizeMode="contain" style={[WT(20), HT(20)]} />
                            <View style={[WT(5)]} />
                            <Text style={[F.fsOne3, F.ffM, C.fcWhite, WT('45%')]}>{end_location}</Text>
                        </View>
                        <View style={[HT(10)]} />
                    </TouchableOpacity>
                    <View style={[HT("35%")]} />
                </View>
            </Modal>
        </View>
    );
}

export default Dashboard

const menu_data = [
    {
        label: STR.strings.transport_services,
        id: 1
    },
    // {
    //     label: STR.strings.vehicle_rentals,
    //     id: 2
    // },
    // {
    //     label: STR.strings.other_services,
    //     id: 3
    // },
]

const menu_data3 = [
    {
        label: "Ride Now",
        id: 1
    },
    // {
    //     label: "Schedule for later",
    //     id: 2
    // }, 
]

const menu_data2 = [
    {
        label: "All",
        icon: Images.all,
        id: "ALL"
    },
    {
        label: "Bus",
        icon: Images.bus,
        id: "BUS",
        disable: true
    },
    {
        label: "Auto",
        icon: Images.metro,
        id: "AUTO",
        disable: true
    },
    // {
    //     label: "Metro",
    //     icon: Images.metro,
    //     id: "METRO"
    // },
    // {
    //     label: "Taxi",
    //     icon: Images.taxi,
    //     id: "TAXI"
    // },
]
