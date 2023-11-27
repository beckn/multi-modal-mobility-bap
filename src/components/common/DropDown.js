import React from 'react';
import { View } from 'react-native';
import { L, F, C, WT, HT } from '../../commonStyles/style-layout';
import { Dropdown } from 'react-native-element-dropdown';
import { hasValue } from '../../Utils';

export const DropDown = (props) => {
    let { maxHeight } = props;
    return (
        <View>
            <Dropdown
                style={[]}
                placeholderStyle={[F.fsOne7, C.pColor, F.ffM]}
                selectedTextStyle={[F.fsOne7, C.lColor, F.ffM]}
                iconStyle={[WT(20), HT(23)]}
                iconColor={C.gray500}
                maxHeight={hasValue(maxHeight) ? maxHeight : 150}
                {...props}
            />
        </View>

    )
}
export default DropDown;