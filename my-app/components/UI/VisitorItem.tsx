import { View, Text, Image, TextInput } from 'react-native'
import React from 'react'
import { useGetVisitorByIdQuery } from '@/redux/services/visitor.service';

const VisitorItem: React.FC<{visitor : any}> = ({visitor}) => {
    console.log(visitor)
    return (
        <View className='w-full h-[170px] border-2 border-slate-200 rounded-lg mb-4'>
            <View className='h-[50%]' style={{ flexDirection: "row" }}>
                <View className='h-full w-[25%] '>
                    <Image
                        source={{ uri: "https://static1.colliderimages.com/wordpress/wp-content/uploads/2021/08/mgidarccontentnickcomc008fa9d_d0.jpg?q=70&fit=crop&w=1140&h=&dpr=1" }}
                        className="w-16 h-16 rounded-full ml-5 mt-3 bg-white border-2 border-slate-600"
                    />
                </View>
                <View className='h-full w-[50%]'>
                    <View className='mt-4 ml-2'>
                        <Text className='font-bold text-l'>{visitor.visitorName}</Text>
                        <Text className='text-gray-400'>{visitor.visitorCompany}</Text>
                    </View>
                </View>
                <View className='w-[25%] items-center justify-center'>
                    <View className='mb-5 bg-yellow-100 p-2 rounded-lg'>
                        <Text className='text-yellow-500'>
                            Verified
                        </Text>
                    </View>
                </View>
            </View>
            <View className='h-[50%] border-t-2 border-t-slate-400' style={{ flexDirection: "row" }}>
                <View className='h-full w-[50%] border-r-2 border-r-slate-400'>
                    <View className='h-[10%]'></View>
                    <View className='h-[50%] w-full items-center'>
                        <View className='border-2 border-green-600 rounded-full px-1'>
                            <Text className='text-lg text-green-800'>Giờ Vào</Text>
                        </View>
                        <TextInput className='text-lg text-green-900' value={visitor.expectedStartHour} />
                    </View>
                    
                </View>
                <View className='h-full w-[50%]'>
                    <View className='h-[10%]'></View>
                    <View className='h-[50%] w-full items-center'>
                        <View className= 'border-2 border-red-600 rounded-full px-1'>
                            <Text className='text-lg text-red-700'>Giờ Ra</Text>
                        </View>
                        <TextInput className='text-lg' value={visitor.expectedEndHour} />
                    </View>

                </View>
            </View>
        </View>
    )
}

export default VisitorItem