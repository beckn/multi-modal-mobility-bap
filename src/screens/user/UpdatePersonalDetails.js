import React, { useState, useEffect } from 'react';
import {
    Text, View, Keyboard, Image, ScrollView, Modal
} from 'react-native';
import { L, C, F, WT, HT, WTD } from '../../commonStyles/style-layout';
import { Images } from "../../commonStyles/Images";
import { TextField, Loader, Button, Header, DropDown, TouchableOpacity } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import { updateUserDetails } from './userSlice';
import { IsEmailValid, MyToast, hasValue, IsNumberValid, isAlphabet } from '../../Utils';
import { userSendOtp, verifyMobileNumber, modal_otp_state } from './userSlice'

STR = require('../../languages/strings');

function UpdatePersonalDetails({ navigation, route }) {
    const dispatch = useDispatch()
    const responseData = useSelector(state => state)
    const responseDataUser = responseData?.user ?? {}
    const modal_otp = responseDataUser?.modal_otp ?? false;
    const user_data = route.params?.itemData ?? "";
    const [listData, set_listData] = useState([]);
    const [otp, set_otp] = useState("");
    let [formData, setFormData] = useState(formData = {
        "name": "",
        "email": "",
        "mobileNo": "",
        "gender": ""
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

    useEffect(() => {
        try {
            setFormData(user_data)
            set_listData(drpData)
        } catch (error) {
            console.log(error);
        }
    }, []);

    function onSubmit() {
        try {
            if (!hasValue(formData.name)) {
                MyToast(STR.strings.name_is_required)
                return;
            }
            if (formData.name.length < 3) {
                MyToast("Name length should be minimum 3")
                return;
            }
            if (formData.name.length > 15) {
                MyToast("Name length should be maximum 15")
                return;
            }
            if (!hasValue(formData.mobileNo)) {
                MyToast(STR.strings.mobile_number_field_is_required)
                return
            }
            if (!IsNumberValid(formData.mobileNo)) {
                MyToast(STR.strings.please_enter_valid_mobile_number)
                return
            }
            if (!hasValue(formData.email)) {
                MyToast(STR.strings.email_is_required)
                return;
            }
            if (!IsEmailValid(formData.email)) {
                MyToast(STR.strings.please_enter_valid_email)
                return;
            }
            dispatch(updateUserDetails(formData))
            Keyboard.dismiss();
        } catch (error) {
            console.log(error);
        }
    }
    function sliceLastNumber() {
        try {
            const mobileNo = formData?.mobileNo ?? ""
            const slicedNumber = mobileNo.replace(/.(?=.{4})/g, '');
            return slicedNumber
        } catch (error) {
            console.log(error);
            return ""
        }
    }
    function onResendOTP() {
        try {
            if (!hasValue(formData.mobileNo)) {
                MyToast(STR.strings.mobile_number_field_is_required)
                return
            }
            if (!IsNumberValid(formData.mobileNo)) {
                MyToast(STR.strings.please_enter_valid_mobile_number)
                return
            }
            dispatch(userSendOtp({
                "mobileNo": formData.mobileNo
            }))
            set_otp("")
            Keyboard.dismiss();
        } catch (error) {
            console.log(error);
        }
    }
    function onTypingOTP(text) {
        try {
            set_otp(text)
            if (text.length === 6) {
                onVerifyMobileNumber(text)
            }
        } catch (error) {
            console.log(error);
        }
    }
    function onVerifyMobileNumber(text) {
        try {
            if (!hasValue(formData.mobileNo)) {
                MyToast(STR.strings.mobile_number_field_is_required)
                return
            }
            if (!IsNumberValid(formData.mobileNo)) {
                MyToast(STR.strings.please_enter_valid_mobile_number)
                return
            }
            dispatch(verifyMobileNumber({
                "mobileNo": formData.mobileNo,
                "otp": text
            }))
            set_otp("")
            Keyboard.dismiss();
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen]}>
            {responseDataUser.isLoading && <Loader isLoading={responseDataUser.isLoading} />}
            <Header navigation={navigation} hardwareBack={1} left_press={1} height={HT(70)} card={false} style={[C.bgTrans]} ic_left_style={[WT(80), HT(80)]} ic_left={Images.back} label_left={STR.strings.personal_details} />
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
                            onChangeText={text => {
                                if (isAlphabet(text)) {
                                    setFormData(prevState => ({ ...prevState, name: text }))
                                }
                            }}
                        />
                    </View>
                    <Text style={[F.fsOne5, F.ffM, C.fcBlack, L.mT20]}>{STR.strings.mobile_number}</Text>
                    <View style={[HT(45), WT('100%'), L.pH10, L.card, C.bgWhite, L.asC, L.bR5, L.br05, C.brLightest, L.mT5, L.aiC]}>
                        <TextField
                            style={[HT(45), WT('100%'), C.lColor, F.ffM]}
                            placeholder={STR.strings.enter_mobile}
                            value={formData.mobileNo}
                            keyboardType='number-pad'
                            maxLength={10}
                            onChangeText={text => setFormData(prevState => ({ ...prevState, mobileNo: text }))}
                        />
                    </View>
                    <Text style={[F.fsOne5, F.ffM, C.fcBlack, L.mT20]}>{STR.strings.email_id}</Text>
                    <View style={[HT(45), WT('100%'), L.pH10, L.card, C.bgWhite, L.asC, L.bR5, L.br05, C.brLightest, L.mT5, L.aiC]}>
                        <TextField
                            style={[HT(45), WT('100%'), C.lColor, F.ffM]}
                            placeholder={STR.strings.enter_email}
                            value={formData.email}
                            onChangeText={text => setFormData(prevState => ({ ...prevState, email: text }))}
                        />
                    </View>
                    <Text style={[F.fsOne5, F.ffM, C.fcBlack, L.mT20]}>{STR.strings.gender}</Text>
                    <View style={[HT(45), WT('100%'), L.pH10, L.card, C.bgWhite, L.asC, L.bR5, L.br05, C.brLightest, L.mT5, L.aiC, L.jcC]}>
                        <DropDown
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
                    <View style={[HT(35)]} />
                    <Button onPress={() => { onSubmit() }} style={[WT('100%'), HT(45)]} label={STR.strings.update} />
                    <View style={[HT(250)]} />
                </View>
            </ScrollView>
            <Modal
                transparent={true}
                supportedOrientations={['portrait', 'landscape']}
                visible={modal_otp}
                animationType='fade'
                onRequestClose={() => dispatch(modal_otp_state({}))}>
                <View style={[WT('100%'), HT('100%'), C.bgTPL, L.jcB]}>
                    <View style={[WT('100%'), C.bgScreen, L.aiB]}>
                        <View style={[HT(Platform.OS == 'ios' ? '5%' : '0%'), WT('100%')]} />
                        <View style={[WT('92%'), L.asC]}>
                            <View style={[HT(15)]} />
                            <Text style={[F.fsOne4, F.ffM, C.fcBlack]}>{STR.strings.have_sent_an_otp_to_your_mobile_number_ending_with} {sliceLastNumber()}</Text>
                            <View style={[HT(45)]} />
                            <Text style={[F.fsOne5, F.ffM, C.fcBlack]}>{STR.strings.enter_otp_here}</Text>
                            <View style={[HT(38), WT('100%'), C.bgWhite, L.asC, L.aiC, L.brB05, { borderBottomColor: C.gray600 }]}>
                                <TextField
                                    style={[HT(38), WT('100%'), C.lColor, F.ffM]}
                                    placeholder={STR.strings.enter_otp_here}
                                    value={otp}
                                    keyboardType='number-pad'
                                    maxLength={6}
                                    returnKeyType='done'
                                    onChangeText={text => { onTypingOTP(text) }}
                                />
                            </View>
                            <View style={[HT(15)]} />
                            <TouchableOpacity onPress={() => { onResendOTP() }} style={[HT(40), L.asR, L.pH15]}>
                                <Text style={[F.fsOne5, F.ffB, C.fcBlack, F.tDL]}>{STR.strings.resend_otp}</Text>
                            </TouchableOpacity>
                            <View style={[HT(5)]} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
export default UpdatePersonalDetails
