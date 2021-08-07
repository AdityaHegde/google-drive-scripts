import {Auth} from "./Auth";
import {GoogleDrive} from "./drive/GoogleDrive";
import {waitForMS} from "./waitForMS";
import {BatchAction} from "./BatchAction";

const SCOPES = ["https://www.googleapis.com/auth/drive"];
const SOURCE = "1f8RtmcxGDgp_0MMjrlosIWdhRQ_qWmAP";
const TARGET = "1xP6HrFdFwMLmWj5w_brljMB7quCGGn-8";

const BATCH_SIZE = 3;
const BATCH_TIME_WINDOW = 1050;

(async () => {
  try {
    const auth = new Auth(SCOPES);
    const batchAction = new BatchAction(BATCH_SIZE, BATCH_TIME_WINDOW);
    const drive = new GoogleDrive(await auth.getAuth());

    const files = await drive.getFiles(`'${SOURCE}' in parents`);
    console.log("Got files. Waiting for API window.");
    await waitForMS(5 * BATCH_TIME_WINDOW);

    await batchAction.exec(files, file => drive.copyFile(file, TARGET));
  } catch (err) {
    console.log(err);
  }
})();
