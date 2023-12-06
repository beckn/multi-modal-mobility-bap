import React, { useEffect, useState, useRef } from 'react';
import moment from 'moment';
import {
    View, Text, Linking, Image, ScrollView, Modal, FlatList, Platform
} from 'react-native';
import { Images } from '../../commonStyles/Images'
import { C, F, HT, L, WT, h, WTD } from '../../commonStyles/style-layout';
import { Header, TouchableOpacity, TextField, Button, Loader } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import { dateTime, hasValue } from '../../Utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { API } from '../../shared/API-end-points';
import RootNavigation from '../../Navigation/RootNavigation';
import { cancelRide } from '../master/masterSlice';
// import ViewShot from "react-native-view-shot";
// import RNFetchBlob from 'react-native-fetch-blob'
STR = require('../../languages/strings');

function TicketDetails({ navigation, route }) {
    const ref = useRef();
    const dispatch = useDispatch()
    const responseDataMaster = useSelector(state => state.master)
    const itemData = route.params?.itemData ?? null;
    const confirm_ride = responseDataMaster?.confirm_ride ?? null
    const [source_location, set_source_location] = useState("");
    const [end_location, set_end_location] = useState("");
    const [ticketId, set_ticketId] = useState("");
    const [modalCancel, set_modalCancel] = useState(false);
    const [cancelReason, set_cancelReason] = useState("");
    const [ticketDetail, setTicketDetail] = useState({});
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
    // useEffect(() => {
    //     // on mount
    //     ref.current.capture().then(uri => {
    //         console.log("do something with ", uri);
    //     });
    // }, []);

    useEffect(() => {
        try {
            setBustDetail()
        } catch (error) {
            console.log(error);
        }
    }, [itemData]);

    useEffect(() => {
        try {
            setBustDetail()
        } catch (error) {
            console.log(error);
        }
    }, [confirm_ride]);

    function setBustDetail() {
        try {
            if (hasValue(itemData)) {
                setTicketDetail(itemData)
            } else {
                if (hasValue(confirm_ride)) {
                    const type = confirm_ride?.type ?? null
                    if (type === "BUS") {
                        setTicketDetail(confirm_ride)
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }


    useEffect(() => {
        try {
            if (hasValue(ticketDetail)) {
                const start_ward = ticketDetail?.fulfillment?.start?.location?.descriptor?.name ?? ""
                const end_ward = ticketDetail?.fulfillment?.end?.location?.descriptor?.name ?? ""
                set_source_location(start_ward)
                set_end_location(end_ward)
                set_ticketId(ticketDetail?.order_id ?? "")
                setDestinationCoordinates()
            }
        } catch (error) {
            console.log(error);
        }
    }, [ticketDetail]);

    function setDestinationCoordinates() {
        try {
            if (hasValue(ticketDetail)) {
                const startLocation = ticketDetail?.fulfillment?.start?.location?.gps ?? ""
                const endLocation = ticketDetail?.fulfillment?.end?.location?.gps ?? ""
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

    function downloadTicket() {
        try {
            Linking.openURL(ticketDetail?.qr ?? "");
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
            dispatch(cancelRide(ticketDetail))
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
            {/* <Header navigation={navigation} hardwareBack={'check_rides'} left_press={'check_rides'} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} style={[C.bgTrans]} ic_left={Images.back} label_left={"Your Bus Ticket Details"} ic_right={Images.call} ic_right_style={[WT(25), HT(25)]} ic_right_press={"call"} /> */}
            <Header navigation={navigation} hardwareBack={'YourJourney'} left_press={'YourJourney'} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} style={[C.bgTrans]} ic_left={Images.back} label_left={"Your Bus Ticket Details"} ic_right={Images.call} ic_right_style={[WT(25), HT(25)]} ic_right_press={"call"} />
            {/* <Header navigation={navigation} hardwareBack={"YourJourney"} left_press={"YourJourney"} height={HT(70)} card={false} style={[C.bgTrans]} label_center={"Your Bus Ticket Details"} /> */}
            {responseDataMaster.isLoading && <Loader isLoading={responseDataMaster.isLoading} />}
            {/* <ViewShot ref={ref} options={{ fileName: "Your-File-Name", format: "jpg", quality: 0.9 }}> */}
            <ScrollView>
                <Image style={[WT(200), HT(200), L.asC, L.mT10]} source={hasValue(ticketDetail?.qr ?? "") ? { uri: ticketDetail.qr } : Images.qr_code} />
                <Text style={[C.fcBlack, F.ffM, F.fsOne8, L.taC, L.pH10, L.mT10]}>{STR.strings.ticket} 1/1</Text>
                <Text style={[C.lColor, F.ffM, F.fsOne3, L.taC, L.pH10]}>{STR.strings.please_show_this_qr_code_to_the_conductor_to_enter_the_bus}</Text>
                <View style={[WT('100%'), HT(3), C.bgLGray, L.mT25]} />
                <View style={[WT('100%'), L.pH10, L.even, L.aiC, L.jcSB, L.pV15]}>
                    <View style={[WT('60%')]}>
                        <Text style={[C.lColor, F.ffB, F.fsOne5]}>Route No. {ticketDetail?.routeNo ?? ""}</Text>
                        <View style={[WT(100), HT(1.5), C.bgVLGray]} />
                        <Text style={[C.lColor, F.ffM, F.fsOne2, L.mT2]}>Bus No. {ticketDetail?.vehicleNo ?? ""}</Text>
                    </View>
                    <View style={[WT('40%'), L.aiR]}>
                        <TouchableOpacity onPress={() => { openMap() }}>
                            <Image style={[WT(20), HT(20)]} source={Images.location} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => RootNavigation.navigate("TicketValid", { itemData: ticketDetail })}>
                            <Text style={[C.fcBlue, F.ffM, F.fsOne2, L.mT2]}>Upcoming buses {" >"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[WT('100%'), HT(3), C.bgLGray]} />
                <View style={[WT('100%'), L.pH10, L.even, L.aiC, L.jcSB, L.pV15]}>
                    <View style={[WT('35%')]}>
                        <Text style={[C.lColor, F.ffM, F.fsOne3]}>{STR.strings.from}</Text>
                        <Text style={[C.fcBlack, F.ffM, F.fsOne5]}>{source_location}</Text>
                    </View>
                    <View style={[WT('15%'), L.aiC]}>
                        <Icon name={"arrow-right"} size={22} color={C.gray400} />
                    </View>
                    <View style={[WT('35%')]}>
                        <Text style={[C.lColor, F.ffM, F.fsOne3]}>{STR.strings.to}</Text>
                        <Text style={[C.fcBlack, F.ffM, F.fsOne5]}>{end_location}</Text>
                    </View>
                </View>
                <View style={[WT('100%'), HT(3), C.bgLGray]} />
                <View style={[WT('100%'), L.pH10, L.even, L.aiC, L.jcSB, L.pV15]}>
                    <View style={[WT('35%'), L.aiL]}>
                        <Text style={[C.lColor, F.ffM, F.fsOne3]}>{STR.strings.no_of_passenger}</Text>
                        <Text style={[C.lColor, F.ffM, F.fsOne3, L.mT6]}>{STR.strings.ticket_id}</Text>
                        <Text style={[C.lColor, F.ffM, F.fsOne3, L.mT6]}>Purchase Date</Text>
                        <Text style={[C.lColor, F.ffM, F.fsOne3, L.mT6]}>Valid Till</Text>
                    </View>
                    <View style={[WT('15%'), L.aiC]}>

                    </View>
                    <View style={[WT('35%'), L.aiR]}>
                        <Text style={[C.lColor, F.ffM, F.fsOne3]}>1</Text>
                        <Text style={[C.lColor, F.ffM, F.fsOne3, L.mT6]} numberOfLines={1}>{ticketId}</Text>
                        {/* <Text style={[C.lColor, F.ffM, F.fsOne3, L.mT6]} numberOfLines={1}>{ticketDetail?.validFrom ?? ""}</Text>
                        <Text style={[C.lColor, F.ffM, F.fsOne3, L.mT6]} numberOfLines={1}>{ticketDetail?.validTo ?? ""}</Text> */}
                        <Text style={[C.lColor, F.ffM, F.fsOne3, L.mT6]}>{dateTime(ticketDetail?.validFrom ?? "", "", "hh:mm A, DD-MMM-YYYY")}</Text>
                        <Text style={[C.lColor, F.ffM, F.fsOne3, L.mT6]}>{moment.utc(ticketDetail?.validTo ?? "" ).format('hh:mm A, DD-MMM-YYYY')}</Text>
                    </View>
                </View>
                <View style={[HT(200)]} />
            </ScrollView>
            {/* </ViewShot> */}
            <View style={[C.bgTrans, L.pH10, L.dpARL, C.bgScreen2]}>
                <TouchableOpacity onPress={() => { downloadTicket() }}
                    style={[WT('100%'), HT(45), L.br05, C.brLightGray, L.bR5, L.jcC, L.aiC]}>
                    <Text style={[C.fcBlack, F.ffB, F.fsOne5, L.taC]}>{STR.strings.download}</Text>
                </TouchableOpacity>
                <View style={[HT(15)]} />
                {/* <TouchableOpacity onPress={() => { set_modalCancel(true) }}
                    style={[WT('100%'), HT(45), L.br05, C.brLightGray, L.bR5, L.jcC, L.aiC]}>
                    <Text style={[C.fcBlack, F.ffB, F.fsOne5, L.taC]}>{STR.strings.cancel_ride}</Text>
                </TouchableOpacity> */}
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

export default TicketDetails

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
