import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, Modal, Platform, FlatList, ScrollView
} from 'react-native';
import { C, HT, L, WT, F, WTD, h } from '../commonStyles/style-layout';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TouchableOpacity, TextField } from '../components';
import { useSelector, useDispatch } from 'react-redux'
import { filter_state, filter_value_state, get_job_details_state } from '../screens/master/masterSlice';
import { store } from '../redux/store';
import { hasValue } from '../Utils';

STR = require('../languages/strings');

function FilterComponent({ }) {
    const dispatch = useDispatch()
    const responseDataMaster = store.getState()?.master ?? {}
    const [selected_sort, set_selected_sort] = useState("");
    const job_details = responseDataMaster.job_details ?? null
    const [sortItems, setSortItems] = useState([]);

    function onCloseFilter() {
        try {
            dispatch(filter_state({ is_filter_visible: false }))
            // dispatch(filter_value_state({}))
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        try {
            setSortItems(job_details)
        } catch (error) {
            console.log(error);
        }
    }, [responseDataMaster.filter_value]);

    useEffect(() => {
        async function fetchData() {
            try {
                set_selected_sort(responseDataMaster.filter_value)
            } catch (error) {
                console.log(error);
            }
        }
        fetchData();
    }, [responseDataMaster.filter_value]);

    function onSelectFilter(params) {
        try {
            dispatch(filter_value_state({ filter_value: params }))
            dispatch(filter_state({ is_filter_visible: false }))

            if (params === 1) {
                let tmp_data = []
                sortItems.forEach(element => {
                    let item = element
                    if (item.type === "MULTI") {
                        item = element?.routes[1] ?? {}
                    }
                    tmp_data.push({
                        ...element,
                        di_transport: hasValue(item?.duration ?? "") ? parseInt(item.duration) : 0
                    })
                });
                const newSort = tmp_data.sort(function (a, b) {
                    return a.di_transport - b.di_transport;
                });
                dispatch(get_job_details_state({
                    job_details: newSort
                }))
            } else if (params === 2) {
                let tmp_data = []
                sortItems.forEach(element => {
                    let totalCost = 0
                    if (element.type === "AUTO") {
                        totalCost = element?.price?.value ?? ""
                        // totalCost = toFixed(itemData?.price?.value ?? "")
                    } else if (element.type === "BUS") {
                        totalCost = element?.price?.value ?? ""
                    } else {
                        totalCost = element.totalCost
                    }
                    tmp_data.push({
                        ...element,
                        pr_transport: hasValue(totalCost) ? parseInt(totalCost) : 0
                    })
                });
                console.log(tmp_data, 'tmp_data');
                const newSort = tmp_data.sort(function (a, b) {
                    return a.pr_transport - b.pr_transport;
                });
                dispatch(get_job_details_state({
                    job_details: newSort
                }))
            } else if (params === 3) {
                let tmp_data = []
                sortItems.forEach(element => {
                    tmp_data.push({
                        ...element,
                        f_transport: hasValue(element?.routes ?? "") && element.routes.length > 0 ? element.routes.length : 0
                    })
                });
                const newSort = tmp_data.sort(function (a, b) {
                    return b.f_transport - a.f_transport;
                });
                dispatch(get_job_details_state({
                    job_details: newSort
                }))
            } else if (params === 4) {
                let tmp_data = []
                sortItems.forEach(element => {
                    let item = element
                    if (item.type === "MULTI") {
                        item = element?.routes[1] ?? {}
                    }
                    tmp_data.push({
                        ...element,
                        du_transport: hasValue(item?.distance ?? "") ? parseInt(item.distance) : 0
                    })
                });
                const newSort = tmp_data.sort(function (a, b) {
                    return a.du_transport - b.du_transport;
                });
                dispatch(get_job_details_state({
                    job_details: newSort
                }))
            }
        } catch (error) {
            console.log(error);
        }
    }
    const filter_data = [
        {
            value: 1,
            label: STR.strings.arrival_time
        },
        {
            value: 2,
            label: STR.strings.price
        },
        {
            value: 3,
            label: STR.strings.number_of_transits
        },
        {
            value: 4,
            label: STR.strings.duration
        }
    ]

    return (
        <Modal
            transparent={true}
            supportedOrientations={['portrait', 'landscape']}
            visible={true}
            animationType='fade'
            onRequestClose={() => onCloseFilter()}>
            <View style={[WT('100%'), HT('100%'), C.bgTPL, L.jcB]}>
                <View style={[WT('100%'), C.bgScreen, L.aiB, { borderTopLeftRadius: 20, borderTopRightRadius: 20 }]}>
                    <View style={[HT(Platform.OS == 'ios' ? '5%' : '0%'), WT('100%')]} />
                    <View style={[WT(50), HT(5), L.asC, C.bgVLGray, L.bR30, L.mT6]} />
                    <View style={[WT('100%'), HT(50)]}>
                        <View style={[WT('100%'), HT('100%'), L.pH15, L.even, L.aiC, L.jcSB]}>
                            <View style={[L.f1, L.jcC, L.aiL]}>
                                <Text style={[F.fsOne6, F.ffM, C.fcBlack]}>{STR.strings.sort_by}</Text>
                            </View>
                            <View style={[L.f1, L.jcC, L.aiR]}>
                                <TouchableOpacity style={[WT(60), HT(45), L.jcC, L.aiR]}
                                    onPress={() => onCloseFilter()}>
                                    <Icon name={"close"} size={25} color={C.black} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={[WT('100%'), HT(1), C.bgLGray]} />
                    <FlatList
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, index) => String(index)}
                        data={filter_data}
                        contentContainerStyle={[{ paddingBottom: h(1) }]}
                        renderItem={({ item, index }) => {
                            return (
                                <View key={index} style={[WTD(100), L.jcC, L.aiC]}>
                                    <TouchableOpacity style={[L.even, L.aiC, WT('90%'), L.jcSB, L.mV10]} onPress={() => onSelectFilter(item.value)}>
                                        <Text style={[F.fsOne6, selected_sort == item.value ? F.ffB : F.ffM, selected_sort == item.value ? C.fcBlack : C.lColor]}>{item.label}</Text>
                                        <Icon name={"check-bold"} size={22} color={selected_sort == item.value ? C.black : C.white} />
                                    </TouchableOpacity>
                                </View>
                            )
                        }}
                    />
                    {/* <View style={[C.bgWhite, WT('100%'), HT(Platform.OS == 'ios' ? 65 : 55), L.card, L.br1, C.brLightest, L.jcC, L.dpARL]}>
                    <View style={[L.even, L.aiC, L.jcSB, WT('90%'), L.asC]}>
                        <View style={[WT('20%'), HT(35)]} />
                        <TouchableOpacity style={[WT('35%'), HT(30), L.aiC, L.jcC, C.bgWhite, L.br05, C.brLightGray, L.even, L.bR30]}
                            onPress={() => onClearFilter()}>
                            <Text style={[F.fsOne6, F.ffM, C.fcBlack, L.mH5]}>{STR.strings.clear_all}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[WT('35%'), HT(30), L.aiC, L.jcC, C.bgPrimary, L.even, L.bR30]}
                            onPress={() => onApplyFilter()}>
                            <Text style={[F.fsOne6, F.ffM, C.fcWhite, L.mH5]}>{STR.strings.apply_filter}</Text>
                        </TouchableOpacity>
                    </View>
                </View> */}
                </View>
            </View>
        </Modal>
    );
}

export default FilterComponent
