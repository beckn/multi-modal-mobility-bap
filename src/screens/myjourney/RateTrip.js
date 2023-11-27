import React, { useState, useEffect } from 'react';
import {
    Text, View, FlatList, Image, ScrollView,
} from 'react-native';
import { L, C, F, WT, HT, h, mHT } from '../../commonStyles/style-layout';
import { Images } from "../../commonStyles/Images";
import { TextField, Loader, Button, Header, TouchableOpacity } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import StarRating from 'react-native-star-rating';
import RootNavigation from '../../Navigation/RootNavigation';
import { MyToast, hasValue, isCompletedTrip } from '../../Utils';
import { addRating } from '../master/masterSlice';

function RateTrip({ navigation, route }) {
    const dispatch = useDispatch()
    const responseDataMaster = useSelector(state => state.master)
    const confirm_ride = responseDataMaster?.confirm_ride ?? null
    const [description, set_description] = useState();
    const [is_checked, set_checked] = useState(false);
    const [order_rating, setOrder_rating] = useState(4);
    const [listData, set_listData] = useState([]);

    const arrayData = [
        {
            id: 1,
            label: STR.strings.order_booking_process,
            checked: false
        },
        {
            id: 2,
            label: STR.strings.timely_arrival,
            checked: false
        },
        {
            id: 3,
            label: STR.strings.value_for_money,
            checked: false
        },
        {
            id: 4,
            label: STR.strings.everything_looks_perfect,
            checked: false
        },
        {
            id: 5,
            label: STR.strings.none_of_the_above,
            checked: false
        }
    ]

    useEffect(() => {
        try {
            set_listData(arrayData1)
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        try {
            if (order_rating === 1) {
                set_listData(arrayData1)
            } else if (order_rating === 2) {
                set_listData(arrayData2)
            } else if (order_rating === 3) {
                set_listData(arrayData3)
            } else if (order_rating === 4) {
                set_listData(arrayData4)
            } else if (order_rating === 5) {
                set_listData(arrayData5)
            }
        } catch (error) {
            console.log(error);
        }
    }, [order_rating]);
    function onSubmit() {
        try {
            const isFilled = listData.filter((element) => element.checked === true);
            if (hasValue(isFilled) && isFilled.length === 0) {
                MyToast(STR.strings.option_is_required);
                return
            }
            console.log(listData, 'listData');
            let feedback = []
            listData.forEach(element => {
                if (element.checked) {
                    feedback.push(element.label)
                }
            });
            dispatch(addRating({
                "route_id": confirm_ride?.routeId ?? "",
                "rating": order_rating,
                "feedback": feedback
            }))
        } catch (error) {
            console.log(error);
        }
    }
    function onItemPress(params) {
        try {
            if (params.checked) {
                params.checked = false
            } else {
                params.checked = true
            }
            set_checked(!is_checked)
        } catch (error) {
            console.log(error);
        }
    }
    const renderItem = (item, index) => {
        return (
            <TouchableOpacity style={[WT('100%'), L.jcC, L.mB15]}
                onPress={() => { onItemPress(item) }}>
                <View style={[WT('100%'), L.pH10, L.even, L.aiC, L.jcSB]}>
                    <View style={[WT('10%')]}>
                        <Icon name={item.checked ? "checkbox-marked" : "checkbox-blank-outline"} size={25} color={item.checked ? C.black : C.gray400} />
                    </View>
                    <View style={[WT('90%')]}>
                        <Text style={[item.checked ? C.fcBlack : C.lColor, F.ffM, F.fsOne5]}>{item.label}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen2]}>
            <Header navigation={navigation} hardwareBack={2} height={HT(55)} card={false} style={[C.bgTrans]} label_center={STR.strings.how_was_your_trip} />
            {responseDataMaster.isLoading && <Loader isLoading={responseDataMaster.isLoading} />}
            <ScrollView>
                <View style={[WT('100%'), HT('100%'), L.pH10]}>
                    <View style={[HT(40)]} />
                    <StarRating
                        maxStars={5}
                        buttonStyle={[L.pH15]}
                        starSize={30}
                        rating={order_rating}
                        fullStarColor={C.pink}
                        emptyStarColor={C.pink}
                        containerStyle={[L.asC]}
                        selectedStar={(rating) => setOrder_rating(rating)}
                    />
                    <View style={[HT(25)]} />
                    <Text style={[F.fsTwo5, F.ffM, C.fcBlack, L.taC]}>{STR.strings.what_did_you_like}</Text>
                    <View style={[HT(15)]} />
                    <TouchableOpacity style={[L.even, L.aiC, L.jcC, HT(27), WT(225), L.asC, , L.bR2, L.pH10, C.bgLGray]}>
                        <Icon name={"information-outline"} size={20} color={C.gray600} />
                        <View style={[WT(5)]} />
                        <Text style={[F.fsOne4, F.ffM, C.lColor, L.taC]}>{STR.strings.you_can_select_multiple_options}</Text>
                    </TouchableOpacity>
                    <View style={[L.mT30]}>
                        <FlatList
                            keyboardShouldPersistTaps='always'
                            keyExtractor={(item, index) => String(index)}
                            data={listData}
                            renderItem={({ item, index }) => renderItem(item, index)}
                            contentContainerStyle={[{ paddingBottom: h(0) }]}
                        />
                    </View>
                    <View style={[HT(15)]} />
                    <View style={[mHT(80), WT('100%'), L.pH10, C.bgTrans, L.asC, L.bR5, L.br05, C.brLightGray, L.mT5, L.aiC]}>
                        <TextField
                            style={[mHT(80), L.taT, WT('100%'), C.lColor, F.ffM]}
                            placeholder={STR.strings.write_your_feedback_in_detail}
                            value={description}
                            multiline={true}
                            numberOfLines={4}
                            blurOnSubmit
                            onChangeText={text => set_description(text)}
                        />
                    </View>
                    <View style={[HT(50)]} />
                    <Button onPress={() => { onSubmit() }} style={[WT('100%'), HT(45)]} label={STR.strings.submit} />
                    <View style={[HT(15)]} />
                    <TouchableOpacity onPress={() => { RootNavigation.replace("Dashboard") }} style={[HT(40), WT(100), L.asC, L.jcC, L.aiC]}>
                        <Text style={[F.fsOne5, F.ffB, C.fcBlack, L.taC]}>{STR.strings.skip}</Text>
                    </TouchableOpacity>
                    <View style={[HT(250)]} />
                </View>
            </ScrollView>
        </View>
    );
}

