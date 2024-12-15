import { View, Text, TouchableOpacity, Image, Modal } from "react-native";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import VisitStaffCreate from "@/Types/VisitStaffCreate.Type";
import VisitDetailType from "@/Types/VisitDetailCreate.Type";
import { setVisitStaffCreate } from "@/redux/slices/visitStaffCreate.slice";
import { Ionicons } from "@expo/vector-icons";
import ImageViewer from 'react-native-image-zoom-viewer';

const VistorInforModal: React.FC<{ visitor: any, onClose: () => void }> = ({ visitor, onClose }) => {
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  var visitCreateData = useSelector<any>(
    (s) => s.visitStaff.data
  ) as VisitStaffCreate;
  const dispatch = useDispatch();
  const handleAddVisitor = () => {
    var oldItem = [...visitCreateData.visitDetail];
    var newItem: VisitDetailType = { 
      expectedEndHour: oldItem[0].expectedEndHour,
      expectedStartHour: oldItem[0].expectedStartHour,
      visitorId: visitor.visitorId,
      visitorCompany: visitor.companyName,
      visitorName: visitor.visitorName,
      visitorImage: visitor.visitorImage[0].imageURL,
    };
    console.log(visitor.visitorImage[0].imageURL);
    if (!oldItem.find((s) => s.visitorId === visitor.visitorId)) {
      oldItem.push(newItem);
    }
    visitCreateData = { 
      ...visitCreateData,
      visitDetail: oldItem,
    };
    dispatch(setVisitStaffCreate(visitCreateData));
    onClose();
  };
  // console.log(visitor);
  return (
    <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 20, margin: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }}>
      <View style={{ borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 10, marginBottom: 10 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ff6600' }}>{visitor.visitorName}</Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Ionicons name="business" size={20} color="#2ecc71" />
          <Text style={{ fontSize: 18, color: '#2ecc71', marginLeft: 10 }}>Công ty: {visitor.companyName}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Ionicons name="call" size={20} color="#2ecc71" />
          <Text style={{ fontSize: 18, color: '#2ecc71', marginLeft: 10 }}>Số điện thoại: {visitor.phoneNumber}</Text>
        </View>
        {visitor.visitorImage && visitor.visitorImage.length > 0 && (
          <TouchableOpacity onPress={() => setImageViewerVisible(true)}>
            <Image
              style={{ width: 200, height: 200, marginTop: 20, alignSelf: 'center' }}
              source={{ uri: `data:image/png;base64,${visitor.visitorImage[0].imageURL}` }}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity style={{ backgroundColor: '#f39c12', padding: 10, borderRadius: 10 }} onPress={onClose}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: '#3498db', padding: 10, borderRadius: 10 }} onPress={handleAddVisitor}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Xác nhận</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isImageViewerVisible} transparent={true}>
        <ImageViewer
          imageUrls={[{ url: `data:image/png;base64,${visitor.visitorImage[0].imageURL}` }]}
          onCancel={() => setImageViewerVisible(false)}
          enableSwipeDown={true}
        />
      </Modal>
    </View>
  );
};

export default VistorInforModal;