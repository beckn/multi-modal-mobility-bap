import React, { Component } from 'react';
import {
    View, Alert,
} from 'react-native';
import { C, HT, WT } from '../../commonStyles/style-layout';
import RootNavigation from '../../Navigation/RootNavigation';
STR = require('../../languages/strings');

export default class SideMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
        this.reRenderSomething = this.props.navigation.addListener('focus', () => {

        });
    }
    logoutAlert() {
        try {
            RootNavigation.replace("Login");
        } catch (error) {
            console.log(error);

        }
    }
    doLogout() {
        Alert.alert(
            '',
            STR.strings.are_you_sure_want_to_logout,
            [
                { text: 'CANCEL', onPress: () => console.log('CANCEL Pressed'), style: 'cancel' },
                { text: 'LOGOUT', onPress: () => this.logoutAlert() },
            ],
            { cancelable: false }
        )
    }
    render() {
        return (
            <View style={[WT('100%'), HT('100%'), C.bgScreen]}>

            </View>
        );
    }
}
