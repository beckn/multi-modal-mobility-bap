import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, FlatList,
} from 'react-native';
import { Images } from '../../commonStyles/Images'
import { C, F, HT, L, WT, h } from '../../commonStyles/style-layout';
import { Header, Loader } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
STR = require('../../languages/strings');

function TicketValid({ navigation, route }) {
    const dispatch = useDispatch()
    const responseDataMaster = useSelector(state => state.master)
    const itemData = route.params?.itemData ?? "";
    const confirm_ride = responseDataMaster?.confirm_ride ?? null
    const [source_location, set_source_location] = useState("");
    const [end_location, set_end_location] = useState("");

    useEffect(() => {
        try {
            const start_ward = confirm_ride?.fulfillment?.start?.location?.descriptor?.name ?? ""
            const end_ward = confirm_ride?.fulfillment?.end?.location?.descriptor?.name ?? ""
            set_source_location(start_ward)
            set_end_location(end_ward)
        } catch (error) {
            console.log(error);
        }
    }, [confirm_ride]);
    function isOdd(num) { return num % 2; }
    const renderItem = (item, index) => {
        return (
            <>
                <View style={[L.even, L.jcSB, L.aiC, WT('100%'), HT(45), isOdd(index) === 0 ? C.bgWhite : C.bgScreen2]}>
                    <View style={[WT(1), HT('100%'), C.bgLightGray]} />
                    <View style={[WT('29%'), L.jcC, L.aiC, L.pH12]}>
                        <Text style={[F.fsOne4, F.ffM, C.lColor, L.taC]}>1232</Text>
                    </View>
                    <View style={[WT(1), HT('100%'), C.bgLightGray]} />
                    <View style={[WT('70%'), L.aiC, L.jcC]}>
                        <Text style={[F.fsOne4, F.ffM, C.lColor, L.taC]}>10:50 AM - 11:40 AM</Text>
                    </View>
                    <View style={[WT(1), HT('100%'), C.bgLightGray]} />
                    {/* <View style={[WT('25%'), L.jcC, L.aiC, L.pH5]}>
                        <Text style={[F.fsOne4, F.ffM, C.lColor, L.taC]}>Rs 100</Text>
                    </View>
                    <View style={[WT(1), HT('100%'), C.bgLightGray]} /> */}
                </View>
                <View style={[WT('100%'), HT(1), C.bgLightGray]} />
            </>
        )
    }
    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen2]}>
            <Header navigation={navigation} hardwareBack={1} left_press={1} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} style={[C.bgTrans]} ic_left={Images.back} label_left={`Buses detail from ${source_location} to ${end_location}`} txt_style={[F.fsOne5]} />
            {responseDataMaster.isLoading && <Loader isLoading={responseDataMaster.isLoading} />}
            <ScrollView>
                <View style={[HT(20)]} />
                <View style={[WT('90%'), L.pV10, L.pH8, L.asC, C.bgLGray, L.even, L.aiC]}>
                    <Icon name={"information-outline"} size={22} color={C.black} />
                    <View style={[WT(10)]} />
                    <Text style={[C.fcBlack, F.ffM, F.fsOne2]}>Your bus ticket is valid in below buses</Text>
                </View>
                <View style={[HT(20)]} />
                <View style={[WT('90%'), L.asC]}>
                    <View style={[WT('100%'), HT(1), C.bgLightGray]} />
                    <View style={[L.even, L.jcSB, L.aiC, WT('100%'), HT(45), C.bgBlue]}>
                        <View style={[WT(1), HT('100%'), C.bgLightGray]} />
                        <View style={[WT('29%'), L.jcC, L.aiC, L.pH12]}>
                            <Text style={[F.fsOne4, F.ffB, C.fcBlack, L.taC]}>Route No</Text>
                        </View>
                        <View style={[WT(1), HT('100%'), C.bgLightGray]} />
                        <View style={[WT('70%'), L.aiC, L.jcC]}>
                            <Text style={[F.fsOne4, F.ffB, C.fcBlack, L.taC]}>Start Time - ETA</Text>
                        </View>
                        <View style={[WT(1), HT('100%'), C.bgLightGray]} />
                        {/* <View style={[WT('25%'), L.jcC, L.aiC, L.pH5]}>
                            <Text style={[F.fsOne4, F.ffB, C.lColor, L.taC]}>Ticket Cost</Text>
                        </View>
                        <View style={[WT(1), HT('100%'), C.bgLightGray]} /> */}
                    </View>
                    <FlatList
                        showsHorizontalScrollIndicator={false}
                        keyboardShouldPersistTaps='always'
                        keyExtractor={(item, index) => String(index)}
                        data={[1, 1, 1, 1, 1, 1]}
                        renderItem={({ item, index }) => renderItem(item, index)}
                        contentContainerStyle={[{ paddingBottom: h(10) }]}
                    />
                </View>
                <View style={[HT(200)]} />
            </ScrollView>
        </View>
    );
}

export default TicketValid
