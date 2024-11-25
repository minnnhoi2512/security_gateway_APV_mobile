export interface CheckOutVerWithLP {
  securityOutId: number;
  gateOutId: number;
  vehicleSession: {
    licensePlate: string;
    vehicleImages: Array<{
      imageType: string;
      imageURL: string;
      // image: string;
    }>;
  };
}

export interface CheckOut {
  securityOutId: number;
  gateOutId: number;
}