export default RateTrip

const arrayData1 = [
    {
        id: 1,
        label: "Trip Cancellation",
        checked: false
    },
    {
        id: 2,
        label: "Late Pickup",
        checked: false
    },
    {
        id: 3,
        label: "Driver Behavior",
        checked: false
    },
    {
        id: 4,
        label: "Unreliable Service",
        checked: false
    },
    {
        id: 5,
        label: "None of the above",
        checked: false
    },
]

const arrayData2 = [
    {
        id: 1,
        label: "Long Wait Times",
        checked: false
    },
    {
        id: 2,
        label: "Pricing Concerns",
        checked: false
    },
    {
        id: 3,
        label: "App Glitches",
        checked: false
    },
    {
        id: 4,
        label: "Inefficient Booking",
        checked: false
    },
    {
        id: 5,
        label: "None of the above",
        checked: false
    },
]
const arrayData3 = [
    {
        id: 1,
        label: "Satisfactory Ride",
        checked: false
    },
    {
        id: 2,
        label: "Average Driver",
        checked: false
    },
    {
        id: 3,
        label: "Acceptable Pricing",
        checked: false
    },
    {
        id: 4,
        label: "Average Wait Time",
        checked: false
    },
    {
        id: 5,
        label: "None of the above",
        checked: false
    },
]
const arrayData4 = [
    {
        id: 1,
        label: "Courteous Driver",
        checked: false
    },
    {
        id: 2,
        label: "Reasonable Pricing",
        checked: false
    },
    {
        id: 3,
        label: "Smooth Booking",
        checked: false
    },
    {
        id: 4,
        label: "User-Friendly App",
        checked: false
    },
    {
        id: 5,
        label: "None of the above",
        checked: false
    },
]
const arrayData5 = [
    {
        id: 1,
        label: "Exceptional Driver",
        checked: false
    },
    {
        id: 2,
        label: "Great Pricing",
        checked: false
    },
    {
        id: 3,
        label: "Prompt Pickup",
        checked: false
    },
    {
        id: 4,
        label: "Effortless Booking",
        checked: false
    },
    {
        id: 5,
        label: "None of the above",
        checked: false
    },
]  