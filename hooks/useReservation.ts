export type ReservationDateOption = {
  id: string;
  label: string;
  dateLabel: string;
};

export type ReservationTimeOption = {
  id: string;
  label: string;
};

export const RESERVATION_TIMES: readonly ReservationTimeOption[] = [
  { id: '12:00', label: '12:00' },
  { id: '14:00', label: '14:00' },
  { id: '18:00', label: '18:00' },
  { id: '19:30', label: '19:30' },
  { id: '21:00', label: '21:00' },
];

/** デート向けのため、空席確認の人数は2名で固定する。 */
export const DATE_PARTY_SIZE = 2;

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });
}

export function getReservationDateOptions(now: Date = new Date()): ReservationDateOption[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const later = new Date(today);
  later.setDate(today.getDate() + 3);

  return [
    {
      id: 'today',
      label: '今日',
      dateLabel: formatDateLabel(today),
    },
    {
      id: 'tomorrow',
      label: '明日',
      dateLabel: formatDateLabel(tomorrow),
    },
    {
      id: 'later',
      label: '日付指定',
      dateLabel: formatDateLabel(later),
    },
  ];
}

export function checkDummyAvailability(
  spotId: string,
  dateId: string,
  timeId: string,
  partySize: number,
): { available: boolean; seats: number; message: string } {
  const seed = `${spotId}-${dateId}-${timeId}-${partySize}`;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash + seed.charCodeAt(index) * (index + 1)) % 11;
  }

  const seats = Math.max(0, 6 - (hash % 7));
  const available = seats >= partySize;

  return {
    available,
    seats,
    message: available
      ? `${partySize}名で空席があります（残り${seats}席の想定）。`
      : 'この時間帯は満席の見込みです。別の時間を試してください。',
  };
}
