import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, FlatList, Image, Modal
} from 'react-native';
import { Images } from '../../commonStyles/Images'
import { C, F, HT, L, WT, WTD, h, mHT } from '../../commonStyles/style-layout';
import { FilterComponent, Header, Loader, TouchableOpacity, TextField } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import RootNavigation from '../../Navigation/RootNavigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { dateTime, hasValue, toFixed } from '../../Utils';
import { completed_trips_state } from '../user/userSlice';
import { selectRoute } from '../master/masterSlice';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
STR = require('../../languages/strings');

function AvailableOptions({ navigation, route }) {
    const dispatch = useDispatch()
    const responseDataMaster = useSelector(state => state.master)
    const job_details = responseDataMaster.job_details ?? null
    const itemData = route.params?.itemData ?? "";
    const [listData, setListData] = useState([]);
    const [source_location, set_source_location] = useState("");
    const [destination_location, set_destination_location] = useState("");
    const [modalRide, setModalRide] = useState(false);
    const [trackingData, setTracking] = useState([]);
    const [selectedItem, setSelectedItem] = useState({});
    const [modalConfirm, set_modalConfirm] = useState(false);

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
            if (hasValue(itemData)) {
                set_source_location(itemData.source_location ?? "")
                set_destination_location(itemData.destination_location ?? "")
            }
        } catch (error) {
            console.log(error);
        }
    }, [itemData]);

    useEffect(() => {
        try {
            if (hasValue(job_details)) {
                setListData(job_details)
            }
        } catch (error) {
            console.log(error);
        }
    }, [job_details]);

    function onItemPress(item) {
        try {
            dispatch(completed_trips_state())
            let tmp_track = []
            if (hasValue(item?.routes ?? "")) {
                tmp_track = item.routes
            } else {
                tmp_track.push(item)
            }
            setSelectedItem(item)
            setRoutes(item)
            setModalRide(true)
        } catch (error) {
            console.log(error);
        }
    }
    function setRoutes(item) {
        try {
            let select_route = {}
            if (item.type === "MULTI") {
                select_route = item?.routes ?? []
            } else {
                select_route = [item]
            }
            if (Array.isArray(select_route) && select_route.length > 0) {
                let tmpArray = []
                select_route.forEach((element, i) => {
                    let totalDuration = ""
                    if (element.type === "AUTO") {
                        totalDuration = item.duration
                    } else if (item.type === "BUS") {
                        totalDuration = item.duration
                    } else {
                        totalDuration = item.totalDuration
                    }
                    const tmpTime = hasValue(totalDuration) ? parseInt(totalDuration) : 0
                    console.log(tmpTime, 'tmpTime222222');
                    let d1 = new Date()
                    let d2 = new Date(d1);
                    d2.setMinutes(d1.getMinutes() + tmpTime);
                    const startTime = element?.startTime ?? dateTime(d2, "", "hh:mm A")
                    console.log(d2, 'd2');
                    console.log(startTime, 'startTime122');
                    let tmpJasonWalkStart = null
                    if (hasValue(element?.distanceFromStartPoint ?? "") && element.distanceFromStartPoint != 0 && hasValue(element?.durationFromStartPoint ?? "") && element.durationFromStartPoint != 0) {
                        tmpJasonWalkStart = {
                            address: element?.start?.address?.ward ?? element?.start?.name ?? "",
                            vehicle: {
                                type: "Walk",
                                number: ""
                            },
                            distance: "NA",
                            duration: "NA",
                            // time: hasValue(element?.duration ?? "") ? element?.duration ?? "" : "NA",
                            // wait_time: hasValue(element?.waitTimeUpto ?? "") ? element?.waitTimeUpto ?? "" : "NA",
                            startTime: startTime,
                            time: `ETD ${startTime}`,
                            walkingDistanceFromStartPoint: element?.distanceFromStartPoint ?? "",
                            walkingDurationFromStartPoint: element?.durationFromStartPoint ?? "",
                            icon: Images.walking
                        }
                        tmpArray.push(tmpJasonWalkStart)
                    }
                    let tmpJasonStart = {
                        address: element?.start?.address?.ward ?? element?.start?.name ?? "",
                        vehicle: {
                            type: element?.type ?? "",
                            number: ""
                        },
                        price: hasValue(element?.price?.value ?? "") ? toFixed(element?.price?.value ?? "") != 0 ? "Price " + toFixed(element?.price?.value ?? "") : "Price " + element?.price?.value ?? "" : "",
                        distance: element?.distance ?? "",
                        duration: element?.duration ?? "",
                        status: "",
                        wait_time: element?.waitTimeUpto ?? "",
                        startTime: startTime,
                        time: `ETD ${startTime}`,
                        walkingDistanceFromStartPoint: hasValue(element?.distanceFromStartPoint ?? "") && element.distanceFromStartPoint != 0 ? element.distanceFromStartPoint : "",
                        walkingDurationFromStartPoint: hasValue(element?.durationFromStartPoint ?? "") && element.durationFromStartPoint != 0 ? element.durationFromStartPoint : "",
                        icon: element?.type === "AUTO" ? Images.auto : Images.bus_full,
                    }
                    tmpArray.push(tmpJasonStart)
                    let tmpJasonWalkEnd = null
                    if (hasValue(element?.distanceToEndPoint ?? "") && element.distanceToEndPoint != 0 && hasValue(element?.durationToEndPoint ?? "") && element.durationToEndPoint != 0) {
                        tmpJasonWalkEnd = {
                            address: element?.end?.address?.ward ?? element?.end?.name ?? "",
                            vehicle: {
                                type: "Walk",
                                number: ""
                            },
                            // endTime: element?.endTime ?? "",
                            distance: "NA",
                            duration: "NA",
                            startTime: startTime,
                            time: `ETA ${startTime}`,
                            // time: hasValue(element?.duration ?? "") ? element?.duration ?? "" : "NA",
                            // wait_time: hasValue(element?.waitTimeUpto ?? "") ? element?.waitTimeUpto ?? "" : "NA",
                            walkingDistanceFromEndPoint: element?.distanceToEndPoint ?? "",
                            walkingDurationFromEndPoint: element?.durationToEndPoint ?? "",
                            icon: Images.walking
                        }
                        tmpArray.push(tmpJasonWalkEnd)
                    }
                    if (select_route.length == i + 1) {
                        let tmpJasonEnd = {
                            address: element?.end?.address?.ward ?? element?.end?.name ?? "",
                            vehicle: {
                                type: element?.type ?? "",
                                number: ""
                            },
                            price: hasValue(element?.price?.value ?? "") ? toFixed(element?.price?.value ?? "") != 0 ? "Price " + toFixed(element?.price?.value ?? "") : "Price " + element?.price?.value ?? "" : "",
                            distance: element?.distance ?? "",
                            duration: element?.duration ?? "",
                            status: "",
                            wait_time: element?.waitTimeUpto ?? "",
                            endTime: element?.endTime ?? "",
                            startTime: startTime,
                            time: `ETA ${startTime}`,
                            walkingDistanceFromEndPoint: element?.distanceToEndPoint ?? "",
                            walkingDurationFromEndPoint: element?.durationToEndPoint ?? "",
                            icon: element?.type === "AUTO" ? Images.auto : Images.bus_full,
                        }
                        tmpArray.push(tmpJasonEnd)
                    }
                });
                setTracking(tmpArray)
                return tmpArray
            } else {
                let totalDuration = ""
                if (select_route.type === "AUTO") {
                    totalDuration = item.duration
                } else if (item.type === "BUS") {
                    totalDuration = item.duration
                } else {
                    totalDuration = item.totalDuration
                }
                const tmpTime = hasValue(totalDuration) ? parseInt(totalDuration) : 0
                let d1 = new Date()
                let d2 = new Date(d1);
                d2.setMinutes(d1.getMinutes() + tmpTime);
                const startTime = select_route?.startTime ?? dateTime(d2, "", "hh:mm A")
                let tmpArray = []
                let tmpJasonWalkStart = null
                if (hasValue(select_route?.distanceFromStartPoint ?? "") && select_route.distanceFromStartPoint != 0 && hasValue(select_route?.durationFromStartPoint ?? "") && select_route.durationFromStartPoint != 0) {
                    tmpJasonWalkStart = {
                        address: select_route?.start?.address?.ward ?? select_route?.start?.name ?? "",
                        vehicle: {
                            type: "Walk",
                            number: ""
                        },
                        distance: "",
                        duration: "",
                        time: `ETD ${startTime}`,
                        walkingDistanceFromStartPoint: select_route?.distanceFromStartPoint ?? "",
                        walkingDurationFromStartPoint: select_route?.durationFromStartPoint ?? "",
                        icon: Images.walking
                    }
                    tmpArray.push(tmpJasonWalkStart)
                }
                let tmpJasonStart = {
                    address: select_route?.start?.address?.ward ?? select_route?.start?.name ?? "",
                    vehicle: {
                        type: select_route?.type ?? "",
                        number: ""
                    },
                    price: hasValue(select_route?.price?.value ?? "") ? toFixed(select_route?.price?.value ?? "") != 0 ? "Price " + toFixed(select_route?.price?.value ?? "") : "Price " + select_route?.price?.value ?? "" : "",
                    distance: select_route?.distance ?? "",
                    duration: select_route?.duration ?? "",
                    status: "",
                    wait_time: select_route?.waitTimeUpto ?? "",
                    startTime: startTime,
                    time: `ETD ${startTime}`,
                    walkingDistanceFromStartPoint: hasValue(select_route?.distanceFromStartPoint ?? "") && select_route.distanceFromStartPoint != 0 ? select_route.distanceFromStartPoint : "",
                    walkingDurationFromStartPoint: hasValue(select_route?.durationFromStartPoint ?? "") && select_route.durationFromStartPoint != 0 ? select_route.durationFromStartPoint : "",
                    icon: select_route?.type === "AUTO" ? Images.auto : Images.bus_full,
                }
                tmpArray.push(tmpJasonStart)
                let tmpJasonEnd = {
                    address: select_route?.end?.address?.ward ?? select_route?.end?.name ?? "",
                    vehicle: {
                        type: select_route?.type ?? "",
                        number: ""
                    },
                    price: hasValue(select_route?.price?.value ?? "") ? toFixed(select_route?.price?.value ?? "") != 0 ? "Price " + toFixed(select_route?.price?.value ?? "") : "Price " + select_route?.price?.value ?? "" : "",
                    distance: select_route?.distance ?? "",
                    duration: select_route?.duration ?? "",
                    status: "",
                    time: select_route?.duration ?? "",
                    wait_time: select_route?.waitTimeUpto ?? "",
                    endTime: select_route?.endTime ?? "",
                    startTime: startTime,
                    time: `ETA ${startTime}`,
                    walkingDistanceFromEndPoint: hasValue(select_route?.distanceToEndPoint ?? "") && select_route.distanceToEndPoint != 0 ? select_route.distanceToEndPoint : "",
                    walkingDurationFromEndPoint: hasValue(select_route?.durationToEndPoint ?? "") && select_route.durationToEndPoint != 0 ? select_route.durationToEndPoint : "",
                    icon: select_route?.type === "AUTO" ? Images.auto : Images.bus_full,
                }
                tmpArray.push(tmpJasonEnd)
                let tmpJasonWalkEnd = null
                if (hasValue(select_route?.distanceToEndPoint ?? "") && select_route.distanceToEndPoint != 0 && hasValue(select_route?.durationToEndPoint ?? "") && select_route.durationToEndPoint != 0) {
                    tmpJasonWalkEnd = {
                        address: select_route?.end?.address?.ward ?? select_route?.end?.name ?? "",
                        vehicle: {
                            type: "Walk",
                            number: ""
                        },
                        distance: "",
                        duration: "",
                        startTime: startTime,
                        time: `ETA ${startTime}`,
                        walkingDistanceFromEndPoint: select_route?.distanceToEndPoint ?? "",
                        walkingDurationFromEndPoint: select_route?.durationToEndPoint ?? "",
                        icon: Images.walking
                    }
                    tmpArray.push(tmpJasonWalkEnd)
                }
                setTracking(tmpArray)
                return tmpArray
            }
        } catch (error) {
            console.log(error);
        }
    }
    function onBook() {
        try {
            set_modalConfirm(true);
            let tripe_data = {}
            if (selectedItem.type === "MULTI") {
                tripe_data = selectedItem?.routes
            } else {
                tripe_data = [selectedItem]
            }
            const payloads = {
                data: selectedItem,
                itemData: selectedItem,
                completed_trips: tripe_data
            }
            dispatch(selectRoute(payloads))
        } catch (error) {
            console.log(error);
        }
    }
    console.log(listData, 'listData');
    const renderItem = (item, index) => {
        let itemData = {}
        let totalCost = ""
        let totalDistance = ""
        let totalDuration = ""
        if (item.type === "AUTO") {
            itemData = item
            totalDistance = item.distance
            totalDuration = item.duration
            totalCost = itemData?.price?.value ?? ""
        } else if (item.type === "BUS") {
            itemData = item
            totalDistance = item.distance
            totalDuration = item.duration
            totalCost = itemData?.price?.value ?? ""
        } else {
            itemData = item?.routes[1] ?? {}
            totalDistance = item.totalDistance
            totalDuration = item.totalDuration
            totalCost = item.totalCost
        }

        let select_route = {}
        if (item.type === "MULTI") {
            select_route = item?.routes ?? []
        } else {
            select_route = [item]
        }
        let vehicleData = []
        if (Array.isArray(select_route) && select_route.length > 0) {
            select_route.forEach((element, i) => {
                let tmpJasonStart = {
                    type: element?.type ?? "",
                    vehicleName: `${element?.type ?? ""}${hasValue(element?.vehicleName ?? "") ? `  ${element?.vehicleName ?? ""}` : ""}${hasValue(element?.vehicleNo ?? "") ? `  ${element?.vehicleNo ?? ""}` : ""}`,
                    distance: hasValue(element.distance) ? parseInt(element.distance) : 0,
                    icon: element?.type === "AUTO" ? Images.auto : Images.bus_full,
                }
                vehicleData.push(tmpJasonStart)
            });
        } else {
            let tmpJasonStart = {
                type: select_route?.type ?? "",
                vehicleName: `${select_route?.type ?? ""}${hasValue(select_route?.vehicleName ?? "") ? `  ${select_route?.vehicleName ?? ""}` : ""}${hasValue(select_route?.vehicleNo ?? "") ? `  ${select_route?.vehicleNo ?? ""}` : ""}`,
                distance: hasValue(select_route.distance) ? parseInt(select_route.distance) : 0,
                icon: select_route?.type === "AUTO" ? Images.auto : Images.bus_full,
            }
            vehicleData.push(tmpJasonStart)
        }
        const tmpTime = hasValue(totalDuration) ? parseInt(totalDuration) : 0
        let d1 = new Date()
        let d2 = new Date(d1);
        d2.setMinutes(d1.getMinutes() + tmpTime);
        const estA = dateTime(d2, "", "hh:mm A")
        return (
            <TouchableOpacity style={[C.bgWhite, WT('95%'), L.asC, L.mB10, L.bR4, L.pV10, L.jcC]}
                onPress={() => onItemPress(item)}>
                <View style={[L.jcC, WT('100%')]}>
                    {hasValue(vehicleData) && vehicleData.length > 0 &&
                        <View style={[WT('80%'), L.asC, L.aiC]}>
                            <FlatList
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                keyboardShouldPersistTaps='always'
                                keyExtractor={(item, index) => String(index)}
                                data={vehicleData}
                                contentContainerStyle={[{ paddingBottom: h(0) }]}
                                renderItem={({ item, index }) => {
                                    const element = item
                                    const element_index = index
                                    return (<>
                                        {vehicleData.length > 1 && element_index != 0 &&
                                            <Text style={[F.fsOne4, F.ffB, C.fcBlue, L.taC]}>{" + "}</Text>
                                        }
                                        <Text style={[F.fsOne4, F.ffB, C.fcBlue, L.taC]}>{element?.vehicleName ?? ""}</Text>
                                    </>)
                                }}
                            />
                        </View>
                    }
                    <View style={[L.even, L.jcSB, L.aiC, WT('100%'), L.mT10]}>
                        <View style={[WT('33%'), L.jcC, L.aiL, L.pH12]}>
                            <Text style={[F.fsOne2, F.ffM, C.pColor]}>{STR.strings.distance}</Text>
                            <Text style={[F.fsOne5, F.ffB, C.lColor]}>{totalDistance}</Text>
                        </View>
                        <View style={[WT('33%'), L.aiC, L.jcC]}>
                            <Text style={[F.fsOne2, F.ffM, C.pColor]}>{STR.strings.est_arrival}</Text>
                            <Text style={[F.fsOne5, F.ffB, C.lColor]}>{estA}</Text>
                        </View>
                        <View style={[WT('33%'), L.jcC, L.aiR, L.pH5]}>
                            <View style={[L.pH10, L.pV2, C.bgLGray, L.aiC, L.jcC, L.bR4]}>
                                <Text style={[F.fsOne2, F.ffM, C.pColor]}>{STR.strings.cost}</Text>
                                <Text style={[F.fsOne5, F.ffB, C.lColor]} numberOfLines={1}>{totalCost}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={[L.even, L.jcSB, L.aiC, WT('100%'), L.mT15]}>
                    <View style={[WT(20), HT(20), L.bR20, C.bgScreen2, { marginLeft: -9 }]} />
                    <Text ellipsizeMode="clip" numberOfLines={1} style={[WT('94%'), C.fcVLightGray]}>
                        - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                        - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                        - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                    </Text>
                    <View style={[WT(20), HT(20), L.bR20, C.bgScreen2]} />
                </View>
                <View style={[L.even, L.jcSB, L.aiC, L.jcC, WT('100%'), L.mT15]}>
                    <View style={[WT(8), HT(8), L.bR8, C.bgBlack]} />
                    <View style={[HT(1), WT('85%'), C.bgBlack]} />
                    <View style={[WT(8), HT(8), L.bR8, C.bgBlack]} />
                </View>
                {hasValue(vehicleData) && vehicleData.length > 0 &&
                    <View style={[WT('80%'), L.asC, vehicleData.length == 1 ? L.aiC : "", { marginTop: -31 }]}>
                        <FlatList
                            style={[L.mT15]}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            keyboardShouldPersistTaps='always'
                            keyExtractor={(item, index) => String(index)}
                            data={vehicleData}
                            contentContainerStyle={[{ paddingBottom: h(0) }]}
                            renderItem={({ item, index }) => {
                                const element = item
                                const element_index = index
                                return (
                                    <View key={index} style={[L.aiC, L.even]}>
                                        <View style={[{ marginLeft: element?.distance ?? 0 }, HT(25), WT(25), C.bgWhite, L.card, C.brLight, L.br05, L.bR4, L.jcC, L.aiC]}>
                                            <Image style={[HT(18), WT(18)]} source={element?.icon ?? ""} />
                                        </View>
                                        {vehicleData.length > 1 && vehicleData.length != element_index + 1 &&
                                            <View style={[WT(8), HT(8), L.bR8, C.bgLightGray, L.mH30]} />
                                        }
                                    </View>
                                )
                            }}
                        />
                    </View>
                }
                <Text style={[F.fsOne3, F.ffM, C.fcBlue, L.taC, L.mT10]}>{totalDuration}</Text>
            </TouchableOpacity>
        )
    }
    console.log(trackingData, 'trackingData');
    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen2]}>
            <Header navigation={navigation} hardwareBack={1} left_press={1} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} ic_left={Images.back} label_left={STR.strings.available_options} is_filter={true} />
            {responseDataMaster.isLoading && <Loader isLoading={responseDataMaster.isLoading} />}
            <View style={[WT('100%'), L.asC, L.even, L.aiC, L.pH10, L.jcSB, L.mT15]}>
                <View style={[WT('7%')]}>
                    <View style={[WT(7), HT(7), L.bR20, !hasValue(source_location) ? C.bgBlack : C.bgLGray]} />
                    <View style={[HT(60), WT(1), L.bR20, C.bgLGray, L.mT1, L.mL3]} />
                    <View style={[WT(7), HT(7), L.bR20, hasValue(destination_location) ? C.bgBlack : C.bgLightGray, L.mT1]} />
                </View>
                <View style={[WT('93%')]}>
                    <View style={[HT(50), WT('100%'), C.bgWhite, L.asC, L.jcC, L.br05, C.brLight, L.bR5, L.pH10]}>
                        <Text style={[F.fsOne3, F.ffM, C.pColor]}>Your Location</Text>
                        <Text style={[F.fsOne5, F.ffB, C.pColor]} numberOfLines={1}>{source_location}</Text>
                    </View>
                    <View style={[HT(50), WT('100%'), C.bgWhite, L.asC, L.jcC, L.br05, C.brLight, L.bR5, L.pH10, L.mT10]}>
                        <Text style={[F.fsOne5, F.ffB, C.pColor]} numberOfLines={1}>{destination_location}</Text>
                    </View>
                </View>
            </View>
            <View style={[]}>
                <FlatList
                    style={[L.mT15]}
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps='always'
                    keyExtractor={(item, index) => String(index)}
                    data={listData}
                    renderItem={({ item, index }) => renderItem(item, index)}
                    contentContainerStyle={[{ paddingBottom: h(26) }]}
                />
            </View>
            <Modal
                transparent={true}
                supportedOrientations={['portrait', 'landscape']}
                visible={modalRide}
                animationType='fade'
                onRequestClose={() => setModalRide(false)}>
                <View style={[WT('100%'), HT('100%'), C.bgTPL, L.jcC]}>
                    {hasValue(trackingData) && trackingData.length > 0 &&
                        <View style={[WT('90%'), L.asC, L.jcC, L.mT5, C.bgWhite, L.card, L.br05, L.mH10, L.bR5, C.brLight, L.pV10, L.pH10, L.mT10]}>
                            <TouchableOpacity style={[HT(25), L.jcC, L.aiR]} onPress={() => setModalRide(false)}>
                                <Icon style={[WT(25), HT(25)]} name="close" size={20} color={C.black} />
                            </TouchableOpacity>
                            <View style={[HT(15)]} />
                            {trackingData.map(function (element, index) {
                                return (
                                    <View key={index} style={[L.pH8]}>
                                        <View style={[L.even, L.aiC, { marginTop: -11 }]}>
                                            <View style={[HT(8), WT(8), L.bR8, C.bgLightGray, { marginLeft: -3 }]} />
                                            <View style={[WT(10)]} />
                                            <View style={[]}>
                                                <View style={[L.even, L.aiC]}>
                                                    <Text style={[C.fcBlack, F.ffB, F.fsOne5]} numberOfLines={1}>{element?.address ?? ""}</Text>
                                                </View>
                                                <Text style={[C.fcBlack, F.ffM, F.fsOne2]}>
                                                    {index === 0 ?
                                                        (<>
                                                            {"ETD NA"}
                                                        </>) :
                                                        (<>
                                                            {hasValue(element?.startTime ?? "") ? "ETA " + element?.startTime : ""}
                                                        </>)
                                                    }
                                                </Text>
                                            </View>
                                        </View>
                                        {trackingData.length != index + 1 &&
                                            <View style={[HT(100), WT(2), C.bgBlack, L.jcC, { marginTop: -11 }]}>
                                                <View style={[HT(25), WTD(80), L.even, L.aiC, { marginLeft: -10 }]}>
                                                    <View style={[WT(10)]} />
                                                    <View style={[HT(25), WT(25), C.bgWhite, L.card, C.brLight, L.br05, L.bR4, L.jcC, L.aiC, { marginLeft: -10 }]}>
                                                        <Image style={[HT(18), WT(18)]} source={element?.icon ?? ""} />
                                                    </View>
                                                    <View style={[WT(10)]} />
                                                    <Text style={[C.fcBlack, F.ffM, F.fsOne2, C.fcBlue]}>
                                                        {element?.vehicle?.type ?? ""}
                                                        {hasValue(element?.price ?? "") ? " | " + element?.price : ""}
                                                        {hasValue(element?.distance ?? "") ? " | " + element?.distance : ""}
                                                        {hasValue(element?.duration ?? "") ? " | Duration " + element?.duration : ""}
                                                    </Text>
                                                </View>
                                            </View>
                                        }
                                    </View>
                                )
                            })}
                            <TouchableOpacity style={[WT(65), HT(30), L.asR, L.jcC, L.aiC, C.bgBlack, L.mT15, L.mB5, L.mH7]}
                                onPress={() => { setModalRide(false); onBook() }}>
                                <Text style={[C.fcWhite, F.ffM, F.fsOne7]}>Book</Text>
                            </TouchableOpacity>
                        </View>
                    }
                </View>
            </Modal>
            {responseDataMaster.isLoading == true &&
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
                            <Image style={[WT(250), HT(250), L.asC]} source={Images.booking_loader} />
                            {/* <TouchableOpacity style={[HT(50), L.pH10, L.asC, L.jcC, L.mT20]} onPress={() => { onCancelBooking() }}>
                            <Text style={[F.fsOne6, F.ffM, C.fcWhite, L.taC, F.tDL]}>{STR.strings.cancel_booking}</Text>
                        </TouchableOpacity> */}
                        </View>
                    </View>
                </Modal>
            }
            {responseDataMaster.is_filter_visible && <FilterComponent />}
        </View>
    );
}

export default AvailableOptions
