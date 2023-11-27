import React, { useState } from 'react';
import {
    Text, View, Keyboard, Image, ScrollView,
} from 'react-native';
import { L, C, F, WT, HT } from '../../commonStyles/style-layout';
import { Images } from "../../commonStyles/Images";
import { TextField, Loader, Button, Header, TouchableOpacity } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import { doLogin, sendOTP, verifyOTP } from './userSlice'
import { IsEmailValid, IsNumberValid, MyToast, hasValue } from '../../Utils';
import RootNavigation from '../../Navigation/RootNavigation';

STR = require('../../languages/strings');

function VerifyOTP({ navigation, route }) {
    const dispatch = useDispatch()
    const responseData = useSelector(state => state.user)
    const mobileNo = route.params?.mobileNo ?? "";
    const [otp, set_otp] = useState("");

    function onSubmit() {
        try {
            if (!hasValue(otp)) {
                MyToast(STR.strings.mobile_number_field_is_required)
                return
            }
            dispatch(verifyOTP({
                "mobileNo": mobileNo,
                "otp": otp
            }))
            set_otp("")
            Keyboard.dismiss();
        } catch (error) {
            console.log(error);
        }
    }

    function sliceLastNumber() {
        try {
            const slicedNumber = mobileNo.replace(/.(?=.{4})/g, '');
            return slicedNumber
        } catch (error) {
            console.log(error);
            return ""
        }
    }
    function onResendOTP() {
        try {
            dispatch(sendOTP({
                "mobileNo": mobileNo
            }))
            set_otp("")
            Keyboard.dismiss();
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen]}>
            {responseData.isLoading && <Loader isLoading={responseData.isLoading} />}
            <Header navigation={navigation} hardwareBack={1} left_press={1} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} ic_left={Images.back} />
            <ScrollView keyboardShouldPersistTaps='always'>
                <View style={[WT('92%'), L.asC]}>
                    <View style={[HT(25)]} />
                    <Text style={[F.fsFour5, F.ffB, C.fcBlack]}>{STR.strings.verify_your_mobile_number}</Text>
                    <View style={[HT(15)]} />
                    <Text style={[F.fsOne4, F.ffM, C.fcBlack]} onPress={() => { RootNavigation.goBack() }}>{STR.strings.have_sent_an_otp_to_your_mobile_number_ending_with} {sliceLastNumber()}<Text style={[F.ffB, F.tDL]}> {STR.strings.change}</Text></Text>
                    <View style={[HT(60)]} />
                    <Text style={[F.fsOne5, F.ffM, C.fcBlack]}>{STR.strings.enter_otp_here}</Text>
                    <View style={[HT(38), WT('100%'), C.bgWhite, L.asC, L.aiC, L.brB05, { borderBottomColor: C.gray600 }]}>
                        <TextField
                            style={[HT(38), WT('100%'), C.lColor, F.ffM]}
                            placeholder={STR.strings.enter_otp_here}
                            value={otp}
                            keyboardType='number-pad'
                            maxLength={6}
                            returnKeyType='done'
                            onChangeText={text => { set_otp(text) }}
                        />
                    </View>
                    <View style={[HT(15)]} />
                    <TouchableOpacity onPress={() => { onResendOTP() }} style={[HT(40), L.asR, L.pH15]}>
                        <Text style={[F.fsOne5, F.ffB, C.fcBlack, F.tDL]}>{STR.strings.resend_otp}</Text>
                    </TouchableOpacity>
                    <View style={[HT(35)]} />
                    <Button disabled={otp.length == 6 ? false : true} onPress={() => { onSubmit() }} style={[WT('100%'), HT(45), otp.length == 6 ? L.opc1 : L.opc4]} label={STR.strings.login} />
                    <View style={[HT(250)]} />
                </View>
            </ScrollView>
        </View>
    );
}
export default VerifyOTP
