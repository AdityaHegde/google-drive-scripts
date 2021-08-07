import {waitForMS} from "./waitForMS";

export class BatchAction {
  private readonly batchSize: number;
  private readonly timeWindow: number;

  public constructor(batchSize: number, timeWindow: number) {
    this.batchSize = batchSize;
    this.timeWindow = timeWindow;
  }

  public async exec<T>(entities: Array<T>, action: (entity: T) => Promise<void>): Promise<void> {
    for (
      let startIdx = 0, endIdx = this.batchSize;
      startIdx < entities.length;
      startIdx = endIdx, endIdx = Math.min(endIdx + this.batchSize)
    ) {
      const startTime = Date.now();

      console.log(`Executing batch from startIdx=${startIdx} endIdx=${endIdx}`);
      await Promise.all(entities.slice(startIdx, endIdx).map(entity => action(entity)));

      const executionTime = Date.now() - startTime;
      if (executionTime < this.timeWindow) {
        await waitForMS(this.timeWindow - executionTime);
      }
    }
  }
}
