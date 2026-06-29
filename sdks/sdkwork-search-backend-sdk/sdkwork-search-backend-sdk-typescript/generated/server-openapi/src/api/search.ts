import { backendApiPath } from './paths';
import type { HttpClient } from '../http/client';

import type { PageInfo, SdkWorkCommandData, SearchAbAssignmentRequest, SearchAbAssignmentResponse, SearchAbExperiment, SearchAbExperimentCreateRequest, SearchAbExperimentResponse, SearchAbExperimentUpdateRequest, SearchAnalyticsOverview, SearchDocumentBulkUpsertRequest, SearchDocumentBulkUpsertResponse, SearchDocumentResponse, SearchDocumentUpsertRequest, SearchEmbeddingJob, SearchEmbeddingJobCreateRequest, SearchEmbeddingJobResponse, SearchIndex, SearchIndexCreateRequest, SearchIndexJobResponse, SearchIndexResponse, SearchIndexUpdateRequest, SearchPromotionAdmin, SearchPromotionAdminResponse, SearchPromotionCreateRequest, SearchPromotionUpdateRequest, SearchProvider, SearchProviderCreateRequest, SearchProviderHealthCheckResponse, SearchProviderResponse, SearchProviderUpdateRequest, SearchRankingProfile, SearchRankingProfileCreateRequest, SearchRankingProfileResponse, SearchRankingProfileUpdateRequest, SearchRebuildJobRequest, SearchRecommendationStrategy, SearchRecommendationStrategyCreateRequest, SearchRecommendationStrategyResponse, SearchRecommendationStrategyUpdateRequest, SearchSynonym, SearchSynonymCreateRequest, SearchSynonymResponse } from '../types';


export class SearchProvidersHealthChecksApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Run a search provider health check. */
  async create(providerId: string): Promise<SearchProviderHealthCheckResponse> {
    return this.client.post<SearchProviderHealthCheckResponse>(backendApiPath(`/search/providers/${serializePathParameter(providerId, { name: 'providerId', style: 'simple', explode: false })}/health_checks`));
  }
}

export interface SearchProvidersListParams {
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchProvidersCreateParams {
  idempotencyKey?: string;
}

export class SearchProvidersApi {
  private client: HttpClient;
  public readonly healthChecks: SearchProvidersHealthChecksApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.healthChecks = new SearchProvidersHealthChecksApi(client);
  }


/** List configured search providers. */
  async list(params?: SearchProvidersListParams): Promise<Record<string, unknown>> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'page', value: params?.page, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.get<Record<string, unknown>>(appendQueryString(backendApiPath(`/search/providers`), query));
  }

/** Create a search provider configuration. */
  async create(body: SearchProviderCreateRequest, params?: SearchProvidersCreateParams): Promise<SearchProviderResponse> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params?.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.post<SearchProviderResponse>(backendApiPath(`/search/providers`), body, undefined, requestHeaders, 'application/json');
  }

/** Update a search provider configuration. */
  async update(providerId: string, body: SearchProviderUpdateRequest): Promise<SearchProviderResponse> {
    return this.client.patch<SearchProviderResponse>(backendApiPath(`/search/providers/${serializePathParameter(providerId, { name: 'providerId', style: 'simple', explode: false })}`), body, undefined, undefined, 'application/json');
  }
}

export class SearchAnalyticsOverviewApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Retrieve search analytics overview. */
  async retrieve(): Promise<SearchAnalyticsOverview> {
    return this.client.get<SearchAnalyticsOverview>(backendApiPath(`/search/analytics/overview`));
  }
}

export class SearchAnalyticsApi {
  private client: HttpClient;
  public readonly overview: SearchAnalyticsOverviewApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.overview = new SearchAnalyticsOverviewApi(client);
  }

}

export interface SearchJobsRebuildCreateParams {
  idempotencyKey?: string;
}

export class SearchJobsRebuildApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Create a search index rebuild job. */
  async create(body: SearchRebuildJobRequest, params?: SearchJobsRebuildCreateParams): Promise<SearchIndexJobResponse> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params?.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.post<SearchIndexJobResponse>(backendApiPath(`/search/jobs/rebuild`), body, undefined, requestHeaders, 'application/json');
  }
}

export class SearchJobsApi {
  private client: HttpClient;
  public readonly rebuild: SearchJobsRebuildApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.rebuild = new SearchJobsRebuildApi(client);
  }

}

