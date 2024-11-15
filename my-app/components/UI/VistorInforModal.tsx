import { View, Text, Button } from 'react-native'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import VisitStaffCreate from '@/Types/VisitStaffCreate.Type'
import VisitDetailType from '@/Types/VisitDetailCreate.Type'
import { setVisitStaffCreate } from '@/redux/slices/visitStaffCreate.slice'

const VistorInforModal: React.FC<{visitor : any}> = ({visitor}) => {
  var visitCreateData = useSelector<any>(s => s.visitStaff.data) as VisitStaffCreate
  const dispatch = useDispatch();
  const handleAddVisitor = () =>{
    var oldItem = [...visitCreateData.visitDetail]
    var newItem : VisitDetailType = {
      expectedEndHour : oldItem[0].expectedEndHour,
      expectedStartHour : oldItem[0].expectedStartHour,
      visitorId : visitor.visitorId,
      visitorCompany : visitor.companyName,
      visitorName: visitor.visitorName
    }
    if(!oldItem.find(s => s.visitorId === visitor.visitorId)){
      oldItem.push(newItem)
    }
    visitCreateData = {
      ...visitCreateData,
      visitDetail : oldItem
    }
    dispatch(setVisitStaffCreate(visitCreateData))

  }

  return (
    <View>
      <Text>{visitor.visitorName}</Text>
      <Text>{visitor.visitorId}</Text>
      <Text>Nay Hieu style giup nhe</Text>
      <View className='w-full justify-center items-center' style={{flexDirection : "row"}}>
        <Button title='Hủy'></Button>
        <Button onPress={handleAddVisitor} title='Xác Nhận'></Button>
      </View>
    </View>
  )
}

export default VistorInforModal