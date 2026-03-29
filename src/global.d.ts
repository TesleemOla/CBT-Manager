declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
    [key: string]: string | undefined;
  }
}

declare let process: {
  env: NodeJS.ProcessEnv;
};
