import type { BadgeId, TopicId } from '../models';
import type { CoreKey } from './translate';

/** Typed builders for composed core keys. */
export const topicName = (id: TopicId): CoreKey => `topic.${id}` as CoreKey;
export const badgeName = (id: BadgeId): CoreKey => `badge.${id}.name` as CoreKey;
export const badgeDescription = (id: BadgeId): CoreKey => `badge.${id}.desc` as CoreKey;
