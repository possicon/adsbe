import { Injectable } from '@nestjs/common';

const ImageKit = require('imagekit');
@Injectable()
export class ImageKitServiceAuth {
  private imagekit: ImageKit;

  constructor() {
    this.imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }
}
