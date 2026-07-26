export interface BlazeFixRewrite {
  before: string;
  after: string;
}

export interface BlazeFixCopyBlock extends BlazeFixRewrite {
  label: string;
}

export interface BlazeFix {
  headline: BlazeFixRewrite;
  subtitle: BlazeFixRewrite;
  cta: BlazeFixRewrite;
  copyBlocks: BlazeFixCopyBlock[];
  createdAt: string;
}
