import {readFile, writeFile} from "fs/promises";
import {google} from "googleapis";
import readline from "readline";
import {OAuth2Client} from "google-auth-library/build/src/auth/oauth2client";

const TOKEN_PATH = "keys/token.json";
const CREDENTIALS_PATH = "keys/credentials.json";

export class Auth {
  private readonly scopes: Array<string>;

  public constructor(scopes: Array<string>) {
    this.scopes = scopes;
  }

  public async getAuth(): Promise<OAuth2Client> {
    const credentials = await readFile(CREDENTIALS_PATH);
    return this.authorize(JSON.parse(credentials.toString()));
  }

  private async authorize(credentials) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    try {
      const token = await readFile(TOKEN_PATH);
      oAuth2Client.setCredentials(JSON.parse(token.toString()));
      return oAuth2Client;
    } catch (err) {
      return this.getAccessToken(oAuth2Client);
    }
  }

  private async getAccessToken(oAuth2Client: OAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: this.scopes,
    });
    const code = await this.getTokenFromUser(authUrl);

    const token = await new Promise((resolve, reject) => {
      oAuth2Client.getToken(code, (err, token) => {
        if (err) reject(err);
        else resolve(token)
      });
    });

    oAuth2Client.setCredentials(token);
    await writeFile(TOKEN_PATH, JSON.stringify(token));
    return oAuth2Client;
  }

  private async getTokenFromUser(authUrl: string): Promise<string> {
    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    // get code from url as input
    const code = await new Promise((resolve) => {
      rl.question("Enter the code from that page here: ", resolve);
    });
    rl.close();
    return code as string;
  }
}
