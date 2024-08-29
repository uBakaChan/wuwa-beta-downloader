export interface CDN {
    K1: number;
    K2: number;
    P: number;
    url: string;
  }
  
  export interface ChangeLog {
    "zh-Hans": string;
  }
  
  export interface GameInfo {
    fileName: string;
    md5: string;
    version: string;
  }
  
  export interface ResourcesDiff {
    currentGameInfo: GameInfo;
    previousGameInfo: GameInfo;
  }
  
  export interface RHIOption {
    cmdOption: string;
    isShow: number;
    text: { [key: string]: string };
  }
  
  export interface BasicResponse {
    hashCacheCheckAccSwitch: number;
    default: {
      cdnList: CDN[];
      changelog: ChangeLog;
      changelogVisible: number;
      resources: string;
      resourcesBasePath: string;
      resourcesDiff: ResourcesDiff;
      resourcesExcludePath: string[];
      resourcesExcludePathNeedUpdate: string[];
      sampleHashSwitch: number;
      version: string;
    };
    predownloadSwitch: number;
    RHIOptionSwitch: number;
    RHIOptionList: RHIOption[];
    resourcesLogin: {
      host: string;
      loginSwitch: number;
    };
  }

  export interface Resource {
    dest: string;
    md5: string;
    sampleHash: string;
    size: number;
}

export interface SampleHashInfo {
    sampleNum: number;
    sampleBlockMaxSize: number;
}

export interface ResourceResponse {
    resource: Resource[];
    sampleHashInfo: SampleHashInfo;
}