export interface Gate {
    gateId: number;
    gateName: string;
    gateCoordinate: string;
  }

  // type CameraType = {
  //   cameraTypeId: number;
  //   cameraTypeName: string;
  //   description: string;
  // };
  
  // export type Camera = {
  //   id: number;
  //   captureURL: string;
  //   streamURL: string;
  //   description: string;
  //   status: boolean;
  //   gateId: number;
  //   cameraType: CameraType;
  // };

  // Define CameraType
interface CameraType {
  cameraTypeId: number;
  cameraTypeName: string;
  description: string;
}

// Define Camera
export interface Camera {
  id: number;
  cameraURL: string;
  description: string;
  status: boolean;
  gateId: number;
  cameraType: CameraType;
}

// Define Gate
export interface GateCamera {
  gateId: number;
  gateName: string;
  createDate: string;
  description: string;
  status: boolean;
  cameras: Camera[];
}

  