export interface SearchAbExperimentsListParams {
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchAbExperimentsCreateParams {
  idempotencyKey?: string;
}

export interface SearchAbExperimentsAssignParams {
  idempotencyKey?: string;
}

export class SearchAbExperimentsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** List search A/B experiments. */
  async list(params?: SearchAbExperimentsListParams): Promise<Record<string, unknown>> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'page', value: params?.page, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.get<Record<string, unknown>>(appendQueryString(backendApiPath(`/search/ab_experiments`), query));
  }

/** Create a search A/B experiment. */
  async create(body: SearchAbExperimentCreateRequest, params?: SearchAbExperimentsCreateParams): Promise<SearchAbExperimentResponse> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params?.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.post<SearchAbExperimentResponse>(backendApiPath(`/search/ab_experiments`), body, undefined, requestHeaders, 'application/json');
  }

/** Update a search A/B experiment. */
  async update(experimentId: string, body: SearchAbExperimentUpdateRequest): Promise<SearchAbExperimentResponse> {
    return this.client.patch<SearchAbExperimentResponse>(backendApiPath(`/search/ab_experiments/${serializePathParameter(experimentId, { name: 'experimentId', style: 'simple', explode: false })}`), body, undefined, undefined, 'application/json');
  }

/** Assign a subject to a search A/B experiment variant. */
  async assign(experimentId: string, body: SearchAbAssignmentRequest, params?: SearchAbExperimentsAssignParams): Promise<SearchAbAssignmentResponse> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params?.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.post<SearchAbAssignmentResponse>(backendApiPath(`/search/ab_experiments/${serializePathParameter(experimentId, { name: 'experimentId', style: 'simple', explode: false })}/assignments`), body, undefined, requestHeaders, 'application/json');
  }
}

export interface SearchEmbeddingJobsListParams {
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchEmbeddingJobsCreateParams {
  idempotencyKey?: string;
}

export class SearchEmbeddingJobsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** List semantic embedding jobs. */
  async list(params?: SearchEmbeddingJobsListParams): Promise<Record<string, unknown>> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'page', value: params?.page, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.get<Record<string, unknown>>(appendQueryString(backendApiPath(`/search/embedding_jobs`), query));
  }

/** Create a semantic embedding job. */
  async create(body: SearchEmbeddingJobCreateRequest, params?: SearchEmbeddingJobsCreateParams): Promise<SearchEmbeddingJobResponse> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params?.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.post<SearchEmbeddingJobResponse>(backendApiPath(`/search/embedding_jobs`), body, undefined, requestHeaders, 'application/json');
  }

/** Retry a semantic embedding job. */
  async retry(jobId: string): Promise<SearchEmbeddingJobResponse> {
    return this.client.post<SearchEmbeddingJobResponse>(backendApiPath(`/search/embedding_jobs/${serializePathParameter(jobId, { name: 'jobId', style: 'simple', explode: false })}/retry`));
  }
}

export interface SearchPromotionsListParams {
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchPromotionsCreateParams {
  idempotencyKey?: string;
}

export class SearchPromotionsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** List search promotions. */
  async list(params?: SearchPromotionsListParams): Promise<Record<string, unknown>> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'page', value: params?.page, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.get<Record<string, unknown>>(appendQueryString(backendApiPath(`/search/promotions`), query));
  }

/** Create a search promotion. */
  async create(body: SearchPromotionCreateRequest, params?: SearchPromotionsCreateParams): Promise<SearchPromotionAdminResponse> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params?.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.post<SearchPromotionAdminResponse>(backendApiPath(`/search/promotions`), body, undefined, requestHeaders, 'application/json');
  }

/** Update a search promotion. */
  async update(promotionId: string, body: SearchPromotionUpdateRequest): Promise<SearchPromotionAdminResponse> {
    return this.client.patch<SearchPromotionAdminResponse>(backendApiPath(`/search/promotions/${serializePathParameter(promotionId, { name: 'promotionId', style: 'simple', explode: false })}`), body, undefined, undefined, 'application/json');
  }

/** Delete a search promotion. */
  async delete(promotionId: string): Promise<SdkWorkCommandData> {
    return this.client.delete<SdkWorkCommandData>(backendApiPath(`/search/promotions/${serializePathParameter(promotionId, { name: 'promotionId', style: 'simple', explode: false })}`));
  }
}

