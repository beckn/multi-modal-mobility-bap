import React from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native'
import { C } from '../../commonStyles/style-layout';
import { hasValue } from '../../Utils';

const Loader = (props) => {
    return <ActivityIndicator animating={props.isLoading} style={styles.container} size='large' color={hasValue(props.loaderColor) ? props.loaderColor : C.blue} />
};
export default Loader;

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
});
