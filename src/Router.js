import React from 'react';
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './Navigation/RootNavigation';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { C } from './commonStyles/style-layout';

//master
import Splash from './screens/master/Splash';
import Dashboard from "./screens/master/Dashboard";
import SideMenu from './screens/master/SideMenu';
import ConfirmLocation from './screens/master/ConfirmLocation';
import AvailableOptions from './screens/master/AvailableOptions';
import ConfirmedRide from './screens/master/ConfirmedRide';
import BusJourneyConfirmed from './screens/master/BusJourneyConfirmed';
import MenuScreen from './screens/master/MenuScreen';
import EndTrip from './screens/master/EndTrip';

//myjourney
import SelectedJourneyDetails from './screens/myjourney/SelectedJourneyDetails';
import YourConfirmedJourney from './screens/myjourney/YourConfirmedJourney';
import YourJourney from './screens/myjourney/YourJourney';
import SelectedBusDetails from './screens/myjourney/SelectedBusDetails';
import TicketDetails from './screens/myjourney/TicketDetails';
import JourneyStarted from './screens/myjourney/JourneyStarted';
import JourneyCompleted from './screens/myjourney/JourneyCompleted';
import RateTrip from './screens/myjourney/RateTrip';
import MyJourney from './screens/myjourney/MyJourney';
import TicketValid from './screens/myjourney/TicketValid';
import RideCompleted from './screens/myjourney/RideCompleted';
import BusJourney from './screens/myjourney/BusJourney';

//user
import Login from "./screens/user/Login";
import VerifyOTP from "./screens/user/VerifyOTP";
import PersonalDetails from "./screens/user/PersonalDetails";
import UpdatePersonalDetails from "./screens/user/UpdatePersonalDetails";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

createDrawer = () =>
    <Drawer.Navigator drawerContent={props => <SideMenu {...props} />}
        useLegacyImplementation={false}
        screenOptions={{
            headerShown: false,
            drawerStyle: { backgroundColor: C.transparentColor, width: '75%' }
        }}>
        <Drawer.Screen name="Dashboard" component={Dashboard} />
    </Drawer.Navigator>


const Router = () => {
    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }} initialRouteName="Splash">
                <Stack.Screen name="Splash" component={Splash} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="VerifyOTP" component={VerifyOTP} />
                <Stack.Screen name="Dashboard" component={Dashboard} />
                <Stack.Screen name="ConfirmLocation" component={ConfirmLocation} />
                <Stack.Screen name="AvailableOptions" component={AvailableOptions} />
                <Stack.Screen name="SelectedJourneyDetails" component={SelectedJourneyDetails} />
                <Stack.Screen name="ConfirmedRide" component={ConfirmedRide} />
                <Stack.Screen name="YourConfirmedJourney" component={YourConfirmedJourney} />
                <Stack.Screen name="YourJourney" component={YourJourney} />
                <Stack.Screen name="SelectedBusDetails" component={SelectedBusDetails} />
                <Stack.Screen name="TicketDetails" component={TicketDetails} />
                <Stack.Screen name="BusJourneyConfirmed" component={BusJourneyConfirmed} />
                <Stack.Screen name="JourneyStarted" component={JourneyStarted} />
                <Stack.Screen name="JourneyCompleted" component={JourneyCompleted} />
                <Stack.Screen name="RateTrip" component={RateTrip} />
                <Stack.Screen name="PersonalDetails" component={PersonalDetails} />
                <Stack.Screen name="UpdatePersonalDetails" component={UpdatePersonalDetails} />
                <Stack.Screen name="MenuScreen" component={MenuScreen} />
                <Stack.Screen name="EndTrip" component={EndTrip} />
                <Stack.Screen name="MyJourney" component={MyJourney} />
                <Stack.Screen name="TicketValid" component={TicketValid} />
                <Stack.Screen name="RideCompleted" component={RideCompleted} />
                <Stack.Screen name="BusJourney" component={BusJourney} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default Router;
