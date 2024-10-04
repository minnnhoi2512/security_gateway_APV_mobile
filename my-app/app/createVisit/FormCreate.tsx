import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';

const FormCreate = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [phone, setPhone] = useState('');
  const [credentialCard, setCredentialCard] = useState('');
  const [company, setCompany] = useState('');

  const handleSubmit = () => {
    console.log('Form submitted');
  };

  return (
    <ScrollView className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      <View className="p-6">
        <Text className="text-3xl font-bold mb-6 text-blue-800 text-center">Create Visit</Text>

        <View className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Name</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700"
              value={name}
              onChangeText={setName}
              placeholder="Enter visit name"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Description</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700"
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              multiline
              numberOfLines={4}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Visitor Name</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700"
              value={visitorName}
              onChangeText={setVisitorName}
              placeholder="Enter visitor name"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Phone</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Credential Card</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700"
              value={credentialCard}
              onChangeText={setCredentialCard}
              placeholder="Enter credential card"
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Company</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700"
              value={company}
              onChangeText={setCompany}
              placeholder="Enter company name"
            />
          </View>

          <TouchableOpacity
            className="bg-blue-600 rounded-lg py-4 px-6 shadow-md"
            onPress={handleSubmit}
          >
            <Text className="text-white text-center font-bold text-lg">Create Visit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default FormCreate;