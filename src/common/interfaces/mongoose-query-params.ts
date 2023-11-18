import { PopulateOptions } from 'mongoose';

export interface FindMany {
  search?: string;
  sort?: string | string[];
  populate?: Array<string | PopulateOptions>;
  offset?: number;
  limit?: number;
  page?: number;
}

export interface FindOne {
  search?: string;
  populate?: Array<string | PopulateOptions>;
}