export interface SearchRecommendationStrategiesListParams {
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchRecommendationStrategiesCreateParams {
  idempotencyKey?: string;
}

export class SearchRecommendationStrategiesApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** List search recommendation strategies. */
  async list(params?: SearchRecommendationStrategiesListParams): Promise<Record<string, unknown>> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'page', value: params?.page, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.get<Record<string, unknown>>(appendQueryString(backendApiPath(`/search/recommendation_strategies`), query));
  }

/** Create a search recommendation strategy. */
  async create(body: SearchRecommendationStrategyCreateRequest, params?: SearchRecommendationStrategiesCreateParams): Promise<SearchRecommendationStrategyResponse> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params?.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.post<SearchRecommendationStrategyResponse>(backendApiPath(`/search/recommendation_strategies`), body, undefined, requestHeaders, 'application/json');
  }

/** Update a search recommendation strategy. */
  async update(strategyId: string, body: SearchRecommendationStrategyUpdateRequest): Promise<SearchRecommendationStrategyResponse> {
    return this.client.patch<SearchRecommendationStrategyResponse>(backendApiPath(`/search/recommendation_strategies/${serializePathParameter(strategyId, { name: 'strategyId', style: 'simple', explode: false })}`), body, undefined, undefined, 'application/json');
  }
}

export interface SearchRankingProfilesListParams {
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchRankingProfilesCreateParams {
  idempotencyKey?: string;
}

export class SearchRankingProfilesApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** List search ranking profiles. */
  async list(params?: SearchRankingProfilesListParams): Promise<Record<string, unknown>> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'page', value: params?.page, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.get<Record<string, unknown>>(appendQueryString(backendApiPath(`/search/ranking_profiles`), query));
  }

/** Create a search ranking profile. */
  async create(body: SearchRankingProfileCreateRequest, params?: SearchRankingProfilesCreateParams): Promise<SearchRankingProfileResponse> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params?.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.post<SearchRankingProfileResponse>(backendApiPath(`/search/ranking_profiles`), body, undefined, requestHeaders, 'application/json');
  }

/** Update a search ranking profile. */
  async update(profileId: string, body: SearchRankingProfileUpdateRequest): Promise<SearchRankingProfileResponse> {
    return this.client.patch<SearchRankingProfileResponse>(backendApiPath(`/search/ranking_profiles/${serializePathParameter(profileId, { name: 'profileId', style: 'simple', explode: false })}`), body, undefined, undefined, 'application/json');
  }
}

export interface SearchSynonymsListParams {
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchSynonymsCreateParams {
  idempotencyKey?: string;
}

export class SearchSynonymsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** List search synonyms for backend administration. */
  async list(params?: SearchSynonymsListParams): Promise<Record<string, unknown>> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'page', value: params?.page, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.get<Record<string, unknown>>(appendQueryString(backendApiPath(`/search/synonyms`), query));
  }

/** Create a search synonym. */
  async create(body: SearchSynonymCreateRequest, params?: SearchSynonymsCreateParams): Promise<SearchSynonymResponse> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params?.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.post<SearchSynonymResponse>(backendApiPath(`/search/synonyms`), body, undefined, requestHeaders, 'application/json');
  }

/** Delete a search synonym. */
  async delete(synonymId: string): Promise<SdkWorkCommandData> {
    return this.client.delete<SdkWorkCommandData>(backendApiPath(`/search/synonyms/${serializePathParameter(synonymId, { name: 'synonymId', style: 'simple', explode: false })}`));
  }
}

export interface SearchDocumentsBulkUpsertParams {
  idempotencyKey?: string;
}

export class SearchDocumentsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Upsert a document into a search index. */
  async upsert(indexId: string, documentId: string, body: SearchDocumentUpsertRequest): Promise<SearchDocumentResponse> {
    return this.client.put<SearchDocumentResponse>(backendApiPath(`/search/indexes/${serializePathParameter(indexId, { name: 'indexId', style: 'simple', explode: false })}/documents/${serializePathParameter(documentId, { name: 'documentId', style: 'simple', explode: false })}`), body, undefined, undefined, 'application/json');
  }

