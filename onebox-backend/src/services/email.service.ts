import { ImapFlow } from 'imapflow';
import { elasticClient } from '../config/elastic';
import { categorizeEmail } from './ai.service';
import util from 'util';
import { simpleParser } from 'mailparser';
import axios from 'axios';

interface Email {
  subject: string;
  sender: string;
  body: string;
  date: Date;
  folder: string;
  account: string;
}

async function sendTestMessage() {
  await axios.post(process.env.slack_webhook_url, {
    text: "Hello! A email was recevied of Intrested category.",
  });
  console.log("Message sent!");
}

async function extractBody(raw: string) {
  try {
    const parsed = await simpleParser(raw);


    const textBody = parsed.text || '';

    const htmlBody = parsed.html || '';

    return {
      text: textBody,
      html: htmlBody,
    };
  } catch (err) {
    console.error('Error parsing email:', err);
    return { text: '', html: '' };
  }
}

async function connectIMAP(user: string, pass: string, host: string, accountName: string, ind: string) {
  const client = new ImapFlow({
    host,
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false,
    socketTimeout: 60000
  });

  await client.connect();
  console.log(`📩 Connected original to IMAP: ${accountName}`);


  let lock = await client.getMailboxLock('INBOX');
  try {
    const since = new Date(Date.now() + 5.5 * 60 * 60 * 1000 - 24*60*60*1000*30);
    for await (let msg of client.fetch({ since }, { envelope: true, source: true })) {
      
      const raw = msg.source?.toString() ?? '';
      const body = await extractBody(raw);
      const emailDateUTC = msg.envelope?.date ?? new Date();

      const emailDateIST = new Date(emailDateUTC.getTime() + 5.5 * 60 * 60 * 1000);
      const email: Email = {
        subject: msg.envelope?.subject ?? '(no subject)',
        sender: msg.envelope?.from?.[0]?.address ?? '(unknown sender)',
        body: body.text,
        date: emailDateIST,
        folder: 'INBOX',
        account: accountName,
      };

      const category = await categorizeEmail(email);


      await elasticClient.index({
        index: ind,
        document: { ...email, category },
      });
            
      console.log("catg--->"+category+"\n")
      console.log(email);
    }
    console.log(`✅ Synced last 30 days for ${accountName} \n`);
  } finally {
    lock.release();
  }


  client.on('exists', async () => {
    console.log(`📥 New email detected in ${accountName}`);
    let lock = await client.getMailboxLock('INBOX');
    try {

        const response = await elasticClient.search({
          index: ind,
          size: 1,
          sort: [{ date: { order: 'desc' } }],
          _source: ['date']
        });
        const lastDateStr = response.hits.hits[0]?._source?.date;
        const lastDate = lastDateStr ? new Date(lastDateStr) : new Date(Date.now() - 24*60*60*1000);

        console.log('⏰ Last indexed email datetime:', lastDate.toISOString());
      let unseenMessages = client.fetch({ seen: false , since: lastDate }, { envelope: true, source: true });
      for await (let msg of unseenMessages) {
        // Only process the first unseen email
        const raw = msg.source?.toString() ?? '';
        const body = await extractBody(raw);
        const emailDateUTC = msg.envelope?.date ?? new Date();
      // Convert to IST
        const emailDateIST = new Date(emailDateUTC.getTime() + 5.5 * 60 * 60 * 1000);
        const email = {
            subject: msg.envelope?.subject ?? '(no subject)',
            sender: msg.envelope?.from?.[0]?.address ?? '(unknown sender)',
            body: body.text,
            date: emailDateIST,
            folder: 'INBOX',
            account: accountName,
        };

        if(lastDate < emailDateIST)
        {
            const category = await categorizeEmail(email);
            await elasticClient.index({
                index: ind,
                document: { ...email, category },
            });
            await sendTestMessage();
        console.log(`✅ Indexed new email from ${email.sender} in ${accountName}`);

        }

      }
    } finally {
      lock.release();
    }
  });
}


export async function initIMAP() {
  await connectIMAP(
    process.env.IMAP_USER1!,
    process.env.IMAP_PASS1!,
    process.env.IMAP_HOST1!,
    'parmar2100m21@gmail.com',
    "emails_parmar2100m21@gmail.com"
  );

  await connectIMAP(
    process.env.IMAP_USER2!,
    process.env.IMAP_PASS2!,
    process.env.IMAP_HOST2!,
    'adityaparmar2003official@gmail.com',
    "emails_adityaparmar2003official@gmail.com"
  );
}
