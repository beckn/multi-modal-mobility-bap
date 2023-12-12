import React, { useEffect, useState, useRef } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    View, Text, FlatList, Image, ScrollView, Modal, Platform
} from 'react-native';
import { Images } from '../../commonStyles/Images'
import { C, F, HT, L, WT, h } from '../../commonStyles/style-layout';
import { Header, Loader, TouchableOpacity, Button } from '../../components';
import { useSelector, useDispatch } from 'react-redux'
import { hasValue, isCompletedTrip, toFixed } from '../../Utils';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { API } from '../../shared/API-end-points';
import MapViewDirections from 'react-native-maps-directions';
import RootNavigation from '../../Navigation/RootNavigation';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { busStatus, confirmRide, ridesStatus } from '../master/masterSlice';
import { ride_status_state } from '../user/userSlice';
STR = require('../../languages/strings');

function YourJourney({ navigation, route }) {
    const dispatch = useDispatch()
    const responseDataUser = useSelector(state => state.user)
    const responseDataMaster = useSelector(state => state.master)
    const rides_status = responseDataMaster?.rides_status ?? null
    const route_coordinates = responseDataMaster?.current_ride_coordinates ?? []
    const ride_updates = responseDataMaster?.ride_updates?.descriptor ?? null
    const region_data = responseDataMaster?.current_ride_region ?? {
        latitude: API.LATITUDE,
        longitude: API.LONGITUDE,
        latitudeDelta: API.LATITUDE_DELTA,
        longitudeDelta: API.LONGITUDE_DELTA,
    }
    const completed_trips = responseDataUser?.completed_trips ?? []
    var mapRef = useRef(null);
    var markerRef = useRef(null);
    const [vehicleData, set_vehicleData] = useState([]);
    const [headerLabel, setHeaderLabel] = useState("Your Journey");
    const [quantity, set_quantity] = useState(0);
    const [modalConfirm, set_modalConfirm] = useState(false);
    const [rideDetails, setRideDetails] = useState({});
    const [currentRideId, setCurrentRideId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showBusRideModal, setShowBusRideModal] = useState(false);
    const [itemData, setItemData] = useState(false);

    const startLocation = {
        latitude: 37.7749,
        longitude: -122.4194,
      };
      const endLocation = {
        latitude: 37.7751,
        longitude: -122.4194, 
      };
      const startLocationOfAuto = {
        latitude: -0.2295,
        longitude: -78.5243,
      };
      const endLocationOfAuto = {
        latitude: -0.2300,
        longitude: -78.5063, 
      };
    const distanceInKM = 0.02223898532885992;

     
    useFocusEffect(
        React.useCallback(() => {
            set_modalConfirm(false);
            return () => {
                set_modalConfirm(false);
            };
        }, []),
    );

    useFocusEffect(
        React.useCallback(() => {
            dispatch(ridesStatus({}))
            return () => { };
        }, []),
    );

    useEffect(() => {
        setJourneyData()
    }, [rides_status]);

    useEffect(() => {
        setJourneyData()
    }, [completed_trips]);

    useEffect(() => {
        busRideJourneyPopup();
    }, [rideDetails]);

    function setJourneyData() {
        try {
            set_vehicleData(completed_trips)
            if (hasValue(completed_trips) && completed_trips.length > 0) {
                for (let index = 0; index < completed_trips.length; index++) {
                    const element = completed_trips[index];
                    if (element.status != "SELECTED") {
                        setRideDetails(element)
                        if (element.status === "CONFIRMED" || element.status === "COMPLETED" || element.status === "IN_PROGRESS") {
                            onHeaderLabel(element)
                            const type = element?.type ?? null
                            const status = element?.status ?? null
                            if (type === "BUS") {
                                if (status === "CONFIRMED") {
                                    set_quantity(0)
                                }
                                if (status === "IN_PROGRESS") {
                                    set_quantity(1)
                                }
                                if (status === "COMPLETED") {
                                    set_quantity(2)
                                }
                            }
                            if (element.status === "IN_PROGRESS") {
                                break;
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    function onHeaderLabel(element) {
        try {
            const type = element?.type ?? null
            const status = element?.status ?? null
            const code = ride_updates?.code ?? null
            if (type === "AUTO") {
                if (status === "IN_PROGRESS") {
                    setHeaderLabel("Your Journey")
                    setCurrentRideId(element?.id ?? "")
                } else if (status === "CONFIRMED") {
                    setHeaderLabel("Your Journey is confirmed")
                    setCurrentRideId(element?.id ?? "")
                } else if (status === "COMPLETED") {
                    setHeaderLabel("Your Journey")
                    setCurrentRideId(element?.id ?? "")
                } else {
                    setHeaderLabel("Your Journey")
                }
            } else {
                if (status === "CONFIRMED") {
                    setHeaderLabel("Your Journey is confirmed")
                    setCurrentRideId(element?.id ?? "")
                    if (quantity === 1) {
                        // setHeaderLabel("Bus journey has started")
                        setHeaderLabel("Your Journey")
                        setCurrentRideId(element?.id ?? "")
                    }
                } else if (status === "COMPLETED") {
                    setHeaderLabel("Bus journey has Completed")
                    setCurrentRideId(element?.id ?? "")
                } else if (status === "IN_PROGRESS") {
                    // setHeaderLabel("Bus journey has started")
                    setHeaderLabel("Your Journey")
                    setCurrentRideId(element?.id ?? "")
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    function onItemPress(item , isBookAuto) {
        try {
            if (item.type === "AUTO" && isBookAuto) {
                if (item.status != "SELECTED") {
                    if (item.status === "COMPLETED") {
                        setShowModal(false);
                        setShowBusRideModal(false);
                        RootNavigation.navigate("RideCompleted", { itemData: item })
                    } else {
                        setShowModal(false);
                        setShowBusRideModal(false);
                        RootNavigation.navigate("ConfirmedRide", { itemData: item })
                    }
                } else {
                    if (isCompletedTrip(0)) {
                        set_modalConfirm(true)
                        dispatch(confirmRide({}))
                    } else {
                        RootNavigation.replace("RateTrip")
                    }
                }
            } else {
                if (item.status === "CONFIRMED") {
                    RootNavigation.navigate("TicketDetails", { itemData: item })
                } else if (item.status === "IN_PROGRESS") {
                    RootNavigation.navigate("TicketDetails", { itemData: item })
                } else if (item.status === "COMPLETED") {
                    RootNavigation.navigate("TicketDetails", { itemData: item })
                }
            }

        } catch (error) {
            console.log(error);
        }
    }
    const getDistance = (startLocation, endLocation) => {
        const earthRadius = 6371;     
        const toRadians = (angle) => {
          return (angle * Math.PI) / 180;
        };    
        const dLat = toRadians(endLocation.latitude - startLocation.latitude);
        const dLon = toRadians(endLocation.longitude - startLocation.longitude);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRadians(startLocation.latitude)) *
            Math.cos(toRadians(endLocation.latitude)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = earthRadius * c; 
        return distance;
    };   
    const renderItem = (item, index) => {
        let image = item.type === "AUTO" ? Images.auto : Images.bus_full
        let title = item.type === "AUTO" ? "Auto details" : "Bus details"
        let sub_title = ""
        let showPrice = false
        if (item.status === "SELECTED") {
            sub_title = item.type === "AUTO" ? STR.strings.ride_not_started_yet : "Ticket not confirmed"
        } else if (item.status === "CONFIRMED") {
            sub_title = item.type === "AUTO" ? "Ride Confirmed" : "Ticket Confirmed"
            showPrice = true
        } else if (item.status === "IN_PROGRESS") {
            sub_title = "Ride has Started"
            showPrice = true
        } else if (item.status === "COMPLETED") {
            sub_title = "Ride Completed"
            showPrice = true
        } else if (item.status === "FAILED") {
            sub_title = "Ride failed"
        }
        if(item.type == "AUTO"){
            setItemData(item)
        }
        return (
            <>
                {currentRideId === item.id &&
                    <View style={[WT('95%'), HT(300), L.asC, L.bR10, L.mT8, L.mB10, { overflow: 'hidden' }, L.card, L.br05, C.brLight]}>
                        <MapView
                            provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                            ref={ref => mapRef = ref}
                            style={[WT('100%'), HT('100%')]}
                            showsMyLocationButton={true}
                            followsUserLocation={true}
                            showsCompass={true}
                            region={region_data}>
                            {hasValue(route_coordinates) && route_coordinates.length > 0 && <>
                                <>
                                    {route_coordinates.map(function (element, index) {
                                        return (<>
                                            {hasValue(element?.icon ?? "") ?
                                                (<Marker coordinate={element}>
                                                    {hasValue(element?.icon ?? "") &&
                                                        <Image source={element?.icon} resizeMode="contain" style={[WT(20), HT(20)]} />
                                                    }
                                                </Marker>) :
                                                (<>
                                                    {route_coordinates.length == index + 1 &&
                                                        <Marker coordinate={element} />
                                                    }
                                                </>)
                                            }
                                        </>)
                                    })}
                                </>
                                <MapViewDirections
                                    origin={route_coordinates[0]}
                                    destination={route_coordinates.length > 1 ? route_coordinates[route_coordinates.length - 1] : route_coordinates[0]}
                                    apikey={API.map_key}
                                    mode='DRIVING'
                                    strokeWidth={4}
                                    strokeColor={C.strokeColor}
                                    fillColor={C.fillColor}
                                    waypoints={route_coordinates}
                                    optimizeWaypoints={false}
                                    splitWaypoints={true}
                                    resetOnChange={false}
                                    precision={'high'}
                                />
                            </>}
                        </MapView>
                    </View>
                }
                <TouchableOpacity style={[WT('100%'), HT(70), L.jcC, C.bgWhite, L.card, L.mB3]}
                    onPress={() => { onItemPress(item, item.type == "AUTO" && item.status == "COMPLETED") }}>
                    <View style={[WT('100%'), L.pV10, L.pH10, L.even, L.aiC, L.jcSB]}>
                        <View style={[WT('50%'), L.even, L.aiC]}>
                            <View style={[HT(25), WT(30), L.bR4, L.jcC, L.aiC, C.bgWhite, L.card, C.brLight, L.br05]}>
                                <Image style={[HT(18), WT(18)]} source={image} />
                            </View>
                            <View style={[WT(8)]} />
                            <View style={[]}>
                                <Text style={[C.fcBlack, F.ffB, F.fsOne4]}>{title}</Text>
                                <Text style={[C.lColor, F.ffM, F.fsOne2]}>{sub_title}</Text>
                            </View>
                        </View>
                        <View style={[WT('50%'), L.aiR]}>
                            {showPrice &&
                                <Text style={[C.fcBlack, F.ffB, F.fsOne4]}
                                >{hasValue(item?.price?.value ?? "") ? toFixed(item?.price?.value ?? "") != 0 ? "Rs " + toFixed(item?.price?.value ?? "") : "Rs " + item?.price?.value ?? "" : ""}</Text>
                            }
                        </View>
                    </View>
                </TouchableOpacity>
            </>
        )
    }

    function onSubmit(flag) {
        try {
            if (flag === 0) {
                dispatch(ride_status_state({ ride_status: "RIDE_ASSIGNED" }))
            } else if (flag === 1) {
                dispatch(ride_status_state({ ride_status: "RIDE_STARTED" }))
                for (let index = 0; index < vehicleData.length; index++) {
                    const element = vehicleData[index];
                    if (element.type === "BUS") {
                        dispatch(busStatus({
                            "routeId": rides_status[0].routeId,
                            "order_id": element?.order_id ?? "",
                            // "status": "RIDE_STARTED"
                            "status": "RIDE_IN_PROGRESS"
                        }))
                        break;
                    }
                }
            } else {
                dispatch(ride_status_state({ ride_status: "RIDE_COMPLETED" }))
                for (let index = 0; index < vehicleData.length; index++) {
                    const element = vehicleData[index];
                    if (element.type === "BUS") {
                        dispatch(busStatus({
                            "routeId": rides_status[0].routeId,
                            "order_id": element?.order_id ?? "",
                            "status": "RIDE_COMPLETED"
                        }))
                        break;
                    }
                }
                onBookRide()
            }
            set_quantity(quantity + 1)
        } catch (error) {
            console.log(error);
        }
    }
    function onBookRide() {
        try {
            if (isCompletedTrip(0)) {
                // set_modalConfirm(true)
                // dispatch(confirmRide({}))
            } else {
                RootNavigation.replace("RateTrip")
            }
        } catch (error) {
            console.log(error);
        }
    }
    function journeyLabel() {
        try {
            let label = "Has your bus ride started?"
            if (quantity === 0) {
                label = "Has your bus ride started?"
            } else if (quantity === 1) {
                label = "Has your bus ride ended?"
            } else {
                label = "Has your bus ride ended?"
            }
            return label
        } catch (error) {
            return "Has your ride started?"
        }
    }
    
    function busBtn() {
        try {
            let status = false
            const type = rideDetails?.type ?? null
            const routeType = rideDetails?.routeType ?? null
            const bus_status = rideDetails?.status ?? null
            if (type === "BUS") {
                if (bus_status === "CONFIRMED") {
                    status = true
                }
                if (bus_status === "IN_PROGRESS") {
                    status = true
                }
            } 
            if (type === "AUTO" && routeType == "MULTI") {
                if (bus_status === "CONFIRMED") {
                    status = true
                }
                if (bus_status === "IN_PROGRESS") {
                    status = true
                }
                if (bus_status === "COMPLETED") {
                    status = true
                }
            } 
            return status
        } catch (error) {
            console.log(error);
            return false
        }
    }
    function busRideJourneyPopup(){
        const type = rideDetails?.type ?? null
        const status = rideDetails?.status ?? null
        const d = getDistance(startLocation,endLocation)
        if(type == "BUS") {
            if(status == "CONFIRMED" && d == distanceInKM){
                setShowBusRideModal(true);
            } else if(status == "IN_PROGRESS" && d == distanceInKM ) {
                setShowBusRideModal(true);
                autoJourneyPopup();
            } else {
                setShowBusRideModal(false);
            }
        }
    }
    function autoJourneyPopup(){
        const d = getDistance(startLocationOfAuto,endLocationOfAuto)
        const distance =  parseFloat(d.toFixed(2))
        if(distance == 2){
            setShowModal(true)
        }
    }
    return (
        <View style={[WT('100%'), HT('100%'), C.bgScreen2]}>
            <Header navigation={navigation} hardwareBack={'Dashboard'} left_press={'Dashboard'} height={HT(70)} ic_left_style={[WT(80), HT(80)]} card={false} style={[C.bgTrans]} ic_left={Images.back} label_left={headerLabel} />
            {responseDataMaster.isLoading && <Loader isLoading={responseDataMaster.isLoading} />}
            <ScrollView>
                <View style={[L.mT20]}>
                    <FlatList
                        keyboardShouldPersistTaps='always'
                        keyExtractor={(item, index) => String(index)}
                        data={vehicleData}
                        renderItem={({ item, index }) => renderItem(item, index)}
                        contentContainerStyle={[{ paddingBottom: h(10) }]}
                    />
                </View>
                <View style={[HT(100)]} />
            </ScrollView>
            {busBtn() &&
                <View style={[C.bgWhite, L.card, C.brLight, L.br05, L.aiC, L.jcC, HT(150), L.dpARL, { bottom: 0 }]}>
                    <Text style={[C.fcBlack, F.ffM, L.taC, F.fsOne5]}>{journeyLabel()}</Text>
                    <View style={[HT(25)]} />
                    <Button onPress={() => { onSubmit(quantity + 1) }} style={[WT('90%'), HT(45)]} label={"Yes"} />
                </View>
            }
            {responseDataMaster.isLoading == true &&
                <Modal
                    transparent={true}
                    supportedOrientations={['portrait', 'landscape']}
                    visible={modalConfirm}
                    animationType='fade'
                    onRequestClose={() => set_modalConfirm(false)}>
                    <View style={[WT('100%'), HT('100%'), C.bgTPH, L.jcC, L.aiC]}>
                        <View style={[WT('100%'), HT('100%'), C.bgTPH, L.aiC]}>
                            <View style={[HT(Platform.OS == 'ios' ? '5%' : '0%'), WT('100%')]} />
                            <View style={[HT('5%')]} />
                            <Text style={[F.fsOne9, F.ffM, C.fcWhite, L.taC]}>{STR.strings.booking_your_ride}</Text>
                            <Text style={[F.fsOne5, F.ffM, C.fcWhite, L.taC, L.mT10]}>{STR.strings.hold_on_this_may_take_a_few_seconds}</Text>
                            <View style={[HT('25%')]} />
                            <Image style={[WT(250), HT(250), L.asC]} source={Images.booking_loader} />
                        </View>
                    </View>
                </Modal>
            }
            <Modal
                transparent={true}
                supportedOrientations={['portrait', 'landscape']}
                visible={showModal}
                animationType='fade'
                onRequestClose={() => setShowModal(false)}>
                <View style={[L.asC, L.jcC, C.bgTransparent, L.abs, L.f1, L.pV10,L.mB30]}>
                    <View style={[C.bgWhite,L.p10]}>
                        <TouchableOpacity style={[HT(25), L.jcC, L.aiR]} onPress={() => setShowModal(false)}>
                            <Icon style={[WT(25), HT(25)]} name="close" size={20} color={C.black} />
                        </TouchableOpacity>
                    <View style={[HT(15)]} />
                        <View style={[L.p20]} >
                            <View style={[L.even,L.aiC,L.asC]}>
                            <Image style={[HT(18), WT(20),L.asC]} source={Images.bus_Stop ?? ""} />
                            <Text style={[L.asC , C.fcGrey]} >Just 5 mins away from bus stop!</Text>
                            </View>
                            <Text style={[L.asC,C.fcLightGrey]}>We are almost there. Shall we book your auto ride now.</Text>
                            <View style={[L.even,L.aiC,L.asC,L.mV10]}>
                            <Text style={[L.asC ,C.fcDarkGrey, F.f75,F.fsTwo4]}>Book Auto </Text>
                            <Image style={[HT(18), WT(25)]} source={Images.auto_marker ?? ""} />
                            </View>
                        </View>
                        <View style={[L.even,L.aiC,L.jcSB]}>
                            <TouchableOpacity onPress={() => { setShowModal(false) }} style={[WT('45%'), HT(40), L.br05, C.brLightGray, L.jcC, L.aiC,]}>
                                <Text style={[C.fcBlack,F.ffM, F.fsOne7]}>Not Now</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[WT("45%"), HT(40),  L.jcC, L.aiC, C.bgBlack]}
                             onPress={() => {
                                 setShowModal(false)
                                 onItemPress(itemData , true)
                             }}>
                                <Text style={[C.fcWhite, F.ffM, F.fsOne7]}>Book Now</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
            transparent={true}
            supportedOrientations={['portrait', 'landscape']}
            visible={showBusRideModal}
            animationType='fade'
            onRequestClose={() => setShowBusRideModal(false)}>
                <View style={[WT('100%'), HT('100%'), C.bgTPL, L.jcC]}>
                <View style={[L.asC, L.jcC, C.bgTransparent, L.abs, L.f1, L.pV10,L.mB30]}>
                    <View style={[C.bgWhite,L.p10]}>
                        <TouchableOpacity style={[HT(25), L.jcC, L.aiR]} onPress={() => setShowBusRideModal(false)}>
                            <Icon style={[WT(25), HT(25)]} name="close" size={20} color={C.black} />
                        </TouchableOpacity>
                            <View style={[L.even,L.aiC,L.asC,L.mV10]}>
                            <Text style={[L.asC ,C.fcDarkGrey, F.f75,F.fsTwo4]}>{journeyLabel() }</Text>
                            <Image style={[HT(18), WT(25)]} source={Images.bus_marker ?? ""} />
                            </View>
                        <View style={[L.even,L.aiC,L.jcSB,L.mT10]}>
                            <TouchableOpacity onPress={() => { setShowBusRideModal(false); }} style={[WT('45%'), HT(40), L.br05, C.brLightGray, L.jcC, L.aiC,]}>
                                <Text style={[C.fcBlack,F.ffM, F.fsOne7]}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[WT("45%"), HT(40),  L.jcC, L.aiC, C.bgBlack]}
                             onPress={() => {
                                setShowBusRideModal(false);
                                onSubmit(quantity + 1)
                             }}>
                                <Text style={[C.fcWhite, F.ffM, F.fsOne7]}>Yes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                </View>
            </Modal>
        </View>
    );
}

export default YourJourney
