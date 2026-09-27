export const getReminderDelay = (startDate: Date): number => {
  return Math.max(0, new Date(startDate).getTime() - Date.now())
}

export const getReminderJobId = (eventId: string): string => {
  return `reminder-${eventId}`
}
