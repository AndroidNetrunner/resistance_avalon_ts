import Role from "./Role";
import { Role as RoleType, team } from "../types";

export default class Mordred extends Role {
  name = "모드레드" as RoleType;
  description = "멀린에게 정체가 노출되지 않습니다.";
  visibleRoles = ["모르가나", "악의 하수인", "암살자"] as RoleType[];
  team = "RED" as team;
}
