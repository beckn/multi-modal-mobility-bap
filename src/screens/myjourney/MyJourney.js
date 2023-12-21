import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, ScrollView, Image
} from 'react-native';
import { API } from '../../shared/API-end-points';
import { Images } from '../../commonStyles/Images'
import { C, F, HT, L, WT, WTD, h } from '../../commonStyles/style-layout';
import { Header, Loader, TouchableOpacity } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import { dateTime, hasValue, toFixed } from '../../Utils';
import { getHistory, searchRoutes } from '../master/masterSlice';
import moment from 'moment';
STR = require('../../languages/strings');

function MyJourney({ navigation, route }) {
    const dispatch = useDispatch()
    const responseDataMaster = useSelector(state => state.master)
    const history = responseDataMaster?.history ?? []
    const [listData, set_listData] = useState([]);
    const [isVisible, setIsVisible] = useState("");
    const [trackingData, setTracking] = useState([]);

    useEffect(() => {
        try {
            const payloads = {
                data: {},
                url: ``,
            }
            dispatch(getHistory(payloads))
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        try {
            set_listData(history)
        } catch (error) {
            console.log(error);
        }
    }, [history]);

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
    async function onItemPress(item, type, rideTo, rideFrom) {
        try {
            const startLocation = item?.start?.gps ?? ""
            const endLocation = item?.end?.gps ?? ""

            const start_data = startLocation.split(",")
            const source_lat = parseFloat(start_data[0])
            const source_lng = parseFloat(start_data[1])
            const sourceLat = hasValue(source_lat ?? "") ? source_lat.toString() : ""
            const sourceLng = hasValue(source_lng ?? "") ? source_lng.toString() : ""

            let end_data = endLocation.split(",")
            let end_lat = parseFloat(end_data[0])
            let end_lng = parseFloat(end_data[1])
            let endLat = hasValue(end_lat ?? "") ? end_lat.toString() : ""
            let endLng = hasValue(end_lng ?? "") ? end_lng.toString() : ""

            if (hasValue(item?.endLocation ?? "")) {
                let endLocation = item?.endLocation?.end?.gps ?? ""
                end_data = endLocation.split(",")
                end_lat = parseFloat(end_data[0])
                end_lng = parseFloat(end_data[1])
                endLat = hasValue(end_lat ?? "") ? end_lat.toString() : ""
                endLng = hasValue(end_lng ?? "") ? end_lng.toString() : ""
            }

            if(item.hasOwnProperty('userGPS')) {
                const userGPS =  item?.userGPS
                const startLocation = userGPS?.start?.split(',') 
                const endLocation = userGPS?.end?.split(',') 
                const startLat = startLocation?.[0]
                const startLong = startLocation?.[1]
                const endLat = endLocation?.[0]
                const endLong = endLocation?.[1]
                
                const addressFrom = await getAddressFromCoordinates(startLat, startLong)
                const addressTo = await getAddressFromCoordinates(endLat, endLong)
                rideFrom = addressFrom
                rideTo = addressTo
            }
       
            dispatch(searchRoutes({
                "data": {
                    "start": sourceLat + "," + sourceLng,
                    "end": endLat + "," + endLng,
                    "type": type
                },
                "itemData": {
                    source_location: rideFrom,
                    destination_location: rideTo,
                }
            }))
        } catch (error) {
            console.log(error);
        }
    }
    function setRoutes(item) {
        try {
            let select_route = []
            if (item.type === "MULTI") {
                select_route = item?.details ?? []
            } else {
                select_route = [item]
            }
            if (Array.isArray(select_route) && select_route.length > 0) {
                let tmpArray = []
                select_route.forEach((element, i) => {
                    let totalDuration = ""
                    let etd = ""
                    let eta = ""
                    if (element.type === "AUTO") {
                        totalDuration = element.duration
                    } else if (item.type === "BUS") {
                        totalDuration = element.duration
                    } else {
                        totalDuration = element.duration
                    }
                    const tmpTime = hasValue(totalDuration) ? parseInt(totalDuration) : 0
                    const startTime = element?.startTime ?? moment().add(tmpTime, 'minutes').format('hh:mm A');

                    // etd = element.type === "AUTO" && select_route?.length == 1?  dateTime(element?.details?.startTime, null, "hh:mm A") : element?.startTime  ?? moment().add(0, 'minutes').format('hh:mm A');
                    // eta = element.type === "AUTO" && select_route?.length == 1?  dateTime(element?.details?.endTime, null, "hh:mm A") : element?.endTime ?? moment().add(tmpTime, 'minutes').format('hh:mm A')
                    if(element?.type == "AUTO"&& select_route?.length == 1){
                        etd = moment.utc(element?.details?.startTime).format("hh:mm A") ?? moment().add(0, 'minutes').format('hh:mm A');
                        eta = moment.utc(element?.details?.endTime).format("hh:mm A") ?? moment().add(tmpTime, 'minutes').format('hh:mm A');
                    } else if (element?.type == "BUS" && select_route?.length == 1){
                        etd = element?.details?.startTime  ?? moment().add(0, 'minutes').format('hh:mm A');
                        eta = element?.details?.endTime ?? moment().add(tmpTime, 'minutes').format('hh:mm A')
                    } else if (element.type === "AUTO") {
                        etd = moment.utc(element.startTime).format("hh:mm A") ?? moment().add(0, 'minutes').format('hh:mm A');
                        eta = moment.utc(element.endTime).format("hh:mm A") ?? moment().add(tmpTime, 'minutes').format('hh:mm A');
                    } else {
                        etd = element?.startTime  ?? moment().add(0, 'minutes').format('hh:mm A');
                        eta = element?.endTime ?? moment().add(tmpTime, 'minutes').format('hh:mm A');
                    }
                    let tmpJasonWalkStart = null
                    if (hasValue(element?.distanceFromStartPoint ?? "") && element.distanceFromStartPoint != 0 && hasValue(element?.durationFromStartPoint ?? "") && element.durationFromStartPoint != 0) {
                        const tmpTime_durationFromStartPoint = hasValue(element.durationFromStartPoint) ? parseInt(element.durationFromStartPoint) : 0
                        let walk_eta = moment().add(tmpTime_durationFromStartPoint, 'minutes').format('hh:mm A')
                        let walk_eta2 = moment().add(0, 'minutes').format('hh:mm A')
                        tmpJasonWalkStart = {
                            address: element?.startPointAddress ?? "",
                            vehicle: {
                                type: "Walk",
                                number: ""
                            },
                            distance: element?.distanceFromStartPoint ?? "",
                            duration: element?.durationFromStartPoint ?? "",
                            etd: i === 0 ? walk_eta2 : walk_eta,
                            walkingDistanceFromStartPoint: element?.distanceFromStartPoint ?? "",
                            walkingDurationFromStartPoint: element?.durationFromStartPoint ?? "",
                            icon: Images.walking
                        }
                        tmpArray.push(tmpJasonWalkStart)
                    }
                    const tmpTime2 = hasValue(select_route[i - 1]?.duration ?? "") ? parseInt(select_route[i - 1].duration) : 0
                    // let eta2 = moment.utc(select_route[i - 1]?.endTime).format("hh:mm A") ?? moment().add(tmpTime2, 'minutes').format('hh:mm A')
                    let eta2 = '';
                    if (element.type === "BUS" && select_route[i - 1]?.type === "AUTO") {
                        eta2 = moment.utc(select_route[i - 1]?.endTime).format("hh:mm A") ?? "";
                      } else {
                        eta2 = select_route[i - 1]?.endTime ?? moment().add(tmpTime2, 'minutes').format('hh:mm A');
                      }
                    let walk_eta3 = ""
                    if (hasValue(element?.distanceFromStartPoint ?? "") && element.distanceFromStartPoint != 0 && hasValue(element?.durationFromStartPoint ?? "") && element.durationFromStartPoint != 0) {
                        const tmpTime_durationFromStartPoint = hasValue(element.durationFromStartPoint) ? parseInt(element.durationFromStartPoint) : 0
                        walk_eta3 = moment().add(tmpTime_durationFromStartPoint, 'minutes').format('hh:mm A')
                    }
                    let tmpJasonStart = {
                        address: element?.start?.address?.ward ?? element?.start?.descriptor?.name ?? "",
                        vehicle: {
                            type: element?.type ?? "",
                            number: ""
                        },
                        price: hasValue(element?.price?.value ?? "") ? toFixed(element?.price?.value ?? "") != 0 ? "Price " + toFixed(element?.price?.value ?? "") : "Price " + element?.price?.value ?? "" : "",
                        distance: element?.distance ?? "",
                        duration: element?.busTravelTime ?? element?.duration ?? "",
                        status: element?.status ?? "",
                        etd: etd,
                        eta: i != 0 ? eta2 : walk_eta3,
                        walkingDistanceFromStartPoint: hasValue(element?.distanceFromStartPoint ?? "") && element.distanceFromStartPoint != 0 ? element.distanceFromStartPoint : "",
                        walkingDurationFromStartPoint: hasValue(element?.durationFromStartPoint ?? "") && element.durationFromStartPoint != 0 ? element.durationFromStartPoint : "",
                        icon: element?.type === "AUTO" ? Images.auto : Images.bus_full,
                    }
                    tmpArray.push(tmpJasonStart)
                    let tmpJasonWalkEnd = null
                    if (hasValue(element?.distanceToEndPoint ?? "") && element.distanceToEndPoint != 0 && hasValue(element?.durationToEndPoint ?? "") && element.durationToEndPoint != 0) {
                        const tmpTime_durationToEndPoint = hasValue(element.durationToEndPoint) ? parseInt(element.durationToEndPoint) : 0
                        let walk_eta = moment().add(tmpTime_durationToEndPoint, 'minutes').format('hh:mm A')
                        tmpJasonWalkEnd = {
                            address: element?.end?.address?.ward ?? element?.end?.descriptor?.name ?? "",
                            vehicle: {
                                type: "Walk",
                                number: ""
                            },
                            distance: element?.distanceToEndPoint ?? "",
                            duration: element?.durationToEndPoint ?? "",
                            eta: element?.endTime ?? walk_eta,
                            walkingDistanceFromEndPoint: element?.distanceToEndPoint ?? "",
                            walkingDurationFromEndPoint: element?.durationToEndPoint ?? "",
                            icon: Images.walking
                        }
                        tmpArray.push(tmpJasonWalkEnd)
                    }
                    if (select_route.length == i + 1) {
                        let end_eta = eta
                        if (hasValue(element?.distanceToEndPoint ?? "") && element.distanceToEndPoint != 0 && hasValue(element?.durationToEndPoint ?? "") && element.durationToEndPoint != 0) {
                            const tmpTime_durationToEndPoint = hasValue(element.durationToEndPoint) ? parseInt(element.durationToEndPoint) : 0
                            end_eta = moment(dateTime(eta, "hh:mm A", "")).add(tmpTime_durationToEndPoint, 'minutes').format('hh:mm A')
                        }
                        const time_duration = hasValue(element.duration) ? parseInt(element.duration) : 0
                        const etaForAuto = moment(etd, 'hh:mm A').add(time_duration, 'minutes').format('hh:mm A');
                        let tmpJasonEnd = {
                            address: hasValue(element?.distanceToEndPoint ?? "") ? element?.endPointAddress ?? "" : element?.end?.address?.ward ?? element?.end?.name ?? "",
                            vehicle: {
                                type: element?.type ?? "",
                                number: ""
                            },
                            price: hasValue(element?.price?.value ?? "") ? toFixed(element?.price?.value ?? "") != 0 ? "Price " + toFixed(element?.price?.value ?? "") : "Price " + element?.price?.value ?? "" : "",
                            distance: element?.distance ?? "",
                            duration: element?.duration ?? "",
                            status: element?.status ?? "",
                            eta:  element?.type == "AUTO" && select_route?.length != 1 ? etaForAuto : end_eta,
                            walkingDistanceFromEndPoint: element?.distanceToEndPoint ?? "",
                            walkingDurationFromEndPoint: element?.durationToEndPoint ?? "",
                            icon: element?.type === "AUTO" ? Images.auto : Images.bus_full,
                        }
                        tmpArray.push(tmpJasonEnd)
                    }
                });
                setTracking(tmpArray)
            }
        } catch (error) {
            console.log(error);
        }
    }
    const renderItem = (item, index) => {
        let icon = ""
        let title = ""
        if (item.type === "AUTO") {
            icon = Images.auto
            title = "Auto"
        } else if (item.type === "BUS") {
            icon = Images.bus_full
            title = "Bus"
        } else {
            icon = Images.auto
            title = "Auto  +  Bus"
        }
        let tmp_track = []
        let itemData = {}
        if (hasValue(item?.details ?? "") && Array.isArray(item.details) && item.details.length > 0) {
            tmp_track = item.details
            itemData = item.details[0]
            if (item.details.length > 1) {
                itemData = { ...item.details[0], endLocation: item.details[item.details.length - 1] ,userGPS: item?.userGPS}
            }
        } else {
            tmp_track.push(item.details)
            itemData = {...item.details, userGPS: item?.userGPS}
        }
        let rideTo = ""
        let rideFrom = ""
        if (hasValue(tmp_track) && tmp_track.length > 0) {
            rideTo = tmp_track[tmp_track.length - 1].end?.address?.ward ?? ""
            rideFrom = tmp_track[tmp_track.length - 1].start?.address?.ward ?? ""
        }

        let select_route = {}
        if (item.type === "MULTI") {
            select_route = item?.details ?? []
        } else {
            select_route = [item]
        }
        let vehicleData = []
        if (Array.isArray(select_route) && select_route.length > 0) {
            select_route.forEach((element, i) => {
                let tmpJasonStart = {
                    icon: element?.type === "AUTO" ? Images.auto : Images.bus_full,
                }
                vehicleData.push(tmpJasonStart)
            });
        } else {
            let tmpJasonStart = {
                icon: select_route?.type === "AUTO" ? Images.auto : Images.bus_full,
            }
            vehicleData.push(tmpJasonStart)
        }
        return (
            <View style={[WT('95%'), L.asC, L.jcC, C.bgWhite, L.card, L.mB8, L.bR10]}>
                <View style={[HT(3)]} />
                <TouchableOpacity style={[WT('90%'), L.asC, L.even, L.jcSB, L.pV10]}
                    onPress={() => { setRoutes(item); setIsVisible(item) }}>
                    <View style={[WT('80%')]}>
                        <Text style={[C.lColor, F.ffM, F.fsOne4, L.f1]}>{dateTime(item.createdAt, "", "ddd, DD MMM, HH:mm a")}</Text>
                        <Text style={[C.lColor, F.ffM, F.fsOne4, L.f1]}>Your ride to <Text style={[C.lColor, F.ffB, F.fsOne4, L.f1]}>{item.endLocation}</Text></Text>
                    </View>

                    {hasValue(vehicleData) && vehicleData.length > 0 &&
                        <View style={[WT('20%'), L.asC, L.aiR]}>
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
                                            {vehicleData.length > 1 && element_index != 0 &&
                                                <Text style={[F.fsOne4, F.ffB, C.fcBlack, L.taC]}>{"  + "}</Text>
                                            }
                                            <View style={[{ marginLeft: element?.distance ?? 0 }, HT(23), WT(23), C.bgWhite, L.card, C.brLight, L.br05, L.bR4, L.jcC, L.aiC]}>
                                                <Image style={[HT(16), WT(16)]} source={element?.icon ?? ""} />
                                            </View>
                                        </View>
                                    )
                                }}
                            />
                        </View>
                    }
                    {/* {item.type === "MULTI" &&
                        <View style={[L.aiC]}>
                            <View style={[L.even, L.aiC]}>
                                <Image style={[HT(18), WT(18)]} source={Images.auto} />
                                <Text style={[C.fcBlack, F.ffM, F.fsOne3]}>  +  </Text>
                                <Image style={[HT(18), WT(18)]} source={Images.bus_full} />
                            </View>
                            <Text style={[C.lColor, F.ffM, F.fsOne2]}>{item.totalDistance}</Text>
                        </View>
                    }
                    {item.type === "AUTO" &&
                        <View style={[L.aiC]}>
                            <View style={[L.even, L.aiC]}>
                                <Image style={[HT(18), WT(18)]} source={Images.auto} />
                            </View>
                            <Text style={[C.lColor, F.ffM, F.fsOne2]}>{item.totalDistance}</Text>
                        </View>
                    }
                    {item.type === "BUS" &&
                        <View style={[L.aiC]}>
                            <View style={[L.even, L.aiC]}>
                                <Image style={[HT(18), WT(18)]} source={Images.bus_full} />
                            </View>
                            <Text style={[C.lColor, F.ffM, F.fsOne2]}>{item.totalDistance}</Text>
                        </View>
                    } */}
                </TouchableOpacity>
                {isVisible == item && <View>
                    <View style={[HT(3), WT("100%"), C.bgLGray]} />
                    <View style={[WT('100%'), L.even, L.jcSB, L.pH10, L.mT10]}>
                        <View style={[WT('45%'), L.even, L.aiC]}>
                            <Text style={[C.pColor, F.ffM, F.fsOne2]}>{STR.strings.duration}</Text>
                            <View style={[WT(2)]} />
                            <Text style={[C.pColor, F.ffM, F.fsOne2]}>{item.totalDuration}</Text>
                        </View>
                        <View style={[WT('45%'), L.even, L.jcB, L.aiC]}>
                            <Text style={[C.pColor, F.ffM, F.fsOne2]}>{STR.strings.cost}</Text>
                            <View style={[WT(15)]} />
                            <Text style={[C.fcBlack, F.ffM, F.fsOne5]}>{item.totalCost}</Text>
                        </View>
                    </View>
                    {hasValue(trackingData) && trackingData.length > 0 &&
                        <View style={[WT('100%'), L.asC, L.jcC, L.pH15]}>
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
                                                     {hasValue(element?.eta ?? "") ? `ETA ${element?.eta}` : ""}
                                                     {hasValue(element?.eta ?? "") && hasValue(element?.etd ?? "") && " | "}
                                                     {hasValue(element?.etd ?? "") ? `ETD ${element?.etd}` : ""}
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
                                                        {hasValue(element?.status ?? "") &&
                                                            <Text style={[C.lColor]}>
                                                                {hasValue(element?.status ?? "") ? " | " + element?.status : ""}
                                                            </Text>
                                                        }
                                                    </Text>
                                                </View>
                                            </View>
                                        }
                                    </View>
                                )
                            })}
                        </View>
                    }
                    <View style={[HT(15)]} />
                    <View style={[HT(3), WT("100%"), C.bgLGray]} />
                    <TouchableOpacity style={[WT(100), HT(35), L.asC, L.jcC, L.aiC, L.mT2]} onPress={() => { onItemPress(itemData, item?.type ?? "MULTI", rideTo, rideFrom) }}>
                        <Text style={[C.fcBlue, F.ffB, F.fsOne7, L.taC]}>Rebook</Text>
                    </TouchableOpacity>
                </View>}
            </View>
        )
    }
    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen2]}>
            <Header navigation={navigation} hardwareBack={'Dashboard'} left_press={'Dashboard'} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} style={[C.bgTrans]} ic_left={Images.back} label_left={STR.strings.my_journeys} />
            {responseDataMaster.isLoading && <Loader isLoading={responseDataMaster.isLoading} />}
            <ScrollView>
                {hasValue(listData) && listData.length > 0 ?
                    (<>
                        <View style={[L.mT20]}>
                            <FlatList
                                keyboardShouldPersistTaps='always'
                                keyExtractor={(item, index) => String(index)}
                                data={listData}
                                renderItem={({ item, index }) => renderItem(item, index)}
                                contentContainerStyle={[{ paddingBottom: h(10) }]}
                            />
                        </View>
                    </>) :
                    (responseDataMaster.isLoading === false &&
                        <Text style={[C.fcBlack, F.ffB, F.fsOne9, L.taC, { marginTop: "45%" }]}>No trips found</Text>
                    )
                }
                <View style={[HT(50)]} />
            </ScrollView>
        </View>
    );
}
export default MyJourney
