import React, { Component } from 'react';
import {
  View,
  StatusBar,
  TextInput,
  Animated,
  Platform
} from 'react-native'; 

export default class FloatingLabelInput extends Component {
  state = {
    isFocused: false,
  };

  componentWillMount() {
    this._animatedIsFocused = new Animated.Value(this.props.value === '' ? 0 : 1);
  }

  handleFocus = () => {
    const { onFocus } = this.props;
    onFocus();
    this.setState({ isFocused: true })
  }
  handleBlur = () => {
    const { onBlur } = this.props;
    onBlur();
    this.setState({ isFocused: false })
  }

  componentDidUpdate() {
    Animated.timing(this._animatedIsFocused, {
      toValue: (this.state.isFocused || this.props.value !== '') ?
        Platform.OS == 'ios' ? 1.5 : 2 : 0,
      duration: 200,
      useNativeDriver: false
    }).start();
  }

  render() {
    const { label, ...props } = this.props;
    const labelStyle = {
      position: 'absolute',
      left: 2.5,
      top: this._animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [Platform.OS == 'ios' ? 20 : 14.5, 1],
      }),
      fontSize: this._animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [14, 15],
      }),
      // fontWeight: this._animatedIsFocused.interpolate({
      //   inputRange: [0, 1],
      //   outputRange: ['100', 'bold'],
      // }),
      color: this._animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: ['#aaa', '#684F87'],
      }),
    };
    return (
      <View style={{ paddingTop: Platform.OS == 'ios' ? 18 : 0 }}>
        <Animated.Text style={labelStyle}>{label}</Animated.Text>
        <TextInput
          {...props}
          style={this.props.style}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          blurOnSubmit
        />
      </View>
    );
  }
}
