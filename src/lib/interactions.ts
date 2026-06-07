// Utility functions for tracking user interactions

export interface InteractionData {
  type: string;
  entityId?: string;
  entityType?: string;
  action?: string;
  metadata?: Record<string, any>;
}

/**
 * Track a user interaction
 * This sends the interaction to the API and handles errors silently
 */
export async function trackInteraction(data: InteractionData): Promise<void> {
  try {
    await fetch('/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error) {
    // Silently fail - interactions are not critical
    console.debug('Failed to track interaction:', error);
  }
}

/**
 * Track page view
 */
export async function trackPageView(pageName: string): Promise<void> {
  await trackInteraction({
    type: 'PAGE_VIEW',
    entityId: pageName,
    entityType: 'PAGE',
  });
}

/**
 * Track activity registration
 */
export async function trackActivityRegistration(activityId: string, activityTitle?: string): Promise<void> {
  await trackInteraction({
    type: 'ACTIVITY_REGISTER',
    entityId: activityId,
    entityType: 'ACTIVITY',
    metadata: { activityTitle },
  });
}

/**
 * Track activity unregistration
 */
export async function trackActivityUnregistration(activityId: string): Promise<void> {
  await trackInteraction({
    type: 'ACTIVITY_UNREGISTER',
    entityId: activityId,
    entityType: 'ACTIVITY',
  });
}

/**
 * Track vote
 */
export async function trackVote(projectId: string, score: number): Promise<void> {
  await trackInteraction({
    type: 'VOTE',
    entityId: projectId,
    entityType: 'PROJECT',
    metadata: { score },
  });
}

/**
 * Track evaluation submission
 */
export async function trackEvaluationSubmit(projectId: string, totalScore: number): Promise<void> {
  await trackInteraction({
    type: 'EVALUATION_SUBMIT',
    entityId: projectId,
    entityType: 'PROJECT',
    metadata: { totalScore },
  });
}

/**
 * Track QR scan
 */
export async function trackQRScan(qrType: string, entityId: string): Promise<void> {
  await trackInteraction({
    type: 'QR_SCAN',
    entityId,
    entityType: qrType,
  });
}

/**
 * Track project view
 */
export async function trackProjectView(projectId: string): Promise<void> {
  await trackInteraction({
    type: 'PROJECT_VIEW',
    entityId: projectId,
    entityType: 'PROJECT',
  });
}

/**
 * Track share action
 */
export async function trackShare(entityType: string, entityId: string, platform?: string): Promise<void> {
  await trackInteraction({
    type: 'SHARE',
    entityId,
    entityType,
    metadata: { platform },
  });
}

/**
 * Track profile update
 */
export async function trackProfileUpdate(): Promise<void> {
  await trackInteraction({
    type: 'PROFILE_UPDATE',
    entityType: 'USER',
  });
}
