import * as React from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import { C } from '../../commonStyles/style-layout';

class TextField extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { props } = this;
        return (
            <View style={styles.container}>
                <View>
                    <TextInput
                        style={this.props.style}
                        autoCapitalize="none"
                        {...this.props}
                        autoFocus={this.props.autoFocus}
                        underlineColorAndroid='transparent'
                        onSubmitEditing={() => { this.props }}
                        ref={(input) => props.inputRef && props.inputRef(input)}
                        returnKeyType="done"
                        selectionColor={C.colorPrimary}
                    // placeholderTextColor={C.gray400}
                    />
                </View>
            </View>
        )
    }
}

export default TextField

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: 'transparent'
    }
})