/** Delete a document from a search index. */
  async delete(indexId: string, documentId: string): Promise<SdkWorkCommandData> {
    return this.client.delete<SdkWorkCommandData>(backendApiPath(`/search/indexes/${serializePathParameter(indexId, { name: 'indexId', style: 'simple', explode: false })}/documents/${serializePathParameter(documentId, { name: 'documentId', style: 'simple', explode: false })}`));
  }

/** Bulk upsert documents into a search index. */
  async bulkUpsert(indexId: string, body: SearchDocumentBulkUpsertRequest, params?: SearchDocumentsBulkUpsertParams): Promise<SearchDocumentBulkUpsertResponse> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params?.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.post<SearchDocumentBulkUpsertResponse>(backendApiPath(`/search/indexes/${serializePathParameter(indexId, { name: 'indexId', style: 'simple', explode: false })}/documents/bulk_upsert`), body, undefined, requestHeaders, 'application/json');
  }
}

export interface SearchIndexesListParams {
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchIndexesCreateParams {
  idempotencyKey?: string;
}

export class SearchIndexesApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** List search indexes for backend administration. */
  async list(params?: SearchIndexesListParams): Promise<Record<string, unknown>> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'page', value: params?.page, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.get<Record<string, unknown>>(appendQueryString(backendApiPath(`/search/indexes`), query));
  }

/** Create a search index. */
  async create(body: SearchIndexCreateRequest, params?: SearchIndexesCreateParams): Promise<SearchIndexResponse> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params?.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.post<SearchIndexResponse>(backendApiPath(`/search/indexes`), body, undefined, requestHeaders, 'application/json');
  }

/** Update a search index. */
  async update(indexId: string, body: SearchIndexUpdateRequest): Promise<SearchIndexResponse> {
    return this.client.patch<SearchIndexResponse>(backendApiPath(`/search/indexes/${serializePathParameter(indexId, { name: 'indexId', style: 'simple', explode: false })}`), body, undefined, undefined, 'application/json');
  }

/** Delete a search index. */
  async delete(indexId: string): Promise<SdkWorkCommandData> {
    return this.client.delete<SdkWorkCommandData>(backendApiPath(`/search/indexes/${serializePathParameter(indexId, { name: 'indexId', style: 'simple', explode: false })}`));
  }
}

export class SearchApi {
  private client: HttpClient;
  public readonly indexes: SearchIndexesApi;
  public readonly documents: SearchDocumentsApi;
  public readonly synonyms: SearchSynonymsApi;
  public readonly rankingProfiles: SearchRankingProfilesApi;
  public readonly recommendationStrategies: SearchRecommendationStrategiesApi;
  public readonly promotions: SearchPromotionsApi;
  public readonly embeddingJobs: SearchEmbeddingJobsApi;
  public readonly abExperiments: SearchAbExperimentsApi;
  public readonly jobs: SearchJobsApi;
  public readonly analytics: SearchAnalyticsApi;
  public readonly providers: SearchProvidersApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.indexes = new SearchIndexesApi(client);
    this.documents = new SearchDocumentsApi(client);
    this.synonyms = new SearchSynonymsApi(client);
    this.rankingProfiles = new SearchRankingProfilesApi(client);
    this.recommendationStrategies = new SearchRecommendationStrategiesApi(client);
    this.promotions = new SearchPromotionsApi(client);
    this.embeddingJobs = new SearchEmbeddingJobsApi(client);
    this.abExperiments = new SearchAbExperimentsApi(client);
    this.jobs = new SearchJobsApi(client);
    this.analytics = new SearchAnalyticsApi(client);
    this.providers = new SearchProvidersApi(client);
  }

}

export function createSearchApi(client: HttpClient): SearchApi {
  return new SearchApi(client);
}

function appendQueryString(path: string, rawQueryString: string): string {
  const query = rawQueryString.replace(/^\?+/, '');
  if (!query) {
    return path;
  }
  return path.includes('?') ? `${path}&${query}` : `${path}?${query}`;
}

interface PathParameterSpec {
  name: string;
  style: string;
  explode: boolean;
}

function serializePathParameter(value: unknown, spec: PathParameterSpec): string {
  if (value === undefined || value === null) {
    return '';
  }

  const style = spec.style || 'simple';
  if (Array.isArray(value)) {
    return serializePathArray(spec.name, value, style, spec.explode);
  }
  if (typeof value === 'object') {
    return serializePathObject(spec.name, value as Record<string, unknown>, style, spec.explode);
  }
  return pathPrefix(spec.name, style, false) + encodePathValue(serializePathPrimitive(value));
}

