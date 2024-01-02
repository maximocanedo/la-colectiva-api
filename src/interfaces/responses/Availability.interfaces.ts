export interface IAvailabilityResponseSample {
    success: boolean,
    status: number,
    message: string,
    inFavorCount?: number,
    againstCount?: number,
    userVote?: boolean,
}