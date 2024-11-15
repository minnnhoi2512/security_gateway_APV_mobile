import VisitDetailType from "./VisitDetailCreate.Type"

type VisitStaffCreate = {
    visitName: string | any,
    visitQuantity: number,
    expectedStartTime: string,
    expectedEndTime: string,
    createById: number,
    description: string,
    responsiblePersonId: number,
    visitDetail: VisitDetailType[]
}
export default VisitStaffCreate