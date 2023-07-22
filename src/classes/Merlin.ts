import Role from "./Role";
import { Role as RoleType, team } from "../types";

export default class Merlin extends Role {
  name = "멀린" as RoleType;
  description = "모드레드를 제외한 모든 악의 하수인을 알고 있습니다.";
  visibleRoles = ["악의 하수인", "모르가나", "오베론", "암살자"] as RoleType[];
  team = "RED" as team;
}
