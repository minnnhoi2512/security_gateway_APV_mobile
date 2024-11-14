import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Button, TextInput } from 'react-native'
import React, { useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import CreateVisitorForStaff from './createVisitorForStaff'
import VisitorItem from '@/components/UI/VisitorItem'
import { useGetVisitorByCreadentialCardQuery } from '@/redux/services/visitor.service'
import VistorInforModal from '@/components/UI/VistorInforModal'


const CreateVisitDailyForStaffScreen2 = () => {
    const { data } = useLocalSearchParams()
    const [modalStatus, SetModalStatus] = useState(false);
    const [action, SetAction] = useState("");
    const [credentialCardId , SetCredentialCardId] = useState()
    const {
        data: visitData,
        error,
        isLoading,
        isFetching,
      } = useGetVisitorByCreadentialCardQuery(credentialCardId || "", {
        skip: !credentialCardId, refetchOnMountOrArgChange: 2, refetchOnFocus: true
      });

    const openAddVisitorHandler = (type : string) => {
        if (!modalStatus) {
            SetModalStatus(true)
        }
        if(type === "ADD"){
            SetAction("ADD")
        }
        if(type === "FIND"){
            SetAction("FIND")
        }
    }
    const closeAddVisitorHandler = () => {
        if (modalStatus) {
            SetModalStatus(false)
        }
    }
    return (
        <View className="bg-gradient-to-b from-blue-50 to-white px-6 " style={{ width: "100%" }}>
            <View className='h-[40px] inline-block w-full'>
                <View className='flex-1 w-[80%]'>
                    <View className='rounded-full border-2 border-neutral-950 h-full'
                        style={styles.floatBtn}
                    // onPress={openAddVisitorHandler}
                    >
                        <TextInput className='flex-1 w-11/12 rounded-full text-center absolute left-0 top-0 text-white text-xl' maxLength={12} placeholder='Nhập CCCD của khách ....' onChangeText={SetCredentialCardId} placeholderTextColor="White" />
                        <TouchableOpacity className='w-1/5 h-full rounded-full bg-white absolute right-0 items-center justify-center'
                        onPress={() =>openAddVisitorHandler("FIND")}
                        >
                            <Ionicons name="search" color="Black" size={20}></Ionicons>
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity className='w-1/6 right-0 ml- absolute rounded-full h-full bg-white border-2 border-neutral-950 items-center justify-center'
                    onPress={() =>openAddVisitorHandler("ADD")}
                >
                    <View >
                        <Ionicons name="add" color="Black" size={30}></Ionicons>
                    </View>
                </TouchableOpacity>
            </View>
            <Modal
                visible={modalStatus}
                animationType='slide'
                presentationStyle='pageSheet'
            >
                <Button
                    title='Đóng'
                    onPress={closeAddVisitorHandler}
                ></Button>
                {
                    action === "ADD"?(<>
                        <CreateVisitorForStaff/>
                    </>):(<></>)

                }
                                {
                    action === "FIND"?(<>
                        {/* <VistorInforModal /> */}
                    </>):(<></>)

                }
                {/* <CreateVisitorForStaff/> */}
            </Modal>
            <ScrollView
                className='mt-5 h-[95%]'
            >
                <VisitorItem/>
                <VisitorItem/>
                <VisitorItem/>
                <VisitorItem/>
                <VisitorItem/>
            </ScrollView>
        </View>
    )
}
const styles = StyleSheet.create({
    floatBtn: {
        backgroundColor: "grey",
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    }
})

export default CreateVisitDailyForStaffScreen2