export interface Gate {
    gateId: number;
    gateName: string;
    gateCoordinate: string;
  }

  type CameraType = {
    cameraTypeId: number;
    cameraTypeName: string;
    description: string;
  };
  
  export type Camera = {
    id: number;
    captureURL: string;
    streamURL: string;
    description: string;
    status: boolean;
    gateId: number;
    cameraType: CameraType;
  };
  