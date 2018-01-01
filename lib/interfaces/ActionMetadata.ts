export interface ActionMetadata {
    requiresGithubToken: boolean;
    usage: string;
    requiredParamCount: number;
    redirect: string; // command to replace with (no parameters are possible)
}
