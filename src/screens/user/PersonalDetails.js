import React, { useState, useEffect } from 'react';
import {
    Text, View, Keyboard, Image, ScrollView,
} from 'react-native';
import { L, C, F, WT, HT, WTD } from '../../commonStyles/style-layout';
import { Images } from "../../commonStyles/Images";
import { TextField, Loader, Button, Header, DropDown } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import { useFocusEffect } from '@react-navigation/native';

STR = require('../../languages/strings');

function VerifyOTP({ navigation, route }) {
    const dispatch = useDispatch()
    const responseData = useSelector(state => state)
    const responseDataUser = responseData?.user ?? {}
    const user_data = responseDataUser?.user_data ?? {}
    const [listData, set_listData] = useState([]);
    let [formData, setFormData] = useState(formData = {
        "name": "",
        "email": "",
        "mobileNo": "",
        "gender": "",
    });
    const drpData = [
        {
            id: 1,
            label: STR.strings.male
        },
        {
            id: 2,
            label: STR.strings.female
        },
        {
            id: 3,
            label: STR.strings.other
        },
    ]

    useFocusEffect(
        React.useCallback(() => {
            setFormData(user_data)
            return () => {
                // Cleanup logic (if necessary)
            };
        }, [user_data]),
    );

    useEffect(() => {
        try {
            set_listData(drpData)
        } catch (error) {
            console.log(error);
        }
    }, []);

    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen]}>
            {responseDataUser.isLoading && <Loader isLoading={responseDataUser.isLoading} />}
            <Header navigation={navigation} hardwareBack={1} left_press={1} height={HT(70)} card={false} style={[C.bgTrans]} ic_left_style={[WT(80), HT(80)]} ic_left={Images.back} label_left={STR.strings.personal_details} label_right={STR.strings.edit} label_right_style={[C.fcBlue, F.ffM, F.fsOne5]} ic_right_press={"UpdatePersonalDetails"} right_payloads={user_data} />
            <ScrollView keyboardShouldPersistTaps='always'>
                <View style={[WT('90%'), L.asC]}>
                    <View style={[HT(35)]} />
                    <Image style={[WT(80), HT(80), L.bR40, L.asC]} source={Images.avatar} />
                    <View style={[HT(35)]} />
                    <Text style={[F.fsOne5, F.ffM, C.fcBlack, L.mT15]}>{STR.strings.name}</Text>
                    <View style={[HT(45), WT('100%'), L.pH10, L.card, C.bgWhite, L.asC, L.bR5, L.br05, C.brLightest, L.mT5, L.aiC]}>
                        <TextField
                            style={[HT(45), WT('100%'), C.lColor, F.ffM]}
                            placeholder={STR.strings.enter_name}
                            value={formData.name}
                            editable={false}
                            onChangeText={text => setFormData(prevState => ({ ...prevState, name: text }))}
                        />
                    </View>
                    <Text style={[F.fsOne5, F.ffM, C.fcBlack, L.mT20]}>{STR.strings.mobile_number}</Text>
                    <View style={[HT(45), WT('100%'), L.pH10, L.card, C.bgWhite, L.asC, L.bR5, L.br05, C.brLightest, L.mT5, L.aiC]}>
                        <TextField
                            style={[HT(45), WT('100%'), C.lColor, F.ffM]}
                            placeholder={STR.strings.enter_mobile}
                            value={formData.mobileNo}
                            keyboardType='number-pad'
                            editable={false}
                            onChangeText={text => setFormData(prevState => ({ ...prevState, mobileNo: text }))}
                        />
                    </View>
                    <Text style={[F.fsOne5, F.ffM, C.fcBlack, L.mT20]}>{STR.strings.email_id}</Text>
                    <View style={[HT(45), WT('100%'), L.pH10, L.card, C.bgWhite, L.asC, L.bR5, L.br05, C.brLightest, L.mT5, L.aiC]}>
                        <TextField
                            style={[HT(45), WT('100%'), C.lColor, F.ffM]}
                            placeholder={STR.strings.enter_email}
                            value={formData.email}
                            editable={false}
                            onChangeText={text => setFormData(prevState => ({ ...prevState, email: text }))}
                        />
                    </View>
                    <Text style={[F.fsOne5, F.ffM, C.fcBlack, L.mT20]}>{STR.strings.gender}</Text>
                    <View style={[HT(45), WT('100%'), L.pH10, L.card, C.bgWhite, L.asC, L.bR5, L.br05, C.brLightest, L.mT5, L.aiC, L.jcC]}>
                        <DropDown
                            disable={true}
                            style={[WTD(83), L.asC]}
                            labelField={'label'}
                            valueField={'label'}
                            placeholder={STR.strings.select_gender}
                            placeholderTextColor={L.placeholderTextColor}
                            data={listData}
                            iconColor={C.black}
                            value={formData.gender}
                            onChange={item => { setFormData(prevState => ({ ...prevState, gender: item.label })) }}
                            renderItem={(item) => {
                                return (
                                    <Text style={[F.fsOne5, F.ffM, C.fcBlack, L.m10]}>{item.label}</Text>
                                )
                            }}
                        />
                    </View>
                    <View style={[HT(250)]} />
                </View>
            </ScrollView>
        </View>
    );
}
export default VerifyOTP