function serializePathArray(name: string, values: unknown[], style: string, explode: boolean): string {
  const serialized = values
    .filter((item) => item !== undefined && item !== null)
    .map((item) => encodePathValue(serializePathPrimitive(item)));
  if (serialized.length === 0) {
    return pathPrefix(name, style, false);
  }
  if (style === 'matrix') {
    return explode
      ? serialized.map((item) => `;${name}=${item}`).join('')
      : `;${name}=${serialized.join(',')}`;
  }
  return pathPrefix(name, style, false) + serialized.join(explode ? '.' : ',');
}

function serializePathObject(name: string, value: Record<string, unknown>, style: string, explode: boolean): string {
  const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== null);
  if (entries.length === 0) {
    return pathPrefix(name, style, true);
  }
  if (style === 'matrix') {
    return explode
      ? entries.map(([key, entryValue]) => `;${encodePathValue(key)}=${encodePathValue(serializePathPrimitive(entryValue))}`).join('')
      : `;${name}=${entries.flatMap(([key, entryValue]) => [encodePathValue(key), encodePathValue(serializePathPrimitive(entryValue))]).join(',')}`;
  }
  const serialized = explode
    ? entries.map(([key, entryValue]) => `${encodePathValue(key)}=${encodePathValue(serializePathPrimitive(entryValue))}`).join(style === 'label' ? '.' : ',')
    : entries.flatMap(([key, entryValue]) => [encodePathValue(key), encodePathValue(serializePathPrimitive(entryValue))]).join(',');
  return pathPrefix(name, style, true) + serialized;
}

function pathPrefix(name: string, style: string, _objectValue: boolean): string {
  if (style === 'label') return '.';
  if (style === 'matrix') return `;${name}`;
  return '';
}

function encodePathValue(value: string): string {
  return encodeURIComponent(value);
}

function serializePathPrimitive(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
interface QueryParameterSpec {
  name: string;
  value: unknown;
  style: string;
  explode: boolean;
  allowReserved: boolean;
  contentType?: string;
}

function buildQueryString(parameters: QueryParameterSpec[]): string {
  const pairs: string[] = [];
  for (const parameter of parameters) {
    appendSerializedParameter(pairs, parameter);
  }
  return pairs.join('&');
}

function appendSerializedParameter(pairs: string[], parameter: QueryParameterSpec): void {
  if (parameter.value === undefined || parameter.value === null) {
    return;
  }

  if (parameter.contentType) {
    pairs.push(`${encodeQueryComponent(parameter.name)}=${encodeQueryValue(JSON.stringify(parameter.value), parameter.allowReserved)}`);
    return;
  }

  const style = parameter.style || 'form';
  if (style === 'deepObject') {
    appendDeepObjectParameter(pairs, parameter.name, parameter.value, parameter.allowReserved);
    return;
  }

  if (Array.isArray(parameter.value)) {
    appendArrayParameter(pairs, parameter.name, parameter.value, style, parameter.explode, parameter.allowReserved);
    return;
  }

  if (typeof parameter.value === 'object') {
    appendObjectParameter(pairs, parameter.name, parameter.value as Record<string, unknown>, style, parameter.explode, parameter.allowReserved);
    return;
  }

  pairs.push(`${encodeQueryComponent(parameter.name)}=${encodeQueryValue(serializePrimitive(parameter.value), parameter.allowReserved)}`);
}

function appendArrayParameter(
  pairs: string[],
  name: string,
  value: unknown[],
  style: string,
  explode: boolean,
  allowReserved: boolean,
): void {
  const values = value
    .filter((item) => item !== undefined && item !== null)
    .map((item) => serializePrimitive(item));
  if (values.length === 0) {
    return;
  }

  if (style === 'form' && explode) {
    for (const item of values) {
      pairs.push(`${encodeQueryComponent(name)}=${encodeQueryValue(item, allowReserved)}`);
    }
    return;
  }

  pairs.push(`${encodeQueryComponent(name)}=${encodeQueryValue(values.join(','), allowReserved)}`);
}

function appendObjectParameter(
  pairs: string[],
  name: string,
  value: Record<string, unknown>,
  style: string,
  explode: boolean,
  allowReserved: boolean,
): void {
  const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== null);
  if (entries.length === 0) {
    return;
  }

  if (style === 'form' && explode) {
    for (const [key, entryValue] of entries) {
      pairs.push(`${encodeQueryComponent(key)}=${encodeQueryValue(serializePrimitive(entryValue), allowReserved)}`);
    }
    return;
  }

  const serialized = entries.flatMap(([key, entryValue]) => [key, serializePrimitive(entryValue)]).join(',');
  pairs.push(`${encodeQueryComponent(name)}=${encodeQueryValue(serialized, allowReserved)}`);
}

