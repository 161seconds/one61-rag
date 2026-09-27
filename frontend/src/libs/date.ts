import dayjs from "dayjs"
import isoWeek from "dayjs/plugin/isoWeek"

dayjs.extend(isoWeek)

export type { Dayjs } from "dayjs"
export { dayjs }
export default dayjs
