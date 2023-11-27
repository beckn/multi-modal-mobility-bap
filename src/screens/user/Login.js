import React, { useState } from 'react';
import {
    Text, View, Keyboard, Image, ScrollView,
} from 'react-native';
import { L, C, F, WT, HT } from '../../commonStyles/style-layout';
import { Images } from "../../commonStyles/Images";
import { TextField, Loader, Button, Header } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import { sendOTP } from './userSlice'
import { IsNumberValid, MyToast, hasValue } from '../../Utils';

STR = require('../../languages/strings');

function Login({ navigation }) {
    const dispatch = useDispatch()
    const responseData = useSelector(state => state.user)
    let [formData, setFormData] = useState(formData = { name: "", username: "", email: "", password: "" });
    const [number, set_number] = useState("");

    function onSubmit() {
        try {
            if (!hasValue(number)) {
                MyToast(STR.strings.mobile_number_field_is_required)
                return
            }
            if (!IsNumberValid(number)) {
                MyToast(STR.strings.please_enter_valid_mobile_number)
                return
            }
            dispatch(sendOTP({ "mobileNo": number }))
            // RootNavigation.navigate("VerifyOTP", { itemData: number })
            set_number("")
            Keyboard.dismiss();
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen]}>
            {responseData.isLoading && <Loader isLoading={responseData.isLoading} />}
            <Header navigation={navigation} hardwareBack={2} card={false} height={HT(0)} />
            <ScrollView keyboardShouldPersistTaps='always'>
                <View style={[WT('95%'), L.asC]}>
                    <View style={[HT(40)]} />
                    <Image resizeMode='contain' style={[WT('60%'), HT(100), L.asC]} source={Images.lock} />
                    <View style={[HT(40)]} />
                    <Text style={[F.fsFour5, F.ffB, C.fcBlack, L.taC]}>{STR.strings.lets_get_started}</Text>
                    <View style={[HT(60)]} />
                    <View style={[HT(45), WT('100%'), C.bgWhite, L.asC, L.aiC, L.brB05, { borderBottomColor: C.gray600 }]}>
                        <TextField
                            style={[HT(45), WT('100%'), C.lColor, F.ffM]}
                            placeholder={STR.strings.enter_mobile_number}
                            value={number}
                            keyboardType='number-pad'
                            maxLength={10}
                            returnKeyType='done'
                            onChangeText={text => { set_number(text) }}
                        />
                    </View>
                    <View style={[HT(40)]} />
                    <Button disabled={number.length == 10 ? false : true} onPress={() => { onSubmit() }} style={[WT('100%'), HT(45), number.length == 10 ? L.opc1 : L.opc4]} label={STR.strings.send_OTP} />
                    {/* <View style={[HT(20)]} />
                    <Text style={[F.fsTwo, F.ffM, C.fcLightGray, L.taC]}>{STR.strings.or}</Text>
                    <View style={[HT(20)]} />
                    <Button onPress={() => { }} style={[WT('100%'), HT(45)]} txtStyle={[F.ffM]} icon_left={'google'} label={STR.strings.sign_in_with_google} />
                    <View style={[HT(15)]} />
                    <Button onPress={() => { }} style={[WT('100%'), HT(45)]} txtStyle={[F.ffM]} icon_left={'facebook'} label={STR.strings.sign_in_with_facebook} /> */}
                    <View style={[HT(250)]} />
                </View>
            </ScrollView>
        </View>
    );
}
export default Login
