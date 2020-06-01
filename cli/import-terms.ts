import { bootstrapDi } from 'src/bootstrap';
import { TermsService } from 'src/Services/TermsService';

// console.log('hello world');
/* eslint-disable @typescript-eslint/no-floating-promises */
(async () => {
    const container = await bootstrapDi();
    const termsService = container.get(TermsService);
})();
