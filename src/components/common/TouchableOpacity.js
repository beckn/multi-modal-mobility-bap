import React, { Component } from 'react';
import { TouchableOpacity as Button, StyleSheet } from 'react-native';
import { hasValue } from '../../Utils';

const TouchableOpacity = (props) => {
    let { activeOpacity } = props;
    return <Button activeOpacity={hasValue(activeOpacity) ? activeOpacity : 0.6}  {...props} />
}
export default TouchableOpacity
