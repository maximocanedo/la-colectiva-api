export interface IEnterpriseGetValidationsResponse {
    success: boolean,
    status: number,
    message: string,
    inFavorCount?: number,
    againstCount?: number,
    userVote?: boolean,
}
export interface IEnterpriseAddPhoneResponse {
    phones: string[],
    status: number,
    error?: any,
    msg: string
}
export interface IEnterpriseListCommentsResponse {
    comments: any[],
    status: number,
    error?: any,
    msg: string
}
export interface IEnterpriseCommentAddedResponse {
    newComment: any,
    status: number,
    error?: any
}