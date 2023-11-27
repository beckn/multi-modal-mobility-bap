import * as React from 'react';
import { StackActions } from '@react-navigation/native';
import { NavigationActions } from '@react-navigation/compat';

export const navigationRef = React.createRef();

export function navigate(name, params) {
	navigationRef.current?.navigate(name, params);
}
 
export function setParams(params) {
	navigationRef.current?.setParams(params)
}

export function setTopLevelNavigator(navigatorRef) {
	NavigationActions.popToTop()
}

export function goBack() {
	navigationRef.current.dispatch(StackActions.pop(1))
}

export function replace(name, params) {
	navigationRef.current.dispatch(StackActions.replace(name, params))
} 

export default {
	setTopLevelNavigator,
	setParams,
	navigate,
	replace,
	goBack
};