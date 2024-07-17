export enum ROLES {
    Employee = 'Employee',
    ProjectManager = 'ProjectManager',
    HRManager = 'HRManager',
    Administrator = 'Administrator'
}

export enum ACCESSTYPES {
    ReadOnly,
    Add,
    Edit
}

export const APIPORT = 5234
export const APIURL = `http://localhost:${APIPORT}`