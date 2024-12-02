import * as signalR from '@microsoft/signalr';
import { Dispatch } from 'redux';
// import { setNewNotificationReceived } from '../redux/slice/notificationSlice';
import UserConnectionHubType from '../Types/userConnectionHubType';
import { clearConnection, setConnection } from '../redux/slices/hubConnection.slice';
import { pushNotification } from '../redux/slices/notification.slice';

const SetSignalR = async (
  user : UserConnectionHubType,
  connection: React.MutableRefObject<signalR.HubConnection | null>
  , dispatch: Dispatch
) => {

  if (user) {
    connection.current = new signalR.HubConnectionBuilder()
        .withUrl("https://security-gateway-api.tools.kozow.com/notificationHub", 
        //.withUrl(baseAPI +"/notificationHub", 
      {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets
      })
      .build();

    const startConnection = async () => {
      try {
        await connection.current?.start();
        console.log("Connected to NotificationHub " + connection.current?.connectionId);
        dispatch(setConnection(connection));
        connection.current?.on("ReceiveMessage", (title, message) => {
          // console.log(message)
        //   PushNotification.localNotification({
        //     channelId: "general_notifications",
        //     title: title,
        //     message: message,
        //   });
        //   dispatch(setNewNotificationReceived(true)); // Đánh dấu có thông báo mới được nhận
        });
        connection.current?.on("ReceiveNotification", (title, message, scheduleId) => {
        //   PushNotification.localNotification({
        //     channelId: "general_notifications",
        //     title: title,
        //     message: message,
        //   });
            console.log("New notification")
          // const notiList = JSON.parse(localStorage.getItem("notification") as string) as NotificationType[]
          // if(notiList){
          //   notiList.push(notification)
          //   if(notiList?.length > 10){
          //     notiList.shift()
          //   }
          //   localStorage.setItem("notification", JSON.stringify(notiList)) 
          //   dispatch(pushNotification(notification));
          // }
          // else{
          //   const newList : NotificationType[] = [notification]
          //   localStorage.setItem("notification", JSON.stringify(newList)) 
            dispatch(pushNotification());
          // }
          // console.log(notiList)
        });
        await connection.current?.invoke("JoinHub", user);
      } catch (error) {
        console.error("SignalR Connection Error: ", error);
      }
    };

    startConnection();
    return () => {
      connection.current?.stop().then(() => console.log("Disconnected from NotificationHub"));
    };
  }
};
const DisconnectSignalR = (
  connection: React.MutableRefObject<signalR.HubConnection | null>
  , dispatch: Dispatch
) =>{
  try {
    connection.current?.stop().then(() => console.log("Disconnected from NotificationHub"));
    dispatch(clearConnection())
  } catch (error) {
    console.error("SignalR Disconnection Error: ", error);
  }
}

export default {SetSignalR,DisconnectSignalR};
