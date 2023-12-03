import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, Modal
} from 'react-native';
import { Images } from '../../commonStyles/Images'
import { C, F, HT, L, WT, h } from '../../commonStyles/style-layout';
import { Header, TouchableOpacity, Button } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RootNavigation from '../../Navigation/RootNavigation';
import { doLogout } from '../user/userSlice';
STR = require('../../languages/strings');

function MenuScreen({ navigation }) {
    const dispatch = useDispatch()
    const responseData = useSelector(state => state.user)
    const [listData, set_listData] = useState([]);
    const [modalLogout, set_modalLogout] = useState(false);

    const arrayData = [
        {
            id: 1,
            title: STR.strings.my_journeys,
            icon: "clock-outline"
        },
        {
            id: 2,
            title: STR.strings.logout,
            icon: "logout"
        },

    ]

    useEffect(() => {
        try {
            set_listData(arrayData)
        } catch (error) {
            console.log(error);
        }
    }, []);

    function onItemPress(item) {
        try {
            if (item.id === 1) {
                RootNavigation.navigate("MyJourney")
            } else if (item.id === 2) {
                set_modalLogout(true)
            }
        } catch (error) {
            console.log(error);
        }
    }
    const renderItem = (item, index) => {
        return (
            <View style={[WT('100%'), L.jcC, L.mB3]}>
                <TouchableOpacity style={[WT('100%'), HT(40), L.aiC, L.even]}
                    onPress={() => { onItemPress(item) }}>
                    <Icon name={item.icon} size={17} color={C.gray400} />
                    <View style={[WT(8)]} />
                    <Text style={[C.fcBlack, F.ffB, F.fsOne5]}>{item.title}</Text>
                </TouchableOpacity>
            </View>
        )
    }
    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen2]}>
            <Header navigation={navigation} hardwareBack={1} left_press={1} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} style={[C.bgTrans]} ic_left={Images.back} label_center={STR.strings.menu} ic_right={Images.avatar} ic_right_style={[WT(30), HT(30)]} ic_right_press={"PersonalDetails"} />
            <View style={[L.mT10, L.pH15]}>
                <FlatList
                    keyboardShouldPersistTaps='always'
                    keyExtractor={(item, index) => String(index)}
                    data={listData}
                    renderItem={({ item, index }) => renderItem(item, index)}
                    contentContainerStyle={[{ paddingBottom: h(10) }]}
                />
            </View>
            <Modal
                transparent={true}
                supportedOrientations={['portrait', 'landscape']}
                visible={modalLogout}
                animationType='fade'
                onRequestClose={() => set_modalLogout(false)}>
                <View style={[WT('100%'), HT('100%'), C.bgTPL, L.jcB]}>
                    <View style={[WT('100%'), C.bgScreen, L.aiB, L.aiC, L.pH10]}>
                        <View style={[HT(30)]} />
                        <Text style={[C.fcBlack, F.ffB, F.fsOne7, L.taC]}>Do you want to sign out?</Text>
                        <View style={[HT(10)]} />
                        <Text style={[C.fcBlack, F.ffM, F.fsOne5, L.taC]}>Stay signed in to book your next trip faster</Text>
                        <View style={[HT(25)]} />
                        <Button onPress={() => { dispatch(doLogout({})); set_modalLogout(false) }} style={[WT('100%'), HT(45)]} label={"Confirm sign-out"} />
                        <View style={[HT(10)]} />
                        <TouchableOpacity style={[HT(40), L.jcC, L.aiC, L.asC]} onPress={() => set_modalLogout(false)}>
                            <Text style={[C.fcBlack, F.ffM, F.fsOne5, L.taC]}>Cancel</Text>
                        </TouchableOpacity>
                        <View style={[HT(10)]} />
                    </View>
                </View>
            </Modal>

        </View>
    );
}

export default MenuScreen
