import React from 'react';
import { StyleSheet } from 'react-native';
import { C, F, h, w } from './style-layout';

export const CommonStyles = StyleSheet.create({
    headerView: {
        backgroundColor: C.colorPrimary,
        elevation: 3,
        shadowOpacity: 3,
        marginTop: h(1),
        justifyContent: 'center',
        height: 55,
    },
    headerViewTransparent: {
        marginTop: h(1),
        backgroundColor: C.noColor,
        justifyContent: 'center',
        height: 55,
    },
    headerViewChild: {
        backgroundColor: 'transparent',
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'space-between',
    },
    btnLeft: {
        justifyContent: "center",
        height: 50,
        paddingRight: 10,
        paddingLeft: 20,
    },
    btnRight: {
        paddingLeft: 45,
        paddingRight: 15,
        alignItems: 'flex-end'
    },
    headerTitle: {
        color: C.gray700,
        fontSize: F.fsTwo,
        fontFamily: F.mediumFont,
        marginHorizontal: 15,
    },
    headerTitleLover: {
        color: C.white,
        fontSize: F.fsTwo,
        fontFamily: F.mediumFont,
        flex: 9,
        textAlign: 'center',
    },
    imgHead: {
        height: 75,
        width: 45
    },
    menuIconButton1: {
        width: 60,
    },
    menuIconButton: {
        width: 60,
    },
    menuIcon: {
        width: w(5.5),
        height: h(4.5),
        tintColor: C.white
    },
    headerCap: {
        position: 'absolute',
        right: 12
    },
    headerCapPic: {
        width: w(6.6),
        height: h(6.6),
    },
    vwNotfound: {
        marginTop: '50%'
    },
    txtNotFound: {
        marginLeft: 10,
        marginRight: 10,
        color: C.black,
        fontSize: F.fsTwo,
        fontFamily: F.boldFont,
        textAlign: 'center'
    },

    //--- button ---/// 
    btnLong: {
        height: h(8),
        width: '100%',
        borderRadius: 12,
        justifyContent: "center",
        alignSelf: 'center',
        alignItems: "center",
        backgroundColor: C.colorPrimary,
        elevation: 5,
        shadowOpacity: 5,
        shadowColor: C.gray400,
        shadowOffset: { width: 1, height: 1 },
        shadowRadius: 1,
    },
    btnCommonTxt: {
        color: C.white,
        fontSize: F.fsTwo,
        fontFamily: F.boldFont,
    },
    activeOpacity: 0.70
});