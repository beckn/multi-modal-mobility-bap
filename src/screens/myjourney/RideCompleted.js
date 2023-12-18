import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, Linking, Image, ScrollView, Platform, Modal
} from 'react-native';
import { Images } from '../../commonStyles/Images'
import { C, F, HT, L, WT, h } from '../../commonStyles/style-layout';
import { Header, TouchableOpacity, Button, Loader } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import { dateTime, hasValue, isCompletedTrip } from '../../Utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RootNavigation from '../../Navigation/RootNavigation';
import { API } from '../../shared/API-end-points';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { selectRoute, confirmRide, region_state, route_coordinates_state, current_ride_coordinates_state, current_ride_region_state, getRideUpdates } from '../master/masterSlice';
STR = require('../../languages/strings');

function RideCompleted({ navigation, route }) {
    const dispatch = useDispatch()
    const responseDataUser = useSelector(state => state.user)
    const responseDataMaster = useSelector(state => state.master)
    const completed_trips = responseDataUser?.completed_trips ?? []
    const region_data = responseDataMaster?.region_data ?? []
    const itemData = route.params?.itemData ?? null;
    const confirm_ride = responseDataMaster?.confirm_ride ?? null
    const select_route = responseDataMaster?.select_route ?? null
    const ride_updates = responseDataMaster?.ride_updates ?? null
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

    useFocusEffect(
        React.useCallback(() => {
            if (hasValue(itemData)) {
                dispatch(getRideUpdates({
                    "routeId": itemData?.routeId ?? "",
                    "order_id": itemData?.order_id ?? ""
                }))
            } else {
                dispatch(getRideUpdates({
                    "routeId": responseDataMaster?.confirm_ride?.routeId ?? "",
                    "order_id": responseDataMaster?.confirm_ride?.order_id ?? ""
                }))
            }
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
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen2]}>
            <Header navigation={navigation} hardwareBack={'check_rides'} left_press={'check_rides'} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} style={[C.bgTrans]} ic_left={Images.back} label_left={ride_updates?.descriptor?.name ?? ""} ic_right={Images.call} ic_right_style={[WT(25), HT(25)]} ic_right_press={"call"} />
            {responseDataMaster.isLoading && <Loader isLoading={responseDataMaster.isLoading} />}
            <ScrollView>
                <View style={[WT('100%'), L.pH10, L.even, L.aiC, L.jcSB, L.mT10]}>
                    <View style={[L.aiC, L.even, WT('85%')]}>
                        <Image style={[HT(35), WT(35)]} source={Images.auto_black} />
                        <View style={[WT(8)]} />
                        <View style={[]}>
                            <Text style={[C.fcBlack, F.ffB, F.fsOne5]}>{ride_updates?.descriptor?.name ?? ""}</Text>
                            {/* <Text style={[C.lColor, F.ffM, F.fsOne2]}>NA</Text> */}
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
                        <Text style={[C.fcBlue, F.ffB, F.fsThree]}>Rs {ride_updates?.details?.price?.value ?? ""}</Text>
                    </View>
                    <View style={[HT(30)]} />
                    <View style={[L.even, L.jcSB, L.pH10]}>
                        <View style={[]}>
                            <Text style={[C.lColor, F.ffM, F.fsOne4]}>Distance <Text style={[F.ffB]}>{ride_updates?.details?.distance ?? ""}</Text></Text>
                            <Text style={[C.lColor, F.ffM, F.fsOne4]}>Duration <Text style={[F.ffB]}>{ride_updates?.details?.duration ?? ""}</Text></Text>
                        </View>
                        <View style={[L.aiR]}>
                            <Text style={[C.lColor, F.ffM, F.fsOne4]}>Start time <Text style={[F.ffB]}>{dateTime(ride_updates?.details?.startTime ?? "", null, "hh:mm A")}</Text></Text>
                            <Text style={[C.lColor, F.ffM, F.fsOne4]}>End time <Text style={[F.ffB]}>{dateTime(ride_updates?.details?.endTime ?? "", null , "hh:mm A")}</Text></Text>
                        </View>
                    </View>
                    <View style={[HT(40)]} />
                </View>
                <View style={[HT(25)]} />
                <View style={[WT('100%'), L.pH10, L.even, L.aiC, L.jcSB]}>
                    <View style={[L.jcC, L.aiC, L.even]}>
                        <Image style={[HT(30), WT(30), L.bR30]} source={Images.avatar} />
                        <View style={[WT(7)]} />
                        <Text style={[C.fcBlack, F.ffB, F.fsOne4]}>{ride_updates?.details?.agent?.name ?? ""}</Text>
                    </View>
                </View>
                <TouchableOpacity style={[WT('100%'), L.pH10, L.even, L.aiC, L.jcSB]}
                    onPress={() => { onCall(ride_updates?.details?.agent?.phone ?? "") }}>
                    <View style={[]}>
                        <Text style={[C.fcBlack, F.ffB, F.fsOne8]}>{ride_updates?.details?.vehicle?.registration ?? ""}</Text>
                        <Text style={[C.lColor, F.ffM, F.fsOne3]}>{ride_updates?.details?.vehicle?.category ?? ""}</Text>
                    </View>
                    <View style={[L.jcC, L.aiC, L.even, HT(50)]}>
                        <Image style={[HT(30), WT(30), L.bR30]} source={Images.ic_call} />
                    </View>
                </TouchableOpacity>
                <View style={[HT(100)]} />
            </ScrollView>
            {responseDataMaster.isLoading === true &&
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
                        </View>
                    </View>
                </Modal>
            }
        </View>
    );
}

export default RideCompleted

