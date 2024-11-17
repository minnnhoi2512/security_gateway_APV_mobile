import React from "react";
import { View } from "react-native";
import { useToast } from "./ToastContext";
import { Toast } from "./Toast";

export const ToastContainer = () => {
  const { toasts, hideToast } = useToast();

  return (
    <View className="absolute top-0 left-0 right-0 z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onHide={() => hideToast(toast.id)}
        />
      ))}
    </View>
  );
};
