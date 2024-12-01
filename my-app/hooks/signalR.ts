import * as signalR from '@microsoft/signalr';
import { Dispatch } from 'redux';
// import { setNewNotificationReceived } from '../redux/slice/notificationSlice';
import UserConnectionHubType from '../Types/userConnectionHubType';
import { clearConnection, setConnection } from '../redux/slices/hubConnection.slice';
import { pushNotification } from '../redux/slices/notification.slice';
import * as Notifications from 'expo-notifications';

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
        });
        connection.current?.on("ReceiveNotification", async (title, message, scheduleId) => {
            console.log("New notification")
            await Notifications.scheduleNotificationAsync({
                  content:{
                    title:  title,
                    body: message,
                    data : {},
                  },
                  trigger: {
                  } as any
                })
            dispatch(pushNotification());
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
