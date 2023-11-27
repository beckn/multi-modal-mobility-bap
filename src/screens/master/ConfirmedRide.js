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
import { cancelRide, getRideUpdates, ride_updates_state, current_ride_coordinates_state, current_ride_region_state } from './masterSlice';
import { ride_status_state } from '../user/userSlice';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
STR = require('../../languages/strings');

function ConfirmedRide({ navigation, route }) {
    const dispatch = useDispatch()
    const responseDataMaster = useSelector(state => state.master)
    const responseDataUser = useSelector(state => state.user)
    const confirm_ride = responseDataMaster?.confirm_ride ?? null
    const agent = confirm_ride?.fulfillment?.agent ?? {}
    const vehicle_detail = confirm_ride?.fulfillment?.vehicle ?? {}
    const authorization = confirm_ride?.fulfillment?.start?.authorization ?? {}
    const ride_updates = responseDataMaster?.ride_updates ?? null
    const ride_status = responseDataUser?.ride_status ?? null
    console.log(confirm_ride, 'confirm_ride');
    var mapRef = useRef(null);
    var markerRef = useRef(null);
    const [modalCancel, set_modalCancel] = useState(false);
    const [cancelReason, set_cancelReason] = useState("");
    const [hideCode, setHideCode] = useState(null);
    const [headerLabel, setHeaderLabel] = useState(STR.strings.ride_is_confirmed);
    const [region, setRegion] = useState({
        latitude: API.LATITUDE,
        longitude: API.LONGITUDE,
        latitudeDelta: API.LATITUDE_DELTA,
        longitudeDelta: API.LONGITUDE_DELTA,
    });
    const [routeCoordinates, set_routeCoordinates] = useState([]);
    const [delta, setDelta] = useState({
        latitudeDelta: API.LATITUDE_DELTA,
        longitudeDelta: API.LONGITUDE_DELTA
    });
    const [distance, setDistance] = useState(0);
    const [source_lat_lng, set_source_lat_lng] = useState({
        latitude: API.LATITUDE,
        longitude: API.LONGITUDE,
        latitudeDelta: API.LATITUDE_DELTA,
        longitudeDelta: API.LONGITUDE_DELTA,
    });
    const [destination_lat_lng, set_destination_lat_lng] = useState({
        latitude: API.LATITUDE,
        longitude: API.LONGITUDE,
        latitudeDelta: API.LATITUDE_DELTA,
        longitudeDelta: API.LONGITUDE_DELTA,
    });
    const [subTitle, setSubTitle] = useState("");
    useFocusEffect(
        React.useCallback(() => {
            let interval = setInterval(() => {
                fetchRideStatus()
            }, 13000);

            const code = ride_updates?.code ?? ""
            if (code === "RIDE_COMPLETED") {
                clearInterval(interval)
            }
            setDestinationCoordinates()
            return () => { clearInterval(interval) };
        }, []),
    );
    console.log(ride_updates?.code ?? "", 'ride_updates code');
    // RIDE_ASSIGNED  RIDE_STARTED  RIDE_IN_PROGRESS  RIDE_COMPLETED
    function fetchRideStatus() {
        try {
            dispatch(getRideUpdates({
                "routeId": confirm_ride?.routeId ?? "",
                "order_id": confirm_ride?.order_id ?? ""
            }))
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        try {
            const code = ride_updates?.code ?? ""
            dispatch(ride_status_state({ ride_status: hasValue(code) ? code : "RIDE_ASSIGNED" }))
            if (code === "RIDE_COMPLETED") {
                RootNavigation.navigate("RideCompleted")
                dispatch(ride_updates_state({}))
                dispatch(ride_status_state({ ride_status: "RIDE_COMPLETED" }))
            }
            setLabels()
        } catch (error) {
            console.log(error);
        }
    }, [ride_updates]);

    function setLabels() {
        try {
            const name = ride_updates?.name ?? ""
            const code = ride_updates?.code ?? ""
            if (code === "RIDE_STARTED" || code === "RIDE_IN_PROGRESS" || code === "RIDE_COMPLETED") {
                setHideCode(name)
            } else {
                setHideCode(null)
            }
            if (code === "RIDE_IN_PROGRESS") {
                setHeaderLabel(name)
                setSubTitle("Trip Started")
            } else {
                setHeaderLabel(STR.strings.ride_is_confirmed)
                setSubTitle("Auto is on the way")
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        try {
            setDestinationCoordinates()
        } catch (error) {
            console.log(error);
        }
    }, [confirm_ride]);

    useEffect(() => {
        try {
            setDestinationCoordinates()
        } catch (error) {
            console.log(error);
        }
    }, [ride_status]);

    function setDestinationCoordinates() {
        try {
            if (hasValue(confirm_ride)) {
                const startLocation = confirm_ride?.fulfillment?.start?.location?.gps ?? region
                const endLocation = confirm_ride?.fulfillment?.end?.location?.gps ?? region
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
                        icon: confirm_ride?.type === "AUTO" ? Images.auto_marker : Images.bus_marker
                    },
                    {
                        latitude: end_lat ?? API.LATITUDE,
                        longitude: end_lng ?? API.LONGITUDE,
                        latitudeDelta: API.LATITUDE_DELTA,
                        longitudeDelta: API.LONGITUDE_DELTA,
                    },
                ]
                set_routeCoordinates(tmp_routeCoordinates)
                dispatch(current_ride_coordinates_state({
                    current_ride_coordinates: tmp_routeCoordinates
                }))
                set_source_lat_lng({
                    latitude: source_lat ?? API.LATITUDE,
                    longitude: source_lng ?? API.LONGITUDE,
                    latitudeDelta: API.LATITUDE_DELTA,
                    longitudeDelta: API.LONGITUDE_DELTA,
                })
                set_destination_lat_lng({
                    latitude: end_lat ?? API.LATITUDE,
                    longitude: end_lng ?? API.LONGITUDE,
                    latitudeDelta: API.LATITUDE_DELTA,
                    longitudeDelta: API.LONGITUDE_DELTA,
                })
                setZoomLevel({
                    latitude: source_lat ?? API.LATITUDE,
                    longitude: source_lng ?? API.LONGITUDE,
                })
                Geolocation.watchPosition(async (pos) => {
                    console.log(pos, 'pos');
                    const crd = pos.coords;
                    const location_data = {
                        latitude: crd.latitude,
                        longitude: crd.longitude,
                        latitudeDelta: API.LATITUDE_DELTA,
                        longitudeDelta: API.LONGITUDE_DELTA,
                        icon: confirm_ride?.type === "AUTO" ? Images.auto_marker : Images.bus_marker
                    }
                    setZoomLevel(crd)
                    let tmp_routeCoordinates = [
                        location_data,
                        {
                            latitude: end_lat ?? API.LATITUDE,
                            longitude: end_lng ?? API.LONGITUDE,
                            latitudeDelta: API.LATITUDE_DELTA,
                            longitudeDelta: API.LONGITUDE_DELTA,
                        },
                    ]
                    set_routeCoordinates(tmp_routeCoordinates)
                    dispatch(current_ride_coordinates_state({
                        current_ride_coordinates: tmp_routeCoordinates
                    }))
                    set_source_lat_lng({
                        latitude: crd.latitude,
                        longitude: crd.longitude,
                        latitudeDelta: API.LATITUDE_DELTA,
                        longitudeDelta: API.LONGITUDE_DELTA,
                    })
                    set_destination_lat_lng({
                        latitude: end_lat ?? API.LATITUDE,
                        longitude: end_lng ?? API.LONGITUDE,
                        latitudeDelta: API.LATITUDE_DELTA,
                        longitudeDelta: API.LONGITUDE_DELTA,
                    })
                })
            }
        } catch (error) {
            console.log(error);
        }
    }
    function setZoomLevel(crd) {
        try {
            setRegion({
                latitude: crd.latitude,
                longitude: crd.longitude,
                latitudeDelta: delta?.latitudeDelta ?? 0,
                longitudeDelta: delta?.longitudeDelta ?? 0
            });
            dispatch(current_ride_region_state({
                current_ride_region: {
                    latitude: crd.latitude,
                    longitude: crd.longitude,
                    latitudeDelta: delta?.latitudeDelta ?? 0,
                    longitudeDelta: delta?.longitudeDelta ?? 0
                }
            }))
            if (hasValue(ride_status) && ride_status === "RIDE_IN_PROGRESS") {
                setRegion({
                    latitude: crd.latitude,
                    longitude: crd.longitude,
                    latitudeDelta: API.LATITUDE_DELTA,
                    longitudeDelta: API.LONGITUDE_DELTA,
                });
            }
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
            dispatch(cancelRide(confirm_ride))
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
    console.log(routeCoordinates, 'routeCoordinates');
    // RIDE_IN_PROGRESS
    function openMap() {
        try {
            const url = Platform.select({
                ios: `maps:${destination_lat_lng.latitude},${destination_lat_lng.longitude}`,
                android: `geo:${destination_lat_lng.latitude},${destination_lat_lng.longitude}?center=${destination_lat_lng.latitude},${destination_lat_lng.longitude}&q=${destination_lat_lng.latitude},${destination_lat_lng.longitude}&z=16`,
            });
            Linking.openURL(url);
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen2]}>
            <Header navigation={navigation} hardwareBack={'YourJourney'} left_press={'YourJourney'} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} style={[C.bgTrans]} ic_left={Images.back} label_left={headerLabel} ic_right={Images.call} ic_right_style={[WT(25), HT(25)]} ic_right_press={"call"} />
            {/* <Header navigation={navigation} hardwareBack={'cancel_trip'} left_press={'cancel_trip'} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} style={[C.bgTrans]} ic_left={Images.back} label_left={headerLabel} ic_right={Images.call} ic_right_style={[WT(25), HT(25)]} ic_right_press={"call"} /> */}
            {/* {responseDataMaster.isLoading && <Loader isLoading={responseDataMaster.isLoading} />} */}
            <ScrollView>
                <View style={[WT('100%'), L.pH10, L.even, L.aiC, L.jcSB, L.mT10]}>
                    <View style={[L.jcC, L.aiC, L.even]}>
                        <Image style={[HT(35), WT(35)]} source={Images.auto_black} />
                        <View style={[WT(8)]} />
                        <View style={[]}>
                            <Text style={[C.fcBlack, F.ffB, F.fsOne5]}>{subTitle}</Text>
                            {/* <Text style={[C.lColor, F.ffM, F.fsOne2]}>Arriving in 7 minutes</Text> */}
                        </View>
                    </View>
                    {ride_status === "RIDE_IN_PROGRESS" &&
                        <TouchableOpacity onPress={() => { openMap() }}>
                            <Image style={[WT(20), HT(20)]} source={Images.location} />
                        </TouchableOpacity>
                    }
                </View>
                <View style={[WT('95%'), HT(300), L.asC, L.bR10, L.mT15, { overflow: 'hidden' }, L.card, L.br05, C.brLight]}>
                    <MapView
                        provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                        ref={ref => mapRef = ref}
                        style={[WT('100%'), HT('100%')]}
                        showsMyLocationButton={true}
                        followsUserLocation={true}
                        showsCompass={true}
                        radius={20}
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
                                radius={20}
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
                <View style={[WT('100%'), L.pH10, L.even, L.aiC, L.jcSB, L.mT10]}>
                    <View style={[L.jcC, L.aiC, L.even]}>
                        <Image style={[HT(30), WT(30), L.bR30]} source={Images.avatar} />
                        <View style={[WT(7)]} />
                        <Text style={[C.fcBlack, F.ffB, F.fsOne4]}>{agent?.name ?? ""}</Text>
                    </View>
                    {!hasValue(hideCode) ?
                        (<View style={[L.jcC, L.aiC, L.even, HT(50)]}>
                            <Text style={[C.lColor, F.ffM, F.fsOne4]}>OTP</Text>
                            <View style={[WT(5)]} />
                            <Text style={[C.fcBlack, F.ffB, F.fsOne7]}>{authorization?.token ?? ""}</Text>
                        </View>) :
                        (<View style={[L.jcC, L.aiC, L.even, HT(50)]}>
                            {/* <Text style={[C.fcBlack, F.ffB, F.fsOne7]}>{hideCode}</Text> */}
                        </View>)
                    }
                </View>
                <TouchableOpacity style={[WT('100%'), L.pH10, L.even, L.aiC, L.jcSB]}
                    onPress={() => { onCall(agent?.phone ?? "") }}>
                    <View style={[]}>
                        <Text style={[C.fcBlack, F.ffB, F.fsOne8]}>{vehicle_detail?.registration ?? ""}</Text>
                        <Text style={[C.lColor, F.ffM, F.fsOne3]}>{vehicle_detail?.category ?? ""}</Text>
                    </View>
                    <View style={[L.jcC, L.aiC, L.even, HT(50)]}>
                        <Image style={[HT(30), WT(30), L.bR30]} source={Images.ic_call} />
                    </View>
                </TouchableOpacity>
                <View style={[HT(100)]} />
            </ScrollView>
            <View style={[C.bgTrans, L.pH10, L.dpARL]}>
                {/* <View style={[L.asR, L.mB10]}>
                    <Text style={[C.fcBlack, F.ffM, F.fsOne4]}>Distance:- {distance} km</Text>
                </View> */}
                <View style={[HT(15)]} />
                <TouchableOpacity onPress={() => { set_modalCancel(true) }}
                    style={[WT('100%'), HT(45), L.br05, C.brLightGray, L.bR5, L.jcC, L.aiC]}>
                    <Text style={[C.fcBlack, F.ffB, F.fsOne5, L.taC]}>{STR.strings.cancel_ride}</Text>
                </TouchableOpacity>
                <View style={[HT(15)]} />
            </View>
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
                                data={filter_data}
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

export default ConfirmedRide

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
