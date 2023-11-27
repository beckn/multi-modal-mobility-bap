import React from 'react';
import {
    Text, View, StatusBar, BackHandler, Image, Linking, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Spinner, TouchableOpacity } from '../../components';
import { C, F, L, WTD, HTD, HT, WT } from '../../commonStyles/style-layout';
import { Images } from '../../commonStyles/Images';
import RootNavigation from '../../Navigation/RootNavigation';
import { hasValue, MyToast } from '../../Utils';
STR = require('../../languages/strings');

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }
    //------exit app start------//
    UNSAFE_componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
    onButtonPress = () => {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        // then navigate  // navigate('NewScreen');  
    }
    handleBackButtonClick = async () => {
        let { hardwareBack } = this.props;
        this.onHardwareBackPress(hardwareBack)
        return true;
    }
    //------exit app end------//  

    onHardwareBackPress(flag) {
        try {
            if (flag == 1) {
                RootNavigation.goBack();
            } else if (flag == 2) {
                if (this.state.doubleBackToExitPressedOnce) {
                    BackHandler.exitApp();
                }
                MyToast(STR.strings.press_back_again_to_exit);
                this.setState({ doubleBackToExitPressedOnce: true });
                setTimeout(() => {
                    this.setState({ doubleBackToExitPressedOnce: false });
                }, 2000);
            } else if (flag == "cancel_trip") {
                this.onCancelTrip()
            } else if (flag == "progress_trip") {
                return
            } else {
                RootNavigation.navigate(flag);
            }
        } catch (error) {
            console.log(error);
        }
    }
    leftPress(flag) {
        try {
            if (flag == 1) {
                RootNavigation.goBack();
            } else if (flag == 2) {
                this.props.navigation.openDrawer();
            } else if (flag == "cancel_trip") {
                this.onCancelTrip()
            } else if (flag == "progress_trip") {
                return
            } else {
                RootNavigation.navigate(flag);
            }
        } catch (error) {
            console.log(error);
        }
    }
    onRightPress(flag, payloads) {
        try {
            console.log(flag, 'flag');
            if (flag == 1) {

            } else if (flag == 2) {

            } else if (flag == "call") {
                Linking.openURL(`tel:${this.props?.responseData?.user?.customer_support ?? ""}`)
            } else {
                RootNavigation.navigate(flag, { itemData: hasValue(payloads) ? payloads : "" });
            }
        } catch (error) {
            console.log(error);
        }
    }
    onCancelTrip() {
        try {
            Alert.alert(
                '',
                STR.strings.are_you_sure_want_to_cancel_trip,
                [
                    { text: STR.strings.no, onPress: () => console.log('CANCEL Pressed'), style: 'cancel' },
                    { text: STR.strings.yes, onPress: () => this.confirmCancelTrip() },
                ],
                { cancelable: false }
            )
        } catch (error) {
            console.log(error);
        }
    }
    confirmCancelTrip() {
        try {
            // const select_route = this.props.responseData.master?.select_route ?? null
            const confirm_ride = this.props.responseData.master?.confirm_ride ?? null
            this.props.cancelRide(confirm_ride)
        } catch (error) {
            console.log(error);
        }
    }
    render() {
        let { style, txt_style, label_right, ic_color, ic_left, ic_left_style, left_press, card, statusBarColor, barStyle, ic_right, label_center, height, label_left, right_press, item_data, is_filter, ic_right_style, ic_right_press, label_right_style, right_payloads } = this.props;
        return (
            <View style={[L.headerView, card == false ? {} : L.card, height ? height : HT(45), style]}>
                <StatusBar backgroundColor={statusBarColor ? statusBarColor : C.white} barStyle={barStyle ? barStyle : C.statusBarContentColorDark} />
                <View style={[L.aiC, WT(label_left ? '85%' : '20%'), HT('100%'), L.even, L.aiC]}>
                    <View style={[WT(10)]} />
                    {ic_left && <TouchableOpacity style={([WT(33), HT('100%'), L.jcC, L.aiC, L.mT10])} onPress={() => { this.leftPress(left_press) }}>
                        <Image source={ic_left} style={[ic_left_style]} />
                    </TouchableOpacity>}
                    {label_left && <>
                        <View style={[WT(15)]} />
                        <Text style={[C.fcBlack, F.ffM, F.fsOne8, txt_style]} numberOfLines={2}>{label_left}</Text>
                    </>}
                </View>
                <View style={[L.aiC, L.jcC, WT(label_left ? '2%' : '60%'), HT('100%'), L.even]}>
                    {label_center &&
                        <Text style={[C.fcBlack, F.ffM, F.fsOne8, L.taC, txt_style, L.mH10]} numberOfLines={1}>{label_center}</Text>
                    }
                </View>
                <View style={[L.aiC, WT(label_left ? '13%' : '20%'), HT('100%'), L.even, L.jcB]}>
                    {label_right && <TouchableOpacity style={[WT(35), L.aiC, L.aiR]} onPress={() => { this.onRightPress(ic_right_press, right_payloads) }}>
                        <Text style={[C.fcBlack, F.ffM, F.fsOne8, L.taC, label_right_style]} numberOfLines={1}>{label_right}</Text>
                    </TouchableOpacity>}
                    {ic_right && <TouchableOpacity style={[WT(35), L.aiC, L.aiR]} onPress={() => { this.onRightPress(ic_right_press) }}>
                        <Image resizeMode='contain' source={ic_right} style={[ic_right_style ? ic_right_style : [WT(35), HT(35), L.bR30]]} />
                    </TouchableOpacity>}
                    {is_filter && <TouchableOpacity style={[WT(35), L.aiC, L.even]} onPress={() => { this.props.filter_state({ is_filter_visible: true }) }}>
                        <Image source={Images.sort} style={[WT(13), HT(13)]} />
                        <View style={[WT(5)]} />
                        <Text style={[C.fcBlack, F.ffM, F.fsOne6, L.taC, F.tDL]}>{STR.strings.sort}</Text>
                    </TouchableOpacity>}
                    <View style={[WT(10)]} />
                </View>
            </View>
        )
    }
}


import { connect } from "react-redux";
import { filter_state, cancelRide } from '../../screens/master/masterSlice';
import { onLogout } from '../../screens/user/userSlice';
const mapStateToProps = (state) => {
    return { responseData: state }
}
const mapDispatchToProps = (dispatch) => {
    return {
        onLogout: (payloads) => { dispatch(onLogout(payloads)) },
        filter_state: (payloads) => { dispatch(filter_state(payloads)) },
        cancelRide: (payloads) => { dispatch(cancelRide(payloads)) },
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Header)
