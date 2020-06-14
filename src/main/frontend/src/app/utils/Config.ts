export class Config {
  constructor(public readonly debugMode: boolean) {}
}
export let GlobalConfig = new Config(true);

export function debugString(debugMessage: string) {
  if (GlobalConfig.debugMode) {
    console.log(`=== DEBUG: ${debugMessage}`);
  }
}

export function debugObject(object2Debug: any) {
  if (GlobalConfig.debugMode) {
    console.dir(object2Debug);
  }
}
