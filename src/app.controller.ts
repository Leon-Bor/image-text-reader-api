import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { unlinkSync } from 'fs';
import { diskStorage } from 'multer';
import { recognize } from 'node-tesseract-ocr';
import { join } from 'path';
import { v4 } from 'uuid';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('upload')
  getHello(): any {
    return {
      status: 'ok',
    };
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', 'uploads'),
        filename: (req, file, cb) => {
          cb(null, `${v4()}.${file.originalname.split('.').pop()}`);
        },
      }),
      fileFilter: function (req, file, cb) {
        console.log(file.mimetype);
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Wrong on the mimetype'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      const filePath = join(__dirname, '..', 'uploads/') + file.filename;
      const imageText = await new Promise((resolve) => {
        recognize(filePath, {
          lang: 'deu+eng',
        }).then((text) => {
          resolve(text);
        });
      });

      // Delete the file after reding text.
      unlinkSync(filePath);

      return {
        status: 200,
        data: imageText,
      };
    } catch (error) {
      return {
        status: 500,
        error: error.message,
      };
    }
  }
}
