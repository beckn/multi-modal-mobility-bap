import 'react-native-gesture-handler';
import React, { Component } from 'react';
import {
    AppRegistry,
    UIManager, LogBox
} from 'react-native';
import { name as appName } from './app.json';
import { Provider } from 'react-redux';
import NetInfo from "@react-native-community/netinfo";
import { PersistGate } from 'redux-persist/integration/react';
import Router from './src/Router';
import { store, persistor } from './src/redux/store'
import { MyAlert } from './src/Utils';
STR = require('./src/languages/strings');

export default class AppContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
        try {
            this.checkNetwork();
        } catch (error) {
            console.log(error);
        }
    }
    checkNetwork() {
        try {
            // Subscribe
            const unsubscribe = NetInfo.addEventListener(state => {
                if (state.isConnected == false) {
                    MyAlert(STR.strings.please_check_your_network_connection, STR.strings.no_internet)
                }
            });
            // unsubscribe();
        } catch (error) {
            console.log(error);
        }
    }
    render() {
        return (
            <Provider store={store}>
                {/**
                 * PersistGate delays the rendering of the app's UI until the persisted state has been retrieved
                 * and saved to redux.
                 * The `loading` prop can be `null` or any react instance to show during loading (e.g. a splash screen),
                 * for example `loading={<SplashScreen />}`. 
                */}
                <PersistGate loading={null} persistor={persistor}>
                    <Router />
                </PersistGate>
            </Provider>
        );
    }
}
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
AppRegistry.registerComponent(appName, () => AppContainer);
// AppRegistry.registerComponent(appName, () => App);
LogBox.ignoreAllLogs(true)
