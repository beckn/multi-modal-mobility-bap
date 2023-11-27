import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, ScrollView, Image
} from 'react-native';
import { Images } from '../../commonStyles/Images'
import { C, F, HT, L, WT, WTD, h } from '../../commonStyles/style-layout';
import { Header, Loader, TouchableOpacity } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import { dateTime, hasValue, toFixed } from '../../Utils';
import { getHistory, searchRoutes } from '../master/masterSlice';
STR = require('../../languages/strings');

function MyJourney({ navigation, route }) {
    const dispatch = useDispatch()
    const responseDataMaster = useSelector(state => state.master)
    const history = responseDataMaster?.history ?? []
    const [listData, set_listData] = useState([]);
    const [isVisible, setIsVisible] = useState("");

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

    function onItemPress(item, type, rideTo) {
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
            dispatch(searchRoutes({
                "data": {
                    "start": sourceLat + "," + sourceLng,
                    "end": endLat + "," + endLng,
                    "type": type
                },
                "itemData": {
                    source_location: rideTo,
                    destination_location: rideTo,
                }
            }))
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
                itemData = { ...item.details[0], endLocation: item.details[item.details.length - 1] }
            }
        } else {
            tmp_track.push(item.details)
            itemData = item.details
        }
        let rideTo = ""
        if (hasValue(tmp_track) && tmp_track.length > 0) {
            rideTo = tmp_track[tmp_track.length - 1].end?.address?.ward ?? ""
        }
        return (
            <View style={[WT('95%'), L.asC, L.jcC, C.bgWhite, L.card, L.mB8, L.bR10]}>
                <View style={[HT(3)]} />
                <TouchableOpacity style={[WT('90%'), L.asC, L.even, L.jcSB, L.pV10]}
                    onPress={() => setIsVisible(item)}>
                    <View style={[WT('80%')]}>
                        <Text style={[C.lColor, F.ffM, F.fsOne4, L.f1]}>{dateTime(item.createdAt, "", "ddd, DD MMM, HH:mm a")}</Text>
                        <Text style={[C.lColor, F.ffM, F.fsOne4, L.f1]}>Your ride to <Text style={[C.lColor, F.ffB, F.fsOne4, L.f1]}>{rideTo}</Text></Text>
                    </View>
                    {item.type === "MULTI" &&
                        <View style={[L.aiC]}>
                            <View style={[L.even, L.aiC]}>
                                <Image style={[HT(18), WT(18)]} source={Images.auto} />
                                <Text style={[C.fcBlack, F.ffM, F.fsOne3]}>  +  </Text>
                                <Image style={[HT(18), WT(18)]} source={Images.bus_full} />
                            </View>
                            <Text style={[C.lColor, F.ffM, F.fsOne2]}>NA Kms</Text>
                        </View>
                    }
                    {item.type === "AUTO" &&
                        <View style={[L.aiC]}>
                            <View style={[L.even, L.aiC]}>
                                <Image style={[HT(18), WT(18)]} source={Images.auto} />
                            </View>
                            <Text style={[C.lColor, F.ffM, F.fsOne2]}>NA Kms</Text>
                        </View>
                    }
                    {item.type === "BUS" &&
                        <View style={[L.aiC]}>
                            <View style={[L.even, L.aiC]}>
                                <Image style={[HT(18), WT(18)]} source={Images.bus_full} />
                            </View>
                            <Text style={[C.lColor, F.ffM, F.fsOne2]}>NA Kms</Text>
                        </View>
                    }
                </TouchableOpacity>
                {isVisible == item && <View>
                    <View style={[HT(3), WT("100%"), C.bgLGray]} />
                    <View style={[WT('100%'), L.even, L.jcB, L.aiC, L.pH10, L.mT10]}>
                        <Text style={[C.pColor, F.ffM, F.fsOne2]}>{STR.strings.cost}</Text>
                        <View style={[WT(15)]} />
                        <Text style={[C.fcBlack, F.ffM, F.fsOne5]}>{itemData?.price ?? ""}</Text>
                    </View>
                    {hasValue(tmp_track) && tmp_track.length > 0 &&
                        <View style={[WT('100%'), L.asC, L.jcC, L.pH15]}>
                            <View style={[HT(15)]} />
                            {tmp_track.map(function (element, index) {
                                return (
                                    <View key={index} style={[L.pH8]}>
                                        <View style={[L.even, L.aiC, { marginTop: -11 }]}>
                                            <View style={[HT(8), WT(8), L.bR8, C.bgLightGray, { marginLeft: -3 }]} />
                                            <View style={[WT(10)]} />
                                            <View style={[]}>
                                                <View style={[L.even, L.aiC]}>
                                                    {element.type === "AUTO" ?
                                                        (<Text style={[C.fcBlack, F.ffB, F.fsOne5]} numberOfLines={1}>{element?.start?.address?.ward ?? ""}</Text>) :
                                                        (<Text style={[C.fcBlack, F.ffB, F.fsOne5]} numberOfLines={1}>{element?.start?.descriptor?.name ?? ""}</Text>)
                                                    }
                                                </View>
                                                <Text style={[C.fcBlack, F.ffM, F.fsOne2]}>{element.type === "AUTO" ? "Auto" : "Bus"}  |  {element?.distanceFromStartPoint ?? ""}</Text>
                                            </View>
                                        </View>
                                        {tmp_track.length == index + 1 && <>
                                            <View style={[HT(100), WT(2), C.bgBlack, L.jcC, { marginTop: -11 }]}>
                                                <View style={[HT(25), WTD(80), L.even, L.aiC, { marginLeft: -10 }]}>
                                                    <View style={[WT(10)]} />
                                                    <View style={[HT(25), WT(25), C.bgWhite, L.card, C.brLight, L.br05, L.bR4, L.jcC, L.aiC, { marginLeft: -10 }]}>
                                                        <Image style={[HT(18), WT(18)]} source={element.type === "AUTO" ? Images.auto : Images.bus_full} />
                                                    </View>
                                                    <View style={[WT(10)]} />
                                                    <Text style={[C.fcBlack, F.ffM, F.fsOne2, C.fcBlue]}>{element?.price ?? ""} | {element?.distance ?? ""} | {element?.duration ?? ""}</Text>
                                                </View>
                                            </View>
                                            <View style={[L.even, L.aiC, { marginTop: -11 }]}>
                                                <View style={[HT(8), WT(8), L.bR8, C.bgLightGray, { marginLeft: -3 }]} />
                                                <View style={[WT(10)]} />
                                                <View style={[]}>
                                                    <View style={[L.even, L.aiC]}>
                                                        {element.type === "AUTO" ?
                                                            (<Text style={[C.fcBlack, F.ffB, F.fsOne5]} numberOfLines={1}>{element?.end?.address?.ward ?? ""}</Text>) :
                                                            (<Text style={[C.fcBlack, F.ffB, F.fsOne5]} numberOfLines={1}>{element?.end?.descriptor?.name ?? ""}</Text>)
                                                        }
                                                    </View>
                                                    <Text style={[C.fcBlack, F.ffM, F.fsOne2]}>{element.type === "AUTO" ? "Auto" : "Bus"}  |  {element?.distanceFromStartPoint ?? ""}</Text>
                                                </View>
                                            </View>
                                        </>}
                                        {tmp_track.length != index + 1 &&
                                            <View style={[HT(100), WT(2), C.bgBlack, L.jcC, { marginTop: -11 }]}>
                                                <View style={[HT(25), WTD(80), L.even, L.aiC, { marginLeft: -10 }]}>
                                                    <View style={[WT(10)]} />
                                                    <View style={[HT(25), WT(25), C.bgWhite, L.card, C.brLight, L.br05, L.bR4, L.jcC, L.aiC, { marginLeft: -10 }]}>
                                                        <Image style={[HT(18), WT(18)]} source={element.type === "AUTO" ? Images.auto : Images.bus_full} />
                                                    </View>
                                                    <View style={[WT(10)]} />
                                                    <Text style={[C.fcBlack, F.ffM, F.fsOne2, C.fcBlue]}>{element?.price ?? ""}</Text>
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
                    <TouchableOpacity style={[WT(100), HT(35), L.asC, L.jcC, L.aiC, L.mT2]} onPress={() => { onItemPress(itemData, item?.type ?? "MULTI", rideTo) }}>
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
