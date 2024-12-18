import {
  View,
  Text,
  Image,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Entypo, Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGetUserNotificationQuery } from "@/redux/services/notificationApi.service";
import { useRouter } from "expo-router";
import NotificationUserType from "@/redux/Types/notification.type";
import { useDispatch, useSelector } from "react-redux";
import { reloadNoti } from "@/redux/slices/notification.slice";
import { useGetAllVisitsByCurrentDateByIDQuery } from "@/redux/services/visit.service";

const notification = () => {
  const [userId, setUserID] = useState();
  const router = useRouter();
  const [onClick, setOnClick] = useState(false);
  const [visitId, setVisitId] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: visit,
    isError,
    refetch: refestVisit,
  } = useGetAllVisitsByCurrentDateByIDQuery(visitId);
  const handlePressNotification = (notificationUser: NotificationUserType) => {
    if (notificationUser.notification.notificationType.name == "Visit") {
      setVisitId(notificationUser.notification.action);
      if (onClick == true) {
        setOnClick(false);
      } else {
        setOnClick(true);
      }
      // router.push({
      //   pathname: `/home/VisitDetail`,
      //   params: {

      //     data: JSON.stringify(visit),
      //   },
      // });
    }
  };
  // async function handleNotification() {
  //   await Notifications.scheduleNotificationAsync({
  //     content:{
  //       title:"Test",
  //       body: "hahaha",
  //       data : {},
  //     },
  //     trigger: {
  //     } as any
  //   })
  // }

  useEffect(() => {
    if (visit && !isError) {
      router.push({
        pathname: `/home/VisitDetail`,
        params: {
          data: JSON.stringify(visit[0]),
        },
      });
    }
  }, [visit, onClick]);
  useEffect(() => {
    const checkAuth = async () => {
      const UserId = await AsyncStorage.getItem("userId");
      setUserID(UserId as any);
    };
    checkAuth();
  }, []);
  const {
    data: notifications,
    isLoading,
    error,
    refetch,
  } = useGetUserNotificationQuery(
    userId ? { userID: userId } : { userID: "" },
    {
      skip: !userId,
    }
  );

  const takingNew = useSelector<any>(
    (s) => s.notification.takingNew
  ) as boolean;
  const dispatch = useDispatch();
  useEffect(() => {
    if (notifications != undefined)
      if (notifications?.length > 0 && takingNew) {
        //toast("Bạn có thông báo mới");
        refetch();
      }
    // refetch();
    dispatch(reloadNoti());
  }, [takingNew]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch();

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [refetch]);

  const renderNotification = (notification: NotificationUserType) => (
    <TouchableOpacity
      key={notification.notificationUserID}
      onPress={() => handlePressNotification(notification)}
      className="p-4 border-b border-gray-200 active:bg-gray-50"
    >
      <View className="flex-row space-x-3">
        <Image
          source={{ uri: notification.sender?.image }}
          className="w-8 h-8 rounded-full"
        />
        <View className="flex-1 space-y-1">
          <View className="flex-row flex-wrap">
            <Text className="font-medium">{notification.sender?.fullName}</Text>
            <Text className="text-gray-500 mx-1">
              {notification.notification.action}
            </Text>
            {/* {notification.target && (
              <Text className="font-medium">{notification.target}</Text>
            )} */}
          </View>
          <View className="mt-2 p-2 bg-gray-50 rounded-lg flex-row items-center">
            <View className="flex-1">
              <Text className="text-sm text-gray-600">
                {notification.notification.title}
              </Text>
              <Text className="text-sm text-gray-400">
                {notification.notification.content}
              </Text>
            </View>
          </View>
          {/* {notification.notification.notificationType.name === "Visit" && !notification.notification.title.includes("Check-in") && 
          !notification.notification.title.includes("Check-out")&& !notification.notification.title.includes("vi phạm") && (
            <View className="flex-row space-x-2 mt-2">
              <TouchableOpacity className="bg-blue-600 px-4 py-1 rounded">
                <Text className="text-white text-sm">Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-1 rounded">
                <Text className="text-gray-600 text-sm">Decline</Text>
              </TouchableOpacity>
            </View>
          )} */}

          <Text className="text-sm text-gray-400">
            {notification.notification.sentDate.toString().split("T")[0]}
          </Text>
        </View>

        {notification.readStatus == false && (
          <View className="w-2 h-2 bg-blue-600 rounded-full" />
        )}
      </View>
    </TouchableOpacity>
  );
  return (
    // <View className="flex-1 bg-backgroundApp items-center justify-center px-6">
    //   <View className="items-center">
    //     <Feather name="bell-off" size={80} color="#fff" />
    //     <Text className="text-white text-2xl font-bold mt-6 mb-2">Coming Soon</Text>
    //     <Text className="text-white/70 text-center text-base">
    //       Chức năng thông báo sẽ sớm được cập nhật trong thời gian tới
    //     </Text>
    //   </View>
    // </View>
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200 mt-8">
        <View className="flex-row items-center space-x-2">
          {/* <Feather name="bell-off" size={20} color="#000" /> */}
          <Entypo name="bell" size={20} color="#f1c40f" />
          {/* <Bell size={20} color="#000" /> */}
          <Text className="text-lg font-semibold">Thông báo</Text>
          <View className="bg-blue-100 px-2 py-0.5 rounded-full">
            <Text className="text-blue-900 text-xs font-medium">
              {notifications?.length}
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <Text className="text-2xl text-gray-400">×</Text>
        </TouchableOpacity>
      </View>

      {/* <ScrollView className="flex-1">
        {notifications?.toReversed().map(renderNotification)}
      </ScrollView> */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#34495e", "#34495e"]}
            tintColor="#34495e"
          />
        }
      >
        {notifications?.toReversed().map(renderNotification)}
      </ScrollView>
    </SafeAreaView>
  );
};

export default notification;
