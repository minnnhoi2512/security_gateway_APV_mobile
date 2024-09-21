import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

const StartPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Thêm trạng thái loading

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('authToken');
      setIsAuthenticated(!!token); // Nếu có token thì coi như đã đăng nhập
      setLoading(false); // Đặt trạng thái loading thành false khi kiểm tra xong
    };
    checkAuth();
  }, []);

  if (loading) {
    return null; // Hoặc có thể hiển thị màn hình loading trong khi kiểm tra trạng thái
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)" />;
};

export default StartPage;
