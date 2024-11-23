export type Format = {
    qualityLabel: string,
    url: string,
    itag?: number
}

export type ThumbnailFormat = {
    url: string,
    height: number,
    width: number
}

export interface MP4Type {
    title: string,
    thumbnail: ThumbnailFormat[],
    formats: Format[]
}