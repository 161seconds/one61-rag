import { Injectable } from "@nestjs/common"
import ms from "ms"

@Injectable()
export class MsService {
  fromString(msString: ms.StringValue) {
    return ms(msString)
  }
}
