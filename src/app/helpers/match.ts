export function getMinute(event: { minute: number; part: string }) {
  if (event.part === 'SECOND_HALF') return event.minute * 2;
  if (event.part === 'EXTRA_TIME_FIRST_HALF') return `${event.minute} ET`;
  if (event.part === 'EXTRA_TIME_SECOND_HALF') return `${event.minute * 2} ET`;
  return event.minute;
}
