import { Platform, Share } from 'react-native';
import type { Plan, Spot } from '../../types/database';

export const SHARE_WEB_ORIGIN = 'https://datespot.app';
export const SHARE_DEEP_LINK_SCHEME = 'datespot';

export type SharePayload = {
  title: string;
  message: string;
  url: string;
};

export type ShareResult = {
  ok: boolean;
  message: string;
};

export function buildSpotShareLinks(spotId: string): {
  webUrl: string;
  deepLink: string;
} {
  return {
    webUrl: `${SHARE_WEB_ORIGIN}/spots/${spotId}`,
    deepLink: `${SHARE_DEEP_LINK_SCHEME}://spot/${spotId}`,
  };
}

export function buildPlanShareLinks(planId: string): {
  webUrl: string;
  deepLink: string;
} {
  return {
    webUrl: `${SHARE_WEB_ORIGIN}/plans/${planId}`,
    deepLink: `${SHARE_DEEP_LINK_SCHEME}://plan/${planId}`,
  };
}

export async function shareContent(
  payload: SharePayload,
): Promise<ShareResult> {
  const body = `${payload.message}\n${payload.url}`;

  try {
    const result = await Share.share(
      Platform.OS === 'ios'
        ? {
            title: payload.title,
            message: payload.message,
            url: payload.url,
          }
        : {
            title: payload.title,
            message: body,
          },
    );

    if (result.action === Share.dismissedAction) {
      return { ok: true, message: '共有をキャンセルしました。' };
    }

    return { ok: true, message: '共有しました。' };
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : '共有に失敗しました。';
    return { ok: false, message: detail };
  }
}

export async function shareSpot(spot: Spot): Promise<ShareResult> {
  const { webUrl, deepLink } = buildSpotShareLinks(spot.id);
  const description =
    spot.description ?? 'DateSpotで見つけたデートスポットです。';

  return shareContent({
    title: `${spot.name} | DateSpot`,
    message: `${spot.name}\n${description}\n${deepLink}`,
    url: webUrl,
  });
}

export async function sharePlan(plan: Plan): Promise<ShareResult> {
  const { webUrl, deepLink } = buildPlanShareLinks(plan.id);
  const spotNames = plan.plan_spots
    .map((item) => item.spot?.name)
    .filter((name): name is string => name !== undefined);
  const course =
    spotNames.length > 0
      ? `コース: ${spotNames.join(' → ')}`
      : `${plan.plan_spots.length}スポットのデートコース`;
  const description = plan.description ?? 'DateSpotで作ったデートプランです。';

  return shareContent({
    title: `${plan.title} | DateSpot`,
    message: `${plan.title}\n${description}\n${course}\n${deepLink}`,
    url: webUrl,
  });
}
