import React, { Component } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { L, F, C, HT, WT } from '../../commonStyles/style-layout';
import { hasValue } from '../../Utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const Button = (props) => {
    let { label, activeOpacity, style, txtStyle, icon_right, icon_left } = props;
    return (
        <TouchableOpacity activeOpacity={hasValue(activeOpacity) ? activeOpacity : 0.6}  {...props}
            style={[HT(45), WT('80%'), C.bgBlack, L.asC, L.jcC, L.aiC, L.bR4, L.even, L.card, style]}>
            {hasValue(icon_left) && <>
                <Icon name={icon_left} size={22} color={C.white} />
                <View style={[WT(20)]} />
            </>}
            <Text style={[C.fcWhite, F.ffB, F.fsOne9, L.taC, txtStyle]}>{label}</Text>
            {hasValue(icon_right) && <> <View style={[WT(20)]} /> <Icon name={icon_left} size={22} color={C.white} />
            </>}
        </TouchableOpacity>
    )
}
export default Button;