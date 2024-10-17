import { View, Text, GestureResponderEvent, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import React from 'react';

interface ButtonSingleTextGreenProps {
    text: string;
    onPress: (event: GestureResponderEvent) => void;
    width?: number; 
    height?: number; 
}

const ButtonSingleTextMainColor: React.FC<ButtonSingleTextGreenProps> = ({
    text,
    onPress,
    width = undefined, 
    height = undefined, 
}) => {
    return (
        <TouchableOpacity
            className='bg-backgroundApp rounded-md items-center justify-center' 
            style={{ width: width, height: height } as StyleProp<ViewStyle>}
            onPress={onPress}
        >
            <Text className='text-white text-lg font-bold text-center'>
                {text}
            </Text>
        </TouchableOpacity>
    );
};

export default ButtonSingleTextMainColor;