function appendDeepObjectParameter(
  pairs: string[],
  name: string,
  value: unknown,
  allowReserved: boolean,
): void {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    pairs.push(`${encodeQueryComponent(name)}=${encodeQueryValue(serializePrimitive(value), allowReserved)}`);
    return;
  }

  for (const [key, entryValue] of Object.entries(value as Record<string, unknown>)) {
    if (entryValue === undefined || entryValue === null) {
      continue;
    }
    pairs.push(`${encodeQueryComponent(`${name}[${key}]`)}=${encodeQueryValue(serializePrimitive(entryValue), allowReserved)}`);
  }
}

function serializePrimitive(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function encodeQueryComponent(value: string): string {
  return encodeURIComponent(value);
}

function encodeQueryValue(value: string, allowReserved: boolean): string {
  const encoded = encodeURIComponent(value);
  if (!allowReserved) {
    return encoded;
  }
  return encoded.replace(/%3A/gi, ':')
    .replace(/%2F/gi, '/')
    .replace(/%3F/gi, '?')
    .replace(/%23/gi, '#')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
    .replace(/%40/gi, '@')
    .replace(/%21/gi, '!')
    .replace(/%24/gi, '$')
    .replace(/%26/gi, '&')
    .replace(/%27/gi, "'")
    .replace(/%28/gi, '(')
    .replace(/%29/gi, ')')
    .replace(/%2A/gi, '*')
    .replace(/%2B/gi, '+')
    .replace(/%2C/gi, ',')
    .replace(/%3B/gi, ';')
    .replace(/%3D/gi, '=');
}
function buildRequestHeaders(
  headers: Record<string, HeaderParameterSpec | undefined>,
  cookies: Record<string, HeaderParameterSpec | undefined> = {},
): Record<string, string> | undefined {
  const requestHeaders: Record<string, string> = {};

  for (const [name, parameter] of Object.entries(headers)) {
    const serialized = serializeParameterValue(parameter);
    if (serialized !== undefined) {
      requestHeaders[name] = serialized;
    }
  }

  const cookieHeader = buildCookieHeader(cookies);
  if (cookieHeader) {
    requestHeaders.Cookie = requestHeaders.Cookie
      ? `${requestHeaders.Cookie}; ${cookieHeader}`
      : cookieHeader;
  }

  return Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined;
}

interface HeaderParameterSpec {
  value: unknown;
  style: string;
  explode: boolean;
  contentType?: string;
}

function buildCookieHeader(cookies: Record<string, HeaderParameterSpec | undefined>): string | undefined {
  const pairs: string[] = [];
  for (const [name, parameter] of Object.entries(cookies)) {
    const serialized = serializeParameterValue(parameter);
    if (serialized !== undefined) {
      pairs.push(`${encodeURIComponent(name)}=${encodeURIComponent(serialized)}`);
    }
  }
  return pairs.length > 0 ? pairs.join('; ') : undefined;
}

function serializeParameterValue(parameter: HeaderParameterSpec | undefined): string | undefined {
  const value = parameter?.value;
  if (value === undefined || value === null) {
    return undefined;
  }
  if (parameter?.contentType) {
    return JSON.stringify(value);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map((item) => serializeHeaderPrimitive(item)).join(',');
  }
  if (typeof value === 'object' && value !== null) {
    return serializeHeaderObject(value as Record<string, unknown>, parameter?.explode === true);
  }
  return serializeHeaderPrimitive(value);
}

function serializeHeaderObject(value: Record<string, unknown>, explode: boolean): string {
  const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== null);
  if (explode) {
    return entries.map(([key, entryValue]) => `${key}=${serializeHeaderPrimitive(entryValue)}`).join(',');
  }
  return entries.flatMap(([key, entryValue]) => [key, serializeHeaderPrimitive(entryValue)]).join(',');
}

function serializeHeaderPrimitive(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value);
}
