/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StartupSuggestion {
  name: string;
  slogan: string;
  rationale: string;
  domainIdea: string;
  category: string;
}

export interface GenerationRequest {
  industry: string;
  keywords?: string;
  nameStyle?: string;
}

export interface GenerationResponse {
  suggestions: StartupSuggestion[];
}
