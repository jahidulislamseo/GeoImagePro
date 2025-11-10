declare module 'piexifjs' {
  export interface GPSIFD {
    GPSLatitudeRef: number;
    GPSLatitude: number;
    GPSLongitudeRef: number;
    GPSLongitude: number;
  }

  export interface ImageIFD {
    Artist: number;
    Copyright: number;
    ImageDescription: number;
    DocumentName: number;
    XPKeywords: number;
    XPTitle: number;
    XPComment: number;
    XPSubject: number;
  }

  export interface ExifIFD {
    UserComment: number;
  }

  export const GPSIFD: GPSIFD;
  export const ImageIFD: ImageIFD;
  export const ExifIFD: ExifIFD;

  export function load(data: string): any;
  export function dump(exifObj: any): string;
  export function insert(exifBytes: string, data: string): string;
}
