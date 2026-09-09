// import { Injectable, Logger } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { firstValueFrom } from 'rxjs';

// @Injectable()
// export class InstagramService {
//   private readonly logger = new Logger(InstagramService.name);

//   constructor(private readonly httpService: HttpService) {}

//   async processIncomingEvent(body: any) {
//     this.logger.log(`📥 Obrada dolaznog eventa...`);

//     if (body.object === 'instagram') {
//       if (body.entry && Array.isArray(body.entry)) {
//         for (const entry of body.entry) {
          
//           // 1. PROVERA ZA LIVE PORUKE (Standardni Webhook format)
//           if (entry.messaging && Array.isArray(entry.messaging)) {
//             for (const messagingEvent of entry.messaging) {
//               const senderId = messagingEvent.sender?.id;
//               const messageText = messagingEvent.message?.text;

//               if (senderId && messageText) {
//                 this.logger.log(`💬 Instagram poruka (Live) od (${senderId}): "${messageText}"`);
//                 await this.handleUserMessage(senderId, messageText);
//               }
//             }
//           }

//           // 2. PROVERA ZA TEST PAYLOAD IZ META PANELA ("Test" dugme)
//           if (entry.changes && Array.isArray(entry.changes)) {
//             for (const change of entry.changes) {
//               if (change.field === 'messages' && change.value) {
//                 const senderId = change.value.sender?.id;
//                 const messageText = change.value.message?.text;

//                 if (senderId && messageText) {
//                   this.logger.log(`🧪 Instagram poruka (Test panel) od (${senderId}): "${messageText}"`);
//                   await this.handleUserMessage(senderId, messageText);
//                 }
//               }
//             }
//           }

//         }
//       }
//     }
//   }

//  private async handleUserMessage(senderId: string, messageText: string) {
//     this.logger.log(`🤖 Pokrećem obradu za korisnika ${senderId}...`);

//     try {
//       // TODO: Ovde pozivaš svoj RAG servis (bazu znanja / LLM)
//       const aiResponse = `Pozdrav! Odgovor na vaše pitanje "${messageText}" biće uskoro integrisan iz naše baze znanja.`;

//       await this.sendInstagramMessage(senderId, aiResponse);
//     } catch (error: any) { // Dodato ": any" ili proveravanje ispod
//       this.logger.error(`❌ Greška u handleUserMessage: ${error.message}`);
//     }
//   }

//   private async sendInstagramMessage(
//   recipientId: string,
//   textResponse: string,
// ) {
//   // const accessToken = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;

// const accessToken="IGAAXdEZADC8AdBZAFowTUZAvTXJqdDZA5NDVOMF9STWdIdnZAaQ2ZAPMFJQNlVtdzN3QWV4blRPdVJ4MERkWjNKUEtsUTdNeFNtajJUT29aeWk5OU5iU0NRdzVRREVrS2pOSktieGtOMGUwV25fU0NIZA0w5M2VmWGk1ZATk0TENPbVJfVQZDZD"

//     if (!accessToken) {
//     throw new Error(
//       'INSTAGRAM_PAGE_ACCESS_TOKEN nije postavljen!',
//     );
//   }
//   console.log(accessToken)

// const url = `https://graph.instagram.com/v26.0/me/messages`;

//   try {
//     const payload = {
//       recipient: {
//         id: recipientId,
//       },
//       message: {
//         text: textResponse,
//       },
//     };

//     await firstValueFrom(
//       this.httpService.post(url, payload, {
//         params: {
//           access_token: accessToken,
//         },
//       }),
//     );

//     this.logger.log(
//       `📤 Odgovor uspešno poslat korisniku ${recipientId}`,
//     );
//   } catch (error: any) {
//     const errorMsg = error.response?.data
//       ? JSON.stringify(error.response.data)
//       : error.message;

//     this.logger.error(
//       `❌ Greška pri slanju Instagram poruke: ${errorMsg}`,
//     );
//   }
// }
// }