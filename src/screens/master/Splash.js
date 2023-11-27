import React, { useEffect } from 'react';
import {
    View, Image, Text
} from 'react-native';
import { Images } from '../../commonStyles/Images'
import RootNavigation from '../../Navigation/RootNavigation';
import { C, F, HT, L, WT } from '../../commonStyles/style-layout';
import { Header } from '../../components';
import { changeLanguage } from '../user/userSlice';
import { useSelector, useDispatch } from 'react-redux'
import { dateTime, getStorage, hasValue } from '../../Utils';
STR = require('../../languages/strings');

function Splash({ navigation }) {
    const dispatch = useDispatch()
    const responseData = useSelector(state => state)

    useEffect(() => {
        async function fetchData() {
            try {
                const user_data = responseData?.user?.user_data ?? null
                // const active_language = await getStorage('active_language');
                // if (hasValue(active_language)) {
                //     dispatch(changeLanguage({ language: active_language }))
                // } else {
                //     dispatch(changeLanguage({ language: 'en' }))
                // }
                setTimeout(() => {
                    if (hasValue(user_data)) {
                        RootNavigation.replace("Dashboard")
                    } else {
                        RootNavigation.replace("Login")
                    }
                }, 1500);
            } catch (error) {
                console.log(error);
            }
        }
        fetchData();
    }, []);

    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen]}>
            <Header navigation={navigation} hardwareBack={2} card={false} height={HT(0)} />
            <Image style={[HT('100%'), WT('100%')]} source={Images.splash} />
            <View style={[{ marginTop: -130 }, L.aiC, L.jcC]}>
                <Text style={[C.fcBlack, F.ffB, F.fsThree5, L.taC]}>WayFinder</Text>
                <Text style={[C.lColor, F.ffM, F.fsOne5, L.taC]}>Travel made easy</Text>
            </View>
        </View>
    );
}

export default Splash
