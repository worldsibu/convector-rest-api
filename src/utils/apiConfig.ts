import { ApiEnvironment } from "./apiEnvironment";

export interface ApiConfig
{
  selected: string,
  environments: ApiEnvironment[];
}
