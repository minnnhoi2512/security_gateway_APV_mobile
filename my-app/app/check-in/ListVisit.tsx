import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router'; // Ensure these hooks are available

interface Visit {
  visitDetailId: number;
  expectedStartHour: string;
  expectedEndHour: string;
  status: boolean;
  visitor: {
    visitorId: number;
    visitorName: string;
    companyName: string;
    phoneNumber: string;
    credentialsCard: string;
    visitorCredentialImage: string;
    status: string;
  };
  visit: {
    visitId: number; // Ensure visitId is included here
    visitName: string;
    visitQuantity: number;
    createByname: string | null;
    scheduleTypeName: string;
  };
}

const ListVisit: React.FC = () => {
  const { data: serializedData } = useLocalSearchParams<{ data: string }>();
  const router = useRouter(); // Initialize the router

  // Initialize an empty array for visits
  let data: Visit[] = [];

  // Log the serialized data for debugging
  console.log("Serialized Data:", serializedData);

  // Try to parse the serialized data
  if (serializedData) {
    try {
      data = JSON.parse(serializedData);
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  }

  // Navigate to UserDetail route with visitId
  const handlePress = (visitId: number) => {
    router.push({
      pathname: '/check-in/UserDetail',
      params: { visitId },  
    });
  };

  const handleBackPress = () => {
    router.push({
      pathname: '/(tabs)/Checkin',
    });
  };

  const renderVisit = ({ item }: { item: Visit }) => (
    <TouchableOpacity onPress={() => handlePress(item.visit.visitId)} style={styles.visitContainer}>
      <Text style={styles.visitName}>Tên chuyến thăm: {item.visit.visitName}</Text>
      <Text style={styles.scheduleType}>Loại lịch trình: {item.visit.scheduleTypeName}</Text>
      <Text style={styles.visitorName}>Khách thăm: {item.visitor.visitorName}</Text>
      <Text style={styles.company}>Công ty: {item.visitor.companyName}</Text>
      <Text style={styles.phone}>Số điện thoại: {item.visitor.phoneNumber}</Text>
      <Text style={styles.startHour}>Giờ bắt đầu dự kiến: {item.expectedStartHour}</Text>
      <Text style={styles.endHour}>Giờ kết thúc dự kiến: {item.expectedEndHour}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
      <Text style={styles.backButtonText}>Quay về</Text>
    </TouchableOpacity>

    <FlatList
      data={data}
      keyExtractor={(item) => item.visitDetailId.toString()}
      renderItem={renderVisit}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={<Text style={styles.emptyText}>Không có chuyến thăm nào.</Text>}
    />
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    backgroundColor: '#007BFF', // Change to your preferred color
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  visitContainer: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  visitName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scheduleType: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  visitorName: {
    fontSize: 14,
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    marginBottom: 4,
  },
  startHour: {
    fontSize: 14,
    marginBottom: 4,
  },
  endHour: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default ListVisit;
