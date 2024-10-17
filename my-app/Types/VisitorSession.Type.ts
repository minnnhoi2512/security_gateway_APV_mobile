export interface VisitorSessionType {
    visitorSessionId: number
    checkinTime: string
    checkoutTime: any
    qrCardId: number
    visitDetailId: number
    securityIn: SecurityIn
    securityOut: any
    gateIn: GateIn
    gateOut: any
    status: string
    images: Image[]
  }
  export interface SecurityIn {
    userId: number
    fullName: string
    phoneNumber: string
  }
  
  export interface GateIn {
    gateId: number
    gateName: string
  }
  
  export interface Image {
    visitorSessionsImageId: number
    imageType: string
    imageURL: string
  }
  