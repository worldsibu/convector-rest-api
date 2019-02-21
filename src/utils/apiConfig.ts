import { ApiEnvironment } from "./ApiEnvironment";

export interface ApiConfig
{
  selected: string,
  environments: ApiEnvironment[];
}
