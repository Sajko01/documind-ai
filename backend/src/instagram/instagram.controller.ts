// import { Controller, Get, Post, Query, Body, Res, HttpStatus } from '@nestjs/common';
// import type { Response } from 'express';
// import { InstagramService } from './instagram.service';

// @Controller('webhooks/instagram')
// export class InstagramController {
//   constructor(private readonly instagramService: InstagramService) {}

//   // 1. GET metoda - Meta poziva ovo da verifikuje tvoj Webhook URL
//   @Get()
//   verifyWebhook(@Query() query: any, @Res() res: Response) {
//     const mode = query['hub.mode'];
//     const token = query['hub.verify_token'];
//     const challenge = query['hub.challenge'];

//     const verifyToken = process.env.INSTAGRAM_VERIFY_TOKEN || 'moj_tajni_token_123';

//     if (mode && token) {
//       if (mode === 'subscribe' && token === verifyToken) {
//         console.log('✅ WEBHOOK_VERIFIED: Instagram webhook je uspešno verifikovan!');
//         return res.status(HttpStatus.OK).send(challenge);
//       } else {
//         return res.sendStatus(HttpStatus.FORBIDDEN);
//       }
//     }
//     return res.sendStatus(HttpStatus.BAD_REQUEST);
//   }

//   // 2. POST metoda - Meta ovde šalje poruke
//   @Post()
//   async receiveMessage(@Body() body: any, @Res() res: Response) {
//     console.log('📩 [Instagram Webhook] Primljen payload:', JSON.stringify(body, null, 2));

//     // Meta zahteva da odmah vratiš status 200 OK
//     res.status(HttpStatus.OK).send('EVENT_RECEIVED');

//     try {
//       await this.instagramService.processIncomingEvent(body);
//     } catch (error) {
//       console.error('❌ Greška prilikom obrade Instagram poruke:', error);
//     }
//   }
// }