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
    // <View>
    //   <Text>{visitor.visitorName}</Text>
    //   <Text>{visitor.visitorId}</Text>
    //   <Text>Nay Hieu style giup nhe</Text>
    //   <View className='w-full justify-center items-center' style={{flexDirection : "row"}}>
    //     <Button title='Hủy'></Button>
    //     <Button onPress={handleAddVisitor} title='Xác Nhận'></Button>
    //   </View>
    // </View>
    <View className="bg-white rounded-lg shadow-lg p-4 mx-4 my-2">
    <View className="space-y-2 mb-4">
      <View className="border-b border-gray-200 pb-2">
        <Text className="text-xl font-bold text-gray-800">{visitor.visitorName}</Text>
      </View>
      
      <View className="space-y-1">
        <View className="flex-row items-center">
          <Text className="text-gray-600 font-medium">ID: </Text>
          <Text className="text-gray-800">{visitor.visitorId}</Text>
        </View>
        
        {visitor.companyName && (
          <View className="flex-row items-center">
            <Text className="text-gray-600 font-medium">Công ty: </Text>
            <Text className="text-gray-800">{visitor.companyName}</Text>
          </View>
        )}
      </View>
    </View>

    <View className="flex-row justify-end space-x-4 pt-2 border-t border-gray-200">
      <View className="w-24">
        <Button 
          title="Hủy"
          color="#6B7280"  
        />
      </View>
      <View className="w-24">
        <Button
          onPress={handleAddVisitor}
          title="Xác nhận"
          color="#2563EB"  
        />
      </View>
    </View>
  </View>
  )
}

export default VistorInforModal