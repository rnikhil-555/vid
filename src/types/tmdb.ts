import { Shows } from './shows';

export interface TMDBShow extends Shows {}

export interface TMDBResponse {
  page: number;
  results: TMDBShow[];
  total_pages: number;
  total_results: number;
}