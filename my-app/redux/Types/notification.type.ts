type NotificationUserType =
{
  notificationUserID: number;
  readStatus: boolean;
  notificationID: number;
  notification: NotificationType
  sender: SenderType | null,
  receiverID: number
}
type NotificationType = {
    notificationID: number,
    title: string,
    content: string,
    sentDate: Date,
    readDate: Date|null,
    action: string,
    status: boolean,
    notificationType: NotificationKindType 
}
type NotificationKindType = {
    id: number,
    name: string
  }
type SenderType = {
    userId: number,
    fullName: string,
    image: string
}
export default NotificationUserType