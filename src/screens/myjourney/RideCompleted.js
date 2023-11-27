import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, Linking, Image, ScrollView, Platform, Modal
} from 'react-native';
import { Images } from '../../commonStyles/Images'
import { C, F, HT, L, WT, h } from '../../commonStyles/style-layout';
import { Header, TouchableOpacity, Button, Loader } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import { hasValue, isCompletedTrip } from '../../Utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RootNavigation from '../../Navigation/RootNavigation';
import { API } from '../../shared/API-end-points';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { selectRoute, confirmRide, region_state, route_coordinates_state, current_ride_coordinates_state, current_ride_region_state } from '../master/masterSlice';
STR = require('../../languages/strings');

function RideCompleted({ navigation, route }) {
    const dispatch = useDispatch()
    const responseDataUser = useSelector(state => state.user)
    const responseDataMaster = useSelector(state => state.master)
    const completed_trips = responseDataUser?.completed_trips ?? []
    const region_data = responseDataMaster?.region_data ?? []
    const itemData = route.params?.itemData ?? {};
    const confirm_ride = responseDataMaster?.confirm_ride ?? null
    const select_route = responseDataMaster?.select_route ?? null
    const agent = confirm_ride?.fulfillment?.agent ?? {}
    const vehicle_state = confirm_ride?.fulfillment?.state?.descriptor ?? {}
    const vehicle_detail = confirm_ride?.fulfillment?.vehicle ?? {}
    const authorization = confirm_ride?.fulfillment?.start?.authorization ?? {}
    const [modalCancel, set_modalCancel] = useState(false);
    const [cancelReason, set_cancelReason] = useState("");
    const [modalConfirm, set_modalConfirm] = useState(false);
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
    console.log(confirm_ride, 'confirm_ride222');

    useFocusEffect(
        React.useCallback(() => {
            set_modalConfirm(false);
            return () => {
                set_modalConfirm(false);
            };
        }, []),
    );

    useEffect(() => {
        try {
            setDestinationCoordinates()
        } catch (error) {
            console.log(error);
        }
    }, [confirm_ride]);

    function setDestinationCoordinates() {
        try {
            if (hasValue(confirm_ride)) {
                const startLocation = confirm_ride?.fulfillment?.start?.location?.gps ?? ""
                const endLocation = confirm_ride?.fulfillment?.end?.location?.gps ?? ""
                var start_data = startLocation.split(",")
                var source_lat = parseFloat(start_data[0])
                var source_lng = parseFloat(start_data[1])

                var end_data = endLocation.split(",")
                var end_lat = parseFloat(end_data[0])
                var end_lng = parseFloat(end_data[1])

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
            }
        } catch (error) {
            console.log(error);
        }
    }
    console.log(source_lat_lng, 'source_lat_lng');
    console.log(destination_lat_lng, 'destination_lat_lng');

    function onCall(flag) {
        try {
            Linking.openURL(`tel:${flag}`)
        } catch (error) {
            console.log(error);
        }
    }
    function openMap() {
        try {
            const url = Platform.select({
                ios: `maps:${destination_lat_lng.latitude},${destination_lat_lng.longitude}`,
                android: `geo:${destination_lat_lng.latitude},${destination_lat_lng.longitude}?center=${destination_lat_lng.latitude},${destination_lat_lng.longitude}&q=${destination_lat_lng.latitude},${destination_lat_lng.longitude}&z=16`,
            });
            Linking.openURL(url);
            // var scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
            // var url = scheme + `${source_lat_lng.latitude},${source_lat_lng.longitude}`;
            // // var url = scheme + `origin=${source_lat_lng.latitude},${source_lat_lng.longitude}&destination=${destination_lat_lng.latitude},${destination_lat_lng.longitude}`;
            // Linking.openURL(url);
        } catch (error) {
            console.log(error);
        }
    }
    function onNext() {
        try {
            if (isCompletedTrip(0)) {
                // RootNavigation.replace("YourConfirmedJourney")
                // RootNavigation.replace("SelectedJourneyDetails")
                onBook()
            } else {
                RootNavigation.replace("RateTrip")
            }
        } catch (error) {
            console.log(error);
        }
    }

    function onBook() {
        try {
            set_modalConfirm(true)
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
                    // RootNavigation.navigate("SelectedBusDetails", {
                    //     itemData: item,
                    //     payloads: payloads
                    // })
                    dispatch(confirmRide(payloads))
                } else {
                    if (select_route.length > 1) {
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
    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen2]}>
            <Header navigation={navigation} hardwareBack={'YourJourney'} left_press={'YourJourney'} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} style={[C.bgTrans]} ic_left={Images.back} label_left={"Ride completed"} ic_right={Images.call} ic_right_style={[WT(25), HT(25)]} ic_right_press={"call"} />
            {responseDataMaster.isLoading && <Loader isLoading={responseDataMaster.isLoading} />}
            <ScrollView>
                <View style={[WT('100%'), L.pH10, L.even, L.aiC, L.jcSB, L.mT10]}>
                    <View style={[L.aiC, L.even, WT('85%')]}>
                        <Image style={[HT(35), WT(35)]} source={Images.auto_black} />
                        <View style={[WT(8)]} />
                        <View style={[]}>
                            <Text style={[C.fcBlack, F.ffB, F.fsOne5]}>Auto ride has completed</Text>
                            <Text style={[C.lColor, F.ffM, F.fsOne2]}>NA</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={[WT('15%'), L.aiR]} onPress={() => openMap()}>
                        <Image style={[HT(20), WT(20)]} source={Images.location} />
                    </TouchableOpacity>
                </View>
                <View style={[HT(35)]} />
                <View style={[WT('100%'), C.bgWhite, L.card]}>
                    <View style={[HT(40)]} />
                    <View style={[, L.aiC]}>
                        <Text style={[C.pColor, F.ffM, F.fsOne8]}>Amount  payable</Text>
                        <Text style={[C.fcBlue, F.ffB, F.fsThree]}>Rs {confirm_ride?.price?.value ?? ""}</Text>
                    </View>
                    <View style={[HT(30)]} />
                    <View style={[L.even, L.jcSB, L.pH10]}>
                        <View style={[]}>
                            <Text style={[C.lColor, F.ffM, F.fsOne4]}>Distance <Text style={[F.ffB]}>NA</Text></Text>
                            <Text style={[C.lColor, F.ffM, F.fsOne4]}>Duration <Text style={[F.ffB]}>NA</Text></Text>
                        </View>
                        <View style={[L.aiR]}>
                            <Text style={[C.lColor, F.ffM, F.fsOne4]}>Start time <Text style={[F.ffB]}>NA</Text></Text>
                            <Text style={[C.lColor, F.ffM, F.fsOne4]}>End time <Text style={[F.ffB]}>NA</Text></Text>
                        </View>
                    </View>
                    <View style={[HT(40)]} />
                </View>
                <View style={[HT(25)]} />
                <View style={[WT('100%'), L.pH10, L.even, L.aiC, L.jcSB]}>
                    <View style={[L.jcC, L.aiC, L.even]}>
                        <Image style={[HT(30), WT(30), L.bR30]} source={Images.avatar} />
                        <View style={[WT(7)]} />
                        <Text style={[C.fcBlack, F.ffB, F.fsOne4]}>{agent?.name ?? ""}</Text>
                    </View>
                    {/* <View style={[L.jcC, L.aiC, L.even, HT(50)]}>
                        <View style={[WT(5)]} />
                        <Text style={[C.fcBlack, F.ffB, F.fsOne7]}>{authorization?.token ?? ""}</Text>
                    </View> */}
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
            <View style={[L.dpARL, { bottom: 10 }]}>
                <Button onPress={() => { onNext() }} style={[WT('90%'), HT(45)]} label={"Next"} />
            </View>
            {/* <View style={[C.bgTrans, L.pH10, L.dpARL]}>
                <Button onPress={() => { RootNavigation.navigate("EndTrip", { itemData: itemData }) }} style={[WT('100%'), HT(45)]} label={STR.strings.start_trip} />
                <View style={[HT(15)]} />
                <TouchableOpacity onPress={() => { set_modalCancel(true) }}
                    style={[WT('100%'), HT(45), L.br05, C.brLightGray, L.bR5, L.jcC, L.aiC]}>
                    <Text style={[C.fcBlack, F.ffB, F.fsOne5, L.taC]}>{STR.strings.cancel_ride}</Text>
                </TouchableOpacity>
                <View style={[HT(15)]} />
            </View> */}
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
                        <Image style={[WT('80%'), HT(300), L.asC]} source={Images.booking_loader} />
                        {/* <TouchableOpacity style={[HT(50), L.pH10, L.asC, L.jcC, L.mT20]} onPress={() => { onCancelBooking() }}>
                            <Text style={[F.fsOne6, F.ffM, C.fcWhite, L.taC, F.tDL]}>{STR.strings.cancel_booking}</Text>
                        </TouchableOpacity> */}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

export default RideCompleted

