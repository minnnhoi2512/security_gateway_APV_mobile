import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface TruncatableTitleProps {
  text: string;
}

const TruncatableTitle: React.FC<TruncatableTitleProps> = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 50;
  const shouldTruncate = text.length > maxLength;

  const displayText = isExpanded ? text : shouldTruncate ? `${text.slice(0, maxLength)}...` : text;

  return (
    <View className="bg-teal-50 rounded-full px-6 py-2 mb-3">
      {shouldTruncate ? (
        <TouchableOpacity 
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
        >
          <Text className="text-2xl font-bold text-teal-600">
            {displayText}
          </Text>
          <Text className="text-sm text-teal-500 mt-1 text-center">
            {isExpanded ? "Thu gọn" : "Xem thêm"}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text className="text-2xl font-bold text-teal-600">
          {text}
        </Text>
      )}
    </View>
  );
};

export default TruncatableTitle;